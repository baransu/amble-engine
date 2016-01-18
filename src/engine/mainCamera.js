var MainCamera = (function() {

    var MainCamera = function MainCamera(args) {
      this.position = args.position || new Vec2();
      this.context = document.getElementById(args.context) || document.body;
      this.size =  new Vec2($(this.context).width(), $(this.context).height());
      this.view = new Vec2(this.position.x - this.size.x, this.position.y - this.size.y);
      this.scale = 1;
      this.layer = new Layer(this.size.x, this.size.y);
      this.layer.appendTo(this.context);
    };

    MainCamera.prototype = {

      update: function update() {
        this.view = new Vec2(this.position.x - this.size.x/2, this.position.y - this.size.y/2);
        return this;
      }

    };

    return MainCamera;

}());
