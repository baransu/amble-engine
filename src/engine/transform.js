var Transform = (function() {

    var Transform = function Transform(args) {
      this.position = args.position || new Vec2();
      this.scale = args.scale || new Vec2(1, 1);
      this.rotation = args.rotation || 0;

    };

    return Transform;

}());
