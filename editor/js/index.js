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

var projectStructure = processDir(projectPath);

var list = document.getElementById("list");
for(var i = 0; i < projectStructure.length; i++) {
    list.appendChild(item(projectStructure[i]));
}

watch(projectPath, function(filename){
    var projectStructure = processDir(projectPath);
    var list = document.getElementById("list");
    list.innerHTML = "";
    for(var i = 0; i < projectStructure.length; i++) {
        list.appendChild(item(projectStructure[i]));
    }
});

function makeList(array) {

    var list = document.createElement("div");
    list.className = "list";

    for(var i = 0; i < array.length; i++) {
        list.appendChild(item(array[i]));
    }

    return list;
}

function item(item) {

    var div = document.createElement("div");

    div.className = "item"

    var icon = document.createElement("i");
    if(item.isDirectory) {
        icon.className = "right triangle icon"
    } else {
        icon.className = "file icon"
    }
    div.appendChild(icon);

    var content = document.createElement("div");
    content.className = "content";
    var header = document.createElement("div");
    header.className = 'header';
    header.innerHTML = item.name;
    content.appendChild(header);

    if(item.childs.length > 0) {
        content.appendChild(makeList(item.childs));
    }

    div.appendChild(content);

    //
    // var divider = document.createElement("div");
    // divider.className = "ui inverted divider";
    // div.appendChild(divider);

    return div;

}

function processDir(path) {

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
            file.childs = processDir(path + '/' + abc[i]);
        }

        files.push(file)
    }

    return files;

}


//files list
// <!--  item -->
// <!-- <div class="item"> -->
//     <!-- <i class="folder icon"></i> -->
//     <!-- <div class="content"> -->
//         <!-- <div class="header">item list</div> -->
//         <!-- <div class="description">my simple sescription</div> -->
//     <!-- </div> -->
// <!-- </div> -->





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
