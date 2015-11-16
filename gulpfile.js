var browserify = require('browserify'),
    // watchify = require('watchify'),
    gulp = require('gulp'),
    source = require('vinyl-source-stream'),
    destFolder = './project/',
    destFile = 'bundle.js';

var projectFolder = '/project/'

gulp.task('browserify', function() {

    var files = [];
    // var normalizedPath = require("path").join(__dirname, projectFolder + "scripts");
    // require("fs").readdirSync(normalizedPath).forEach(function(file) {
    //     files.push('.' + projectFolder + 'scripts/' + file);
    // });
    files.push('./core/amble.js');
    files.push('./core/flow.js');
    files.push('.' + projectFolder + 'game.js');

    return browserify(files)
        .bundle()
        .pipe(source(destFile))
        .pipe(gulp.dest(destFolder));
});

gulp.task('copy-components-json', function() {
    gulp.src('./core/components.json')
    .pipe(gulp.dest('./project/data'));
});

gulp.task('default', ['browserify', 'copy-components-json']);
