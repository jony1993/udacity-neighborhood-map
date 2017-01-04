var placesViewModel = function() {

    var self = this;

    //all Places observable array
    self.allPlaces = ko.observableArray([]);

    // set infoWindow property as template
    self.infoWindow = new google.maps.InfoWindow({
        maxWidth: 300
    });

    //Searchbox input
    self.searchBox = ko.observable("");

    //iterate over all data, create places and safe it to the allPlaces observable array
    data.forEach(function(placesDataItem) {
        // create a place object for each place data
        var place = new Place(placesDataItem);
        // push place to allPlaces array
        self.allPlaces.push(place);
        //setAllInfoBoxes
    });

    //filtered Places
    self.filteredPlaces = ko.computed(function() {

        var searchBoxInput = self.searchBox().toLowerCase();
        //if filtering active, only show filtered places
        if (searchBoxInput !== null) {
            // filter allPlaces by name & category according to searchBoxInput
            return ko.utils.arrayFilter(self.allPlaces(), function(place) {

                // render matches
                if (place.name.toLowerCase().indexOf(searchBoxInput) >= 0) {
                    // show place on map / show marker
                    place.marker.setVisible(true);

                    // add onlick functionality for each visibile place / marker
                    place.marker.addListener("click", function() {
                        activateMarker(place)();
                    });

                    return true;
                }

                // hide non-matches
                else {
                    place.marker.setVisible(false);
                    return false;
                }
            });
        } else {
            return self.allPlaces();
        }

    });

    //showPlace
    self.showPlace = function(clickedPlace) {
        activateMarker(clickedPlace)();
    };

    // close info window listener
    google.maps.event.addListener(self.infoWindow, "closeclick", function() {
        map.setZoom(8);
    });

    //activate marker function
    function activateMarker(clickedPlace) {
        return function() {

            //updateInfoBoxes
            updateInfoBoxes(clickedPlace);

            //zoom to the marker
            map.setZoom(12);
            map.setCenter(clickedPlace.marker.getPosition());

            //open info Box
            self.infoWindow.open(map, clickedPlace.marker);

        }
    }

    //Update Info Boxes method
    function updateInfoBoxes(clickedPlace) {

        var contentString = '' +
            '<div>' +
            '<h1>' +
            clickedPlace.name +
            '</h1>' +
            '<div>' +
            '<p>' +
            clickedPlace.description +
            '</p>' +
            '<h2>Related Wiki Articles</h2>' +
            '<div id="loading"><span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span> Loading...</div>' +
            '<ul id="wikilist"></ul>' +
            '</div>' +
            '</div>';

        self.infoWindow.setContent(contentString);

        //load tripadvisor content
        wikiRequest(clickedPlace);

    }

    //method to get the wikipedia articles
    function wikiRequest(clickedPlace) {

        var wikiUrl = "http://en.wikipedia.org/w/api.php?action=opensearch&search='" +
            clickedPlace.name + "'&format=json&callback=wikiCallback";

        var wikiString = "";

        var wikiRequestTimeout = setTimeout(function() {
            $('#wikilist').append("<div class='alert alert-danger'>Failed to get wikipedia resource</div>");
        }, 8000);

        $.ajax({
            url: wikiUrl,
            dataType: "jsonp",

            // Function to be called if the request succeeds
            success: function(response) {

                var articleList = response[1];

                for (var i = 0; i < articleList.length; i++) {
                    articleStr = articleList[i];
                    var url = "https://en.wikipedia.org/wiki/" + articleStr;
                    $('#wikilist').append("<li><a target='blank' href='" + url + "'>" + articleStr + "</a></li>");
                }

                //remove loading div
                $('#loading').remove();

                clearTimeout(wikiRequestTimeout);

            }
        });

    }
};
