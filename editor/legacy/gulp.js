var gulp = require('gulp');
var concat = require('gulp-concat');

gulp.imagesList = [];
gulp.scriptsList = [];
gulp.projectDirectory = '';
gulp.outputDir = '';


gulp.buildProperties = {};

// var minifyCss = require('gulp-minify-css');
// var less = require('gulp-less');

gulp.task('core-move', function() {
    return gulp.src(['build-src/**/*'])
        .pipe(gulp.dest(gulp.outputDir));
});

gulp.task('img-move', function(){
    return gulp.src(gulp.imagesList)
        .pipe(gulp.dest(gulp.outputDir + '/assets/img'));
});

gulp.task('build-engine', function(){
    return gulp.src('./js/src/engine/*.js')
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
