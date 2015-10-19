var FLOW = {}
FLOW.variables = {};
FLOW._network = {};
FLOW._components = [];
FLOW._maxIgnore = 1000;
FLOW._ignoreCount = 0;
FLOW._endCounts = 0;
FLOW._currentEndCounts = 0;

FLOW.component = function(component) {
    FLOW._components.push(component);
}

FLOW.network = function(network) {
    network._processes = [];
    //processes
    for(var key in network.processes) {
        var componentName = network.processes[key].component;
        var processName = network.processes[key].name;
        var p = FLOW.initProcess(componentName, processName);
        network._processes.push(p);
    }

    //conections
    for(var key in network.connections) {
        // find the process
        var process = network._processes.find(p => p.processName === key.split('.')[0]);
        if (!process) throw new Error('whoops no process found: ' + key);

        // find the port
        var port = process.output.find(p => p.name.name === key.split('.')[1]);
        if (!port) throw new Error('whoops no port found: ', key);

        // find the second process
        var connectedProcess = network._processes.find(p=> p.processName === network.connections[key].split('.')[0]);
        if (!connectedProcess) throw new Error('whoops cannot connect: ' + key + ' to missing: ' + network.connections[key]);

        // find the second process's port to connect to
        var connectedPort = connectedProcess.input.find(p => p.name.name === network.connections[key].split('.')[1]);
        if (!connectedPort) throw new Error('whoops missing ' + network.connections[key] + ' port for: ' + process.name);

        // connect the two processes
        port.connectedTo = connectedPort;
        // FLOW._endCounts--;
    }

    for(var key in network._processes) {
        if(network._processes[key].output[0].connectedTo === null) {
            FLOW._endCounts++;
        }
    }

    FLOW._network = network;
    return network;
}

FLOW.initProcess = function(componentName, processName) {
    var newInput, newOutput, component, process;

    component = FLOW._components.find(c => c.name == componentName);
    if(!component) throw new Error('no component found: ' + componentName);

    //input
    newInput = component.input.map(p => ({
        name: p,
        thisProcessName: processName,
        data: []
    }));

    //output
    newOutput = component.output.map(p => ({
        name: p,
        connectedTo: null,
        data: []
    }));

    process = {
        processName: processName,
        name: component.name,
        input: newInput,
        output: newOutput,
        body: component.body,
    };
    return process;
}

FLOW.startNetwork = function(){

    var network = FLOW._network;
    var init = FLOW._network.init;

    //values in initial input
    for(var key in init) {
        var processName = key.split('.')[0];
        var portName = key.split('.')[1];
        if (!processName) throw new Error('whoops... no process name for key: ' + key)

        var process = network._processes.find(p => p.processName === processName);
        if (!process) throw new Error('whoops.. no process: ' + processName);

        var port = process.input.find(p => p.name.name === portName);
        if (!port) throw new Error('whoops.. no port: ' + portName)

        var indexOfPort = process.input.indexOf(port);

        process.input[indexOfPort].data.push(init[key]);
    }

    network.running = true;
    FLOW.loop(network);
    return network;
}

FLOW.loop = function(network) {
    var id = setTimeout(function(){
        if(!network.running || FLOW._ignoreCount > FLOW._maxIgnore) {
            clearTimeout(id);
            FLOW._ignoreCount = 0;
            return;
        } else {
            FLOW.step(network);
            FLOW.loop(network);
        }

    }, network.delay || 0);
}

FLOW.step = function(network) {
    //every network process
    for(var i = 0; i < network._processes.length; i++) {
        var process = network._processes[i];
        var ignore = false;

        //every input have data
        for(var j = 0; j < process.input.length; j++) {
            if(process.input[j].data.length === 0) {
                ignore = true;
                break;
            }
        }

        //stop if not every process have input
        if(ignore) {
            FLOW._ignoreCount++;
            continue;
        }

        //args for the component
        var args = [];

        //WARNING input THEN output (depends on component's body function args order)
        for(var j = 0; j < process.input.length; j++) {
            var data = process.input[j].data.shift();
            args.push(data);
        }

        for(var j = 0; j < process.output.length; j++) {
            var connection = process.output[j].connectedTo;
            var output = FLOW.makeOutput(process, connection);
            args.push(output);
        }
        process.body.apply(process, args);
    }
}

FLOW.makeOutput = function(process, connection) {
    return function(output) {
        if(!connection) {
            FLOW._currentEndCounts++;
            if(FLOW._currentEndCounts >= FLOW._endCounts) {
                FLOW._network.running = false;
            }
        } else {
            connection.data.push(output);
        }
    }
}

module.exports = FLOW;
