var view = {};
view.current = "";
view.event = {};
view.event.change = {};
view.event.change.listeners = [];
// Add a listener for the view change event
view.event.change.addListener = function(listener){
  view.event.change.listeners.push(listener);
}
// Trigger the change event 
view.event.change.trigger = function(newView){
  for(var i in view.event.change.listeners){
    if (!newView){
      newView = "Unknown";
    }
    var e = {}
    e.newView = newView;
    view.event.change.listeners[i](e);
  }
}
view.change = function(newView){
  view.current = newView;
  $(".view").addClass("viewHidden");
  $('#'+newView).removeClass("viewHidden");
  view.event.change.trigger(newView);
}

// removed the document.ready section and placed it in js/intersection.js. Was causing problems here.
