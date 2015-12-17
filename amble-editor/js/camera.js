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
    this.zoom = 0;

    this.mouse = new Amble.Math.Vector2({});
    this.selectedActor = null;
    this.modifier = new Amble.Math.Vector2({});
    this.actorToMove = null;

    this.editor = null;

};

Camera.prototype = {

    start: function(self) { },

    update: function(self) {

        this.mouse.x = (Amble.Input.mousePosition.x/self.camera.scale - this.variables.translate.x) + self.camera.view.x;
        this.mouse.y = (Amble.Input.mousePosition.y/self.camera.scale - this.variables.translate.y) + self.camera.view.y;

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

        if(Amble.Input.isMousePressed(1) && this.actorToMove) {
            this.actorToMove.transform.position.x = this.mouse.x + this.modifier.x;
            this.actorToMove.transform.position.y = this.mouse.y + this.modifier.y;
            this.editor.refresh();
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

    onmousedown: function(self, e) {
        switch(e.which) {
            case 1:
                for(var i = Amble.app.scene.children.length - 1; i >= 0; i--) {
                    var obj = Amble.app.scene.children[i];
                    if(obj.renderer) {
                        var width = obj.renderer.size.x;
                        var height = obj.renderer.size.y;
                        var x = obj.transform.position.x;
                        var y = obj.transform.position.y;

                        if(this.mouse.x > x - width/2 && this.mouse.x < x + width/2 && this.mouse.y > y - height/2 && this.mouse.y < y + height/2) {

                            this.modifier.x = obj.transform.position.x - this.mouse.x;
                            this.modifier.y = obj.transform.position.y - this.mouse.y;

                            this.actorToMove = obj;

                            document.getElementById('id_' + obj.sceneID).click();
                            location.href = "#id_" + obj.sceneID;

                            break;
                        }
                    }
                }

            break;
        }
    },

    onmouseup: function(self, e) {
        if(this.actorToMove) {
            this.actorToMove = null;
        }
    },

    onmousewheel: function(self, e){

        var zoomToX = self.camera.size.x/2;
        var zoomToY = self.camera.size.y/2;
        var wheel = e.wheelDelta/120;
        this.zoom = Math.pow(1 + Math.abs(wheel)/2 , wheel > 0 ? 1 : -1);

        for(var i = 0; i < self.camera.layers.length; i++) {
            self.camera.layers[i].layer.ctx.translate(
                this.variables.origin.x,
                this.variables.origin.y
            );
        }

        var nextScale = self.camera.scale * this.zoom

        if(nextScale > this.variables.minZoom) {
            nextScale = this.variables.minZoom;
        } else if (nextScale < this.variables.maxZoom) {
            nextScale = this.variables.maxZoom;
        }

        this.zoom = nextScale/self.camera.scale;

        for(var i = 0; i < self.camera.layers.length; i++) {
            self.camera.layers[i].layer.ctx.scale(this.zoom,this.zoom);
            self.camera.layers[i].layer.ctx.translate(
                -( zoomToX / self.camera.scale + this.variables.origin.x - zoomToX / nextScale ),
                -( zoomToY / self.camera.scale + this.variables.origin.y - zoomToY / nextScale )
            );
        }

        this.variables.translate.x = -( zoomToX / self.camera.scale + this.variables.origin.x - zoomToX / nextScale);
        this.variables.translate.y = -( zoomToY / self.camera.scale + this.variables.origin.y - zoomToY / nextScale);

        this.variables.origin.x = ( zoomToX / self.camera.scale + this.variables.origin.x - zoomToX / nextScale );
        this.variables.origin.y = ( zoomToY / self.camera.scale + this.variables.origin.y - zoomToY / nextScale );

        self.camera.scale *= this.zoom;
    }
}

module.exports = Camera;
