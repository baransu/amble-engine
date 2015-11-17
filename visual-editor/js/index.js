//polyfill
// if (!Array.prototype.find) {
//   Array.prototype.find = function(predicate) {
//     if (this == null) {
//       throw new TypeError('Array.prototype.find called on null or undefined');
//     }
//     if (typeof predicate !== 'function') {
//       throw new TypeError('predicate must be a function');
//     }
//     var list = Object(this);
//     var length = list.length >>> 0;
//     var thisArg = arguments[1];
//     var value;
//
//     for (var i = 0; i < length; i++) {
//       value = list[i];
//       if (predicate.call(thisArg, value, i, list)) {
//         return value;
//       }
//     }
//     return undefined;
//   };
// }


// if (!Array.prototype.filter) {
//   Array.prototype.filter = function(fun/*, thisArg*/) {
//     'use strict';
//
//     if (this === void 0 || this === null) {
//       throw new TypeError();
//     }
//
//     var t = Object(this);
//     var len = t.length >>> 0;
//     if (typeof fun !== 'function') {
//       throw new TypeError();
//     }
//
//     var res = [];
//     var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
//     for (var i = 0; i < len; i++) {
//       if (i in t) {
//         var val = t[i];
//
//         // NOTE: Technically this should Object.defineProperty at
//         //       the next index, as push can be affected by
//         //       properties on Object.prototype and Array.prototype.
//         //       But that method's new, and collisions should be
//         //       rare, so use the more-compatible alternative.
//         if (fun.call(thisArg, val, i, t)) {
//           res.push(val);
//         }
//       }
//     }
//
//     return res;
//   };
// }

var Flow = require('../core/flow.js');
window.Component = require('./js/scripts/component.js');
window.Camera = require('./js/scripts/camera.js')
window.Manager = require('./js/scripts/manager.js')

var fs = require('fs');
var remote = require('remote');
var Menu = remote.require('menu');
var ipc = require('ipc');

var componentsFunctions = Flow.ComponentsFunction;
var componentsArray = [];

ipc.on('open-respond', function(data){
    Amble.app.scene.children[1].getComponent('Manager').load(data);
});

ipc.on('new-file-respond',function(){
    Amble.app.scene.children[1].getComponent('Manager').load();
});

ipc.on('save-request', function(){
    var data = Amble.app.scene.children[1].getComponent('Manager').save();
    ipc.send('save-respond', data);
});

var menu = Menu.buildFromTemplate([
    {
        label: 'File',
        submenu: [
            {
                label: 'New File',
                accelerator: 'Ctrl+N',
                click: function(){
                    ipc.send('new-file-request');
                }
            },
            {
                label: 'Open',
                accelerator: 'Ctrl+O',
                click: function(){
                    ipc.send('open-request');
                }
            },
            {
                label: 'Save',
                accelerator: 'Ctrl+S',
                click: function(){
                    ipc.send('save');
                }
            },
            {
                label: 'Save As',
                accelerator: 'Ctrl+Shift+S',
                click: function(){
                    ipc.send('save-as');
                }
            },
            {
                type: 'separator'
            }
        ]
    }
]);

Menu.setApplicationMenu(menu);

var app = new Amble.Application({

    resize: true,

    mainCamera: {
        camera: { name: "Amble.Camera", args: {
            position: { name: "Amble.Math.Vector2", args: {x:0 ,y:0}},
            context: "workspace"
        }},
        components: [
            { name: "Camera", args: {}}
        ],
    },

    preload: function(){

        var _components = JSON.parse(fs.readFileSync('../core/components.json', 'utf8')).components;
        for(var i = 0; i < _components.length; i++) {
            var obj = {
                componentData : _components[i],
                transform: { name: "Amble.Transform", args: {
                    position: { name: "Amble.Math.Vector2", args: {x:0 ,y:0}},
                }},
                renderer: { name: "Component.Renderer" , args:{}},
                components: [
                    { name: "Component", args: {} }
                ]
            }
            componentsArray.push(obj);
        }

        var manager = {
            transform: { name: "Amble.Transform", args: {
                position: { name: "Amble.Math.Vector2", args: {x:0 ,y:0}}
            }},
            components: [
                { name: "Manager", args: {}}
            ]
        }

        this.manager = this.scene.instantiate(manager);
        document.title = 'untitled';

    },

    start: function(){

    },

    preupdate: function(){

    },

    postupdate: function(){

    },

    prerender: function(){

    },

    postrender: function(){

    }
});
