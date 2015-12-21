var app = new Amble.Application({

    resize: true,
    //implement post LD34 stuff

    mainCamera: {
        name: 'MainCamera',
        tag: ['mainCamera'],
        options: {},
        camera: { name: "Amble.Camera", args: {
            position: { name: "Amble.Math.Vector2", args: {x:0 ,y:0}},
            context: "scene-view"
        }},
        components: []
    },

    preload: function(){

        //load assets (png, json)
        //load scripts (json)
        //load scene (json)
    },

    //process scripts int engine and load objects
    loaded: function(){
        //instantiate all object
    },

    //actual start function
    start: function(){
        //show must go on
    },

    preupdate: function(){

    },

    postupdate: function(){

    },

    postrender: function(){

    }
});
