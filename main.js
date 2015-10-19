var app = require('app');
var BrowserWindow = require('browser-window');

app.on('ready', function(){
    var mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        'min-width': 800,
        'min-height': 600
    });
    mainWindow.loadUrl('file://' + __dirname + '/visual-editor/index.html');
    mainWindow.toggleDevTools();
});
