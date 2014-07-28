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

  var
    cities = [
      /*
      {
        name: "London",
        coord: [51.514756, -0.125631]
      },
      //*/
      {
        name: "Plymouth",
        coord: [50.375935, -4.143126]
      }
    ],
    assets = [ // weapons / soldiers / etc.
      {
        name: "Soldier",
        class: "soldier",
        power: 100,
        speed: 10
      },
      {
        name: "Turret",
        class: "turret",
        power: 10000,
        speed: 0
      }
    ],

    $d = {}
  ;

  $(document).ready(function(){
    $d.ctrl = $("#ctrl").children(".inside");

    // make and populate the list of cities
    var $lc = $("<div></div>"),
        $lc_select = $("<select></select>").append($("<option></option>")
          .prop("selected", true)
          .text("Select a city..."))
    for (var i = 0; i < cities.length; i++) {
      $lc_select.append($("<option></option>")
        .text(cities[i].name)
      );
    }
    
    $lc.append($lc_select);
    $d.ctrl.append($lc);

    // switch modes area
    var $sm = $("<div></div>"),
        $sm_form = $("<form></form>"),
        $sm_defend = $("<input></input>")
          .attr({ type: "radio", name: "mode", title: "Defend" })
          .select()
        $sm_attack = $("<input></input>")
          .attr({ type: "radio", name: "mode", title: "Attack" });

    $sm_form
      .append($sm_defend)
      .append("<span>Defend</span>")
      .append("<br>")
      .append($sm_attack)
      .append("<span>Attack</span>");
    $sm.append($sm_form);
    $d.ctrl.append($sm);

    var $go_btn = $("<button></button>").text("Play!");

    $d.ctrl.append($go_btn);


    // make and populate soldiers list
    var $sl = $("<div></div>"),
        $sl_ul = $("<ul></ul>");
  });
})(jQuery);

