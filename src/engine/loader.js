var Loader = (function() {

    var Loader = function Loader() {
      this.queue = [];
      this.cache = [];
      this.successCount = 0;
      this.errorCount = 0;
    };

    Loader.prototype = {

      load: function load(type, path, name) {
        this.queue.push({
          path: path,
          type: type,
          name: name
        });
      },

      isDone: function isDone() {
        return (this.queue.length == this.successCount + this.errorCount);
      },

      getAsset: function getAsset(path) {
        var asset = this.cache.find(function(a) { return a.path == path });
        if(asset) return asset.data;
        else return undefined;
      },

      loadAll: function loadAll(callback) {

        if(this.queue.length == 0) callback();

        for(var i = 0; i < this.queue.length; i++) {

          var that = this;

          switch(this.queue[i].type) {
            /* loading image */
            case 'img':
            case 'image':

              var imgPath = this.queue[i].path;
              var name = this.queue[i].name;

              var img = new Image();

              img.addEventListener('load', function(){
                that.successCount++;
                if(that.isDone()) callback();
              }, false);

              img.addEventListener('error', function(){
                that.errorCount++;
                if(that.isDone()) callback();
              }, false);

              img.src = imgPath;

              this.cache.push({
                  data: img,
                  type: 'image',
                  path: name
              });

            break;
            /* loading json file */
            case 'json':
              var jsonPath = this.queue[i].path;
              var name = this.queue[i].name;

              var xobj = new XMLHttpRequest();
              // xobj.overrideMimeType("application/json");
              xobj.open('GET', jsonPath, true);

              xobj.onreadystatechange = function() {

                if (xobj.readyState == 4 && xobj.status == 200) { //success

                  that.cache.push({
                    data: xobj.responseText.toString(),
                    type: 'json',
                    path: name
                  });

                  that.successCount++;

                  if(that.isDone()) callback();

                } else if(xobj.readyState == 4 && xobj.status == 404){ //err

                  that.cache.push({
                    data: xobj.responseText.toString(),
                    type: 'json',
                    path: name
                  });

                  that.errorCount++;
                  if(that.isDone()) callback();

                }
              }

              xobj.send(null);

            break;
          }
        }
      },

    }

    return Loader;

}());
