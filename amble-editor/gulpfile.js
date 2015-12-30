var gulp = require('gulp');
var minifyCss = require('gulp-minify-css');
var less = require('gulp-less');
var concat = require('gulp-concat');

gulp.task('less', function(){
    return gulp.src('pre-less/*.less')
        .pipe(less())
        .pipe(minifyCss({
            keepSpecialComments: 1
        }))
        .pipe(gulp.dest('css'))
});

gulp.task('watch', function(){
    gulp.watch('pre-less/*.less', ['less']);
    gulp.watch('pre-less/src/*.less', ['less']);
});

gulp.task('build-game', function(){

    return gulp.src('./js/src/*.js')
      .pipe(concat('scripts.js'))
      .pipe(gulp.dest('../game/assets/js'));
});

gulp.task('default', ['less', 'watch']);
