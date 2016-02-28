window.Mathf = (function() {

    var Mathf = {

      TO_RADIANS: Math.PI/180,

      getRandomIntInRange: function getRandomIntInRange(min, max) {
        var min = parseInt(min);
        var max = parseInt(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
      },

      getRandomInRange: function getRandomInRange(min, max) {
        return Math.random() * (max - min) + min;
      }

    }

    return Mathf;

}());
