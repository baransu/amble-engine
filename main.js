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

var builderGulp = require('./build/utils/builder.js');

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
    icon: __dirname + '/icon.png',
    title: 'Amble Engine Launcher',
    width: 640,
    height: 480,
    resizable: false
  });

  launcherWindow.loadURL('file://' + __dirname + '/build/launcher/index.html');
  currentState = 'launcher';

  launcherWindow.setMenu(null);
  if(DEVELOPMENT) launcherWindow.toggleDevTools();
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

  var projects = JSON.parse(localStorage.getItem('projects'));
  if(projects === null) projects = [];

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
          var _path = path.substring(0, path.lastIndexOf("/"))
          console.log(_path, p.dir)

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

      console.log(projects);

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

      var p = projects.find(pr => pr.name == currentName && pr.dir == currentDir)
      if(p) {
        p.time = Date.now();
      } else {
        projects.push({
          time: Date.now(),
          name: currentName,
          dir: currentDir
        });
      }

      localStorage.setItem('projects', JSON.stringify(projects));

      //load launcher loader page
      launcherWindow.loadURL('file://' + __dirname + '/build/launcher/loader.html')
      launcherWindow.setMenu(null);
      launcherWindow.focus();
      launcherWindow.setAlwaysOnTop(true);

      //editor
      editorWindow = new BrowserWindow({
        icon: __dirname + '/icon.png',
        width: 1280,
        height: 720,
        minWidth: 960,
        minHeight: 540,
        show: false
      });

      editorWindow.loadURL('file://' + __dirname + '/build/editor/index.html');

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
    icon: __dirname + '/icon.png',
    title: currentName + ' | ' + currentDir + ' | Amble Builder',
    width: 640,
    height: 480,
    show: false,
    resizable: false
  });

  builderWindow.loadURL('file://' + __dirname + '/build/builder/index.html');

  if(DEVELOPMENT) builderWindow.toggleDevTools();

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
      icon: __dirname + '/icon.png',
      width: 1280,
      height: 720,
      show: false
    });

    gamePreviewWindow.loadURL('file://' + __dirname + '/build/game-preview/index.html');

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

  console.log(projectBuildData);

  //process build
  var sceneFile = projectBuildData.sceneFile;
  var imagesList = [];
  var scriptsList = [];
  var targetDir = buildDir + '/' + data.name;
  var gameTitle = data.name;

  builderGulp.projectDirectory = currentDir + '/' + currentName;
  builderGulp.outputDir = targetDir;

  builderGulp.projectName = gameTitle;
  builderGulp.projectID = data.gameID;

  builderGulp.projectVersion = data.version;

  builderGulp.projectDescription = data.description;
  builderGulp.projectAuthor = data.author;

  for(var i = 0; i < projectBuildData.assets.length; i++) {
    var meta = projectBuildData.assets[i];
    if(meta.type == 'sprite') {
      builderGulp.imagesList.push(meta.path);
      meta.path = '/assets/img/' + meta.name + '.' + meta.extension;
      imagesList.push(meta)
      // console.log(meta.path);
    } else if(meta.type == 'script') {
      scriptsList.push(meta);
      builderGulp.scriptsList.push(meta.path);
    }
  }

  console.log(builderGulp.imagesList);
  console.log(builderGulp.scriptsList)

  if(buildDir == 'null' || buildDir == null || buildDir == 'undefined' || buildDir == undefined) {
    response.type = 'error';
    response.message = 'Game build failed - wrong directory';
    builderWindow.send('builder-build-respond', response);
  }

  console.log(JSON.stringify(imagesList));

  builderGulp.start('build-move-' + data.targetPlatform, function() {

    if(data.targetPlatform == 'android') {
      fs.writeFileSync(targetDir + '/_temp/assets/json/scene.json', JSON.stringify(sceneFile), 'utf8');
      fs.writeFileSync(targetDir + '/_temp/assets/js/assets-list.js', "var gameTitle = "+ JSON.stringify(gameTitle) +"; var imagesList = "+ JSON.stringify(imagesList), 'utf8');
    } else {
      fs.writeFileSync(targetDir + '/assets/json/scene.json', JSON.stringify(sceneFile), 'utf8');
      fs.writeFileSync(targetDir + '/assets/js/assets-list.js', "var gameTitle = "+ JSON.stringify(gameTitle) +"; var imagesList = "+ JSON.stringify(imagesList), 'utf8');
    }

    builderGulp.start('build-game-' + data.targetPlatform, function(err) {
      rmdir(__dirname + '/.cordova', function() {});
      var respond = {};
      if(err) {
        console.log(err)
        respond.type = 'error';
        respond.message = 'Game build failed - build';
        builderWindow.send('builder-build-respond', respond);
        throw err;
      }

      console.log('build-game callback')

      respond.type = 'success';
      respond.message = 'Game build succesful - game build to: ' + targetDir;

      builderWindow.send('builder-build-respond', respond)

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
    if(gamePreviewWindow) {
      //close preview
      gamePreviewWindow.close();
      //send unpause
      editorWindow.webContents.send('editor-unpause');
    }
  }
}

// Uncaught Exception:
// Error: Invalid glob argument: [object Object],/home/tomek/Documents/amble-test/New Name/assets/32px.png,[object Object],/home/tomek/Documents/amble-test/New Name/assets/ammo_1.png,[object Object],/home/tomek/Documents/amble-test/New Name/assets/ammo_2.png,[object Object],/home/tomek/Documents/amble-test/New Name/assets/ammo_3.png,[object Object],/home/tomek/Documents/amble-test/New Name/assets/bg1_1.png,[object Object],/home/tomek/Documents/amble-test/New Name/assets/bg1_2.png,[object Object],/home/tomek/Documents/amble-test/New Name/assets/bg1_3.png,[object Object],/home/tomek/Documents/amble-test/New Name/assets/boss_idle.png,[object Object],/home/tomek/Documents/amble-test/New Name/assets/boss_info.png,[object Object],/home/tomek/Documents/amble-test/New Name/assets/boss_walk.png,[object Object],/home/tomek/Documents/amble-test/New Name/assets/combat_background.png,[object Object],/home/tomek/Documents/amble-test/New Name/assets/comics_end.png,[object Object],/home/tomek/Documents/amble-test/New Name/assets/comics_over_boss.png,[object Object],/home/tomek/Documents/amble-test/New Name/assets/comics_over_enemies.png,[object Object],/home/tomek/Documents/amble-test/New Name/assets/comics_start.png,[object Object],/home/tomek/Documents/amble-test/New Name/assets/enemy1_anim.png,[object Object],/home/tomek/Documents/amble-test/New Name/assets/enemy2_anim.png,[object Object],/home/tomek/Documents/amble-test/New Name/assets/enemy3_anim.png,[object Object],/home/tomek/Documents/amble-test/New Name/assets/explosion.png,[object Object],/home/tomek/Documents/amble-test/New Name/assets/jezus_head.png,[object Object],/home/tomek/Documents/amble-test/New Name/assets/levelup_1.png,[object Object],/home/tomek/Documents/amble-test/New Name/assets/levelup_2.png,[object Object],/home/tomek/Documents/amble-test/New Name/assets/levelup_3.png,[object Object],/home/tomek/Documents/amble-test/New Name/assets/player_idle.png,[object Object],/home/tomek/Documents/amble-test/New Name/assets/player_lvl1_anim.png,[object Object],/home/tomek/Documents/amble-test/New Name/assets/player_lvl1_idle.png,[object Object],/home/tomek/Documents/amble-test/New Name/assets/player_lvl2_anim.png,[object Object],/home/tomek/Documents/amble-test/New Name/assets/player_lvl2_idle.png,[object Object],/home/tomek/Documents/amble-test/New Name/assets/player_lvl3_anim.png,[object Object],/home/tomek/Documents/amble-test/New Name/assets/player_lvl3_idle.png,[object Object],/home/tomek/Documents/amble-test/New Name/assets/player_lvl4_anim.png,[object Object],/home/tomek/Documents/amble-test/New Name/assets/player_lvl4_idle.png,[object Object],/home/tomek/Documents/amble-test/New Name/assets/player_run.png,[object Object],/home/tomek/Documents/amble-test/New Name/assets/scale.png,[object Object],/home/tomek/Documents/amble-test/New Name/assets/start_info.png,[object Object],/home/tomek/Documents/amble-test/New Name/assets/start_screen.png
//     at Gulp.src (/home/tomek/Documents/amble-engine/node_modules/vinyl-fs/lib/src/index.js:20:11)
//     at Gulp.<anonymous> (/home/tomek/Documents/amble-engine/build/utils/builder.js:46:15)
//     at module.exports (/home/tomek/Documents/amble-engine/node_modules/orchestrator/lib/runTask.js:34:7)
//     at Gulp.Orchestrator._runTask (/home/tomek/Documents/amble-engine/node_modules/orchestrator/index.js:273:3)
//     at Gulp.Orchestrator._runStep (/home/tomek/Documents/amble-engine/node_modules/orchestrator/index.js:214:10)
//     at Gulp.Orchestrator.start (/home/tomek/Documents/amble-engine/node_modules/orchestrator/index.js:134:8)
//     at /home/tomek/Documents/amble-engine/node_modules/gulp-sequence/index.js:63:12
