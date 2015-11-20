var fs = require('fs');
// var Amble = require('../core/amble.js');
var Amble = require('./js/amble-editor.js');
var Camera = require('./js/camera.js');

var app = new Amble.Application({

    resize: true,

    mainCamera: {
        camera: { name: "Amble.Camera", args: {
            position: { name: "Amble.Math.Vector2", args: {x:0 ,y:0}},
            context: "scene-view"
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
