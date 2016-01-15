var Flow = require('../core/flow.js');
window.Component = require('./js/scripts/component.js');
window.Camera = require('./js/scripts/camera.js')
window.Manager = require('./js/scripts/manager.js')

const electron = require('electron');
const remote = electron.remote;
const Menu = remote.Menu;
const ipcRenderer = electron.ipcRenderer;

var fs = require('fs');

var componentsFunctions = Flow.ComponentsFunction;
var componentsArray = [];

ipcRenderer.on('open-respond', function(data){
    console.log('open');
    Amble.app.scene.children[1].getComponent('Manager').load(data);
});

ipcRenderer.on('new-file-respond',function(){
    Amble.app.scene.children[1].getComponent('Manager').load();
});

ipcRenderer.on('save-request', function(){
    var data = Amble.app.scene.children[1].getComponent('Manager').save();
    ipcRenderer.send('save-respond', data);
});

var menu = Menu.buildFromTemplate([
    {
        label: 'File',
        submenu: [
            {
                label: 'New File',
                accelerator: 'Ctrl+N',
                click: function(){
                    ipcRenderer.send('new-file-request');
                }
            },
            {
                label: 'Open',
                accelerator: 'Ctrl+O',
                click: function(){
                    console.log('open');
                    ipcRenderer.send('open-request');
                }
            },
            {
                label: 'Save',
                accelerator: 'Ctrl+S',
                click: function(){
                    ipcRenderer.send('save');
                }
            },
            {
                label: 'Save As',
                accelerator: 'Ctrl+Shift+S',
                click: function(){
                    ipcRenderer.send('save-as');
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

        var c = fs.readFileSync('./core/components.json', 'utf8');
        var _components = JSON.parse(c).components;
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
