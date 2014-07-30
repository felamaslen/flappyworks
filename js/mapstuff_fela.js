/**
 * @file js/mapstuff_fela.js
 */

// dev GET parameters
var href = window.location.href;
var split = href.split("?")[1].split("&");
var get = {};
for (var i = 0; i < split.length; i++) {
  var sp = split[i].split("=");
  get[sp[0]] = sp[1];
}

//var startGameOnLoad = typeof get.startgameonload != "undefined" && get.startgameonload == "true";
var devMode = typeof get.devMode != "undefined" && get.devMode == "true";

function renderUnitsList(units) {


function gameUnit(game, options) {
  // soldier, turret etc.
  var self = this;

  this.game = game;

  this.createMarker();

  if (game.mode == 0) {
    // attack - attach poly events
  }    
    

  this.poly = new google.maps.Polyline({ map: game.map });
  this.path = new google.maps.MVCArray();

  google.maps.event.addListener(game.map, "click", function(e) {
    debug("map clicked", 2);
    if (self.path.getLength() === 0) {
      self.path.push(e.latLng);
      self.poly.setPath(self.path);
    }
    else {
      game.mapService.route({
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

$(window).on("game_init", function(game) {
  // generate a test units list to drag
  var units = {
    "soldier": {
      cost: 10,
      color: "#00f",
      speed: 10
    }
  };
});

$(window).on("map_init", function(game) {
  game.units[0] = new gameUnit(g);
});

$(window).on("doc_ready", function() {
  $d.nodesList = $("#nodesList");

  if (devMode) {
    startGame({
      city: 0,
      mode: 0 // attack
    });
  }
});
