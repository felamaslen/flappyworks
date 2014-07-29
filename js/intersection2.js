/**
 * @file js/intersection.js
 * Copyright (c) 2014,
 * Fela, Jacob, Saul, Malachy
 */

//debugger;

/**
 * GENERIC FUNCTIONS
 */
function makeid(length) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  var length = typeof length == "undefined" ? 5 : length;

  for ( var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}
  
function debug(msg, level) {
  level = typeof level == "undefined" ? 2 : level;
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

function deleteSession(key) {
  fb.child(key).remove(function(error) {
    debug(error ? "failure while removing session (" + key + ") from FireBase"
      : "successfully removed session (" + key + ") from FireBase", 1);
  });
  return true;
}

function sizeof(obj) {
  if (typeof Object.keys == "function")
    return Object.keys(obj).length;

  var size = 0, key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) size++;
  }
  return size;
};
  
function getFormParams() {
  // get parameters
  var formParams = {};
  $.each($d.setupForm.form.serializeArray(), function(_, kv) {
    if (formParams.hasOwnProperty(kv.name)) {
      formParams[kv.name] = $.makeArray(formParams[kv.name]);
      formParams[kv.name].push(kv.value);
    }
    else {
      formParams[kv.name] = kv.value;
    }
  });

  return formParams;
}

/**
 * GAME BACKEND
 */
function game(options) {
  //this.init(options);

  return true;
}

game.prototype.init = function(options){
  return true;
};



/**
 * MAPPING BACKEND FUNCTIONS
 */
function map_init(options) {
  if (typeof options.coords != "undefined") {
    options.center = new google.maps.LatLng(options.coords[0], options.coords[1]);
    delete options.coords;
  }
  var options = $.extend({
    center: new google.maps.LatLng(54.7, -3),
    zoom: 6
  }, options);
  var map = new google.maps.Map(document.getElementById("map"), options);
}



/**
 * EVENTS
 */
// pre-game
var evSetNick = function() {
  me.name = $d.inputNickname.val();

  if (me.name != origNick) {
    $.cookie("name", me.name, { expires: 30 });
  }

  $(".nick-display").text(me.name);

  // main listener for FireBase
  fb.on("value", fbListenSuccess, fbListenError);

  view.change("viewLobby");
};

var evNewSession = function() {
  // create a new session
  if (sesId != null) {
    debug("please leave the current session before creating a new one.");
    return false;
  }
  
  var sessionName = $d.sessionName.val();

  if (!sessionName.length) {
    debug("please enter a name for the session.", 0);
    return false;
  }

  // we are the first player
  me.player = 1;

  var session = fb.push();
  session.set({
    name: sessionName,
    state: 0, // 0: waiting for players, 1: waiting for config, 2: in play
    player1: me,
    player2: null
  }, function() {
    debug("adding new session with name " + sessionName, 2);
  });

  // handle timeouts / disconnects
  session.onDisconnect().remove();

  sesId = session.path.m[1];
  $d.newSessInd.text(sessionName);
  $d.setupForm.begin.prop("disabled", true); // can't start without another player
  view.change("viewSetup");

  return true;
}

var evJoinSession = function(e) {
  // join an existing session
  var $target = $(e.target);
  if (!$target.is("button.btn-join")) return false;

  var key = $target.parent().attr("data-ind");

  if (sesId != null) {
    debug("please leave the current session before trying to join another.", 1);
    return false;
  }

  switch (lobby[key].state) {
    case 0: // awaiting players
      if (typeof lobby[key].player1 == "undefined" || typeof lobby[key].player2 != "undefined") {
        // stale session
        debug("tried to join a broken session - deleting", 1);
        deleteSession(key);
        return false;
      }

      // we are the second player
      me.player = 2;

      fb.child(key).update({
        state: 1,
        player2: me
      }).onDisconnect().update({
        state: 0,
        player2: undefined
      });

      debug("joining session with key " + key, 2);

      break;

    default:
      debug("tried to join a session which is already full.", 1);
      return false;
  }

  return true;
}

var evLeaveSession = function() {
  if (sesId == null) {
    debug("tried to leave a session when none was connected!", 1);
    return false;
  }

  if (me.player == 1) {
    deleteSession(sesId);
  }
  else {
    fb.child(sesId).update({
      state: 0,
      player2: undefined
    });
  }
  sesId = null;
  me.player = null;

  return true;
}

var evNewGame = function() {
  
  
  return true;
}

// main FireBase listener events
var fbListenSuccess = function(snapshot) {
  var val = snapshot.val();

  if (typeof val != "object" || val == null) val = {};

  lobby = val;

  // see if we are a member of any of the existing sessions
  if (sesId == null) {
    for (var key in lobby) {
      var iAmPlayer1 = typeof lobby[key].player1 != "undefined" &&
        lobby[key].player1.name == me.name,
          iAmPlayer2 = typeof lobby[key].player2 != "undefined" &&
        lobby[key].player2.name == me.name;

      if (iAmPlayer1 && iAmPlayer2) {
        // bad session - remove
        deleteSession(key);
      }
      else if (!iAmPlayer1 && !iAmPlayer2) {
        continue;
      }
      else {
        var stale = false;

        switch (lobby[key].state) {
          case 0: // waiting for players
            if ((iAmPlayer1 && typeof lobby[key].player2 != "undefined") ||
                (iAmPlayer2 && typeof lobby[key].player1 != "undefined")) {
              stale = true;
              debug("stale - zero state with extraneous player data", 2);
            }
            else {
              sesId = key;
              me.player = iAmPlayer1 ? 1 : 2;
            
              $d.newSessInd.text(sessionName);
              $d.setupForm.begin.prop("disabled", true); // can't start without another player
              view.change("viewSetup");
            }

            break;
          case 1: // waiting for config
            if (iAmPlayer1) {
              // go to config page, since we are player 1
              if (typeof lobby[key].player2 == "undefined")
                stale = true;
              else
                view.change("viewSetup");
            }
            else {
              // we are player 2, so go to the "wait for config" page
              if (typeof lobby[key].player1 == "undefined")
                stale = true;
              else
                view.change("viewWaitP1");                
            }

            if (!stale) {
              sesId = key;
              me.player = iAmPlayer1 ? 1 : 2;
              $d.setupForm.begin.prop("disabled", false);
            }
            break;
          case 2: // in play
            if (typeof lobby[key].player1 == "undefined" || typeof lobby[key].player2 == "undefined") {
              stale = true;
              debug("stale - less than two players defined for an in-play session", 2);
            }
            else {
              // start a new game
              sesId = key;
              me.player = iAmPlayer1 ? 1 : 2;
              
              startGame({
                city: lobby[key].city,
                mode: lobby[key].mode // 0: p1 is attacker, 1: p1 is defender
              });
            }

            break;
        }

        if (stale) {
          // remove offending data
          deleteSession(key);
        }
      }
    }
  }

  // reload lobby list on lobby view
  $d.sessionList.empty();

  if (!sizeof(lobby)) {
    $d.sessionList.append($("<li></li>")
        .addClass("list-group-item")
        .text(noSessionsMsg));
  }
  else {
    for (var i in lobby) {
      var players = [];
      if (typeof lobby[i].player1 != "undefined")
        players[players.length] = lobby[i].player1.name;
      if (typeof lobby[i].player2 != "undefined")
        players[players.length] = lobby[i].player2.name;

      players = players.join(", ");

      var open = lobby[i].state == 0;

      // add session to the session list in the lobby
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
          .prop("disabled", !open)
          .text("Join")
        )
      );

      if (sesId == i) {
        // scan for changes
        if (me.player == 1) {
          if (listenLast.state == 0 && lobby[i].state == 1) {
            // someone joined!
            $d.setupForm.begin.prop("disabled", false);
          }
          else if (listenLast.state == 1 && lobby[i].state == 0) {
            // player 2 left!
            $d.setupForm.begin.prop("disabled", true);
            alert("Player 2 left the game!");
          }
        }
      }
    }
  }

  listenLast = {
    sesId: sesId,
    state: typeof lobby[sesId] == "undefined" ? null : lobby[sesId].state
  };

  return true;
}

var fbListenError = function(errorObject) {
  debug("error on FireBase listen: " + errorObject.code, 0);

  return true;
}



/**
 * GLOBAL VARIABLES
 */
var
  me = {
    name: "player-" + makeid(),
    balance: 2000,
    player: null // becomes 1 or 2 when joining / creating session
  },
  $d = {}, // dom objects
  G = null, // game object
  
  sesId = null,
  lobby = [],
  fb = new Firebase("https://interception.firebaseio.com/sessions"),

  listenLast = { // what things were on the last listen
    sesId: null,
    state: null
  },

  cities = [
    {
      name: "London",
      coords: [51.514756, -0.125631],
      zoom: 10,
      balance: 2515202
    },
    {
      name: "Plymouth",
      coords: [50.375935, -4.143126],
      zoom: 12,
      balance: 2568000
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
  noSessionsMsg = "There are no open sessions - why not create one?" 
; 


/**
 * onload
 */
var nickCookie = typeof $.cookie("name") != "undefined";
if (nickCookie) me.name = $.cookie("name");
var origNick = me.name;

$(document).ready(function(){
  // initialise views
  view.current = $(".viewDefault").attr("id");
  $(".view").addClass("viewHidden");
  $(".viewDefault").removeClass("viewHidden");

  // DOM elements
  $d.ctrl = $("#ctrl").children(".inside"); // game items
  $d.sessionList = $("#sessionList"); // lobby
  $d.sessionName = $("#sessionName"); // session name input in new session section
  $d.newSessInd = $("#newSessInd");
  $d.inputNickname = $("#inputNickname");
  $d.inputNickname.val(me.name);

  // FORMS
  // session form
  $d.sessionName.val("newsess-" + makeid());
  // setup form
  $d.setupForm = {
    form:   $("#sessionParamForm"),
    cities: $("#citySelect"),
    mode:   $(".inputMode"),
    begin:  $("#beginGame")
  };

  // populate the list of cities
  for (var i = 0; i < cities.length; i++) {
    $d.setupForm.cities.append($("<option></option>")
      .text(cities[i].name)
      .attr("value", i)
    );
  }

  // attach events
  $("#btnSetNick").on("click", evSetNick);
  $("#btnSetSessName").on("click", evNewSession);
  $d.sessionList.on("click", evJoinSession);
  $d.setupForm.form.on("submit", function() { return false; });
  $d.setupForm.begin.on("click", evNewGame);
});



