var view = {};
view.current = "";
view.change = function(newView){
  view.current = newView;
  $(".view").each(function(index) {
    if (!($(this).hasClass("viewHidden"))){
      $(this).addClass("viewHidden");
    }
  });
  $('#'+newView).removeClass("viewHidden");
}
$(document).ready(function(){
  view.current = $('.viewDefualt')[0].id;
  $(".view").each(function(index) {
    if (!($(this).hasClass("viewHidden"))){
      $(this).addClass("viewHidden");
    }
  });
  $('.viewDefualt').removeClass("viewHidden");
});