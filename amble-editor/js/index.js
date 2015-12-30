var fs = require('fs');
var watch = require('node-watch');

const electron = require('electron');
const remote = electron.remote;
const Menu = remote.Menu;
const ipcRenderer = electron.ipcRenderer;

var menu = Menu.buildFromTemplate([
    {
        label: 'File',
        submenu: [
            {
                label: 'Build',
                accelerator: 'Ctrl+B',
                click: function(){
                    //create scene json file
                    var data = Amble.app.scene.createSceneFile();
                    ipcRenderer.send('build-respond', data);
                }
            },
            {
                type: 'separator'
            }
        ]
    }
]);

Menu.setApplicationMenu(menu);

ipcRenderer.on('build-request', function(){
    //create scene json file
    var data = Amble.app.scene.createSceneFile();
    ipcRenderer.send('build-respond', data);
});

var Amble = require('./js/amble-editor.js');
var scripts = [
    './js/camera.js',
    './js/src/user/player.js',
    './js/src/user/gunHolder.js'
]

for(var i in scripts) {
    require(scripts[i]);
}

var componentsToAdd = [
    {
        name: 'SpriteRenderer',
        type: 'renderer',
        body: { name: 'Amble.Graphics.SpriteRenderer', args: {
            sprite: 'me.jpg'
        }}
    },
    {
        name: 'RectRenderer',
        type: 'renderer',
        body: { name: 'Amble.Graphics.RectRenderer', args: {
            color: '#1B5E20',
            size: { name: "Amble.Math.Vector2", args: {x:100 ,y:100}},
            layer: 0
        }}
    },
    {
        name: 'AnimationRenderer',
        type: 'renderer',
        body: { name: 'Amble.Graphics.AnimationRenderer', args: {
            sprite: 'me.jpg',
            frames: 1,
            updatesPerFrame: 1,
            layer: 0
        }}
    }
]

var projectPath = '../project-folder';

var projectView = {
    projectStructure: [],
    makeList: function(array) {

        var list = document.createElement("ul");
        list.className = "list";

        for(var i = 0; i < array.length; i++) {
            list.appendChild(this.item(array[i]));
        }

        return list;
    },

    item: function(item) {
        var div = document.createElement("li");

        div.className = "list-item"

        var header = document.createElement('div');
        header.className = 'header';

        var icon = document.createElement("i");

        switch(item.type) {
            case 'folder':

                var arrow = document.createElement("i");
                arrow.className = "fa fa-caret-right no-clickable triangle icon"
                header.appendChild(arrow);
                icon.className = "fa fa-folder no-clickable folder icon"

                break;
            case 'file':

                icon.className = "fa fa-file-text-o no-clickable file icon"

                break;

        }

        header.appendChild(icon);

        var text = document.createElement("a");
        text.href = "#"
        text.className = 'list-item';
        text.innerHTML = item.name;
        text.addEventListener('click', this.itemOnClick, false);

        header.appendChild(text);
        div.appendChild(header);

        if(item.childs.length > 0) {
            div.appendChild(this.makeList(item.childs));
        }

        return div;
    },

    itemOnClick: function(e) {
        e.preventDefault();

        //if file else collapse/expand directory

        var normal = 'header';
        var highlighted = "header highlighted";

        var parent = e.target.parentElement;
        console.log(parent)

        if(parent.className == normal) {
            parent.className = highlighted;
        } else {
            parent.className = normal;
        }

    },

    processDir: function(path) {

        var files = [];

        var abc = fs.readdirSync(path)

        for(var i = 0; i < abc.length; i++) {

            var file = {
                type: fs.lstatSync(path + '/' + abc[i]).isDirectory() ? 'folder': 'file',
                path: path + '/' + abc[i],
                name: abc[i],
                childs: []
            }

            if(file.type == 'folder') {
                file.childs = this.processDir(path + '/' + abc[i]);
            }

            files.push(file)
        }

        return files;

    },

    watch: function(){

        watch(projectView.projectPath, function(filename){
            projectView.projectStructure = projectView.processDir(projectPath);
            var list = document.getElementById("list");
            list.innerHTML = "";
            for(var i = 0; i < projectView.projectStructure.length; i++) {
                list.appendChild(projectView.item(projectView.projectStructure[i]));
            }
        });

    },

    init: function(){

        this.projectStructure = this.processDir(projectPath);

        var list = document.getElementById("list");
        for(var i = 0; i < this.projectStructure.length; i++) {
            list.appendChild(this.item(this.projectStructure[i]));
        }

        this.watch();

    }
}

projectView.init();

var ambleEditor = angular.module('ambleEditor', []);
ambleEditor.controller('editorController', ['$scope', function($scope) {

    var editor = this;

    editor.hierarchy = {};

    editor.inspector = {};

    editor.inspector.transformShow = true;

    editor.previousActor = null;

    editor.sceneID = null

    editor.actors = Amble.app.scene.children.filter(c => c.options.hideInHierarchy != true);

    editor.actor = null;

    editor.hideComponentAdder = true;

    editor.componentsToAdd = [];

    var cameraScript = Amble.app.scene.getActorByName('SceneCamera').getComponent('Camera');
    cameraScript.editor = this;

    angular.element(window).on('keydown', function(e) {
        // console.log(e.which);
        switch(e.which) {
            case 27: //esc

                editor.hideComponentAdder = true;
                editor.refresh();

                if(editor.actor && editor.actor.selected) {
                    editor.actor.selected = false;
                }

                if(editor.previousActor) {
                    editor.previousActor.className = 'hierarchy-item';
                }

            break;
            case 46: //del

                if(editor.actor) {

                    Amble.app.scene.remove(editor.actor)

                    editor.actors = Amble.app.scene.children.filter(c => c.options.hideInHierarchy != true);
                    editor.actor = null;

                    editor.refresh();
                }

            break;
            case 70: // f

                if(e.shiftKey && editor.actor.transform) {
                    Amble.app.mainCamera.camera.position.x = editor.actor.transform.position.x;
                    Amble.app.mainCamera.camera.position.y = editor.actor.transform.position.y;
                }

            break;

        }
    });

    editor.refresh = function() {
        $scope.$apply();
    };

    editor.showComponentAdder = function() {
        if(this.actor) {

            //updated componentsToAdd
            for(var i in Amble._classes) {
                var p = Amble._classes[i].properties
                console.log(p);
                var cl = {
                    name: Amble._classes[i].name,
                    type: 'class',
                    body: {
                        name: Amble._classes[i].name,
                        properties: p
                    }
                }
                var c = componentsToAdd.find(c => c.name == cl.name)
                if(!c) {
                    console.log('add')
                    componentsToAdd.push(cl);
                } else {
                    console.log('update')
                    c.body.properties = Amble._classes[i].properties
                }
            }

            // if(this.actor.renderer) {
            //     this.componentsToAdd = componentsToAdd.filter(c => c.type != 'renderer');
            // } else {
            // }

            this.componentsToAdd = componentsToAdd;

            console.log(this.componentsToAdd);

            this.hideComponentAdder = false;
        }
    };

    editor.addComponent = function(component, $e) {
        console.log(component);

        //add to prefab
        if(component.type == 'renderer') {
            editor.actor.prefab.renderer = component.body;
        } else if(component.type == 'class'){
            console.log(editor.actor.prefab);

            editor.actor.prefab.components.push(component.body);
        }

        var sceneID = editor.actor.sceneID;
        var prefab = editor.actor.prefab;

        Amble.app.scene.remove(this.actor);
        editor.actor = Amble.app.scene.instantiate(prefab);

        editor.actor.selected = true;
        editor.actor.sceneID = sceneID;

        editor.hideComponentAdder = true;
    };

    editor.addActor = function() {
        editor.hideComponentAdder = true;

        var obj = {
            name: 'actor',
            tag: ['actor'],
            options: {},
            transform: { name: "Amble.Transform", args: {
                position: { name: "Amble.Math.Vector2", args: {x:0 ,y:0}},
                scale: { name: "Amble.Math.Vector2", args: {x:1 ,y:1}}
            }},
            renderer: { name: 'Amble.Graphics.EngineRenderer', args: {}},
            components: []
        };

        aPrefabs.push(obj);
        Amble.app.scene.instantiate(obj);

        editor.actors = Amble.app.scene.children.filter(c => c.options.hideInHierarchy != true);
    };

    editor.actorSelected = function(_actor, $e) {
        editor.hideComponentAdder = true;

        if(editor.actor) {
            editor.actor.selected = false;
        }

        editor.sceneID = _actor.sceneID;

        editor.actor = Amble.app.scene.getActorByID(_actor.sceneID);

        var normal = 'hierarchy-item';
        var highlighted = "hierarchy-item highlighted";

        if(editor.previousActor) {
            editor.previousActor.className = normal;
        }

        if($e) {
            $e.preventDefault();
            $e.target.className = highlighted;
            editor.previousActor = $e.target;
        }

        if(editor.actor.selected) {
            editor.actor.selected = false;
        } else {
            editor.actor.selected = true;
        }
    };
}]);

//temporary
var aPrefabs = [
    {
        name: 'player',
        tag: ['object', 'player'],
        options: {},
        transform: { name: "Amble.Transform", args: {
            position: { name: "Amble.Math.Vector2", args: {x:0 ,y:0}},
            scale: { name: "Amble.Math.Vector2", args: {x:1 ,y:1}},
            rotation: 0
        }},
        renderer: {name: 'Amble.Graphics.SpriteRenderer', args: {
            sprite: 'me.jpg'
        }},
        components: [
            { type:'editor', name: 'Player', properties: {}}
        ],
    },
    {
        name: 'object',
        tag: ['object'],
        options: {},
        transform: { name: "Amble.Transform", args: {
            position: { name: "Amble.Math.Vector2", args: {x:500 ,y:0}},
            scale: { name: "Amble.Math.Vector2", args: {x:1 ,y:1}},
            rotation: 0
        }},
        renderer: {name: 'Amble.Graphics.RectRenderer', args: {
            color: '#1B5E20',
            size: { name: "Amble.Math.Vector2", args: {x:100 ,y:100}}
        }},
        components: []
    },

]

//aplikacja
var app = new Amble.Application({

    resize: true,
    //implement post LD34 stuff

    sceneCamera: {
        name: 'SceneCamera',
        tag: ['sceneCamera'],
        options: {
            hideInHierarchy: true
        },
        camera: { name: "Amble.Camera", args: {
            position: { name: "Amble.Math.Vector2", args: {x:0 ,y:0}},
            context: "scene-view"
        }},
        components: [
            { type:'editor', name: "Camera", args: {}}
        ]
    },

    // mainCamera: {
    //     name: 'MainCamera',
    //     tag: ['mainCamera'],
    //     options: {},
    //     camera: { name: "Amble.Camera", args: {
    //         position: { name: "Amble.Math.Vector2", args: {x:0 ,y:0}},
    //         context: "scene-view"
    //     }},
    //     components: []
    // },

    preload: function(){

        //load scene/project file
        //load all objects from project file
        for(var i in aPrefabs) {
            for(var x in aPrefabs[i].components) {
                var p = Amble._classes.find(c => c.name == aPrefabs[i].components[x].name).properties;
                aPrefabs[i].components[x].properties = p;
            }

            this.scene.instantiate(aPrefabs[i]);
        }

        //load all images listed in proejct file
        var data = fs.readdirSync('data')
        for(var i = 0; i < data.length; i++) {
            this.loader.load('image', 'data/' + data[i], data[i]);
        }

    },

    //process scripts int engine and load objects
    loaded: function(){

    },

    //actual start function
    start: function(){

    },

    preupdate: function(){

    },

    postupdate: function(){

    },

    postrender: function(){

    }
});

/*

static html design (materialize css?)

*/

/*
    scene view

grid background

load all scene actors
dragable actors
click opens inspector for given actor

drag arrows

drag from project folder to scene if supported format like image or prefab

drag from scene to inspector - to script variable?

snap?

*/


/*
    game view

browser like window to preview game - stand alone?

*/

/*
    project view/asset/folder manager

*/

/*
    inspector

*/

/*
    hierarchy - scene list

*/
