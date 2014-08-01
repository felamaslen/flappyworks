/*
 * @file js/modules/anim.js
 */

define([
  'global',
  'units'
],
  function(global, units) {
    var anim = function(window) {
      this.window = window;

      //this.init();
    };

    anim.prototype = {
      gameAnimWrapper: function() {
        // this gets called very frequently (make it light in other words)
        global.animCounter++;

        if (global.G == null || global.G.units.length === 0) return false;

        /*
         * properties:
         *
         * marker: google maps marker
         * path: path array
         * poly: google maps polyLine
         * position: google maps latLng
         */

        for (var i = 0; i < global.G.units.length; i++) {
          if (!global.G.units[i].moving ||
              global.G.units[i].animSegments.length == 0) continue;

          var unit = global.G.units[i];

          unit.animSegments[0].steps++;
          
          //console.log("animating marker...");
         
          var seg = unit.animSegments[0];

          var d = seg.step * seg.steps * global.animTime;

          if (d > seg.eol) {
            // finished this segment
            unit.marker.setPosition(seg.endLoc.latlng);
            unit.animSegments.shift();
            
            return;
          }

          unit.position = seg.poly1.GetPointAtDistance(d);
          unit.marker.setPosition(unit.position);
          global.anim.updatePoly(seg.step, i);

          global.G.myUnits[i].lat = unit.position.lat();
          global.G.myUnits[i].lon = unit.position.lng();

          // checks if enemies are nearby
          unit.checkEnemies();
        }

        if ((global.animCounter + 2) % 50 === 0 && !global.devMode) {
          // every X frames, update the session with the current positions,
          // and fetch updates of the opponent's units from the server
          
          // this triggers a check for updates on the next session change
          //global.sessionUpdatePositions = true;
       
          //global.debug("updating playerChild units");
          global.playerChild.update({
            units: global.G.myUnits,
            triggerUpdate: global.makeid(10), // this forces a change
          });
        }

        return true;
      },
      updatePoly: function(d, i) {
        var
          poly1 = global.G.units[i].animSegments[0].poly1,
          poly2 = global.G.units[i].animSegments[0].poly2,
          last  = 1,
          end   = global.G.units[i].animSegments[0].endLoc.latlng;
        
        // 20 is the buffer for the animation poly (to speed things up)
        if (poly2.getPath().getLength() > 20) {
          console.log("new poly2");
          poly2 = new google.maps.Polyline([poly1.getPath().getAt(last - 1)]);
        }

        if (poly1.GetIndexAtDistance(d) < last + 2) {
          if (poly2.getPath().getLength() > 1) {
            poly2.getPath().removeAt(poly2.getPath().getLength() - 1);
          }
          poly2.getPath().insertAt(poly2.getPath().getLength(), poly1.GetPointAtDistance(d));
        }
        else {
          poly2.getPath().insertAt(poly2.getPath().getLength(), end);
        }
      }
    };

    return anim;
  }
);
