const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;
const globalShortcut = electron.globalShortcut;
const dialog = electron.dialog;

const DEVELOPMENT = true;

var fs = require('fs-extra');
var mkdirp = require('mkdirp');
var rmdir = require('rmdir');

var upath = require('upath');

var builderGulp = require('./utils/builder.js');

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

  var userDataPath = app.getPath('userData');
  console.log(userDataPath);
  if (typeof global.localStorage === "undefined" || global.localStorage === null) {
    var LocalStorage = require('node-localstorage').LocalStorage;
    global.localStorage = new LocalStorage(userDataPath + '/prefs');
  }

  //launcher
  launcherWindow = new BrowserWindow({
    icon: __dirname + '/res/icon.png',
    title: 'Amble Engine Launcher',
    width: 640,
    height: 480,
    resizable: false
  });

  launcherWindow.loadURL('file://' + __dirname + '/launcher/index.html');
  currentState = 'launcher';

  launcherWindow.setMenu(null);
  if(DEVELOPMENT) launcherWindow.toggleDevTools();
  // launcherWindow.center();

  launcherWindow.on('closed', function() {
    launcherWindow = null;
  });

});

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  globalShortcut.unregisterAll();
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform != 'darwin') {
    app.quit();
  }
});

app.on('browser-window-blur', function(event, bWindow){

  if(currentState == 'editor' && editorWindow) {
    editorWindow.webContents.send('editor-pause');
  }

  globalShortcut.unregisterAll();
});

app.on('will-quit', function(event, bWindow){
  globalShortcut.unregisterAll();

  editorWindow = null;
  launcherWindow = null;
  builderWindow = null;
  gamePreviewWindow = null;
});

//launcher
ipcMain.on('launcher-projects-request', function(event, data) {

  var projects = JSON.parse(localStorage.getItem('projects'));
  if(!projects) projects = [];

  console.log(projects)

  projects.sort((a, b) => b.time - a.time);

  launcherWindow.webContents.send('launcher-projects-respond', projects);

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
        if(p) {
          path = upath.toUnix(path)
          var _path = path.substring(0, path.lastIndexOf("/"))
          console.log("131", _path, p.dir)

          if(_path != p.dir) {
            p.dir = _path;
            fs.writeFileSync(path, JSON.stringify(p), 'utf-8')
          }

          var data = { name: p.name, dir: p.dir};
        }

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

      var projects = JSON.parse(localStorage.getItem('projects'));
      if(projects === null) projects = [];

      if(!projects.find( c => c.name == name && c.dir == folder)) {

        projects.push({
          time: Date.now(),
          name: name,
          dir: folder
        });

        localStorage.setItem('projects', JSON.stringify(projects));

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

  fs.access(currentDir + '/' + currentName + '.aproject', fs.F_OK, function(err) {
    if (err) {

      //update project js
      var projects = JSON.parse(localStorage.getItem('projects'));

      if(projects) {

        var p = projects.find(pr => pr.name == currentName && pr.dir == currentDir)

        if(p) {
          var index = projects.indexOf(p);
          projects.splice(index, 1);
        }

        localStorage.setItem('projects', JSON.stringify(projects));
        launcherWindow.webContents.send('launcher-projects-respond', projects);
      }


      var error = { type: 'error', message: err};
      launcherWindow.webContents.send('launcher-error', error);

    } else {

      var projects = JSON.parse(localStorage.getItem('projects'));
      if(!projects) {
        var projects = [];
        projects.push({
          time: Date.now(),
          name: currentName,
          dir: currentDir
        });
      } else {
        var p = projects.find(pr => pr.name == currentName && pr.dir == currentDir)
        if(p) p.time = Date.now();
        else {
          projects.push({
            time: Date.now(),
            name: currentName,
            dir: currentDir
          });
        }
      }

      localStorage.setItem('projects', JSON.stringify(projects));

      //load launcher loader page
      launcherWindow.loadURL('file://' + __dirname + '/launcher/loader.html')
      launcherWindow.setMenu(null);
      launcherWindow.focus();

      //editor
      editorWindow = new BrowserWindow({
        icon: __dirname + '/res/icon.png',
        width: 1280,
        height: 720,
        minWidth: 960,
        minHeight: 540,
        show: false
      });

      editorWindow.loadURL('file://' + __dirname + '/editor/index.html');

      if(DEVELOPMENT) editorWindow.toggleDevTools();

      editorWindow.center();

      editorWindow.on('closed', function() {
        editorWindow = null;
        if(launcherWindow) launcherWindow.close();
        if(gamePreviewWindow) gamePreviewWindow.close();
        if(builderWindow) builderWindow.close();
      });

      currentState = 'editor';
    }
  });
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
    icon: __dirname + '/res/icon.png',
    title: currentName + ' | ' + currentDir + ' | Amble Builder',
    width: 640,
    height: 640,
    show: false,
    resizable: true
  });

  builderWindow.setMenu(null);
  builderWindow.loadURL('file://' + __dirname + '/builder/index.html');

  // if(DEVELOPMENT) builderWindow.toggleDevTools();

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
      icon: __dirname + '/res/icon.png',
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
ipcMain.on('builder-loaded', function(event, data) {


  builderWindow.show();
  builderWindow.focus();

  var project = JSON.parse(fs.readFileSync(currentDir + '/' + currentName + '.aproject', 'utf8'));
  builderWindow.webContents.send('builder-loaded-respond', project.buildData);

});

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

  var project = JSON.parse(fs.readFileSync(currentDir + '/' + currentName + '.aproject', 'utf8'));
  project.buildData = data;
  fs.writeFileSync(currentDir + '/' + currentName + '.aproject', JSON.stringify(project), 'utf8')

  //process build
  var sceneFile = projectBuildData.sceneFile;
  var imagesList = [];
  var audioList = [];
  var scriptsList = [];
  var targetDir = buildDir + '/' + data.name;
  var gameTitle = data.name;

  builderGulp.projectDirectory = currentDir + '/' + currentName;
  builderGulp.outputDir = targetDir;

  builderGulp.projectName = gameTitle;
  builderGulp.projectID = data.gameID;

  var p = upath.toUnix(__dirname)
  var f = p.split('/');
  var extension = f[f.length - 1];

  if(data.targetPlatform == 'android') {
    var respond = {};
    respond.type = 'error';
    respond.message = 'Android build is currently experimental and not available';
    builderWindow.send('builder-build-respond', respond);
    return;
  }

  if(extension == 'app') {
    builderGulp.srcFolder = p;
  } else {


    builderGulp.srcFolder = p.substring(0, p.lastIndexOf("/"));
  }

  builderGulp.projectVersion = data.version;

  builderGulp.projectDescription = data.description;
  builderGulp.projectAuthor = data.author;

  for(var i = 0; i < projectBuildData.assets.length; i++) {
    var meta = projectBuildData.assets[i];
    if(meta.type == 'sprite') {
      builderGulp.imagesList.push(meta.path);
      meta.path = '/assets/img/' + meta.name + '.' + meta.extension;
      delete meta.parentFolder;
      imagesList.push(meta)
      // console.log(meta.path);
    } else if(meta.type == 'script') {
      scriptsList.push(meta);
      builderGulp.scriptsList.push(meta.path);
    } else if(meta.type == 'audio') {
      builderGulp.audioList.push(meta.path);
      meta.path = '/assets/audio/' + meta.name + '.' + meta.extension;
      delete meta.parentFolder;
      audioList.push(meta)
    }
  }

  console.log(builderGulp.imagesList);
  console.log(builderGulp.scriptsList)

  if(buildDir == 'null' || buildDir == null || buildDir == 'undefined' || buildDir == undefined) {
    response.type = 'error';
    response.message = 'Game build failed - wrong directory';
    builderWindow.send('builder-build-respond', response);
  }
  //
  // console.log(JSON.stringify(imagesList));

  console.log(data.targetPlatform);

  builderGulp.start('build-move-' + data.targetPlatform, function() {

    if(data.targetPlatform == 'android') {
      fs.writeFileSync(targetDir + '/_temp/assets/json/scene.json', JSON.stringify(sceneFile), 'utf8');
      fs.writeFileSync(targetDir + '/_temp/assets/js/assets-list.js', "var gameTitle = "+ JSON.stringify(gameTitle) +"; var imagesList = "+ JSON.stringify(imagesList)+"; var audioList = "+ JSON.stringify(audioList), 'utf8');
    } else {
      fs.writeFileSync(targetDir + '/assets/json/scene.json', JSON.stringify(sceneFile), 'utf8');
      fs.writeFileSync(targetDir + '/assets/js/assets-list.js', "var gameTitle = "+ JSON.stringify(gameTitle) +"; var imagesList = "+ JSON.stringify(imagesList)+"; var audioList = "+ JSON.stringify(audioList), 'utf8');
    }

    builderGulp.start('build-game-' + data.targetPlatform, function(err) {
      rmdir(__dirname + '/.cordova', function() {});
      var respond = {};
      if(err) {
        console.log(err)
        respond.type = 'error';
        respond.message = 'Build failed: ' + err;
        builderWindow.send('builder-build-respond', respond);
        throw err;
      }

      console.log('build-game callback')

      respond.type = 'success';
      respond.message = 'Game build successful - game build to: ' + upath.toUnix(targetDir);

      builderWindow.send('builder-build-respond', respond)

    });
  });
});

app.on('browser-window-focus', function(event, bWindow) {

  switch(currentState) {
    case 'editor':

    editorWindow.webContents.send('editor-unpause');

    //save
    shortcuts.open = globalShortcut.register('ctrl+s', menuFunctions.save);

    //build
    shortcuts.open = globalShortcut.register('ctrl+b', menuFunctions.build);

    //start game preview
    shortcuts.open = globalShortcut.register('ctrl+p', menuFunctions.startPreview);

    //stop game preview
    shortcuts.open = globalShortcut.register('shift+ctrl+p', menuFunctions.stopPreview);

    //undo
    shortcuts.open = globalShortcut.register('ctrl+z', menuFunctions.undo);

    //redo
    shortcuts.open = globalShortcut.register('shift+ctrl+z', menuFunctions.redo);

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

  startPreview: function() {
    editorWindow.webContents.send('editor-game-preview-request');
  },

  stopPreview: function() {
    if(gamePreviewWindow) {
      //close preview
      gamePreviewWindow.close();
      //send unpause
      editorWindow.webContents.send('editor-unpause');
    }
  },

  undo: function() {
    editorWindow.webContents.send('editor-undo-request');
  },

  redo: function() {
    editorWindow.webContents.send('editor-redo-request');
  }

}
