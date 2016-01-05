Amble.Class({

    name: 'Camera',

    properties: {
        lastMousePos: new Vec2(),
        done: false,
        zoomSpeed: 1,
        origin: new Vec2(),
        maxZoom: 0.15,
        minZoom: 2,
        translate: new Vec2(),
        zoom: 0,
        mouse: new Vec2(),
        selectedActor: null,
        modifier: new Vec2(),
        actorToMove: null,
        editor: null,
    },

    start: function(self) { },

    update: function(self) {

        this.mouse.x = (Amble.Input.mousePosition.x/self.camera.scale - this.translate.x) + self.camera.view.x;
        this.mouse.y = (Amble.Input.mousePosition.y/self.camera.scale - this.translate.y) + self.camera.view.y;

        if(Amble.Input.isMousePressed(3)) {
            if(!this.done) {
                this.done = true;
                this.lastMousePos.copy(Amble.Input.mousePosition);
            }
            var x = (this.lastMousePos.x - Amble.Input.mousePosition.x)/self.camera.scale;
            var y = (this.lastMousePos.y - Amble.Input.mousePosition.y)/self.camera.scale;
            self.camera.position.add(new Vec2(x, y));

            this.lastMousePos.copy(Amble.Input.mousePosition);
        } else {
            this.done = false
        }

        if(Amble.Input.isMousePressed(1) && this.actorToMove) {
            this.actorToMove.transform.position.x = (this.mouse.x + this.modifier.x) | 0;
            this.actorToMove.transform.position.y = (this.mouse.y + this.modifier.y) | 0;
            this.editor.refresh();
        }
    },

    onresize: function(self) {

        var width = parseInt(self.camera.context.offsetWidth);
        var height = parseInt(self.camera.context.offsetHeight);
        var sizeDifference = width/self.camera.size.x;

        self.camera.size = new Vec2(width, height);
        self.camera.view = new Vec2(self.camera.position.x - width, self.camera.position.y - height);

        this.maxZoom *= sizeDifference;
        this.minZoom *= sizeDifference;
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

                            var a = document.getElementById('id_' + obj.sceneID);
                            if(a) {
                                a.click();
                                location.href = "#id_" + obj.sceneID;
                            }

                            return;
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
                this.origin.x,
                this.origin.y
            );
        }

        var nextScale = self.camera.scale * this.zoom

        if(nextScale > this.minZoom) {
            nextScale = this.minZoom;
        } else if (nextScale < this.maxZoom) {
            nextScale = this.maxZoom;
        }

        this.zoom = nextScale/self.camera.scale;

        for(var i = 0; i < self.camera.layers.length; i++) {
            self.camera.layers[i].layer.ctx.scale(this.zoom,this.zoom);
            self.camera.layers[i].layer.ctx.translate(
                -( zoomToX / self.camera.scale + this.origin.x - zoomToX / nextScale ),
                -( zoomToY / self.camera.scale + this.origin.y - zoomToY / nextScale )
            );
        }

        this.translate.x = -( zoomToX / self.camera.scale + this.origin.x - zoomToX / nextScale);
        this.translate.y = -( zoomToY / self.camera.scale + this.origin.y - zoomToY / nextScale);

        this.origin.x = ( zoomToX / self.camera.scale + this.origin.x - zoomToX / nextScale );
        this.origin.y = ( zoomToY / self.camera.scale + this.origin.y - zoomToY / nextScale );

        self.camera.scale *= this.zoom;
    }
})
