var Component = {};

Component = function(args){
    this.id = 0;
    this.inNodes = [];
    this.outNodes = [];
    this.connections = [];
    this.nodes = [];
    this.componentTitle = "";
    this.width = 250;
    this.titleLineHeight = 25;
    this.titleFontSize = 15;
    this.bodyLineHeight = 20;
    this.bodyTextFont = 15;
    this.margin = 16;
    this.color = '#BDBDBD';
    this.type = "";
    this.parentName = "";
    this.selected = false;
    this.connectedTo = [];
    this.visited = false;
}

Component.prototype = {
    calcLines: function(ctx, text, maxWidth, lineHeight){
        var words = text.split(' ');
        var line = '';
        var lines = 1;

        for(var i = 0; i < words.length; i++) {
            var lineToMeasure = line + words[i] + ' ';
            var width = ctx.measureText(lineToMeasure).width;
            if (width > maxWidth && i > 0) {
                line = words[i] + ' ';
                lines++;
            } else {
                line = lineToMeasure;
            }
        }
        return lines;
    },
    start: function(self) {

        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext("2d");
        ctx.font = this.bodyLineHeight + "px Arial"
        this.componentTitle = this.parentName = self.componentData.idName;
        this.type = self.componentData.type;

        var maxInOutText = 0;
        for(var i = 0; i < self.componentData.input.length; i++) {
            var w = ctx.measureText(self.componentData.input[i].name).width;
            if(w > maxInOutText)
                maxInOutText = w;
        }

        for(var i = 0; i < self.componentData.output.length; i++) {
            var w = ctx.measureText(self.componentData.output[i].name).width;
            if(w > maxInOutText)
                maxInOutText = w;
        }

        //calc width (title width or in/out text)
        this.width = ctx.measureText(this.componentTitle).width + 2*this.margin;

        if(2*maxInOutText + 4*this.margin > this.width) {
            this.width = 2*maxInOutText + 5*this.margin;
        }

        var inputHeight = 0;
        for(var i = 0; i < self.componentData.input.length; i++) {
            inputHeight += this.bodyLineHeight * this.calcLines(ctx, self.componentData.input[i].name, this.width/2 - 2*this.margin, this.bodyLineHeight) + this.margin;
        }

        var outputHeight = 0;
        for(var i = 0; i < self.componentData.output.length; i++) {
            outputHeight += this.bodyLineHeight * this.calcLines(ctx, self.componentData.output[i].name, this.width/2 - 2*this.margin, this.bodyLineHeight) + this.margin;
        }

        this.bodyHeight = 2*this.margin + (inputHeight >= outputHeight ? inputHeight : outputHeight);
        var lines = this.calcLines(ctx, this.componentTitle, this.width - 2*this.margin, this.titleLineHeight)
        this.headerHeight = lines * this.titleLineHeight + this.margin;

        for(var i = 0; i < self.componentData.input.length; i++) {
            var obj = {
                id: 'i' + i,
                name: self.componentData.input[i].name,
                color: self.componentData.input[i].color || '#BDBDBD',
                size: this.margin,
                type: 'in',
                parent: self.getComponent('Component'), //this?
                connected: false,
                _x: 0,
                _y: 0
            };
            this.inNodes.push(obj);
        }
        for(var i = 0; i < self.componentData.output.length; i++) {
            var obj = {
                id: 'o' + i,
                name: self.componentData.output[i].name,
                color: self.componentData.output[i].color || '#BDBDBD',
                size: this.margin,
                type: 'out',
                parent: self.getComponent('Component'), //this?
                connected: false,
                _x: 0,
                _y: 0
            };
            this.outNodes.push(obj);
        }

        this.nodes.push.apply(this.nodes, this.inNodes);
        this.nodes.push.apply(this.nodes, this.outNodes);

    },
    update: function(self) {
        //calc inputs pos
        for(var i = 0; i < this.inNodes.length; i++) {
            this.inNodes[i].x = self.transform.position.x - this.width/2 + 2*this.margin - 3*this.margin/2;
            this.inNodes[i].y = self.transform.position.y - this.bodyHeight/2 + this.margin + i*(this.bodyLineHeight + this.margin) + this.margin/2;
        }

        //calc outputs pos
        for(var i = 0; i < this.outNodes.length; i++) {
            this.outNodes[i].x = self.transform.position.x + this.width/2 - 2*this.margin + this.margin/3;
            this.outNodes[i].y = self.transform.position.y - this.bodyHeight/2 + this.margin + i*(this.bodyLineHeight + this.margin) + this.margin/2;
        }
    },
    checkCollision: function(mX, mY){
        for(var i = 0; i < this.nodes.length; i++) {
            var size = this.nodes[i].size;
            var x = this.nodes[i].x + size/2;
            var y = this.nodes[i].y + size/2;
            if( mX >= x - size && mX <= x + size &&
                mY >= y - size && mY <= y + size) {

                if(this.nodes[i].type == 'in') {
                    this.endNode = this.nodes[i];
                } else {
                    this.startNode = this.nodes[i];
                }

                return this.nodes[i];
            }
        }
        return null;
    }
}

Component.Renderer = function(args){
    this.headerColor = '#EEEEEE';
    this.bodyColor = '#fff';
    this.textColor = '#212121';
    this.strokeColor = '#000';
    this.dividerColor = '#BDBDBD';
    this.defaultNodeStartColor = '#BDBDBD';
    this.outlineColor = "red";
    this.componentsLayer = 1; //0 index
    this.nodesLayer = 0; // -1 index
}
Component.Renderer.prototype = {
    renderText: function(ctx, text, x, y, maxWidth, lineHeight){
        var words = text.split(' ');
        var line = '';

        for(var i = 0; i < words.length; i++) {
            var lineToMeasure = line + words[i] + ' ';
            var width = ctx.measureText(lineToMeasure).width;
            if (width > maxWidth && i > 0) {
                ctx.fillText(line, x, y);
                line = words[i] + ' ';
                y += lineHeight;
            }
            else {
                line = lineToMeasure;
            }
            ctx.fillText(line, x, y);
        }
    },
    render: function(self, camera){

        var _ = self.getComponent('Component');

        //draw body
        var layer = camera.layer(this.componentsLayer);

        var x = self.transform.position.x - camera.view.x - _.width/2;
        var y = self.transform.position.y - camera.view.y - _.bodyHeight/2;
        layer.fillStyle(this.bodyColor).fillRect(x, y, _.width, _.bodyHeight);

        //draw header
        var x = self.transform.position.x - camera.view.x - _.width/2;
        var y = self.transform.position.y - camera.view.y - _.headerHeight - _.bodyHeight/2;
        layer.fillStyle(this.headerColor)
            .fillRect(x, y, _.width, _.headerHeight)
            .strokeStyle(this.dividerColor);
        layer.ctx.beginPath();
        layer.ctx.moveTo(x, y + _.headerHeight);
        layer.ctx.lineTo(x + _.width, y + _.headerHeight);
        layer.stroke();

        //draw header text
        layer.fillStyle(this.textColor);
        layer.ctx.font = "bold " + _.titleFontSize + "px OpenSans";
        this.renderText(layer.ctx, _.componentTitle, x + _.margin, y + _.titleLineHeight, _.width - _.margin, _.titleLineHeight)

        //outline
        var x = self.transform.position.x - camera.view.x - _.width/2;
        var y = self.transform.position.y - camera.view.y - _.headerHeight - _.bodyHeight/2;

        layer.ctx.save();

        if(_.selected) {
            layer.lineWidth(3).strokeStyle(this.outlineColor)
        } else {
            layer.lineWidth(0.5).strokeStyle(this.strokeColor)
        }

        layer.strokeRect(x, y, _.width, _.headerHeight + _.bodyHeight);
        layer.ctx.restore();

        //draw inputs
        layer.ctx.save();
        layer.fillStyle(this.textColor);
        layer.ctx.font = "500 " + _.bodyTextFont + "px OpenSans";

        layer.ctx.textAlign = "left"
        for(var i = 0; i < self.getComponent('Component').inNodes.length; i++) {
            var x = self.transform.position.x - camera.view.x - _.width/2 + 2*_.margin;
            var y = self.transform.position.y - camera.view.y - _.bodyHeight/2 + _.margin + i*(_.bodyLineHeight + _.margin);

            layer.ctx.save();
            layer.fillStyle(self.getComponent('Component').inNodes[i].color || this.defaultNodeStartColor)
                .fillRect(x - 3*_.margin/2, y + _.margin/2, _.margin, _.margin)
                .strokeStyle('#000')
                .strokeRect(x - 3*_.margin/2, y + _.margin/2, _.margin, _.margin);
            layer.ctx.restore();

            this.renderText(layer.ctx, self.getComponent('Component').inNodes[i].name, x, y + _.bodyLineHeight, _.width/2 - _.margin, _.bodyLineHeight)
        }

        //draw outputs
        layer.ctx.textAlign = "right"
        for(var i = 0; i < self.getComponent('Component').outNodes.length; i++) {
            var x = self.transform.position.x - camera.view.x + _.width/2 - 2*_.margin;
            var y = self.transform.position.y - camera.view.y - _.bodyHeight/2 + _.margin + i*(_.bodyLineHeight + _.margin);

            layer.ctx.save();
            layer.fillStyle(self.getComponent('Component').outNodes[i].color || this.defaultNodeStartColor)
                .fillRect(x + _.margin/3, y + _.margin/2, _.margin, _.margin)
                .strokeStyle('#000')
                .strokeRect(x + _.margin/3, y + _.margin/2, _.margin, _.margin);
            layer.ctx.restore();

            this.renderText(layer.ctx, self.getComponent('Component').outNodes[i].name, x, y + _.bodyLineHeight, _.width/2 - _.margin, _.bodyLineHeight)
        }

        layer.ctx.restore();

        //nodes drawing
        var layer = camera.layer(this.nodesLayer);

        for(var i = 0 ; i < self.getComponent('Component').connections.length; i++) {
            var c = self.getComponent('Component').connections[i];
            var sizeStart = c.startNode.size || 0;
            var sizeEnd = c.endNode.size || 0;

            var startX = c.startNode.x - camera.view.x + sizeStart/2;
            var startY = c.startNode.y - camera.view.y + sizeStart/2;

            var endX = c.endNode.x - camera.view.x + sizeEnd/2;
            var endY = c.endNode.y - camera.view.y + sizeEnd/2;

            //outline
            layer.strokeStyle('#000')
                .lineWidth( _.margin/2 + 2);
            layer.ctx.beginPath();
            layer.ctx.moveTo(startX, startY);

            layer.ctx.bezierCurveTo(startX, startY, startX, startY, endX, endY);

            layer.stroke();

            //outline
            layer.strokeStyle(c.endNode.color || _.color)
                .lineWidth(_.margin/2);
            layer.ctx.beginPath();
            layer.ctx.moveTo(startX, startY);

            layer.ctx.bezierCurveTo(startX, startY, startX, startY, endX, endY);

            layer.stroke();
        }

        //temp node
        if(self.getComponent('Component').startNode && self.getComponent('Component').endNode) {
            var sizeStart = self.getComponent('Component').startNode.size || 0;
            var sizeEnd = self.getComponent('Component').endNode.size || 0;

            var startX = self.getComponent('Component').startNode.x - camera.view.x + sizeStart/2;
            var startY = self.getComponent('Component').startNode.y - camera.view.y + sizeStart/2;

            var endX = self.getComponent('Component').endNode.x - camera.view.x + sizeEnd/2;
            var endY = self.getComponent('Component').endNode.y - camera.view.y + sizeEnd/2;

            //outline
            layer.strokeStyle('#000')
                .lineWidth(_.margin/2 + 2);
            layer.ctx.beginPath();
            layer.ctx.moveTo(startX, startY);

            layer.ctx.bezierCurveTo(startX, startY, startX, startY, endX, endY);

            layer.stroke();

            //outline
            layer.strokeStyle(self.getComponent('Component').endNode.color || _.color)
                .lineWidth(_.margin/2);
            layer.ctx.beginPath();
            layer.ctx.moveTo(startX, startY);

            layer.ctx.bezierCurveTo(startX, startY, startX, startY, endX, endY);

            layer.stroke();
        }
   }
}

module.exports = Component;
