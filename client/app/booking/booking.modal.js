'use strict';

(function() {

	angular
		.module('BigTownCinema')
		.controller('ModalInstanceCtrl', ModalInstanceCtrl)

		ModalInstanceCtrl.$inject = ['$scope', '$uibModalInstance'];
		function ModalInstanceCtrl($scope, $uibModalInstance){
			var ctrl = this;
			ctrl.ok = function () {
				$uibModalInstance.close();
			};

			ctrl.cancel = function () {
				$uibModalInstance.dismiss('cancel');
			};
		}
})()