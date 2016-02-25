// @ifdef EDITOR
window.SceneArrows = (function() {

    var SceneArrows = function SceneArrows(args) {

      this.rectSize = 32;

      this.arrowLength = 100;

      this.arrowSize = 15;

      this.selected = null;

    };

    SceneArrows.prototype = {

      render: function render(self, camera) {

        var layer = camera.camera.layer;

        layer.ctx.save();

        // render both rect stroke with opacity
        layer.ctx.scale(1/camera.camera.scale, 1/camera.camera.scale);

        var yellow = 'rgb(255, 255, 25)'
        var xArrowColor = this.selected != 'x' ? 'rgb(255, 25, 25)' : yellow;
        var yArrowColor = this.selected != 'y' ? 'rgb(25, 255, 25)' : yellow;
        var rotationArcColor = this.selected != 'rot' ? 'rgb(25, 25, 255)' : 'yellow';

        var rootRectColor = 'rgb(25, 25, 255)';
        var rootSemiTransparentRectColor = this.selected != 'both' ? 'rgba(25, 25, 255, 0.3)' : 'rgba(255, 255, 25, 0.3)';

        layer.lineWidth(1);

        layer.fillStyle(rootSemiTransparentRectColor)

        layer.fillRect(0, 0, this.rectSize, this.rectSize)
        layer.strokeStyle(rootRectColor)
        layer.strokeRect(0, 0, this.rectSize, this.rectSize)

        // render x arrow
        layer.strokeStyle(xArrowColor)
        layer.ctx.beginPath();
        layer.ctx.moveTo(0,0);
        layer.ctx.lineTo(this.arrowLength, 0);
        layer.ctx.stroke();

        layer.fillStyle(xArrowColor);
        layer.ctx.beginPath();
        layer.ctx.moveTo(this.arrowLength, this.arrowSize/2);
        layer.ctx.lineTo(this.arrowLength + this.arrowSize, 0);
        layer.ctx.lineTo(this.arrowLength, -this.arrowSize/2);
        layer.ctx.fill();

        // render y arrow
        layer.strokeStyle(yArrowColor)
        layer.ctx.beginPath();
        layer.ctx.moveTo(0,0);
        layer.ctx.lineTo(0, this.arrowLength);
        layer.ctx.stroke();

        layer.fillStyle(yArrowColor)
        layer.ctx.beginPath();
        layer.ctx.moveTo(this.arrowSize/2, this.arrowLength);
        layer.ctx.lineTo(0, this.arrowLength + this.arrowSize);
        layer.ctx.lineTo(-this.arrowSize/2, this.arrowLength);
        layer.ctx.fill();

        // origin dot
        layer.fillStyle(rootRectColor)
        layer.ctx.beginPath();
        layer.ctx.arc(
          0,
          0,
          5,
          0,
          2*Math.PI
        );
        layer.ctx.fill();

        if(self.tag != 'mainCamera') {
          // rotation arc
          layer.strokeStyle(rotationArcColor);
          layer.ctx.beginPath();
          layer.ctx.arc(
            0,
            0,
            this.arrowLength,
            0,
            Math.PI/2,
            true
          );
          layer.ctx.stroke();
        }


        layer.ctx.restore();

      },

      //check and return which is hovered
      checkClick: function(self, camera, mouseX, mouseY) {

        var scale = camera.camera.scale;

        var x = self.transform.position.x;
        var y = self.transform.position.y;

        var rectSize = this.rectSize / scale;
        var arrowLength = this.arrowLength / scale;
        var arrowSize = this.arrowSize / scale;

        var angle = Math.atan2(mouseY - y, mouseX - x) / Mathf.TO_RADIANS;

        var distance2 = Math.pow(x - mouseX, 2) + Math.pow(y - mouseY, 2);

        // both
        if(mouseX > x && mouseX < x + rectSize && mouseY > y && mouseY < y + rectSize) {
          this.selected = 'both';
          return 'both';

        // x arrow
        } else if(mouseX > x && mouseX < x + arrowLength + arrowSize && mouseY > y - arrowSize/2 && mouseY < y + arrowSize/2) {
          this.selected = 'x';
          return 'x';

          // y arrow
        } else if(mouseX > x - arrowSize/2 && mouseX < x + arrowSize/2 && mouseY > y && mouseY < y + arrowLength + arrowSize) {
          this.selected = 'y';
          return 'y';

        } else if(self.tag != 'mainCamera' && (angle < 0 || angle > 90) && distance2 > Math.pow( arrowLength - rectSize/2 , 2) && distance2 < Math.pow( arrowLength + rectSize/2 , 2)/*angle between mouse and center && distance == radius +- rectSize/2 */) {
          this.selected = 'rot';
          return 'rot'

        } else {
          this.selected = '';
          return '';
        }
      },

    };

    return SceneArrows;

}());
// @endif
