var gulp = require('gulp');
var concat = require('gulp-concat');
// var minifyCss = require('gulp-minify-css');
// var less = require('gulp-less');

var core = ['./core/build-src/**/*']
var engineSrc = ['./editor/js/src/engine/*.js']

gulp.imagesList = [];
gulp.scriptsList = [];
gulp.projectDirectory = '';
gulp.outputDir = '';

gulp.buildProperties = {};

gulp.task('core-move', function() {
    return gulp.src(core)
        .pipe(gulp.dest(gulp.outputDir));
});

gulp.task('img-move', function(){
    return gulp.src(gulp.imagesList)
        .pipe(gulp.dest(gulp.outputDir + '/assets/img'));
});

gulp.task('build-engine', function(){
    return gulp.src(engineSrc)
        .pipe(concat('engine-scripts.js'))
        .pipe(gulp.dest(gulp.outputDir + '/assets/js'));
});

gulp.task('build-user', function(){
    return gulp.src(gulp.scriptsList)
        .pipe(concat('user-scripts.js'))
        .pipe(gulp.dest(gulp.outputDir + '/assets/js'));
});

gulp.task('build-game', ['core-move', 'img-move', 'build-engine', 'build-user']);

module.exports = gulp;
