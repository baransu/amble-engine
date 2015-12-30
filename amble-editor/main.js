const electron = require('electron');
const app = electron.app;
const BrowserWindow = require('electron').BrowserWindow;
const ipcMain = require('electron').ipcMain;
const globalShortcut = require('global-shortcut');

var dialog = require('dialog');
var fs = require('fs');

var gulp = require('gulp');
// var minifyCss = require('gulp-minify-css');
// var less = require('gulp-less');
var concat = require('gulp-concat');

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

var menuFunctions = {

    build: function(){
        mainWindow.webContents.send('build-request');
    }

}

gulp.task('build-engine', function(){
    return gulp.src('./js/src/engine/*.js')
        .pipe(concat('engine-scripts.js'))
        .pipe(gulp.dest('../game/assets/js'));
});

gulp.task('build-user', function(){
    return gulp.src('./js/src/user/*.js')
        .pipe(concat('user-scripts.js'))
        .pipe(gulp.dest('../game/assets/js'));
});

gulp.task('img-move', function(){
    return gulp.src([
        './data/*.jpg',
        './data/*.png'
        ])
        .pipe(gulp.dest('../game/assets/img'));
});

ipcMain.on('build-respond', function(event, data){

    console.log(data);

    fs.writeFileSync('../game/assets/json/scene.json', data, 'utf8');

    var imgList = fs.readdirSync("../game/assets/img")
    // console.log(JSON.stringify(imgList));

    fs.writeFileSync('../game/assets/js/assets-list.js', "var imagesList = " + JSON.stringify(imgList), 'utf8');

    gulp.start('img-move');
    gulp.start('build-engine');
    gulp.start('build-user');

    console.log('builded')

});

app.on('browser-window-focus', function() {
    shortcuts.open = globalShortcut.register('ctrl+b', function() {
        menuFunctions.build();
    });
});

app.on('browser-window-blur', function(){
    globalShortcut.unregisterAll();
});
