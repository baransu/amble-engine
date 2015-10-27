var MANAGER = {};

MANAGER = function(args){
    this.scene = Amble.app.scene;
}

//script part
MANAGER.prototype = {
    var: {
        input: true,
        components: []
    },
    start: function(self) {

    },
    update: function(self) {
        //move it to engine
        if(Amble.Input.isMousePressed(1) && this.var.input) {
            var c = this.scene.instantiate(component);
            var scale = Amble.app.camera.cam.scale;
            //real camera pos
            var mouseX = Amble.Input.mousePosition.x/scale - Amble.app.camera.scripts[0].variables.translate.x;
            var mouseY = Amble.Input.mousePosition.y/scale - Amble.app.camera.scripts[0].variables.translate.y;

            var x = mouseX + Amble.app.camera.cam.view.x;
            var y = mouseY + Amble.app.camera.cam.view.y;

            c.transform.position.copy(new Amble.Math.Vector2({x: x, y: y}));
            this.var.components.push(c);

            this.var.input = false;
        }

        if(!Amble.Input.isMousePressed(1))
            this.var.input = true;
    }
}

module.exports = MANAGER;
