var app = require('app');
var BrowserWindow = require('browser-window');
var ipc = require('ipc');
var shell = require('shell');
var dialog = require('dialog');
var globalShortcut = require('global-shortcut');

app.on('ready', function(){
    var mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        'min-width': 800,
        'min-height': 600
    });
    mainWindow.loadUrl('file://' + __dirname + '/visual-editor/index.html');
    mainWindow.toggleDevTools();

    mainWindow.on('closed', function() {
        mainWindow = null;
    });
});

app.on('browser-window-blur', function() {
    globalShortcut.unregisterAll();
})
