var Manager = {};

Manager = function(args){
    this.scene = Amble.app.scene;
    this.component = null;
    this.components = [];
    this.currentNode = null;
    this.var = {
        hold: false,
        holderMod: new Amble.Math.Vector2({}),
        helperStartMouse: new Amble.Math.Vector2({}),
        holdNode: false,
        idHelper: false,
        helper: null,
        context: null,
        mouse: new Amble.Math.Vector2({}),
        helperNode: null,
        lastMouse: new Amble.Math.Vector2({})
    };
    this.componentsCount = 0;
    this.graph = [];
    this.moved = false;
    this.componentsList = [];
    this.variables = [];
}

Manager.prototype = {
    start: function(self) {
        this.componentsList = JSON.parse(fs.readFileSync('./visual-editor/components.json', 'utf8')).components;
    },

    update: function(self) {
        //move it to engine
        var scale = Amble.app.mainCamera.camera.scale;

        this.var.lastMouse.x = this.var.mouse.x - ((Amble.Input.mousePosition.x/scale - Amble.app.mainCamera.getComponent('Camera').variables.translate.x) + Amble.app.mainCamera.camera.view.x);
        this.var.lastMouse.y = this.var.mouse.y - ((Amble.Input.mousePosition.y/scale - Amble.app.mainCamera.getComponent('Camera').variables.translate.y) + Amble.app.mainCamera.camera.view.y);

        this.var.mouse.x = (Amble.Input.mousePosition.x/scale - Amble.app.mainCamera.getComponent('Camera').variables.translate.x) + Amble.app.mainCamera.camera.view.x;
        this.var.mouse.y = (Amble.Input.mousePosition.y/scale - Amble.app.mainCamera.getComponent('Camera').variables.translate.y) + Amble.app.mainCamera.camera.view.y;

        //dragging
        if(this.var.holdNode) {
            if(this.currentNode.type == "in") {
                this.currentNode.parent.startNode = {
                    x: this.var.mouse.x,
                    y: this.var.mouse.y
                };
            } else {
                this.currentNode.parent.endNode = {
                    x: this.var.mouse.x,
                    y: this.var.mouse.y
                };
            }
        }

        //moving component
        if(this.var.hold) {
            this.component.transform.position.x = this.var.mouse.x + this.var.holderMod.x;
            this.component.transform.position.y = this.var.mouse.y + this.var.holderMod.y;
        }

        if(Amble.Input.isMousePressed(3) && (this.var.lastMouse.x != 0 || this.var.lastMouse.y != 0)) {
            this.moved = true;
        }
    },

    onkeydown: function(self, e) {

        if(Amble.Input.isKeyPressed(27)) {
            this.hideHelper();
        }
    },

    onkeyup: function(self, e) {

    },

    onmousedown: function(self, e) {

        if(Amble.Input.isMousePressed(2) ||
            (Amble.Input.isMousePressed(3) && (this.var.lastMouse.x != 0 || this.var.lastMouse.y != 0))) {

            this.hideHelper();
        }

        if(Amble.Input.isMousePressed(1) && !this.var.hold && !this.var.holdNode && !this.var.isHelper) {
            var node = null;
            for(var i = 0; i < this.components.length; i++) {
                node = this.components[i].getComponent('Component').checkCollision(this.var.mouse.x, this.var.mouse.y);
                if(node != null) {
                    break;
                }
            }

            if(node != null) {

                this.currentNode = node;
                this.var.holdNode = true;

            } else {

                this.component = null;

                for(var i = 0; i < this.components.length; i++) {

                    var pos = this.components[i].transform.position;
                    var width = this.components[i].getComponent('Component').width;
                    var bodyHeight = this.components[i].getComponent('Component').bodyHeight;
                    var headerHeight = this.components[i].getComponent('Component').headerHeight;

                    if( this.var.mouse.x >= pos.x - width/2 && this.var.mouse.x <= pos.x + width/2 &&
                        this.var.mouse.y >= pos.y - bodyHeight/2 - headerHeight && this.var.mouse.y <= pos.y + bodyHeight/2) {

                        this.var.holderMod.x = pos.x - this.var.mouse.x;
                        this.var.holderMod.y = pos.y - this.var.mouse.y;
                        this.var.hold = true;
                        this.var.holdNode = false;
                        this.component = this.components[i]
                    }
                }
            }
        }
    },

    onmouseup: function(self, e) {

        var key = e.which;

        if (key == 3 && !this.var.isHelper && !this.var.holdNode && !this.moved) {
            this.hideHelper();
            this.showHelper();
        }

        this.var.hold = false;
        this.component = null;
        if(this.var.holdNode) {

            var n = null
            for(var i = 0; i < this.components.length; i++) {
                n = this.components[i].getComponent('Component').checkCollision(this.var.mouse.x, this.var.mouse.y);
                if(n != null) {
                    break;
                }
            }

            if(n != null && n != this.currentNode && this.currentNode.type != n.type) {

                var obj = {};
                if(this.currentNode.type == 'in') {
                    obj.startNode = n;
                    obj.endNode = this.currentNode;
                    n.parent.connections.push(obj);
                } else {
                    obj.startNode = this.currentNode;
                    obj.endNode = n;
                    this.currentNode.parent.connections.push(obj);
                }

                this.currentNode.connected = true;
                n.connected = true;


            } else if(!this.var.helper) {
                //show helper
                if(this.currentNode) {
                    this.var.helperNode = this.currentNode;
                }

                this.showHelper();
            }

            this.currentNode.parent.startNode = null;
            this.currentNode.parent.endNode = null;

            this.var.holdNode = false;
            this.currentNode = null;
        }

        if(key == 3) {
            this.moved = false;
        }

    },

    onmousewheel: function(self, e) {

    },

    updateVariables: function(variables){
        this.variables = [];
        for(var i = 0; i < variables.length; i++) {
            var obj = {
                componentData : variables[i],
                transform: { name: "Amble.Transform", args: {
                    position: { name: "Amble.Math.Vector2", args: {x:0 ,y:0}},
                }},
                renderer: { name: "Component.Renderer" , args:{}},
                components: [
                    { name: "Component", args: {} }
                ]
            }

            this.variables.push(obj);
        }
        console.log(this.variables)
    },

    load: function(path){
        console.log('load: ' + path)
        if(path != 'untitled') {
            var data = fs.readFileSync(path);
            data = JSON.parse(data);
            console.log(data);

            this.updateVariables(data.variables);

            for(var i = 0; i < data.components.length; i++) {
                console.log(data.components);
                if(data.components[i].type == 'function' || data.components[i].type == 'event') {
                    var component = componentsArray.find(c => c.componentData.idName == data.components[i].idName);
                } else if(data.components[i].type == 'variable') {
                    var component = this.variables.find(c => c.componentData.idName == data.components[i].idName);
                }

                console.log(component);

                var _component = this.scene.instantiate(component);
                _component.transform.position = new Amble.Math.Vector2({x: data.components[i].position.x, y: data.components[i].position.y});
                _component.getComponent('Component').id = data.components[i].id;
                this.componentsCount = data.components[i].id;
                this.components.push(_component);
            }

            //make connections
            for(var i = 0; i < data.components.length; i++) {
                var d = data.components[i];
                var comp = this.components.find(c => c.getComponent('Component').id == d.id);
                for(var j = 0; j < d.connections.length; j++) {
                    var c = d.connections[j];
                    var startNode = comp.getComponent('Component').outNodes[c.outNode];
                    console.log(c);
                    var endComp = this.components.find(eC => eC.getComponent('Component').id == c.inNode.id);
                    var endNode = endComp.getComponent('Component').inNodes[c.inNode.node];

                    startNode.connected = true;
                    endNode.connected = true;

                    var obj = {
                        startNode: startNode,
                        endNode: endNode
                    }

                    comp.getComponent('Component').connections.push(obj);

                }
            }
        }
    },

    save: function(path){
        console.log('save-to: ' + path)
        // print all network
        this.graph = [];
        for(var i = 0; i < this.components.length; i++) {
            var component = this.components[i];
            var comp = component.getComponent('Component');
            var obj = {
                id: comp.id,
                type: component.componentData.type,
                idName: component.componentData.idName,
                position: {
                    x: component.transform.position.x,
                    y: component.transform.position.y
                },
                connections: []
            };
            for(var j = 0 ; j < comp.connections.length; j++) {
                var c = {
                    outNode: comp.connections[j].startNode.id,
                    inNode: {
                        id: comp.connections[j].endNode.parent.id,
                        node: comp.connections[j].endNode.id
                    }
                }
                obj.connections.push(c);
            }
            this.graph.push(obj);
        }

        var variables = document.querySelector('variables-component').data;
        this.updateVariables(variables);

        var data = {
            version: '0.1.0',
            date: Date.now(),
            variables: variables,
            components: this.graph
        }

        var script = JSON.stringify(data)
        fs.writeFileSync(path, script);
    },

    addComponent: function(idName, type) {
        console.log(idName + ' | ' + type)
        if(type == 'function' || type  == 'event') {
            var component = componentsArray.find(c => c.componentData.idName == idName);
        } else if(type == 'variable') {
            var component = this.variables.find(c => c.componentData.idName == idName);
        }

        var _component = this.scene.instantiate(component);
        _component.transform.position = new Amble.Math.Vector2({x: this.var.helperStartMouse.x, y: this.var.helperStartMouse.y});
        _component.getComponent('Component').id = this.componentsCount;
        this.componentsCount++;
        this.components.push(_component);

        if(this.var.helperNode) {
            var obj = {};
            var secondNode = null;
            if(this.var.helperNode.type == 'in') {
                secondNode = _component.getComponent('Component').outNodes[0];
                obj.startNode = secondNode;
                obj.endNode = this.var.helperNode;
                secondNode.parent.connections.push(obj);
                this.var.helperNode.connected = true;
                secondNode.connected = true;
            } else if(_component.getComponent('Component').inNodes[0]) {
                secondNode = _component.getComponent('Component').inNodes[0];
                obj.startNode = this.var.helperNode;
                obj.endNode = secondNode;
                this.var.helperNode.parent.connections.push(obj);
                this.var.helperNode.connected = true;
                secondNode.connected = true;
            }
        }

        this.var.helper = null;
        this.var.isHelper = false;
        this.var.helperNode = null;

    },

    showHelper: function() {
        this.var.context = Amble.app.mainCamera.camera.context;
        var size = Amble.app.mainCamera.camera.size;

        var helper = document.createElement('helper-component');
        var width = 800/2;
        var height = 600/2;
        helper.style.width = width + 'px';
        helper.style.height = height + 'px';
        helper.style.left = Amble.Input.mousePosition.x + Amble.Input.offset.x + 'px';
        helper.style.top = Amble.Input.mousePosition.y + Amble.Input.offset.y + 'px';
        helper.id = "helper";

        var comp = [];
        for(var i = 0; i < this.componentsList.length; i++) {
            comp.push(this.componentsList[i]);
        }

        for(var i = 0; i < this.variables.length; i++) {
            comp.push(this.variables[i].componentData);
        }
        console.log(comp)
        helper.comp = comp;

        //left
        if(parseInt(helper.style.left) < Amble.Input.offset.x) {
            helper.style.left = Amble.Input.offset.x + 'px';
        }
        //right
        if(parseInt(helper.style.left) + parseInt(helper.style.width) > size.x) {
            helper.style.left = size.x - size.x/200 - parseInt(helper.style.width) + 'px';
        }
        //down
        if(parseInt(helper.style.top) + parseInt(helper.style.height) > size.y) {
            helper.style.top = size.y - size.y/100 - parseInt(helper.style.height) + 'px';
        }
        //top
        if(parseInt(helper.style.top) < Amble.Input.offset.y) {
            helper.style.top = Amble.Input.offset.y + 'px';
        }

        this.var.helper = helper;
        this.var.context.appendChild(helper);

        this.var.helperStartMouse = new Amble.Math.Vector2({x: this.var.mouse.x, y: this.var.mouse.y});

        this.var.isHelper = true;
    },

    hideHelper: function(){
        if(this.var.helper != null) {
            this.var.helperNode = null;
            this.var.context.removeChild(this.var.helper);
            this.var.helper = null;
            this.var.isHelper = false;
        }
    }
}

module.exports = Manager;
