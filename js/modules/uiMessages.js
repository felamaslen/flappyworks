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
    $("#dialog-message-button-container").html(okButton);
    
  }
  
  this.slideUpDialog = function(msg) {
    $("#slideup-message").slideDown();
    $("#slideup-message-text").html(msg + " ");
    okLink = $('<a href="#">ok</a>').on('click', function() { $("#slideup-message").slideUp(); });
    $("#slideup-message-text").append(okLink);
  }
  
return this;
});
