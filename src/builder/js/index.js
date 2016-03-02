const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;

global.jQuery = $ = require('jquery');

var BUILDER = null;

$(document).ready(function(){
  $('[data-toggle="tooltip"]').tooltip();
});

window.onload = function() {
  ipcRenderer.send('builder-loaded');
};

ipcRenderer.on('builder-loaded-respond', function(event, data) {

  console.log(data);
  if(data) {
    BUILDER.gameTitle = data.name || '';
    BUILDER.gameID = data.gameID || '';
    BUILDER.projectVersion = data.version || '0.1.0';
    BUILDER.projectAuthor = data.author || '';
    BUILDER.projectDescription = data.description || '';

    BUILDER.refresh();
  }
});

var builderApp = angular.module('builderApp', []);
builderApp.controller('builderController', ['$scope', function($scope) {

  var builder = BUILDER = this;

  // get this from project save
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

      document.getElementById('confirmButton').disabled = true;
      ipcRenderer.send('builder-build-request', {


        name: builder.gameTitle,
        gameID: builder.gameID.toLowerCase().trim(),
        targetPlatform: builder.targetPlatform,
        version: builder.projectVersion,
        description: builder.projectDescription,
        author: builder.projectAuthor

      });

    } else if(!builder.gameTitle) {

      builder.errorInfo = {
        type: 'error',
        message: 'Your game must have a name!'
      };

    } else if(builder.builDirectory == 'undefined' || builder.builDirectory == '') {

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
        message: 'You must have specified game version!'
      };
    } else if(builder.projectAuthor == '') {
      builder.errorInfo = {
        type: 'error',
        message: 'Your game must have credits!'
      };
    } else if(builder.projectDescription == '') {
      builder.errorInfo = {
        type: 'error',
        message: 'Your must have description!'
      };
    }
  };

}]);

ipcRenderer.on('builder-dir-respond', function(event, data) {

  BUILDER.buildDirectory = data;
  BUILDER.refresh();

});

ipcRenderer.on('builder-build-respond', function(event, data) {
  document.getElementById('confirmButton').disabled = false;
  BUILDER.errorInfo = data;
  BUILDER.refresh();

});
