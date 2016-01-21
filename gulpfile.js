var gulp = require('gulp');
var preprocess = require('gulp-preprocess');
var concat = require('gulp-concat');
var less = require('gulp-less');
var rimraf = require('gulp-rimraf');
// var minifyCss = require('gulp-minify-css');

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
    .pipe(concat('amble.js'))
    .pipe(preprocess({ context: { NODE_ENV: 'production', EDITOR: true}}))
    .pipe(gulp.dest('./build/editor/'))
});

gulp.task('amble-src-build', function() {
  return gulp.src(engineJSFiles)
    .pipe(preprocess({ context: { NODE_ENV: 'production', SRC: true, GAME: true}}))
    .pipe(concat('amble.js'))
    .pipe(gulp.dest('./build/src/'))
});

gulp.task('amble-game-preview-build', function() {
  return gulp.src(engineJSFiles)
    .pipe(preprocess({ context: { NODE_ENV: 'production', PREVIEW: true, GAME: true}}))
    .pipe(concat('amble.js'))
    .pipe(gulp.dest('./build/game-preview/'))
});

// LAUNCHER

gulp.task('launcher-less', function() {
  return gulp.src('./src/launcher/less/*.less')
    .pipe(less())
    .pipe(gulp.dest('./build/launcher/css/'))
});

var launcherJSFiles = [
  './src/launcher/js/index.js'
];

gulp.task('launcher-js', function() {
  return gulp.src(launcherJSFiles)
    .pipe(gulp.dest('./build/launcher/js/'))
});

gulp.task('launcher-html', function() {
  return gulp.src('./src/launcher/*.html')
    .pipe(gulp.dest('./build/launcher/'))
});

// BUILDER
gulp.task('builder-less', function() {
  return gulp.src('./src/builder/less/*.less')
    .pipe(less())
    .pipe(gulp.dest('./build/builder/css/'))
});

var builderJSFiles = [
  './src/builder/js/index.js'
];

gulp.task('builder-js', function() {
  return gulp.src(builderJSFiles)
    .pipe(gulp.dest('./build/builder/js/'))
});

gulp.task('builder-html', function() {
  return gulp.src('./src/builder/*.html')
    .pipe(gulp.dest('./build/builder/'))
});

// GAME PREVIEW

gulp.task('preview-less', function() {
  return gulp.src('./src/game-preview/less/*.less')
    .pipe(less())
    .pipe(gulp.dest('./build/game-preview/css/'))
});

var previewJSFiles = [
  './src/game-preview/js/index.js',
  './src/game-preview/js/polyfill.js',
  './src/game-preview/js/cordova.js',
  './src/game-preview/js/cordova_plugins.js'
];

gulp.task('preview-js', function() {
  return gulp.src(previewJSFiles)
    .pipe(gulp.dest('./build/game-preview/js/'))
});

gulp.task('preview-html', function() {
  return gulp.src('./src/game-preview/*.html')
    .pipe(gulp.dest('./build/game-preview/'))
});

// SRC

gulp.task('src-less', function() {
  return gulp.src('./src/src/less/*.less')
    .pipe(less())
    .pipe(gulp.dest('./build/src/css/'))
});

var srcJSFiles = [
  './src/src/js/index.js',
  './src/src/js/polyfill.js',
  './src/src/js/cordova.js',
  './src/src/js/cordova_plugins.js'
];

gulp.task('src-js', function() {
  return gulp.src(srcJSFiles)
    .pipe(gulp.dest('./build/src/js/'))
});

gulp.task('src-move', function() {
  return gulp.src('./src/src/assets/**/')
    .pipe(gulp.dest('./build/src/assets'))
});

gulp.task('src-html', function() {
  return gulp.src('./src/src/*.html')
    .pipe(gulp.dest('./build/src/'))
});

// EDITOR

gulp.task('editor-less', function() {
  return gulp.src('./src/editor/less/*.less')
    .pipe(less())
    .pipe(gulp.dest('./build/editor/css/'))
});

var editorJSFiles = [
  './src/editor/js/index.js',
  './src/editor/js/camera.js'
];

gulp.task('editor-js', function() {
  return gulp.src(editorJSFiles)
    .pipe(gulp.dest('./build/editor/js/'))
});

gulp.task('editor-move', function() {
  return gulp.src('./src/editor/*.*')
    .pipe(gulp.dest('./build/editor/'))
});

gulp.task('editor-elements', function() {
  return gulp.src('./src/editor/elements/*.html')
    .pipe(gulp.dest('./build/editor/elements/'))
});

// UTILS

var utilsJSFiles = [
  './src/utils/builder.js'
];

gulp.task('build-utils', function() {
  return gulp.src(utilsJSFiles)
    .pipe(gulp.dest('./build/utils/'))
});

// OTHER

gulp.task('clean', function() {
  return gulp.src('./build/')
    .pipe(rimraf());
})

gulp.task('build-engine', [ 'amble-editor-build', 'amble-src-build', 'amble-game-preview-build' ]);
gulp.task('build-launcher', [ 'launcher-less', 'launcher-js', 'launcher-html' ]);
gulp.task('build-editor', [ 'editor-less', 'editor-js', 'editor-move', 'editor-elements' ]);
gulp.task('build-preview', [ 'preview-less', 'preview-js', 'preview-html' ]);
gulp.task('build-builder', [ 'builder-less', 'builder-js', 'builder-html' ]);
gulp.task('build-src', [ 'src-less', 'src-js', 'src-html', 'src-move' ]);


gulp.task('default', [ 'build-engine', 'build-launcher', 'build-editor', 'build-preview', 'build-builder', 'build-utils', 'build-src' ]);

//build editor
//build game core
//build game project-view
//build launcher
//build builder

//add watch?


//build folder structure
/*
  editor
    index.html
    amble.js
    css/style.css //min?
    scripts/camera.js
    elements/ build elements from .less/.html and .js to .html

  launcher
    index.html
    loader.html
    index.js
    style.css

  builder
    index.html
    index.js
    style.css

  game preview
    same as final game build?

  src

    gulp builder file? or as dependancy

    js/
      amble.js
      index.js bla bla bla
    css/style.css
    assets

*/
