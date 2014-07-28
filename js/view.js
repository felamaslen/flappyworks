var view = {};
view.current = "";
view.change = function(newView){
  view.current = newView;
  $(".view").addClass("viewHidden");
  $('#'+newView).removeClass("viewHidden");
}

// removed the document.ready section and placed it in js/intersection.js. Was causing problems here.
