/**
 * @file js/modules/uiMessages.js
 */

define([
  'jquery',
  'global'
],
function(
          $,
          global
          ){
          
  this.modalDialog = function(msg) {
    $("#dialog-modal-background").show();    
    $("#dialog-message-text").html(msg);    
    okButton = $('<button id="dialog-message-button" class="btn btn-default">OK</button>').on('click', function() { $("#dialog-modal-background").hide() });
    $("#dialog-message-button-container").replaceWith(okButton);
    
  }
  
  this.slideUpDialog = function(msg) {
    $("#slideup-message").effect('slide', { direction: 'up', mode: 'show' }, 500);
    $("#slideup-message-text").html(msg);    
  }
  
return this;
});
