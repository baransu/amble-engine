const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;
const globalShortcut = electron.globalShortcut;
const dialog = electron.dialog;

var fs = require('fs');
var mkdirp = require('mkdirp');
var gulp = require('./gulp.js');

var shortcuts = {};
var mainWindow = null;

var projectDirectory = null;
var projectFile = null;
var buildDir = null;

app.on('ready', function(){
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        'min-width': 800,
        'min-height': 600
    });
    mainWindow.loadURL('file://' + __dirname + '/index.html');
    mainWindow.toggleDevTools();

    mainWindow.on('closed', function() {
        mainWindow = null;
    });
});

var menuFunctions = {

    new: function() {
        dialog.showSaveDialog(
            mainWindow,
            {
                title: 'Select new project directory',
                properties: ['openDirectory', 'createDirectory'],
                filters: [
                    { name: 'Amble Project', extensions: ['aproject'] }
                ]
            },
            function(path) {
                if(!path) return;
                //check if aproject
                var a = path.split('.');
                if(a[a.length - 1] != 'aproject') {
                    path += '.aproject';
                }

                projectFile = path;
                fs.writeFileSync(projectFile, JSON.stringify({}), 'utf8');

                if (path.indexOf("/") == -1) { // windows
                    projectDirectory = path.substring(0, path.lastIndexOf('\\'));
                }
                else { // unix
                    projectDirectory = path.substring(0, path.lastIndexOf('/'));
                }

                mainWindow.setTitle(projectDirectory);

                var data = {
                    path: projectDirectory,
                    project: {
                        actors: [],
                        camera: {
                            x: 0,
                            y: 0
                        }
                    },
                };

                mkdirp(projectDirectory + '/assets', function(err) {

                    if(err) throw err;
                    mainWindow.webContents.send('open-request-renderer', data);

                });

        });

    },

    open: function() {
        dialog.showOpenDialog(
            mainWindow,
            {
                title: 'Select new project directory',
                properties: ['openFile'],
                filters: [
                    { name: 'Amble Project', extensions: ['aproject'] }
                ]
            },
            function(path) {
                if(!path) return;

                projectFile = path[0];

                var d = JSON.parse(fs.readFileSync(projectFile, 'utf8'));

                // console.log(d.scene);

                if (projectFile.indexOf("/") == -1) { // windows
                    projectDirectory  = projectFile.substring(0, projectFile.lastIndexOf('\\'));
                }
                else { // unix
                    projectDirectory = projectFile.substring(0, projectFile.lastIndexOf('/'));
                }

                mainWindow.setTitle(projectDirectory);

                //load
                var data = {
                    path: projectDirectory,
                    project: {
                        actors: d.scene,
                        camera: d.camera
                    },
                };

                mainWindow.webContents.send('open-request-renderer', data);

        });
    },

    save: function() {

        if(!projectFile) {

            dialog.showSaveDialog(
                mainWindow,
                {
                    title: 'Select new project directory',
                    properties: ['openDirectory', 'createDirectory'],
                    filters: [
                        { name: 'Amble Project', extensions: ['aproject'] }
                    ]
                },
                function(path) {
                    if(!path) return;
                    //check if aproject
                    var a = path.split('.');
                    if(a[a.length - 1] != 'aproject') {
                        path += '.aproject';
                    }

                    projectFile = path;

                    fs.writeFileSync(projectFile, JSON.stringify({}), 'utf8');

                    if (projectFile.indexOf("/") == -1) { // windows
                        projectDirectory = projectFile.substring(0, projectFile.lastIndexOf('\\'));
                    }
                    else { // unix
                        projectDirectory = projectFile.substring(0, projectFile.lastIndexOf('/'));
                    }

                    mainWindow.setTitle(projectDirectory);

                    var data = {
                        path: projectDirectory,
                        project: {
                            actors: [],
                            camera: {
                                x: 0,
                                y: 0
                            }
                        },
                    };

                    mkdirp(projectDirectory + '/assets', function(err) {

                        if(err) throw err;
                        mainWindow.webContents.send('save-request');

                    });

            });

        } else {
            mainWindow.webContents.send('save-request');
        }

    },

    build: function() {

        mainWindow.webContents.send('build-request');

    }

}

ipcMain.on('new-request', function(event, data) {

    menuFunctions.new();

});

ipcMain.on('open-request', function(event, data) {

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

app.on('browser-window-focus', function() {

    //new project
    shortcuts.open = globalShortcut.register('ctrl+n', menuFunctions.new);

    //open
    shortcuts.open = globalShortcut.register('ctrl+o', menuFunctions.open);

    //save
    shortcuts.open = globalShortcut.register('ctrl+s', menuFunctions.save);

    // //save as
    // shortcuts.open = globalShortcut.register('shift+ctrl+s', menuFunctions.saveAs);

    //build
    shortcuts.open = globalShortcut.register('ctrl+b', menuFunctions.build);
});

app.on('browser-window-blur', function(){
    globalShortcut.unregisterAll();
});

app.on('will-quit', function(){
    globalShortcut.unregisterAll();
});
