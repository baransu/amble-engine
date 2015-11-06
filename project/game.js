var Flow = require('../core/flow.js')
var ComponentsFunctions = require('../core/components-functions.js');

var app = new Amble.Application({

    resize: true,
    /* set all loading there */

    mainCamera: {
        camera: { name: "Amble.Camera", args: {
            position: { name: "Amble.Math.Vector2", args: {x:0 ,y:0}},
            context: "workspace"
        }},
        // components: [
        //     { name: "Camera", args: {}}
        // ],
    },

    preload: function(){

        this.loader.load('json', 'untitled.ascript');
        this.loader.load('json', 'data/components.json');

    },

    /* every thing loaded */
    start: function(){
        var comp = JSON.parse(this.loader.getAsset('data/components.json'));
        var script = JSON.parse(this.loader.getAsset('untitled.ascript'));

        for(var i = 0; i < comp.components.length; i++) {
            Flow.component({
                name: comp.components[i].idName,
                input: comp.components[i].input,
                output: comp.components[i].output,
                body: ComponentsFunctions[comp.components[i].idName]
            });
        }

        for(var i = 0; i < script.networks.length; i++) {
            Flow.network(script.networks[i]);
        }

        Flow.startNetwork("OnStart");
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
