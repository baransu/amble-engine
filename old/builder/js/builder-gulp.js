var gulp = require('gulp');
var concat = require('gulp-concat');
var rimraf = require('gulp-rimraf');
// var minifyCss = require('gulp-minify-css');
// var less = require('gulp-less');

var core = ['./core/build-src/**/*'];
var engineSrc = ['./editor/js/src/engine/*.js'];

gulp.imagesList = [];
gulp.scriptsList = [];
gulp.projectDirectory = '';
gulp.outputDir = '';

gulp.buildProperties = {};

var toDel = [
    gulp.outputDir + '/assets/**/*'
]

gulp.task('clear-output', function() {
    return gulp.src(toDel)
        .pipe(rimraf());
});

gulp.task('core-move', function() {
    return gulp.src(core)
        .pipe(gulp.dest(gulp.outputDir));
});

gulp.task('img-move', function() {
    return gulp.src(gulp.imagesList)
        .pipe(gulp.dest(gulp.outputDir + '/assets/img'));
});

gulp.task('build-engine', function() {
    return gulp.src(engineSrc)
        .pipe(concat('engine-scripts.js'))
        .pipe(gulp.dest(gulp.outputDir + '/assets/js'));
});

gulp.task('build-user', function() {
    return gulp.src(gulp.scriptsList)
        .pipe(concat('user-scripts.js'))
        .pipe(gulp.dest(gulp.outputDir + '/assets/js'));
});

gulp.task('prepare', ['clear-output']);
gulp.task('build-game', ['core-move', 'img-move', 'build-user', 'build-engine']);

module.exports = gulp;
