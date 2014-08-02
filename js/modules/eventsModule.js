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

      init: function( window ){

          this.eventHandlers();

          this.trigger( 'test:event', { h: 'test' } );

      },

      eventHandlers: function(){

        this.bind( 'test:event', this.stuff );

      },

      stuff: function( event ){

        console.log( 'EventsModule::EventsModule', event );

      }

  };

  MicroEvent.mixin( EventsModule );

  return new EventsModule();

});
