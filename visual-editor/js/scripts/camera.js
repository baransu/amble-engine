var CAMERA = {};

CAMERA = function(args){
}

CAMERA.prototype = {
    variables: {
        lastMousePos: new Amble.Math.Vector2({}),
        done: false,
        zoomSpeed: 1,
        origin: new Amble.Math.Vector2({}),
        maxZoom: 0.15,
        minZoom: 2,
        translate: new Amble.Math.Vector2({})
    },
    start: function(self) {

    },
    update: function(self) {
        if(Amble.Input.isMousePressed(3)) {
            if(!this.variables.done) {
                this.variables.done = true;
                this.variables.lastMousePos.copy(Amble.Input.mousePosition);
            }
            var x = this.variables.lastMousePos.x - Amble.Input.mousePosition.x;
            var y = this.variables.lastMousePos.y - Amble.Input.mousePosition.y;
            self.cam.position.add(new Amble.Math.Vector2({x: x, y: y}));

            this.variables.lastMousePos.copy(Amble.Input.mousePosition);
        } else {
            this.variables.done = false
        }
    },
    onmousewheel: function(self, e){
        //do it!!!
        var zoomToX = self.cam.size.x/2;
        var zoomToY = self.cam.size.y/2;
        var wheel = e.wheelDelta/120;
        var zoom = Math.pow(1 + Math.abs(wheel)/2 , wheel > 0 ? 1 : -1);

        Amble.app.layer.ctx.translate(
            this.variables.origin.x,
            this.variables.origin.y
        );

        var nextScale = self.cam.scale * zoom

        if(nextScale > this.variables.minZoom) {
            nextScale = this.variables.minZoom;
        } else if (nextScale < this.variables.maxZoom) {
            nextScale = this.variables.maxZoom;
        }

        zoom = nextScale/self.cam.scale
        Amble.app.layer.ctx.scale(zoom,zoom);

        Amble.app.layer.ctx.translate(
            -( zoomToX / self.cam.scale + this.variables.origin.x - zoomToX / nextScale ),
            -( zoomToY / self.cam.scale + this.variables.origin.y - zoomToY / nextScale )
        );

        this.variables.translate.x = -( zoomToX / self.cam.scale + this.variables.origin.x - zoomToX / nextScale);
        this.variables.translate.y = -( zoomToY / self.cam.scale + this.variables.origin.y - zoomToY / nextScale);

        this.variables.origin.x = ( zoomToX / self.cam.scale + this.variables.origin.x - zoomToX / nextScale );
        this.variables.origin.y = ( zoomToY / self.cam.scale + this.variables.origin.y - zoomToY / nextScale );

        self.cam.scale *= zoom;

        // console.log(self.cam.scale)
    }
}

module.exports = CAMERA;
