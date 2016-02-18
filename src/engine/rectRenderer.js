window.RectRenderer = (function() {

  var RectRenderer = function RectRenderer(args) {
    this.color = args.color || '#e91e63';
    this.layer = args.layer || 0;
    this.size = args.size || new Vec2(100, 100);

    // @ifdef EDITOR
    this.type = "rect";
    this._editorName = "RectRenderer";

    this.arrows = new SceneArrows();

    // @endif
  };

  RectRenderer.prototype = {

    render: function render(self, camera) {

      var layer = camera.camera.layer;

      var width = this.size.x;
      var height = this.size.y;
      var x = self.transform.position.x - camera.camera.view.x;
      var y = self.transform.position.y - camera.camera.view.y;

      layer.ctx.save();

      // move origin to object origin
      layer.ctx.translate(x, y);

      //scale
      layer.ctx.scale(self.transform.scale.x, self.transform.scale.y);

      // rotation in radians
      layer.ctx.rotate(-self.transform.rotation * Mathf.TO_RADIANS);

      // draw
      layer.fillStyle(this.color)
        .fillRect(-width/2, -height/2, width, height);

      // @ifdef EDITOR
      if(self.selected) {

        layer.strokeStyle(primaryColor)
          .lineWidth(3)
          .strokeRect(
            -width/2,
            -height/2,
            width,
            height
          );

        // rotate back
        layer.ctx.rotate(self.transform.rotation * Mathf.TO_RADIANS);

        this.arrows.render(self, camera);

      }
      // @endif

      layer.ctx.restore();
    }

  };

  return RectRenderer

}());
