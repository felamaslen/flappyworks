define(['intersection', 'global', 'formMethods', 'jquery'], function(intersection, global, formMethods, $) {

      function testUnit(unit) {
        if (!unit.role || unit.role != "soldier" || unit.role != "turret") {
          return false;
        }
        if (unit.health < 1 || unit.health > 100) {
          return false;
        }

      }

      var soldier = {
        role: "soldier",
        health: 50,
        lat: 0,
        lon: 0,
        speed: 1,
        range: 10,
        cost: 2000,
        level: 1,
        power: 5,
        sps: 2,
        icon: "img/icon/soldier.png"
      };

      var turret = {
        role: "turret",
        health: 10,
        lat: 0,
        lon: 0,
        speed: 0,
        range: 20,
        cost: 3000,
        level: 1,
        power: 7,
        sps: 5,
        icon: "img/icon/turret_128.png"
      };

      var units = {
        soldier: soldier,
        turret: turret
      }

      function plopUnit(unit) {
        if (global.G == null) return false;

        /* if(!testUnit(unit)){
           //global.debug('Unit invalid', 1);
           console.log("OOPS");
           return false;
         }*/

        var unitPlopped = new google.maps.Marker({
          position: new google.maps.LatLng(unit.lat, unit.lon),
          map: global.G.map,
          icon: typeof unit.icon == "undefined" ? null : unit.icon
        });

        global.me.balance -= unit.cost;
        $(window).on('budgetUpdate', function(e) {
          $('#balanceDisplay').html(global.me.balance);
        });
        $(window).trigger('budgetUpdate');

        return true;
      }

      /*function renderUnitsList(units) {
                global.$d.unitsList.empty();
                var formResults = intersection.getFormParams();
                    
                      
                    
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
                }*/

      function bindEvents() {
        $('window').on('game_init_start', $.proxy(addUnits, this));
        console.log('UNITS::bindEvents');

        if (global.G.mode == 0 && global.me.player == 1) {
//        if (formResults.mode == 0) {
          global.$d.unitsList.empty();
          name = "soldier";
          global.$d.unitsList.append($("<li></li>")
            .addClass("list-item")
            .addClass("unit")
            .addClass("unit-" + name)
            .text(name)
            .append($("<div></div>")
              .addClass("icon")
              .append(
                $("<img></img>").attr("src", "img/soldier.png")
              )));
        }
        
        if (formResults.mode == 1) {
          global.$d.unitsList.empty();
          name = "turret";
          global.$d.unitsList.append($("<li></li>")
            .addClass("list-item")
            .addClass("unit")
            .addClass("unit-" + name)
            .text(name)
            .append($("<div></div>")
              .addClass("icon")
              .append($("<img></img>").attr("src", "img/turret.png"))));
        }

      }

      var gameUnit = function(game, options) {
        // soldier, turret etc.
        var self = this;

        console.log("this is a test");
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
      };

      function addUnits() {
        console.log('UNITS::addUnits');
        var formResults = formMethods.getFormParams('#sessionParamForm');

        if (formResults.mode == 0) {
          global.$d.unitsList.empty();
          name = "soldier";
          global.$d.unitsList.append($("<li></li>")
            .addClass("list-item")
            .addClass("unit")
            .addClass("unit-" + name)
            .text(name)
            .append($("<div></div>")
              .addClass("icon")
              .append(
                $("<img></img>").attr("src", "img/icon/soldier.png")
              )));
        }
        if (formResults.mode == 1) {
          global.$d.unitsList.empty();
          name = "turret";
          global.$d.unitsList.append($("<li></li>")
            .addClass("list-item")
            .addClass("unit")
            .addClass("unit-" + name)
            .text(name)
            .append($("<div></div>")
              .addClass("icon")
              .append($("<img></img>").attr("src", "img/icon/turret.png"))));
        }
      };

      return {
        plopUnit: plopUnit,
        units: units,
        testUnit: testUnit,
        gameUnit: gameUnit,
        bindEvents: bindEvents,
        addUnits: addUnits
      };

    });
