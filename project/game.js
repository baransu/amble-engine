window.Enemy = require('./scripts/Enemy.js')

var app = new Amble.Game({
    /* use to set width and height of canvas, default 800x600 */
    width: 800,
    height: 600,
    /* set all loading there */
    preload: function(){
        this.plane = {
            transform: { name: "Amble.Transform", args: {
                position: { name: "Amble.Math.Vector2", args: {x:400,y:300}},
                size: { name: "Amble.Math.Vector2", args: {x:800, y:600}}
            }},
            renderer: { name: "Amble.Graphics.RectRenderer" , args:{
                color: "#0ff"
            }},
            scripts: [
                { name: "Enemy", args: {} }
            ]
        }

        this.enemy = {
            transform: { name: "Amble.Transform", args: {
                position: { name: "Amble.Math.Vector2", args: {x:400,y:300}},
                size: { name: "Amble.Math.Vector2", args: {x:64, y:64}}
            }},
            renderer: { name: "Amble.Graphics.RectRenderer" , args:{
                color: "black"
            }},
            scripts: [
                { name: "Enemy", args: {} }
            ]
        }

        //this.scene.instantiate(this.plane);
        // this.scene.instantiate(this.enemy);

        this.scene.instantiate(this.plane);
        this.obj = Amble.Utils.clone(this.enemy);
        this.obj.transform.position.x -= 100;
        this.obj2 = Amble.Utils.clone(this.enemy);
        this.scene.add(this.obj)
        this.scene.add(this.obj2);
        // console.log(this.plane);

        // console.log(this.plane);
        // this.scene.add(this.obj);
        // console.log(this.enemy)
        //console.log(this.obj)
        // this.obj.transform.position.x -= 100;

        // console.log(this.obj);
        // console.log(this.enemy);
        // console.log ( this.obj.scripts === this.enemy.scripts);



        // var colors = ['red', 'green','blue', 'pink']
        // for(var i = 0; i < 4; i++) {
        //     this.enemy.transform.position.x--;
        //     this.enemy.transform.position.y--;
        //     this.enemy.renderer.color = colors[i];
        //     this.scene.instantiate(this.enemy);
        // }

    },
    /* every thing loaded */
    start: function(){
        this.layer = new Amble.Graphics.Layer(this.width, this.height).appendTo(document.body);
    },
    /* game loop */
    preupdate: function(){
        // console.log("e: " + this.enemy.transform.position.x);
        // console.log("o: " + this.obj.transform.position.x);
    },
    postupdate: function(){

    },
    prerender: function(){

    },
    postrender: function(){
    }
});
