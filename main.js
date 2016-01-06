const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;
const globalShortcut = electron.globalShortcut;
const dialog = electron.dialog;

var fs = require('fs');
var mkdirp = require('mkdirp');

var mainWindow = null;
var currentState = '';



var shortcuts = {};
var projectDirectory = null;
var projectFile = null;
var buildDir = null;


app.on('ready', function() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        'min-width': 854,
        'min-height': 480
    });

    mainWindow.loadURL('file://' + __dirname + '/launcher/index.html');
    currentState = 'launcher';

    mainWindow.setMenu(null);
    mainWindow.toggleDevTools();
    mainWindow.center();

    mainWindow.on('closed', function() {
        mainWindow = null;
    });
});

//launcher
ipcMain.on('launcher-projects-request', function(event, data) {

    var projects = [];

    fs.access(app.getPath('userData') + '/projectsData.json', fs.F_OK, function(err) {
        if(err) {
            fs.writeFileSync(app.getPath('userData') + '/projectsData.json', JSON.stringify({ projects: [] }), 'utf-8');
        } else {
            var f = JSON.parse(fs.readFileSync(app.getPath('userData') + '/projectsData.json', 'utf-8'));
            if(Array.isArray(f)) {
                projects = f;
            } else {
                projects = f.projects
            }
        }

        console.log(projects);

        mainWindow.webContents.send('launcher-projects-respond', projects);

    });
});

ipcMain.on('launcher-dir-request', function(event, data) {
    dialog.showOpenDialog(
        mainWindow,
        {
            title: 'Select project directory',
            properties: ['openDirectory', 'createDirectory'],
        },
        function(path) {

            if(path != undefined) path = path[0];
            else path = 'undefined';

            mainWindow.webContents.send('launcher-dir-respond', path);
    });
});

ipcMain.on('launcher-create-request', function(event, data) {

    var dir = data.dir;
    var name = data.name;
    var folder = dir + '/' + name;

    //create name folder
    mkdirp(folder, function(err) {
        if(err) throw err;

        //create aproject file
        fs.writeFileSync(folder + '/' + name + '.aproject', JSON.stringify({}), 'utf8');

        //create assets file
        mkdirp(folder + '/assets', function(err) {
            if(err) throw err;

            var f = JSON.parse(fs.readFileSync(app.getPath('userData') + '/projectsData.json', 'utf-8'));
            if(Array.isArray(f)) {
                var projects = f;
            } else {
                var projects = f.projects
            }

            //check name and dir
            //if already exist prevent from creation

            projects.push({
                name: name,
                dir: dir
            });

            fs.writeFileSync(app.getPath('userData') + '/projectsData.json', JSON.stringify({ projects: projects }), 'utf-8');

            //send create respond
            mainWindow.webContents.send('launcher-create-respond');
        });
    });

});

ipcMain.on('launcher-open-request', function(event, data) {

    var name = data.name;
    var dir = data.dir;

    mainWindow.close();

    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        'min-width': 854,
        'min-height': 480
    });

    mainWindow.loadURL('file://' + __dirname + '/editor/index.html');
    currentState = 'editor';

    mainWindow.toggleDevTools();
    mainWindow.setTitle(name + '  -  Amble Editor');
    mainWindow.center()

    mainWindow.on('closed', function() {
        mainWindow = null;
    });

    mainWindow.on('ready', function() {
        var data = {
            path: projectDirectory,
            project: {
                actors: [],
                camera: {
                    x: 0,
                    y: 0
                }
            }
        }
        mainWindow.webContents.send('editor-load', data);
    })

});

//editor
ipcMain.on('new-request', function(event, data) {
    menuFunctions.new();
});

ipcMain.on('editor-open-request', function(event, data) {
    menuFunctions.open();
});

ipcMain.on('save-respond', function(event, data) {

    console.log(data);
    fs.writeFileSync(projectFile, data, 'utf8');

});

ipcMain.on('build-respond', function(event, data) {

    dialog.showOpenDialog(
        mainWindow,
        {
            title: 'Select build destination',
            properties: ['openDirectory', 'createDirectory'],
        },
        function(path) {

            if(!path) return;

            buildDir = path[0];

            var sceneFile = data.sceneFile;
            var imagesList = data.imagesList;

            gulp.projectDirectory = projectDirectory;
            gulp.imagesList = [];
            gulp.scriptsList = [];
            gulp.outputDir = buildDir;

            console.log(buildDir);

            for(var i in data.imagesList) {
                gulp.imagesList.push(data.imagesList[i].path);
            }

            for(var i in data.scriptsList) {
                gulp.scriptsList.push(data.scriptsList[i].path);
            }

            gulp.start('build-game', function(){
                fs.writeFileSync(buildDir + '/assets/json/scene.json', JSON.stringify(sceneFile), 'utf8');
                fs.writeFileSync(buildDir + '/assets/js/assets-list.js', "var imagesList = " + JSON.stringify(imagesList), 'utf8');
                console.log('build-game callback')
            });

    });

});

// app.on('browser-window-focus', function() {
//
//     //new project
//     shortcuts.open = globalShortcut.register('ctrl+n', menuFunctions.new);
//
//     //open
//     shortcuts.open = globalShortcut.register('ctrl+o', menuFunctions.open);
//
//     //save
//     shortcuts.open = globalShortcut.register('ctrl+s', menuFunctions.save);
//
//     // //save as
//     // shortcuts.open = globalShortcut.register('shift+ctrl+s', menuFunctions.saveAs);
//
//     //build
//     shortcuts.open = globalShortcut.register('ctrl+b', menuFunctions.build);
// });
//
// app.on('browser-window-blur', function(){
//     globalShortcut.unregisterAll();
// });
//
// app.on('will-quit', function(){
//     globalShortcut.unregisterAll();
// });
