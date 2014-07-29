/**
 * @file js/intersection.js
 * Copyright (c) 2014,
 * Fela, Jacob, Saul, Malachy
 */

/**
 * GLOBAL VARIABLES
 */
var me = {
      nickname: "player-" + makeid(),
      balance: 2000,
      player: null // becomes 1 or 2 when joining / creating session
    },
    $d = {}, // dom objects
    G = null, // game object
    
    sessId = null,
    lobby = [],
    fb = new Firebase("https://interception.firebaseio.com")
;

/**
 * CONFIG
 */
var
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
  ]
; 

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
  me.nickname = $d.inputNickname.val();

  if (me.nickname != origNick) {
    $.cookie("nickname", me.nickname, { expires: 30 });
  }

  $(".nick-display").text(me.nickname);

  view.change("viewLobby");
};

var evNewSession = function() {
  // create a new session
  if (sessId != null) return false;
  
  var sessionName = $d.sessionName.val();

  if (!sessionName.length) {
    debug_log("please enter a name for the session.", 0);
    return false;
  }

  var sessionHash = makeid(40);

  // we are the first player
  me.player = 1;

  var session = fb.push();
  session.set({
    hash: sessionHash,
    name: sessionName,
    state: 0, // 0: waiting for players, 1: waiting for config, 2: in play
    player1: me,
    player2: null
  }, function() {
    debug_log("adding new session with name " + sessionName, 2);
  });

  $d.newSessInd.text(sessionName);
  $d.beginGame.prop("disabled", true); // can't start without another player
  view.change("viewSetup");

  return true;
}

/**
 * onload
 */
var nickCookie = typeof $.cookie("nickname") != "undefined";
if (nickCookie) me.nickname = $.cookie("nickname");
var origNick = me.nickname;

$(document).ready(function(){
  // initialise views
  view.current = $(".viewDefault").attr("id");
  $(".view").addClass("viewHidden");
  $(".viewDefault").removeClass("viewHidden");

  // DOM elements
  $d.ctrl = $("#ctrl").children(".inside"); // game items
  $d.sessionList = $("#sessionList"); // lobby
  $d.sessionName = $("#sessionName"); // session name input in new session section
  $d.inputNickname = $("#inputNickname");
  $d.inputNickName.val(me.nickname);

  // FORMS
  // session form
  $d.sessionName.val("newsess-" + makeid());
  // setup form
  $d.setupForm = {
    form:   $("#sessionParamForm"),
    cities: $("#citySelect"),
    mode:   $(".inputMode")
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
  $("#beginGame").on("click", evNewGame);

  // main listener for FireBase
  fb.on("value", fb_listen_success, fb_listen_error);
});

