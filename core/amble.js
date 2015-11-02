window.Amble = (function(){
    var Amble = {};
    Object.size = function(obj) {
        var size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
        return size;
    };

    Amble.app = {}
    /* Game */
    Amble.Application = function(args){
        var that = this;
        Amble.app = this;

        this.resize = typeof args['resize'] === 'boolean' ? args['resize'] : false;

        //wrap this things up
        if(this.resize) {
            window.addEventListener('resize', function(){

                var camera = Amble.app.mainCamera.camera;
                var width = parseInt(camera.context.offsetWidth);
                var height = parseInt(camera.context.offsetHeight);

                for(var i = 0; i > Amble.app.mainCamera.camera.layers.length; i++) {
                    Amble.app.width = camera.layers[i].layer.canvas.width = width;
                    Amble.app.height = camera.layers[i].layer.canvas.height = height;
                }

                var sizeDifference = width/camera.size.x;
                camera.size = new Amble.Math.Vector2({ x: width, y: height });
                camera.view = new Amble.Math.Vector2(camera.position.x - width, camera.position.y - height);
                Amble.app.mainCamera.getComponent('Camera').variables.maxZoom *= sizeDifference;
                Amble.app.mainCamera.getComponent('Camera').variables.minZoom *= sizeDifference;
            });
        }

        this.scene = new Amble.Scene();

        var mainCamera = {
            cam: { name: "Amble.Camera", args: {
                    position: { name: "Amble.Math.Vector2", args: {x:0 ,y:0}},
                }
            }
        }
        this.mainCamera = this.scene.instantiate(args['mainCamera'] || mainCamera);

        this.width = this.mainCamera.camera.size.x || 800;
        this.height = this.mainCamera.camera.size.y || 600;

        //init all public game loop functions
        var gameLoopFunctionsList = ['preload', 'start', 'preupdate', 'postupdate', 'prerender', 'postrender'];
        for(var i in gameLoopFunctionsList){
            this[gameLoopFunctionsList[i]] = typeof args[gameLoopFunctionsList[i]] === 'function' ? args[gameLoopFunctionsList[i]] : function(){};
        }

        //private game loop functions
        this.update = function(){
            this.mainCamera.camera.update()
            this.scene.update();

            //update all objects on scene
            //priorytet sort?
        };
        this.render = function(){
            for(var i = 0; i < this.mainCamera.camera.layers.length; i++) {
                this.mainCamera.camera.layers[i].layer.clear();
            }
            //render all objects on scene
            //z order sort
            this.scene.render(this.mainCamera.camera);
        };

        /* setting loader */
        this.loader = new Amble.Data.Loader();
        /* loading screen layer and loading screen */
        // this.layer = new Amble.Graphics.Layer(this.width, this.height);
        // this.layer.appendTo(document.body);
        this.loadingInterval = setInterval(function(){
            var x = (that.width - that.width/4) * ((that.loader.successCount + that.loader.errorCount)/that.loader.queue.length);
            that.mainCamera.camera.layer('default')
                .clear('black')
                .fillStyle('#0ff')
                .fillRect(that.width/8, that.height/2 - that.height/16, x, that.height/8);
        }, 1000/60);

        /* setting all loading heppens there */
        this.preload();
        /* all loading */
        this.loader.loadAll(function(){
            clearInterval(that.loadingInterval);
            // that.layer.remove();
            Amble.Input._setListeners();

            that.start();

            gameLoop();
        })

        /* hearth of the Amble/game */
        function gameLoop(){
            var now = Date.now();
            Amble.Time.deltaTime = (now - Amble.Time.lastTime) / 1000.0;

            //dafuq?
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
    Amble.Camera = function(args){
        this.position = args['position'] || new Amble.Math.Vector2({});
        this.context = document.getElementById(args['context']) || document.body;
        this.size =  new Amble.Math.Vector2({x: parseInt(this.context.offsetWidth), y: parseInt(this.context.offsetHeight)});
        this.view = new Amble.Math.Vector2(this.position.x - this.size.x, this.position.y - this.size.y);
        this.scale = 1;
        this.layers = [];
    }
    Amble.Camera.prototype = {
        layer: function(index){
            if(index < 0) throw "Z-index cannot be negative!"
            var layer = this.layers.find(l => l.index == index);
            if(!layer) {
                return this.addLayer(index).layer //add
            } else {
                return layer.layer;
            }
        },
        addLayer: function(index){
            var l = this.layers.find(l => l.index == index);
            if(!l) {
                var layer = {
                    index: index,
                    layer: new Amble.Graphics.Layer(this.size.x, this.size.y, index)
                }
                layer.layer.appendTo(this.context)
                this.layers.push(layer);

                // this.layers.sort(function(a, b){ return a.index - b.index })
                return layer;
                // throw "You can't add layer. There is layer with given z-index!";
            }
        },
        update: function(){
            this.view = new Amble.Math.Vector2({x: this.position.x - this.size.x, y:this.position.y - this.size.y});
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
                    if(attr == 'components') {
                        copy[attr] = [];
                        for(var i in obj[attr]) {
                            copy[attr][i] = {
                                id: obj[attr][i].name,
                                body: Amble.Utils.makeFunction(obj[attr][i])
                            }
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
    Amble.Actor = function(args) {
        //transform is basic actro component
        this.transform = {};
        //other are optional
        //2 types of components (user custom in components array, and engine built in components like renderer)
        this.renderer = {};
        this.components = {};
    }
    Amble.Actor.prototype = {
        getComponent: function(componentName){
            var component = this.components.find(c => c.id == componentName);
            return component.body;
        }
    }
    /* Scene */
    Amble.Scene = function(){
        this.children = [];
    }
    Amble.Scene.prototype = {
        instantiate: function(obj){
            var actor = new Amble.Actor();
            var clone = Amble.Utils.clone(obj);
            for(var i in clone) {
                actor[i] = clone[i];
            }
            return this.add(actor);
        },
        add: function(object) {
            if(object.components != 'undefined') {
                for(var i in object.components) {
                    var _component = object.components[i].body;
                    if(typeof _component.update == 'function'){
                        _component.start(object);
                    }
                }
            }

            this.children.push(object);
            return object;
        },
        remove: function(object){
            var index = this.children.indexOf(object);
            if(index != -1)
                this.children.splice(index, 1);
        },
        awake: function(){
            for(var i in this.children){
                /* component start */
                for(var j in this.children[i].components){
                    var _component = this.children[i].components[j].body;
                    if(typeof _component.start == 'function'){
                        _component.start(this.children[i]);
                    }
                }
            }
        },
        update: function(){
            for(var i in this.children){
                /* script update */
                for(var j in this.children[i].components){
                    var _component = this.children[i].components[j].body;
                    if(typeof _component.update == 'function'){
                        _component.update(this.children[i]);
                    }
                }
            }

        },
        render: function(camera){
            for(var i in this.children){
                /* render objects by renderer*/
                if(this.children[i].renderer && typeof this.children[i].renderer.render === 'function') {
                    this.children[i].renderer.render(this.children[i], camera)
                }
            }

        }
    };
    /* Transform */
    Amble.Transform = function(args) {
        this.position = args['position'] || new Amble.Math.Vector2({});
        this.size = args['size'] || new Amble.Math.Vector2({});
        //scale?
        //rotation?
    }
    /* Graphics */
    Amble.Graphics = {};
    Amble.Graphics.Layer = function(width, height, index){
        this.canvas = document.createElement('canvas');
        this.canvas.width = width || Amble.app.width;
        this.canvas.height = height || Amble.app.height;
        this.canvas.style.position = 'absolute';
        this.canvas.style.zIndex = index.toString() || '0';
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
            this.ctx.save();
            this.ctx.setTransform(1,0,0,1,0,0);
            if (color) {
                this.ctx.fillStyle = color;
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            } else {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            }
            this.ctx.restore();
            return this;
        },
        fillStyle: function(color){
            this.ctx.fillStyle = color;
            return this;
        },
        fillRect: function(x, y, width, height){
            this.ctx.fillRect(x, y, width, height);
            return this;
        },
        strokeStyle: function(color){
            this.ctx.strokeStyle = color;
            return this;
        },
        strokeRect: function(x, y, width, height){
            this.ctx.strokeRect(x, y, width, height);
            return this;
        },
        stroke: function(){
            this.ctx.stroke();
            return this;
        },
        lineWidth: function(width){
            this.ctx.lineWidth = width;
            return this;
        }

    }
    /* Amble.Graphics.Renderer constructor */
    Amble.Graphics.RectRenderer = function(args){
        this.color = args['color'] || 'pink';
        this.layer = args['layer'] || 0
    }
    /* Amble.Graphics.Renderer functions */
    Amble.Graphics.RectRenderer.prototype = {
        render: function(self, layerName, camera){
            camera.layer(this.layer)
                .fillStyle(this.color)
                .fillRect(self.transform.position.x - camera.view.x - self.transform.size.x/2, self.transform.position.y - camera.view.y - self.transform.size.y/2, self.transform.size.x, self.transform.size.y);
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
    Amble.Math.Vector2.prototype = {
        copy: function(vec2){
            this.x = vec2.x;
            this.y = vec2.y;
            return this;
        },
        add: function(vec2){
            this.x += vec2.x;
            this.y += vec2.y;
            return this;
        },
        sub: function(vec2){
            this.x -= vec2.x;
            this.y -= vec2.y;
            return this;
        },
        normalize: function(){
            return this;
        }
    }
    Amble.Math.Vector3 = function(args){
        this.x = args['x'] || 0;
        this.y = args['y'] || 0;
        this.z = args['z'] || 0;
    }
    /* Amble.Math.Vector3 functions */
    Amble.Math.Vector3.prototype = {
        copy: function(vec3){
            this.x = vec3.x;
            this.y = vec3.y;
            this.z = vec3.z;
            return this;
        },
        add: function(vec3){
            this.x += vec3.x;
            this.y += vec3.y;
            this.z += vec3.z;
            return this;
        },
        sub: function(vec3){
            this.x -= vec3.x;
            this.y -= vec3.y;
            this.z -= vec3.z;
            return this;
        },
        normalize: function(){
            return this;
        }
    }
    /* Input */
    Amble.Input = {
        debug: false,
        isKeyPressed: function(keycode){
            return Amble.Input._keyValues[keycode];
        },
        isMousePressed: function(keycode){
            return Amble.Input._mouseValues[keycode];
        },
        _mouseValues: [],
        _keyValues: [],
        mousePosition: new Amble.Math.Vector2({}),
        offset: new Amble.Math.Vector2({}),
        wheelDelta: new Amble.Math.Vector3({}),
        isShiftPressed: false,
        isCtrlPressed: false,
        // _event: {}
    }
    Amble.Input._setListeners = function(){
        // document.addEventListener('load', function(e){
        //     Amble.Input._event = e;
        // }, false);
        document.addEventListener('keydown', function(e){
            if(Amble.Input.debug)
                console.log(e.which);
            Amble.Input.isShiftPressed = e.shiftKey;
            Amble.Input.isCtrlPressed = e.ctrlKey;
            Amble.Input._keyValues[e.which] = true;
        }, false);
        document.addEventListener('keyup', function(e){
            Amble.Input._keyValues[e.which] = false;
        }, false);
        document.addEventListener('mousedown', function(e){
            if(Amble.Input.debug)
                console.log(e.which);
            Amble.Input._mouseValues[e.which] = true;
        }, false);
        document.addEventListener('mouseup', function(e){
            Amble.Input._mouseValues[e.which] = false;
        }, false);
        document.addEventListener('mousemove', function(e){

            var offsetLeft = Amble.app.mainCamera.camera.context.offsetLeft;
            var offsetTop = Amble.app.mainCamera.camera.context.offsetTop;

            if(Amble.Input.debug) {
                console.log(e.clientX - offsetLeft);
                console.log(e.clientY - offsetTop);
            }

            Amble.Input.offset.x = offsetLeft;
            Amble.Input.offset.y = offsetTop;

            Amble.Input.mousePosition.x = e.clientX - offsetLeft;
    		Amble.Input.mousePosition.y = e.clientY - offsetTop;
        }, false);
        document.addEventListener("wheel", function(e){
            Amble.Input.wheelDelta.x = e.deltaX;
            Amble.Input.wheelDelta.y = e.deltaY;
            Amble.Input.wheelDelta.z = e.deltaZ;
            Amble.app.mainCamera.getComponent('Camera').onmousewheel(Amble.app.mainCamera, e);
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
