require([
  'jquery',
  'global',
  'policeData'
  ],
  function(
    $,
    glob,
    policeData
  ) {    
    console.log('[DEBUG][JMA] PDR Module Loaded');
    $(window).on("define_game", function(){
      console.log('[DEBUG][JMA] Mapping Markers...');
      var max = 5000;
      var pre = 0.05;
      for (var index in policeData.crime){
        var ll = index.split('x');
        var lat = ll[0];
        var lon = ll[1];
        var coords = [
          new google.maps.LatLng(parseFloat(lat+pre), parseFloat(lon+pre)),
          new google.maps.LatLng(parseFloat(lat-pre), parseFloat(lon+pre)),
          new google.maps.LatLng(parseFloat(lat-pre), parseFloat(lon-pre)),
          new google.maps.LatLng(parseFloat(lat+pre), parseFloat(lon-pre))
        ];
        // Construct the polygon.
        square = new google.maps.Polygon({
          paths: coords,
          strokeOpacity: 0,
          fillColor: '#FF0000',
          fillOpacity: ((parseFloat(policeData.crime[index])/parseFloat(max))*0.35),
          clickable: false
        });
        square.setMap(glob.G.map);
      }
    });
  });




