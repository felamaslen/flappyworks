var view = {};
view.current = "";
view.change = function(newView){
  view.current = newView;
  $(".view").each(function(index) {
    $(this).css('display','none');
  });
  $('#'+newView).css('display','block');
}