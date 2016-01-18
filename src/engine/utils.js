var Utils = (function(){

  var Utils = {

    generateID: function generateID() {
      return Math.floor((1 + Math.random()) * (new Date().getTime()))
        .toString(16)
        .substring(1);
    },

    makeFunction: function makeFunction(obj) {
      if(obj instanceof Object) {
        if(obj.hasOwnProperty('name')) {
          var args = {};
          for(var i in obj.args) {
            args[i] = this.makeFunction(obj.args[i])
          }
          var func =  this.stringToFunction(obj.name)
          return new func(args);
        } else {
          return obj;
        }
      } else {
        return obj;
      }
    },

    getArgs: function getArgs(p) {

      if(p.args.length == 1){
        if(typeof p.args[0] == 'number' || typeof p.args[0] == "string" || typeof p.args[0] == 'boolean') {
          return p.args[0];
        } else if(p.args[0].name == "Array") {
          var a = [];
          for(var i in p.args[0].args) {
            a.push(this.getArgs(p.args[0].args[i]));
          }
          return a;
        } else {
          var func = this.stringToFunction(p.args[0].name)
          var arg = [];
          for(var i in p.args[0].args) {
            arg.push(this.getArgs(p.args[0].args[i]));
          }
          return new func(arg);
        }
      }
    },

    makeClass: function makeClass(obj) {
      var o = {};
      console.log(obj.name)
      if(obj.name) {
        console.log(CLASSES)
        var _class = CLASSES.find(function(c) { return c.name == obj.name});
        console.log(_class)
        if(!_class) {
          AMBLE.debug.error('Cannot find class');
          throw new Error('Cannot find class')
        }
      }

      for(var i in _class) {
        if(i == 'name') continue;
        if(typeof _class[i] === 'function') {
          // console.log(_class[i])
          o[i] = _class[i];
        } else if(i == 'properties') {
          if(obj.properties != undefined || obj.properties == {}) {
            obj.properties = JSON.parse(JSON.stringify(_class[i]));
          }

          for(var x in obj.properties) {
            o[obj.properties[x].name] = this.deStringify(obj.properties[x]);
          }
        }
      }
      return o;
    },

    clone: function clone(obj) {
      var copy = {};
      console.log(obj)
      if (obj instanceof Object || obj instanceof Array) {
        for(var attr in obj) {
          if(attr == 'components') {
            copy[attr] = [];
            for(var i in obj[attr]) {
              // @ifdef EDITOR
              if(obj[attr][i].type == 'editor') {
              // @endif
              // @ifdef SRC
              if(obj[attr][i].type == 'noneditor') {
              // @endif
              // @ifdef PREVIEW
              if(obj[attr][i].type == 'noneditor') {
              // @endif

                copy[attr][i] = {
                  id: obj[attr][i].name,
                  body: this.makeClass(obj[attr][i])
                };

              } else {
                continue;
              }
            }
          } else {
            copy[attr] = this.makeFunction(obj[attr]);
          }
        }
      }
      return copy;
    },

    stringToFunction: function stringToFunction(str) {
      var arr = str.split(".");
      var fn = window || this;
      for (var i = 0, len = arr.length; i < len; i++) {
          fn = fn[arr[i]];
      }

      if (typeof fn !== "function") {
          // Amble.app.debug.error(str + 'function not found');
          throw new Error("function not found");
      }

      return  fn;
    },

    stringify: function stringify(obj) {

      if(obj !== null) {
        if(obj.type && obj.type.name) {
          obj.type = obj.type.name;
        }

        if(obj.value && (Array.isArray(obj.value) || typeof obj.value == 'object')) {
          for(var i in obj.value) {
            obj.value[i] = this.stringify(obj.value[i]);
          }
        }

      }

      return obj;
    },

    deStringify: function deStringify(o) {

      var obj = JSON.parse(JSON.stringify(o));

      if(obj !== null) {
        if(obj.type == 'String' || obj.type == 'Number' || obj.type == 'Boolean') {
          obj = obj.value;
          return obj;

        } else if(obj.type) {

          if(typeof obj.type == 'string') {
            var func = this.stringToFunction(obj.type)
          } else {
            var func = obj.type;
          }

          if(obj.value && (Array.isArray(obj.value) || typeof obj.value == 'object')) {
            for(var i in obj.value) {
              obj.value[i] = this.deStringify(obj.value[i]);
            }
          }

          if(obj.value == null && obj.type == 'Object') {
            return null;
          }

          if(func) {
            if(obj.value != null) {
              return new func(obj.value);
            } else {
              return new func();
            }
          }
        }
      }

      return obj;
    }
  };


  return Utils;

}());
