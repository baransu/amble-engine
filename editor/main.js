var app = require('app');
var BrowserWindow = require('browser-window');
var ipc = require('ipc');
var shell = require('shell');
var dialog = require('dialog');
var globalShortcut = require('global-shortcut');
var fs = require('fs');

var shortcuts = {};
var mainWindow = null;

app.on('ready', function(){
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        'min-width': 800,
        'min-height': 600
    });
    mainWindow.loadUrl('file://' + __dirname + '/index.html');
    mainWindow.toggleDevTools();

    mainWindow.on('closed', function() {
        mainWindow = null;
    });
});
