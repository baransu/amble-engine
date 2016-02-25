Class({

  name: 'Camera',

  _options: {
    hide: true
  },

  properties: {
    lastMousePos: { type: Vec2 },
    done: false,
    zoomSpeed: 1,
    origin: { type: Vec2 },
    maxZoom: 0.05,
    minZoom: 4,
    translate: { type: Vec2 },
    zoom: 0,
    mouse: { type: Vec2 },
    selectedActor: null,
    modifier: { type: Vec2 },
    selectedActor: null,
    editor: null,
    selectedAxis: {
      type: String,
      value: ''
    },
    move: {
      type: Boolean,
      value: false
    },
    startRotation: { type: Number },
    rotationOffset: { type: Number },
    firstPressed: {
      type: Boolean,
      value: false
    },
    recentlySelected: {
      type: Boolean,
      value: true
    }
  },

  update: function(self) {

    this.mouse.x = (Input.mousePosition.x/self.camera.scale - this.translate.x) + self.camera.view.x;
    this.mouse.y = (Input.mousePosition.y/self.camera.scale - this.translate.y) + self.camera.view.y;

    if(Input.isMousePressed(3)) {

      if(!this.done) {
        this.done = true;
        this.lastMousePos.copy(Input.mousePosition);
      }

      var x = (this.lastMousePos.x - Input.mousePosition.x)/self.camera.scale;
      var y = (this.lastMousePos.y - Input.mousePosition.y)/self.camera.scale;
      self.transform.position.add(new Vec2(x, y));

      this.lastMousePos.copy(Input.mousePosition);
    } else {
      this.done = false
    }

    if(!this.move && EDITOR.actor && EDITOR.actor.renderer && EDITOR.actor.renderer.arrows) {
      this.selectedAxis = EDITOR.actor.renderer.arrows.checkClick(EDITOR.actor, self, this.mouse.x, this.mouse.y);
    }

    if(Input.isMousePressed(1) && this.selectedActor && !this.recentlySelected) {

      if(this.selectedActor.renderer && this.selectedActor.renderer.arrows) {
        this.selectedActor.renderer.arrows.selected = this.selectedAxis;
      }

      if(!this.firstPressed && (this.selectedAxis == 'x' || this.selectedAxis == 'y' || this.selectedAxis == 'rot')) {
        prepareUndoRedo();
        this.firstPressed = true;
      }

      if(this.selectedAxis == 'both') {
        this.selectedActor.prefab.transform.args.position.args.x = this.selectedActor.transform.position.x = (this.mouse.x + this.modifier.x) | 0;
        this.selectedActor.prefab.transform.args.position.args.y = this.selectedActor.transform.position.y = (this.mouse.y + this.modifier.y) | 0;
        this.editor.refresh();
      } else if(this.selectedAxis == 'x') {
        this.selectedActor.prefab.transform.args.position.args.x = this.selectedActor.transform.position.x = (this.mouse.x + this.modifier.x) | 0;
        this.editor.refresh();
      } else if(this.selectedAxis == 'y') {
        this.selectedActor.prefab.transform.args.position.args.y = this.selectedActor.transform.position.y = (this.mouse.y + this.modifier.y) | 0;
        this.editor.refresh();
      } else if(this.selectedAxis == 'rot') {

        var angle = Math.atan2(this.mouse.y - self.transform.position.y, this.mouse.x - self.transform.position.x) / Mathf.TO_RADIANS;
        this.selectedActor.prefab.transform.args.rotation = this.selectedActor.transform.rotation = -angle - this.startRotation + this.rotationOffset| 0;
      }

      this.editor.refresh();
    }
  },

  onresize: function(self) {

    var width = $(self.camera.getContext()).width();
    var height = $(self.camera.getContext()).height();

    if(self.camera.scale != 1) {
      var w = self.camera.size.x;
      var h = self.camera.size.y;

      self.camera.layer.ctx.scale(this.zoom,this.zoom);
      self.camera.layer.ctx.translate(
        -( w/2 / self.camera.scale + this.origin.x - w/2 ),
        -( h/2 / self.camera.scale + this.origin.y - h/2)
      );

      this.translate.x = -( w/2 / self.camera.scale + this.origin.x - w/2 );
      this.translate.y = -( h/2 / self.camera.scale + this.origin.y - h/2 );

      this.origin.x = ( w/2 / self.camera.scale + this.origin.x - w/2 );
      this.origin.y = ( h/2 / self.camera.scale + this.origin.y - h/2 );

      self.camera.scale = 1;
    }

    self.camera.size = new Vec2(width, height);
    self.camera.update(self);
  },

  onmousedown: function(self, e) {

    switch(e.which) {
    case 1:

      this.startRotation = self.transform.rotation;
      this.rotationOffset = Math.atan2(this.mouse.y - self.transform.position.y, this.mouse.x - self.transform.position.x) / Mathf.TO_RADIANS;

      if(this.selectedActor) {
        this.move = true;
        this.modifier.x = this.selectedActor.transform.position.x - this.mouse.x;
        this.modifier.y = this.selectedActor.transform.position.y - this.mouse.y;
      }

      if(this.selectedAxis == '') {
        for(var i = AMBLE.scene.children.length - 1; i >= 0; i--) {
          var obj = AMBLE.scene.children[i];
          if(obj.renderer) {
            var width = obj.renderer.size.x * obj.transform.scale.x;
            var height = obj.renderer.size.y * obj.transform.scale.y;
            var x = obj.transform.position.x;
            var y = obj.transform.position.y;

            if(this.mouse.x > x - width/2 && this.mouse.x < x + width/2 && this.mouse.y > y - height/2 && this.mouse.y < y + height/2) {

              this.selectedActor = obj;

              EDITOR.hierarchy.search = '';
              EDITOR.refresh()
              var a = document.getElementById('id_' + obj.sceneID);
              if(a) {
                a.click();
                // location.href = "#id_" + obj.sceneID;
              }

              this.recentlySelected = true;

              return;
            }
          }
        }
      }

    break;
    }
  },

  onmouseup: function(self, e) {
    if(e.which == 1) {
      this.move = false;
      this.firstPressed = false;

      if(this.recentlySelected) this.recentlySelected = false;


    }
  },

  onmousewheel: function(self, e){

    var zoomToX = self.camera.size.x/2;
    var zoomToY = self.camera.size.y/2;
    var wheelSpeed = 8; //highter is slower
    var wheel = e.wheelDelta/(120 * wheelSpeed);
    this.zoom = Math.pow(1 + Math.abs(wheel)/2 , wheel > 0 ? 1 : -1);

    self.camera.layer.ctx.translate(
      this.origin.x,
      this.origin.y
    );

    var nextScale = self.camera.scale * this.zoom

    // if(nextScale > this.minZoom) {
    //     nextScale = this.minZoom;
    // } else if (nextScale < this.maxZoom) {
    //     nextScale = this.maxZoom;
    // }

    this.zoom = nextScale/self.camera.scale;

    self.camera.layer.ctx.scale(this.zoom,this.zoom);
    self.camera.layer.ctx.translate(
      -( zoomToX / self.camera.scale + this.origin.x - zoomToX / nextScale ),
      -( zoomToY / self.camera.scale + this.origin.y - zoomToY / nextScale )
    );

    this.translate.x = -( zoomToX / self.camera.scale + this.origin.x - zoomToX / nextScale);
    this.translate.y = -( zoomToY / self.camera.scale + this.origin.y - zoomToY / nextScale);

    this.origin.x = ( zoomToX / self.camera.scale + this.origin.x - zoomToX / nextScale );
    this.origin.y = ( zoomToY / self.camera.scale + this.origin.y - zoomToY / nextScale );

    self.camera.scale *= this.zoom;
  }
})
