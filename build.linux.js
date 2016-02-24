var Q = require('q');
var childProcess = require('child_process');
var asar = require('asar');
var fs = require('fs-extra');
var rcedit = require('rcedit');

const BUILD_DIRECTORY = './amble-builds/app/';
const DISTRIBUTIONS_DIRECOTRY = './amble-builds/dists/';

var mainfest;

function init() {

  return Q();
}

function build() {

  // application's package.json file
  manifest = fs.readJsonSync(BUILD_DIRECTORY + '/package.json');

  fs.copySync('./node_modules/electron-prebuilt/dist', DISTRIBUTIONS_DIRECOTRY);

  fs.removeSync(DISTRIBUTIONS_DIRECOTRY + '/resources/default_app');

  return init()
    .then(createAsar)
    .then(updateResources)
    .done();

}

function createAsar() {
  var deferred = Q.defer();
  asar.createPackage(BUILD_DIRECTORY, DISTRIBUTIONS_DIRECOTRY + '/resources/app.asar', function () {
    deferred.resolve();
  });
  return deferred.promise;
}

function updateResources() {
  var deferred = Q.defer();

  fs.copySync('./src/app/res/icon.png', DISTRIBUTIONS_DIRECOTRY + '/icon.png');

  // Replace Electron icon for your own.
  rcedit(DISTRIBUTIONS_DIRECOTRY + '/electron', {
    'icon': './src/app/res/icon.png',
    'version-string': {
      'ProductName': manifest.name,
      'FileDescription': manifest.description,
    }
  }, function (err) {
    if (!err) {
      deferred.resolve();
    }
  });

  fs.renameSync(DISTRIBUTIONS_DIRECOTRY + '/electron', DISTRIBUTIONS_DIRECOTRY + '/' + manifest.name);

  return deferred.promise;
}


module.exports = { build: build };
