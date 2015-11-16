var app = new Amble.Application({

    resize: true,
    /* set all loading there */

    mainCamera: {
        camera: { name: "Amble.Camera", args: {
            position: { name: "Amble.Math.Vector2", args: {x:0 ,y:0}},
            context: "workspace"
        }}
    },

    preload: function(){

        this.loader.load('json', 'scripts/untitled.ascript');
        this.loader.load('json', 'scripts/simpleTestScript.ascript');
        this.loader.load('json', 'data/components.json');

    },

    /* every thing loaded */
    start: function(){
        // move to engine?
        var comp = JSON.parse(this.loader.getAsset('data/components.json'));
        for(var i = 0; i < comp.components.length; i++) {
            Flow.component({
                name: comp.components[i].idName,
                input: comp.components[i].input,
                type: comp.components[i].type,
                output: comp.components[i].output,
                connectedTo: null,
                body: Flow.ComponentsFunction[comp.components[i].idName]
            });
        }

        var script = JSON.parse(this.loader.getAsset('scripts/untitled.ascript'));
        for(var i = 0; i < script.networks.length; i++) {
            script.networks[i].scriptName = script.scriptName;
            Flow.network(script.networks[i]);
        }

        var script = JSON.parse(this.loader.getAsset('scripts/simpleTestScript.ascript'));
        for(var i = 0; i < script.networks.length; i++) {
            script.networks[i].scriptName = script.scriptName;
            Flow.network(script.networks[i]);
        }

        var object = {
            transform: { name: 'Amble.Transform', args: {
                position: { name: 'Amble.Math.Vector2', args:{ x: 0, y: 0}},
                size: {name: 'Amble.Math.Vector2', args:{x: 100, y: 100}}
            }},
            renderer: { name: 'Amble.Graphics.RectRenderer', args:{ color: 'red'}},
            scripts: [
                { name: 'untitled.ascript', args:{ /*variables?*/}},
                { name: 'simpleTestScript.ascript', args:{ /*variables?*/}}
            ]
        }

        this.scene.instantiate(object);

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
