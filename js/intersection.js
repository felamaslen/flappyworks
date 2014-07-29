/**
 * @file js/intersection.js
 * Copyright (c) 2014,
 * Fela, Jacob, Saul, Malachy
 */

// start dummy game
var dummy = true;

(function($){
  function map_init() {
    var options = {
      center: new google.maps.LatLng(54.7, -3),
      zoom: 6
    };
    var map = new google.maps.Map(document.getElementById("map"), options);
  }

  function debug_log(msg, level) {
    switch (level) {
      case 0: // error
        alert("Fatal error: " + msg);
        window.console && console.log("[FATAL]", msg);
        break;
      case 1: // warning
        window.console && console.log("[WARN]", msg);
        break;
      case 2: // debug
        window.console && console.log("[DEBUG]", msg);
        break;
    }

    return true;
  }

  function game(options) {
    //this.init(options);

    return true;
  }

  game.prototype.init = function(options){
    return true;
  };

  function start_game() {
    G = new game();

    view.change("game");
    
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
    
    // start new server section
    $d.sns = $("#section-start-new-server");

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

    map_init();

    return true;
  }

  function makeid(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    var length = typeof length == "undefined" ? 5 : length;

    for ( var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
  }

  function new_session(options) {
    // main function for creating a new session
    if (G != null) return false;
    
    if (!options.name.length) {
      debug_log("please enter a name for the session.", 0);
      return false;
    }
    
    var hash = makeid(40);

    var newSessionRef = fb.push();
    newSessionRef.set({
      hash: hash,
      name: options.name,
      state: 0,
      player1: me,
      player2: null
    }, function(){
      debug_log("added new session with name " + name, 2);
      get_sessions(function(){
        var ind = null;
        for (var i = 0; i < lobby.length; i++) {
          if (lobby[i].hash == hash) {
            ind = i;
            break;
          }
        }

        if (ind == null) {
          debug_log("unknown error while adding session; couldn't join", 0);
          return false;
        }

        return true;
      });
    });
    
    return true;
  }

  function join_session(ind) {
    // main function for joining an existing session
    if (G != null) return false;

    var session = fb.child(lobby[ind].uid);
    
    session.update({
      "player2": me,
      "state": 1
    }, function() {
      debug_log("starting game...", 2);
      start_game(ind);
    });

    return true;
  }

  function update_lobby_list() {
    $d.sessionList.empty();

    if (!lobby.length) {
      $d.sessionList.append($("<li></li>")
        .addClass("list-group-item")
        .text("There are no open sessions - why not create one?")
      );
    }
    else {
      for (var i = 0; i < lobby.length; i++) {
        var players = [];
        if (typeof lobby[i].player1 == "object") {
          players[players.length] = lobby[i].player1.nickname;
        }
        if (typeof lobby[i].player2 == "object") {
          players[players.length] = lobby[i].player2.nickname;
        }

        players = players.join(", ");

        var open = lobby[i].state == 0;
        var myOwn = false;

        // make sure you can't (re-)join your own game
        if (lobby[i].player1.nickname == me.nickname) {
          myOwn = true;
        }

        $d.sessionList.append($("<li></li>")
          .addClass("list-group-item")
          .addClass("session-item")
          .toggleClass("accepting", open)
          .append($("<span></span>")
            .addClass("name")
            .text(lobby[i].name)
          )
          .attr("data-ind", i.toString())
          .append($("<span></span>")
            .addClass("status")
            .text("Players: " + players)
          )
          .append($("<button></button>")
            .addClass("btn")
            .addClass("btn-xs")
            .addClass("btn-primary")
            .addClass("btn-join")
            .prop("disabled", !open || myOwn)
            .text("Join")
          )
        );
      }
    }
    return true;
  }

  function get_sessions(callback) {
    if (G != null) return false;
    lobby = [];

    fb.on("value", function (snapshot) {
      var sessions = snapshot.val();

      var k = 0, ind = null;
      for (var i in sessions) {
        lobby[k] = sessions[i];
        lobby[k].uid = i;

        if (lobby[k].player1.nickname == me.nickname) {
          // this is our session
          ind = k;
        }

        k++;
      }

      update_lobby_list();

      if (typeof callback == "function") callback();
  
      if (ind != null) {
        // if someone's already joined the game, let's start it
        if (lobby[ind].state == 1) {
          debug_log("session started; starting game!", 2);
          start_game(ind);
        }
        
        var session = fb.child(lobby[ind].uid);

        session.on("child_changed", function(snapshot) {
          if (snapshot.val() == "1") {
            // someone joined the game, let's join it too!
            
            debug_log("someone joined the session; starting game!", 2);
            start_game(ind);
          }
        });
      }

      return true;
    }, function (errorObject) {
      debug_log('The read failed: ' + errorObject.code, 0);

      update_lobby_list();
    });

    return true;
  }
  
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

    G = null, // this becomes the game

    me = {
      nickname: "player-" + makeid(),
      balance: 2000 // bank balance
    },

    // Main Firebase object
    fb = new Firebase("https://interception.firebaseio.com"),

    lobby = []
  ;

  var straightToLobby = typeof $.cookie("nickname") != "undefined";

  if (straightToLobby) me.nickname = $.cookie("nickname");

  $(document).ready(function(){
    $d.ctrl = $("#ctrl").children(".inside");

    // session list in lobby
    $d.sessionList = $("#sessionList");

    // session name button in new session section
    $d.sessionName = $("#sessionName");

    // handle nickname stuff
    $d.inputNickname = $("#inputNickname");
    $d.inputNickname.val(me.nickname);

    var origRandNick = $d.inputNickname.val();

    $("#btnSetNick").on("click", function(){
      me.nickname = $d.inputNickname.val();
      
      if (me.nickname != origRandNick) {
        $.cookie("nickname", me.nickname, { expires: 30 });
      }

      $(".nick-display").text(me.nickname);

      view.change("viewLobby");
    });

    // load open sessions from Firebase
    get_sessions();

    view.current = $(".viewDefault").attr("id");
    $(".view").addClass("viewHidden");
    $(".viewDefault").removeClass("viewHidden");

    if (straightToLobby) {
      $(".nick-display").text(me.nickname);

      view.change("viewLobby");
    }

    $d.sessionName.val("newsess-" + makeid());

    $("#btnNewSession").on("click", function(){
      var name = $d.sessionName.val();

      new_session({ name: name });

      return true;
    });

    $d.sessionList.on("click", function(e) {
      var $target = $(e.target);

      if (!$target.is("button.btn-join")) return false;

      var ind = parseInt($target.parent().attr("data-ind"));

      join_session(ind);

      return true;
    });

  });
})(jQuery);

