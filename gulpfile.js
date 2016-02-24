var gulp = require('gulp');
var preprocess = require('gulp-preprocess');
var concat = require('gulp-concat');
var less = require('gulp-less');
var rimraf = require('gulp-rimraf');
var jsValidate = require('gulp-jsvalidate');
var browserify = require('browserify');
var gulpSequence = require('gulp-sequence');
var source = require('vinyl-source-stream');
var install = require('gulp-install');
var os = require('os');

var releaseLinux = require('./build.linux');

const BUILD_DIRECTORY = './amble-builds/app';
const DISTRIBUTIONS_DIRECOTRY = './amble-builds/dists';

//list all engine files and build to amble.js for editor/game preview/core

// ENGINE

var engineJSFiles = [
  './src/engine/vec2.js',
  './src/engine/vec3.js',
  './src/engine/mathf.js',
  './src/engine/utils.js',
  './src/engine/time.js',

  './src/engine/actor.js',
  './src/engine/animationRenderer.js',
  './src/engine/debug.js',

  //editor only
  './src/engine/engineRenderer.js',
  './src/engine/cameraRenderer.js',
  './src/engine/sceneArrows.js',

  './src/engine/input.js',
  './src/engine/layer.js',
  './src/engine/loader.js',
  './src/engine/mainCamera.js',
  './src/engine/rectRenderer.js',
  './src/engine/spriteRenderer.js',
  './src/engine/transform.js',

  './src/engine/scene.js',

  './src/engine/application.js',

  './src/engine/class.js'
];

gulp.task('amble-editor-build', function() {
  return gulp.src(engineJSFiles)
    .pipe(preprocess({ context: { NODE_ENV: 'production', EDITOR: true}}))
    .pipe(concat('amble.js'))
    .pipe(jsValidate())
    .pipe(gulp.dest(BUILD_DIRECTORY + '/editor/'))
});

gulp.task('amble-src-build', function() {
  return gulp.src(engineJSFiles)
    .pipe(preprocess({ context: { NODE_ENV: 'production', SRC: true, GAME: true}}))
    .pipe(concat('amble.js'))
    .pipe(jsValidate())
    .pipe(gulp.dest(BUILD_DIRECTORY + '/src/'))
});

gulp.task('amble-src-browserify', function() {
  return browserify(BUILD_DIRECTORY + '/src/amble.js')
    .bundle()
    .pipe(source('amble.js'))
    .pipe(gulp.dest(BUILD_DIRECTORY + '/src/'))
});

gulp.task('amble-game-preview-build', function() {
  return gulp.src(engineJSFiles)
    .pipe(preprocess({ context: { NODE_ENV: 'production', PREVIEW: true, GAME: true}}))
    .pipe(concat('amble.js'))
    .pipe(jsValidate())
    .pipe(gulp.dest(BUILD_DIRECTORY + '/game-preview/'))
});

// LAUNCHER

gulp.task('launcher-less', function() {
  return gulp.src('./src/launcher/less/*.less')
    .pipe(less())
    .pipe(gulp.dest(BUILD_DIRECTORY + '/launcher/css/'))
});

var launcherJSFiles = [
  './src/launcher/js/index.js'
];

gulp.task('launcher-js', function() {
  return gulp.src(launcherJSFiles)
    .pipe(jsValidate())
    .pipe(gulp.dest(BUILD_DIRECTORY + '/launcher/js/'))
});

gulp.task('launcher-html', function() {
  return gulp.src('./src/launcher/*.html')
    .pipe(gulp.dest(BUILD_DIRECTORY + '/launcher/'))
});

// BUILDER
gulp.task('builder-less', function() {
  return gulp.src('./src/builder/less/*.less')
    .pipe(less())
    .pipe(gulp.dest(BUILD_DIRECTORY + '/builder/css/'))
});

var builderJSFiles = [
  './src/builder/js/index.js'
];

gulp.task('builder-js', function() {
  return gulp.src(builderJSFiles)
    .pipe(jsValidate())
    .pipe(gulp.dest(BUILD_DIRECTORY + '/builder/js/'))
});

gulp.task('builder-html', function() {
  return gulp.src('./src/builder/*.html')
    .pipe(gulp.dest(BUILD_DIRECTORY + '/builder/'))
});

// GAME PREVIEW

gulp.task('preview-less', function() {
  return gulp.src('./src/game-preview/less/*.less')
    .pipe(less())
    .pipe(gulp.dest(BUILD_DIRECTORY + '/game-preview/css/'))
});

var previewJSFiles = [
  './src/game-preview/js/index.js',
  './src/game-preview/js/polyfill.js',
  './src/game-preview/js/cordova.js',
  './src/game-preview/js/cordova_plugins.js'
];

gulp.task('preview-js', function() {
  return gulp.src(previewJSFiles)
    .pipe(jsValidate())
    .pipe(gulp.dest(BUILD_DIRECTORY + '/game-preview/js/'))
});

gulp.task('preview-html', function() {
  return gulp.src('./src/game-preview/*.html')
    .pipe(gulp.dest(BUILD_DIRECTORY + '/game-preview/'))
});

// SRC

gulp.task('src-less', function() {
  return gulp.src('./src/src/less/*.less')
    .pipe(less())
    .pipe(gulp.dest(BUILD_DIRECTORY + '/src/css/'))
});

var srcJSFiles = [
  './src/src/js/index.js',
  './src/src/js/polyfill.js',
  './src/src/js/cordova.js',
  './src/src/js/cordova_plugins.js'
];

gulp.task('src-js', function() {
  return gulp.src(srcJSFiles)
    .pipe(jsValidate())
    .pipe(gulp.dest(BUILD_DIRECTORY + '/src/js/'))
});

gulp.task('src-move', function() {
  return gulp.src('./src/src/assets/**/*')
    .pipe(gulp.dest(BUILD_DIRECTORY + '/src/assets'))
});

gulp.task('src-html', function() {
  return gulp.src('./src/src/*.html')
    .pipe(gulp.dest(BUILD_DIRECTORY + '/src/'))
});

// EDITOR

gulp.task('editor-less', function() {
  return gulp.src('./src/editor/less/*.less')
    .pipe(less())
    .pipe(gulp.dest(BUILD_DIRECTORY + '/editor/css/'))
});

var editorJSFiles = [
  './src/editor/js/index.js',
  './src/editor/js/camera.js'
];

gulp.task('editor-js', function() {
  return gulp.src(editorJSFiles)
    .pipe(jsValidate())
    .pipe(gulp.dest(BUILD_DIRECTORY + '/editor/js/'))
});

gulp.task('editor-move', function() {
  return gulp.src('./src/editor/*.*')
    .pipe(gulp.dest(BUILD_DIRECTORY + '/editor/'))
});

gulp.task('editor-elements', function() {
  return gulp.src('./src/editor/elements/*.html')
    .pipe(gulp.dest(BUILD_DIRECTORY + '/editor/elements/'))
});

gulp.task('editor-core', function() {
  return gulp.src('./src/editor/editor-core/*.html')
    .pipe(gulp.dest(BUILD_DIRECTORY + '/editor/editor-core/'))
});

gulp.task('editor-panels', function() {
  return gulp.src('./src/editor/panels/*.html')
    .pipe(gulp.dest(BUILD_DIRECTORY + '/editor/panels/'))
});

gulp.task('editor-ui', function() {
  return gulp.src('./src/editor/ui/*.html')
    .pipe(gulp.dest(BUILD_DIRECTORY + '/editor/ui/'))
});

// UTILS

var utilsJSFiles = [
  './src/utils/builder.js'
];

gulp.task('utils-js', function() {
  return gulp.src(utilsJSFiles)
    .pipe(jsValidate())
    .pipe(gulp.dest(BUILD_DIRECTORY + '/utils/'))
});

var utilsFilesToMove = [
  './src/utils/android-cordova-config.json'
]

gulp.task('utils-move', function() {
  return gulp.src(utilsFilesToMove)
    .pipe(gulp.dest(BUILD_DIRECTORY + '/utils/'))
});

// OTHER

gulp.task('clear', function() {
  return gulp.src('./amble-builds')
    .pipe(rimraf());
});

// APP

gulp.task('app-move', function() {
  return gulp.src(['./src/app/*.*'])
    .pipe(gulp.dest(BUILD_DIRECTORY));
});

gulp.task('app-res-move', function() {
  return gulp.src(['./src/app/res/*.*'])
    .pipe(gulp.dest(BUILD_DIRECTORY + '/res'));
});

gulp.task('build-engine', function(cb) {
  gulpSequence([ 'amble-editor-build', 'amble-src-build', 'amble-game-preview-build' ], 'amble-src-browserify', cb);
});

gulp.task('build-launcher', [ 'launcher-less', 'launcher-js', 'launcher-html' ]);
gulp.task('build-editor', [ 'editor-less', 'editor-js', 'editor-move', 'editor-elements', 'editor-core', 'editor-panels', 'editor-ui' ]);
gulp.task('build-preview', [ 'preview-less', 'preview-js', 'preview-html' ]);
gulp.task('build-builder', [ 'builder-less', 'builder-js', 'builder-html' ]);
gulp.task('build-src', [ 'src-less', 'src-js', 'src-html', 'src-move' ]);
gulp.task('build-utils', [ 'utils-js', 'utils-move' ]);
gulp.task('build-app', [ 'app-move', 'app-res-move' ]);


gulp.task('build-code', [ 'build-engine', 'build-launcher', 'build-editor', 'build-preview', 'build-builder', 'build-utils', 'build-src', 'build-app' ]);

gulp.task('install', function() {
  return gulp.src([BUILD_DIRECTORY + '/bower.json', BUILD_DIRECTORY + '/package.json'])
    .pipe(install());
});

gulp.task('build', function(cb) {
  gulpSequence('clear', 'build-code', 'install', cb);
});

gulp.task('build-dev', function(cb) {
  gulpSequence('build-code', 'install', cb);
});

gulp.task('build-electron', function () {
  switch (os.platform()) {
  case 'darwin':
    console.log('No darwin build avalible')

  break;
  case 'linux':

    return releaseLinux.build();

  break;
  case 'win32':
    console.log('No windows build avalible')
  }
});

gulp.task('build-standalone', function(cb) {
  gulpSequence('build-clear', 'build-electron', cb);
});
