var COCOONJS = navigator.isCocoonJS;
window.onload = function() {
    // Cocoon Canvas+ code here
    var app = new Amble.Application({

        resize: true,
        fullscreen: true,
        antyAliasing: false,
        width: 1280,
        height: 720,

        defaultBgColor: '#000',

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
            for(var i = 0; i < imagesList.length; i++) {
                this.loader.load('image', './assets/img/' + imagesList[i].name, imagesList[i].name);
            }

            //load audio

            //load scene (json)
            this.loader.load('json', './assets/json/scene.json', 'scene.json');
        },

        //instantiate scene objects
        loaded: function(){

            var scene = JSON.parse(this.loader.getAsset('scene.json'));

            //instantiate all object
            for(var i = 0; i < scene.length; i++) {
                this.scene.instantiate(scene[i]);
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

        }
    });
}
