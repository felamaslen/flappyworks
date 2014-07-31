/**
 * @file js/mapstuff_fela.js
 */

define([
  'jquery',
  'global',
  'units',
  //'jqueryUI',
  //'firebase'
],
  function($, global, units) {
    var mapstuff_fela = function( window ){

        this.window = window;
        this.init( window );

    };

    mapstuff_fela.prototype = {
      init: function() {
        global.debug("mapstuff_fela loaded", 2);

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

        function updateBalance() {
          global.$d.balanceDisplay.text(global.me.balance.toFixed(2));
          return true;
        }

        function drawCircle(point, radius, dir) {
          var d2r = Math.PI / 180,
              r2d = 1 / d2r,
              earthRadius = 6371000,
              points = 50,

              rlat = (radius / earthRadius) * r2d,
              rlng = rlat / Math.cos(point.lat() * d2r),

              extp = [],
              start = 0,
              end = points * dir;

          for (var i = start; (dir > 0 ? i < end : i > end); i += dir) {
            var theta = Math.PI * (i / points * 2);
            ey = point.lng() + (rlng * Math.cos(theta));
            ex = point.lat() + (rlat * Math.sin(theta));
            extp.push(new google.maps.LatLng(ex, ey));
          }

          extp.push(extp[0]);

          return extp;
        }

        function addCityLimit() {
          // add limit to the city to show where units can be added
          global.G.defenceCircle = new google.maps.Circle({
            strokeColor: global.defenceRadiusColor,
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: global.defenceRadiusColor,
            fillOpacity: 0.35,
            map: global.G.map,
            center: global.G.cityCenter,
            radius: global.G.city.radius[0]
          });
          
          var giant = [
            new google.maps.LatLng(0, -90),
            new google.maps.LatLng(0, 90),
            new google.maps.LatLng(90, -90),
            new google.maps.LatLng(90, 90)
          ];

          global.G.attackCircle = new google.maps.Polygon({
            paths: [
              //drawCircle(global.G.cityCenter, global.G.city.radius[1] * 100, 1),
              giant,
              drawCircle(global.G.cityCenter, global.G.city.radius[1], -1)
            ],
            strokeColor: global.attackRadiusColor,
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: global.attackRadiusColor,
            fillOpacity: 0.35,
            map: global.G.map,
            //center: global.G.cityCenter,
            //radius: global.G.city.radius[0]
          });
        }

        function removeCityLimit() {
          // remove city limit from display
          global.G.defenceCircle.setMap(null);
          global.G.attackCircle.setMap(null);

          return true;
        }

        function withinCityLimit(latLng) {
          // determines whether or not a given position is within the allowed limits
          var distance = google.maps.geometry.spherical.computeDistanceBetween(latLng, global.G.cityCenter);

          return (global.G.mode == 0 && distance > global.G.city.radius[1])
            || (global.G.mode == 1 && distance < global.G.city.radius[0]);
        }

        function renderUnitsList(units) {
          global.$d.unitsList.empty();

          for (var name in units) {
            global.$d.unitsList.append($("<li></li>")
              .addClass("list-item")
              .addClass("unit")
              .addClass("unit-" + name)
              .text(name)
              .append($("<span></span>")
                .addClass("cost")
                .text(units[name].cost)
              )
              .css({
                color: units[name].color
              })
              .data({
                unit: units[name]
              })
              .append($("<div></div>")
                .addClass("icon")
                .append($("<img></img>").attr("src", typeof units[name].icon == "undefined"
                    ? "about:blank" : units[name].icon))
              )
            );
          }

          return true;
        }

        function gameUnit(game, options) {
          // soldier, turret etc.
          var self = this;
          
          this.position = new google.maps.LatLng(options.lat, options.lon);

          this.createMarker(options);

          // create path
          this.path = new google.maps.MVCArray();
          //this.path = [this.position];
          this.poly = new google.maps.Polyline({
            path: this.path,
            geodesic: true,
            strokeColor: "#ff0000",
            strokeOpacity: 1.0,
            strokeWeight: 2
          });

          this.poly.setMap(game.map);

          return true;
        }

        gameUnit.prototype.createMarker = function(options) {
          this.marker = new google.maps.Marker({
            position: this.position,
            map: global.G.map,
            title: options.role,
            icon: {
              url: options.icon,
              scaledSize: new google.maps.Size(global.markerSizeX, global.markerSizeY),
              origin: new google.maps.Point(0, 0),
              anchor: new google.maps.Point(global.markerSizeX / 2, global.markerSizeY / 2)
            }
          });

          var self = this;

          google.maps.event.addListener(this.marker, "click", function() {
            global.debug("selecting marker", 2);
            global.G.selectedUnit = self;
          });

          return true;
        }

        var evDragCancel = function(e) {
          if (global.G == null || global.G.dragData == null) return false;
          global.G.dragData = null;
          global.debug("cancelled dragging a unit", 2);
          removeCityLimit();
          return true;
        }

        var evDragStart = function(e) {
          if (global.G == null) return false;
          var $target = $(e.target);
          
          if ($target.is("img")) {
            $target = $target.parent().parent();
          }
          else if ($target.is("span") || $target.is("div.icon")) {
            $target = $target.parent();
          }

          var unit = $target.data().unit;

          var left = global.me.balance - unit.cost;

          if (left < 0) {
            // we can't afford this unit
            global.debug("You can't afford this item.", 0);
            return false;
          }

          addCityLimit();

          global.G.dragData = unit;
          
          global.debug("dragging a unit...", 2);
          return true;
        }
        
        var evMapDrop = function(e) {
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

          removeCityLimit();
          
          if (!withinCityLimit(position)) {
            global.debug("You can't place a unit there - try further " + (global.G.mode == 0 ? "out" : "in") + "!", 0);
            return false;
          }

          // by this point, the drop is confirmed, so update balance
          global.me.balance -= unit.cost;
          updateBalance();
          
          global.G.units[global.G.units.length] = new gameUnit(global.G, unit);
          
          global.G.dragData = null;

          return true;
        }

        var evMapClick = function(e) {
          if (global.G == null || global.G.selectedUnit == null) return false;

          // draw a path from the selected unit
          if (global.G.selectedUnit.speed == 0) {
            global.debug("That unit can't move!", 0);
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
            }
            else {
              global.debug("Something happened and the click wasn't registered.", 0);
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

        $(window).on("mouseup", evDragCancel);

        $(window).on("game_init_start", function(e, game) {
          global.debug("triggered game_init_start()", 2);

          var cityBalance = typeof game.city.balance == "number" ? game.city.balance : global.me.balance;

          global.me.balance = this.mode == 1 ? cityBalance : .2 * cityBalance;
          updateBalance();

          renderUnitsList(units.units); // malachy assigned to this

          // draggable stuff
          game.dragData = null;

          global.$d.unitsList.children()
            .prop("draggable", true)
            .on("mousedown", evDragStart)
            .on("dragend", evDragCancel)
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

          // event listener for map click
          google.maps.event.addListener(game.map, "click", evMapClick);
        });

        /*
        $(window).on("define_game", function(e) {
          global.G.units[0] = new gameUnit(global.G, units.units.soldier);
        });
        // */

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
            .on("drop", evMapDrop)
            .on("dragover", function(e){ e.preventDefault(); });
        });
      }
    };

    return mapstuff_fela;
  }
);
