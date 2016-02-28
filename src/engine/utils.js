const uuid = require('uuid')

window.Utils = (function(){

  var Utils = {

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

    makeClass: function(obj) {
      var o = {};

      if(obj.name) {
        var _class =  CLASSES.find(function(c) { return c.name == obj.name});
        if(!_class) {
          Debug.error('Cannot find class');
          throw new Error('Cannot find class')
        }
      } else {
        Debug.error('Cannot find class');
        throw new Error('Cannot find class')
      }

      for(var i in _class) {
        if(i == 'name') continue;
        if(typeof _class[i] === 'function') {
          o[i] = _class[i];
        } else if(i == 'properties') {
          // console.log(obj[i])
          if(typeof obj[i] === 'undefined' || obj[i].length == 0) {
            obj[i] = JSON.parse(JSON.stringify(_class[i]));
          }

          for(var x in obj[i]) {
            o[obj[i][x].name] = this.deStringify(obj[i][x]);
          }
        }
      }

      return o;
    },

    clone: function clone(obj) {
      var copy = {};
      if (obj instanceof Object || obj instanceof Array) {
        for(var attr in obj) {

          // @ifdef GAME
          if(attr == 'renderer' && (obj[attr].name == 'EngineRenderer' || obj[attr].name == 'CameraRenderer')) continue;
          // @endif

          if(attr == 'components') {
            copy[attr] = [];
            for(var i in obj[attr]) {
              // @ifdef EDITOR
              if(obj[attr][i].type == 'editor') {
              // @endif
              // @ifdef GAME
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
        console.log(str);
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

          if(obj.type == 'Array') {
            var array = [];
            for(var i = 0; i < obj.value.length; i++) {
              array[i] = this.deStringify(obj.value[i]);
            }
            console.log(array);
            return array;

          } else if(obj.value && (Array.isArray(obj.value) || typeof obj.value == 'object')) {
            console.log('obj', obj.value);
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
