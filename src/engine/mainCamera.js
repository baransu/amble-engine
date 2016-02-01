window.MainCamera = (function() {

    var MainCamera = function MainCamera(args) {
      this.context = document.getElementById(args.context) || document.body;

      this.size = args.size || new Vec2(1280, 720);

      this.bgColor = args.bgColor || '#37474f';

      this.view = new Vec2();
      this.scale = args.scale || 1;

      // @ifdef EDITOR
      if(args.layer) {
        this.size.x = $(this.context).width();
        this.size.y = $(this.context).height();
      // @endif
      this.layer = new Layer(this).appendTo(this.context);
      // @ifdef EDITOR
      }
      // @endif
    };

    MainCamera.prototype = {

      update: function update(self) {
        this.view = new Vec2(self.transform.position.x - this.size.x/2, self.transform.position.y - this.size.y/2);
        return this;
      }

    };

    return MainCamera;

}());
