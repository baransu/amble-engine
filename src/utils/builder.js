var gulp = require('gulp');
var concat = require('gulp-concat');
var vinylPaths = require('vinyl-paths');
var del = require('del');
var gulpSequence = require('gulp-sequence');
var fs = require('fs-extra');
var create = require('gulp-cordova-create');
var plugin = require('gulp-cordova-plugin');
var pref = require('gulp-cordova-preference');
var android = require('gulp-cordova-build-android');
var version = require('gulp-cordova-version');
var author = require('gulp-cordova-author');
var description = require('gulp-cordova-description');
var icon = require('gulp-cordova-icon');

// var minifyCss = require('gulp-minify-css');
// var less = require('gulp-less');

var core = ['./src/**/*'];

gulp.imagesList = [];
gulp.scriptsList = [];
gulp.projectDirectory = '';
gulp.outputDir = '';

gulp.projectName = '';
gulp.projectID = '';

gulp.projectVersion = '0.1.0';
gulp.projectDescription = '';
gulp.projectAuthor = '';

gulp.originDir = '';

gulp.task('build-move-web', function() {
  return gulp.src(core)
    .pipe(gulp.dest(gulp.outputDir));
});

gulp.task('build-move-android', function() {
  return gulp.src(core)
    .pipe(gulp.dest(gulp.outputDir + '/_temp'));
});

gulp.task('img-move', function() {
  return gulp.src(gulp.imagesList)
    .pipe(gulp.dest(gulp.outputDir + '/assets/img/'));
});

gulp.task('build-user', function() {
  return gulp.src(gulp.scriptsList)
    .pipe(concat('user-scripts.js'))
    .pipe(gulp.dest(gulp.outputDir + '/assets/js/'));
});

gulp.task('cordova-init', function () {

  return gulp.src(gulp.outputDir)
    .pipe(create({
      id: gulp.projectID,
      name: gulp.projectName
    }))
    .pipe(version(gulp.projectVersion))
    .pipe(description(gulp.projectDescription))
    .pipe(author(gulp.projectAuthor)) //add email and website
    // .pipe(icon(__dirname + '/icon.png'))
    .pipe(plugin('cordova-plugin-crosswalk-webview'))
    .pipe(pref({
        Fullscreen: true,
        Orientation: 'landscape',
        DisallowOverscroll: true
    }))
    .pipe(android())
    .pipe(gulp.dest(gulp.originDir + '/builds/'))
});

gulp.task('build-game-android', function(callback) {

  gulp.originDir = gulp.outputDir;
  gulp.outputDir += '/_temp';
  gulpSequence(['img-move', 'build-user'], 'cordova-init',
              //TODO: icon preferences author plugins stuff other etc
              callback);
});

gulp.task('build-game-web', function(callback) {
  gulp.originDir = gulp.outputDir;
  gulpSequence(['img-move', 'build-user'], callback);
});

// plugin add cordova-plugin-crosswalk-webview

module.exports = gulp;
