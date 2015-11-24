var gulp = require('gulp');
var minifyCss = require('gulp-minify-css');
var less = require('gulp-less');

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
});

gulp.task('default', ['less', 'watch']);
