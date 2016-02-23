window.Loader = (function() {

    var Loader = function Loader() {
      this.queue = [];
      this.cache = [];
      this.successCount = 0;
      this.errorCount = 0;
    };

    Loader.prototype = {

      load: function load(type, path, name, uuid) {
        this.queue.push({
          path: path,
          type: type,
          name: name,
          uuid: uuid
        });
      },

      isDone: function isDone() {
        return (this.queue.length == this.successCount + this.errorCount);
      },

      // get asset by uuid no path
      getAsset: function getAsset(uuid) {
        var asset = this.cache.find(function(a) { return a.uuid == uuid || a.path == uuid});
        console.log(this.cache, uuid)
        if(asset) return asset.data;
        else return undefined;
      },

      loadAll: function loadAll(callback) {

        // reset
        this.successCount = 0;
        this.errorCount = 0;

        if(this.queue.length == 0) callback();

        for(var i = 0; i < this.queue.length; i++) {

          // prevent from loading again the same assets
          var name = this.queue[i].name;
          var uuid = this.queue[i].uuid;
          if(this.cache.find(function(c) { return c.uuid == uuid || c.path == name })) {
            this.successCount++;
            if(this.isDone() && callback) callback();
            continue;
          }

          var that = this;

          switch(this.queue[i].type) {

            /* loading image */
            case 'sprite':

              var imgPath = this.queue[i].path;
              var name = this.queue[i].name;
              var uuid = this.queue[i].uuid;
              var img = new Image();

              img.addEventListener('load', function(){
                that.successCount++;

                if(that.isDone() && callback) {
                  callback();
                }

              }, false);

              img.addEventListener('error', function(){
                that.errorCount++;

                if(that.isDone() && callback) {
                  callback();
                }

              }, false);

              img.src = imgPath;

              this.cache.push({
                  data: img,
                  type: 'image',
                  path: name,
                  uuid: uuid
              });

            break;

            /* loading json file */
            case 'json':
              var jsonPath = this.queue[i].path;
              var name = this.queue[i].name;
              var uuid = this.queue[i].uuid;

              var xobj = new XMLHttpRequest();
              // xobj.overrideMimeType("application/json");
              xobj.open('GET', jsonPath, true);

              xobj.onreadystatechange = function() {

                if (xobj.readyState == 4 && xobj.status == 200) { //success

                  that.cache.push({
                    data: xobj.responseText.toString(),
                    type: 'json',
                    path: name,
                    uuid: uuid
                  });

                  that.successCount++;

                  if(that.isDone() && callback) {
                    callback();
                  }

                } else if(xobj.readyState == 4 && xobj.status == 404){ //err

                  that.cache.push({
                    data: xobj.responseText.toString(),
                    type: 'json',
                    path: name,
                    uuid: uuid
                  });

                  that.errorCount++;
                  if(that.isDone() && callback) {
                    callback();
                  }
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
