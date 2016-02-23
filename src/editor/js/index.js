const electron = require('electron');
const remote = electron.remote;
const Menu = remote.Menu;
const ipcRenderer = electron.ipcRenderer;

const _ = require('lodash');

var fs = require('fs-extra');
var watch = require('node-watch');

global.jQuery = $ = require('jquery');

var imgExtensionList = [
    'png',
    'jpg',
    'jpeg',
    'gif'
];

var projectDirectory = null;

var projectData = {};

var EDITOR = null;

var primaryColor = '#e91e63';

var undoArray = [];
var redoArray = [];

const MAX_UNDO_REDO = 128;

var menuFunctions = {

  save: function() {
    var data = {};

    data.time = Date.now();
    data.scene = AMBLE.scene.createSceneFile();
    data.camera = {
      x: AMBLE.mainCamera.transform.position.x,
      y: AMBLE.mainCamera.transform.position.y
    };

    ipcRenderer.send('editor-save-respond', JSON.stringify(data));
  },

  build: function() {

    var data = {
      sceneFile: AMBLE.scene.createSceneFile(),
      assets: AMBLE.assets,
    };

    ipcRenderer.send('editor-build-respond', data);
  },

  play: function() {
      var data = {
        sceneFile: AMBLE.scene.createSceneFile(),
        assets: AMBLE.assets,
      };

      AMBLE.pause();
      ipcRenderer.send('editor-game-preview-respond', data);
  },

  stop: function() {
    ipcRenderer.send('editor-game-preview-stop-request');
  },

  undo: function() {

    if(undoArray.length > 1 && !AMBLE.paused) {
      console.log(undoArray);
      var children = undoArray.pop();
      AMBLE.scene.applyUndoRedo(children);
      if(redoArray.length > MAX_UNDO_REDO) {
        redoArray.unshift();
      }
      redoArray.push(children);
    }

  },

  redo: function() {

    if(redoArray.length > 0 && !AMBLE.paused) {
      console.log(redoArray);
      var children = redoArray.pop();
      AMBLE.scene.applyUndoRedo(children);
      if(undoArray.length > MAX_UNDO_REDO) {
        undoArray.unshift();
      }
      undoArray.push(children);
    }

  },
}

function prepareUndoRedo() {
  if(undoArray.length > MAX_UNDO_REDO) {
    undoArray.unshift();
  }
  undoArray.push(_.cloneDeep(AMBLE.scene.createSceneFile(true)));
  console.log('undoArray', undoArray.length);
};

var menu = Menu.buildFromTemplate([
  {
    label: 'File',
    submenu: [
      {
        label: 'Undo',
        accelerator: 'Ctrl+Z',
        click: menuFunctions.undo
      },
      {
        label: 'Redo',
        accelerator: 'Shift+Ctrl+Z',
        click: menuFunctions.redo
      },
      {
        label: 'Save',
        accelerator: 'Ctrl+S',
        click: menuFunctions.save
      },
      {
        type: 'separator'
      },
      {
        label: 'Build',
        accelerator: 'Ctrl+B',
        click: menuFunctions.build
      },
    ]
  },
  {
    label: 'Game',
    submenu: [
      {
        label: 'Play (preview)',
        accelerator: 'Ctrl+P',
        click: menuFunctions.play
      },
      {
        label: 'Stop (preview)',
        accelerator: 'Shift+Ctrl+P',
        click: menuFunctions.stop
      }
    ]
  }
]);

Menu.setApplicationMenu(menu);

window.onload = function() {
  ipcRenderer.send('editor-app-loaded');
}

ipcRenderer.on('editor-game-preview-request', function() {
  menuFunctions.play();
});

ipcRenderer.on('editor-build-request', function() {
  menuFunctions.build();
});

ipcRenderer.on('editor-save-request', menuFunctions.save );

ipcRenderer.on('editor-undo-request', function(event, data) {
  menuFunctions.undo();
});

ipcRenderer.on('editor-redo-request', function(event, data) {
  menuFunctions.redo();
});

ipcRenderer.on('editor-unpause', function(event, data) {
  AMBLE.unpause();
});

ipcRenderer.on('game-preview-log', function(event, data) {
  Debug.log(data);
});

ipcRenderer.on('game-preview-error', function(event, data) {
  Debug.error(data);
});

ipcRenderer.on('editor-load-respond', function(event, data) {
  console.log('main process loaded respond')
  // AssetDB = low(data.path + '/assetsDB.json', { storage })
  // AssetDB._.mixin(require('underscore-db'));

  projectDirectory = data.path;
  console.log(projectData);
  projectData = data.project;

  console.log(projectData)

  projectView.init();

  document.querySelector('dynamic-layout').panelsObserver();

  //clear canvas
  document.getElementById('scene-view').innerHTML = "";


  var app = new Application(application);

  EDITOR.update();
  EDITOR.refresh();

  AMBLE.assets = projectData.assets;

  ipcRenderer.send('editor-project-loaded');

});

//move to angular
var projectView = {

  projectStructure: [],

  importAsset: function(targetFolderPath, assetPath, assetName) {
    console.log(targetFolderPath, assetPath, assetName);

    // copy
    try {
      fs.copySync(assetPath, targetFolderPath + '/' + assetName);
    } catch (err) {
      console.error('Oh no, there was an error: ' + err.message)
    }

  },

  processDir: function(path) {

    var files = [];

    var abc = fs.readdirSync(path)

    for(var i = 0; i < abc.length; i++) {

      var f = abc[i].split('.');
      var extension = f[f.length - 1];

      if(extension == 'aproject') continue;

      var file = {
        id: "id_" + uuid.v1(),
        type: fs.lstatSync(path + '/' + abc[i]).isDirectory() ? 'folder': 'file',
        path: path + '/' + abc[i],
        name: f[0],
        children: [],
        assetType: 'other',
        extension: extension
      }

      if(file.type == 'folder') {
        file.children = this.processDir(path + '/' + abc[i]);
      } else if(extension != 'meta'){

        var metaFilePath = file.path + '.meta';
        try {
          fs.accessSync(metaFilePath, fs.F_OK);
          // read meta
          try {
            var meta = JSON.parse(fs.readFileSync(metaFilePath, 'utf-8'));
          } catch (err) {
            var meta = this.createMetaInformation(file);
          }


        } catch (err) {
          console.log('new asset', file.path)
          var meta = this.createMetaInformation(file);
        }

        // check if meta path == file.path
        if(meta.path != file.path) {
          console.log('meta file path change: ', meta.path, file.path);
          meta.path = file.path;
        }

        if(meta.name != file.name) {
          console.log('meta file name change: ', meta.name, file.name);
          meta.name = file.name;
        }

        file.assetType = meta.type;

        try {
          fs.writeFileSync(metaFilePath, JSON.stringify(meta), 'utf-8');
        } catch (e) {
          throw new Error('Cannot write meta file: ' + metaFilePath, e);
        }

        console.log(meta)

        projectData.assets.push(meta);

      }

      if(extension != 'meta') {
        files.push(file)
      }
    }

    return files;

  },

  createMetaInformation: function(file) {
    // create uuid
    var meta = {
      uuid: uuid.v1(),
      type: 'other',
      path: file.path,
      name: file.name,
      extension: file.extension
    }

    // get type (sprite/ audio/ script)
    for(var x in imgExtensionList) {
      if(meta.extension == imgExtensionList[x]) {
        meta.type = 'sprite'
        break;
      } else if(meta.extension == 'js') {
        meta.type = 'script'
        break;
      }
    }

    // other import settings

    return meta;
  },

  watch: function(){

    var that = this;

    var filter = function(pattern, fn) {
      return function(filename) {
        if (!pattern.test(filename)) {
          fn(filename);
        }
      }
    }

    watch(projectDirectory + '/assets', filter(/\.meta$/, function(filename) {

      projectData.assets = [];
      projectView.projectStructure = projectView.processDir(projectDirectory);

      console.log(projectData.assets);
      AMBLE.assets = projectData.assets;

      document.querySelector('assets-manager-view').update(projectView.projectStructure);

      EDITOR.updateClass();

      // load assets
      AMBLE.loader = new Loader();
      for (var i = 0; i < projectData.assets.length; i++) {
        var meta = projectData.assets[i];
        if(meta.type == 'sprite') {
          AMBLE.loader.load('sprite', meta.path, meta.name, meta.uuid);
        } else if(meta.type == 'script'){
          // connect script with uuid
          require.reload(meta.path);
        }
      }

      AMBLE.loader.loadAll(function() {
        console.log('additional assets loaded')
        console.log(AMBLE.loader)
        var rendererComponenet = document.querySelector('renderer-component')
        if(rendererComponenet) rendererComponenet.updateSpritesList();

        // update assets view
        // document/


      });

    }));

  },

  init: function(){

    projectData.assets = [];

    this.projectStructure = this.processDir(projectDirectory);

    console.log(this.projectStructure);
    console.log(projectData);

    document.querySelector('assets-manager-view').update(projectView.projectStructure);

    // this.jstree();
    this.watch();

  }
}

var ambleEditor = angular.module('ambleEditor', []);
ambleEditor.controller('editorController', ['$scope', function($scope) {

  var editor = EDITOR = this;

  this.refresh = function() {
    $scope.$apply();
  };

  this.updateActors = function() {
    this.actors = AMBLE.scene.children;
  };

  editor.update = function() {

    this.previousActor = null;
    this.actors = [];
    this.actor = null;

    //default actors type to add
    this.actorsToAdd = [
      {
        name: 'MainCamera',
        tag: 'mainCamera',
        hideInHierarchy: false,
        selected: false,
        transform: { name: "Transform", args: {
          position: { name: "Vec2", args: {x: 0, y: 0}},
          scale: { name: "Vec2", args: {x: 1, y:1}},
          rotation: 0
        }},
        camera: { name: "MainCamera", args: {
          scale: 1,
          size: { name: 'Vec2', args: {x: 1280, y: 720}},
          bgColor: '#37474f',
        }},
        renderer: { name: 'CameraRenderer', args: {}},
        components: []
      },
      {
        name: 'Actor',
        tag: 'actor',
        hideInHierarchy: false,
        selected: false,
        transform: { name: "Transform", args: {
          position: { name: "Vec2", args: {x: 0, y: 0}},
          scale: { name: "Vec2", args: {x: 1, y:1}},
          rotation: 0
        }},
        renderer: { name: 'EngineRenderer', args: {}},
        components: []
      },
    ];

    var cam = AMBLE.scene.getActorByName('SceneCamera');
    if(cam) {
      this.cameraScript = cam.getComponent('Camera');
      this.cameraScript.editor = this;
    }

    this.updateActors();
    this.updateClass();
  };

  editor.updateClass = function() {

    for(var i in editor.actors) {
      var a = editor.actors[i].prefab;
      for(var j in a.components) {
        var c = CLASSES.find(c => c.name == a.components[j].name);
        if(!c) continue;
        for(var x in c.properties) {
          var property = a.components[j].properties.find( p => p.name == c.properties[x].name)
          if(typeof property === 'undefined') {
            a.components[j].properties.push(JSON.parse(JSON.stringify(c.properties[x])));
          }
        }

        var toDel = [];
        for(var x in a.components[j].properties) {
          var aa = c.properties.find(s => s.name == a.components[j].properties[x].name);
          if(!aa) {
            toDel.push(a.components[j].properties[x].name);
          }
        }

        for(var x in toDel) {
          var index = a.components[j].properties.indexOf(a.components[j].properties.find(s => s.name == toDel[x]));
          a.components[j].properties.splice(index, 1);
        }

      }
    }
  };

  editor.update();

  angular.element(window).on('keydown', function(e) {
    // console.log(e.which);
    switch(e.which) {
    case 27: //esc

      editor.refresh();

      if(editor.actor && document.activeElement.id == 'id_' + editor.actor.sceneID || document.activeElement.nodeName == 'BODY') {
        if(editor.actor && editor.actor.selected) {
          editor.actor.selected = false;
        }

        if(editor.previousActor) {
          editor.previousActor.classList.remove('active');
        }

        editor.actor = null;
        editor.cameraScript.selectedActor = null;
        document.querySelector('inspector-view')._actorObserver();

      } else {
        document.activeElement.blur();
      }

    break;
    case 46: //del

      if(editor.actor && document.activeElement.id == 'id_' + editor.actor.sceneID) {

        prepareUndoRedo();

        editor.cameraScript.selectedActor = null;
        AMBLE.scene.remove(editor.actor)

        editor.actor = null;

        editor.refresh();
      }

    break;
    case 70: // f

      if(e.shiftKey && !e.ctrlKey && editor.acotr && editor.actor.transform ) {
        AMBLE.mainCamera.transform.position.x = editor.actor.transform.position.x;
        AMBLE.mainCamera.transform.position.y = editor.actor.transform.position.y;
      }
      //
      // if(e.shiftKey && e.ctrlKey) {
      //     console.log('resize')
      //     AMBLE.mainCamera.getComponent('Camera').onresize(AMBLE.mainCamera);
      // }

    break;

    }
  });

  editor.addActor = function(actor) {


    var _actor = _.cloneDeep(this.actorsToAdd.find(a => a.name == actor.name));
    if(AMBLE.scene.getActorByTag('mainCamera') && actor.tag == 'mainCamera') return;
    if(_actor) {

      delete _actor.$$hashKey;

      if(AMBLE.scene.getActorByName(_actor.name)) {
        _actor.name += this.actors.length;
      }

      prepareUndoRedo();

      AMBLE.scene.instantiate(_actor);
    }

  };

  editor.getActor = function() {
    if(this.actor) {
      delete this.actor.$$hashKey;
    }
    return this.actor;
  };

  editor.actorSelected = function(e) {

    e.preventDefault();

    prepareUndoRedo();

    var sceneID = e.target.id.replace('id_', '');

    if(this.actor) {
      this.actor.selected = false;
    }

    this.actor = AMBLE.scene.getActorByID(sceneID)
    this.cameraScript.selectedActor = this.actor;

    if(this.previousActor && this.previousActor != e.target) {
      this.previousActor.classList.remove('active');
    }

    e.target.classList.add('active');
    this.previousActor = e.target;

    this.actor.selected = true;

  };
}]);

//scane view
var application = {

    // resize: true,
    mainCamera: {
      name: 'SceneCamera',
      tag: ['sceneCamera'],
      hideInHierarchy: true,
      transform: { name: "Transform", args: {
        position: { name: "Vec2", args: {}},
        scale: { name: "Vec2", args: {x: 1, y:1}},
        rotation: 0
      }},
      camera: { name: "MainCamera", args: {
        context: "scene-view",
        layer: true,
        bgColor: 'transparent',
        size: { name: 'Vec2', args: {x: 1280, y: 720}}
      }},
      components: [
        { type:'editor', name: "Camera", properties: []}
      ]
    },

    preload: function(){

      // load actors to scene
      if(projectData.actors) {
        for(var i = 0; i < projectData.actors.length; i++) {
          // console.log(projectData.actors[i]);
          this.scene.instantiate(projectData.actors[i]);
        }
        EDITOR.updateActors();
      }

      for (var i = 0; i < projectData.assets.length; i++) {
        var meta = projectData.assets[i];
        if(meta.type == 'sprite') {
          this.loader.load('sprite', meta.path, meta.name, meta.uuid);
        } else if(meta.type == 'script'){
          // asocioate script with uuid
          require(meta.path);
        }
      }


    },

    //process scripts int engine and load objects
    loaded: function(){
      prepareUndoRedo();
      if(projectData.camera) {
        this.mainCamera.transform.position.x = projectData.camera.x;
        this.mainCamera.transform.position.y = projectData.camera.y;
      }

    },

    //actual start function
    start: function(){
      // console.log(this.mainCamera)
    },

    preupdate: function(){

    },

    postupdate: function(){

    },

    postrender: function(){

    }
};

var app = new Application({});

/**
 * Prevent for drag'n'drop default action
 */
document.addEventListener('dragover',function(event){
  event.preventDefault();
  return false;
},false);

document.addEventListener('drag',function(event){
  event.preventDefault();
  return false;
},false);

document.addEventListener('drop',function(event){
  event.preventDefault();
  return false;
},false);

document.addEventListener('dragend',function(event){
  event.preventDefault();
  return false;
},false);

/**
 * Removes a module from the cache.
 */
require.uncache = function (moduleName) {
    // Run over the cache looking for the files
    // loaded by the specified module name
    require.searchCache(moduleName, function (mod) {
        delete require.cache[mod.id];
    });
};

/**
 * Runs over the cache to search for all the cached files.
 */
require.searchCache = function (moduleName, callback) {
  // Resolve the module identified by the specified name
  var mod = require.resolve(moduleName);

  // Check if the module has been resolved and found within
  // the cache
  if (mod && ((mod = require.cache[mod]) !== undefined)) {
    // Recursively go over the results
    (function run(mod) {
      // Go over each of the module's children and
      // run over it
      mod.children.forEach(function (child) {
          run(child);
      });

      // Call the specified callback providing the
      // found module
      callback(mod);
    })(mod);
  }
};

/*
 * Load a module, clearing it from the cache if necessary.
 */
require.reload = function(moduleName) {
  require.uncache(moduleName);
  return require(moduleName);
};
