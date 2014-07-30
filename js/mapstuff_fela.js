/**
 * @file js/mapstuff_fela.js
 */

function gameUnit(game, options) {
  // soldier, turret etc.
  var self = this;

  this.game = game;

  this.createMarker();

  if (game.mode == 0) {
    // attack - attach poly events
  }    
    

  this.poly = new google.maps.Polyline({ map: g.map });
  this.path = new google.maps.MVCArray();

  google.maps.event.addListener(g.map, "click", function(e) {
    debug("map clicked", 2);
    if (self.path.getLength() === 0) {
      self.path.push(e.latLng);
      self.poly.setPath(self.path);
    }
    else {
      g.mapService.route({
        origin: self.path.getAt(self.path.getLength() - 1),
        destination: e.latLng,
        travelMode: google.maps.DirectionsTravelMode.DRIVING
      }, function (result, status) {
        if (status == google.maps.DirectionsStatus.OK) {
          for (var i = 0, len = result.routes[0].overview_path.length; i < len; i++) {
            self.path.push(result.routes[0].overview_path[i]);
          }
        }
      });
    }
  });

  return true;
}

gameUnit.prototype.createMarker = function() {
}

game.on("map_init", function(g) {
  g.units[0] = new gameUnit(g);
});
