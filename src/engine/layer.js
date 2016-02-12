window.Layer = (function() {

    var Layer = function Layer(camera) {

      this.canvas = document.createElement('canvas');
      this.canvas.width = camera.size.x;
      this.canvas.height = camera.size.y;
      this.canvas.style.position = 'absolute';
      this.ctx = this.canvas.getContext('2d');

      this.ctx.imageSmoothingEnabled = AMBLE.antyAliasing;
      this.ctx.mozImageSmoothingEnabled = AMBLE.antyAliasing;
      this.ctx.msImageSmoothingEnabled = AMBLE.antyAliasing;

      // @ifdef EDITOR
      this.resize = function() {
        // console.log(camera.getContext());
        var contextElement = camera.getContext();
        // console.log(contextElement.clientWidth, contextElement.clientHeight, contextElement.offsetLeft, contextElement.offsetTop)
        this.canvas.width = contextElement.clientWidth;
        this.canvas.height = contextElement.clientHeight;
        this.canvas.style.left = contextElement.offsetLeft;
        this.canvas.style.top = contextElement.offsetTop;
      }
      // @endif

      // @ifdef GAME
      //scale to fullscreen
      this.resize = function() {

        var scaleX = window.innerWidth / this.canvas.width;
        var scaleY = window.innerHeight / this.canvas.height;

        var scaleToFit = Math.min(scaleX, scaleY);
        var scaleToCover = Math.max(scaleX, scaleY);

        var w = window.innerWidth - (this.canvas.width * scaleToFit);
        var h = window.innerHeight - (this.canvas.height * scaleToFit);

        this.canvas.style.top = (h/2) + 'px';
        this.canvas.style.left = (w/2) + 'px';

        this.canvas.style.transformOrigin = "0 0"; //scale from top left
        this.canvas.style.transform = "scale(" + scaleToFit + ")";
      }
      // @endif

      this.resize();

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
        if (color && color != 'transparent') {
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
