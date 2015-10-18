window.Amble = (function(){
    var Amble = {};
    Object.size = function(obj) {
        var size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
        return size;
    };

    /* Game */
    Amble.Game = function(args){
        var that = this;

        //init size
        this.width = typeof args['width'] === 'number' ? args['width'] : 800;
        this.height = typeof args['height'] === 'number' ? args['height'] : 600;

        //init all public game loop functions
        var gameLoopFunctionsList = ['preload', 'start', 'preupdate', 'postupdate', 'prerender', 'postrender'];
        for(var i in gameLoopFunctionsList){
            this[gameLoopFunctionsList[i]] = typeof args[gameLoopFunctionsList[i]] === 'function' ? args[gameLoopFunctionsList[i]] : function(){};
        }
        //scene objects start function - after preload, before Amble start
        this.awake = function(){
            this.scene.awake(this.layer);
        };
        //private game loop functions
        this.update = function(){
            this.scene.update();

            this.camera.update();
            //update all objects on scene
            //priorytet sort?
        };
        this.render = function(){
            this.layer.clear();
            //render all objects on scene
            //z order sort
            this.scene.render(this.layer, this.camera);
        };

        this.scene = new Amble.Scene
        this.camera = new Amble.Camera(this.width/2, this.height/2, this.width, this.height);

        /* setting loader */
        this.loader = new Amble.Data.Loader();
        /* loading screen layer and loading screen */
        this.layer = new Amble.Graphics.Layer(this.width, this.height);
        this.layer.appendTo(document.body);
        this.loadingInterval = setInterval(function(){
            var x = (that.width - that.width/4) * ((that.loader.successCount + that.loader.errorCount)/that.loader.queue.length);
            that.layer
                .clear('black')
                .fillStyle('#0ff')
                .fillRect(that.width/8, that.height/2 - that.height/16, x, that.height/8);
        }, 1000/60);

        /* setting all loading heppens there */
        this.preload();

        /* all loading */
        this.loader.loadAll(function(){
            clearInterval(that.loadingInterval);
            that.layer.remove();
            Amble.Input._setListeners();
            that.awake();
            that.start();
            gameLoop();
        })

        /* hearth of the Amble/game */
        function gameLoop(){
            var now = Date.now();
            Amble.Time.deltaTime = (now - Amble.Time.lastTime) / 1000.0;

            that.preupdate();
            that.update();
            that.postupdate();
            that.prerender()
            that.render();
            that.postrender();

            Amble.Time.lastTime = now;
            requestAnimationFrame(gameLoop)
        }
    }
    /* Time */
    Amble.Time = {
        deltaTime: 0,
        lastTime: 0
    };
    Amble.Camera = function(x, y, width, height){
        this.position = new Amble.Math.Vector2(x || 0, y || 0);
        this.size = new Amble.Math.Vector2(width || 800, height || 600);
        this.view = new Amble.Math.Vector2(this.position.x - this.size.x, this.position.y - this.size.y);
    }
    Amble.Camera.prototype = {
        update: function(){
            this.view = new Amble.Math.Vector2(this.position.x - this.size.x, this.position.y - this.size.y);
            return this;
        }
    };
    /* Utils */
    Amble.Utils = {
        makeFunction: function(obj) {
            if(obj instanceof Object) {
                if(obj.hasOwnProperty('name')) {
                    var args = {};
                    for(var i in obj.args) {
                        args[i] = Amble.Utils.makeFunction(obj.args[i])
                    }
                    var func = Amble.Utils.stringToFunction(obj.name)
                    return new func(args);

                } else {
                    return obj;
                }
            } else {
                return obj;
            }
        },
        clone: function(obj) {
            var copy = {};
            if (obj instanceof Object || obj instanceof Array) {
                for(var attr in obj) {
                    if(attr == 'scripts') {
                        copy[attr] = [];
                        for(var i in obj[attr]) {
                            copy[attr][i] = Amble.Utils.makeFunction(obj[attr][i]);
                        }
                    } else {
                        copy[attr] = Amble.Utils.makeFunction(obj[attr]);
                    }
                }
            }
            return copy;
        },
        stringToFunction: function(str) {
            var arr = str.split(".");
            var fn = (window || this);
            for (var i = 0, len = arr.length; i < len; i++) {
                fn = fn[arr[i]];
            }

            if (typeof fn !== "function") {
                throw new Error("function not found");
            }

            return  fn;
        }
    };
    /* Scene */
    Amble.Scene = function(){
        this.children = [];
    }
    Amble.Scene.prototype = {
        instantiate: function(obj){
            var clone = Amble.Utils.clone(obj);
            this.children.push(clone);
        },
        add: function(object) {
            this.children.push(object);
        },
        remove: function(object){
            var index = this.children.indexof(object);
            if(index != -1)
                this.children.splice(1, index);
        },
        awake: function(layer){
            for(var i in this.children){
                /* scripts start */
                for(var j in this.children[i].scripts){
                    var script = this.children[i].scripts[j];
                    // console.log(typeof script);
                    if(typeof script.start == 'function'){
                        script.start(this.children[i]);
                    }
                }
            }
        },
        update: function(){
            for(var i in this.children){
                /* script update */
                for(var j in this.children[i].scripts){
                    var script = this.children[i].scripts[j];
                    if(typeof script.update == 'function'){
                        script.update(this.children[i]);
                    }
                }
            }
        },
        render: function(layer, camera){
            for(var i in this.children){
                /* render objesc by renderer*/
                var renderer = this.children[i].renderer;
                if(typeof renderer.render === 'function'){
                    renderer.render(this.children[i], layer, camera)
                }
            }
        }
    };
    /* Transform */
    Amble.Transform = function(args) {
        this.position = args['position'] || new Amble.Math.Vector2();
        this.size = args['size'] || new Amble.Math.Vector2();
    }
    /* Graphics */
    Amble.Graphics = {};
    Amble.Graphics.Layer = function(width, height){
        this.canvas = document.createElement('canvas');
        this.canvas.width = width || Amble.app.width;
        this.canvas.height = height || Amble.app.height;
        this.canvas.style.position = 'absolute';
        this.canvas.style.zIndex = 0;
        this.ctx = this.canvas.getContext('2d');
    }
    Amble.Graphics.Layer.prototype = {
        appendTo: function(element){
            this.parent = element;
            element.appendChild(this.canvas);
            return this;
        },
        setZIndex: function(zIndex){
            this.canvas.style.zIndex = zIndex;
            return this;
        },
        remove: function(){
            this.parent.removeChild(this.canvas);
            return this;
        },
        clear: function(color){
            if (color) {
                this.ctx.fillStyle = color;
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            } else {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            }
            return this;
        },
        fillStyle: function(color){
            this.ctx.fillStyle = color;
            return this;
        },
        fillRect: function(x, y, width, height){
            this.ctx.fillRect(x, y, width, height);
            return this;
        }
    }
    /* Amble.Graphics.Renderer constructor */
    Amble.Graphics.RectRenderer = function(args){
        this.color = args['color'] || 'pink';
    }
    /* Amble.Graphics.Renderer functions */
    Amble.Graphics.RectRenderer.prototype = {
        render: function(self, layer, camera){
            layer.fillStyle(this.color)
            layer.fillRect(self.transform.position.x - camera.view.x - self.transform.size.x/2, self.transform.position.y - camera.view.y - self.transform.size.y/2, self.transform.size.x, self.transform.size.y);
        }
    }
    /* Math */
    Amble.Math = {};
    /* Amble.Math.Vector2 constructor */
    Amble.Math.Vector2 = function(args){
        this.x = args['x'] || 0;
        this.y = args['y'] || 0;
    }
    /* Amble.Math.Vector2 functions */
    Amble.Math.prototype = {
        normalize: function(){
            return this;
        }
    }
    /* Input */
    Amble.Input = {
        keyDebug: false,
        keyIsPressed: function(keycode){
            return Amble.Input._keyValues[keycode];
        },
        mouseIsPressed: function(keycode){
            return Amble.Input._mouseValues[keycode];
        }
    }
    Amble.Input._setListeners = function(){

        Amble.Input._mouseValues = [];
        Amble.Input._keyValues = [];
        Amble.Input.mousePosition = new Amble.Math.Vector2({});

        document.addEventListener('keydown', function(e){
            if(Amble.Input.keyDebug)
                console.log(e.which);
            Amble.Input._keyValues[e.which] = true;
        }, false);
        document.addEventListener('keyup', function(e){
            Amble.Input._keyValues[e.which] = false;
        }, false);
        document.addEventListener('mousedown', function(e){
            Amble.Input._mouseValues[e.which] = true;
        }, false);
        document.addEventListener('mouseup', function(e){
            Amble.Input._mouseValues[e.which] = false;
        }, false);
        document.addEventListener('mousemove', function(e){
            Amble.Input.mousePosition.x = e.clientX || e.pageX;
    		Amble.Input.mousePosition.y = e.clientY || e.pageY;
        }, false);
        // document.addEventListener('touchstart', function(e){
        //
        // }, false);
        // document.addEventListener('touchend', function(e){
        //
        // }, false);
        // document.addEventListener('touchmove', function(e){
        //
        // }, false);
    }
    /* Data */
    Amble.Data = {};
    Amble.Data.Loader = function(){
        this.queue = [];
        this.types = [];
        this.successCount = 0;
        this.errorCount = 0;
        this.cache = [];
    }
    Amble.Data.Loader.prototype = {
        /* Supported types: image, json */
        load: function(type, path){
            this.queue.push(path);
            this.types.push(type);
        },
        isDone: function(){
            return (this.queue.length == this.successCount + this.errorCount);
        },
        getAsset: function(path){
            return this.cache[path];
        },
        loadAll: function(callback){
            if(this.queue.length == 0){
                callback();
            }
            for(var i = 0; i < this.queue.length; i++){
                var that = this;
                switch(this.types[i]){
                    /* loading image */
                    case 'image':
                        var imgPath = this.queue[i];


                        var img = new Image();
                        img.addEventListener('load', function(){
                            that.successCount++;
                            if(that.isDone()){
                                callback();
                            }
                        }, false);
                        img.addEventListener('error', function(){
                            that.errorCount++;
                            if(that.isDone()){
                                callback();
                            }
                        }, false);
                        img.src = imgPath;
                        this.cache[imgPath] = img;
                    break;
                    /* loading json file */
                    case 'json':
                        var jsonPath = this.queue[i];

                        var xobj = new XMLHttpRequest();
                        xobj.overrideMimeType("application/json");
                        xobj.open('GET', jsonPath, true);

                        xobj.addEventListener("load", function(e){
                            that.successCount++;
                            if(that.isDone()){
                                callback();
                            }
                            var path = e.srcElement.responseURL.toString();
                            var href = window.location.href.toString();
                            that.cache[path.split(href).pop()] = e.srcElement.responseText;
                        }, false);
                        xobj.addEventListener("error", function(e){
                            that.errorCount++;
                            if(that.isDone()){
                                callback();
                            }
                            var path = e.srcElement.responseURL.toString();
                            var href = window.location.href.toString();
                            that.cache[path.split(href).pop()] = e.srcElement.responseText;
                        }, false);
                        xobj.send(null);

                    break;
                }
            }
        },
    }
    return Amble;

}());
module.exports = window.Amble;
