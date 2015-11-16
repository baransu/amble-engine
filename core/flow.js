var async = require('async');

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
        if (!port) throw new Error('whoops no port found: ', key);

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
                var variable = network.variables.find(v => v.id == c.connectedTo.id);
                c.value = variable.value;

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

FLOW.ComponentsFunction.getVector2 = function(vec2, x, y){
    x.value = vec2.value.x;
    y.value = vec2.value.y;
}

FLOW.ComponentsFunction.self = function(self, selfOut){
    selfOut.value = self;
}

FLOW.ComponentsFunction.deltaTime = function(deltaOut) {
    deltaOut.value = Amble.Time.deltaTime;
}

FLOW.ComponentsFunction.getTransform = function(self, transform, position, size){
    transform.value = self.value.transform;
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
