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
                    place.marker.addListener('click', function() {
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
        //zoom back
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

            //bounce marker
            clickedPlace.marker.setAnimation(google.maps.Animation.BOUNCE);

            //open info Box
            self.infoWindow.open(map, clickedPlace.marker);

        };
    }

    //Update Info Boxes method
    function updateInfoBoxes(clickedPlace) {

        //Set Window Info Content
        self.infoWindow.setContent(getWindowInfoContent(clickedPlace, null, null));

        //load tripadvisor content
        wikiRequest(clickedPlace);

    }


    function getWindowInfoContent(clickedPlace, error, wikiList) {

        var contentString = '';

        //Basic Content
        contentString = '' +
            '<div>' +
            '<h1>' +
            clickedPlace.name +
            '</h1>' +
            '<div>' +
            '<p>' +
            clickedPlace.description +
            '</p>' +
            '<h2>Related Wiki Articles</h2>';

        //wikiList Loading
        if (wikiList == null && error == null) {
            contentString += '<div id="loading"><span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span> Loading...</div>';
        }

        //WikiList
        else if (wikiList !== null) {
            contentString += '<ul id="wikilist"></ul>';

            for (var i = 0; i < wikiList.length; i++) {
                articleStr = wikiList[i];
                var url = "https://en.wikipedia.org/wiki/" + articleStr;
                contentString += "<li><a target='blank' href='" + url + "'>" + articleStr + "</a></li>";
            }
            contentString += '</ul>';
        }

        //error
        else {
            contentString += "<div class='alert alert-danger'>Failed to get wikipedia resource</div>";
        }

        contentString += '</div></div>';

        return contentString;

    }



    //method to get the wikipedia articles
    function wikiRequest(clickedPlace) {

        var wikiUrl = "http://en.wikipedia.org/w/api.php?action=opensearch&search='" +
            clickedPlace.name + "'&format=json&callback=wikiCallback";

        var wikiString = "";

        var wikiRequestTimeout = setTimeout(function() {
            self.infoWindow.setContent(getWindowInfoContent(clickedPlace, 1, null));
        }, 8000);

        $.ajax({
                url: wikiUrl,
                dataType: "jsonp"

            })
            .done(function(response) {
                var articleList = response[1];

                self.infoWindow.setContent(getWindowInfoContent(clickedPlace, null, articleList));

            })

            .fail(clearTimeout(wikiRequestTimeout));

    }
};
