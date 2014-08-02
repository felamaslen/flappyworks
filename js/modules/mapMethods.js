define([
  'jquery',
  'global',
  'units',
  'google',
],
  function($, global, units, google) {
    var mapMethods = function( window ){

        this.window = window;

    };

    mapMethods.prototype = {
      drawCircle: function(point, radius, dir) {
        var d2r = Math.PI / 180,
            r2d = 1 / d2r,
            earthRadius = 6371000,
            points = 50,

            rlat = (radius / earthRadius) * r2d,
            rlng = rlat / Math.cos(point.lat() * d2r),

            extp = [],
            start = 0,
            end = points * dir;

        for (var i = start; (dir > 0 ? i < end : i > end); i += dir) {
          var theta = Math.PI * (i / points * 2);
          ey = point.lng() + (rlng * Math.cos(theta));
          ex = point.lat() + (rlat * Math.sin(theta));
          extp.push(new google.maps.LatLng(ex, ey));
        }

        extp.push(extp[0]);

        return extp;
      },

      addCityLimit: function() {
        // add limit to the city to show where units can be added
        global.G.defenceCircle = new google.maps.Circle({
          strokeColor: global.defenceRadiusColor,
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: global.defenceRadiusColor,
          fillOpacity: 0.35,
          map: global.G.map,
          center: global.G.cityCenter,
          radius: global.G.city.radius[0]
        });
        
        var giant = [
          new google.maps.LatLng(0, -90),
          new google.maps.LatLng(0, 90),
          new google.maps.LatLng(90, -90),
          new google.maps.LatLng(90, 90)
        ];

        global.G.attackCircle = new google.maps.Polygon({
          paths: [
            //this.drawCircle(global.G.cityCenter, global.G.city.radius[1] * 100, 1),
            giant,
            this.drawCircle(global.G.cityCenter, global.G.city.radius[1], -1)
          ],
          strokeColor: global.attackRadiusColor,
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: global.attackRadiusColor,
          fillOpacity: 0.35,
          map: global.G.map,
          //center: global.G.cityCenter,
          //radius: global.G.city.radius[0]
        });
      },

      removeCityLimit: function() {
        // remove city limit from display
        global.G.defenceCircle.setMap(null);
        global.G.attackCircle.setMap(null);

        return true;
      },

      withinCityLimit: function(latLng) {
        // determines whether or not a given position is within the allowed limits
        var distance = google.maps.geometry.spherical.computeDistanceBetween(latLng, global.G.cityCenter);

        return (global.G.mode == 0 && distance > global.G.city.radius[1])
          || (global.G.mode == 1 && distance < global.G.city.radius[0]);
      }
    };

    return mapMethods;
  }
);
