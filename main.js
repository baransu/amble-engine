var app = require('app');
var BrowserWindow = require('browser-window');
var ipc = require('ipc');
var shell = require('shell');
var dialog = require('dialog');
var globalShortcut = require('global-shortcut');
var fs = require('fs');

var shortcuts = {};
var scriptFilePath = 'untitled';
var mainWindow = null;

app.on('ready', function(){
    mainWindow = new BrowserWindow({
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

var menuFunctions = {

    newFile: function(){
        scriptFilePath = 'untitled';
        mainWindow.setTitle(scriptFilePath);
        mainWindow.webContents.send('new-file-respond');

    },

    open: function(){
        var path = dialog.showOpenDialog(mainWindow, { properties: [ 'openFile'], filters: [{ name: 'Amble Script', extensions: ['ascript'] }]});
        if(typeof path != 'undefined') {
            scriptFilePath = path[0];
            mainWindow.setTitle(scriptFilePath);
            var data = fs.readFileSync(scriptFilePath, 'utf8');
            mainWindow.webContents.send('open-respond', data);
        }
    },

    saveAs: function(){
        scriptFilePath = dialog.showSaveDialog(mainWindow, {
            properties: [ 'openFile', 'createDirectory'],
            defaultPath: 'untitled.ascript',
            filters: [
                {
                    name: 'Amble Script',
                    extensions: ['ascript']
                }
            ]
        });
        if(typeof scriptFilePath != 'undefined') {
            mainWindow.webContents.send('save-request');
        }
    },

    save: function(){
        if(scriptFilePath == 'untitled') {
            menuFunctions.saveAs();
        } else {
            mainWindow.webContents.send('save-request');
        }
    }
}

//respond to data save
ipc.on('save-respond', function(event, data){
    mainWindow.setTitle(scriptFilePath);
    fs.writeFileSync(scriptFilePath, data, 'utf8');
});

//respond to menu options
ipc.on('open-request', function(){
    menuFunctions.open();
});

ipc.on('new-file-request',function(){
    menuFunctions.newFile();
});

ipc.on('save', function(){
    menuFunctions.save();
});

ipc.on('save-as', function(){
    menuFunctions.saveAs();
});

//register shortcuts
app.on('browser-window-focus', function() {
    shortcuts.open = globalShortcut.register('ctrl+o', function() {
        menuFunctions.open();
    });

    shortcuts.newFile = globalShortcut.register('ctrl+n', function() {
        menuFunctions.newFile();
    });

    shortcuts.save = globalShortcut.register('ctrl+s', function() {
        menuFunctions.save();
    });

    shortcuts.saveAs = globalShortcut.register('ctrl+shift+s', function() {
        menuFunctions.saveAs();
    });
});

app.on('browser-window-blur', function(){
    globalShortcut.unregisterAll();
});
