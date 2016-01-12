const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;
const globalShortcut = electron.globalShortcut;
const dialog = electron.dialog;

var fs = require('fs');
var mkdirp = require('mkdirp');

var builderGulp = require('./builder/js/builder-gulp.js');

var launcherWindow = null;
var editorWindow = null;
var builderWindow = null;
var gamePreviewWindow = null;

var currentState = null; // ['launcher', 'editor']

var currentDir = null;
var currentName = null;
var buildDir = null;

var projectBuildData = null;

var shortcuts = {};

app.on('ready', function() {
    //launcher
    launcherWindow = new BrowserWindow({
        // width: 640,
        // height: 360,
        width: 854,
        height: 480,
        resizable: false
    });

    launcherWindow.loadURL('file://' + __dirname + '/launcher/index.html');
    currentState = 'launcher';

    launcherWindow.setMenu(null);
    // launcherWindow.toggleDevTools();
    launcherWindow.center();

    launcherWindow.on('closed', function() {
        launcherWindow = null;
    });

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

        projects.sort((a, b) => b.time - a.time);

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

ipcMain.on('launcher-other-request', function(event, data) {
    dialog.showOpenDialog(
        launcherWindow,
        {
            title: 'Select project directory',
            properties: ['openFile'],
            filters: [
                { name: 'Amble Project', extensions: ['aproject'] }
            ]
        },
        function(path) {

            if(path != undefined) {
                path = path[0];
                console.log(path);
                var p = JSON.parse(fs.readFileSync(path, 'utf-8'));
                if(p) var data = { name: p.name, dir: p.dir};
            } else {
                var data = 'undefined'
            }

            launcherWindow.webContents.send('launcher-other-respond', data);
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
        fs.writeFileSync(folder + '/' + name + '.aproject', JSON.stringify({name: currentName, dir: currentDir}), 'utf8');

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
                    time: Date.now(),
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

    var f = JSON.parse(fs.readFileSync(app.getPath('userData') + '/projectsData.json', 'utf-8'));
    if(f && f.projects) {
        var p = f.projects.find(pr => pr.name == currentName && pr.dir == currentDir)
        if(p) p.time = Date.now();
        else {
            f.projects.push({
                time: Date.now(),
                name: currentName,
                dir: currentDir
            });
        }
    }

    fs.writeFileSync(app.getPath('userData') + '/projectsData.json', JSON.stringify(f), 'utf-8')

    //load launcher loader page
    launcherWindow.loadURL('file://' + __dirname + '/launcher/loader.html')
    launcherWindow.setMenu(null);
    launcherWindow.focus();
    launcherWindow.setAlwaysOnTop(true);

    //editor
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
        if(launcherWindow) launcherWindow.close();
        if(gamePreviewWindow) gamePreviewWindow.close();
        if(builderWindow) builderWindow.close();
    });

    currentState = 'editor';

});

//editor
ipcMain.on('editor-app-loaded', function(event, data) {
    var d = JSON.parse(fs.readFileSync(currentDir + '/' + currentName + '.aproject', 'utf8'));
    var data = {
        path: currentDir,
        project: {
            actors: d.scene,
            camera: d.camera
        },
    };

    editorWindow.webContents.send('editor-load-respond', data);
    editorWindow.setTitle(currentName + ' - ' + currentDir + ' - Amble Editor')

});

ipcMain.on('editor-project-loaded', function(event, data) {
    if(launcherWindow) launcherWindow.close();
    editorWindow.show();
});

ipcMain.on('editor-save-respond', function(event, data) {

    console.log(data);
    var d = JSON.parse(data);
    d.name = currentName;
    d.dir = currentDir;
    fs.writeFileSync(currentDir + '/' + currentName + '.aproject', JSON.stringify(d), 'utf8');

});

ipcMain.on('editor-build-respond', function(event, data) {

    projectBuildData = data;

    //builder
    builderWindow = new BrowserWindow({
        width: 854,
        height: 480
    });

    builderWindow.loadURL('file://' + __dirname + '/builder/index.html');

    builderWindow.setTitle(currentName + ' | ' + currentDir + ' | Amble Builder');
    builderWindow.toggleDevTools();
    builderWindow.center();
    builderWindow.on('closed', function() {
        builderWindow = null;
    });

    console.log(data);

});

var gamePreviewData = null;
ipcMain.on('editor-game-preview-respond', function(event, data) {

    gamePreviewData = data;

    if(!gamePreviewWindow) {
        gamePreviewWindow = new BrowserWindow({
            width: 1280,
            height: 720,
            show: false
        });

        gamePreviewWindow.loadURL('file://' + __dirname + '/game-preview/index.html');

        gamePreviewWindow.setMenu(null);
        gamePreviewWindow.center();
        gamePreviewWindow.openDevTools()

        gamePreviewWindow.on('closed', function() {
            if(editorWindow) editorWindow.webContents.send('editor-unpause');
            gamePreviewWindow = null;
        });
    } else {

    }
});

//game preview
ipcMain.on('game-preview-loaded', function(event, data) {
    //show window

    gamePreviewWindow.show();
    gamePreviewWindow.focus();

    gamePreviewWindow.webContents.send('game-preview-start', gamePreviewData);
});

ipcMain.on('game-preview-error-request', function(event, data) {
    editorWindow.webContents.send('game-preview-error', data);
})

ipcMain.on('game-preview-log-request', function(event, data) {
    editorWindow.webContents.send('game-preview-log', data);
})

ipcMain.on('editor-game-preview-stop-request', function(event, data) {
    console.log('stop preview')
    menuFunctions.stopPreview();
});

//builder
ipcMain.on('builder-dir-request', function(event, data) {
    dialog.showOpenDialog(
        builderWindow,
        {
            title: 'Select build destination',
            properties: ['openDirectory', 'createDirectory'],
        },
        function(path) {

            if(path != undefined) path = path[0];
            else path = 'undefined';

            buildDir = path;

            builderWindow.webContents.send('builder-dir-respond', path);
    });
});

ipcMain.on('builder-build-request', function(event, data) {

    console.log(projectBuildData);

    //process build
    var sceneFile = projectBuildData.sceneFile;
    var imagesList = projectBuildData.imagesList;
    var scriptsList = projectBuildData.scriptsList;
    var targetDir = buildDir + '/' + data.name;
    var gameTitle = data.name;

    builderGulp.projectDirectory = currentDir + '/' + currentName;
    builderGulp.imagesList = [];
    builderGulp.scriptsList = [];
    builderGulp.outputDir = targetDir;

    console.log(targetDir);

    for(var i = 0; i < imagesList.length; i++) {
        builderGulp.imagesList.push(imagesList[i].path);
    }

    for(var i = 0; i < scriptsList.length; i++) {
        builderGulp.scriptsList.push(scriptsList[i].path);
    }

    console.log(builderGulp.scriptsList);

    builderGulp.start('prepare', function(err) {
        if(err) {
            builderWindow.send('builder-build-respond', 'Game build failed - preparation');
            throw err;
        }

        builderGulp.start('build-game', function(err) {
            if(err) {
                builderWindow.send('builder-build-respond', 'Game build failed - build');
                throw err;
            }

            fs.writeFileSync(targetDir + '/assets/json/scene.json', JSON.stringify(sceneFile), 'utf8');
            fs.writeFileSync(targetDir + '/assets/js/assets-list.js', "var gameTitle = "+ JSON.stringify(gameTitle) +"; var imagesList = "+ JSON.stringify(imagesList), 'utf8');

            console.log('build-game callback')

            var info = 'Game build succesful - game build to: ' + targetDir;
            //send respond with respond
            builderWindow.send('builder-build-respond', info)

        });
    });
});

app.on('browser-window-focus', function(event, bWindow) {

    switch(currentState) {
        case 'editor':
        //save
        shortcuts.open = globalShortcut.register('ctrl+s', menuFunctions.save);

        //build
        shortcuts.open = globalShortcut.register('ctrl+b', menuFunctions.build);

        //play
        shortcuts.open = globalShortcut.register('ctrl+p', menuFunctions.play);

        //stop
        shortcuts.open = globalShortcut.register('shift+ctrl+p', menuFunctions.stopPreview);
        break;
    }

});

var menuFunctions = {

    save: function() {
        editorWindow.webContents.send('editor-save-request');
    },

    build: function() {
        editorWindow.webContents.send('editor-build-request');
    },

    play: function() {
        editorWindow.webContents.send('editor-game-preview-request');
    },

    stopPreview: function() {
        //close preview
        gamePreviewWindow.close();
        //send unpause
        editorWindow.webContents.send('editor-unpause');
    }
}
