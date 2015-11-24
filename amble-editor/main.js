var app = require('app');
const BrowserWindow = require('electron').BrowserWindow;
const ipcMain = require('electron').ipcMain;
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
    mainWindow.loadURL('file://' + __dirname + '/index.html');
    mainWindow.toggleDevTools();

    mainWindow.on('closed', function() {
        mainWindow = null;
    });
});
