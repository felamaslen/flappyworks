﻿define([
  'jquery',
  'firebase'
],
function(
  $,
  firebase
) {

  var Admin = function( window ){

      this.window = window;
      this.init( window );

  };

  Admin.prototype = {

      constructor: Admin,

      init: function( window ){

          this.fb = new Firebase("https://interception.firebaseio.com/sessions");
          this.eventHandlers();

      },

      eventHandlers: function(){

          this.fb.on('value', $.proxy( this.firebaseCallback, this ) );

          $('body').on( 'click', '.removeItem', $.proxy( this.killLobby, this ) );

      },

      firebaseCallback: function( snapshot ){

          var dataObj = snapshot.val();

          $('.data').html('');

          if ( dataObj === null ) { return false; }

          $.each( dataObj, function( data, index ){

              $('.data').append( '<li>' + index.name + ' - <button class="removeItem" data-ref="'+ data +'" >Remove Me!</button> </li>' );

          });

      },

      killLobby: function( event ){

          var ref = $(event.target).data('ref');

          toDie = new Firebase('https://interception.firebaseio.com/sessions'+ref)

          toDie.set( null, function( data ){
                  console.log( data );
          } );

      }

  };

  return Admin;

});
