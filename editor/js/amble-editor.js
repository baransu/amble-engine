window.Amble = (function(){

    var Amble = {};
    Amble.app = {};

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

                for(var i = 0; i < Amble.app.mainCamera.camera.layers.length; i++) {
                    Amble.app.width = camera.layers[i].layer.canvas.width = width;
                    Amble.app.height = camera.layers[i].layer.canvas.height = height;
                }

                // Amble.app.mainCamera.getComponent('Camera').onresize(Amble.app.mainCamera);

            });
        }

        this.scene = new Amble.Scene();

        this.mainCamera = this.scene.instantiate(args['sceneCamera']);

        // this.scene.instantiate(args['mainCamera']);

        this.width = this.mainCamera.camera.size.x || 800;
        this.height = this.mainCamera.camera.size.y || 600;

        //init all public game loop functions
        var gameLoopFunctionsList = ['preload', 'loaded', 'start', 'preupdate', 'postupdate', 'prerender', 'postrender'];
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

            var camera = this.mainCamera.camera;

            for(var i = 0; i < camera.layers.length; i++) {
                camera.layers[i].layer.clear();
            }

            var layer = camera.layer(0);
            layer.strokeStyle('white').lineWidth(0.5);
            layer.ctx.beginPath();

            var lineSpacing = 200;

            var verticalLinesCount = ((this.width/camera.scale)/lineSpacing) * 2;
            var horizontalLinesCount = ((this.height/camera.scale)/lineSpacing) * 2;
            var startX = Math.floor(camera.position.x - (camera.size.x)/camera.scale) - (camera.position.x - (camera.size.x)/camera.scale) % lineSpacing;
            var startY = Math.floor(camera.position.y - (camera.size.y)/camera.scale) - (camera.position.y - (camera.size.y)/camera.scale) % lineSpacing;

            //vertical lines
            for(var i = -2; i < verticalLinesCount; i++) {
                layer.ctx.moveTo(startX + lineSpacing * i - camera.view.x, camera.position.y - camera.size.y/camera.scale - camera.view.y - lineSpacing);
                layer.ctx.lineTo(startX + lineSpacing * i - camera.view.x, camera.position.y + camera.size.y/camera.scale - camera.view.y);
            }

            //horizonala
            for(var i = -2; i < horizontalLinesCount; i++) {
                layer.ctx.moveTo(camera.position.x - camera.size.x/camera.scale - camera.view.x - lineSpacing * 2, startY + lineSpacing * i - camera.view.y);
                layer.ctx.lineTo(camera.position.x + camera.size.x/camera.scale - camera.view.x, startY + lineSpacing * i - camera.view.y);
            }

            layer.ctx.stroke();


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

            }, 0);
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
        this.context = document.getElementById(args['context']) || document.body;
        this.size =  new Amble.Math.Vector2({x: parseInt(this.context.offsetWidth), y: parseInt(this.context.offsetHeight)});
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
            var layer = this.layers.find(l => l.index == index);
            if(!layer) {
                return this.addLayer(index).layer;
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

                return layer;
            }
        },

        update: function(){
            this.view = new Amble.Math.Vector2({x: this.position.x - this.size.x/2, y: this.position.y - this.size.y/2});
            return this;
        }
    };

    /* Utils */
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
            if (obj instanceof Object || obj instanceof Array) {
                for(var attr in obj) {
                    if(attr == 'components') {
                        copy[attr] = [];
                        for(var i in obj[attr]) {
                            if(obj[attr][i].type == 'editor') {

                                var cl = Amble._classes.find(c => c.name == obj[attr][i].name);
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

                            } else {
                                continue;
                            }
                        }
                    } else {
                        copy[attr] = Amble.Utils.makeFunction(obj[attr]);
                    }
                }
            }
            // console.log(copy)
            return copy;
        },

        stringToFunction: function(str) {
            var arr = str.split(".");
            var fn = window || this;
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

        //other are optional
        //2 types of components (user custom in components array, and engine built in components like renderer)
        // this.renderer = {};
        this.components = {};
    };

    Amble.Actor.prototype = {

        getComponent: function(componentName){
            var component = this.components.find(c => c.id == componentName);
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

        var a = Amble._classes.find(s => s.name == c.name);
        if(a) {
            var index = Amble._classes.indexOf(a);
            Amble._classes.splice(index, 1);
        }

        Amble._classes.push(c);

        /*
        flow order:

        - every class is registered in engine and can be extended?
        - user can create custom classes which are not engine default

        */

    };

    /* Scene */
    Amble.Scene = function(){
        this.children = [];
        this.shortArray = [];
    };

    Amble.Scene.prototype = {

        createSceneFile: function(){

            var data = [];
            for(var i = 1; i < this.children.length; i++) {
                this.children[i].prefab.name = this.children[i].name;
                data.push(this.children[i].prefab);
            }

            // console.log(data);
            return data;
        },

        getActorByName: function(name) {
            return this.children.find(c => c.name === name)
        },

        getActorByTag: function(tag) {
            return this.children.find(c => tag === tag);
        },

        getActorsByTag: function(tag) {
            return this.children.filter(c => tag === tag);
        },

        //get by tag array?

        getActorByID: function(id){
            return this.children.find(c => c.sceneID === id);
        },

        instantiate: function(obj){
            var actor = new Amble.Actor();
            var clone = Amble.Utils.clone(obj);
            for(var i in clone) {
                actor[i] = clone[i];
            }

            actor.prefab = obj;

            return this._add(actor);
        },

        _add: function(object, prefab) {

            var sceneID = Amble.Utils.generateID();
            object.sceneID = sceneID;

            if(object.components != 'undefined') {
                for(var i in object.components) {
                    var _component = object.components[i].body;
                    if(typeof _component.start == 'function'){
                        _component.start(object);
                    }
                }
            }

            this.children.push(object);

            this.shortArray.push({
                name: object.name,
                sceneID: sceneID,
                selected: false
            });

            return object;
        },

        remove: function(object){
            var index = this.children.indexOf(object);
            if(index != -1) {
                this.children.splice(index, 1);
            }
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
        },

        //input events
        onmousewheel: function(e){
            for(var i in this.children){
                for(var j in this.children[i].components){
                    var _component = this.children[i].components[j].body;
                    if(typeof _component.onmousewheel == 'function'){
                        _component.onmousewheel(this.children[i], e);
                    }
                }
            }
        },

        onmousedown: function(e){
            for(var i in this.children){
                for(var j in this.children[i].components){
                    var _component = this.children[i].components[j].body;
                    if(typeof _component.onmousedown == 'function'){
                        _component.onmousedown(this.children[i], e);
                    }
                }
            }
        },

        onmouseup: function(e){
            for(var i in this.children){
                for(var j in this.children[i].components){
                    var _component = this.children[i].components[j].body;
                    if(typeof _component.onmouseup == 'function'){
                        _component.onmouseup(this.children[i], e);
                    }
                }
            }
        },

        onkeydown: function(e) {
            for(var i in this.children){
                for(var j in this.children[i].components){
                    var _component = this.children[i].components[j].body;
                    if(typeof _component.onkeydown == 'function'){
                        _component.onkeydown(this.children[i], e);
                    }
                }
            }
        },

        onkeyup: function(e){
            for(var i in this.children){
                for(var j in this.children[i].components){
                    var _component = this.children[i].components[j].body;
                    if(typeof _component.onkeyup == 'function'){
                        _component.onkeyup(this.children[i], e);
                    }
                }
            }
        }
    };

    /* Transform */
    Amble.Transform = function(args) {
        this.position = args['position'] || new Amble.Math.Vector2({});
        this.rotation = args['rotation'] || 0;

        //move size to other component -> there rename to scale
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
        },

        strokeText: function(text, x, y) {
            this.ctx.strokeText(text, x, y);
            return this;
        }

        //more canvas methods

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

        this.type = "animation";
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


    Amble.Graphics.EngineRenderer = function(args) {

        this.layer = args['layer'] || 0;
        this.size = new Amble.Math.Vector2({});

        this.type = "engine";
    };

    Amble.Graphics.EngineRenderer.prototype = {

        render: function(self, camera) {

            var layer = camera.layer(this.layer);

            layer.ctx.save();

            var x = self.transform.position.x - camera.view.x;
            var y = self.transform.position.y - camera.view.y;

            layer.font('30px Arial');

            this.size.x = layer.ctx.measureText(self.name || 'Actor').width * 2;
            this.size.y = 60;

            layer.ctx.translate(x, y);

            //scale
            layer.ctx.scale(self.transform.scale.x, self.transform.scale.y);

            // rotation in radians
            layer.ctx.rotate(-self.transform.rotation * Amble.Math.TO_RADIANS);

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

            layer.textAlign(
                'center'
            ).fillStyle(
                'transparent'
            ).fillRect(
                -this.size.x/2,
                -this.size.y/2,
                this.size.x,
                this.size.y
            ).fillStyle(
                'white'
            ).fillText(
                self.name || 'Actor',
                0,
                -15
            );

            if(self.selected) {
                layer.strokeStyle(
                    'magenta'
                ).lineWidth(
                    1
                ).strokeText(
                    self.name || 'Actor',
                    0,
                    -15
                )
            }

            layer.ctx.restore();
        }
    };

    Amble.Graphics.SpriteRenderer = function(args) {
        this.sprite = args['sprite'];
        this.layer = args['layer'] || 0;
        this.l = args['layer'] || 0;

        this._sprite = new Image();

        this.size = new Amble.Math.Vector2({})

        //to implement
        this.anchor = new Amble.Math.Vector2({});

        this.type = "sprite";
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
                var x = self.transform.position.x - camera.view.x;
                var y = self.transform.position.y - camera.view.y;

                layer.ctx.translate(x, y);
                layer.ctx.scale(self.transform.scale.x, self.transform.scale.y);
                layer.ctx.rotate(-self.transform.rotation * Amble.Math.TO_RADIANS);

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

        this.type = "rect";
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

            // layer.ctx.save();
            // layer.strokeStyle(
            //     'black'
            // ).lineWidth(
            //     1
            // ).strokeRect(
            //     -width/2,
            //     -height/2,
            //     width,
            //     height
            // )
            // layer.ctx.restore();

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

        } else if (document.detachEvent) { // For IE 8 and earlier versions

            document.detachEvent('keydown', Amble.Input._eventFunctions.keydown, false);
            document.detachEvent('keyup', Amble.Input._eventFunctions.keyup, false);
            element.detachEvent('mousedown', Amble.Input._eventFunctions.mousedown, false);
            element.detachEvent('mouseup', Amble.Input._eventFunctions.mouseup, false);
            element.detachEvent('mousemove', Amble.Input._eventFunctions.mousemove, false);
            element.detachEvent("wheel", Amble.Input._eventFunctions.wheel, false);

        }
    }

    /* Data */
    Amble.Data = {};

    Amble.Data.Loader = function(){
        this.queue = [];
        this.types = [];
        this.successCount = 0;
        this.errorCount = 0;
        this.cache = [];
        this.names = [];
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
            var a =  this.cache.find(c => c.path == path);
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

                        var xobj = new XMLHttpRequest();
                        xobj.overrideMimeType("application/json");
                        xobj.open('GET', jsonPath, true);

                        xobj.addEventListener("load", function(e){
                            var path = e.srcElement.responseURL.toString();
                            var href = window.location.href.toString();

                            var path = path.split(href).pop();
                            that.cache.push({
                                data: e.srcElement.responseText,
                                type: 'json',
                                path: path
                            });

                            that.successCount++;
                            if(that.isDone()) callback();
                        }, false);

                        xobj.addEventListener("error", function(e){
                            var path = e.srcElement.responseURL.toString();
                            var href = window.location.href.toString();

                            var path = path.split(href).pop();

                            that.cache.push({
                                data: e.srcElement.responseText,
                                type: 'json',
                                path: path
                            });

                            that.errorCount++;
                            if(that.isDone()) callback();
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
