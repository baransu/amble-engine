const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;

window.onload = function() {
  ipcRenderer.send('game-preview-loaded');
}

ipcRenderer.on('game-preview-start', function(event, data) {

  var app = new Application({

    // resize: true,
    fullscreen: true,
    antyAliasing: true,

    preload: function(){

      console.log(data.assets);
      //load images
      for (var i = 0; i < data.assets.length; i++) {
        var meta = data.assets[i];
        if(meta.type == 'script') {
          require(meta.path);
          // connect script with uuid
        } else {
          this.loader.load(meta.type, meta.path, meta.name, meta.uuid);
        }
      }

      //load scene (json)
      // this.loader.load('json', scene file path, 'scene.json');
    },

    //instantiate scene objects
    loaded: function(){
      //instantiate all object
      for(var i = 0; i < data.sceneFile.length; i++) {
        if(data.sceneFile[i].tag == 'mainCamera') {
          this.mainCamera = this.scene.instantiate(data.sceneFile[i]);
        } else {
          this.scene.instantiate(data.sceneFile[i]);
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

      // var layer = this.mainCamera.camera.layer;
      // layer.ctx.save();
      // layer.textAlign('left');
      // layer.font('30px Arial');
      // layer.fillStyle('white');
      //
      // var fps = (Time.deltaTime).toFixed(3);
      //
      // layer.fillText(fps || 0, 0,30);
      // layer.ctx.restore();

    }
  });
})
