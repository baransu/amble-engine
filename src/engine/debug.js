var Debug = (function() {

  var Debug = function Debug() {
    // @ifdef EDITOR
    this.logs = [];
    // @endif
  };

  Debug.prototype = {

    log: function log(log) {

      // @ifdef EDITOR
      this.logs.push({
        type: 'log',
        message: log
      });

      EDITOR.refresh();
      // @endif

      // @ifdef PREVIEW
      ipcRenderer.send('game-preview-log-request', log)
      // @endif

      // @ifdef SRC
      console.log(log)
      // @endif

    },

    error: function error(error) {

      // @ifdef EDITOR
      this.logs.push({
        type: 'error',
        message: error
      });

      EDITOR.refresh();
      // @endif

      // @ifdef PREVIEW
      ipcRenderer.send('game-preview-error-request', error)
      // @endif

      // @ifdef SRC
      console.log(error)
      // @endif

    },

  };

  return Debug;

}());
