define([
  'jquery'  
],
function(
  $
) {

  var EventsModule = function( window ){

      this.window = window;
      this.init( window );

  };

  EventsModule.prototype = {

      constructor: EventsModule,

      init: function( window ){

          this.eventHandlers();
          this.trigger( 'hi', { h: 'test' } );

      },

      eventHandlers: function(){

        this.bind( 'hi', this.stuff );

      },

      stuff: function(){

        console.log('hi');

      }

  };

  MicroEvent.mixin( EventsModule );

  return new EventsModule();

});
