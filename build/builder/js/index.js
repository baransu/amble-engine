const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;
// const remote = electron.remote;
// const Menu = remote.Menu;

global.jQuery = $ = require('jquery');

var BUILDER = null;

window.onload = function() {
    ipcRenderer.send('builder-loaded');
};

var builderApp = angular.module('builderApp', []);
builderApp.controller('builderController', ['$scope', function($scope) {

    var builder = BUILDER = this;

    builder.gameTitle = '';
    builder.buildDirectory = '';
    builder.errorInfo = ''
    builder.gameID = '';
    builder.targetPlatform = 'web';
    builder.projectVersion = '0.1.0';
    builder.projectAuthor = '';
    builder.projectDescription = '';

    builder.refresh = function() {
        $scope.$apply();
    };

    builder.directorySelect = function() {
        ipcRenderer.send('builder-dir-request');
    };

    builder.build = function() {

        if(builder.gameTitle && builder.buildDirectory != '' && builder.gameID != '' && builder.projectVersion != '' && builder.projectAuthor != '' && builder.projectDescription != '') {
          console.log(builder.targetPlatform)
            ipcRenderer.send('builder-build-request', {

                name: builder.gameTitle,
                gameID: builder.gameID.toLowerCase().trim(),
                targetPlatform: builder.targetPlatform,
                version: builder.projectVersion,
                description: builder.projectDescription,
                author: builder.projectAuthor

                //others preferences

            });

        } else if(!builder.gameTitle) {

            builder.errorInfo = {
                type: 'error',
                message: 'Dude, your game must have a cool name!'
            };

        } else if(builder.builDirectory == 'undefined') {

            builder.errorInfo = {
                type: 'error',
                message: 'You must select build destination!'
            };

        } else if(builder.gameID == '') {

          builder.errorInfo = {
              type: 'error',
              message: 'You must enter game ID!'
          };

        } else if(builder.projectVersion == '') {
          builder.errorInfo = {
              type: 'error',
              message: 'You must specify game version!'
          };
        } else if(builder.projectAuthor == '') {
          builder.errorInfo = {
              type: 'error',
              message: 'Your game needs credits!'
          };
        } else if(builder.projectDescription == '') {
          builder.errorInfo = {
              type: 'error',
              message: 'Your game needs description!'
          };
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
