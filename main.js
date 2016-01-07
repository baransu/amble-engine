const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;
const globalShortcut = electron.globalShortcut;
const dialog = electron.dialog;

var fs = require('fs');
var mkdirp = require('mkdirp');

var launcherWindow = null;
var editorWindow = null;

var currentState = null; // ['launcher', 'editor']

var currentDir = null;
var currentName = null;

var shortcuts = {};

app.on('ready', function() {
    launcherWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        'min-width': 854,
        'min-height': 480
    });

    launcherWindow.loadURL('file://' + __dirname + '/launcher/index.html');
    currentState = 'launcher';

    launcherWindow.setMenu(null);
    launcherWindow.toggleDevTools();
    launcherWindow.center();

    launcherWindow.on('closed', function() {
        launcherWindow = null;
    });

    editorWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        'min-width': 854,
        'min-height': 480,
        show: false
    });

    editorWindow.loadURL('file://' + __dirname + '/editor/index.html');

    editorWindow.toggleDevTools();
    editorWindow.center();
    editorWindow.on('closed', function() {
        editorWindow = null;
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

        launcherWindow.webContents.send('launcher-projects-respond', projects);

    });
});

ipcMain.on('launcher-dir-request', function(event, data) {
    dialog.showOpenDialog(
        launcherWindow,
        {
            title: 'Select project directory',
            properties: ['openDirectory', 'createDirectory'],
        },
        function(path) {

            if(path != undefined) path = path[0];
            else path = 'undefined';

            launcherWindow.webContents.send('launcher-dir-respond', path);
    });
});

ipcMain.on('launcher-create-request', function(event, data) {

    var dir = currentDir = data.dir;
    var name = currentName = data.name;
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
            if(!projects.find( c => c.name == name && c.dir == folder)) {

                projects.push({
                    name: name,
                    dir: folder
                });

                fs.writeFileSync(app.getPath('userData') + '/projectsData.json', JSON.stringify({ projects: projects }), 'utf-8');
                var feedback = 'created';
            } else {
                var feedback = 'already exist'
            }

            //send create respond
            launcherWindow.webContents.send('launcher-create-respond', feedback);
        });
    });

});

ipcMain.on('launcher-open-request', function(event, data) {

    currentName = data.name;
    currentDir = data.dir;

    launcherWindow.close();

    editorWindow.show();

    editorWindow.setTitle(currentName + ' | Amble Editor')

    currentState = 'editor';

    var d = JSON.parse(fs.readFileSync(currentDir + '/' + currentName + '.aproject', 'utf8'));
    var data = {
        path: currentDir,
        project: {
            actors: d.scene,
            camera: d.camera
        },
    };

    editorWindow.webContents.send('editor-load-respond', data);

});

//editor
ipcMain.on('editor-save-respond', function(event, data) {

    console.log(data);
    fs.writeFileSync(currentDir + '/' + currentName + '.aproject', data, 'utf8');

});

//builder

app.on('browser-window-focus', function(event, bWindow) {

    switch(currentState) {
        case 'editor':
        //save
        shortcuts.open = globalShortcut.register('ctrl+s', menuFunctions.save);

        // //build
        // shortcuts.open = globalShortcut.register('ctrl+b', menuFunctions.build);
        break;
    }

});

app.on('browser-window-blur', function(event, bWindow){
    globalShortcut.unregisterAll();
});

app.on('will-quit', function(event, bWindow){
    globalShortcut.unregisterAll();

    editorWindow = null;
    launcherWindow = null;
    builderWindow = null;

});

// ipcMain.on('build-respond', function(event, data) {
//
//     dialog.showOpenDialog(
//         mainWindow,
//         {
//             title: 'Select build destination',
//             properties: ['openDirectory', 'createDirectory'],
//         },
//         function(path) {
//
//             if(!path) return;
//
//             buildDir = path[0];
//
//             var sceneFile = data.sceneFile;
//             var imagesList = data.imagesList;
//
//             gulp.projectDirectory = projectDirectory;
//             gulp.imagesList = [];
//             gulp.scriptsList = [];
//             gulp.outputDir = buildDir;
//
//             console.log(buildDir);
//
//             for(var i in data.imagesList) {
//                 gulp.imagesList.push(data.imagesList[i].path);
//             }
//
//             for(var i in data.scriptsList) {
//                 gulp.scriptsList.push(data.scriptsList[i].path);
//             }
//
//             gulp.start('build-game', function(){
//                 fs.writeFileSync(buildDir + '/assets/json/scene.json', JSON.stringify(sceneFile), 'utf8');
//                 fs.writeFileSync(buildDir + '/assets/js/assets-list.js', "var imagesList = " + JSON.stringify(imagesList), 'utf8');
//                 console.log('build-game callback')
//             });
//
//     });
//
// });

var menuFunctions = {

    save: function() {
        editorWindow.webContents.send('editor-save-request');
    },

}

//
// var menuFunctions = {
//
//     new: function() {
//         dialog.showSaveDialog(
//             mainWindow,
//             {
//                 title: 'Select new project directory',
//                 properties: ['openDirectory', 'createDirectory'],
//                 filters: [
//                     { name: 'Amble Project', extensions: ['aproject'] }
//                 ]
//             },
//             function(path) {
//                 if(!path) return;
//                 //check if aproject
//                 var a = path.split('.');
//                 if(a[a.length - 1] != 'aproject') {
//                     path += '.aproject';
//                 }
//
//                 projectFile = path;
//                 fs.writeFileSync(projectFile, JSON.stringify({}), 'utf8');
//
//                 if (path.indexOf("/") == -1) { // windows
//                     projectDirectory = path.substring(0, path.lastIndexOf('\\'));
//                 }
//                 else { // unix
//                     projectDirectory = path.substring(0, path.lastIndexOf('/'));
//                 }
//
//                 mainWindow.setTitle(projectDirectory);
//
//                 var data = {
//                     path: projectDirectory,
//                     project: {
//                         actors: [],
//                         camera: {
//                             x: 0,
//                             y: 0
//                         }
//                     },
//                 };
//
//                 mkdirp(projectDirectory + '/assets', function(err) {
//
//                     if(err) throw err;
//                     mainWindow.webContents.send('open-request-renderer', data);
//
//                 });
//
//         });
//
//     },
//
//     open: function() {
//         dialog.showOpenDialog(
//             mainWindow,
//             {
//                 title: 'Select new project directory',
//                 properties: ['openFile'],
//                 filters: [
//                     { name: 'Amble Project', extensions: ['aproject'] }
//                 ]
//             },
//             function(path) {
//                 if(!path) return;
//
//                 projectFile = path[0];
//
//                 var d = JSON.parse(fs.readFileSync(projectFile, 'utf8'));
//
//                 // console.log(d.scene);
//
//                 if (projectFile.indexOf("/") == -1) { // windows
//                     projectDirectory  = projectFile.substring(0, projectFile.lastIndexOf('\\'));
//                 }
//                 else { // unix
//                     projectDirectory = projectFile.substring(0, projectFile.lastIndexOf('/'));
//                 }
//
//                 mainWindow.setTitle(projectDirectory);
//
//                 //load
//                 var data = {
//                     path: projectDirectory,
//                     project: {
//                         actors: d.scene,
//                         camera: d.camera
//                     },
//                 };
//
//                 mainWindow.webContents.send('open-request-renderer', data);
//
//         });
//     },
//

//
//     build: function() {
//
//         mainWindow.webContents.send('build-request');
//
//     }
//
// }
