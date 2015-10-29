var MANAGER = {};

MANAGER = function(args){
    this.scene = Amble.app.scene;
    this.component = null;
    this.components = [];
    this.currentNode = null;
}

//script part
MANAGER.prototype = {
    var: {
        input: true,
        hold: false,
        holderMod: new Amble.Math.Vector2({}),
        holdNode: false
    },
    start: function(self) {

    },
    update: function(self) {
        //move it to engine
        var scale = Amble.app.camera.cam.scale;

        var mouseX = (Amble.Input.mousePosition.x/scale - Amble.app.camera.scripts[0].variables.translate.x) + Amble.app.camera.cam.view.x;
        var mouseY = (Amble.Input.mousePosition.y/scale - Amble.app.camera.scripts[0].variables.translate.y) + Amble.app.camera.cam.view.y;

        if(Amble.Input.isMousePressed(2) && this.var.input) {
            component.transform.args.position.args.x = mouseX;
            component.transform.args.position.args.y = mouseY;
            var comp = this.scene.instantiate(component);
            this.components.push(comp);
            this.var.input = false;
        }

        if(!Amble.Input.isMousePressed(2)) {
            this.var.input = true;
        }

        if(Amble.Input.isMousePressed(1) && !this.var.hold && !this.var.holdNode && this.var.input) {

            var node = null;
            for(var i = 0; i < this.components.length; i++) {
                node = this.components[i].scripts[0].checkCollision(mouseX, mouseY);
                if(node != null) {
                    break;
                }
            }

            if(node != null) {

                this.currentNode = node;
                this.currentNode.temp = true;
                this.var.holdNode = true;

            } else {

                this.component = null;

                for(var i = 0; i < this.components.length; i++) {

                    var pos = this.components[i].transform.position;
                    var width = this.components[i].scripts[0].var.width;
                    var bodyHeight = this.components[i].scripts[0].var.bodyHeight;
                    var headerHeight = this.components[i].scripts[0].var.headerHeight;

                    if( mouseX >= pos.x - width/2 && mouseX <= pos.x + width/2 &&
                        mouseY >= pos.y - bodyHeight/2 - headerHeight && mouseY <= pos.y + bodyHeight/2) {

                        this.var.holderMod.x = pos.x - mouseX;
                        this.var.holderMod.y = pos.y - mouseY;
                        this.var.hold = true;
                        this.var.holdNode = false;
                        this.component = this.components[i]
                    }
                }
            }
        }

        if(!Amble.Input.isMousePressed(1)) {
            this.var.hold = false;
            this.component = null;

            if(this.var.holdNode) {

                var n = null
                for(var i = 0; i < this.components.length; i++) {
                    n = this.components[i].scripts[0].checkCollision(mouseX, mouseY);
                    if(n != null) {
                        break;
                    }
                }

                if(n != null && n != this.currentNode) {

                    var obj = {};
                    if(this.currentNode.type == 'in') {
                        obj.startNode = n;
                        obj.endNode = this.currentNode;
                    } else {
                        obj.startNode = this.currentNode;
                        obj.endNode = n;
                    }

                    this.currentNode.parent.connections.push(obj);
                }

                this.currentNode.parent.startNode = null;
                this.currentNode.parent.endNode = null;

                this.currentNode.temp = false;
                this.var.holdNode = false;
                this.currentNode = null;
            }
        }

        if(this.var.holdNode) {
            if(this.currentNode.type == "in") {
                this.currentNode.parent.startNode = {
                    x: mouseX,
                    y: mouseY
                };
            } else {
                this.currentNode.parent.endNode = {
                    x: mouseX,
                    y: mouseY
                };
            }
        }

        if(this.var.hold) {
            this.component.transform.position.x = mouseX + this.var.holderMod.x;
            this.component.transform.position.y = mouseY + this.var.holderMod.y;
        }
    }
}

module.exports = MANAGER;
