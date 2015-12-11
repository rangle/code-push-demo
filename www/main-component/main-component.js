/**
 * Main App Component
 */
angular.module('component.main', [
  'code.push'
])
.directive('main', function() {
  return {
    scope: {},
    restrict: 'E',
    templateUrl: 'main-component/main-component.html',
    controllerAs: 'main',
    bindToController: true,
    controller: function(codePush) {
      var vm = this;
      var deploymentKey = 'ljsqHtoNNwS9Rmo4QJrMo_2Bu3JgE1gdagdEl';
      vm.codePush = codePush

      codePush.getCurrentPackage(deploymentKey)
        .catch(onError);

      vm.checkForUpdate = function() {
        codePush.checkForUpdate(deploymentKey)
          .catch(onError);
      };

      vm.sync = function() {
        codePush.sync(deploymentKey)
          .catch(onError);
      };

      var onError = function(error) {
        vm.error = error;
      };
    }
  };
});
