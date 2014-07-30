/**
 * @file js/mapstuff_fela.js
 */

define([
  'jquery',
  'global',
  'units',
  'jqueryUI',
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

          this.createMarker();

          if (game.mode == 0) {
            // attack - attach poly events
          }

          this.poly = new google.maps.Polyline({ map: game.map });
          this.path = new google.maps.MVCArray();

          google.maps.event.addListener(game.map, "click", function(e) {
            if (self.path.getLength() === 0) {
              self.path.push(e.latLng);
              self.poly.setPath(self.path);
            }
            else {
              game.mapService.route({
                origin: self.path.getAt(self.path.getLength() - 1),
                destination: e.latLng,
                travelMode: game.travelMode
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

        $(window).on("game_init_start", function(game) {
          global.debug("triggered game_init_start()", 2);

          renderUnitsList(units.units); // malachy assigned to this

          // draggable stuff
          global.$d.unitsList.children().draggable({
            revert: true,
            helper: "clone"
          });
        });

        $(window).on("map_init", function(e, game) {
          global.debug("triggered map_init()", 2);
          game.units[0] = new gameUnit(game);
        });

        $(window).on("doc_ready", function() {
          global.$d.unitsList = $("#unitsList");

          if (devMode) {
            global.startGame({
              city: 0,
              mode: 0 // attack
            });
          }
        });
      }
    };

    return mapstuff_fela;
  }
);
