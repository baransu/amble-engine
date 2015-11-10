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

// Flow.network({
//     name: "start",
//     //list of all components
//     processes:[
//         {name: "add", component: "add"},
//         {name: "multiply1", component: "multiply"},
//         {name: "multiply2", component: "multiply"},
//         {name: "multiply3", component: "multiply"},
//         {name: "log1", component: 'log'},
//         {name: "log2", component: 'log'},
//         {name: "log3", component: 'log'},
//     ],
//     //list of variables connection
//     connections: [
//         {id: 0, out:'add.output', in:'multiply1.val1'},
//         {id: 1, out:'multiply1.output', in:'multiply2.val1'},
//         {id: 2, out:'multiply1.output', in:'multiply3.val1'},
//         {id: 3, out:'multiply2.output', in:'log1.data'},
//         {id: 4, out:'multiply3.output', in:'log2.data'},
//         {id: 5, out:'log1.output', in:'log3.data'},
//     ],
//     //list of begin variables connection
//     init: {
//         'add.val1': 1,
//         'add.val2': 1,
//         'multiply1.val2': 2,
//         'multiply2.val2': 4,
//         'multiply3.val2': 2
//     }
// })

/*
Flow.network({
    id: network name
    components: [
        {name: id, component: 'componentIdName'}
    ]
    variables: [
       {id : idName: value: null}
    ]
    connections: [
        {id: 0, out:'add.output', in:'multiply1.val1'},
    ]


})



*/

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

        console.log(port);

        // find the second component
        var secondComponent = network._components.find(c => c.id === network.connections[key].in.split('.')[0]);
        if (!secondComponent) throw new Error('whoops cannot connect: ' + key + ' to missing: ' + network.connections[key]);

        // find the second process's port to connect to
        var connectedPort = secondComponent.input.find(p => p.name === network.connections[key].in.split('.')[1]);
        if (!connectedPort) throw new Error('whoops missing ' + network.connections[key] + ' port for: ' + process.name);

        if(connectedPort.name == 'exe') {
            var _type = 'exe'
        } else {
            var _type = 'data'
        }

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
                    //retrive path and calculate
                }
            }

            args.push(c);
        }
    }

    for(var i = 0; i < component.output.length; i++) {
        if(component.output[i].type != 'exe') {
            args.push(component.output[i]);
        }
    }

    // console.log(args);
    // console.log(component);

    var next = component.body.apply(component, args);

    if(next === -1) throw new Error('Flow unexpected stoped at: ' + component.id);

    if(component.output[next].connectedTo.length > 0) {
        var _component = FLOW._currentNetwork._components.find(c => c.id == component.output[next].connectedTo[0].id);

        // console.log(_component);

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
//
//
// FLOW.getInput = function(){
//
// }

// FLOW.network = function(network) {
//
//     network._processes = [];
//     //processes
//     for(var key in network.processes) {
//         var componentName = network.processes[key].component;
//         var processName = network.processes[key].id;
//         var p = FLOW.initProcess(componentName, processName);
//         network._processes.push(p);
//     }
//
//     //connections
//     for(var key in network.connections) {
//         // find the process
//         var process = network._processes.find(p => p.processName === network.connections[key].out.split('.')[0]);
//         if (!process) throw new Error('whoops no process found: ' + key);
//
//         // find the port
//         var port = process.output.filter(p => p.name.name === network.connections[key].out.split('.')[1]);
//         if (!port) throw new Error('whoops no port found: ', key);
//
//         // find the second processes
//         var connectedProcess = network._processes.find(p=> p.processName === network.connections[key].in.split('.')[0]);
//         if (connectedProcess.length == 0) throw new Error('whoops cannot connect: ' + key + ' to missing: ' + network.connections[key]);
//
//         // find the second process's port to connect to
//         for(var cp in port) {
//             var connectedPort = connectedProcess.input.find(p => p.name.name === network.connections[key].in.split('.')[1]);
//             if (!connectedPort) throw new Error('whoops missing ' + network.connections[key] + ' port for: ' + process.name);
//
//             port[cp].connectedTo.push(connectedPort);
//         }
//     }
//
//     network._endCounts = 0;
//     for(var key in network._processes) {
//         if(network._processes[key].output[0].connectedTo.length === 0) {
//             network._endCounts++;
//         }
//     }
//
//     FLOW._network.push(network);
//     return network;
// }
//
// FLOW.initProcess = function(componentName, processName) {
//     var newInput, newOutput, component, process;
//
//     component = FLOW._components.find(c => c.name == componentName);
//     if(!component) throw new Error('no component found: ' + componentName);
//
//     //input
//     newInput = component.input.map(p => ({
//         name: p,
//         thisProcessName: processName,
//         data: []
//     }));
//
//     //output
//     newOutput = component.output.map(p => ({
//         name: p,
//         connectedTo: [],
//         data: []
//     }));
//
//     process = {
//         processName: processName,
//         name: component.name,
//         input: newInput,
//         output: newOutput,
//         body: component.body,
//     };
//     return process;
// }
//
// FLOW.startNetwork = function(name){
//
//     var network = FLOW._network.find(n => n.name === name);
//     FLOW._currenNetwork = network;
//     var init = network.init;
//     var variables = network.variables;
//
//     //values in initial input
//     for(var key in init) {
//         var processName = key.split('.')[0];
//         var portName = key.split('.')[1];
//         if (!processName) throw new Error('whoops... no process name for key: ' + key)
//
//         var process = network._processes.find(p => p.processName === processName);
//         if (!process) throw new Error('whoops.. no process: ' + processName);
//
//         var port = process.input.find(p => p.name.name === portName);
//         if (!port) throw new Error('whoops.. no port: ' + portName)
//         var indexOfPort = process.input.indexOf(port);
//
//         var value = variables.find(v => v.id == init[key]).value
//
//         process.input[indexOfPort].data.push(value);
//     }
//     network.running = true;
//     FLOW.loop(network);
//     return network;
// }
//
// FLOW.loop = function(network) {
//     if(!network.running) {
//         FLOW._ignoreCount = 0;
//         return;
//     } else {
//         FLOW.step(network);
//         FLOW.loop(network);
//     }
// }
//
// FLOW.step = function(network) {
//     //every network process
//     for(var i = 0; i < network._processes.length; i++) {
//         var process = network._processes[i];
//         var ignore = false;
//
//         //every input have data
//         for(var j = 0; j < process.input.length; j++) {
//             if(process.input[j].data.length === 0) {
//                 process.input[j].data.push(null);
//             }
//         }
//
//         //args for the component
//         var args = [];
//
//         //WARNING input THEN output (depends on component's body function args order)
//         for(var j = 0; j < process.input.length; j++) {
//             var data = process.input[j].data.shift();
//             args.push(data);
//         }
//
//         for(var j = 0; j < process.output.length; j++) {
//             var connections = process.output[j].connectedTo;
//             var output = FLOW.makeOutput(process, connections);
//             args.push(output);
//         }
//
//         process.body.apply(process, args);
//     }
// }
//
// FLOW.makeOutput = function(process, connections) {
//     return function(output) {
//         if(connections.length == 0) {
//             FLOW._currentEndCounts++;
//             console.log('branch end')
//             if(FLOW._currentEndCounts >= FLOW._currenNetwork._endCounts) {
//                 FLOW._currenNetwork.running = false;
//                 console.log('network end')
//             }
//         } else {
//             for(var i = 0; i < connections.length; i++) {
//                 connections[i].data.push(output);
//             }
//         }
//     }
// }

module.exports = FLOW;
