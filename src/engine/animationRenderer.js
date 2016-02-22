window.AnimationRenderer = (function() {

  var AnimationRenderer = function AnimationRenderer(args) {
    this.sprite = args.sprite;
    this.layer = args.layer || 0;
    this.updatesPerFrame = args.updatesPerFrame || 1;
    this.frames = args.frames || 1;
    this.play = args.play || false;
    this.loop = args.loop || true;

    this._currentFrame = 0;
    this._updates = 0;
    this._sprite = null;
    this._frameTimer = 0;
    this.size = new Vec2();

    this.currentSprite = '';

    // @ifdef EDITOR
    this.type = "animation";
    this._editorName = "AnimationRenderer"

    this.arrows = new SceneArrows();

    // @endif
  };

  AnimationRenderer.prototype = {

    render: function render(self, camera) {

      var layer = camera.camera.layer;

      layer.ctx.save();

      if(this._sprite) {
        // console.log(this._sprite.src, this.sprite, AMBLE.loader.isDone())
        if(this.sprite != this.currentSprite && AMBLE.loader.isDone()) {
          this._sprite = AMBLE.loader.getAsset(this.sprite);
          this.currentSprite = this.sprite;
          if(!this._sprite) return;
        }

        var width = (this._sprite.width/this.frames) | 0;
        var height = this._sprite.height;

        this.size.x = width * self.transform.scale.x;
        this.size.y = height * self.transform.scale.y;

        var x = (self.transform.position.x - camera.camera.view.x)// | 0 <- round for optymalization
        var y = (self.transform.position.y - camera.camera.view.y)// | 0 <- round for optymalization

        layer.ctx.translate(x, y);

        if(self.transform.scale.x != 1 || self.transform.scale.y != 1) {
          layer.ctx.scale(self.transform.scale.x, self.transform.scale.y);
        }

        if(self.transform.rotation != 0) {
          layer.ctx.rotate(-self.transform.rotation * Mathf.TO_RADIANS);
        }

        if(this._sprite.src) {
          layer.ctx.drawImage(
            this._sprite,
            this._currentFrame * width,
            0,
            width,
            height,
            -width/2 | 0,
            -height/2 | 0,
            width,
            height
          );

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

            if(self.transform.rotation != 0) {
              layer.ctx.rotate(self.transform.rotation * Mathf.TO_RADIANS);
            }

            if(self.transform.scale.x != 1 || self.transform.scale.y != 1) {
              layer.ctx.scale(1/self.transform.scale.x, 1/self.transform.scale.y);
            }

            this.arrows.render(self, camera);

          }
          // @endif
        }

      } else if(this.sprite != this.currentSprite){
        this._sprite = AMBLE.loader.getAsset(this.sprite);
        this.currentSprite = this.sprite;
      }

      layer.ctx.restore();

      if(this.play) {
        this._updates++;
        if(this._updates > this.updatesPerFrame) {
          this._updates = 0;
          if(this._currentFrame < this.frames - 1) this._currentFrame++;
          else if(this.loop) this._currentFrame = 0;
        }
      }
    }
  };

  return AnimationRenderer;

}());
