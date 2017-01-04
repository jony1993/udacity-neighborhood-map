//Place Model
var Place = function(data){

    var self = this;

    //General Properties
    self.name = data.name;
    self.description = data.description;
    self.location = data.location;

    //Marker
    self.marker = new google.maps.Marker({
        map: map,
        position: self.location
    });
};