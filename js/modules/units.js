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
    icon: "img/icon/soldier.png",
    attack: true,
    defence: true
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
    icon: "img/icon/turret_128.png",
    attack: false,
    defence: true 
  };

  var units = {
    soldier: soldier,
    turret: turret
  }

  for (var i in units) {
    if (typeof units[i].attack == "undefined")
      units[i].attack = true;
    if (typeof units[i].defence == "undefined")
      units[i].defence = true;
  }

  function plopUnit(unit) {
    if (global.G == null) {
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
    console.trace();
    global.debug("UNITS:addUnits", 2);
    var formResults = formMethods.getFormParams('#sessionParamForm');

    var attack = global.G.mode == 0, defend = !attack;

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

    return true;
  };

  $(window).on('define_game', addUnits);

  return {
    plopUnit: plopUnit,
    units: units,
    testUnit: testUnit,
    gameUnit: gameUnit,
    addUnits: addUnits
  };

});
