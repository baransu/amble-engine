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

        div.className = "item"

        var icon = document.createElement("i");
        if(item.isDirectory) {
            icon.className = "right triangle icon no-clickable"
        } else {
            icon.className = "file icon no-clickable"
        }
        div.appendChild(icon);

        var content = document.createElement("div");
        content.className = "content";
        var header = document.createElement("a");
        header.href = "#!"
        header.className = 'header';
        header.innerHTML = item.name;
        header.addEventListener('click', this.itemOnClick, false);
        content.appendChild(header);

        if(item.childs.length > 0) {
            content.appendChild(this.makeList(item.childs));
        }

        div.appendChild(content);

        return div;
    },

    itemOnClick: function(e) {
        // var normal = 'header no-clickable';
        // var highlighted = "header no-clickable item-highlighted";
        // var contentClass = "content no-clickable"
        // var header = null;
        //
        // console.log(e.target.childNodes)
        //
        // for(var i = 0; i < e.target.childNodes.length; i++) {
        //     if(e.target.childNodes[i].className == contentClass) {
        //         var content = e.target.childNodes[i];
        //
        //         if(content.childNodes[0].className == normal) {
        //             content.childNodes[0].className = highlighted;
        //         } else {
        //             content.childNodes[0].className = normal;
        //         }
        //
        //         break;
        //     }
        // }
    },

    processDir: function(path) {

        var files = [];

        var abc = fs.readdirSync(path)

        for(var i = 0; i < abc.length; i++) {

            var file = {
                isDirectory: fs.lstatSync(path + '/' + abc[i]).isDirectory(),
                path: path + '/' + abc[i],
                name: abc[i],
                childs: []
            }

            if(file.isDirectory) {
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
