define([
  'jquery',
  'microevents'
],
function(
  $,
  MicroEvent
) {

  var EventsModule = function( window ){

      this.window = window;
      this.init( window );

  };

  EventsModule.prototype = {

      constructor: EventsModule,

      EVENTS: {
        enemyUnitDestroyed: 'enemy_unit_destroyed',
        unitDestroyed: 'unit_destroyed'
      },

      init: function( window ){

          this.eventHandlers();

      },

      eventHandlers: function(){

        this.bind( this.EVENTS.enemyUnitDestroyed, this.enemyUnitDestroyed );
        this.bind( this.EVENTS.unitDestroyed, this.unitDestroyed );

      },

      enemyUnitDestroyed: function(e){
        var global = e.glob;
        var unit = e.unit;
        var smoke = new google.maps.Marker({
          position: new google.maps.LatLng(unit.lat, unit.lon),
          map: global.G.map,
          icon: 'img/icon/smoke.png'
        });
        var tm = function(smoke){smoke.setMap(null)};
        setTimeout(function(){tm(smoke)},2000);
      },
      
      unitDestroyed: function(e){
        var global = e.glob;
        var unit = e.unit;
        var smoke = new google.maps.Marker({
          position: new google.maps.LatLng(unit.lat, unit.lon),
          map: global.G.map,
          icon: 'img/icon/smoke.png'
        });
        var tm = function(smoke){smoke.setMap(null)};
        setTimeout(function(){tm(smoke)},2000);
      }
      
  };

  MicroEvent.mixin( EventsModule );

  return new EventsModule();

});
