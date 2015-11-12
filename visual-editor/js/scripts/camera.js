var Camera = {};

Camera = function(args){
    this.variables = {
        lastMousePos: new Amble.Math.Vector2({}),
        done: false,
        zoomSpeed: 1,
        origin: new Amble.Math.Vector2({}),
        maxZoom: 0.15,
        minZoom: 2,
        translate: new Amble.Math.Vector2({})
    };
};

Camera.prototype = {

    start: function(self) {

    },

    update: function(self) {
        if(Amble.Input.isMousePressed(3)) {
            if(!this.variables.done) {
                this.variables.done = true;
                this.variables.lastMousePos.copy(Amble.Input.mousePosition);
            }
            var x = (this.variables.lastMousePos.x - Amble.Input.mousePosition.x)/self.camera.scale;
            var y = (this.variables.lastMousePos.y - Amble.Input.mousePosition.y)/self.camera.scale;
            self.camera.position.add(new Amble.Math.Vector2({x: x, y: y}));

            this.variables.lastMousePos.copy(Amble.Input.mousePosition);
        } else {
            this.variables.done = false
        }
    },

    onresize: function(self) {

        var width = parseInt(self.camera.context.offsetWidth);
        var height = parseInt(self.camera.context.offsetHeight);
        var sizeDifference = width/self.camera.size.x;

        self.camera.size = new Amble.Math.Vector2({ x: width, y: height });
        self.camera.view = new Amble.Math.Vector2(self.camera.position.x - width, self.camera.position.y - height);

        this.variables.maxZoom *= sizeDifference;
        this.variables.minZoom *= sizeDifference;
    },

    onmousewheel: function(self, e){

        if(!Amble.app.scene.children[1].getComponent('Manager').var.isHelper) {
            var zoomToX = self.camera.size.x/2;
            var zoomToY = self.camera.size.y/2;
            var wheel = e.wheelDelta/120;
            var zoom = Math.pow(1 + Math.abs(wheel)/2 , wheel > 0 ? 1 : -1);

            for(var i = 0; i < self.camera.layers.length; i++) {
                self.camera.layers[i].layer.ctx.translate(
                    this.variables.origin.x,
                    this.variables.origin.y
                );
            }

            var nextScale = self.camera.scale * zoom

            if(nextScale > this.variables.minZoom) {
                nextScale = this.variables.minZoom;
            } else if (nextScale < this.variables.maxZoom) {
                nextScale = this.variables.maxZoom;
            }

            zoom = nextScale/self.camera.scale;

            for(var i = 0; i < self.camera.layers.length; i++) {
                self.camera.layers[i].layer.ctx.scale(zoom,zoom);
                self.camera.layers[i].layer.ctx.translate(
                    -( zoomToX / self.camera.scale + this.variables.origin.x - zoomToX / nextScale ),
                    -( zoomToY / self.camera.scale + this.variables.origin.y - zoomToY / nextScale )
                );
            }

            this.variables.translate.x = -( zoomToX / self.camera.scale + this.variables.origin.x - zoomToX / nextScale);
            this.variables.translate.y = -( zoomToY / self.camera.scale + this.variables.origin.y - zoomToY / nextScale);

            this.variables.origin.x = ( zoomToX / self.camera.scale + this.variables.origin.x - zoomToX / nextScale );
            this.variables.origin.y = ( zoomToY / self.camera.scale + this.variables.origin.y - zoomToY / nextScale );

            self.camera.scale *= zoom;
        }
    }
}

module.exports = Camera;
