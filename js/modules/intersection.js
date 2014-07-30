/**
 * @file js/intersection.js
 * Copyright (c) 2014,
 * Fela, Jacob, Saul, Malachy
 */

//debugger;

/**
 * GENERIC FUNCTIONS
 */

define([
        'jquery',
        'firebase',
        'jquerycookie',

        'admin'
    ],
    function(
        $,
        firebase,
        jquerycookie,

        Admin
    ) {


      // Basic page module loading - refactor
      if (  window.location.pathname.indexOf( 'admin' ) === 1 ) {

        var admin = new Admin( window );

      };

      // Refactor into AMD

        var view = {};

        view.current = "";
        
        view.event = {};
        
        view.event.change = {};
        
        view.event.change.listeners = [];
        // Add a listener for the view change event
        
        view.event.change.addListener = function(listener){
          view.event.change.listeners.push(listener);
        }

        // Trigger the change event 
        view.event.change.trigger = function(newView){
          for(var i in view.event.change.listeners){
            if (!newView){
              newView = "Unknown";
            }
            var e = {}
            e.newView = newView;
            view.event.change.listeners[i](e);
          }
        }

        view.change = function(newView){
          view.current = newView;
          $(".view").addClass("viewHidden");
          $('#'+newView).removeClass("viewHidden");
          view.event.change.trigger(newView);
        }

        // Refactor into AMD


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
        //this.init(options);
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
        this.city = cities[options.city];
        this.mode = me.player == 1 ? options.mode : (options.mode == 0 ? 1 : 0);

        if (typeof this.city.balance == "number" && this.mode == 1)
          me.balance = this.city.balance;

        this.init();

        return true;
      }

      game.prototype.init = function(options){
        // change to the appropriate view
        view.change("viewGame");

        // render map
        this.map_init();

        $.trigger('game_init', [this]);

        return true;
      };

      game.prototype.map_init = function() {
        var opt = {
          center: new google.maps.LatLng(this.city.coords[0], this.city.coords[1]),
          zoom: this.city.zoom,
          mapTypeId: google.maps.MapTypeId.HYBRID,
          mapTypeControlOptions: {
            mapTypeIds: [google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.HYBRID,
              google.maps.MapTypeId.SATELLITE]
          },
          draggable: true,
          draggableCursor: "crosshair"
        };

        this.map = new google.maps.Map(document.getElementById("map"), opt);

        $.trigger('map_init', [this]);
        
        return true;
      }

      function startGame(options) {
        G = new game(options);
        
        return true;
      }

      /**
       * MAPPING BACKEND FUNCTIONS
       */


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

            var con = fb.child(key);

            con.update({
              state: 1,
              player2: me
            })
          
            con.onDisconnect().update({
              state: 0,
              player2: null
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

      var evNewGame = function(e) {
        e.preventDefault();

        if (sesId == null) {
          debug("tried to create a game before joining a session!", 1);
          return false;
        }

        if (lobby[sesId].state == 0) {
          debug("tried to create a game before player 2 arrived!", 1);
          return false;
        }

        // validate parameters
        var city = parseInt($d.setupForm.cities.val()),
            mode = parseInt($d.setupForm.mode.filter(":checked").val());

        var errors = [];
        if (isNaN(city))  errors[errors.length] = "you must select a city";
        if (isNaN(mode))  errors[errors.length] = "you must select a mode";

        if (errors.length > 0) {
          debug(errors.join("; "), 0);
          return false;
        }
        
        // start the game!
        fb.child(sesId).update({
          city: city,
          mode: mode,
          state: 2
        });

        startGame({
          city: city,
          mode: mode
        });
        
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
            if (typeof lobby[i].player1 == "undefined") {
              deleteSession(i);
              break;
            }

            var players = [];
            
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
                  $d.setupForm.begin.prop("disabled", true);
                }
                else if (listenLast.state == 2 && lobby[i].state < 2) {
                  // player 2 left (or timed out)!
                  deleteSession(sesId);
                  view.change("viewLobby");
                  debug("We lost player 2!", 0);
                  sesId = null;
                  me.player = null;
                }
              }
              else if (me.player == 2) {
                if (listenLast.state > lobby[i].state) {
                  // player 1 left (or timed out)!
                  deleteSession(sesId);
                  view.change("viewLobby");
                  debug("We lost player 1!", 0);
                  sesId = null;
                  me.player = null;
                }
                else if (listenLast.state < 2 && lobby[i].state == 2) {
                  // game started by player 1
                  debug("game started by player 1 - joining", 2);

                  startGame({
                    city: lobby[i].city,
                    mode: lobby[i].mode // 0: p1 is attacker, 1: p1 is defender
                  });
                }
              }
            }
          }
        }
        
        if (me.player == 2 && sesId != null && typeof lobby[sesId] == "undefined") {
          view.change("viewLobby");
          sesId = null;
          me.player = null;
          debug("player 1 left!", 0);
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
        $d.setupForm.begin.on("click", evNewGame);

        $(window).trigger('doc_ready');
      });

});
