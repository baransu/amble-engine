const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;
// const remote = electron.remote;
// const Menu = remote.Menu;

global.jQuery = $ = require('jquery');

var LAUNCHER = null;

var launcherApp = angular.module('launcherApp', []);
launcherApp.controller('launcherController', ['$scope', function($scope) {

    var launcher = LAUNCHER = this;

    launcher.projectName = 'New Amble Project';
    launcher.projectDirectory = '';
    launcher.errorInfo = '';

    launcher.projects = []

    ipcRenderer.send('launcher-projects-request');

    launcher.refresh = function() {
        $scope.$apply();
    };

    launcher.directorySelect = function() {
        ipcRenderer.send('launcher-dir-request');
    };

    launcher.openProject = function($event, data) {
        console.log(data)
        ipcRenderer.send('launcher-open-request', {
            name: data.name,
            dir: data.dir
        });
    };

    launcher.create = function() {

        if(launcher.projectName != 'New Amble Project' && launcher.projectName != '' && launcher.projectDirectory != '' && launcher.projectDirectory != 'undefined') {
            ipcRenderer.send('launcher-create-request', {
                name: launcher.projectName,
                dir: launcher.projectDirectory
            });
        } else if(launcher.projectName == 'New Amble Project' || launcher.projectName == ''){
            launcher.errorInfo = 'You must enter project name!';
        } else if(launcher.projectDirectory == '' || launcher.projectDirectory == 'undefined') {
            launcher.errorInfo = 'You must select project directory!';
        }
    };

}]);
ipcRenderer.on('launcher-projects-respond', function(event, data) {
    LAUNCHER.projects = data;
    LAUNCHER.refresh();
});

ipcRenderer.on('launcher-dir-respond', function(event, data) {
    LAUNCHER.projectDirectory = data;
    LAUNCHER.refresh();
});

ipcRenderer.on('launcher-create-respond', function(event, data) {
    //update folders list and send open request with dir
    switch(data) {
        case 'created':
            ipcRenderer.send('launcher-open-request', {
                name: LAUNCHER.projectName,
                dir: LAUNCHER.projectDirectory + '/' + LAUNCHER.projectName
            });
        break;

        case 'already exist':
            LAUNCHER.error = 'Project already exist in given directory.';
            LAUNCHER.refresh();
        break;
    }

});
