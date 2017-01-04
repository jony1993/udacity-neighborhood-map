//Load the google Maps API
//Maps Script with key
var googleMaps = "https://maps.googleapis.com/maps/api/js?key=AIzaSyAkwr2hIuNm_8TD72-wS9SqR-r7OTPdWmc"

// map parameters
var map;
var mapDiv = document.getElementById('map');
var mapOptions = {
    center: {lat: 49.03158, lng: 12.105280},
    zoom: 8,
    mapTypeControl: false
};

//Get the Google Maps script
$.getScript(googleMaps)
// handle googleMaps success
    .done(function () {

        // initialize map
        map = new google.maps.Map(mapDiv, mapOptions);

        // initialize knockout
        ko.applyBindings(new placesViewModel());


    })
    // could not load google maps
    .fail(function () {
        alert('GoogleMaps could not be loaded.');
    });
