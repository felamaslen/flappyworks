/**
 * @file js/mapstuff_fela.js
 */

define([
  'jquery',
  'global',
  'units',
  'mapMethods',
],
  function($, global, units, mapMethods) {
    var mapstuff_fela = function( window ){

        this.window = window;
        this.init( window );

    };

    mapstuff_fela.prototype = {
      init: function() {
        global.debug("mapstuff_fela loaded", 2);

        global.mm = new mapMethods();

        // dev GET parameters
        var href = window.location.href || "";
        var split = href.split("?");
        var get = {};
        if (typeof split[1] != "undefined") {
          split = split[1].split("&");
          for (var i = 0; i < split.length; i++) {
            var sp = split[i].split("=");
            get[sp[0]] = sp[1];
          }
        }

        //var global.startGameOnLoad = typeof get.startgameonload != "undefined" && get.startgameonload == "true";
        var devMode = typeof get.devMode != "undefined" && get.devMode == "true";

        if (devMode) global.sesId = 1;

        function updateBalance() {
          global.$d.balanceDisplay.text(global.me.balance.toFixed(2));
          return true;
        }

        global.evDragCancel = function(e) {
          if (global.G == null || global.G.dragData == null) return false;
          global.G.dragData = null;
          global.debug("cancelled dragging a unit", 2);
          global.mm.removeCityLimit();
          return true;
        }

        global.evDragStart = function(e) {
          if (global.G == null) return false;
          var $target = $(e.target);
          
          if ($target.is("img")) {
            $target = $target.parent().parent();
          }
          else if ($target.is("span") || $target.is("div.icon")) {
            $target = $target.parent();
          }

          var data = $target.data(),
              unit = data.unit;

          unit.type = data.type;

          var left = global.me.balance - unit.cost;

          if (left < 0) {
            // we can't afford this unit
            global.debug("You can't afford this item.", 3);
            return false;
          }
         
          console.log("adding city limit");
          global.mm.addCityLimit();

          global.G.dragData = unit;
          
          global.debug("dragging a unit...", 2);
          return true;
        }
        
        global.evMapDrop = function(e) {
          // handles dropping units onto the map
          if (global.G == null || global.G.dragData == null) {
            global.debug("tried to drop unit with no active game in progress", 1);
            return false;
          }
         
          // prevents the cancel drop function from executing
          e.preventDefault();
          e.stopPropagation();
        
          var unit = global.G.dragData;

          // find the coordinates of the click
          var cX = e.originalEvent.clientX,
              cY = e.originalEvent.clientY,

              pos = global.$d.map_outer.position(),
              pX = cX - pos.left,
              pY = cY - pos.top;

          var position = global.G.overlay.getProjection().fromContainerPixelToLatLng(new google.maps.Point(pX, pY)),
              lat = position.lat(),
              lon = position.lng();

          unit.lat = lat;
          unit.lon = lon;

          global.mm.removeCityLimit();
          
          if (!global.mm.withinCityLimit(position)) {
            global.debug("You can't place a unit there - try further " + (global.G.mode == 0 ? "out" : "in") + "!", 3);
            return false;
          }

          // by this point, the drop is confirmed, so update balance
          global.me.balance -= unit.cost;
          updateBalance();

          unit.mine = true;
          
          global.G.units[global.G.units.length] = new units.gameUnit(global.G, unit);

          // add unit's dynamic properties to session
          global.G.myUnits.push({
            type: unit.type,
            lat: lat,
            lon: lon,
            health: unit.health,
            level: unit.level
          });

          global.playerChild.update({
            units: global.G.myUnits
          });
          
          global.G.dragData = null;

          return true;
        }

        global.evMapClick = function(e) {
          if (global.G == null || global.G.selectedUnit == null) return false;

          // draw a path from the selected unit
          if (global.G.selectedUnit.speed == 0) {
            global.debug("That unit can't move!", 3);
            return false;
          }

          // draw the path
          if (global.G.selectedUnit.path.getLength() === 0) {
            global.G.selectedUnit.path.push(global.G.selectedUnit.position);

            global.G.selectedUnit.poly.setPath(global.G.selectedUnit.path);
          }

          var self = global.G.selectedUnit;
          
          global.G.mapService.route({
            origin: global.G.selectedUnit.path.getAt(global.G.selectedUnit.path.getLength() - 1),
            destination: e.latLng,
            travelMode: global.G.travelMode
          }, function (result, status) {
            if (status == google.maps.DirectionsStatus.OK) {
              for (var i = 0, len = result.routes[0].overview_path.length; i < len; i++) {
                self.path.push(result.routes[0].overview_path[i]);
              }
              
              if (self.animate) {
                var seg = {};
                
                seg.poly1 = new google.maps.Polyline({
                  path: [],
                  strokeColor: global.mapStrokeColor,
                  strokeOpacity: global.mapStrokeOpacity,
                  strokeWeight: global.mapStrokeWeight
                });
                seg.poly2 = new google.maps.Polyline({
                  path: [],
                  strokeColor: global.mapStrokeColor,
                  strokeOpacity: global.mapStrokeOpacity,
                  strokeWeight: global.mapStrokeWeight
                });

                seg.route = result.routes[0];

                seg.startLoc = {};
                seg.endLoc = {};

                var path = seg.route.overview_path;
                var legs = seg.route.legs;
                for (var i = 0; i < legs.length; i++) {
                  if (i == 0) {
                    seg.startLoc.latlng = legs[i].start_location;
                  }
                  seg.endLoc.latlng = legs[i].end_location;

                  seg.steps = legs[i].steps;

                  for (var j = 0; j < seg.steps.length; j++) {
                    var nextSegment = seg.steps[j].path;

                    for (var k = 0; k < nextSegment.length; k++) {
                      seg.poly1.getPath().push(nextSegment[k]);
                    }
                  }

                  seg.poly1.setMap(global.G.map);

                  seg.eol = seg.poly1.Distance();
                  seg.poly2 = new google.maps.Polyline({
                    path: [seg.poly1.getPath().getAt(0)],
                    strokeColor: "#0000ff",
                    strokeWeight: 10
                  });

                  // animation properties are controlled here
                  seg.step = .5 * self.speed;
                  seg.steps = 0;

                  self.animSegments.push(seg);
                }

                //self.updateAnim();
              }
            }
            else {
              global.debug("Something happened and the click wasn't registered.", 3);
              return false;
            }
          });

          return true;
        };

        Number.prototype.toRad = function() {
          return this * Math.PI / 180;
        }

        Number.prototype.toDeg = function() {
          return this * 180 / Math.PI;
        }

        google.maps.LatLng.prototype.destinationPoint = function(brng, dist) {
          dist = dist / 6371000;  
          brng = brng.toRad();  

          var lat1 = this.lat().toRad(), lon1 = this.lng().toRad();

          var lat2 = Math.asin(Math.sin(lat1) * Math.cos(dist) + 
          Math.cos(lat1) * Math.sin(dist) * Math.cos(brng));

          var lon2 = lon1 + Math.atan2(Math.sin(brng) * Math.sin(dist) *
          Math.cos(lat1), 
          Math.cos(dist) - Math.sin(lat1) *
          Math.sin(lat2));

          if (isNaN(lat2) || isNaN(lon2)) return null;

          return new google.maps.LatLng(lat2.toDeg(), lon2.toDeg());
        }

        $(window).on("mouseup", global.evDragCancel);

        $(window).on("game_init_start", function(e, game) {
          global.debug("triggered game_init_start()", 2);

          var cityBalance = typeof game.city.balance == "number" ? game.city.balance : global.me.balance;

          global.me.balance = this.mode == 1 ? cityBalance : .2 * cityBalance;
          updateBalance();

          //renderUnitsList(units.units); // malachy assigned to this

          // draggable stuff
          game.dragData = null;
        });

        $(window).on("map_init", function(e, game) {
          global.debug("triggered map_init()", 2);
      
          // bounding box (determined by attack radius)
          var boundRadius = game.city.radius[1] * 3;

          var allowedBounds = new google.maps.LatLngBounds(
            game.cityCenter.destinationPoint(225, boundRadius),
            game.cityCenter.destinationPoint(45, boundRadius)
          );

          var lastValidCenter = game.map.getCenter();
          google.maps.event.addListener(game.map, "center_changed", function() {
            if (allowedBounds.contains(global.G.map.getCenter())) {
              // still within bounds
              lastValidCenter = global.G.map.getCenter();
              return;
            }

            // not valid any more
            global.G.map.panTo(lastValidCenter);
          });

          // empty overlay used to compute latlng during DnD
          game.overlay = new google.maps.OverlayView();
          //game.overlay.onAdd = function() { };
          //game.overlay.onRemove = function() { };
          game.overlay.draw = function() { };
          game.overlay.setMap(game.map);

          game.selectedUnit = null;
          
          // animation interval for guns and movement
          game.anim = window.setInterval(global.anim.gameAnimWrapper, global.animTime);

          // event listener for map click
          google.maps.event.addListener(game.map, "click", global.evMapClick);
        });

        $(window).on("doc_ready", function() {
          global.$d.unitsList = $("#unitsList");
          global.$d.map_outer = $("#map_outer");
          global.$d.balanceDisplay = $("#balanceDisplay");

          updateBalance();

          if (devMode) {
            global.me.player = 1;
            global.startGame({
              city: 0,
              mode: 0 // attack if player 1
            });
          }

          global.$d.map_outer
            .on("drop", global.evMapDrop)
            .on("touchend", global.evMapDrop)
            .on("dragover", function(e){ e.preventDefault(); });
        });
      }
    };

    return mapstuff_fela;
  }
);
