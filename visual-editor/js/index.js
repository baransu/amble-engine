//polyfill
// if (!Array.prototype.find) {
//   Array.prototype.find = function(predicate) {
//     if (this == null) {
//       throw new TypeError('Array.prototype.find called on null or undefined');
//     }
//     if (typeof predicate !== 'function') {
//       throw new TypeError('predicate must be a function');
//     }
//     var list = Object(this);
//     var length = list.length >>> 0;
//     var thisArg = arguments[1];
//     var value;
//
//     for (var i = 0; i < length; i++) {
//       value = list[i];
//       if (predicate.call(thisArg, value, i, list)) {
//         return value;
//       }
//     }
//     return undefined;
//   };
// }

var Flow = require('./js/flow.js');

Flow.component({
    name: "add",
    input: [
        {type: Number, name:'val1'},
        {type: Number, name:'val2'}
    ],
    output: [
        {type: Number, name:'output'},
        {type: Object, name:'branch'}
    ],
    body: function(val1, val2, output, branch) {
        var sum = val1 + val2;
        output(sum);
        branch(sum);
    }
});

Flow.component({
    name: "multiply",
    input: [
        {type: Number, name:'val1'},
        {type: Number, name:'val2'}
    ],
    output: [
        {type: Number, name:'output'}
    ],
    body: function(val1, val2, output) {
        var multiply = val1 * val2;
        output(multiply);
    }
});

Flow.component({
    name: "log",
    input: [
        {type: Object, name:'data'}
    ],
    output: [
        {type: Object, name:'output'}
    ],
    body: function(data, output) {
        console.log(data)
        output(null)
    }
});

Flow.network({
    //list of all components
    processes:[
        //branch1
        {name: "add1", component: "add"},
        {name: "add2", component: "add"},
        {name: "add3", component: "add"},
        {name: "log1", component: 'log'},
        //branch2
        {name: "multiply", component: "multiply"},
        {name: "log2", component: 'log'},
    ],
    //list of variables connection
    connections: {
        //branch1
        'add1.output': "add2.val1",
        'add2.output': 'add3.val1',
        'add3.output': 'log1.data',
        //branch2
        'add1.branch': 'multiply.val1',
        'multiply.output': 'log2.data'
    },
    //list of begin variables connection
    init: {
        'add1.val1': 5,
        'add1.val2': 10,
        'add2.val2': 1,
        'add3.val2': 99,
        'multiply.val2': 2
    }
})

function run(){
    Flow.startNetwork();
}

run();
