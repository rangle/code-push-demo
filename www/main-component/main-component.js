/**
 * Main App Component
 */
angular.module('component.main', [])
.directive('main', function(codePush) {
  return {
    scope: {},
    restrict: 'E',
    templateUrl: 'main-component/main-component.html',
    controllerAs: 'main',
    controller: function() {
      var vm = this;
      var deploymentKey = 'ljsqHtoNNwS9Rmo4QJrMo_2Bu3JgE1gdagdEl';
      vm.downloadProgress = codePush.downloadProgress;

      codePush.getCurrentPackage(deploymentKey)
        .then(function(localPackage) {
          vm.localPackage = localPackage;
        })
        .catch(onError);

      var onError = function (error) {
        vm.error =  error;
      };
    }
  };
});
