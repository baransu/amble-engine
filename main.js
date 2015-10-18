var app = require('app');
var BrowserWindow = require('browser-window');

app.on('ready', function(){
    var mainWindow = new BrowserWindow({
        width: 1280,
        height: 720
    });
    mainWindow.loadUrl('file://' + __dirname + '/editor/index.html');
    mainWindow.toggleDevTools();
});
