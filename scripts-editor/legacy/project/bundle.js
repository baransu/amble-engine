(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
window.Flow = require('./flow.js');
window.Amble = (function(){

    var Amble = {};
    Amble.app = {};

    Object.size = function(obj) {
        var size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
        return size;
    };

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

                // Amble.app.mainCamera.getComponent('Camera').onresize(Amble.app.mainCamera);

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
            if(Amble.Time._lastTime == 0) {
                Amble.Time.deltaTime = 0;
            } else {
                Amble.Time.deltaTime = (now - Amble.Time._lastTime) / 1000.0;
            }

            //dafuq?
            that.preupdate();
            that.update();
            that.postupdate();
            that.prerender()
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

                return layer;
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
                    if(attr != 'scritps') {
                        copy[attr] = Amble.Utils.makeFunction(obj[attr]);
                    } else {
                        copy[attr] = obj[attr];
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
        this.scripts = {};
    };


    Amble.Actor.prototype = {
        // getComponent: function(componentName){
        //     var component = this.components.find(c => c.id == componentName);
        //     return component.body;
        // }
    };

    /* Scene */
    Amble.Scene = function(){
        this.children = [];
    };

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
            for(var i in object.scripts) {
                Flow.queueNetwork(object, object.scripts[i].name, 'OnStart');
            }

            this.children.push(object);
            return object;
        },

        remove: function(object){
            var index = this.children.indexOf(object);
            if(index != -1)
                this.children.splice(index, 1);
        },

        render: function(camera){
            for(var i in this.children){
                /* render objects by renderer*/
                if(this.children[i].renderer && typeof this.children[i].renderer.render === 'function') {
                    this.children[i].renderer.render(this.children[i], camera)
                }
            }
        },

        update: function(){
            for(var i in this.children){
                /* script update */
                for(var j in this.children[i].scripts){
                    Flow.queueNetwork(this.children[i], this.children[i].scripts[j].name, 'OnUpdate');
                }
            }
        },

        //input events
        onmousewheel: function(e){
            for(var i in this.children){
                for(var j in this.children[i].scripts){
                    Flow.queueNetwork(this.children[i], this.children[i].scripts[j].name, 'OnMouseWheel');
                }
            }
        },

        onmousedown: function(e){
            for(var i in this.children){
                for(var j in this.children[i].scripts){
                    Flow.queueNetwork(this.children[i], this.children[i].scripts[j].name, 'OnMouseDown');
                }
            }
        },

        onmouseup: function(e){
            for(var i in this.children){
                for(var j in this.children[i].scripts){
                    Flow.queueNetwork(this.children[i], this.children[i].scripts[j].name, 'OnMouseUp');
                }
            }
        },

        onkeydown: function(e) {
            for(var i in this.children){
                for(var j in this.children[i].scripts){
                    Flow.queueNetwork(this.children[i], this.children[i].scripts[j].name, 'OnKeyDown');
                }
            }
        },

        onkeyup: function(e){
            for(var i in this.children){
                for(var j in this.children[i].scripts){
                    Flow.queueNetwork(this.children[i], this.children[i].scripts[j].name, 'OnKeyUp');
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
        }

    };

    /* Amble.Graphics.Renderer constructor */
    Amble.Graphics.RectRenderer = function(args){
        this.color = args['color'] || 'pink';
        this.layer = args['layer'] || 0
    };

    /* Amble.Graphics.Renderer functions */
    Amble.Graphics.RectRenderer.prototype = {

        render: function(self, camera){
            camera.layer(this.layer)
                .fillStyle(this.color)
                .fillRect(self.transform.position.x - camera.view.x - self.transform.size.x/2, self.transform.position.y - camera.view.y - self.transform.size.y/2, self.transform.size.x, self.transform.size.y);
        }

    };

    /* Math */
    Amble.Math = {};

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

        normalize: function(){
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
    };

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
                            var path = e.srcElement.responseURL.toString();
                            var href = window.location.href.toString();
                            that.cache[path.split(href).pop()] = e.srcElement.responseText;
                            that.successCount++;
                            if(that.isDone()){
                                callback();
                            }
                        }, false);
                        xobj.addEventListener("error", function(e){
                            var path = e.srcElement.responseURL.toString();
                            var href = window.location.href.toString();
                            that.cache[path.split(href).pop()] = e.srcElement.responseText;
                            that.errorCount++;
                            if(that.isDone()){
                                callback();
                            }
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

},{"./flow.js":2}],2:[function(require,module,exports){
var FLOW = {};
FLOW.variables = {};
FLOW._networks = [];
FLOW._currentNetwork = {};
FLOW._components = [];
FLOW._currentEndCounts = 0;

//add new component to components list
FLOW.component = function(component) {

    FLOW._components.push(component);
}

//process component
FLOW.initComponent = function(componentName, componentId) {

    var component = FLOW._components.find(c => c.name == componentName);
    if(!component) throw new Error('no component found: ' + componentName);

    //input
    var newInput = component.input.map(p => ({
        name: p.name,
        type: p.type,
        value: p.value || null,
        connectedTo: {}
    }));

    //output
    var newOutput = component.output.map(p => ({
        name: p.name,
        type: p.type,
        value: p.value || null,
        connectedTo: []
    }));

    var _component = {
        id: componentId,
        name: component.name,
        input: newInput,
        output: newOutput,
        type: component.type,
        body: component.body
    };

    return _component;
}

//process network and add to networks list
FLOW.network = function(network){

    network._components = [];

    for(var key in network.components) {

        var componentName = network.components[key].component;
        var componentId = network.components[key].id;
        var component = FLOW.initComponent(componentName, componentId);

        if(component.type == "event") {
            network._components.unshift(component);
        } else {
            network._components.push(component);
        }
    }

    //connections
    for(var key in network.connections) {

        // find the component
        var component = network._components.find(c => c.id === network.connections[key].out.split('.')[0]);
        if (!component) throw new Error('whoops no component found: ' + key);

        // find the ports
        var port = component.output.find(n => n.name === network.connections[key].out.split('.')[1]);
        if (!port) throw new Error('whoops no port found: ' + network.connections[key].out + ' in component: ' + component.name);

        // find the second component
        var secondComponent = network._components.find(c => c.id === network.connections[key].in.split('.')[0]);
        if (!secondComponent) throw new Error('whoops cannot connect: ' + key + ' to missing: ' + network.connections[key]);

        // find the second process's port to connect to
        var connectedPort = secondComponent.input.find(p => p.name === network.connections[key].in.split('.')[1]);
        if (!connectedPort) throw new Error('whoops missing ' + network.connections[key] + ' port for: ' + componentName);

        //output
        port.connectedTo.push({
            id: secondComponent.id || '',
            port: connectedPort.name || '',
            type: connectedPort.type || ''
        })

        //input
        connectedPort.connectedTo = {
            id: component.id || '',
            port: port.name || '',
            type: port.type || ''
        }
    }

    FLOW._networks.push(network);
}

FLOW.queueNetwork = function(self, scriptName, name) {

    var networks = FLOW._networks.filter(n => n.name === name && n.scriptName == scriptName);

    for(var i = 0; i < networks.length; i++) {

        networks[i].self = self;

        FLOW.startNetwork(networks[i]);
    }
}

FLOW.startNetwork = function(network){

    var variablesConnections = network.variablesConnections;

    var variables = network.variables;

    //variables inputs
    for(var key in variablesConnections) {

        var componentId = key.split('.')[0];
        if (!componentId) throw new Error('whoops... no component ID for key: ' + key)

        var portName = key.split('.')[1];
        if(!portName) throw new Error('whoops... no port ID for key: ' + key)

        var component = network._components.find(c => c.id === componentId);
        if (!component) throw new Error('whoops.. no component: ' + componentId);

        // console.log(component);
        var port = component.input.find(p => p.name === portName);
        if (!port) throw new Error('whoops.. no port: ' + portName)

        var variable = variables.find(v => v.id == variablesConnections[key]);

        var indexOfPort = component.input.indexOf(port);
        component.input[indexOfPort].connectedTo = {
            id: variable.id,
            type: 'variable'
        };
    }

    network.running = true;

    FLOW.step(network, network._components[0]);

}

FLOW.step = function(network, component) {

    //process in/out into array
    var args = [];

    // console.log(component);

    var inputs = FLOW.getInputs(network, component);

    for(var i = 0; i < inputs.length; i++) {
        args.push(inputs[i]);
    }

    for(var i = 0; i < component.output.length; i++) {
        if(component.output[i].type != 'exe') {
            args.push(component.output[i]);
        }
    }

    var next = component.body.apply(component, args);

    if(next === -1) throw new Error('Flow unexpected stoped at: ' + component.id);

    if(component.output[next].connectedTo.length > 0) {
        var _component = network._components.find(c => c.id == component.output[next].connectedTo[0].id);

        if(typeof _component == 'undefined') {
            network.running = false;
            // console.log(network.scriptName + ' network end undefined')
        } else {
            FLOW.step(network, _component);
        }

    } else {
        network.running = false;
        // console.log(network.scriptName + ' network end not undefined')
    }
}

FLOW.getInputs = function(network, component)  {

    var args = [];

    for(var i = 0; i < component.input.length; i++) {
        if(component.input[i].type != 'exe') {

            var c = component.input[i];

            if(c.connectedTo.type == 'variable') {

                if(component.name == 'setVariable' && i == 1) {
                    var variable = network.variables.find(v => v.id == c.connectedTo.id);
                    var vars = network.variables.filter(v => v.name == variable.name);
                    c.value = vars;
                } else {
                    var variable = network.variables.find(v => v.id == c.connectedTo.id);
                    c.value = variable.value;
                }



            } else if (c.connectedTo.type == 'data') {

                var comp = network._components.find(v => v.id == c.connectedTo.id);
                if(comp.output[0].type == 'exe') {
                    var port = comp.output.find(p => p.name == c.connectedTo.port);
                    c.value = port.value;

                } else {

                    var argss = [];

                    var inputs = FLOW.getInputs(network, comp);
                    for(var x = 0; x < inputs.length; x++) {
                        argss.push(inputs[x]);
                    }

                    for(var x = 0; x < comp.output.length; x++) {
                        if(comp.output[x].type != 'exe') {
                            argss.push(comp.output[x]);
                        }
                    }

                    comp.body.apply(comp, argss);

                    var port = comp.output.find(p => p.name == c.connectedTo.port);
                    c.value = port.value;
                }
            }

            args.push(c);
        }
    }

    //secial functions
    if(component.name === 'forLoop') {

        args.unshift(network);

    } else if (component.name === 'self') {

        args.unshift(network.self);

    }

    return args;
}

FLOW.ComponentsFunction = {}

FLOW.ComponentsFunction.forLoop = function(network, first, last, currentIndex) {
    for(var i = first.value; i <= last.value; i++) {
        currentIndex.value = i;

        var component = network._components.find(c => c.id == this.output[0].connectedTo[0].id);
        FLOW.step(network, component);
    }
    return 1;
}

FLOW.ComponentsFunction.consoleLog  = function(data) {
    console.log(data.value);
    return 0;
}

FLOW.ComponentsFunction.add  = function(a, b, c) {
    c.value = a.value + b.value;
}

FLOW.ComponentsFunction.subtract  = function(a, b, c) {
    c.value = a.value - b.value;
}

FLOW.ComponentsFunction.multiply  = function(a, b, c) {
    c.value = a.value * b.value;
}

FLOW.ComponentsFunction.divide  = function(a, b, c) {
    c.value = a.value/b.value;
}

FLOW.ComponentsFunction.getMousePosition = function(position) {
    position.value = Amble.Input.mousePosition;
}

FLOW.ComponentsFunction.mouseToWorldPosition = function(position) {
    var x = Amble.Input.mousePosition.x + Amble.app.mainCamera.camera.view.x;
    var y = Amble.Input.mousePosition.y + Amble.app.mainCamera.camera.view.y;
    position.value = new Amble.Math.Vector2({x: x, y: y});
}

FLOW.ComponentsFunction.branch  = function(condition) {
    if(condition.value) {
        return 0; //out node id first (true)
    } else {
        return 1; //out node id second (false)
    }
}

FLOW.ComponentsFunction.setVector2 = function(vec2In, x, y, vec2Out){
    vec2In.value.x = x.value;
    vec2In.value.y = y.value;
    vec2Out.value = vec2In.value;
    return 0;
}

FLOW.ComponentsFunction.setVariable = function(variables, v, valueOut){

    for(var i = 0; i < variables.value.length; i++) {
        variables.value[i].value = v.value;
        valueOut.value = v.value;
    }

    return 0;
}

FLOW.ComponentsFunction.getVector2 = function(vec2, x, y){
    x.value = vec2.value.x;
    y.value = vec2.value.y;
}

FLOW.ComponentsFunction.mathSin = function(a,b){
    b.value = Math.sin(a.value);
}

FLOW.ComponentsFunction.mathCos = function(a,b){
    b.value = Math.cos(a.value);
}

FLOW.ComponentsFunction.self = function(self, selfOut){
    selfOut.value = self;
}

FLOW.ComponentsFunction.deltaTime = function(deltaOut) {
    deltaOut.value = Amble.Time.deltaTime;
}

FLOW.ComponentsFunction.getTransform = function(self, position, size){
    position.value = self.value.transform.position;
    size.value = self.value.transform.size;
}

FLOW.ComponentsFunction.OnStart  = function() {
    return 0;
}

FLOW.ComponentsFunction.OnUpdate  = function() {
    return 0;
}

FLOW.ComponentsFunction.OnMouseWheel  = function() {
    return 0;
}

FLOW.ComponentsFunction.OnMouseUp  = function() {
    return 0;
}

FLOW.ComponentsFunction.OnMouseDown  = function() {
    return 0;
}

FLOW.ComponentsFunction.OnKeyUp  = function() {
    return 0;
}

FLOW.ComponentsFunction.OnKeyDown  = function() {
    return 0;
}

module.exports = FLOW;

},{}],3:[function(require,module,exports){
var app = new Amble.Application({

    resize: true,
    /* set all loading there */

    mainCamera: {
        camera: { name: "Amble.Camera", args: {
            position: { name: "Amble.Math.Vector2", args: {x:0 ,y:0}},
            context: "workspace"
        }}
    },

    preload: function(){

        this.loader.load('json', 'scripts/untitled.ascript');
        // this.loader.load('json', 'scripts/simpleTestScript.ascript');
        this.loader.load('json', 'data/components.json');

    },

    /* every thing loaded */
    start: function(){
        // move to engine?
        var comp = JSON.parse(this.loader.getAsset('data/components.json'));
        for(var i = 0; i < comp.components.length; i++) {
            Flow.component({
                name: comp.components[i].idName,
                input: comp.components[i].input,
                type: comp.components[i].type,
                output: comp.components[i].output,
                connectedTo: null,
                body: Flow.ComponentsFunction[comp.components[i].idName]
            });
        }

        var script = JSON.parse(this.loader.getAsset('scripts/untitled.ascript'));
        for(var i = 0; i < script.networks.length; i++) {
            script.networks[i].scriptName = script.scriptName;
            Flow.network(script.networks[i]);
        }

        // var script = JSON.parse(this.loader.getAsset('scripts/simpleTestScript.ascript'));
        // for(var i = 0; i < script.networks.length; i++) {
        //     script.networks[i].scriptName = script.scriptName;
        //     Flow.network(script.networks[i]);
        // }

        var object = {
            transform: { name: 'Amble.Transform', args: {
                position: { name: 'Amble.Math.Vector2', args:{ x: 0, y: 0}},
                size: {name: 'Amble.Math.Vector2', args:{x: 100, y: 100}}
            }},
            renderer: { name: 'Amble.Graphics.RectRenderer', args:{ color: 'red'}},
            scripts: [
                { name: 'untitled.ascript', args:{ /*variables?*/}},
                { name: 'simpleTestScript.ascript', args:{ /*variables?*/}}
            ]
        }

        this.scene.instantiate(object);

    },

    /* game loop */
    preupdate: function(){
    },

    /* update there - actors update and camera update*/
    postupdate: function(){

    },

    prerender: function(){

    },

    /* rendering there - layer clear and actors render*/
    /* postrendering there*/
    postrender: function(){

    }
});

},{}]},{},[1,2,3]);
