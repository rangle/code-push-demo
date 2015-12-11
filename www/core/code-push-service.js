/**
 * Wrapper for the Code Push plugin
 */
angular.module('code.push', [])
  .factory('codePush', function($ionicPlatform, $q){

    var service = {
      syncStatus: undefined,
      downloadProgress: undefined
    };

    var baseOptions = {
      updateDialog: false
    };

    var waitForPreconditions = $ionicPlatform.ready()
      .then(function() {
        return window.codePush ? $q.when('READY') :
          $q.reject('window.codePush is not available.');
      });

    /**
     * Initiate sync from the specified deployment
     */
    service.sync = function(deploymentKey) {
      return waitForPreconditions
        .then(function() {
          var syncOptions = angular.extend({}, baseOptions, {
            deploymentKey: deploymentKey
          });
          window.codePush.sync(syncCallback, syncOptions, downloadProgress);
        });
    };

    /**
     * Check to see if an update is available
     */
    service.checkForUpdate = function(deploymentKey) {
      return waitForPreconditions
        .then(function() {
          window.codePush.checkForUpdate(function (remotePackage) {
            return !remotePackage ? null : remotePackage;
          }, onError);
        });
    };

    /**
     * Get the currently installed package
     */
    service.getCurrentPackage = function(deploymentKey) {
      return waitForPreconditions
        .then(function() {
          codePush.getCurrentPackage(function (localPackage) {
            return !localPackage ? null : localPackage;
          }, onError);
        });
    };

    var onError = function(error) {
      return error;
    };

    var syncCallback = function (syncStatus) {
      switch (syncStatus) {
        // Final statuses
        case SyncStatus.UPDATE_INSTALLED:
          service.syncStatus = 'The update was installed successfully. For InstallMode.ON_NEXT_RESTART, the changes will be visible after application restart. ';
          service.downloadProgress = undefined;
          break;
        case SyncStatus.UP_TO_DATE:
          service.syncStatus = 'The application is up to date.';
          break;
        case SyncStatus.UPDATE_IGNORED:
          service.syncStatus = 'The user decided not to install the optional update.';
          break;
        case SyncStatus.ERROR:
          service.syncStatus = 'An error occured while checking for updates';
          break;
        // Intermediate (non final) statuses
        case SyncStatus.CHECKING_FOR_UPDATE:
          service.syncStatus = 'Checking for update.';
          break;
        case SyncStatus.AWAITING_USER_ACTION:
          service.syncStatus = 'Alerting user.';
          break;
        case SyncStatus.DOWNLOADING_PACKAGE:
          service.syncStatus = 'Downloading package.';
          break;
        case SyncStatus.INSTALLING_UPDATE:
          service.syncStatus = 'Installing update';
          break;
      }
    };

    var downloadProgress = function (downloadProgress) {
      return downloadProgress;
    };

    return service;
  });
