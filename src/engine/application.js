var Application  = (function() {

  var Application = function Application(args) {

    var that = AMBLE = this;

    this.debug = new Debug();
    this.imgList = [];

    this.resize = typeof args.resize === 'boolean' ? args.resize : false;

    this.antyAliasing = typeof args['antyAliasing'] === 'boolean' ? args['antyAliasing'] : false;

    this.fullscreen = args['fullscreen'] || false;
    this.width = args['width'] || 640;
    this.height = args['height'] || 480;

    this.scene = new Scene();
    if(args.mainCamera) {
      this.mainCamera = this.scene.instantiate(args.mainCamera);
    }

    if(this.mainCamera) {
      this.width = this.mainCamera.camera.size.x || 800;
      this.height = this.mainCamera.camera.size.y || 600;
    }

    //wrap this things up
    if(this.resize) {
      window.addEventListener('resize', function() {

        // @ifdef EDITOR
        var width = $(that.mainCamera.camera.context).width();
        var height = $(that.mainCamera.camera.context).height();

        that.width = that.mainCamera.camera.layer.canvas.width = width;
        that.height = that.mainCamera.camera.layer.canvas.height = height;
        that.mainCamera.getComponent('Camera').onresize(that.mainCamera);
        // @endif

        // @ifdef GAME
        that.mainCamera.camera.layer.resize();
        // @endif

        // @ifdef SRC
        that.mainCamera.camera.layer.resize();
        // @endif

      });
    }


    //init all public game loop functions
    var gameLoopFunctionsList = ['preload', 'loaded', 'start', 'preupdate', 'postupdate', 'prerender', 'postrender'];
    for(var i in gameLoopFunctionsList){
        this[gameLoopFunctionsList[i]] = typeof args[gameLoopFunctionsList[i]] === 'function' ? args[gameLoopFunctionsList[i]] : function(){};
    }

    this.paused = false;
    // @ifdef EDITOR
    this.pause = function pause() {
        this.paused = true;
        console.log('pause')
    };

    this.unpause = function unpause() {
        console.log('unpause')
        this.paused = false;
        gameLoop();
    };
    // @endif

    this.update = function update(){
      this.mainCamera.camera.update()
      this.scene.update();
    };

    this.defaultBgColor = args.defaultBgColor || 'transparent';

    this.render = function render(){
      var camera = this.mainCamera.camera;
      if(this.defaultBgColor == 'transparent') {
        camera.layer.clear();
      } else {
        camera.layer.clear(this.defaultBgColor);
      }

      // @ifdef EDITOR
      var linesColor = '#eceff1'
      var layer = camera.layer;

      layer.strokeStyle(linesColor).lineWidth(0.5);
      layer.ctx.beginPath();

      var lineSpacing = 200;

      var verticalLinesCount = ((this.width/camera.scale)/lineSpacing) * 2;
      var horizontalLinesCount = ((this.height/camera.scale)/lineSpacing) * 2;
      var startX = Math.floor(camera.position.x - (camera.size.x)/camera.scale) - (camera.position.x - (camera.size.x)/camera.scale) % lineSpacing;
      var startY = Math.floor(camera.position.y - (camera.size.y)/camera.scale) - (camera.position.y - (camera.size.y)/camera.scale) % lineSpacing;

      //vertical lines
      for(var i = -2; i < verticalLinesCount; i++) {
          layer.ctx.moveTo(startX + lineSpacing * i - camera.view.x, camera.position.y - camera.size.y/camera.scale - camera.view.y - lineSpacing);
          layer.ctx.lineTo(startX + lineSpacing * i - camera.view.x, camera.position.y + camera.size.y/camera.scale - camera.view.y);
      }

      //horizonala
      for(var i = -2; i < horizontalLinesCount; i++) {
          layer.ctx.moveTo(camera.position.x - camera.size.x/camera.scale - camera.view.x - lineSpacing * 2, startY + lineSpacing * i - camera.view.y);
          layer.ctx.lineTo(camera.position.x + camera.size.x/camera.scale - camera.view.x, startY + lineSpacing * i - camera.view.y);
      }

      layer.ctx.stroke();
      // @endif

      this.scene.render(camera);

      // @ifdef EDITOR
      layer.ctx.save();
      //draw camera viewport (sroke rect)
      layer.strokeStyle(primaryColor);
      layer.lineWidth(1.5)
      var x = -1280/2 - camera.view.x;
      var y = -720/2 - camera.view.y;
      layer.strokeRect(x, y, 1280,  720)

      layer.ctx.restore();
      // @endif

    };

    this.loader = new Loader();

    var loadingTimer = 0;
    var currentLoadingText = 0;

    var colors = [
        "#8e24aa",
        "#5e35b1",
        "#3949ab",
        "#1e88e5",
        "#039be5",
        "#00acc1",
        "#00897b",
        "#43a047",
        "#7cb342",
        "#c0ca33",
        "#fbc02d",
        "#ff6f00",
        "#e53935",
        "#e91e63"
    ];

    var color = colors[Math.floor(Math.random() * colors.length - 1)];

    this.loadingInterval = setInterval(function(){
      if(that.mainCamera) {
        var x = (that.width - that.width/4) * ((that.loader.successCount + that.loader.errorCount)/that.loader.queue.length);
        var layer = that.mainCamera.camera.layer;
        layer.ctx.save();
        var loading = [
            "   loading.  ",
            "   loading.. ",
            "   loading...",
        ]

        layer.clear('black')
            .fillStyle(color)
            .strokeStyle('white')
            .fillRect(that.width/8, that.height/2 - that.height/16, x, that.height/8)
            .strokeRect(that.width/8, that.height/2 - that.height/16, (that.width - that.width/4), that.height/8);

        layer.ctx.shadowColor = "white";
        layer.ctx.shadowBlur = 20;

        layer.fillStyle('white');
        layer.ctx.textAlign = 'center';
        layer.ctx.font = "25px Arial";
        var text = parseInt(((that.loader.successCount + that.loader.errorCount)/that.loader.queue.length) * 100) + "%"
        layer.ctx.fillText(text, that.width/2, that.height/2 + 7)

        layer.ctx.font = "20px Arial";
        text = loading[currentLoadingText];
        layer.ctx.fillText(text, that.width/2, 2*that.height/3 + 10)

        loadingTimer += 1/60;
        if(loadingTimer > 1) {
          loadingTimer = 0;
          currentLoadingText++;
          if(currentLoadingText == loading.length) currentLoadingText = 0;
        }
        layer.ctx.restore();
      }
    }, 1000/60);


    this.preload();

    this.loader.loadAll(function(){

      var delay = 0;
      // @ifdef SRC
      delay = 1000;
      // @endif

      setTimeout(function(){
        clearInterval(that.loadingInterval);
        Input._setListeners();

        that.scene.start();
        that.loaded();

        that.start();
        Time._lastTime = Date.now()
        gameLoop();

      }, delay);
    });

    function gameLoop(){
      if(!that.paused) {

        var now = Date.now();
        Time.deltaTime = (now - Time._lastTime) / 1000.0;

        if(that.mainCamera) {
          that.preupdate();
          that.update();
          that.postupdate();
          that.render();
          that.postrender();
        }

        Time._lastTime = now;
        requestAnimationFrame(gameLoop)
      }
    }
  };

  return Application;

}());
