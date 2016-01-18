var gulp = require('gulp');
var preprocess = require('gulp-preprocess');
var concat = require('gulp-concat');
var less = require('gulp-less');
var rimraf = require('gulp-rimraf');
// var minifyCss = require('gulp-minify-css');

//list all engine files and build to amble.js for editor/game preview/core

// ENGINE

var engineFiles = [
  './src/engine/vec2.js',
  './src/engine/vec3.js',
  './src/engine/mathf.js',
  './src/engine/utils.js',
  './src/engine/time.js',

  './src/engine/actor.js',
  './src/engine/animationRenderer.js',
  './src/engine/debug.js',
  './src/engine/engineRenderer.js',
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
  return gulp.src(engineFiles)
    .pipe(concat('amble.js'))
    .pipe(preprocess({ context: { NODE_ENV: 'production', EDITOR: true}}))
    .pipe(gulp.dest('./build/editor/'))
});

gulp.task('amble-src-build', function() {
  return gulp.src(engineFiles)
    .pipe(preprocess({ context: { NODE_ENV: 'production', SRC: true }}))
    .pipe(concat('amble.js'))
    .pipe(gulp.dest('./build/src/'))
});

gulp.task('amble-game-preview-build', function() {
  return gulp.src(engineFiles)
    .pipe(preprocess({ context: { NODE_ENV: 'production', PREVIEW: true }}))
    .pipe(concat('amble.js'))
    .pipe(gulp.dest('./build/game-preview/'))
});

// LAUNCHER

gulp.task('launcher-less', function() {
  return gulp.src('./src/launcher/less/*.less')
    .pipe(less())
    .pipe(gulp.dest('./build/launcher/css/'))
});

var launcherJsFiles = [
  './src/launcher/js/index.js'
];

gulp.task('launcher-js', function() {
  return gulp.src(launcherJsFiles)
    .pipe(gulp.dest('./build/launcher/js/'))
});

gulp.task('launcher-html', function() {
  return gulp.src('./src/launcher/*.html')
    .pipe(gulp.dest('./build/launcher/'))
});

// BUILDER

// GAME PREVIEW

// SRC

// EDITOR

gulp.task('editor-less', function() {
  return gulp.src('./src/editor/less/*.less')
    .pipe(less())
    .pipe(gulp.dest('./build/editor/css/'))
});

var editorJsFiles = [
  './src/editor/js/index.js',
  './src/editor/js/camera.js'
];

gulp.task('editor-js', function() {
  return gulp.src(editorJsFiles)
    .pipe(gulp.dest('./build/editor/js/'))
});

gulp.task('editor-html', function() {
  return gulp.src('./src/editor/*.html')
    .pipe(gulp.dest('./build/editor/'))
});

gulp.task('editor-elements', function() {
  return gulp.src('./src/editor/elements/*.html')
    .pipe(gulp.dest('./build/editor/elements/'))
});

// OTHER

gulp.task('clean', function() {
  return gulp.src('./build/')
    .pipe(rimraf());
})

gulp.task('build-engine', [ 'amble-editor-build', 'amble-src-build', 'amble-game-preview-build' ]);
gulp.task('build-launcher', [ 'launcher-less', 'launcher-js', 'launcher-html' ]);
gulp.task('build-editor', [ 'editor-less', 'editor-js', 'editor-html', 'editor-elements' ]);

gulp.task('default', [ 'build-engine', 'build-launcher', 'build-editor' ])

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
