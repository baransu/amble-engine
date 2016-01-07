const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;
// const remote = electron.remote;
// const Menu = remote.Menu;

var BUILDER = null;

var builderApp = angular.module('builderApp', []);
builderApp.controller('builderController', ['$scope', function($scope) {

    var builder = BUILDER = this;

    builder.gameTitle = '';
    builder.buildDirectory = 'undefined';
    builder.errorInfo = ''

    builder.refresh = function() {
        $scope.$apply();
    };

    builder.directorySelect = function() {
        ipcRenderer.send('builder-dir-request');
    };

    builder.build = function() {

        if(builder.gameTitle && builder.buildDirectory != 'undefined') {

            ipcRenderer.send('builder-build-request', {
                name: builder.gameTitle,
                //others preferences

            });

        } else if(!builder.gameTitle){
            builder.errorInfo = 'Dude, your game must have a good name!';
        } else if(builder.builDirectory == 'undefined') {
            builder.errorInfo = 'You must select build destination!';
        }
    };

}]);

ipcRenderer.on('builder-dir-respond', function(event, data) {

    BUILDER.buildDirectory = data;
    BUILDER.refresh();

});

ipcRenderer.on('builder-build-respond', function(event, data) {

    BUILDER.errorInfo = data;
    BUILDER.refresh();

});
