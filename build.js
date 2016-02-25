var Q = require('q');
var childProcess = require('child_process');
var asar = require('asar');
var fs = require('fs-extra');
var rcedit = require('rcedit');

var os = require('os');

var appFileExtension = ''
var iconFile = 'icon.png';

const BUILD_DIRECTORY = './amble-builds/app/';
const DISTRIBUTIONS_DIRECOTRY = './amble-builds/dists/';

var mainfest;

function build() {

  // application's package.json file
  manifest = fs.readJsonSync(BUILD_DIRECTORY + '/package.json');

  fs.copySync('./node_modules/electron-prebuilt/dist', DISTRIBUTIONS_DIRECOTRY);

  fs.removeSync(DISTRIBUTIONS_DIRECOTRY + '/resources/default_app');

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

  fs.copySync('./src/app/res/' + iconFile, DISTRIBUTIONS_DIRECOTRY + iconFile);

  var iconPath = DISTRIBUTIONS_DIRECOTRY + iconFile;
  console.log(iconPath)

  // Replace Electron icon for your own.
  rcedit(DISTRIBUTIONS_DIRECOTRY + '/electron' + appFileExtension, {
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



  fs.renameSync(DISTRIBUTIONS_DIRECOTRY + '/electron' + appFileExtension, DISTRIBUTIONS_DIRECOTRY + '/' + manifest.name + appFileExtension);

  return deferred.promise;
}


module.exports = { build: build };
