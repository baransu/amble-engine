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

// if (!Array.prototype.filter) {
//   Array.prototype.filter = function(fun/*, thisArg*/) {
//     'use strict';
//
//     if (this === void 0 || this === null) {
//       throw new TypeError();
//     }
//
//     var t = Object(this);
//     var len = t.length >>> 0;
//     if (typeof fun !== 'function') {
//       throw new TypeError();
//     }
//
//     var res = [];
//     var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
//     for (var i = 0; i < len; i++) {
//       if (i in t) {
//         var val = t[i];
//
//         // NOTE: Technically this should Object.defineProperty at
//         //       the next index, as push can be affected by
//         //       properties on Object.prototype and Array.prototype.
//         //       But that method's new, and collisions should be
//         //       rare, so use the more-compatible alternative.
//         if (fun.call(thisArg, val, i, t)) {
//           res.push(val);
//         }
//       }
//     }
//
//     return res;
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
    ],
    body: function(val1, val2, output) {
        var sum = val1 + val2;
        output(sum);
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
    name: "start",
    //list of all components
    processes:[
        {name: "add", component: "add"},
        {name: "multiply1", component: "multiply"},
        {name: "multiply2", component: "multiply"},
        {name: "multiply3", component: "multiply"},
        {name: "log1", component: 'log'},
        {name: "log2", component: 'log'},
    ],
    //list of variables connection
    connections: [
        {id: 0, out:'add.output', in:'multiply1.val1'},
        {id: 1, out:'multiply1.output', in:'multiply2.val1'},
        {id: 2, out:'multiply1.output', in:'multiply3.val1'},
        {id: 3, out:'multiply2.output', in:'log1.data'},
        {id: 4, out:'multiply3.output', in:'log2.data'},
    ],
    //list of begin variables connection
    init: {
        'add.val1': 1,
        'add.val2': 1,
        'multiply1.val2': 2,
        'multiply2.val2': 4,
        'multiply3.val2': 2
    }
})

function run(){
    Flow.startNetwork("start");
}

run();
