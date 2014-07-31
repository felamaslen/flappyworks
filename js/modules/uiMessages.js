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
    $("#dialog-message-text").replaceWith(msg);
  }
return this;
});
