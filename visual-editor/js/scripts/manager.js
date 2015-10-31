var MANAGER = {};

MANAGER = function(args){
    this.scene = Amble.app.scene;
    this.component = null;
    this.components = [];
    this.currentNode = null;
    this.var = {
        input: false,
        hold: false,
        holderMod: new Amble.Math.Vector2({}),
        helperStartMouse: new Amble.Math.Vector2({}),
        holdNode: false,
        idHelper: false,
        helper: null,
        context: null,
        mouse: new Amble.Math.Vector2({}),
        helperNode: null
    };
}

//script part
MANAGER.prototype = {
    start: function(self) {
        //load saved file
    },
    update: function(self) {
        //move it to engine
        var scale = Amble.app.mainCamera.camera.scale;

        var lastMouse = new Amble.Math.Vector2({});
        lastMouse.x = this.var.mouse.x - ((Amble.Input.mousePosition.x/scale - Amble.app.mainCamera.scripts[0].variables.translate.x) + Amble.app.mainCamera.camera.view.x);
        lastMouse.y = this.var.mouse.y - ((Amble.Input.mousePosition.y/scale - Amble.app.mainCamera.scripts[0].variables.translate.y) + Amble.app.mainCamera.camera.view.y);

        this.var.mouse.x = (Amble.Input.mousePosition.x/scale - Amble.app.mainCamera.scripts[0].variables.translate.x) + Amble.app.mainCamera.camera.view.x;
        this.var.mouse.y = (Amble.Input.mousePosition.y/scale - Amble.app.mainCamera.scripts[0].variables.translate.y) + Amble.app.mainCamera.camera.view.y;

        if(Amble.Input.isMousePressed(1) && !this.var.hold && !this.var.holdNode && this.var.input) {
            this.var.input = false;
            var node = null;
            for(var i = 0; i < this.components.length; i++) {
                node = this.components[i].scripts[0].checkCollision(this.var.mouse.x, this.var.mouse.y);
                if(node != null) {
                    break;
                }
            }

            if(node != null) {

                this.currentNode = node;
                this.var.holdNode = true;

            } else {

                this.component = null;

                for(var i = 0; i < this.components.length; i++) {

                    var pos = this.components[i].transform.position;
                    var width = this.components[i].scripts[0].width;
                    var bodyHeight = this.components[i].scripts[0].bodyHeight;
                    var headerHeight = this.components[i].scripts[0].headerHeight;

                    if( this.var.mouse.x >= pos.x - width/2 && this.var.mouse.x <= pos.x + width/2 &&
                        this.var.mouse.y >= pos.y - bodyHeight/2 - headerHeight && this.var.mouse.y <= pos.y + bodyHeight/2) {

                        this.var.holderMod.x = pos.x - this.var.mouse.x;
                        this.var.holderMod.y = pos.y - this.var.mouse.y;
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
            this.var.input = true;
            if(this.var.holdNode) {

                var n = null
                for(var i = 0; i < this.components.length; i++) {
                    n = this.components[i].scripts[0].checkCollision(this.var.mouse.x, this.var.mouse.y);
                    if(n != null) {
                        break;
                    }
                }

                if(n != null && n != this.currentNode && this.currentNode.type != n.type) {

                    var obj = {};
                    if(this.currentNode.type == 'in') {
                        obj.startNode = n;
                        obj.endNode = this.currentNode;
                        n.parent.connections.push(obj);
                    } else {
                        obj.startNode = this.currentNode;
                        obj.endNode = n;
                        this.currentNode.parent.connections.push(obj);
                    }

                    this.currentNode.connected = true;
                    n.connected = true;


                } else if(!this.var.helper) {
                    //show helper
                    if(this.currentNode) {
                        this.var.helperNode = this.currentNode;
                    }

                    this.showHelper();
                }

                this.currentNode.parent.startNode = null;
                this.currentNode.parent.endNode = null;

                this.var.holdNode = false;
                this.currentNode = null;
            }
        }

        //hide/delete helper
        if( this.var.isHelper &&
            (
                Amble.Input.isMousePressed(2) ||
                (
                    Amble.Input.isMousePressed(3) &&
                    (
                        lastMouse.x != 0 ||
                        lastMouse.y != 0
                    )
                ) ||
                Amble.Input.isKeyPressed(27)
                // ||
                // (
                //     Amble.Input.isMousePressed(1) &&
                //     (
                //         Amble.Input.mousePosition.x < parseInt(this.var.helper.style.left)||
                //         Amble.Input.mousePosition.x > parseInt(this.var.helper.style.left) + parseInt(this.var.helper.style.width) &&
                //         Amble.Input.mousePosition.y < parseInt(this.var.helper.style.top) ||
                //         Amble.Input.mousePosition.y > parseInt(this.var.helper.style.top) + parseInt(this.var.helper.style.height)
                //     )
                // )
            )
        ) {
            this.hideHelper();
        }

        if (Amble.Input.isKeyPressed(65) && this.var.input && !this.var.isHelper) {
            this.hideHelper();
            this.showHelper();
            this.var.input = false;
        }

        if(!Amble.Input.isKeyPressed(65)) {
            this.var.input = true;
        }

        //dragging
        if(this.var.holdNode) {
            if(this.currentNode.type == "in") {
                this.currentNode.parent.startNode = {
                    x: this.var.mouse.x,
                    y: this.var.mouse.y
                };
            } else {
                this.currentNode.parent.endNode = {
                    x: this.var.mouse.x,
                    y: this.var.mouse.y
                };
            }
        }

        //moving component
        if(this.var.hold) {
            this.component.transform.position.x = this.var.mouse.x + this.var.holderMod.x;
            this.component.transform.position.y = this.var.mouse.y + this.var.holderMod.y;
        }

        var lastMouseButton = Amble.Input.isMousePressed(3);
    },
    addComponent: function(idName) {
        var component = componentsArray.find(c => c.componentData.idName == idName);
        var comp = this.scene.instantiate(component);
        comp.transform.position = new Amble.Math.Vector2({x: this.var.helperStartMouse.x, y: this.var.helperStartMouse.y});
        this.components.push(comp);

        if(this.var.helperNode) {

            var obj = {};
            var secondNode = null;
            if(this.var.helperNode.type == 'in') {
                secondNode = comp.scripts[0].outNodes[0];
                obj.startNode = secondNode;
                obj.endNode = this.var.helperNode;
                secondNode.parent.connections.push(obj);
            } else {
                secondNode = comp.scripts[0].inNodes[0];
                obj.startNode = this.var.helperNode;
                obj.endNode = secondNode;
                this.var.helperNode.parent.connections.push(obj);
            }


            this.var.helperNode.connected = true;
            secondNode.connected = true;
        }

        this.hideHelper();
    },
    showHelper: function() {
        this.var.context = Amble.app.mainCamera.camera.context;
        var size = Amble.app.mainCamera.camera.size;

        var div = document.createElement('helper-component');
        var width = 800/2;
        var height = 600/2;
        div.style.width = width + 'px';
        div.style.height = height + 'px';
        div.style.left = Amble.Input.mousePosition.x + 'px';
        div.style.top = Amble.Input.mousePosition.y + 'px';
        //move to fit screen

        //left
        if(parseInt(div.style.left) < 0) {
            div.style.left = 0 + 'px';
        }
        //right
        if(parseInt(div.style.left) + parseInt(div.style.width) > size.x) {
            div.style.left = size.x - size.x/200 - parseInt(div.style.width) + 'px';
        }
        //down
        if(parseInt(div.style.top) + parseInt(div.style.height) > size.y) {
            div.style.top = size.y - size.y/100 - parseInt(div.style.height) + 'px';
        }
        //top
        if(parseInt(div.style.top) < 0) {
            div.style.top = 0 + 'px';
        }

        this.var.context.appendChild(div);

        this.var.helperStartMouse = new Amble.Math.Vector2({x: this.var.mouse.x, y: this.var.mouse.y});

        this.var.helper = div;
        this.var.isHelper = true;
    },
    hideHelper: function(){

        this.var.helperNode = null;

        if(this.var.helper) {
            this.var.context.removeChild(this.var.helper);
            this.var.helper = null;
            this.var.isHelper = false;
        }
    }
}

module.exports = MANAGER;