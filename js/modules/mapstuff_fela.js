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
          this.path = [this.position];
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
            icon: options.icon
          });

          var self = this;

          google.maps.event.addListener(this.marker, "click", function() {
            global.debug("selecting marker", 2);
            global.G.selectedUnit = options;
          });

          return true;
        }

        var evDragCancel = function(e) {
          if (global.G == null) return false;
          global.G.dragData = null;
          return true;
        }

        var evDragStart = function(e) {
          if (global.G == null) return false;
          global.G.dragData = $(e.target).data().unit;
          return true;
        }
        
        var evMapDrop = function(e) {
          // handles dropping units onto the map
          if (global.G == null || global.G.dragData == null) {
            global.debug("tried to drop unit with no active game in progress", 1);
            return false;
          }
          
          e.preventDefault();
        
          var unit = global.G.dragData;
          global.G.dragData = null;

          console.log(e, unit);

          return true;
        }

        var evMapClick = function(e) {
          if (global.G == null || global.G.selectedUnit) return false;

          if (global.G.selectedUnit == null) {
            // try to select a unit
          }
          else {
            if (global.G.mode == 0) {
              // in attacking mode, draw a path from the selected unit
              if (global.G.selectedUnit.speed == 0) {
                global.debug("That unit can't move!", 0);
                return false;
              }

              // draw the path
              if (
              
              if (global.G.map.path.getLength() == 0) {
                global.G.units[global.G.selectedUnit].path.push(global.global.G.selectedUnit.latLng);
                global.G.map.poly.setPath(global.G.map.path);
              }
              
              global.G.mapService.route({
                origin: global.G.map.path.getAt(global.G.map.path.getLength() - 1),
                destination: e.latLng,
                travelMode: game.travelMode
              }, function (result, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                  for (var i = 0, len = result.routes[0].overview_path.length; i < len; i++) {
                    self.path.push(result.routes[0].overview_path[i]);
                  }
                }
                else {
                  debug("Something happened and the click wasn't registered.", 0);
                  return false;
                }
              });
              }
            }
          }

          return true;
        };

        $(window).on("game_init_start", function(game) {
          global.debug("triggered game_init_start()", 2);

          renderUnitsList(units.units); // malachy assigned to this

          // draggable stuff
          game.dragData = null;

          global.$d.unitsList.children()
            .prop("draggable", true)
            .on("mousedown", evDragStart)
            .on("mouseup", evDragCancel);
        });

        $(window).on("map_init", function(e, game) {
          global.debug("triggered map_init()", 2);

          game.selectedUnit = null;

          // event listener for map click
          google.maps.event.addListener(game.map, "click", evMapClick);

          game.units[0] = new gameUnit(game, units.units.soldier);
        });

        $(window).on("doc_ready", function() {
          global.$d.unitsList = $("#unitsList");
          global.$d.map_outer = $("#map_outer");

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
