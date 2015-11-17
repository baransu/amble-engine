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
    this.connectionsCount = 0;
    this.nodeDisconnect = false;
}

Manager.prototype = {
    start: function(self) {
        this.componentsList = JSON.parse(fs.readFileSync('../core/components.json', 'utf8')).components;
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

        var key = e.which;

        if(key == 27) {
            this.hideHelper();
            if(this.component) {
                this.component.getComponent('Component').selected = false;
                this.component = null;
            }
        }

        if(key == 46 || key == 8) {
            if(this.component) {

                this.disconnectComponent(this.component);

                this.scene.remove(this.component);
                var index = this.components.indexOf(this.component);
                this.components.splice(index, 1);
                this.component = null;
            }
        }
    },

    onkeyup: function(self, e) {

    },

    onmousedown: function(self, e) {

        var key = e.which;

        if(key == 1 && this.component) {
            this.component.getComponent('Component').selected = false;
            this.component = null;
        }

        //disconnect node
        if(key == 3) {
            for(var i = 0; i < this.components.length; i++) {
                node = this.components[i].getComponent('Component').checkCollision(this.var.mouse.x, this.var.mouse.y);
                if(node != null) {
                    break;
                }
            }

            if(node) {
                this.nodeDisconnect = true;
                var parent = node.parent;

                //disconnect form other component - in port
                for(var i = 0; i < parent.connectedTo.length; i++) {
                    var connections =  parent.connectedTo[i].connections.filter(c => c.endNode.parent.id == parent.id && c.endNode.id == node.id);
                    for(var j = 0; j < connections.length; j++) {
                        var index = parent.connectedTo[i].connections.indexOf(connections[j]);
                        parent.connectedTo[i].connections.splice(index, 1);
                    }
                }

                //disconnect form node component - out port
                var connection = parent.connections.filter(c => c.startNode.id == node.id);
                for(var j = 0; j < connection.length; j++) {
                    var index = parent.connections.indexOf(connection[j]);
                    parent.connections.splice(index, 1);
                }
            }
        }

        if(key == 2 ||
            (key == 3 && (this.var.lastMouse.x != 0 || this.var.lastMouse.y != 0))) {
            this.hideHelper();
        }

        if(key == 1 && !this.var.hold && !this.var.holdNode && !this.var.isHelper) {
            var node = null;
            for(var i = 0; i < this.components.length; i++) {
                node = this.components[i].getComponent('Component').checkCollision(this.var.mouse.x, this.var.mouse.y);
                if(node != null) {
                    break;
                }
            }

            if(node) {

                this.currentNode = node;
                this.var.holdNode = true;

            } else {

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

                        //unselectr previous component
                        if(this.component) {
                            this.component.getComponent('Component').selected = false;
                        }
                        this.component = this.components[i];
                        this.component.getComponent('Component').selected = true;
                    }
                }
            }
        }
    },

    onmouseup: function(self, e) {

        var key = e.which;

        if (key == 3 && !this.var.isHelper && !this.var.holdNode && !this.moved && !this.nodeDisconnect) {
            this.hideHelper();
            this.showHelper();
        }

        this.nodeDisconnect = false;
        this.var.hold = false;

        if(this.var.holdNode) {

            var n = null;
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
                    this.currentNode.parent.connectedTo.push(n.parent);
                } else {
                    obj.startNode = this.currentNode;
                    obj.endNode = n;
                    n.parent.connectedTo.push(this.currentNode.parent);
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

    disconnectComponent: function(comp){
        var component = comp.getComponent('Component');
        for(var i = 0; i < component.connectedTo.length; i++) {
            var cC =  component.connectedTo[i].connections.filter(c => c.endNode.parent.id == component.id);
            for(var j = 0; j < cC.length; j++) {
                var index = component.connectedTo[i].connections.indexOf(cC[j]);
                component.connectedTo[i].connections.splice(index, 1);
            }
        }
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

            // console.log(obj);.
            this.variables.push(obj);
        }
    },

    //data - json string
    load: function(json){

        //reset manager
        if(this.component) {
            this.component.getComponent('Component').selected = false;
            this.component = null;
        }

        for(var i = 0; i < this.components.length; i++) {
            this.scene.remove(this.components[i]);
        }

        this.components = [];
        this.currentNode = null;

        this.hideHelper();

        this.var.hold = false;
        this.var.holdNode = false;

        document.querySelector('variables-component').data = [];

        if(json != null) {
            var data = JSON.parse(json);
            console.log(data);

            document.querySelector('variables-component').data = data.variables;

            this.updateVariables(data.variables);

            for(var i = 0; i < data.components.length; i++) {
                if(data.components[i].type == 'function' || data.components[i].type == 'event' || data.components[i].type == 'calculate') {
                    var component = componentsArray.find(c => c.componentData.idName == data.components[i].idName);
                } else if(data.components[i].type == 'variable') {
                    var component = this.variables.find(c => c.componentData.idName == data.components[i].idName);
                }

                var _component = this.scene.instantiate(component);
                _component.transform.position = new Amble.Math.Vector2({x: data.components[i].position.x, y: data.components[i].position.y});
                _component.getComponent('Component').id = data.components[i].id;
                var id = data.components[i].id;
                var count = Number(id.replace('component', ''));
                if(count > this.componentsCount) {
                    this.componentsCount = count;
                }

                this.components.push(_component);

            }

            //make connections
            for(var i = 0; i < data.components.length; i++) {
                var d = data.components[i];
                var comp = this.components.find(c => c.getComponent('Component').id == d.id);

                //connectrions
                for(var j = 0; j < d.connections.length; j++) {
                    var c = d.connections[j];

                    var node = c.outNode.substr(1);
                    var startNode = comp.getComponent('Component').outNodes[node];

                    var endComp = this.components.find(eC => eC.getComponent('Component').id == c.inNode.id);

                    var node = c.inNode.node.substr(1);

                    var endNode = endComp.getComponent('Component').inNodes[node];

                    startNode.connected = true;
                    endNode.connected = true;

                    var obj = {
                        startNode: startNode,
                        endNode: endNode
                    }

                    comp.getComponent('Component').connections.push(obj);

                }

                //connectedTo
                for(var j = 0; j < d.connectedTo.length; j++) {

                    var _id = d.connectedTo[j];
                    var connectedComponent = this.components.find(_c => _c.getComponent('Component').id == _id);
                    if(typeof connectedComponent != 'undefined') {

                        comp.getComponent('Component').connectedTo.push(connectedComponent.getComponent('Component'));

                    }
                }
            }
        }
    },

    save: function(){

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
                connections: [],
                connectedTo: []
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

            for(var j = 0; j < comp.connectedTo.length; j++) {
                obj.connectedTo.push(comp.connectedTo[j].id);
            }

            this.graph.push(obj);
        }

        var variables = document.querySelector('variables-component').data;
        this.updateVariables(variables);

        var data = {
            version: '0.1.0',
            variables: variables,
            components: this.graph,
            networks: this.getNetworks()
        }

        console.log(data);

        return data
    },

    getNetworks: function(){

        var networks = [];

        //process connections
        var events = this.components.filter(c => c.getComponent('Component').type == 'event');
        for(var i = 0; i < events.length; i++) {

            for(var j = 0; j < this.components.length; j++) {
                this.components[j].getComponent('Component').visited = false;
            }

            var bundle = this.getComponent(events[i].getComponent('Component'));

            for(var j = 0; j < this.components.length; j++) {
                this.components[j].getComponent('Component').visited = false;
            }

            var n = {
                name: events[i].componentData.idName,
                variablesConnections: bundle.variablesConnections,
                components: bundle.components,
                variables: bundle.variables,
                connections: this.getConnection(events[i].getComponent('Component')),
            }

            networks.push(n);
        }

        return networks;
    },

    getComponent: function(component){

        var bundle = {};
        var components = [];
        var variables = [];
        var variablesConnections = {};

        component.visited = true;

        if(component.type != 'variable') {

            components.push({
                id: component.id,
                component: component.parentName
            });

        } else {

            var id = component.id;
            var parent = this.variables.find(variable => variable.componentData.idName == component.parentName);
            var value  = parent.componentData.value;

            variables.push({
                id: id,
                value: value
            });

            for(var i = 0; i < component.connections.length; i++) {
                var connection = component.connections[i];
                variablesConnections[connection.endNode.parent.id + '.' + connection.endNode.name] = id;
            }

        }

        console.log(component)

        for(var i = 0; i < component.connections.length; i++) {

            if(!component.connections[i].endNode.parent.visited) {
                var b = this.getComponent(component.connections[i].endNode.parent);
                console.log(b)

                for(var j = 0; j < b.components.length; j++) {
                    components.push(b.components[j]);
                }

                for(var j = 0; j < b.variables.length; j++) {
                    variables.push(b.variables[j]);
                }

                for(var key in b.variablesConnections) {
                    variablesConnections[key] = b.variablesConnections[key];
                }
            }
        }

        for(var i = 0; i < component.connectedTo.length; i++) {
            if(!component.connectedTo[i].visited) {
                var b = this.getComponent(component.connectedTo[i]);
                console.log(b);

                for(var j = 0; j < b.components.length; j++) {
                    components.push(b.components[j]);
                }

                for(var j = 0; j < b.variables.length; j++) {
                    variables.push(b.variables[j]);
                }

                for(var key in b.variablesConnections) {
                    variablesConnections[key] = b.variablesConnections[key];
                }
            }
        }

        return bundle = {
            components: components,
            variables: variables,
            variablesConnections: variablesConnections
        };
    },

    getConnection: function(component){

        var connections = [];

        component.visited = true;

        for(var i = 0; i < component.connections.length; i++) {
            var connection = {
                id: this.connectionsCount.toString(),
                in: component.connections[i].endNode.parent.id + '.' + component.connections[i].endNode.name,
                out: component.id + '.' + component.connections[i].startNode.name
            }

            connections.push(connection);
            this.connectionsCount++;

            if(!component.connections[i].endNode.parent.visited) {
                var n = this.getConnection(component.connections[i].endNode.parent);
                for(var j = 0; j < n.length; j++) {
                    connections.push(n[j]);
                }
            }
        }

        for(var i = 0; i < component.connectedTo.length; i++) {
            if(component.connectedTo[i].type == 'calculate' && !component.connectedTo[i].visited) {
                var n = this.getConnection(component.connectedTo[i]);
                for(var j = 0; j < n.length; j++) {
                    connections.push(n[j]);
                }
            }
        }


        return connections;

    },

    addComponent: function(idName, type) {

        var allow = true;

        if(type == 'event') {
            var c = this.components.find(c => c.componentData.idName == idName);
            if(typeof c != 'undefined') {
                console.log('You cant have move than one the same event components');
                allow = false;
            }
        }

        if(allow) {
            if(type == 'function' || type  == 'event' || type == 'calculate') {
                var component = componentsArray.find(c => c.componentData.idName == idName);
            } else if(type == 'variable') {
                var component = this.variables.find(c => c.componentData.idName == idName);
            }

            var _component = this.scene.instantiate(component);
            _component.transform.position = new Amble.Math.Vector2({x: this.var.helperStartMouse.x, y: this.var.helperStartMouse.y});
            _component.getComponent('Component').id = 'component' + this.componentsCount;
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
                    this.var.helperNode.parent.connectedTo.push(secondNode.parent);
                    secondNode.connected = true;
                } else if(_component.getComponent('Component').inNodes[0]) {
                    secondNode = _component.getComponent('Component').inNodes[0];
                    obj.startNode = this.var.helperNode;
                    obj.endNode = secondNode;
                    secondNode.parent.connectedTo.push(this.var.helperNode.parent);
                    this.var.helperNode.parent.connections.push(obj);
                    this.var.helperNode.connected = true;
                    secondNode.connected = true;
                }
            }
        }

        if(this.component) {
            this.component.getComponent('Component').selected = false;
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
