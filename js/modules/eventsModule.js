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
        UNIT_HIT: 'UNIT::HIT',
        UNIT_ATTACK: 'UNIT::ATTACK'
      },

      init: function( window ){

          this.eventHandlers();

          this.trigger( this.EVENTS.UNIT_HIT , { h: 'test' } );

      },

      eventHandlers: function(){

        this.bind( this.EVENTS.UNIT_HIT, this.stuff );

      },

      stuff: function( event ){

        console.log( 'EventsModule::unit:event', event );

      }

  };

  MicroEvent.mixin( EventsModule );

  return new EventsModule();

});
