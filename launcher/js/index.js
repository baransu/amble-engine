const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;
// const remote = electron.remote;
// const Menu = remote.Menu;

var LAUNCHER = null;

var launcherApp = angular.module('launcherApp', []);
launcherApp.controller('launcherController', ['$scope', function($scope) {

    var launcher = LAUNCHER = this;

    launcher.projectName = '';
    launcher.projectDirectory = 'undefined';
    launcher.error = '';

    launcher.projects = []

    ipcRenderer.send('launcher-projects-request');

    launcher.refresh = function() {
        $scope.$apply();
    };

    launcher.directorySelect = function() {
        ipcRenderer.send('launcher-dir-request');
    };

    launcher.create = function() {

        if(launcher.projectName && launcher.projectDirectory != 'undefined') {
            ipcRenderer.send('launcher-create-request', {
                name: launcher.projectName,
                dir: launcher.projectDirectory
            });
        } else if(!launcher.projectName){
            launcher.error = 'You must enter project name!';
        } else if(launcher.projectDirectory == 'undefined') {
            launcher.error = 'You must select project directory!';
        }
    };

}]);
ipcRenderer.on('launcher-projects-respond', function(event, data) {
    console.log(data)
    LAUNCHER.projects = data;
    LAUNCHER.refresh();
});

ipcRenderer.on('launcher-dir-respond', function(event, data) {
    LAUNCHER.projectDirectory = data;
    LAUNCHER.refresh();
});

ipcRenderer.on('launcher-create-respond', function(event, data) {
    //update folders list and send open request with dir
    ipcRenderer.send('launcher-open-request', {
        name: LAUNCHER.projectName,
        dir: LAUNCHER.projectDirectory
    });
});
