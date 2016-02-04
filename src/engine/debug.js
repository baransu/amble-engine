window.Debug = (function() {

  var Debug = {

    log: function log(log) {

      // @ifdef EDITOR
      document.querySelector('console-panel').update({
        type: 'log',
        message: log
      });
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
      document.querySelector('console-panel').update({
        type: 'error',
        message: error
      });
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
