var Layer = (function() {

    var Layer = function Layer(width, height) {

      this.canvas = document.createElement('canvas');
      this.canvas.width = width || AMBLE.width;
      this.canvas.height = height || AMBLE.height;
      this.canvas.style.position = 'absolute';
      this.ctx = this.canvas.getContext('2d');

    };

    Layer.prototype = {

      appendTo: function appendTo(element) {
        this.parent = element;
        element.appendChild(this.canvas);
        return this;
      },

      remove: function remove() {
        this.parent.removeChild(this.canvas);
        return this;
      },

      clear: function clear(color) {

        this.ctx.save();
        this.ctx.setTransform(1,0,0,1,0,0);
        if (color) {
            this.ctx.fillStyle = color;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        } else {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }

        this.ctx.restore();
        return this;
      },

      fillStyle: function fillStyle(color) {
        this.ctx.fillStyle = color;
        return this;
      },

      fillRect: function fillRect(x, y, width, height) {
        this.ctx.fillRect(x, y, width, height);
        return this;
      },

      strokeStyle: function strokeStyle(color) {
        this.ctx.strokeStyle = color;
        return this;
      },

      strokeRect: function strokeRect(x, y, width, height) {
        this.ctx.strokeRect(x, y, width, height);
        return this;
      },

      stroke: function stroke() {
        this.ctx.stroke();
        return this;
      },

      lineWidth: function lineWidth(width) {
        this.ctx.lineWidth = width;
        return this;
      },

      font: function font(font) {
        this.ctx.font = font;
        return this;
      },

      textAlign: function textAlign(align) {
        this.ctx.textAlign = align;
        return this;
      },

      fillText: function fillText(text, x, y) {
        this.ctx.fillText(text, x, y);
        return this;
      },

      strokeText: function strokeText(text, x, y) {
        this.ctx.strokeText(text, x, y);
        return this;
      }

      // TODO: more canvas methods

    };

    return Layer;

}());
