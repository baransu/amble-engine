// @ifdef EDITOR
window.CameraRenderer = (function() {

    var CameraRenderer = function CameraRenderer(args) {
      this.layer = 9999;
      this.size = new Vec2(48, 48);

      this.img = new Image(48, 48);
      this.img.src = 'cam_icon.png';

      this.type = "engine";
      this._editorName = 'EngineRenderer'

      this.arrows = new SceneArrows();
    };

    CameraRenderer.prototype = {

      render: function render(self, camera) {

        var layer = camera.camera.layer;

        layer.ctx.save();

        var x = self.transform.position.x - camera.camera.view.x;
        var y = self.transform.position.y - camera.camera.view.y;
        layer.font('30px Arial');

        var width = self.camera.size.x;
        var height = self.camera.size.y;

        layer.ctx.translate(x, y);

        // rotation in radians
        layer.ctx.rotate(-self.transform.rotation * Mathf.TO_RADIANS);

        layer.ctx.scale(1/camera.camera.scale, 1/camera.camera.scale);
        //draw img
        layer.ctx.drawImage(this.img, -this.img.width/2, -this.img.height/2, this.img.width, this.img.height)

        layer.ctx.scale(camera.camera.scale, camera.camera.scale);

        if(self.selected) {

          layer.strokeStyle(primaryColor)
          .lineWidth(2)
          .strokeRect(-width/2, -height/2, width, height);

          // rotate pack
          layer.ctx.rotate(self.transform.rotation * Mathf.TO_RADIANS);
          this.arrows.render(self, camera);

        }

        layer.ctx.restore();
      }
    };

    return CameraRenderer;

}());
// @endif
