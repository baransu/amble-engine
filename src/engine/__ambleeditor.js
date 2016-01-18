window.Amble = (function(){

    var Amble = {};
    Amble.app = {};

    Amble.Application = function(args){
        var that = this;
        Amble.app = this;

        this.debug = new Amble.Debug();
        this.imgList = [];

        this.resize = typeof args['resize'] === 'boolean' ? args['resize'] : false;

        //wrap this things up
        if(this.resize) {
          window.addEventListener('resize', function(){

            var width = $(camera.context).width();
            var height = $(camera.context).height();

            Amble.app.width = Amble.app.mainCamera.camera.layer.canvas.width = width;
            Amble.app.height = Amble.app.mainCamera.camera.layer.canvas.height = height;

            Amble.app.mainCamera.getComponent('Camera').onresize(Amble.app.mainCamera);

          });
        }

        this.scene = new Amble.Scene();

        if(args['sceneCamera']) {
            this.mainCamera = this.scene.instantiate(args['sceneCamera']);
        }

        if(this.mainCamera) {
          this.width = this.mainCamera.camera.size.x || 800;
          this.height = this.mainCamera.camera.size.y || 600;
        }

        //init all public game loop functions
        var gameLoopFunctionsList = ['preload', 'loaded', 'start', 'preupdate', 'postupdate', 'prerender', 'postrender'];
        for(var i in gameLoopFunctionsList){
            this[gameLoopFunctionsList[i]] = typeof args[gameLoopFunctionsList[i]] === 'function' ? args[gameLoopFunctionsList[i]] : function(){};
        }

        this.paused = false;
        this.pause = function() {
            this.paused = true;
            console.log('pause')
        };

        this.unpause = function() {
            console.log('unpause')
            this.paused = false;
            gameLoop();
        };

        //private game loop functions
        this.update = function(){

            this.mainCamera.camera.update()
            this.scene.update();

            //update all objects on scene
            //priorytet sort?
        };

        this.render = function(){

            var camera = this.mainCamera.camera;
            var linesColor = '#eceff1'

            camera.layer.clear();
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


            this.scene.render(camera);

            layer.ctx.save();
            //draw camera viewport (sroke rect)
            layer.strokeStyle(primaryColor);
            layer.lineWidth(1.5)
            var x = -1280/2 - camera.view.x;
            var y = -720/2 - camera.view.y;
            layer.strokeRect(x, y, 1280,  720)

            layer.ctx.restore();



        };

        /* setting loader */
        this.loader = new Amble.Data.Loader();

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


        /* setting all loading heppens there */
        this.preload();

        /* all loading */
        this.loader.loadAll(function(){

            setTimeout(function(){
                clearInterval(that.loadingInterval);
                Amble.Input._setListeners();


                Amble.app.loader.audioCache = [];
                // that.scene.start();
                that.loaded();

                that.start();
                Amble.Time._lastTime = Date.now()
                gameLoop();

            }, 0);
        })

        function gameLoop(){
            if(!that.paused) {

                var now = Date.now();
                Amble.Time.deltaTime = (now - Amble.Time._lastTime) / 1000.0;

                if(that.mainCamera) {
                    that.preupdate();
                    that.update();
                    that.postupdate();
                    that.render();
                    that.postrender();
                }

                Amble.Time._lastTime = now;
                requestAnimationFrame(gameLoop)
            }
        }
    };

    return Amble;

}());
