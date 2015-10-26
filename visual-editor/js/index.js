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
window.Component = require('./js/scripts/component.js');
window.Camera = require('./js/scripts/camera.js')

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

//components in separate files? (merge on build and bundle) iterate over every and add to Flow.components
var component = {
    componentData: {
        _name: 'Function hasdhiasdhji jopsdjoasdjo jopsdopasdkop koaskopkopas kopkoko sksk ksks ksksl ;s; ka',
        _input: [
            {type: Object, name:'data'}
        ],
        _output: [
            {type: Object, name:'output'}
        ],
        _body: function(data, output) {
            console.log(data)
            output(data)
        }
    },
    transform: { name: "Amble.Transform", args: {
        position: { name: "Amble.Math.Vector2", args: {x:0 ,y:0}},
    }},
    renderer: { name: "Component.Renderer" , args:{}},
    scripts: [
        { name: "Component", args: {} }
    ]
}

//pass componsents
Flow.component({
    name: component.componentData._name,
    input: component.componentData._input,
    output: component.componentData._output,
    body: component.componentData._body
});

//network json (future)
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

//camera
var c = {
    cam: { name: "Amble.Camera", args: {
        position: { name: "Amble.Math.Vector2", args: {x:0 ,y:0}}
    }},
    scripts: [
        { name: "Camera", args: {}}
    ]
}

var app = new Amble.Application({
    /* use to set width and height of canvas, default 800x600 */
    fullscreen: true,
    resize: true,
    // width: 800,
    // height: 600,
    /* set all loading there */
    camera: c,
    preload: function(){

        this.obj1 = this.scene.instantiate(component);
        component.transform.args.position.args.x += 500;
        this.obj2 = this.scene.instantiate(component);

        // Flow.startNetwork("start");

    },
    /* every thing loaded */
    start: function(){
        this.layer = new Amble.Graphics.Layer(this.width, this.height).appendTo(document.body);
    },
    /* game loop */
    preupdate: function(){
        if(Amble.Input.isKeyPressed(65))
            console.log(this.camera);
    },
    /* update there - actors update and camera update*/
    postupdate: function(){

    },
    prerender: function(){

    },
    /* rendering there - layer clear and actors render*/
    /* postrendering there*/
    postrender: function(){
        // this.layer.fillRect(self.transform.position.x - camera.view.x - self.transform.size.x/2, self.transform.position.y - camera.view.y - self.transform.size.y/2, self.transform.size.x, self.transform.size.y)
    }
});
