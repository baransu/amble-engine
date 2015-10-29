var COMPONENT = {};

COMPONENT = function(args){
    this.inNodes = [];
    this.outNodes = [];
    this.connections = [];
    this.nodes = [];
}

//script part
COMPONENT.prototype = {
    var: {
        width: 250,
        titleLineHeight: 25,
        titleFontSize: 15,
        bodyLineHeight: 20,
        bodyTextFont: 15,
        margin: 16,
        color: '#BDBDBD'
    },
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
        ctx.font = this.var.bodyLineHeight + "px Arial"
        this.var.componentTitle = self.componentData._name;

        var maxInOutText = 0;
        for(var i = 0; i < self.componentData._input.length; i++) {
            var w = ctx.measureText(self.componentData._input[i].name).width;
            if(w > maxInOutText)
                maxInOutText = w;
        }

        for(var i = 0; i < self.componentData._output.length; i++) {
            var w = ctx.measureText(self.componentData._output[i].name).width;
            if(w > maxInOutText)
                maxInOutText = w;
        }

        //calc width (title width or in/out text)
        this.var.width = ctx.measureText(this.var.componentTitle).width + 2*this.var.margin;

        if(2*maxInOutText + 4*this.var.margin > this.var.width) {
            this.var.width = 2*maxInOutText + 5*this.var.margin;
        }

        var inputHeight = 0;
        for(var i = 0; i < self.componentData._input.length; i++) {
            inputHeight += this.var.bodyLineHeight * this.calcLines(ctx, self.componentData._input[i].name, this.var.width/2 - 2*this.var.margin, this.var.bodyLineHeight) + this.var.margin;
        }

        var outputHeight = 0;
        for(var i = 0; i < self.componentData._output.length; i++) {
            outputHeight += this.var.bodyLineHeight * this.calcLines(ctx, self.componentData._output[i].name, this.var.width/2 - 2*this.var.margin, this.var.bodyLineHeight) + this.var.margin;
        }

        this.var.bodyHeight = 2*this.var.margin + (inputHeight >= outputHeight ? inputHeight : outputHeight);
        var lines = this.calcLines(ctx, this.var.componentTitle, this.var.width - 2*this.var.margin, this.var.titleLineHeight)
        this.var.headerHeight = lines * this.var.titleLineHeight + this.var.margin;

        for(var i = 0; i < self.componentData._input.length; i++) {
            var obj = {
                name: self.componentData._input[i].name,
                color: self.componentData._input[i].color || '#BDBDBD',
                size: this.var.margin,
                type: 'in',
                parent: self.scripts[0],
                temp: false,
                _x: 0,
                _y: 0
            };
            this.inNodes.push(obj);
        }
        for(var i = 0; i < self.componentData._output.length; i++) {
            var obj = {
                name: self.componentData._input[i].name,
                color: self.componentData._output[i].color || '#BDBDBD',
                size: this.var.margin,
                type: 'out',
                parent: self.scripts[0],
                temp: false,
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
            this.inNodes[i].x = self.transform.position.x - this.var.width/2 + 2*this.var.margin - 3*this.var.margin/2;
            this.inNodes[i].y = self.transform.position.y - this.var.bodyHeight/2 + this.var.margin + i*(this.var.bodyLineHeight + this.var.margin) + this.var.margin/2;
        }

        //calc outputs pos
        for(var i = 0; i < this.outNodes.length; i++) {
            this.outNodes[i].x = self.transform.position.x + this.var.width/2 - 2*this.var.margin + this.var.margin/3;
            this.outNodes[i].y = self.transform.position.y - this.var.bodyHeight/2 + this.var.margin + i*(this.var.bodyLineHeight + this.var.margin) + this.var.margin/2;
        }
    },
    checkCollision: function(mX, mY){
        for(var i = 0; i < this.nodes.length; i++) {
            if( mX >= this.nodes[i].x && mX <= this.nodes[i].x + this.nodes[i].size &&
                mY >= this.nodes[i].y && mY <= this.nodes[i].y + this.nodes[i].size) {

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

//renderer
COMPONENT.Renderer = function(args){
    this.headerColor = '#EEEEEE';
    this.bodyColor = '#fff';
    this.textColor = '#212121';
    this.strokeColor = '#000';
    this.dividerColor = '#BDBDBD';
    this.defaultNodeStartColor = '#BDBDBD'
}
COMPONENT.Renderer.prototype = {
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
    render: function(self, layer, camera){

        var _ = self.scripts[0].var;

        //nodes
        layer.ctx.save();
        for(var i = 0 ; i < self.scripts[0].connections.length; i++) {
            var c = self.scripts[0].connections[i];
            var sizeStart = c.startNode.size || 0;
            var sizeEnd = c.endNode.size || 0;

            var startX = c.startNode.x - camera.view.x + sizeStart/2;
            var startY = c.startNode.y - camera.view.y + sizeStart/2;

            var endX = c.endNode.x - camera.view.x + sizeEnd/2;
            var endY = c.endNode.y - camera.view.y + sizeEnd/2;

            //outline
            layer.strokeStyle('#000')
            layer.ctx.lineWidth = _.margin/2 + 2;
            layer.ctx.beginPath();
            layer.ctx.moveTo(startX, startY);

            layer.ctx.bezierCurveTo(startX, startY, startX, startY, endX, endY);

            layer.ctx.stroke();

            //outline
            layer.strokeStyle(c.endNode.color || _.color)
            layer.ctx.lineWidth = _.margin/2;
            layer.ctx.beginPath();
            layer.ctx.moveTo(startX, startY);

            layer.ctx.bezierCurveTo(startX, startY, startX, startY, endX, endY);

            layer.ctx.stroke();
        }

        //temp node
        if(self.scripts[0].startNode && self.scripts[0].endNode) {
            var sizeStart = self.scripts[0].startNode.size || 0;
            var sizeEnd = self.scripts[0].endNode.size || 0;

            var startX = self.scripts[0].startNode.x - camera.view.x + sizeStart/2;
            var startY = self.scripts[0].startNode.y - camera.view.y + sizeStart/2;

            var endX = self.scripts[0].endNode.x - camera.view.x + sizeEnd/2;
            var endY = self.scripts[0].endNode.y - camera.view.y + sizeEnd/2;

            //outline
            layer.strokeStyle('#000')
            layer.ctx.lineWidth = _.margin/2 + 2;
            layer.ctx.beginPath();
            layer.ctx.moveTo(startX, startY);

            layer.ctx.bezierCurveTo(startX, startY, startX, startY, endX, endY);

            layer.ctx.stroke();

            //outline
            layer.strokeStyle(self.scripts[0].endNode.color || _.color)
            layer.ctx.lineWidth = _.margin/2;
            layer.ctx.beginPath();
            layer.ctx.moveTo(startX, startY);

            layer.ctx.bezierCurveTo(startX, startY, startX, startY, endX, endY);

            layer.ctx.stroke();

        }
        layer.ctx.restore();

        //draw body
        var x = self.transform.position.x - camera.view.x - _.width/2;
        var y = self.transform.position.y - camera.view.y - _.bodyHeight/2;
        layer.fillStyle(this.bodyColor).fillRect(x, y, _.width, _.bodyHeight);

        //draw header
        var x = self.transform.position.x - camera.view.x - _.width/2;
        var y = self.transform.position.y - camera.view.y - _.headerHeight - _.bodyHeight/2;
        layer.fillStyle(this.headerColor).fillRect(x, y, _.width, _.headerHeight);
        layer.ctx.strokeStyle = this.dividerColor;
        layer.ctx.beginPath();
        layer.ctx.moveTo(x, y + _.headerHeight);
        layer.ctx.lineTo(x + _.width, y + _.headerHeight);
        layer.ctx.stroke();

        //draw header text
        layer.fillStyle(this.textColor);
        layer.ctx.font = "bold " + _.titleFontSize + "px OpenSans";
        this.renderText(layer.ctx, _.componentTitle, x + _.margin, y + _.titleLineHeight, _.width - _.margin, _.titleLineHeight)

        var x = self.transform.position.x - camera.view.x - _.width/2;
        var y = self.transform.position.y - camera.view.y - _.headerHeight - _.bodyHeight/2;
        layer.ctx.save();
        layer.ctx.lineWidth = 0.5;
        layer.strokeStyle(this.strokeColor).strokeRect(x, y, _.width, _.headerHeight + _.bodyHeight);
        layer.ctx.restore();

        //draw inputs
        layer.ctx.save();
        layer.fillStyle(this.textColor);
        layer.ctx.font = "500 " + _.bodyTextFont + "px OpenSans";

        layer.ctx.textAlign = "left"
        for(var i = 0; i < self.scripts[0].inNodes.length; i++) {
            var x = self.transform.position.x - camera.view.x - _.width/2 + 2*_.margin;
            var y = self.transform.position.y - camera.view.y - _.bodyHeight/2 + _.margin + i*(_.bodyLineHeight + _.margin);

            layer.ctx.save();
            layer.fillStyle(self.scripts[0].inNodes[i].color || this.defaultNodeStartColor)
                .fillRect(x - 3*_.margin/2, y + _.margin/2, _.margin, _.margin)
                .strokeStyle('#000')
                .strokeRect(x - 3*_.margin/2, y + _.margin/2, _.margin, _.margin);
            layer.ctx.restore();

            this.renderText(layer.ctx, self.scripts[0].inNodes[i].name, x, y + _.bodyLineHeight, _.width/2 - _.margin, _.bodyLineHeight)
        }

        //draw outputs
        layer.ctx.textAlign = "right"
        for(var i = 0; i < self.scripts[0].outNodes.length; i++) {
            var x = self.transform.position.x - camera.view.x + _.width/2 - 2*_.margin;
            var y = self.transform.position.y - camera.view.y - _.bodyHeight/2 + _.margin + i*(_.bodyLineHeight + _.margin);

            layer.ctx.save();
            layer.fillStyle(self.scripts[0].outNodes[i].color || this.defaultNodeStartColor)
                .fillRect(x + _.margin/3, y + _.margin/2, _.margin, _.margin)
                .strokeStyle('#000')
                .strokeRect(x + _.margin/3, y + _.margin/2, _.margin, _.margin);
            layer.ctx.restore();

            this.renderText(layer.ctx, self.scripts[0].outNodes[i].name, x, y + _.bodyLineHeight, _.width/2 - _.margin, _.bodyLineHeight)
        }

        layer.ctx.restore();

   }
}

module.exports = COMPONENT;
