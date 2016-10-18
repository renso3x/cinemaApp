'use strict';

(function() {
    angular
        .module('BigTownCinema')
        .controller('BookingController', BookingController);

    BookingController.$inject = ['$scope', 'BookingService', '$uibModal'];
    function BookingController($scope, BookingService, $uibModal) {
        // SETUP -------------------------------------------------------------------------------------------------------
        // These assignments and initializations are executed when BookingController is first called
        var reservedSeats = [],
            transac_id = 0,
            today = new Date();

        // Variables exposed to the view
        //-- Scope
        var ctrl = this; // we access the controller scope via the this object

        //-- Dates
        //---- we'll use these to control the earliest and latest dates that the customer could reserve for
        //---- initialize the dates
        ctrl.minDate = new Date();
        ctrl.maxDate = new Date();
        //---- valid date range is tomorrow's date and the day after's
        ctrl.dateOptions = {
            formatYear: 'yy',
            maxDate: ctrl.maxDate.setDate(today.getDate() + 2),
            minDate: ctrl.minDate.setDate(today.getDate() + 1),
        };
        ctrl.format = 'dd-MMMM-yyyy';

        ctrl.popup = {
            opened: false
        }
        ctrl.popupDate = popupDate; //open date popup
        
        //-- Seats
        //---- holds the status of each seat available for booking for a particular day
        ctrl.seatsArr = [];
        //---- initializes ctrl.seatsArr
        ctrl.seatsArr = initSeatsArr(ctrl.minDate, ctrl.maxDate);

        //-- Bookings
        //---- an object to hold new booking entered
        ctrl.newBookingObj = {};
        //---- an array that holds all bookings that have been entered
        ctrl.editRow = false;
        ctrl.bookings = BookingService.getCustomers();

        //---- readies a booking object for new customer booking
        //---- ctrl.bookings.length returns number of booking objects in the bookings array
        //---- We would use this length to determine the ID number for the next booking
        ctrl.booking = getBookingObj(ctrl.bookings.length, ctrl.minDate);

        // Functions exposed to the view
        ctrl.selectedDate = selectedDate;
        ctrl.occupySeat = occupySeat;
        ctrl.submitReservation = submitReservation;
        ctrl.updateInfo = updateInfo;
        ctrl.cancelUpdate = cancelUpdate;
        ctrl.viewMovie = viewMovie; //opens a modal view of the movie
        // END SETUP ---------------------------------------------------------------------------------------------------

        //////
        // Arranged alphabetically
        // These functions are not directly exposed to the view
        // The functions are executed when their ctrl.<functionName> counterpart is invoked from the view, or internally
        // by other functions

        // This function returns a new booking object
        function getBookingObj(currentID, defaultDate) {
            var newBookingObj = {};         // creates new booking object. Normally I'd name this booking
                                            // but using newBookingObj so it's clearer to those new in programming

            console.log("--- We're in getBookObj function");
            // Initialize new booking object
            newBookingObj.id = currentID + 1;    // new ID is currentID + 1
            newBookingObj.date = defaultDate;
            newBookingObj.seats = [];            // this is an array because a customer can book more than 1 seat
            newBookingObj.custName = '';
            newBookingObj.custMobile = '';
            newBookingObj.custEmail = '';
            newBookingObj.status = '';

            // Return new booking object
            console.log("------ Booking object created and returned: " + JSON.stringify(newBookingObj));
            ctrl.filterSeatsByDate = newBookingObj.date.toJSON().slice(0,10); //set the filetered data in the table
            return(newBookingObj);
        } // END getBookingObj

        // This function initializes the seats array
        function initSeatsArr(fromDate, toDate) {
            console.log("--- We're in initSeatsArray function");

            var seat = {};         // creates new seat object
            var rowArr = [];       // creates a new rowArr array. 1 rowArr would contain multiple seat objects.
            var seats = [];        // creates new seats array. The seats array would contain multiple rowArr arrays.

            // Get number of days between the two dates passed.
            // A straight subtraction would give us an answer in milliseconds
            // 1 day = hours*minutes*seconds*milliseconds
            var days = Math.round((toDate - fromDate)/(1000*60*60*24));

            var tempDate = new Date();

            // Loops to create seats
            // First loop prepares seat collection for a particular booking date
            // Second loop is for rows of a seat collection
            // Third loop is for seats within a row
            for (var i = 0; i <= days; i++) {
                tempDate.setDate(fromDate.getDate() + i);
                for (var row = 'A'; row <= 'D'; row = String.fromCharCode(row.charCodeAt(0) + 1)){
                    for (var col = 1; col <= 6; col++){
                        seat.date = tempDate.toJSON().slice(0,10);      // Remove extra info
                        seat.name = row + col;
                        seat.reserved = false;
                        rowArr.push(seat);                              // Add seat to row
                        seat = {};                                      // Creates new seat object
                    }
                    seats.push(rowArr);                                 // Add row to seats collection
                    rowArr = [];                                        // Creates new rowArr array
                }
            }

            // Returns initialized seats array
            // console.log ("Seats created and returned: " + JSON.stringify(seats));
            return(seats);
        } // END initSeatsArr


        function selectedDate() {
            console.log('selected date');
            console.log("booking" + ctrl.booking.date);
            ctrl.newBookingObj.date = ctrl.booking.date; //data bind the newbooking date
            ctrl.filterSeatsByDate = ctrl.booking.date.toJSON().slice(0,10); //filter the seats
            console.log(ctrl.filterSeatsByDate)
        } // END selectedDate

        function occupySeat(parentIndex, row, seatsPos, seat, index) {
            var index = reservedSeats.indexOf(seat);
            if(seat.reserved != 'occuped') {
                seat.reserved = true;
                if (index < 0) {
                    reservedSeats.push(seat);
                } else {
                    seat.reserved = false;
                    reservedSeats.splice(index, 1);
                }
                ctrl.newBookingObj.seats = reservedSeats;
            }
        }

        function submitReservation() {
            if (ctrl.newBookingObj.seats == null) {
                return alert('Please select a seat');
            }
            ctrl.newBookingObj.date = ctrl.booking.date.toJSON().slice(0,10);
            ctrl.newBookingObj.transac_id = transac_id++;
            ctrl.newBookingObj.status = 'Reserved';
            BookingService.occupySeats(ctrl.newBookingObj.seats);
            BookingService.saveCustomer(ctrl.newBookingObj);


            ctrl.newBookingObj = {};
            ctrl.newBookingObj.date = ctrl.reserveDate;
            reservedSeats = [];
        } // END submitReservation

        function updateInfo (index, customer, status) {
            switch(status) {
                case 'Cancelled': 
                    BookingService.vacantSeats(ctrl.bookings[index].seats);
                    ctrl.bookings.splice(ctrl.bookings.indexOf(customer), 1);
                    break;
                case 'Paid':
                    ctrl.bookings[index].paid = true;
                    ctrl.bookings[index].status = status;    
                    ctrl.bookings[index].edit = false;           
                    break;
                default: 
                    ctrl.bookings[index].edit = false;           
            }
        }

        function cancelUpdate (index, status) {
            ctrl.bookings[index].status = status;
            ctrl.bookings[index].edit = false;
        }

        function viewMovie() {
            $uibModal.open({
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'app/booking/booking.modal.html',
                controller: 'ModalInstanceCtrl',
                controllerAs: 'ctrl',
                size: 'md',
            });
        }

        function popupDate() {
            ctrl.popup.opened = true;
        }

    }

})();