define([
  'jquery',
  'intersection',
  'global',
  'formMethods',
  'unitObj',
  'eventsModule'
  ], 
function(
  $,
  intersection,
  global,
  formMethods,
  unitObj,
  eventsModule
  ){

  var soldier = unitObj.soldier;
  var turret  = unitObj.turret;
  var artillery  = unitObj.artillery;
  var tank  = unitObj.tank;
  var units  = unitObj.units;

  function testUnit(unit) {
    if (!unit.role || unit.role != "soldier" || unit.role != "turret") {
      return false;
    }
    if (unit.health < 1 || unit.health > 100) {
      return false;
    }

  }

  for (var i in units) {
    if (typeof units[i].attack === "undefined")
      units[i].attack = true;
    if (typeof units[i].defence === "undefined")
      units[i].defence = true;
  }

  function plopUnit(unit) {
    if (global.G === null) {
      return false;
    }

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

  var gameUnit = function(game, options) {
    // soldier, turret etc.
    var self = this;

    this.position = new google.maps.LatLng(options.lat, options.lon);
    
    this.health = options.health;
    this.maxHealth = options.health;

    this.createMarker(options);

    // create path
    this.path = new google.maps.MVCArray();
    //this.path = [this.position];
    this.poly = new google.maps.Polyline({
      path: this.path,
      geodesic: true,
      strokeColor: global.mapStrokeColor,
      strokeOpacity: global.mapStrokeOpacity,
      strokeWeight: global.mapStrokeWeight
    });

    this.speed = options.speed;
    this.moving = true;
    this.mine = options.mine;

    this.power = options.power;
    this.range = options.range;

    // this controls whether or not the animation interval will ignore this unit
    this.animate = options.speed > 0;
      
    // each time a point is clicked on the map, a route is calculated from the last end position to that point.
    // this part-route is added to animSegments for processing by the animation loop
    this.animSegments = [];

    this.poly.setMap(game.map);

    return true;
  };

  gameUnit.prototype.checkEnemies = function(sessUpdate) {
    for (var i = 0; i < global.G.theirUnitsRaw.length; i++) {
      $(window).trigger('unit_attack', this, global.G.theirUnitsRaw[i]);
      
      if (global.G.theirUnitsRaw[i] === null) continue;
      var distance = google.maps.geometry.spherical.computeDistanceBetween(global.G.theirUnitsRaw[i].position, this.position);

      if (distance < this.range) {
        // stop the unit and start firing!
        //this.moving = false;

        // cancel any routes
        //this.animSegments = [];

        // attack the enemy
        this.attack(i, sessUpdate);
      }
    }

    return true;
  };

  gameUnit.prototype.attack = function(i, sessUpdate) {
    // attacks the enemy's unit i
    var currentHealth = global.G.theirUnitsRaw[i].health,
        newHealth = Math.max(0, currentHealth - this.power);

    if (newHealth === 0) {
      // unit destroyed!

      // remove marker
      global.G.theirUnitsRaw[i].marker.setMap(null);

      global.G.theirUnitsRaw[i] = null;
    }
    else {
      global.G.theirUnitsRaw[i].health = newHealth;
      global.G.theirUnitsRaw[i].updateMarker(global.G.mode === 0 ? 1 : 0);
    }
    global.G.theirUnits[i].health = newHealth;

    var otherPlayer = global.me.player === 1 ? 2 : 1;

    if (sessUpdate || 1) {
      global.fbSes.child("player" + otherPlayer.toString()).update({
        units: global.G.theirUnits,
        triggerUpdate: global.makeid(10) // this forces a change
      });
    }

    return true;
  };

  gameUnit.prototype.createMarker = function(options) {
    var mode = (options.mine ? global.G.mode : (global.G.mode === 0 ? 1 : 0));

    this.marker = new MarkerWithLabel({
      position: this.position,
      map: global.G.map,
      animation: google.maps.Animation.DROP,
      title: options.role,
      icon: {
        url: options.icon,
        scaledSize: new google.maps.Size(global.markerSizeX, global.markerSizeY),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(global.markerSizeX / 2, global.markerSizeY / 2)
      },
      labelContent: this.health.toString() + " (" +
        (mode === 0 ? "attacking" : "defending") + ")",
      labelAnchor: new google.maps.Point(8, -16),
      labelClass: "healthLabel",
      labelStyle: {
        opacity: .6,
        color: "#000",
        width: 22,
        height: 8,
        background: global.healthColor(this.health, this.maxHealth),
      }
    });

    var self = this;

    google.maps.event.addListener(this.marker, "click", function() {
      global.G.selectedUnit = self.mine ? self : null;
    });

    return true;
  };

  gameUnit.prototype.updateAnim = function() {
    if (this.speed === 0) return false;

    this.eol = this.poly.Distance();

    this.animPoly = new google.maps.Polyline({
      path: [this.poly.getPath().getAt(0)],
      strokeColor: "#0000ff",
      strokeWeight: 10
    });

    this.animate = true;

    return true;
  };

  gameUnit.prototype.updateMarker = function(mode) {
    // called when health updates
    this.marker.labelStyle.background = global.healthColor(this.health, this.maxHealth);
    this.marker.labelContent = Math.round(this.health.toString()) + " (" +
      (mode === 0 ? "attacking" : "defending") + ")";
    this.marker.label.setContent();
    this.marker.label.setStyles();
    //this.marker.label.draw();

    return true;
  };

  function addUnits() {
    //console.trace();
    global.debug("UNITS:addUnits", 2);
    var formResults = formMethods.getFormParams('#sessionParamForm');

    var attack = global.G.mode === 0, defend = !attack;

    // game mode indicator
    if (typeof global.gameModeInd != "undefined")
      global.gameModeInd.remove();
    global.gameModeInd = $("<div></div>")
      .addClass("gameMode")
      .addClass(attack ? "attack" : "defend");

    global.$d.ctrl.append(global.gameModeInd);

    global.$d.unitsList.empty();

    for (var name in units) {
      if ((attack && !units[name].attack) ||
        (defend && !units[name].defence)) continue;

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
            unit: units[name],
            type: name
          })
          .append($("<div></div>")
            .addClass("icon")
            .append($("<img></img>").attr("src", units[name].icon))
            )
          );
    }

    global.$d.unitsList.children()
    .prop("draggable", true)
    .on("mousedown", global.evDragStart)
    .on("dragend", global.evDragCancel)
    .on("touchstart", global.evDragStart)
    .on("touchcancel", global.evDragCancel)
    .on("touchend", global.evMapDrop);
   
    return true;
  }

  $(window).on('define_game', addUnits);

  return {
    plopUnit: plopUnit,
    units: units,
    testUnit: testUnit,
    gameUnit: gameUnit,
    addUnits: addUnits
  };

});
