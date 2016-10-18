'use strict';

(function() {

	angular
		.module('BigTownCinema')
		.service('BookingService', BookingService);

	BookingService.$inject = [];
	function BookingService() {
		var customers = [];

		return {
			getCustomers: function() {
				return customers;
			},
			saveCustomer: function(customer) {
				return customers.push(customer);	
			},
			occupySeats: function(userSeats) {
				return angular.forEach(userSeats, function(val) {
					val.reserved = 'occuped'
				});
			},
			vacantSeats: function(userSeats) {
				return angular.forEach(userSeats, function(val) {
					val.reserved = false;
				});
			}
		}
	}

})();