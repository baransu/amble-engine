var Q = require('q');
var childProcess = require('child_process');
var asar = require('asar');
var fs = require('fs-extra');
var rcedit = require('rcedit');

var os = require('os');

var appFileExtension = ''
var iconFile = 'icon.png';

const BUILD_DIRECTORY = './amble-builds/app/';
const DISTRIBUTION_DIRECTRY = './amble-builds/dists/';

var mainfest;

function build() {

  // application's package.json file
  manifest = fs.readJsonSync(BUILD_DIRECTORY + '/package.json');

  fs.copySync('./node_modules/electron-prebuilt/dist', DISTRIBUTION_DIRECTRY);

  fs.removeSync(DISTRIBUTION_DIRECTRY + '/resources/default_app');

  switch (os.platform()) {
  default:
    console.log('No ' + os.platform() + 'build avalible')
    return;
  break;

  case 'linux':
    appFileExtension = '';
  break;

  case 'win32':
    appFileExtension = '.exe';
    iconFile = 'icon.ico';
  break;

  }

  return Q()
    .then(copySrc)
    .then(createAsar)
    .then(updateResources)
    .done();

}

function createAsar() {
  var deferred = Q.defer();
  asar.createPackage(BUILD_DIRECTORY, DISTRIBUTION_DIRECTRY + '/resources/app.asar', function () {
    deferred.resolve();
  });
  return deferred.promise;
}

function copySrc() {
  var deferred = Q.defer();
  fs.copy(BUILD_DIRECTORY + '/src', DISTRIBUTION_DIRECTRY + '/resources/src', function (err) {
    if (!err) {
      deferred.resolve();
    };
  });
  return deferred.promise;
}

function updateResources() {
  var deferred = Q.defer();

  fs.copySync('./src/app/res/' + iconFile, DISTRIBUTION_DIRECTRY + iconFile);

  var iconPath = DISTRIBUTION_DIRECTRY + iconFile;
  console.log(iconPath)

  // Replace Electron icon for your own.
  rcedit(DISTRIBUTION_DIRECTRY + '/electron' + appFileExtension, {
    'icon': iconPath,
    'version-string': {
      'ProductName': manifest.name,
      'FileDescription': manifest.description,
    }
  }, function (err) {
    if (!err) {
      deferred.resolve();
    }
  });

  fs.renameSync(DISTRIBUTION_DIRECTRY + '/electron' + appFileExtension, DISTRIBUTION_DIRECTRY + '/' + manifest.name + appFileExtension);

  return deferred.promise;
}


module.exports = { build: build };
