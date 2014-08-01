/**
 * @file js/modules/view.js
 */

define([
  'global'
],
  function(global) {
    var view = function(window) {
      this.window = window;

      this.init();
    };

    view.prototype = {
      init: function() {
        var self = this;

        this.current = "";
        this.event = {};
        this.event.change = {};
        this.event.change.listeners = [];

        this.event.change.addListener = function(listener){
          self.event.change.listeners.push(listener);
        }

        // Trigger the change event 
        this.event.change.trigger = function(newView){
          for(var i in self.event.change.listeners){
            if (!newView){
              newView = "Unknown";
            }
            var e = {}
            e.newView = newView;
            self.event.change.listeners[i](e);
          }
        }

        this.change = function(newView){
          self.current = newView;
          $(".view").addClass("viewHidden");
          $('#'+newView).removeClass("viewHidden");
          self.event.change.trigger(newView);
          $(window).trigger('viewChange', newView);
        }

        return true;
      }
    };

    return view;
  }
);
