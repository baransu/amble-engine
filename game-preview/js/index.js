const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;

//vec2
require('../editor/js/src/engine/vec2.js');

window.onload = function() {
    ipcRenderer.send('game-preview-loaded');
}

ipcRenderer.on('game-preview-start', function(event, data) {

    for(var i = 0; i < data.scriptsList.length; i++) {
        require(data.scriptsList[i].path);
    }

    var app = new Amble.Application({

        resize: true,
        fullscreen: true,
        antyAliasing: false,
        width: 1280,
        height: 720,

        defaultBgColor: '#37474f',

        mainCamera: {
            name: 'MainCamera',
            tag: ['mainCamera'],
            options: {},
            camera: { name: "Amble.Camera", args: {
                position: { name: "Amble.Math.Vector2", args: {x:0 ,y:0}}
            }}
        },

        preload: function(){

            //load images
            for(var i = 0; i < data.imagesList.length; i++) {
                this.loader.load('image', data.imagesList[i].path,  data.imagesList[i].name);
            }

            //load audio

            //load scene (json)
            // this.loader.load('json', scene file path, 'scene.json');
        },

        //instantiate scene objects
        loaded: function(){

            // var scene = JSON.parse(this.loader.getAsset('scene.json'));
            //
            // //instantiate all object
            for(var i = 0; i < data.sceneFile.length; i++) {
                this.scene.instantiate(data.sceneFile[i]);
            }
        },

        //actual start function
        start: function(){
            //show must go on
        },

        preupdate: function(){

        },

        postupdate: function(){

        },

        postrender: function(){

            var layer = this.mainCamera.camera.layer(0);
            layer.ctx.save();
            layer.textAlign('left');
            layer.font('30px Arial');
            layer.fillStyle('white');

            var fps = (Amble.Time.deltaTime).toFixed(3);

            layer.fillText(fps || 0, 0,30);
            layer.ctx.restore();

        }
    });
})
