window.onload = function() {
    // Cocoon Canvas+ code here
    var counter = 0;

    var app = new Application({

        antyAliasing: false,

        prePreload: function() {
            //load scene (json)
            this.preloader.load('json', './assets/json/scene.json', 'scene.json');
        },

        preload: function(){

            document.title = gameTitle || 'untitled';

            console.log(imagesList);
            var href = location.href.substring(0, location.href.lastIndexOf("/"));
            console.log(href);
            //load images
            for(var i = 0; i < imagesList.length; i++) {
              var meta = imagesList[i];
              this.loader.load(meta.type, href + meta.path, meta.name, meta.uuid);
            }

            // load audio
            for(var i = 0; i < audioList.length; i++) {
              var meta = audioList[i];
              this.loader.load(meta.type, href + meta.path, meta.name, meta.uuid);
            }

            //load scene (json)
            this.loader.load('json', './assets/json/scene.json', 'scene.json');

        },

        //instantiate scene objects
        loaded: function(){

          var scene = JSON.parse(this.loader.getAsset('scene.json'));

          //instantiate all object
          for(var i = 0; i < scene.length; i++) {
            if(scene[i].tag != 'mainCamera') {
              this.scene.instantiate(scene[i]);
            }
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

            var layer = this.mainCamera.camera.layer;
            layer.ctx.save();
            layer.textAlign('left');
            layer.font('30px Arial');
            layer.fillStyle('white');

            var fps = (Time.deltaTime).toFixed(3);

            layer.fillText(fps || 0, 0,30);
            layer.ctx.restore();

        }
    });
}
