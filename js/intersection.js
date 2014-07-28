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
  //google.maps.event.addDomListener(window, 'load', map_init);
  
  function server(options) {
    return true;
  }

  server.prototype.init = function(){
    return true;
  };

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
        projS: .5, // projectiles per second
        speed: 10,
        cost: 1000
      },
      {
        name: "Turret",
        class: "turret",
        projS: 10,
        speed: 0,
        cost: 1500
      }
    ],

    $d = {},

    // firebase
    fb = new Firebase("https://interception.firebaseio.com"),

    lobby = []
  ;

  function update_lobby_list() {
    $d.sessionList.empty();

    if (!lobby.length) {
      $d.sessionList.append($("<li></li>")
        .addClass("list-group-item")
        .text("There are no sessions, or an error occurred. :(")
      );
    }
    else {
      for (var i = 0; i < lobby.length; i++) {
        $d.sessionList.append($("<li></li>")
          .addClass("list-group-item")
          .text(lobby[i].name)
          .attr("data-hash", lobby[i].hash)
        );
      }
    }
    return true;
  }

  function get_sessions() {
    lobby = [];

    fb.on("value", function (snapshot) {
      var sessions = snapshot.val();

      for (var name in sessions) {
        lobby[lobby.length] = {
          name: name,
          hash: sessions[name]
        };
      }

      update_lobby_list();
    }, function (errorObject) {
      console.log('[ERROR] The read failed: ' + errorObject.code);

      update_lobby_list();
    });

    return true;
  }

  $(document).ready(function(){
    $d.ctrl = $("#ctrl").children(".inside");

    // start new server section
    $d.sns = $("#section-start-new-server");

    // session list
    $d.sessionList = $("#sessionList");

    get_sessions();

    return false;

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
    $d.sns.append($lc);

    // switch modes area
    var $sm = $("<div></div>"),
        $sm_form = $("<form></form>"),
        $sm_defend = $("<input></input>")
          .attr({ type: "radio", name: "mode", title: "Defend", value: "defend" })
          .select()
        $sm_attack = $("<input></input>")
          .attr({ type: "radio", name: "mode", title: "Attack", value: "attack" });

    $sm_attack.val(['defend']);
    $sm_defend.val(['defend']);

    $sm_form
      .append($sm_defend)
      .append("<span>Defend</span>")
      .append("<br>")
      .append($sm_attack)
      .append("<span>Attack</span>");
    $sm.append($sm_form);
    $d.sns.append($sm);

    // name of server
    var $ns = $("<div></div>"),
        $ns_ip = $("<input></input>");

    $ns.append($("<span></span>").text("Server name: "))
      .append($ns_ip);

    $d.sns.append($ns);

    var $go_btn = $("<button></button>").text("Start new server");

    $d.ctrl.append($go_btn);

    // make and populate assets list
    var $sl = $("<div></div>"),
        $sl_ul = $("<ul></ul>").addClass("assets");

    for (var i = 0; i < assets.length; i++) {
      var $li = $("<li></li>")
        .attr("class", "asset")
        .append($("<span></span>").attr("class", "name").text(assets[i].name))
        .append($("<span></span>").attr("class", "cost")
          .html("&pound;" + assets[i].cost));

      $sl_ul.append($li);
    }

    $sl.append($sl_ul);
    $d.ctrl.append($sl);
  });
})(jQuery);

