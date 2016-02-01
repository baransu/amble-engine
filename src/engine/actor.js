window.Actor = (function() {

  var Actor = function Actor(args) {
    this.components = [];
  };

  Actor.prototype = {

    getComponent: function getComponent(componentName) {
      var component = this.components.find(function(c) { return c.id == componentName });
      return component.body;
    }

  };

  return Actor;

}());
