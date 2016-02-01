window.Input = (function(){

  var Input = {

    isKeyPressed: function isKeyPressed(keycode) {
      return this._keyValues[keycode];
    },

    isMousePressed: function isKeyPressed(keycode) {
      return this._mouseValues[keycode];
    },

    _mouseValues: [],

    _keyValues: [],

    mousePosition: new Vec2(),

    offset: new Vec2(),

    wheelDelta: new Vec3(),

    isShiftPressed: false,

    isCtrlPressed: false,
  }

  Input._eventFunctions = {

    keydown: function keydown(e) {

      Input.isShiftPressed = e.shiftKey;
      Input.isCtrlPressed = e.ctrlKey;
      Input._keyValues[e.which] = true;

      AMBLE.scene.onkeydown(e);
    },

    keyup: function keyup(e) {
      Input._keyValues[e.which] = false;

      AMBLE.scene.onkeyup(e);
    },

    mousedown: function mousedown(e) {

      Input._mouseValues[e.which] = true;

      AMBLE.scene.onmousedown(e);
    },

    mouseup: function mouseup(e) {
      Input._mouseValues[e.which] = false;

      AMBLE.scene.onmouseup(e);
    },

    mousemove: function mousemove(e) {
      var offsetLeft = AMBLE.mainCamera.camera.context.offsetLeft;
      var offsetTop = AMBLE.mainCamera.camera.context.offsetTop;

      Input.offset.x = offsetLeft;
      Input.offset.y = offsetTop;

      Input.mousePosition.x = e.clientX - offsetLeft;
      Input.mousePosition.y = e.clientY - offsetTop;

      AMBLE.scene.onmousemove(e);
    },

    wheel: function wheel(e) {
      Input.wheelDelta.x = e.deltaX;
      Input.wheelDelta.y = e.deltaY;
      Input.wheelDelta.z = e.deltaZ;

      AMBLE.scene.onmousewheel(e);
    },

    contextmenu: function contextmenu(e) {
      e.preventDefault();
      AMBLE.scene.oncontextmenu(e);
    },

    touchstart: function touchstart(e) {
      e.preventDefault();
      AMBLE.scene.ontouchstart(e);
    },

    touchend: function touchend(e) {
      e.preventDefault();
      AMBLE.scene.ontouchend(e);
    },

    touchmove: function touchmove(e) {
      e.preventDefault();
      AMBLE.scene.ontouchmove(e);
    }
  }

  Input._setListeners = function _setListeners() {

    if(AMBLE.mainCamera) {
      var element = AMBLE.mainCamera.camera.context;
      document.addEventListener('keydown', Input._eventFunctions.keydown, false);
      document.addEventListener('keyup', Input._eventFunctions.keyup, false);
      element.addEventListener('mousedown', Input._eventFunctions.mousedown, false);
      element.addEventListener('mouseup', Input._eventFunctions.mouseup, false);
      document.addEventListener('mousemove', Input._eventFunctions.mousemove, false);
      element.addEventListener("wheel", Input._eventFunctions.wheel, false);
      element.addEventListener("contextmenu", Input._eventFunctions.contextmenu, false);

      //touch start
      element.addEventListener("touchstart", Input._eventFunctions.touchstart, false);
      //touch end
      element.addEventListener("touchend", Input._eventFunctions.touchend, false);
      //touch move
      element.addEventListener("touchmove", Input._eventFunctions.touchmove, false);

    }
  }

  Input._removeListeners = function _removeListeners() {

    if(AMBLE.mainCamera) {
      var element = AMBLE.mainCamera.camera.context;
      if (document.removeEventListener) {

        document.removeEventListener('keydown', Input._eventFunctions.keydown, false);
        document.removeEventListener('keyup', Input._eventFunctions.keyup, false);
        element.removeEventListener('mousedown', Input._eventFunctions.mousedown, false);
        element.removeEventListener('mouseup', Input._eventFunctions.mouseup, false);
        document.removeEventListener('mousemove', Input._eventFunctions.mousemove, false);
        element.removeEventListener("wheel", Input._eventFunctions.wheel, false);
        element.removeEventListener("contextmenu", Input._eventFunctions.contextmenu, false);

        //touch start
        element.removeEventListener("touchstart", Input._eventFunctions.touchstart, false);
        //touch end
        element.removeEventListener("touchend", Input._eventFunctions.touchend, false);
        //touch move
        element.removeEventListener("touchmove", Input._eventFunctions.touchmove, false);


      } else if (document.detachEvent) {

        document.detachEvent('keydown', Input._eventFunctions.keydown, false);
        document.detachEvent('keyup', Input._eventFunctions.keyup, false);
        element.detachEvent('mousedown', Input._eventFunctions.mousedown, false);
        element.detachEvent('mouseup', Input._eventFunctions.mouseup, false);
        document.detachEvent('mousemove', Input._eventFunctions.mousemove, false);
        element.detachEvent("wheel", Input._eventFunctions.wheel, false);
        element.detachEvent("contextmenu", Input._eventFunctions.contextmenu, false);

        //touch start
        element.detachEvent("touchstart", Input._eventFunctions.touchstart, false);
        //touch end
        element.detachEvent("touchend", Input._eventFunctions.touchend, false);
        //touch move
        element.detachEvent("touchmove", Input._eventFunctions.touchmove, false);

      }
    }
  }

  return Input;

}());
