var Transform = (function() {

    var Transform = function Transform(args) {
      this.position = args.position || new Vec2();
      this.rotation = args.rotation || 0;
      this.scale = new Vec2(1, 1);

    };

    return Transform;

}());
