/**
 * Wrapper for the Code Push plugin
 */
angular.module('code.push', [])
  .factory('codePush', function($ionicPlatform, $q, $rootScope){

    var service = {
      syncStatus: undefined,
      downloadProgress: undefined,
      remotePackage: undefined,
      localPackage: undefined,
      didCheck: false
    };

    var baseOptions = {
      updateDialog: false
    };

    var waitForPreconditions = $ionicPlatform.ready()
      .then(function() {
        console.info('[ionicPlatform] Ready');
        return window.codePush ? $q.when('READY') :
          $q.reject('window.codePush is not available.');
      });

    /**
     * Initiate sync from the specified deployment
     */
    service.sync = function(deploymentKey) {
      return waitForPreconditions
        .then(function() {
          console.info('[codePushService] Starting sync');
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
          console.info('[codePushService] Checking for update');
          service.didCheck = false;

          window.codePush.checkForUpdate(function(remotePackage) {
            service.remotePackage = !remotePackage ? undefined : remotePackage;
            service.didCheck = true;
            $rootScope.$apply();
          }, onError);
        });
    };

    /**
     * Get the currently installed package
     */
    service.getCurrentPackage = function() {
      return waitForPreconditions
        .then(function() {
          console.info('[codePushService] Fetching current package');
          codePush.getCurrentPackage(function (localPackage) {
            service.localPackage = !localPackage ? null : localPackage;
            $rootScope.$apply();
          }, onError);
        });
    };

    var onError = function(error) {
      return error;
    };

    var syncCallback = function(syncStatus) {
      switch (syncStatus) {
        // Final statuses
        case SyncStatus.UPDATE_INSTALLED:
          service.syncStatus = 'The update was installed successfully.';
          service.downloadProgress = undefined;
          service.getCurrentPackage();
          break;
        case SyncStatus.UP_TO_DATE:
          service.syncStatus = 'The application is up to date';
          break;
        case SyncStatus.UPDATE_IGNORED:
          service.syncStatus = 'The user decided not to install the optional update';
          break;
        case SyncStatus.ERROR:
          service.syncStatus = 'An error occured while checking for updates';
          break;
        // Intermediate (non final) statuses
        case SyncStatus.CHECKING_FOR_UPDATE:
          service.syncStatus = 'Checking for update';
          break;
        case SyncStatus.AWAITING_USER_ACTION:
          service.syncStatus = 'Alerting user';
          break;
        case SyncStatus.DOWNLOADING_PACKAGE:
          service.syncStatus = 'Downloading package';
          break;
        case SyncStatus.INSTALLING_UPDATE:
          service.syncStatus = 'Installing update';
          break;
      }
      $rootScope.$applyAsync();
    };

    var downloadProgress = function (downloadProgress) {
      service.downloadProgress = downloadProgress;
      $rootScope.$applyAsync();
    };

    return service;
  });
