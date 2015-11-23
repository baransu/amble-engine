var fs = require('fs');
// var Amble = require('../core/amble.js');
var Amble = require('./js/amble-editor.js');
var Camera = require('./js/camera.js');

var app = new Amble.Application({

    resize: true,

    mainCamera: {
        camera: { name: "Amble.Camera", args: {
            position: { name: "Amble.Math.Vector2", args: {x:0 ,y:0}},
            context: "scene-view",
            color: "#616161"
        }},
        components: [
            { name: "Camera", args: {}}
        ],
    },

    preload: function(){

        var obj = {
            transform: { name: "Amble.Transform", args: {
                position: { name: "Amble.Math.Vector2", args: {x:0 ,y:0}},
                size: { name: "Amble.Math.Vector2", args: {x:100 ,y:100}},
            }},
            renderer: {name: 'Amble.Graphics.RectRenderer', args: {
                color: 'red'
            }}
        };

        this.scene.instantiate(obj);

    },

    start: function(){

    },

    preupdate: function(){

    },

    postupdate: function(){

    },

    postrender: function(){

    }
});

var watch = require('node-watch');
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
                arrow.className = "fa fa-caret-right triangle-icon"
                header.appendChild(arrow);
                icon.className = "fa fa-folder no-clickable folder-icon"

                break;
            case 'file':

                icon.className = "fa fa-file-text-o no-clickable file-icon"

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
        var normal = 'header';
        var highlighted = "header-highlighted";

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
