// @ifdef EDITOR
window.EngineRenderer = (function() {

    var EngineRenderer = function EngineRenderer(args) {
      this.layer = 0;
      this.size = new Vec2();
      this.type = "engine";
      this._editorName = 'EngineRenderer'
    };

    EngineRenderer.prototype = {

      render: function render(self, camera) {

        var layer = camera.camera.layer;

        layer.ctx.save();

        var x = self.transform.position.x - camera.camera.view.x;
        var y = self.transform.position.y - camera.camera.view.y;
        layer.font('30px Arial');

        this.size.x = layer.ctx.measureText(self.name || 'Actor').width * 2;
        this.size.y = 60;

        layer.ctx.translate(x, y);

        //scale
        layer.ctx.scale(self.transform.scale.x, self.transform.scale.y);

        // rotation in radians
        layer.ctx.rotate(-self.transform.rotation * Mathf.TO_RADIANS);

        layer.fillStyle('green')
        layer.ctx.beginPath();
        layer.ctx.arc(
          0,
          0,
          5,
          0,
          2*Math.PI
        );
        layer.ctx.fill();

        layer.textAlign('center')
          .fillStyle('transparent')
          .fillRect(
            -this.size.x/2,
            -this.size.y/2,
            this.size.x,
            this.size.y
          )
          .fillStyle('#bcbebf')
          .fillText(
            self.name || 'Actor',
            0,
            -15
          );

          if(self.selected) {
            layer.strokeStyle(primaryColor)
            .lineWidth(1)
            .strokeText(
              self.name || 'Actor',
              0,
              -15
            );

          }

        layer.ctx.restore();
      }
    };

    return EngineRenderer;

}());
// @endif
