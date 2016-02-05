const electron = require('electron');
const remote = electron.remote;
const Menu = remote.Menu;
const ipcRenderer = electron.ipcRenderer;

const low = require('lowdb')
const storage = require('lowdb/file-sync')

const _ = require('lodash');

var AssetDB = null;

var fs = require('fs');
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
      imagesList: projectData.imgs,
      scriptsList: projectData.scripts
    };

    ipcRenderer.send('editor-build-respond', data);
  },

  play: function() {
      var data = {
        sceneFile: AMBLE.scene.createSceneFile(),
        imagesList: projectData.imgs,
        scriptsList: projectData.scripts
      };

      AMBLE.pause();
      ipcRenderer.send('editor-game-preview-respond', data);
  },

  stop: function() {
    console.log('stop preview - editor')
    ipcRenderer.send('editor-game-preview-stop-request');
  }

}

var menu = Menu.buildFromTemplate([
  {
    label: 'File',
    submenu: [
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
  AssetDB = low(data.path + '/assetsDB.json', { storage })

  // var holder = document.getElementById('assets-manager');
  // holder.ondrop = function (e) {
  //   e.preventDefault();
  //   var file = e.dataTransfer.files[0];
  //   if(file) console.log('File you dragged here is', file.path);
  //   return false;
  // };

  projectDirectory = data.path;
  console.log(projectData);
  projectData = data.project;

  console.log(projectData)

  projectView.init();

  for(var i in projectData.scripts) {
    require(projectData.scripts[i].path);
  }

  //clear canvas
  document.getElementById('scene-view').innerHTML = "";

  var app = new Application(application);

  EDITOR.update();
  EDITOR.refresh();

  AMBLE.imgList = projectData.imgs
  ipcRenderer.send('editor-project-loaded');

});

//move to angular
var projectView = {

  projectStructure: [],

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
        text: abc[i],
        children: [],
        li_attr: {},  // attributes for the generated LI node
        a_attr: {} // attributes for the generated A node
      }

      if(file.type == 'folder') {
        file.children = this.processDir(path + '/' + abc[i]);
      } else {
        for(var x in imgExtensionList) {

          if(extension == imgExtensionList[x]) {

            projectData.imgs.push({
              path: path + '/' + abc[i],
              name: abc[i]
            });

            var _i = AssetDB('images').find({path: path + '/' + abc[i], name: abc[i]});
            if(!_i) {
              AssetDB('images').push({
                id: uuid.v1(),
                path: path + '/' + abc[i],
                name: abc[i]
              });
            }

            break;

          } else if(extension == 'js') {

            projectData.scripts.push({
              path: path + '/' + abc[i],
              name: abc[i]
            });

            // validation?
            var _i = AssetDB('scripts').find({path: path + '/' + abc[i], name: abc[i]});
            if(!_i) {
              AssetDB('scripts').push({
                id: uuid.v1(),
                path: path + '/' + abc[i],
                name: abc[i]
              });
            }

            break;

          }
        }
      }

      files.push(file)
    }

    return files;

  },

  watch: function(){

    var that = this;

    watch(projectDirectory + '/assets', function(filename){

      projectData.scripts = [];
      projectData.imgs = [];
      projectView.projectStructure = projectView.processDir(projectDirectory);

      console.log(AssetDB('images').value());

      // that.jstree();

      document.querySelector('assets-manager-panel').update(projectView.projectStructure);

      for(var i in projectData.scripts) {
        require.reload(projectData.scripts[i].path);
      }

      EDITOR.updateClass();

      AMBLE.imgList = projectData.imgs

    });

  },

  jstree: function() {
    $('#assets-manager').jstree("destroy").empty();
    $('#assets-manager').jstree({
      'core' : {
        "check_callback" : true,
        'responsive': true,
        'data' : projectView.projectStructure,
      },
      'themes' : {
        'dots' : false // no connecting dots
      },
      'plugins' : [ 'wholerow', 'state', 'sort', 'types'],
      'types' : {
        'folder' : {
          'icon' : 'fa fa-folder'
        },
        'file' : {
          'icon' : 'fa fa-file-text-o'
        }
      },
    });
  },

  init: function(){

    projectData.imgs = [];
    projectData.scripts = [];

    this.projectStructure = this.processDir(projectDirectory);

    console.log(this.projectStructure);
    console.log(projectData);

    document.querySelector('assets-manager-panel').update(projectView.projectStructure);

    console.log(AssetDB('images').value());
    console.log(AssetDB('scripts').value());

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

      //default components to add
      this.componentsToAdd = [
        {
          name: 'SpriteRenderer',
          type: 'renderer',
          body: { name: 'SpriteRenderer', args: {
            sprite: ''
          }}
        },
        {
          name: 'RectRenderer',
          type: 'renderer',
          body: { name: 'RectRenderer', args: {
            color: '#1B5E20',
            size: { name: "Vec2", args: {x: 100, y:100}},
            layer: 0
          }}
        },
        {
          name: 'AnimationRenderer',
          type: 'renderer',
          body: { name: 'AnimationRenderer', args: {
            sprite: '',
            frames: 1,
            updatesPerFrame: 1,
            layer: 0
          }}
        }
      ];

      //default actors type to add
      this.actorsToAdd = [
        {
          name: 'actor',
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
        {
          name: 'camera',
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

                if(document.activeElement.id == 'id_' + editor.actor.sceneID || document.activeElement.nodeName == 'BODY') {
                    if(editor.actor && editor.actor.selected) {
                        editor.actor.selected = false;
                    }

                    if(editor.previousActor) {
                        editor.previousActor.className = 'list-group-item';
                    }
                } else {
                    document.activeElement.blur();
                }

            break;
            case 46: //del

                if(editor.actor && document.activeElement.id == 'id_' + editor.actor.sceneID) {

                    AMBLE.scene.remove(editor.actor)

                    editor.actor = null;

                    editor.refresh();
                }

            break;
            case 70: // f

                if(e.shiftKey && !e.ctrlKey && editor.actor.transform ) {
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

    editor.updateComponents = function() {
        //updated componentsToAdd
        for(var i in CLASSES) {
            var p = CLASSES[i].properties
            // console.log(p);
            var cl = {
                name: CLASSES[i].name,
                options: CLASSES[i]._options,
                type: 'class',
                body: {
                    type: 'noneditor',
                    name: CLASSES[i].name,
                    properties: p
                }
            }
            var c = this.componentsToAdd.find(c => c.name == cl.name)
            if(!c) {
                this.componentsToAdd.push(cl);
            } else {
                c.body.properties = CLASSES[i].properties
            }
        }

        console.log(this.componentsToAdd);

    };

    editor.addComponent = function(component, $e) {
      console.log(component);

      if(editor.actor) {
        //add to prefab
        if(component.type == 'renderer') {
          editor.actor.prefab.renderer = component.body;
        } else if(component.type == 'class'){
          var c = JSON.parse(JSON.stringify(component.body))
          editor.actor.prefab.components.push(c);

        }

        var sceneID = editor.actor.sceneID;
        var prefab = editor.actor.prefab;

        AMBLE.scene.remove(this.actor);
        editor.actor = AMBLE.scene.instantiate(prefab);

        editor.actor.selected = true;
        editor.actor.sceneID = sceneID;
      }

    };

    editor.addActor = function(actor) {

      var _actor = _.cloneDeep(this.actorsToAdd.find(a => a.name == actor.name));
      if(_actor) {
        delete _actor.$$hashKey;
        _actor.name += this.actors.length;
        console.log(_actor)
        AMBLE.scene.instantiate(_actor);
      }

    };

    editor.getActor = function() {
      if(this.actor) {
        delete this.actor.$$hashKey;
      }
      return this.actor;
    };

    editor.actorSelected = function($e) {

      var sceneID = $e.target.id.replace('id_', '');

      if(this.actor) this.actor.selected = false;

      this.actor = AMBLE.scene.getActorByID(sceneID)

      if(this.previousActor) {
        this.previousActor.classList.remove('active');
      }

      if($e) {
        $e.preventDefault();
        $e.target.classList.add('active');
        this.previousActor = $e.target;
      }

      this.actor.selected = !this.actor.selected;

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
          console.log(projectData.actors[i]);
          this.scene.instantiate(projectData.actors[i]);
        }
        EDITOR.updateActors();
      }

      // load imgs
      if(projectData.imgs) {
        for(var i in projectData.imgs) {
          this.loader.load('img', projectData.imgs[i].path, projectData.imgs[i].name);
        }
      }

    },

    //process scripts int engine and load objects
    loaded: function(){
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

document.addEventListener('drop',function(event){
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
