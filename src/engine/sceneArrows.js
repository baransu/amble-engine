// @ifdef EDITOR
window.SceneArrows = (function() {

    var SceneArrows = function SceneArrows(args) {

      this.selectedColor = 'yellow';
      this.xArrowColor = 'red';
      this.yArrowColor = 'lime';

      this.rootRectColor = 'blue';

      this.rectSize = 32;

    };

    SceneArrows.prototype = {

      render: function render(self, camera) {

        var layer = camera.camera.layer;

        layer.ctx.save();

        // render both rect stroke with opacity

        // var x = self.transform.position.x - camera.camera.view.x;
        // var y = self.transform.position.y - camera.camera.view.y;

        // layer.ctx.translate(x, y);

        //scale
        layer.ctx.scale(self.transform.scale.x, self.transform.scale.y);

        // layer.fillStyle('rgb("0, 0, 255, 1")')
        // layer.fillRect(0, -this.rectSize, this.rectSize, this.rectSize)
        layer.strokeStyle(this.rootRectColor)
        layer.strokeRect(0, -this.rectSize, this.rectSize, this.rectSize)


        layer.ctx.restore();
        // render x arrow
        // render y arrow


      },

      checkClick: function() {

        //check x and y arrow and return which arrow is clicked

        //check both arrows (rect in the root of both arrows)



      },



    };

    return SceneArrows;

}());
// @endif
