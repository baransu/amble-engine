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
        console.log(component);
        if(component.type == "event") {
            network._components.unshift(component);
        } else {
            network._components.push(component);
        }
    }

    console.log(network);

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
        if (!connectedPort) throw new Error('whoops missing ' + network.connections[key] + ' port for: ' + process.name);

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

    network._endCounts = 0;
    for(var key in network._processes) {
        if(network._processes[key].output[0].connectedTo = null) {
            network._endCounts++;
        }
    }

    console.log(network)
    FLOW._networks.push(network);
}

FLOW.startNetwork = function(name){

    var network = FLOW._networks.find(n => n.name === name);

    FLOW._currentNetwork = network;

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

    FLOW.step(network._components[0]);
}

FLOW.step = function(component) {

    //process in/out into array
    var args = [];

    var inputs = FLOW.getInputs(component);

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
        var _component = FLOW._currentNetwork._components.find(c => c.id == component.output[next].connectedTo[0].id);

        if(typeof _component == 'undefined') {
            FLOW._currentNetwork.running = false;
            console.log('network end')
        } else {
            FLOW.step(_component);
        }

    } else {
        FLOW._currentNetwork.running = false;
        console.log('network end')
    }
}

FLOW.getInputs = function(component)  {

    // console.log(component);

    var args = [];

    for(var i = 0; i < component.input.length; i++) {
        if(component.input[i].type != 'exe') {

            var c = component.input[i];

            if(c.connectedTo.type == 'variable') {
                var variable = FLOW._currentNetwork.variables.find(v => v.id == c.connectedTo.id);
                c.value = variable.value;

            } else if (c.connectedTo.type == 'data') {

                var comp = FLOW._currentNetwork._components.find(v => v.id == c.connectedTo.id);
                if(comp.output[0].type == 'exe') {
                    var port = comp.output.find(p => p.name == c.connectedTo.port);
                    c.value = port.value;

                } else {

                    var argss = [];

                    var inputs = FLOW.getInputs(comp);
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

    return args;
}

module.exports = FLOW;
