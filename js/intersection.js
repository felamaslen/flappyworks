/**
 * @file js/intersection.js
 * Copyright (c) 2014,
 * Fela, Jacob, Saul, Malachy
 */

(function($){
  function map_init() {
    var options = {
      center: new google.maps.LatLng(54.7, -3),
      zoom: 6
    };
    var map = new google.maps.Map(document.getElementById("map"), options);
  }
  google.maps.event.addDomListener(window, 'load', map_init);

  $(document).ready(function(){
    
  });
})(jQuery);
