var COMPONENT = {};

COMPONENT = function(args){

}

//script part
COMPONENT.prototype = {
    var: {
        width: 250,
        titleLineHeight: 25,
        titleFontSize: 15,
        bodyLineHeight: 20,
        bodyTextFont: 15,
        margin: 16
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
        this.var.inputs = self.componentData._input;
        this.var.outputs = self.componentData._output;

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

        //calc width (title width or in/out text)
        this.var.width = ctx.measureText(this.var.componentTitle).width + 2*this.var.margin;

        if(2*maxInOutText + 4*this.var.margin > this.var.width) {
            this.var.width = 2*maxInOutText + 5*this.var.margin;
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
        this.var.headerHeight = lines * this.var.titleLineHeight + this.var.margin;

    },
    update: function(self) {

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

        //draw body
        x = self.transform.position.x - camera.view.x - _.width/2;
        y = self.transform.position.y - camera.view.y - _.bodyHeight/2;
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


        //draw inputs
        layer.ctx.save();
        layer.fillStyle(this.textColor);
        layer.ctx.font = "500 " + _.bodyTextFont + "px OpenSans";

        layer.ctx.textAlign = "left"
        x = self.transform.position.x - camera.view.x - _.width/2 + 2*_.margin;
        for(var i = 0; i < _.inputs.length; i++) {
            y = self.transform.position.y - camera.view.y - _.bodyHeight/2 + _.margin + i*(_.bodyLineHeight + _.margin);


            layer.ctx.save();
            layer.fillStyle(_.inputs[i].color || this.defaultNodeStartColor).fillRect(x - 3*_.margin/2, y + _.margin/2, _.margin, _.margin);
            layer.ctx.restore();

            this.renderText(layer.ctx, _.inputs[i].name, x, y + _.bodyLineHeight, _.width/2 - _.margin, _.bodyLineHeight)
        }

        //draw outputs
        layer.ctx.textAlign = "right"
        x = self.transform.position.x - camera.view.x + _.width/2 - 2*_.margin;
        for(var i = 0; i < _.outputs.length; i++) {
            y = self.transform.position.y - camera.view.y - _.bodyHeight/2 + _.margin + i*(_.bodyLineHeight + _.margin);

            layer.ctx.save();
            layer.fillStyle(_.outputs[i].color || this.defaultNodeStartColor).fillRect(x + _.margin/3, y + _.margin/2, _.margin, _.margin);
            layer.ctx.restore();

            this.renderText(layer.ctx, _.outputs[i].name, x, y + _.bodyLineHeight, _.width/2 - _.margin, _.bodyLineHeight)
        }

        layer.ctx.restore();

        // stroke and shadow
        x = self.transform.position.x - camera.view.x - _.width/2;
        y = self.transform.position.y - camera.view.y - _.headerHeight - _.bodyHeight/2;
        layer.ctx.save();
        // layer.ctx.shadowColor = '#000';
        // layer.ctx.shadowBlur = 1;
        layer.ctx.lineWidth = 0.5;
        layer.strokeStyle(this.strokeColor).strokeRect(x, y, _.width, _.headerHeight + _.bodyHeight);
        layer.ctx.restore();

   }
}

module.exports = COMPONENT;
