var COMPONENT = {};

COMPONENT = function(args){
    this.scene = Amble.app.scene;
}

//script part
COMPONENT.prototype = {
    start: function(self) {
        //calculate and save size and variables
    },
    update: function(self) {

    }
}

//renderer
COMPONENT.Renderer = function(args){
    this.color = args['color'] || 'pink';
}
COMPONENT.Renderer.prototype = {
    render: function(self, layer, camera){
        var x = self.transform.position.x - camera.view.x - self.transform.size.x/2;
        var y = self.transform.position.y - camera.view.y - self.transform.size.y/2;
        layer.fillStyle(this.color).fillRect(x, y, self.transform.size.x, self.transform.size.y)
   }
}

module.exports = COMPONENT;
