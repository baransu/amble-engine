var COCOONJS = navigator.isCocoonJS;

window.Amble = (function(){

    var Amble = {};

    Amble.app = {};

    /* Game */
    Amble.Application = function(args){
        var that = this;
        Amble.app = this;

        this.resize = typeof args['resize'] === 'boolean' ? args['resize'] : true;
        this.antyAliasing = typeof args['antyAliasing'] === 'boolean' ? args['antyAliasing'] : false;

        this.fullscreen = args['fullscreen'] || false;
        this.width = args['width'] || 640;
        this.height = args['height'] || 480;

        this.scene = new Amble.Scene();
        // console.log('camera init')
        this.mainCamera = this.scene.instantiate(args['mainCamera']);
        // console.log('after camera init')

        if(this.resize && COCOONJS) {
            // console.log('resize add')
            window.addEventListener('resize', function(){
                // console.log('resize')
                var camera = Amble.app.mainCamera.camera;
                for(var i = 0; i < camera.layers.length; i++) {
                    camera.layers[i].layer.resize();
                }
            });
        }

        //init all public game loop functions
        var gameLoopFunctionsList = ['preload', 'loaded', 'start', 'preupdate', 'postupdate', 'prerender', 'postrender'];
        for(var i in gameLoopFunctionsList){
            this[gameLoopFunctionsList[i]] = typeof args[gameLoopFunctionsList[i]] === 'function' ? args[gameLoopFunctionsList[i]] : function(){};
        }

        //private game loop functions
        this.update = function(){
            this.mainCamera.camera.update()
            this.scene.update();
            // console.log('update')
            //update all objects on scene
            //priorytet sort?
        };

        this.defaultBgColor = args['defaultBgColor'] || 'transparent';

        this.render = function(){

            var camera = this.mainCamera.camera;
            for(var i = 0; i < camera.layers.length; i++) {
                if(i == 0) camera.layers[i].layer.clear(this.defaultBgColor);
                else camera.layers[i].layer.clear();
            }

            this.scene.render(camera);
        };

        /* setting loader */
        this.loader = new Amble.Data.Loader();

        var loadingTimer = 0;
        var currentLoadingText = 0;

        var colors = [
            "#e53935",
            "#d81b60",
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
            "#6d4c41",
            "#ff6f00",
            "#546e7a"
        ];

        var color = colors[Math.floor(Math.random() * colors.length - 1)];

        this.loadingInterval = setInterval(function(){
            var x = (that.width - that.width/4) * ((that.loader.successCount + that.loader.errorCount)/that.loader.queue.length);
            var layer = that.mainCamera.camera.layer(0);
            layer.ctx.save();
            var loading = [
                "   loading.  ",
                "   loading.. ",
                "   loading...",
            ]

            layer.clear('black')
                .fillStyle(color)
                .strokeStyle('white')
                .fillRect(that.width/8, that.height/2 - that.height/16, x, that.height/8)
                .strokeRect(that.width/8, that.height/2 - that.height/16, (that.width - that.width/4), that.height/8);

            layer.ctx.shadowColor = "white";
            layer.ctx.shadowBlur = 20;

            layer.fillStyle('white');
            layer.ctx.textAlign = 'center';
            layer.ctx.font = "25px Arial";
            var text = parseInt(((that.loader.successCount + that.loader.errorCount)/that.loader.queue.length) * 100) + "%"
            layer.ctx.fillText(text, that.width/2, that.height/2 + 7)

            layer.ctx.font = "20px Arial";
            text = loading[currentLoadingText];
            layer.ctx.fillText(text, that.width/2, 2*that.height/3 + 10)

            loadingTimer += 1/60;
            if(loadingTimer > 1) {
                loadingTimer = 0;
                currentLoadingText++;
                if(currentLoadingText == loading.length) currentLoadingText = 0;
            }
            layer.ctx.restore();

        }, 1000/60);


        /* setting all loading heppens there */
        this.preload();

        /* all loading */
        this.loader.loadAll(function(){
            setTimeout(function(){
                clearInterval(that.loadingInterval);
                Amble.Input._setListeners();

                Amble.app.loader.audioCache = [];
                // that.scene.start();
                that.loaded();
                that.start();
                Amble.Time._lastTime = Date.now()
                gameLoop();

            }, 1000);
        })

        /* hearth of the Amble/game */
        function gameLoop(){

            var now = Date.now();
            Amble.Time.deltaTime = (now - Amble.Time._lastTime) / 1000.0;

            //dafuq?
            that.preupdate();
            that.update();
            that.postupdate();
            that.render();
            that.postrender();

            Amble.Time._lastTime = now;
            requestAnimationFrame(gameLoop)
        }
    };

    /* Time */
    Amble.Time = {
        deltaTime: 0,
        _lastTime: 0
    };

    Amble.Camera = function(args){
        this.position = args['position'] || new Amble.Math.Vector2({});

        if(args['context']) {
            this.context = document.getElementById(args['context']);
        } else {
            this.context = document.body;
        }

        this.size = new Amble.Math.Vector2({x: Amble.app.width, y: Amble.app.height});
        this.view = new Amble.Math.Vector2(this.position.x - this.size.x, this.position.y - this.size.y);
        this.scale = 1;
        this.layers = [];
    };

    Amble.Camera.prototype = {

        layer: function(index){
            if(index < 0) {
                index = 0;
                throw "Z-index cannot be negative!"
            }
            var layer = this.layers.find(function(l) { return l.index == index });
            if(!layer) {
                return this.addLayer(index).layer;
            } else {
                return layer.layer;
            }
        },

        addLayer: function(index){
            var l = this.layers.find(function(l) { return l.index == index });
            if(!l) {
                var layer = {
                    index: index,
                    layer: new Amble.Graphics.Layer(this.size.x, this.size.y, index)
                }
                layer.layer.appendTo(this.context)
                this.layers.push(layer);

                return layer;
            }
        },

        update: function(){
            this.view = new Amble.Math.Vector2({x: this.position.x - this.size.x/2, y: this.position.y - this.size.y/2});
            return this;
        }
    };

    Amble.Utils = {

        generateID: function() {
            return Math.floor((1 + Math.random()) * (new Date().getTime()))
              .toString(16)
              .substring(1);
        },

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

        getArgs: function(p) {

            if(p.args && p.args.length == 1){
                if(typeof p.args[0] == 'number' || typeof p.args[0] == "string" || typeof p.args[0] == 'boolean') {
                    return p.args[0];
                } else if(p.args[0].name == "Array") {
                    var a = [];
                    for(var i in p.args[0].args) {
                        a.push(this.getArgs(p.args[0].args[i]));
                    }
                    return a;
                } else {
                    var func = Amble.Utils.stringToFunction(p.args[0].name)
                    var arg = [];
                    for(var i in p.args[0].args) {
                        arg.push(this.getArgs(p.args[0].args[i]));
                    }
                    return new func(arg);
                }
            }
        },

        makeClass: function(obj, properties) {
            var o = {};
            for(var i in obj) {
                if(i == 'name') continue;
                if(typeof obj[i] === 'function') {
                    o[i] = obj[i];
                } else if(i == 'properties') {
                    if(properties != undefined) {
                        for(var x in properties) {
                            o[properties[x].name] = this.getArgs(properties[x]);
                        }
                    } else {
                        for(var j in obj[i]) {
                            o[obj[i][j].name] = this.getArgs(obj[i][j]);
                        }
                    }
                }
            }
            return o;
        },

        clone: function(obj) {
            var copy = {};
            // console.log('clone name', obj.name);
            if (obj instanceof Object || obj instanceof Array) {
                for(var attr in obj) {
                    // console.log('copy attr', attr);
                    if(attr == 'components') {
                        copy[attr] = [];
                        for(var i = 0; i < obj[attr].length; i++) {
                            var cl = Amble._classes.find(function(c) { return c.name == obj[attr][i].name });
                            if(cl) {

                                copy[attr][i] = {
                                    id: obj[attr][i].name,
                                    body: this.makeClass(cl, obj[attr][i].properties)
                                };

                            } else {

                                copy[attr][i] = {
                                    id: obj[attr][i].name,
                                    body: Amble.Utils.makeFunction(obj[attr][i])
                                }
                            }
                        }
                    } else {
                        // console.log('copy attr', attr);
                        copy[attr] = Amble.Utils.makeFunction(obj[attr]);
                    }
                }
            }
            return copy;
        },

        stringToFunction: function(str) {
            // console.log('stringtofunction', str);
            var arr = str.split(".");
            var fn = window || Amble || this;
            for (var i = 0, len = arr.length; i < len; i++) {
                fn = fn[arr[i]];
            }

            if (typeof fn !== "function") {
                console.log('stringtofunction', str);
                throw new Error("function not found");
            }

            return  fn;
        }
    };

    Amble.Actor = function(args) {

        //transform is basic actro component

        //other are optional
        //2 types of components (user custom in components array, and engine built in components like renderer)
        // this.renderer = {};
        this.components = {};
    };

    Amble.Actor.prototype = {

        getComponent: function(componentName){
            var component = this.components.find(function(c) { return c.id == componentName });
            return component.body;
        }
    };

    Amble._classes = [];
    Amble.Class = function(obj){

        this.makeArg = function(name, arg) {

            var a = {
                name: name,
                args: []
            }

            if(arg != null) {
                var n = arg.constructor.name;
                if(n !== 'Number' && n !== 'String' && n !== 'Boolean') {
                    var b = {
                        name: n,
                        args: []
                    }
                    for(var i in arg) {
                        if(typeof arg[i] !== 'function') {
                            b.args.push(this.makeArg(i, arg[i]));
                        }
                    }

                    a.args.push(b)
                } else {
                    a.args.push(arg);
                }
            }

            return a;
        };

        if(!obj) {
            throw new Error('Wrong class code!');
        } else if(typeof obj !== 'object') {
            throw new Error('Class must be an object!');
        } else if(!obj.name) {
            throw new Error('Class must have a name!');
        }

        var c = {
            name: obj.name,
            properties: [],
        }

        for(var i in obj.properties) {
            var p = this.makeArg(i, obj.properties[i])
            c.properties.push(p)
        }

        for(var i in obj) {
            if(i != 'name' && i != 'properties' && typeof obj[i] === 'function') { //add extends and whatever
                c[i] = obj[i];
            }
        }

        Amble._classes.push(c);
    };

    /* Scene */
    Amble.Scene = function(){
        this.children = [];
        // this.shortArray = [];
    };

    Amble.Scene.prototype = {

        getActorByName: function(name) {
            return this.children.find(function(c) { return c.name === name })
        },

        getActorByTag: function(tag) {
            return this.children.find(function(c) { return c.tag == tag });
        },

        getActorsByTag: function(tag) {
            return this.children.filter(function(c) { return c.tag == tag });
        },

        //get by tag array?

        getActorByID: function(id){
            return this.children.find(function(c) { return c.sceneID == id });
        },

        instantiate: function(obj){
            var actor = new Amble.Actor();
            var clone = Amble.Utils.clone(obj);
            for(var i in clone) {
                actor[i] = clone[i];
            }

            return this._add(actor, obj);
        },

        _add: function(object, prefab) {

            var sceneID = Amble.Utils.generateID();
            object.sceneID = sceneID;

            object.prefab = prefab;

            if(object.components != 'undefined') {
                for(var i = 0; i < object.components.length; i++) {
                    var _component = object.components[i].body;
                    if(typeof _component.update == 'function'){
                        _component.start(object);
                    }
                }
            }

            this.children.push(object);

            return object;
        },

        remove: function(object, callback){
            var index = this.children.indexOf(object);
            if(index != -1) {
                this.children.splice(index, 1);
                if(callback) callback(this.children);
            }
        },

        awake: function(){
            for(var i in this.children){
                /* component start */
                for(var j = 0; j < this.children[i].components.length; j++){
                    var _component = this.children[i].components[j].body;
                    if(typeof _component.start == 'function'){
                        _component.start(this.children[i]);
                    }
                }
            }
        },

        update: function(){
            for(var i = 0; i < this.children.length; i++){
                /* script update */
                for(var j = 0; j < this.children[i].components.length; j++){
                    var _component = this.children[i].components[j].body;
                    if(typeof _component.update == 'function'){
                        _component.update(this.children[i]);
                    }
                }
            }

        },

        render: function(camera){
            for(var i = 0; i < this.children.length; i++){
                /* render objects by renderer*/
                if(this.children[i].renderer && typeof this.children[i].renderer.render === 'function') {
                    this.children[i].renderer.render(this.children[i], camera)
                }
            }
        },

        //input events
        onmousewheel: function(e){
            for(var i = 0; i < this.children.length; i++){
                for(var j = 0; j < this.children[i].components.length; j++){
                    var _component = this.children[i].components[j].body;
                    if(typeof _component.onmousewheel == 'function'){
                        _component.onmousewheel(this.children[i], e);
                    }
                }
            }
        },

        onmousedown: function(e){
            for(var i = 0; i < this.children.length; i++){
                for(var j = 0; j < this.children[i].components.length; j++){
                    var _component = this.children[i].components[j].body;
                    if(typeof _component.onmousedown == 'function'){
                        _component.onmousedown(this.children[i], e);
                    }
                }
            }
        },

        onmouseup: function(e){
            for(var i = 0; i < this.children.length; i++){
                for(var j = 0; j < this.children[i].components.length; j++){
                    var _component = this.children[i].components[j].body;
                    if(typeof _component.onmouseup == 'function'){
                        _component.onmouseup(this.children[i], e);
                    }
                }
            }
        },

        onkeydown: function(e) {
            for(var i = 0; i < this.children.length; i++){
                for(var j = 0; j < this.children[i].components.length; j++){
                    var _component = this.children[i].components[j].body;
                    if(typeof _component.onkeydown == 'function'){
                        _component.onkeydown(this.children[i], e);
                    }
                }
            }
        },

        onkeyup: function(e){
            for(var i = 0; i < this.children.length; i++){
                for(var j = 0; j < this.children[i].components.length; j++){
                    var _component = this.children[i].components[j].body;
                    if(typeof _component.onkeyup == 'function'){
                        _component.onkeyup(this.children[i], e);
                    }
                }
            }
        },

        ontouchstart: function(e){
            for(var i = 0; i < this.children.length; i++){
                for(var j = 0; j < this.children[i].components.length; j++){
                    var _component = this.children[i].components[j].body;
                    if(typeof _component.ontouchstart == 'function'){
                        _component.ontouchstart(this.children[i], e);
                    }
                }
            }
        },

        oncontextmenu: function(e){
            for(var i = 0; i < this.children.length; i++){
                for(var j = 0; j < this.children[i].components.length; j++){
                    var _component = this.children[i].components[j].body;
                    if(typeof _component.oncontextmenu == 'function'){
                        _component.oncontextmenu(this.children[i], e);
                    }
                }
            }
        }
    };

    /* Transform */
    Amble.Transform = function(args) {
        this.position = args['position'] || new Amble.Math.Vector2({});
        this.rotation = args['rotation'] || 0;

        this.scale = args['scale'] || new Amble.Math.Vector2({x: 1, y: 1});
    };

    /* Graphics */
    Amble.Graphics = {};

    Amble.Graphics.Layer = function(width, height, index){
        this.canvas = document.createElement('canvas');
        this.canvas.width = width || Amble.app.width;
        this.canvas.height = height || Amble.app.height;
        this.canvas.style.position = 'absolute';
        this.canvas.style.zIndex = index.toString() || '0';

        this.ctx = this.canvas.getContext('2d');
        // if(COCOONJS) {
        //     // this.ctx = this.canvas.getContext('experimental-webgl');
        //     this.canvas.screencanvas = true;
        // } else {
        // }
        this.ctx.imageSmoothingEnabled = Amble.app.antyAliasing;
        this.ctx.mozImageSmoothingEnabled = Amble.app.antyAliasing;
        this.ctx.msImageSmoothingEnabled = Amble.app.antyAliasing;
        this.ctx.imageSmoothingEnabled = Amble.app.antyAliasing;

        //scale to fullscreen
        this.resize = function() {
            // console.log('resize-layer')
            // if(Amble.app.fullscreen) {
                var scaleX = window.innerWidth / this.canvas.width;
                var scaleY = window.innerHeight / this.canvas.height;

                var scaleToFit = Math.min(scaleX, scaleY);
                var scaleToCover = Math.max(scaleX, scaleY);

                this.canvas.style.transformOrigin = "0 0"; //scale from top left
                this.canvas.style.transform = "scale(" + scaleToFit + ")";
            // }
        }

        if(!COCOONJS) this.resize();
    };

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
        },

        font: function(font) {
            this.ctx.font = font;
            return this;
        },

        textAlign: function(align) {
            this.ctx.textAlign = align;
            return this;
        },

        fillText: function(text, x, y) {
            this.ctx.fillText(text, x, y);
            return this;
        }

        //to add more canvas methods

    };

    Amble.Graphics.AnimationRenderer = function(args) {
        this.sprite = args['sprite'];
        this.layer = args['layer'] || 0;
        this.updatesPerFrame = args['updatesPerFrame'] || 1;
        this.frames = args['frames'] || 1;

        this.play = args['play'] || false;

        this.loop = args['loop'] || true;

        this._currentFrame = 0;
        this._updates = 0;

        this._sprite = new Image();

        this._frameTimer = 0;

        this.size = new Amble.Math.Vector2({x: 0, y: 0})

        this.anchor = args['anchor'] || new Amble.Math.Vector2({x: 0.5, y: 0.5});
    };

    Amble.Graphics.AnimationRenderer.prototype = {

        render: function(self, camera) {

            var layer = camera.layer(this.layer);

            layer.ctx.save();

            if(this._sprite) {

                if(this._sprite.src != this.sprite && Amble.app.loader.isDone()) {
                    this._sprite = Amble.app.loader.getAsset(this.sprite);
                    if(!this._sprite) return;
                }

                if(this.anchor.x < 0) this.anchor.x = 0;
                if(this.anchor.x > 1) this.anchor.x = 1;

                if(this.anchor.y < 0) this.anchor.y = 0;
                if(this.anchor.y > 1) this.anchor.y = 1;

                var width = (this._sprite.width/this.frames) | 0;
                var height = this._sprite.height;

                this.size.x = width * self.transform.scale.x;
                this.size.y = height * self.transform.scale.y;

                var x = (self.transform.position.x - camera.view.x)// | 0 <- round for optymalization
                var y = (self.transform.position.y - camera.view.y)// | 0 <- round for optymalization

                layer.ctx.translate(x, y);

                if(self.transform.scale.x != 1 || self.transform.scale.y != 0) {
                    layer.ctx.scale(self.transform.scale.x, self.transform.scale.y);
                }

                if(self.transform.rotation != 0) {
                    layer.ctx.rotate(-self.transform.rotation * Amble.Math.TO_RADIANS);
                }

                if(this._sprite.src) {
                    layer.ctx.drawImage(
                        this._sprite,
                        this._currentFrame * width,
                        0,
                        width,
                        height,
                        (-width * this.anchor.x) | 0,
                        (-height * this.anchor.y) | 0,
                        width,
                        height
                    );
                }

            } else {
                this._sprite = Amble.app.loader.getAsset(this.sprite);
            }

            layer.ctx.restore();

            this._updates++;
        	if(this._updates > this.updatesPerFrame) {
        		this._updates = 0;
        		if(this._currentFrame < this.frames - 1) this._currentFrame++;
        		else if(this.loop) this._currentFrame = 0;
        	}
        }
    };


    Amble.Graphics.SpriteRenderer = function(args) {
        this.sprite = args['sprite'];
        this.layer = args['layer'] || 0;
        this.l = args['layer'] || 0;

        this._sprite = new Image();

        this.size = new Amble.Math.Vector2({})

        // ???
        this.anchor = new Amble.Math.Vector2({});
    }

    Amble.Graphics.SpriteRenderer.prototype = {

        render: function(self, camera) {

            var layer = camera.layer(this.layer);

            layer.ctx.save();

            if(this._sprite) {

                if(this._sprite.src != this.sprite && Amble.app.loader.isDone()) {
                    this._sprite = Amble.app.loader.getAsset(this.sprite);
                    if(!this._sprite) return;
                }

                var width = this.size.x = this._sprite.width;
                var height = this.size.y = this._sprite.height;

                this.size.x = width * self.transform.scale.x;
                this.size.y = height * self.transform.scale.y;

                var x = self.transform.position.x - camera.view.x;
                var y = self.transform.position.y - camera.view.y;

                layer.ctx.translate(x, y);

                if(self.transform.scale.x != 1 || self.transform.scale.y != 0) {
                    layer.ctx.scale(self.transform.scale.x, self.transform.scale.y);
                }

                if(self.transform.rotation != 0) {
                    layer.ctx.rotate(-self.transform.rotation * Amble.Math.TO_RADIANS);
                }

                if(this._sprite.src) {
                    layer.ctx.drawImage(this._sprite, -width/2, -height/2);
                    if(self.selected) {
                        layer.ctx.save();
                        layer.strokeStyle(
                            'magenta'
                        ).lineWidth(
                            3
                        ).strokeRect(
                            -width/2,
                            -height/2,
                            width,
                            height
                        )
                        layer.ctx.restore();
                    }
                }

            } else {
                this._sprite = Amble.app.loader.getAsset(this.sprite);
            }

            layer.ctx.restore();
        }
    };

    /* Amble.Graphics.Renderer constructor */
    Amble.Graphics.RectRenderer = function(args){
        this.color = args['color'];
        this.layer = args['layer'] || 0;
        this.size = args['size'];
        //to implement
        this.anchor = new Amble.Math.Vector2({});
    };

    /* Amble.Graphics.Renderer functions */
    Amble.Graphics.RectRenderer.prototype = {

        render: function(self, camera){

            var layer = camera.layer(this.layer);

            var width = this.size.x;
            var height = this.size.y;
            var x = self.transform.position.x - camera.view.x;
            var y = self.transform.position.y - camera.view.y;

            layer.ctx.save();

            // move origin to object origin
            layer.ctx.translate(x, y);

            //scale
            layer.ctx.scale(self.transform.scale.x, self.transform.scale.y);

            // rotation in radians
            layer.ctx.rotate(-self.transform.rotation * Amble.Math.TO_RADIANS);

            // draw
            layer.fillStyle(this.color).fillRect(-width/2, -height/2, width, height);

            if(self.selected) {
                layer.ctx.save();
                layer.strokeStyle(
                    'magenta'
                ).lineWidth(
                    3
                ).strokeRect(
                    -width/2,
                    -height/2,
                    width,
                    height
                )
                layer.ctx.restore();
            }

            layer.ctx.restore();
        }

    };

    /* Math */
    Amble.Math = {};

    Amble.Math.TO_RADIANS = Math.PI/180;

    Amble.Math.Vector2 = function(args){
        this.x = args['x'] || 0;
        this.y = args['y'] || 0;
    };

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

        dot: function(other) {
            return this.x * other.x + this.y * other.y;
        },

        length2: function(){
            return this.dot(this);
        },

        length: function() {
            return Math.sqrt(this.length2());
        },

        normalize: function(){
            var l = this.length();
            if(l > 0) {
                this.x = this.x / l;
                this.y = this.y / l;
            }
            return this;
        }
    }

    Amble.Math.Vector3 = function(args){
        this.x = args['x'] || 0;
        this.y = args['y'] || 0;
        this.z = args['z'] || 0;
    };

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

        dot: function(other) {
            return this.x * other.x + this.y * other.y + this.z * other.z;
        },

        length2: function(){
            return this.dot(this);
        },

        length: function() {
            return Math.sqrt(this.length2());
        },

        normalize: function(){
            var l = this.length();
            if(l > 0) {
                this.x = this.x / l;
                this.y = this.y / l;
                this.z = this.z / l;
            }
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
    }

    Amble.Input._eventFunctions = {

        keydown: function(e){
            if(Amble.Input.debug)
                console.log(e.which);
            Amble.Input.isShiftPressed = e.shiftKey;
            Amble.Input.isCtrlPressed = e.ctrlKey;
            Amble.Input._keyValues[e.which] = true;

            Amble.app.scene.onkeydown(e);
        },

        keyup: function(e){
            Amble.Input._keyValues[e.which] = false;

            Amble.app.scene.onkeyup(e);
        },

        mousedown: function(e){
            if(Amble.Input.debug)
                console.log(e.which);
            Amble.Input._mouseValues[e.which] = true;

            Amble.app.scene.onmousedown(e);
        },

        mouseup: function(e){
            if(Amble.Input.debug)
                console.log(e.which);
            Amble.Input._mouseValues[e.which] = false;

            Amble.app.scene.onmouseup(e);
        },

        mousemove: function(e){
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
        },

        wheel: function(e){
            Amble.Input.wheelDelta.x = e.deltaX;
            Amble.Input.wheelDelta.y = e.deltaY;
            Amble.Input.wheelDelta.z = e.deltaZ;

            Amble.app.scene.onmousewheel(e);
        },

        contextmenu: function(e) {
            e.preventDefault();
            Amble.app.scene.oncontextmenu(e);
        }
    }

    Amble.Input._setListeners = function(){

        var element = Amble.app.mainCamera.camera.context;
        document.addEventListener('keydown', Amble.Input._eventFunctions.keydown, false);
        document.addEventListener('keyup', Amble.Input._eventFunctions.keyup, false);
        element.addEventListener('mousedown', Amble.Input._eventFunctions.mousedown, false);
        element.addEventListener('mouseup', Amble.Input._eventFunctions.mouseup, false);
        element.addEventListener('mousemove', Amble.Input._eventFunctions.mousemove, false);
        element.addEventListener("wheel", Amble.Input._eventFunctions.wheel, false);
        element.addEventListener("contextmenu", Amble.Input._eventFunctions.contextmenu, false);

        //touch start
        //touch end
        //touch move
    }

    Amble.Input._removeListeners = function(){

        var element = Amble.app.mainCamera.camera.context;
        if (document.removeEventListener) { // For all major browsers, except IE 8 and earlier

            document.removeEventListener('keydown', Amble.Input._eventFunctions.keydown, false);
            document.removeEventListener('keyup', Amble.Input._eventFunctions.keyup, false);
            element.removeEventListener('mousedown', Amble.Input._eventFunctions.mousedown, false);
            element.removeEventListener('mouseup', Amble.Input._eventFunctions.mouseup, false);
            element.removeEventListener('mousemove', Amble.Input._eventFunctions.mousemove, false);
            element.removeEventListener("wheel", Amble.Input._eventFunctions.wheel, false);
            element.removeEventListener("contextmenu", Amble.Input._eventFunctions.contextmenu, false);

        } else if (document.detachEvent) { // For IE 8 and earlier versions

            document.detachEvent('keydown', Amble.Input._eventFunctions.keydown, false);
            document.detachEvent('keyup', Amble.Input._eventFunctions.keyup, false);
            element.detachEvent('mousedown', Amble.Input._eventFunctions.mousedown, false);
            element.detachEvent('mouseup', Amble.Input._eventFunctions.mouseup, false);
            element.detachEvent('mousemove', Amble.Input._eventFunctions.mousemove, false);
            element.detachEvent("wheel", Amble.Input._eventFunctions.wheel, false);
            element.detachEvent("contextmenu", Amble.Input._eventFunctions.contextmenu, false);

        }
    }

    /* Data */
    Amble.Data = {};

    Amble.Data.Loader = function(){
        this.queue = [];
        this.types = [];
        this.names = [];
        this.successCount = 0;
        this.errorCount = 0;
        this.cache = [];
    };

    Amble.Data.Loader.prototype = {
        /* Supported types: image, json */

        load: function(type, path, name){
            this.queue.push(path);
            this.types.push(type);
            this.names.push(name);
        },

        isDone: function(){
            return (this.queue.length == this.successCount + this.errorCount);
        },

        getAsset: function(path){
            var a =  this.cache.find(function(c) { return c.path == path });
            if(a) return a.data;
            else return undefined;
        },

        loadAll: function(callback){

            if(this.queue.length == 0){
                callback();
            }

            for(var i = 0; i < this.queue.length; i++){
                var that = this;
                switch(this.types[i]){
                    /* loading image */
                    case 'img':
                    case 'image':
                        var imgPath = this.queue[i];
                        var name = this.names[i];

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
                        var jsonPath = this.queue[i];
                        var name = this.names[i];

                        var xobj = new XMLHttpRequest();
                        // xobj.overrideMimeType("application/json");
                        xobj.open('GET', jsonPath, true);

                        xobj.onreadystatechange = function(){

                            // console.log('xmlhttprequest change', xobj.readyState, xobj.status)

                            if (xobj.readyState == 4 && xobj.status == 200) { //success

                                // var href = window.location.href.toString();
                                // var path = xobj.responseURL.toString().split(href).pop();

                                that.cache.push({
                                    data: xobj.responseText.toString(),
                                    type: 'json',
                                    path: name
                                });

                                that.successCount++;

                                if(that.isDone()) callback();

                            } else if(xobj.readyState == 4 && xobj.status == 404){ //err

                                // var href = window.location.href.toString();
                                // var path = xobj.responseURL.toString().split(href).pop();

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

    return Amble;

}());
