var COMPONENT = {};

COMPONENT = function(args){
    this.scene = Amble.app.scene;
}

//script part
COMPONENT.prototype = {
    var: {
        width: 250,
        titleLineHeight: 20,
        bodyLineHeight: 20,
        margin: 8
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

        this.var.componentTitle = self.componentData._name;
        this.var.inputs = self.componentData._input;
        this.var.outputs = self.componentData._output;
        // console.log(this.var.inputs.length)

        var maxInOutText = 0;
        for(var i = 0; i < this.var.inputs.length; i++) {
            var w = ctx.measureText(this.var.inputs[i].name).width;
            if(w > maxInOutText)
                maxInOutText = w;
        }

        for(var i = 0; i < this.var.outputs.length; i++) {
            var w = ctx.measureText(this.var.outputs[i].name).width;
            if(w > maxInOutText)
                maxInOutText = w;
        }

        //calc width if not max
        this.var.width = ctx.measureText(this.var.componentTitle).width + 2*this.var.margin;

        if(2*maxInOutText + 4*this.var.margin > this.var.width) {
            this.var.width = 2*maxInOutText + 4*this.var.margin;
        }

        var inputHeight = 0;
        for(var i = 0; i < this.var.inputs.length; i++) {
            inputHeight += this.var.bodyLineHeight * this.calcLines(ctx, this.var.inputs[i].name, this.var.width/2 - 2*this.var.margin, this.var.bodyLineHeight) + this.var.margin;
        }

        var outputHeight = 0;
        for(var i = 0; i < this.var.outputs.length; i++) {
            outputHeight += this.var.bodyLineHeight * this.calcLines(ctx, this.var.outputs[i].name, this.var.width/2 - 2*this.var.margin, this.var.bodyLineHeight) + this.var.margin;
        }

        this.var.bodyHeight = 2*this.var.margin + (inputHeight >= outputHeight ? inputHeight : outputHeight);
        var lines = this.calcLines(ctx, this.var.componentTitle, this.var.width - 2*this.var.margin, this.var.titleLineHeight)
        this.var.headerHeight = (lines > 1 ? lines + 1: lines) * this.var.titleLineHeight + this.var.margin;

    },
    update: function(self) {

    }
}

//renderer
COMPONENT.Renderer = function(args){
    this.headerColor = args['headerColor'] || '#E0E0E0';
    this.bodyColor = '#FAFAFA';
    this.textColor = '#212121';
    this.strokeColor = 'red';
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

        //draw header
        var x = self.transform.position.x - camera.view.x - _.width/2;
        var y = self.transform.position.y - camera.view.y - _.headerHeight - _.bodyHeight/2;
        layer.fillStyle(this.headerColor).fillRect(x, y, _.width, _.headerHeight);

        //draw header text
        layer.fillStyle(this.textColor);
        layer.ctx.font = _.titleLineHeight + "px Arial";
        this.renderText(layer.ctx, _.componentTitle, x + _.margin, y + _.titleLineHeight, _.width - _.margin, _.titleLineHeight)

        //draw body
        x = self.transform.position.x - camera.view.x - _.width/2;
        y = self.transform.position.y - camera.view.y - _.bodyHeight/2;
        layer.fillStyle(this.bodyColor).fillRect(x, y, _.width, _.bodyHeight);

        //draw inputs/outputs

        //fill and stroke
        x = self.transform.position.x - camera.view.x - _.width/2;
        y = self.transform.position.y - camera.view.y - _.headerHeight - _.bodyHeight/2;
        layer.strokeStyle(this.strokeColor).strokeRect(x, y, _.width, _.headerHeight + _.bodyHeight);

   }
}

module.exports = COMPONENT;
