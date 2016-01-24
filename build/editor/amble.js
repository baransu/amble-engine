var Vec2 = (function(){

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

var Vec3 = (function() {

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

var Mathf = (function() {

    var Mathf = {

      TO_RADIANS: Math.PI/180,

    }

    return Mathf;

}());

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

          if(attr == 'components') {
            copy[attr] = [];
            for(var i in obj[attr]) {
              if(obj[attr][i].type == 'editor') {

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

var Time = (function() {

    var Time = {
      deltaTime: 0,
      _lastTime: 0
    }

    return Time;

}());

var Actor = (function() {

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

var AnimationRenderer = (function() {

  var AnimationRenderer = function AnimationRenderer(args) {
    this.sprite = args.sprite;
    this.layer = args.layer || 0;
    this.updatesPerFrame = args.updatesPerFrame || 1;
    this.frames = args.frames || 1;
    this.play = args.play || false;
    this.loop = args.loop || true;

    this._currentFrame = 0;
    this._updates = 0;
    this._sprite = new Image();
    this._frameTimer = 0;
    this.size = new Vec2();

    this.type = "animation";
    this._editorName = "AnimationRenderer"
  };

  AnimationRenderer.prototype = {

    render: function render(self, camera) {

      var layer = camera.camera.layer;

      layer.ctx.save();

      if(this._sprite) {

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

          if(self.selected) {

            layer.ctx.save();
            layer.strokeStyle(primaryColor)
              .lineWidth(3)
              .strokeRect(
                -width/2,
                -height/2,
                width,
                height
              );

              layer.ctx.restore();
          }
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

var Debug = (function() {

  var Debug = function Debug() {
    this.logs = [];
  };

  Debug.prototype = {

    log: function log(log) {

      this.logs.push({
        type: 'log',
        message: log
      });

      EDITOR.refresh();



    },

    error: function error(error) {

      this.logs.push({
        type: 'error',
        message: error
      });

      EDITOR.refresh();



    },

  };

  return Debug;

}());

var EngineRenderer = (function() {

    var EngineRenderer = function EngineRenderer(args) {
      this.layer = 0;
      this.size = new Vec2();
      this.type = "engine";
      this._editorName = 'EngineRenderer'
    };

    EngineRenderer.prototype = {

      render: function render(self, camera) {

        var layer = camera.camera.layer;

        layer.ctx.save();

        var x = self.transform.position.x - camera.camera.view.x;
        var y = self.transform.position.y - camera.camera.view.y;
        layer.font('30px Arial');

        this.size.x = layer.ctx.measureText(self.name || 'Actor').width * 2;
        this.size.y = 60;

        layer.ctx.translate(x, y);

        //scale
        layer.ctx.scale(self.transform.scale.x, self.transform.scale.y);

        // rotation in radians
        layer.ctx.rotate(-self.transform.rotation * Mathf.TO_RADIANS);

        layer.fillStyle('green')
        layer.ctx.beginPath();
        layer.ctx.arc(
          0,
          0,
          5,
          0,
          2*Math.PI
        );
        layer.ctx.fill();

        layer.textAlign('center')
          .fillStyle('transparent')
          .fillRect(
            -this.size.x/2,
            -this.size.y/2,
            this.size.x,
            this.size.y
          )
          .fillStyle('#bcbebf')
          .fillText(
            self.name || 'Actor',
            0,
            -15
          );

          if(self.selected) {
            layer.strokeStyle(primaryColor)
            .lineWidth(1)
            .strokeText(
              self.name || 'Actor',
              0,
              -15
            );

          }

        layer.ctx.restore();
      }
    };

    return EngineRenderer;

}());

var CameraRenderer = (function() {

    var CameraRenderer = function CameraRenderer(args) {
      this.layer = 0;
      this.size = new Vec2(128, 128);

      this.img = new Image(128, 128);
      this.img.src = 'cam_icon.png';

      this.type = "engine";
      this._editorName = 'EngineRenderer'
    };

    CameraRenderer.prototype = {

      render: function render(self, camera) {

        var layer = camera.camera.layer;

        layer.ctx.save();

        var x = self.transform.position.x - camera.camera.view.x;
        var y = self.transform.position.y - camera.camera.view.y;
        layer.font('30px Arial');

        var width = self.camera.size.x;
        var height = self.camera.size.y;

        layer.ctx.translate(x, y);

        // //scale
        // layer.ctx.scale(self.transform.scale.x, self.transform.scale.y);

        // rotation in radians
        layer.ctx.rotate(-self.transform.rotation * Mathf.TO_RADIANS);

        //draw img
        layer.ctx.drawImage(this.img, -this.img.width/2, -this.img.height/2, this.img.width, this.img.height)

        if(self.selected) {
          layer.strokeStyle(primaryColor)
            .lineWidth(2)
            .strokeRect(-width/2, -height/2, width, height);
        }

        layer.ctx.restore();
      }
    };

    return CameraRenderer;

}());

var Input = (function(){

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
      element.addEventListener('mousemove', Input._eventFunctions.mousemove, false);
      element.addEventListener("wheel", Input._eventFunctions.wheel, false);
      element.addEventListener("contextmenu", Input._eventFunctions.contextmenu, false);

      //touch start
      element.addEventListener("touchstart", Input._eventFunctions.touchstart, false);
      //touch end
      element.addEventListener("touchstart", Input._eventFunctions.touchend, false);
      //touch move
      element.addEventListener("touchstart", Input._eventFunctions.touchmove, false);
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
        element.removeEventListener('mousemove', Input._eventFunctions.mousemove, false);
        element.removeEventListener("wheel", Input._eventFunctions.wheel, false);
        element.removeEventListener("contextmenu", Input._eventFunctions.contextmenu, false);

        //touch start
        element.removeEventListener("touchstart", Input._eventFunctions.touchstart, false);
        //touch end
        element.removeEventListener("touchstart", Input._eventFunctions.touchend, false);
        //touch move
        element.removeEventListener("touchstart", Input._eventFunctions.touchmove, false);


      } else if (document.detachEvent) {

        document.detachEvent('keydown', Input._eventFunctions.keydown, false);
        document.detachEvent('keyup', Input._eventFunctions.keyup, false);
        element.detachEvent('mousedown', Input._eventFunctions.mousedown, false);
        element.detachEvent('mouseup', Input._eventFunctions.mouseup, false);
        element.detachEvent('mousemove', Input._eventFunctions.mousemove, false);
        element.detachEvent("wheel", Input._eventFunctions.wheel, false);
        element.detachEvent("contextmenu", Input._eventFunctions.contextmenu, false);

        //touch start
        element.detachEvent("touchstart", Input._eventFunctions.touchstart, false);
        //touch end
        element.detachEvent("touchstart", Input._eventFunctions.touchend, false);
        //touch move
        element.detachEvent("touchstart", Input._eventFunctions.touchmove, false);

      }
    }
  }

  return Input;

}());

var Layer = (function() {

    var Layer = function Layer(camera) {

      this.canvas = document.createElement('canvas');
      this.canvas.width = camera.size.x;
      this.canvas.height = camera.size.y;
      this.canvas.style.position = 'absolute';
      this.ctx = this.canvas.getContext('2d');

      this.ctx.imageSmoothingEnabled = AMBLE.antyAliasing;
      this.ctx.mozImageSmoothingEnabled = AMBLE.antyAliasing;
      this.ctx.msImageSmoothingEnabled = AMBLE.antyAliasing;


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

var MainCamera = (function() {

    var MainCamera = function MainCamera(args) {
      this.context = document.getElementById(args.context) || document.body;

      this.size = args.size || new Vec2(1280, 720);

      this.bgColor = args.bgColor || '#37474f';

      this.view = new Vec2();
      this.scale = args.scale || 1;

      if(args.layer) {
        this.size.x = $(this.context).width();
        this.size.y = $(this.context).height();
      this.layer = new Layer(this).appendTo(this.context);
      }
    };

    MainCamera.prototype = {

      update: function update(self) {
        this.view = new Vec2(self.transform.position.x - this.size.x/2, self.transform.position.y - this.size.y/2);
        return this;
      }

    };

    return MainCamera;

}());

var RectRenderer = (function() {

  var RectRenderer = function RectRenderer(args) {
    this.color = args.color || '#e91e63';
    this.layer = args.layer || 0;
    this.size = args.size || new Vec2(100, 100);

    this.type = "rect";
    this._editorName = "RectRenderer";
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

      if(self.selected) {

        layer.ctx.save();

        layer.strokeStyle(primaryColor)
          .lineWidth(3)
          .strokeRect(
            -width/2,
            -height/2,
            width,
            height
          );

          layer.ctx.restore();
      }

      layer.ctx.restore();
    }

  };

  return RectRenderer

}());

var SpriteRenderer = (function() {

  var SpriteRenderer = function SpriteRenderer(args) {

    this.sprite = args.sprite; // || TODO: add placeholder graphics
    this.layer = args.layer || 0;
    this._sprite = new Image();
    this.size = new Vec2();

    this.type = "sprite";
    this._editorName = "SpriteRenderer"
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

        // TODO: add if
        layer.ctx.scale(self.transform.scale.x, self.transform.scale.y);

        // TODO: add if
        layer.ctx.rotate(-self.transform.rotation * Mathf.TO_RADIANS);

        if(this._sprite.src) {
          layer.ctx.drawImage(this._sprite, -width/2, -height/2);

          if(self.selected) {

            layer.ctx.save();

            layer.strokeStyle(primaryColor)
              .lineWidth(3)
              .strokeRect(
                -width/2,
                -height/2,
                width,
                height
              );

            layer.ctx.restore();
          }
        }

      } else {
        // TODO: change to correct instance
        this._sprite = AMBLE.loader.getAsset(this.sprite);
      }

      layer.ctx.restore();
    }
  };

  return SpriteRenderer;

}());

var Transform = (function() {

    var Transform = function Transform(args) {
      this.position = args.position || new Vec2();
      this.scale = args.scale || new Vec2(1, 1);
      this.rotation = args.rotation || 0;

    };

    return Transform;

}());

var Scene = (function() {

  var Scene = function Scene() {
    this.children = [];
    this.started = false;
    this.shortArray = [];
  };

  Scene.prototype = {

    createSceneFile: function createSceneFile(){

      var data = [];
      for(var i = 1; i < this.children.length; i++) {
        this.children[i].prefab.name = this.children[i].name;
        console.log(this.children[i].name)
        data.push(this.children[i].prefab);
      }

      // TODO: cleaning up objects

      return data;
    },

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

      var sceneID = Utils.generateID();
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

      this.shortArray.push({
        name: object.name,
        sceneID: sceneID,
        selected: false
      });

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

var Application  = (function() {

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

    //wrap this things up
    window.addEventListener('resize', function() {

      var width = $(that.mainCamera.camera.context).width();
      var height = $(that.mainCamera.camera.context).height();

      that.mainCamera.camera.layer.canvas.width = width;
      that.mainCamera.camera.layer.canvas.height = height;
      that.mainCamera.getComponent('Camera').onresize(that.mainCamera);


    });

    //init all public game loop functions
    var gameLoopFunctionsList = ['prePreload', 'preload', 'loaded', 'start', 'preupdate', 'postupdate', 'prerender', 'postrender'];
    for(var i in gameLoopFunctionsList){
        this[gameLoopFunctionsList[i]] = typeof args[gameLoopFunctionsList[i]] === 'function' ? args[gameLoopFunctionsList[i]] : function(){};
    }

    this.paused = false;

    this.pause = function pause() {
        this.paused = true;
        console.log('pause')
    };

    this.unpause = function unpause() {
        console.log('unpause')
        this.paused = false;
        gameLoop();
    };

    this.update = function update(){
      this.mainCamera.camera.update(this.mainCamera)
      this.scene.update();
    };

    this.render = function render(){
      var camera = this.mainCamera.camera;

      camera.layer.clear(this.mainCamera.camera.bgColor);

      var linesColor = '#eceff1'
      var layer = camera.layer;

      layer.strokeStyle(linesColor).lineWidth(0.5);
      layer.ctx.beginPath();

      var lineSpacing = 200;

      var verticalLinesCount = ((camera.size.x/camera.scale)/lineSpacing) * 2;
      var horizontalLinesCount = ((camera.size.y/camera.scale)/lineSpacing) * 2;
      var startX = Math.floor(this.mainCamera.transform.position.x - (camera.size.x)/camera.scale) - (this.mainCamera.transform.position.x - (camera.size.x)/camera.scale) % lineSpacing;
      var startY = Math.floor(this.mainCamera.transform.position.y - (camera.size.y)/camera.scale) - (this.mainCamera.transform.position.y - (camera.size.y)/camera.scale) % lineSpacing;


      //vertical lines
      for(var i = -2; i < verticalLinesCount; i++) {
        layer.ctx.moveTo(startX + lineSpacing * i - camera.view.x, this.mainCamera.transform.position.y - camera.size.y/camera.scale - camera.view.y - lineSpacing);
        layer.ctx.lineTo(startX + lineSpacing * i - camera.view.x, this.mainCamera.transform.position.y + camera.size.y/camera.scale - camera.view.y);
      }

      //horizonala
      for(var i = -2; i < horizontalLinesCount; i++) {
        layer.ctx.moveTo(this.mainCamera.transform.position.x - camera.size.x/camera.scale - camera.view.x - lineSpacing * 2, startY + lineSpacing * i - camera.view.y);
        layer.ctx.lineTo(this.mainCamera.transform.position.x + camera.size.x/camera.scale - camera.view.x, startY + lineSpacing * i - camera.view.y);
      }

      layer.ctx.stroke();

      this.scene.render(this.mainCamera);

    };

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

    var color = colors[Math.floor(Math.random() * colors.length - 1)];

    this.prePreload();
    this.loader.loadAll(function() {


      that.loadingInterval = setInterval(function() {

        if(that.mainCamera) {
          // console.log('loading interval')
          var width = that.mainCamera.camera.size.x;
          var height = that.mainCamera.camera.size.y;

          console.log(that.loader.successCount, that.loader.errorCount, that.loader.queue.length);

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

var CLASSES = [];
var Class = (function() {

  var Class = function Class(body) {

    // console.log(body);

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

    console.log(CLASSES)

  };

  return Class;

}());
