(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
window.Vec2 = (function(){

  var Vec2 = function Vec2(x, y) {
    if(typeof x == 'object') {
      this.x = x['x'] || 0;
      this.y = x['y'] || 0;
    } else if(Array.isArray(x)) {
      this.x = x[0];
      this.y = x[1];
    } else {
      this.x = x || 0;
      this.y = y || 0;
    }
  };

  Vec2.prototype.copy = function copy(vector) {
    this.x = vector.x;
    this.y = vector.y;
    return this;
  };

  Vec2.prototype.add = function add(vector) {
    this.x += vector.x;
    this.y += vector.y;
    return this;
  };

  Vec2.prototype.sub = function sub(vector) {
    this.x -= vector.x;
    this.y -= vector.y;
    return this;
  };

  Vec2.prototype.dot = function dot(vector) {
    return this.x * vector.x + this.y * vector.y;
  };

  Vec2.prototype.length2 = function length2() {
    return this.dot(this);
  };

  Vec2.prototype.length = function length() {
    return Math.sqrt(this.length2());
  };

  Vec2.prototype.normalize = function normalize() {
    var l = this.length();
    if(l > 0) {
      this.x = this.x / l;
      this.y = this.y / l;
    }
    return this;
  };

  return Vec2;

}());

window.Vec3 = (function() {

  var Vec3 = function Vec3(x, y, z) {
    if(typeof x == 'object') {
      this.x = x['x'] || 0;
      this.y = x['y'] || 0;
      this.z = x['z'] || 0;
    } else if(Array.isArray(x)) {
      this.x = x[0];
      this.y = x[1];
      this.z = x[2];
    } else {
      this.x = x || 0;
      this.y = y || 0;
      this.z = z || 0;
    }
  };

  Vec3.prototype.copy = function copy(vector) {
    this.x = vector.x;
    this.y = vector.y;
    this.z = vector.z;
    return this;
  };

  Vec3.prototype.add = function add(vector) {
    this.x += vector.x;
    this.y += vector.y;
    this.z += vector.z;
    return this;
  };

  Vec3.prototype.sub = function sub(vector) {
    this.x -= vector.x;
    this.y -= vector.y;
    this.z -= vector.z;
    return this;
  };

  Vec3.prototype.dot = function dot(vector) {
    return this.x * vector.x + this.y * vector.y + this.z * vector.z;
  };

  Vec3.prototype.length2 = function length2() {
    return this.dot(this);
  };

  Vec3.prototype.length = function length() {
    return Math.sqrt(this.length2());
  };

  Vec3.prototype.normalize = function normalize() {
    var l = this.length();
    if(l > 0) {
      this.x = this.x / l;
      this.y = this.y / l;
      this.z = this.z / l;
    }
    return this;
  };

  return Vec3;

}());

window.Mathf = (function() {

    var Mathf = {

      TO_RADIANS: Math.PI/180,

    }

    return Mathf;

}());

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
          AMBLE.debug.error('Cannot find class');
          throw new Error('Cannot find class')
        }
      } else {
        AMBLE.debug.error('Cannot find class');
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
          if(attr == 'renderer' && (obj[attr].name == 'EngineRenderer' || obj[attr].name == 'CameraRenderer')) continue;

          if(attr == 'components') {
            copy[attr] = [];
            for(var i in obj[attr]) {
              if(obj[attr][i].type == 'noneditor') {

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

window.Time = (function() {

    var Time = {
      deltaTime: 0,
      _lastTime: 0
    }

    return Time;

}());

window.Actor = (function() {

  var Actor = function Actor(args) {
    this.components = [];
  };

  Actor.prototype = {

    getComponent: function getComponent(componentName) {
      var component = this.components.find(function(c) { return c.id == componentName });
      return component.body;
    }

  };

  return Actor;

}());

window.AnimationRenderer = (function() {

  var AnimationRenderer = function AnimationRenderer(args) {
    this.sprite = args.sprite;
    this.layer = args.layer || 0;
    this.updatesPerFrame = args.updatesPerFrame || 1;
    this.frames = args.frames || 1;
    this.play = args.play || false;
    this.loop = args.loop || true;

    this._currentFrame = 0;
    this._updates = 0;
    this._sprite = null;
    this._frameTimer = 0;
    this.size = new Vec2();

  };

  AnimationRenderer.prototype = {

    render: function render(self, camera) {

      var layer = camera.camera.layer;

      layer.ctx.save();

      if(this._sprite !== null ) {

        if(this._sprite.src != this.sprite && AMBLE.loader.isDone()) {
            this._sprite = AMBLE.loader.getAsset(this.sprite);
            if(!this._sprite) return;
        }

        var width = (this._sprite.width/this.frames) | 0;
        var height = this._sprite.height;

        this.size.x = width * self.transform.scale.x;
        this.size.y = height * self.transform.scale.y;

        var x = (self.transform.position.x - camera.camera.view.x)// | 0 <- round for optymalization
        var y = (self.transform.position.y - camera.camera.view.y)// | 0 <- round for optymalization

        layer.ctx.translate(x, y);

        if(self.transform.scale.x != 1 || self.transform.scale.y != 0) {
            layer.ctx.scale(self.transform.scale.x, self.transform.scale.y);
        }

        if(self.transform.rotation != 0) {
            layer.ctx.rotate(-self.transform.rotation * Mathf.TO_RADIANS);
        }

        if(this._sprite.src) {
          layer.ctx.drawImage(
            this._sprite,
            this._currentFrame * width,
            0,
            width,
            height,
            -width/2 | 0,
            -height/2 | 0,
            width,
            height
          );

        }

      } else {
        this._sprite = AMBLE.loader.getAsset(this.sprite);
      }

      layer.ctx.restore();

      if(this.play) {
        this._updates++;
        if(this._updates > this.updatesPerFrame) {
          this._updates = 0;
          if(this._currentFrame < this.frames - 1) this._currentFrame++;
          else if(this.loop) this._currentFrame = 0;
        }
      }
    }
  };

  return AnimationRenderer;

}());

window.Debug = (function() {

  var Debug = function Debug() {
  };

  Debug.prototype = {

    log: function log(log) {



      console.log(log)

    },

    error: function error(error) {



      console.log(error)

    },

  };

  return Debug;

}());



window.Input = (function(){

  var Input = {

    isKeyPressed: function isKeyPressed(keycode) {
      return this._keyValues[keycode];
    },

    isMousePressed: function isKeyPressed(keycode) {
      return this._mouseValues[keycode];
    },

    _mouseValues: [],

    _keyValues: [],

    mousePosition: new Vec2(),

    offset: new Vec2(),

    wheelDelta: new Vec3(),

    isShiftPressed: false,

    isCtrlPressed: false,
  }

  Input._eventFunctions = {

    keydown: function keydown(e) {

      Input.isShiftPressed = e.shiftKey;
      Input.isCtrlPressed = e.ctrlKey;
      Input._keyValues[e.which] = true;

      AMBLE.scene.onkeydown(e);
    },

    keyup: function keyup(e) {
      Input._keyValues[e.which] = false;

      AMBLE.scene.onkeyup(e);
    },

    mousedown: function mousedown(e) {

      Input._mouseValues[e.which] = true;

      AMBLE.scene.onmousedown(e);
    },

    mouseup: function mouseup(e) {
      Input._mouseValues[e.which] = false;

      AMBLE.scene.onmouseup(e);
    },

    mousemove: function mousemove(e) {
      var offsetLeft = AMBLE.mainCamera.camera.context.offsetLeft;
      var offsetTop = AMBLE.mainCamera.camera.context.offsetTop;

      Input.offset.x = offsetLeft;
      Input.offset.y = offsetTop;

      Input.mousePosition.x = e.clientX - offsetLeft;
      Input.mousePosition.y = e.clientY - offsetTop;

      AMBLE.scene.onmousemove(e);
    },

    wheel: function wheel(e) {
      Input.wheelDelta.x = e.deltaX;
      Input.wheelDelta.y = e.deltaY;
      Input.wheelDelta.z = e.deltaZ;

      AMBLE.scene.onmousewheel(e);
    },

    contextmenu: function contextmenu(e) {
      e.preventDefault();
      AMBLE.scene.oncontextmenu(e);
    },

    touchstart: function touchstart(e) {
      e.preventDefault();
      AMBLE.scene.ontouchstart(e);
    },

    touchend: function touchend(e) {
      e.preventDefault();
      AMBLE.scene.ontouchend(e);
    },

    touchmove: function touchmove(e) {
      e.preventDefault();
      AMBLE.scene.ontouchmove(e);
    }
  }

  Input._setListeners = function _setListeners() {

    if(AMBLE.mainCamera) {
      var element = AMBLE.mainCamera.camera.context;
      document.addEventListener('keydown', Input._eventFunctions.keydown, false);
      document.addEventListener('keyup', Input._eventFunctions.keyup, false);
      element.addEventListener('mousedown', Input._eventFunctions.mousedown, false);
      element.addEventListener('mouseup', Input._eventFunctions.mouseup, false);
      document.addEventListener('mousemove', Input._eventFunctions.mousemove, false);
      element.addEventListener("wheel", Input._eventFunctions.wheel, false);
      element.addEventListener("contextmenu", Input._eventFunctions.contextmenu, false);

      //touch start
      element.addEventListener("touchstart", Input._eventFunctions.touchstart, false);
      //touch end
      element.addEventListener("touchend", Input._eventFunctions.touchend, false);
      //touch move
      element.addEventListener("touchmove", Input._eventFunctions.touchmove, false);

    }
  }

  Input._removeListeners = function _removeListeners() {

    if(AMBLE.mainCamera) {
      var element = AMBLE.mainCamera.camera.context;
      if (document.removeEventListener) {

        document.removeEventListener('keydown', Input._eventFunctions.keydown, false);
        document.removeEventListener('keyup', Input._eventFunctions.keyup, false);
        element.removeEventListener('mousedown', Input._eventFunctions.mousedown, false);
        element.removeEventListener('mouseup', Input._eventFunctions.mouseup, false);
        document.removeEventListener('mousemove', Input._eventFunctions.mousemove, false);
        element.removeEventListener("wheel", Input._eventFunctions.wheel, false);
        element.removeEventListener("contextmenu", Input._eventFunctions.contextmenu, false);

        //touch start
        element.removeEventListener("touchstart", Input._eventFunctions.touchstart, false);
        //touch end
        element.removeEventListener("touchend", Input._eventFunctions.touchend, false);
        //touch move
        element.removeEventListener("touchmove", Input._eventFunctions.touchmove, false);


      } else if (document.detachEvent) {

        document.detachEvent('keydown', Input._eventFunctions.keydown, false);
        document.detachEvent('keyup', Input._eventFunctions.keyup, false);
        element.detachEvent('mousedown', Input._eventFunctions.mousedown, false);
        element.detachEvent('mouseup', Input._eventFunctions.mouseup, false);
        document.detachEvent('mousemove', Input._eventFunctions.mousemove, false);
        element.detachEvent("wheel", Input._eventFunctions.wheel, false);
        element.detachEvent("contextmenu", Input._eventFunctions.contextmenu, false);

        //touch start
        element.detachEvent("touchstart", Input._eventFunctions.touchstart, false);
        //touch end
        element.detachEvent("touchend", Input._eventFunctions.touchend, false);
        //touch move
        element.detachEvent("touchmove", Input._eventFunctions.touchmove, false);

      }
    }
  }

  return Input;

}());

window.Layer = (function() {

    var Layer = function Layer(camera) {

      this.canvas = document.createElement('canvas');
      this.canvas.width = camera.size.x;
      this.canvas.height = camera.size.y;
      this.canvas.style.position = 'absolute';
      this.ctx = this.canvas.getContext('2d');

      this.ctx.imageSmoothingEnabled = AMBLE.antyAliasing;
      this.ctx.mozImageSmoothingEnabled = AMBLE.antyAliasing;
      this.ctx.msImageSmoothingEnabled = AMBLE.antyAliasing;

      //scale to fullscreen
      this.resize = function() {
        var scaleX = window.innerWidth / this.canvas.width;
        var scaleY = window.innerHeight / this.canvas.height;

        var scaleToFit = Math.min(scaleX, scaleY);
        var scaleToCover = Math.max(scaleX, scaleY);

        var w = window.innerWidth - (this.canvas.width * scaleToFit);
        var h = window.innerHeight - (this.canvas.height * scaleToFit);

        this.canvas.style.top = (h/2) + 'px';
        this.canvas.style.left = (w/2) + 'px';

        this.canvas.style.transformOrigin = "0 0"; //scale from top left
        this.canvas.style.transform = "scale(" + scaleToFit + ")";
      }

      this.resize();

    };

    Layer.prototype = {

      appendTo: function appendTo(element) {
        this.parent = element;
        element.appendChild(this.canvas);
        return this;
      },

      remove: function remove() {
        this.parent.removeChild(this.canvas);
        return this;
      },

      clear: function clear(color) {

        this.ctx.save();
        this.ctx.setTransform(1,0,0,1,0,0);
        if (color && color != 'transparent') {
            this.ctx.fillStyle = color;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        } else {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }

        this.ctx.restore();
        return this;
      },

      fillStyle: function fillStyle(color) {
        this.ctx.fillStyle = color;
        return this;
      },

      fillRect: function fillRect(x, y, width, height) {
        this.ctx.fillRect(x, y, width, height);
        return this;
      },

      strokeStyle: function strokeStyle(color) {
        this.ctx.strokeStyle = color;
        return this;
      },

      strokeRect: function strokeRect(x, y, width, height) {
        this.ctx.strokeRect(x, y, width, height);
        return this;
      },

      stroke: function stroke() {
        this.ctx.stroke();
        return this;
      },

      lineWidth: function lineWidth(width) {
        this.ctx.lineWidth = width;
        return this;
      },

      font: function font(font) {
        this.ctx.font = font;
        return this;
      },

      textAlign: function textAlign(align) {
        this.ctx.textAlign = align;
        return this;
      },

      fillText: function fillText(text, x, y) {
        this.ctx.fillText(text, x, y);
        return this;
      },

      strokeText: function strokeText(text, x, y) {
        this.ctx.strokeText(text, x, y);
        return this;
      }

      // TODO: more canvas methods

    };

    return Layer;

}());

window.Loader = (function() {

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

window.MainCamera = (function() {

    var MainCamera = function MainCamera(args) {
      this.context = document.getElementById(args.context) || document.body;

      this.size = args.size || new Vec2(1280, 720);

      this.bgColor = args.bgColor || '#37474f';

      this.view = new Vec2();
      this.scale = args.scale || 1;

      this.layer = new Layer(this).appendTo(this.context);
    };

    MainCamera.prototype = {

      update: function update(self) {
        this.view = new Vec2(self.transform.position.x - this.size.x/2, self.transform.position.y - this.size.y/2);
        return this;
      }

    };

    return MainCamera;

}());

window.RectRenderer = (function() {

  var RectRenderer = function RectRenderer(args) {
    this.color = args.color || '#e91e63';
    this.layer = args.layer || 0;
    this.size = args.size || new Vec2(100, 100);

  };

  RectRenderer.prototype = {

    render: function render(self, camera) {

      var layer = camera.camera.layer;

      var width = this.size.x;
      var height = this.size.y;
      var x = self.transform.position.x - camera.camera.view.x;
      var y = self.transform.position.y - camera.camera.view.y;

      layer.ctx.save();

      // move origin to object origin
      layer.ctx.translate(x, y);

      //scale
      layer.ctx.scale(self.transform.scale.x, self.transform.scale.y);

      // rotation in radians
      layer.ctx.rotate(-self.transform.rotation * Mathf.TO_RADIANS);

      // draw
      layer.fillStyle(this.color)
        .fillRect(-width/2, -height/2, width, height);


      layer.ctx.restore();
    }

  };

  return RectRenderer

}());

window.SpriteRenderer = (function() {

  var SpriteRenderer = function SpriteRenderer(args) {

    this.sprite = args.sprite; // || TODO: add placeholder graphics
    this.layer = args.layer || 0;
    this._sprite = null
    this.size = new Vec2();

  };

  SpriteRenderer.prototype = {

    render: function render(self, camera) {

      var layer = camera.camera.layer;

      layer.ctx.save();

      if(this._sprite) {
        if(this._sprite.src != this.sprite && AMBLE.loader.isDone()) {
          this._sprite = AMBLE.loader.getAsset(this.sprite);
          if(!this._sprite) return;
        }

        var width = this.size.x = this._sprite.width;
        var height = this.size.y = this._sprite.height;
        var x = self.transform.position.x - camera.camera.view.x;
        var y = self.transform.position.y - camera.camera.view.y;

        layer.ctx.translate(x, y);

        if(self.transform.scale.x != 1 || self.transform.scale.y != 1)
          layer.ctx.scale(self.transform.scale.x, self.transform.scale.y);

        if(self.transform.rotation != 0)
          layer.ctx.rotate(-self.transform.rotation * Mathf.TO_RADIANS);

        if(this._sprite.src) {

          layer.ctx.drawImage(this._sprite, -width/2, -height/2);

        }

      } else {

        this._sprite = AMBLE.loader.getAsset(this.sprite);
      }

      layer.ctx.restore();
    }
  };

  return SpriteRenderer;

}());

window.Transform = (function() {

    var Transform = function Transform(args) {
      this.position = args.position || new Vec2();
      this.scale = args.scale || new Vec2(1, 1);
      this.rotation = args.rotation || 0;

    };

    return Transform;

}());

window.Scene = (function() {

  var Scene = function Scene() {
    this.children = [];
    this.started = false;
  };

  Scene.prototype = {


    getActorByName: function getActorByName(name) {
      return this.children.find(function(c) {return c.name == name })
    },

    getActorByID: function getActorByID(id) {
      return this.children.find(function(c) { return c.sceneID == id });
    },

    instantiate: function instantiate(obj) {

      var actor = new Actor();
      var clone = Utils.clone(obj);
      for(var i in clone) {
        actor[i] = clone[i];
      }

      actor.prefab = obj;

      // console.log(actor);
      return this._add(actor);
    },

    _add: function _add(object) {

      var sceneID = uuid.v1();
      object.sceneID = sceneID;

      if(object.components !== undefined) {
        for(var i = 0; i < object.components.length; i++) {
          var _component = object.components[i].body;
          if(typeof _component.awake == 'function'){
            _component.awake(object);
          }
        }
      }

      if(this.started && object.components !== undefined) {
        for(var i = 0; i < object.components.length; i++) {
          var _component = object.components[i].body;
          if(typeof _component.start == 'function'){
            _component.start(object);
          }
        }
      }

      this.children.push(object);

      this.sort();


      return object;
    },

    //sort by layer
    sort: function sort() {
      this.children.sort(function(a, b) {
        if(!a.renderer || !b.renderer) {
          return 0;
        } else {
          return a.renderer.layer - b.renderer.layer;
        }
      });
    },

    remove: function remove(object) {
      var index = this.children.indexOf(object);
      if(index != -1) {
        this.children.splice(index, 1);
      }
    },

    start: function start() {
        for(var i = 0; i < this.children.length; i++) {
        for(var j = 0; j < this.children[i].components.length; j++) {
          var _component = this.children[i].components[j].body;
          if(typeof _component.start == 'function'){
            _component.start(this.children[i]);
          }
        }
      }
      this.started = true;
    },

    update: function update() {
      for(var i = 0; i < this.children.length; i++) {
        for(var j = 0; j < this.children[i].components.length; j++){
          var _component = this.children[i].components[j].body;
          if(typeof _component.update == 'function'){
            _component.update(this.children[i]);
          }
        }
      }
    },

    render: function render(camera) {
      for(var i = 0; i < this.children.length; i++){
        if(this.children[i].renderer && typeof this.children[i].renderer.render === 'function') {
          this.children[i].renderer.render(this.children[i], camera)
        }
      }
    },

    onmousewheel: function onmousewheel(e) {
      for(var i = 0; i < this.children.length; i++){
        for(var j = 0; j < this.children[i].components.length; j++){
          var _component = this.children[i].components[j].body;
          if(typeof _component.onmousewheel == 'function'){
            _component.onmousewheel(this.children[i], e);
          }
        }
      }
    },

    onmousedown: function onmousedown(e) {
      for(var i = 0; i < this.children.length; i++){
        for(var j = 0; j < this.children[i].components.length; j++){
          var _component = this.children[i].components[j].body;
          if(typeof _component.onmousedown == 'function'){
            _component.onmousedown(this.children[i], e);
          }
        }
      }
    },

    onmousemove: function onmousemove(e) {
      for(var i = 0; i < this.children.length; i++){
        for(var j = 0; j < this.children[i].components.length; j++){
          var _component = this.children[i].components[j].body;
          if(typeof _component.onmousemove == 'function'){
            _component.onmousemove(this.children[i], e);
          }
        }
      }
    },

    onmouseup: function onmouseup(e) {
      for(var i = 0; i < this.children.length; i++){
        for(var j = 0; j < this.children[i].components.length; j++){
          var _component = this.children[i].components[j].body;
          if(typeof _component.onmouseup == 'function'){
            _component.onmouseup(this.children[i], e);
          }
        }
      }
    },

    onkeydown: function onkeydown(e) {
      for(var i = 0; i < this.children.length; i++){
        for(var j = 0; j < this.children[i].components.length; j++){
          var _component = this.children[i].components[j].body;
          if(typeof _component.onkeydown == 'function'){
            _component.onkeydown(this.children[i], e);
          }
        }
      }
    },

    onkeyup: function onkeyup(e) {
      for(var i = 0; i < this.children.length; i++){
        for(var j = 0; j < this.children[i].components.length; j++){
          var _component = this.children[i].components[j].body;
          if(typeof _component.onkeyup == 'function'){
            _component.onkeyup(this.children[i], e);
          }
        }
      }
    },

    oncontextmenu: function oncontextmenu(e) {
      for(var i = 0; i < this.children.length; i++){
        for(var j = 0; j < this.children[i].components.length; j++){
          var _component = this.children[i].components[j].body;
          if(typeof _component.oncontextmenu == 'function'){
            _component.oncontextmenu(this.children[i], e);
          }
        }
      }
    },

    ontouchstart: function ontouchstart(e) {
      for(var i = 0; i < this.children.length; i++) {
        for(var j = 0; j < this.children[i].components.length; j++) {
          var _component = this.children[i].components[j].body;
          if(typeof _component.ontouchstart == 'function'){
            _component.ontouchstart(this.children[i], e);
          }
        }
      }
    },

    ontouchend: function ontouchend(e) {
      for(var i = 0; i < this.children.length; i++){
        for(var j = 0; j < this.children[i].components.length; j++){
          var _component = this.children[i].components[j].body;
          if(typeof _component.ontouchend == 'function'){
            _component.ontouchend(this.children[i], e);
          }
        }
      }
    },

    ontouchmove: function ontouchmove(e) {
      for(var i = 0; i < this.children.length; i++){
        for(var j = 0; j < this.children[i].components.length; j++){
          var _component = this.children[i].components[j].body;
          if(typeof _component.ontouchmove == 'function'){
            _component.ontouchmove(this.children[i], e);
          }
        }
      }
    }

  };

  return Scene;

}());

window.Application  = (function() {

  var Application = function Application(args) {

    var that = AMBLE = this;

    this.debug = new Debug();
    this.imgList = [];

    this.antyAliasing = typeof args['antyAliasing'] === 'boolean' ? args['antyAliasing'] : false;

    //move to camera
    this.fullscreen = args['fullscreen'] || false;

    this.scene = new Scene();

    if(args.mainCamera) {
      this.mainCamera = this.scene.instantiate(args.mainCamera);
    }

    window.addEventListener('resize', function() {

      if(AMBLE.mainCamera) {

        AMBLE.mainCamera.camera.layer.resize();
      }

    });

    var gameLoopFunctionsList = ['prePreload', 'preload', 'loaded', 'start', 'preupdate', 'postupdate', 'prerender', 'postrender'];
    for(var i in gameLoopFunctionsList){
        this[gameLoopFunctionsList[i]] = typeof args[gameLoopFunctionsList[i]] === 'function' ? args[gameLoopFunctionsList[i]] : function(){};
    }

    this.paused = false;


    this.update = function update(){
      this.mainCamera.camera.update(this.mainCamera)
      this.scene.update();
    };

    this.render = function render(){
      var camera = this.mainCamera.camera;

      camera.layer.clear(this.mainCamera.camera.bgColor);


      this.scene.render(this.mainCamera);

    };

    this.preloader = new Loader();
    this.loader = new Loader();

    var loadingTimer = 0;
    var currentLoadingText = 0;

    var colors = [
        "#8e24aa",
        "#5e35b1",
        "#3949ab",
        "#1e88e5",
        "#039be5",
        "#00acc1",
        "#00897b",
        "#43a047",
        "#7cb342",
        "#c0ca33",
        "#fbc02d",
        "#ff6f00",
        "#e53935",
        "#e91e63"
    ];

    this.prePreload();
    this.preloader.loadAll(function() {

      var scene = JSON.parse(that.preloader.getAsset('scene.json'));
      for(var i = 0; i < scene.length; i++) {
        if(scene[i].tag == 'mainCamera') {
          that.mainCamera = that.scene.instantiate(scene[i]);
          break;
        }
      }

      var color = colors[Math.floor(Math.random() * colors.length - 1)];

      that.loadingInterval = setInterval(function() {

        if(that.mainCamera) {
          var width = that.mainCamera.camera.size.x;
          var height = that.mainCamera.camera.size.y;

          var x = (width - width/4) * ((that.loader.successCount + that.loader.errorCount)/that.loader.queue.length);
          var layer = that.mainCamera.camera.layer;
          layer.ctx.save();
          var loading = [
              "   loading.  ",
              "   loading.. ",
              "   loading...",
          ];


          layer.clear('black')
              .fillStyle(color)
              .strokeStyle('white')
              .fillRect(width/8, height/2 - height/16, x, height/8)
              .strokeRect(width/8, height/2 - height/16, (width - width/4), height/8);

          layer.ctx.shadowColor = "white";
          layer.ctx.shadowBlur = 20;

          layer.fillStyle('white');
          layer.ctx.textAlign = 'center';
          layer.ctx.font = "25px Arial";
          var text = parseInt(((that.loader.successCount + that.loader.errorCount)/that.loader.queue.length) * 100) + "%"
          layer.ctx.fillText(text, width/2, height/2 + 7)

          layer.ctx.font = "20px Arial";
          text = loading[currentLoadingText];
          layer.ctx.fillText(text, width/2, 2*height/3 + 10)

          loadingTimer += 1/60;
          if(loadingTimer > 1) {
            loadingTimer = 0;
            currentLoadingText++;
            if(currentLoadingText == loading.length) currentLoadingText = 0;
          }
          layer.ctx.restore();
        }
      }, 1000/60);

      that.preload();
      that.loader.loadAll(function() {

        var delay = 0;
        delay = 1000;

        setTimeout(function(){
          clearInterval(that.loadingInterval);
          Input._setListeners();

          that.scene.start();
          that.loaded();

          that.start();
          Time._lastTime = Date.now()
          gameLoop();

        }, delay);
      });
    });

    function gameLoop(){
      if(!that.paused) {

        var now = Date.now();
        Time.deltaTime = (now - Time._lastTime) / 1000.0;

        if(that.mainCamera) {
          that.preupdate();
          that.update();
          that.postupdate();
          that.render();
          that.postrender();
        }

        Time._lastTime = now;
        requestAnimationFrame(gameLoop)
      }
    }
  };

  return Application;

}());

window.CLASSES = [];
window.Class = (function() {

  var Class = function Class(body) {

    if(!body) {
        // Amble.app.debug.error('Wrong class code!')
        throw new Error('Wrong class code!');
    } else if(typeof body !== 'object') {
        // Amble.app.debug.error('Class must be an object!')
        throw new Error('Class must be an object!');
    } else if(!body.name) {
        // Amble.app.debug.error('Class must have a name!')
        throw new Error('Class must have a name!');
    }

    var _class = {
      name: body.name,
      _options: body._options,
      properties: [],
    }

    this.validate = function validate(obj, name) {
      if(typeof obj == 'string' || typeof obj == 'number' || typeof obj == 'boolean') {
        var value = obj;
        obj = {
          name: name,
          value: value,
          type: value.constructor
        };
      } else if(obj == null) {
        obj = {
          name: name,
          value: null,
          type: Object
        };
      } else {

        if(typeof obj.value === 'undefined' && typeof obj.type === 'undefined') {
          var val = obj;
          obj = {
            value: val,
            type: val.constructor
          };
        } else if( typeof obj.value === 'undefined') {
          obj.value == null;
        }

        if(typeof obj.type === 'undefined') {
          obj.type = obj.value.constructor;
        }


        if(typeof obj.name === 'undefined') {
          obj.name = name;
        }

      }

      return obj;
    };

    for(var i in body.properties) {
      body.properties[i] = this.validate(body.properties[i], i)
      body.properties[i] = Utils.stringify(body.properties[i]);
    }

    for(var i in body.properties) {
      _class.properties.push(body.properties[i])
    }

    // TODO: extend option
    for(var i in body) {
      if(i != 'name' && i != 'properties' && typeof body[i] === 'function') {
        _class[i] = body[i];
      }
    }

    var cl = CLASSES.find( function(c) { return c.name == _class.name });
    if(cl) {
      var index = CLASSES.indexOf(cl);
      CLASSES.splice(index, 1);
    }

    CLASSES.push(_class);

  };

  return Class;

}());

},{"uuid":3}],2:[function(require,module,exports){
(function (global){

var rng;

if (global.crypto && crypto.getRandomValues) {
  // WHATWG crypto-based RNG - http://wiki.whatwg.org/wiki/Crypto
  // Moderately fast, high quality
  var _rnds8 = new Uint8Array(16);
  rng = function whatwgRNG() {
    crypto.getRandomValues(_rnds8);
    return _rnds8;
  };
}

if (!rng) {
  // Math.random()-based (RNG)
  //
  // If all else fails, use Math.random().  It's fast, but is of unspecified
  // quality.
  var  _rnds = new Array(16);
  rng = function() {
    for (var i = 0, r; i < 16; i++) {
      if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
      _rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
    }

    return _rnds;
  };
}

module.exports = rng;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],3:[function(require,module,exports){
//     uuid.js
//
//     Copyright (c) 2010-2012 Robert Kieffer
//     MIT License - http://opensource.org/licenses/mit-license.php

// Unique ID creation requires a high quality random # generator.  We feature
// detect to determine the best RNG source, normalizing to a function that
// returns 128-bits of randomness, since that's what's usually required
var _rng = require('./rng');

// Maps for number <-> hex string conversion
var _byteToHex = [];
var _hexToByte = {};
for (var i = 0; i < 256; i++) {
  _byteToHex[i] = (i + 0x100).toString(16).substr(1);
  _hexToByte[_byteToHex[i]] = i;
}

// **`parse()` - Parse a UUID into it's component bytes**
function parse(s, buf, offset) {
  var i = (buf && offset) || 0, ii = 0;

  buf = buf || [];
  s.toLowerCase().replace(/[0-9a-f]{2}/g, function(oct) {
    if (ii < 16) { // Don't overflow!
      buf[i + ii++] = _hexToByte[oct];
    }
  });

  // Zero out remaining bytes if string was short
  while (ii < 16) {
    buf[i + ii++] = 0;
  }

  return buf;
}

// **`unparse()` - Convert UUID byte array (ala parse()) into a string**
function unparse(buf, offset) {
  var i = offset || 0, bth = _byteToHex;
  return  bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]];
}

// **`v1()` - Generate time-based UUID**
//
// Inspired by https://github.com/LiosK/UUID.js
// and http://docs.python.org/library/uuid.html

// random #'s we need to init node and clockseq
var _seedBytes = _rng();

// Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
var _nodeId = [
  _seedBytes[0] | 0x01,
  _seedBytes[1], _seedBytes[2], _seedBytes[3], _seedBytes[4], _seedBytes[5]
];

// Per 4.2.2, randomize (14 bit) clockseq
var _clockseq = (_seedBytes[6] << 8 | _seedBytes[7]) & 0x3fff;

// Previous uuid creation time
var _lastMSecs = 0, _lastNSecs = 0;

// See https://github.com/broofa/node-uuid for API details
function v1(options, buf, offset) {
  var i = buf && offset || 0;
  var b = buf || [];

  options = options || {};

  var clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq;

  // UUID timestamps are 100 nano-second units since the Gregorian epoch,
  // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
  // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
  // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
  var msecs = options.msecs !== undefined ? options.msecs : new Date().getTime();

  // Per 4.2.1.2, use count of uuid's generated during the current clock
  // cycle to simulate higher resolution clock
  var nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1;

  // Time since last uuid creation (in msecs)
  var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs)/10000;

  // Per 4.2.1.2, Bump clockseq on clock regression
  if (dt < 0 && options.clockseq === undefined) {
    clockseq = clockseq + 1 & 0x3fff;
  }

  // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
  // time interval
  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
    nsecs = 0;
  }

  // Per 4.2.1.2 Throw error if too many uuids are requested
  if (nsecs >= 10000) {
    throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
  }

  _lastMSecs = msecs;
  _lastNSecs = nsecs;
  _clockseq = clockseq;

  // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
  msecs += 12219292800000;

  // `time_low`
  var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
  b[i++] = tl >>> 24 & 0xff;
  b[i++] = tl >>> 16 & 0xff;
  b[i++] = tl >>> 8 & 0xff;
  b[i++] = tl & 0xff;

  // `time_mid`
  var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
  b[i++] = tmh >>> 8 & 0xff;
  b[i++] = tmh & 0xff;

  // `time_high_and_version`
  b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
  b[i++] = tmh >>> 16 & 0xff;

  // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
  b[i++] = clockseq >>> 8 | 0x80;

  // `clock_seq_low`
  b[i++] = clockseq & 0xff;

  // `node`
  var node = options.node || _nodeId;
  for (var n = 0; n < 6; n++) {
    b[i + n] = node[n];
  }

  return buf ? buf : unparse(b);
}

// **`v4()` - Generate random UUID**

// See https://github.com/broofa/node-uuid for API details
function v4(options, buf, offset) {
  // Deprecated - 'format' argument, as supported in v1.2
  var i = buf && offset || 0;

  if (typeof(options) == 'string') {
    buf = options == 'binary' ? new Array(16) : null;
    options = null;
  }
  options = options || {};

  var rnds = options.random || (options.rng || _rng)();

  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
  rnds[6] = (rnds[6] & 0x0f) | 0x40;
  rnds[8] = (rnds[8] & 0x3f) | 0x80;

  // Copy bytes to buffer, if provided
  if (buf) {
    for (var ii = 0; ii < 16; ii++) {
      buf[i + ii] = rnds[ii];
    }
  }

  return buf || unparse(rnds);
}

// Export public API
var uuid = v4;
uuid.v1 = v1;
uuid.v4 = v4;
uuid.parse = parse;
uuid.unparse = unparse;

module.exports = uuid;

},{"./rng":2}]},{},[1]);
