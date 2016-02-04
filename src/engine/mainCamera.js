window.MainCamera = (function() {

    var MainCamera = function MainCamera(args) {

      this.context = args.context;

      this.size = args.size || new Vec2(1280, 720);

      this.bgColor = args.bgColor || '#37474f';

      this.view = new Vec2();
      this.scale = args.scale || 1;


      this.getContext = function getContext() {
        if(this.context) {
          return document.getElementById(this.context) || document.body;
        } else {
          return document.body;
        }
      };

      // @ifdef EDITOR
      if(args.layer) {
        this.size.x = $(this.getContext()).width();
        this.size.y = $(this.getContext()).height();
      // @endif
      this.layer = new Layer(this).appendTo(this.getContext());
      // @ifdef EDITOR
      }
      // @endif
    };

    MainCamera.prototype = {

      update: function update(self) {
        this.view = new Vec2(self.transform.position.x - this.size.x/2, self.transform.position.y - this.size.y/2);
        return this;
      },

    };

    return MainCamera;

}());
