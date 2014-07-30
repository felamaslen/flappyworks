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
        //'temp-global',

        'admin',
        'global',

        'mapstuff_fela'
    ],
    function(
        $,
        firebase,
        jquerycookie,
        //global,

        Admin,
        global,

        mapstuff_fela
    ) {


      // Basic page module loading - refactor
      if (  window.location.pathname.indexOf( 'admin' ) === 1 ) {

        var admin = new Admin( window );

      };

      var mapstuff = new mapstuff_fela( window );

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

      function deleteSession(key) {
        //this.init(options);
        global.fb.child(key).remove(function(error) {
         global.debug(error ? "failure while removing session (" + key + ") from FireBase"
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
        $.each(global.$d.setupForm.form.serializeArray(), function(_, kv) {
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
        this.city = global.cities[options.city];
        this.mode = global.me.player == 1 ? options.mode : (options.mode == 0 ? 1 : 0);

        if (typeof this.city.balance == "number" && this.mode == 1)
          global.me.balance = this.city.balance;
          $(window).on('budgetUpdate', function (e) { 
          $('#balanceDisplay').html(global.me.balance);
          } );
          $(window).trigger('budgetUpdate');     

        this.init();

        return true;
      }

      game.prototype.init = function(options){
        // change to the appropriate view
        
        view.change("viewGame");

        $(window).trigger('game_init_start', [this]);

        // render map
        this.map_init();

        $(window).trigger('game_init_end', [this]);

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

        $(window).trigger('map_init', [this]);
        
        return true;
      }

      function startGame(options) {
        global.G = G = new game(options);

        $(window).trigger("define_game", [this]);
        
        return true;
      }

      global.startGame = function(options) {
        return startGame(options);
      }

      /**
       * MAPPING BACKEND FUNCTIONS
       */


      /**
       * EVENTS
       */
      // pre-game
      var evSetNick = function() {
        global.me.name = global.$d.inputNickname.val();

        if (global.me.name != origNick) {
          $.cookie("name", global.me.name, { expires: 30 });
        }

        $(".nick-display").text(global.me.name);

        // main listener for FireBase
        global.fb.on("value", fbListenSuccess, fbListenError);

        view.change("viewLobby");
      };

      var evNewSession = function() {
        // create a new session
        if (global.sesId != null) {
         global.debug("please leave the current session before creating a new one.");
          return false;
        }
        
        var sessionName = global.$d.sessionName.val();

        if (!sessionName.length) {
         global.debug("please enter a name for the session.", 0);
          return false;
        }

        // we are the first player
        global.me.player = 1;

        var session = global.fb.push();
        session.set({
          name: sessionName,
          state: 0, // 0: waiting for players, 1: waiting for config, 2: in play
          player1: global.me,
          player2: null
        }, function() {
         global.debug("adding new session with name " + sessionName, 2);
        });

        // handle timeouts / disconnects
        session.onDisconnect().remove();

        global.sesId = session.path.o[1];
        global.$d.newSessInd.text(sessionName);
        global.$d.setupForm.begin.prop("disabled", true); // can't start without another player
        view.change("viewSetup");

        return true;
      }

      var evJoinSession = function(e) {
        // join an existing session
        var $target = $(e.target);
        if (!$target.is("button.btn-join")) return false;

        var key = $target.parent().attr("data-ind");

        if (global.sesId != null) {
         global.debug("please leave the current session before trying to join another.", 1);
          return false;
        }

        switch (lobby[key].state) {
          case 0: // awaiting players
            if (typeof lobby[key].player1 == "undefined" || typeof lobby[key].player2 != "undefined") {
              // stale session
             global.debug("tried to join a broken session - deleting", 1);
              deleteSession(key);
              return false;
            }

            // we are the second player
            global.me.player = 2;

            var con = global.fb.child(key);

            con.update({
              state: 1,
              player2: global.me
            })
          
            con.onDisconnect().update({
              state: 0,
              player2: null
            });

            global.debug("joining session with key " + key, 2);

            break;

          default:
            global.debug("tried to join a session which is already full.", 1);
            return false;
        }

        return true;
      }

      var evLeaveSession = function() {
        if (global.sesId == null) {
         global.debug("tried to leave a session when none was connected!", 1);
          return false;
        }

        if (global.me.player == 1) {
          deleteSession(global.sesId);
        }
        else {
          global.fb.child(global.sesId).update({
            state: 0,
            player2: undefined
          });
        }
        global.sesId = null;
        global.me.player = null;

        return true;
      }

      var evNewGame = function(e, force) {
        e.preventDefault();

        if (global.sesId == null) {
         global.debug("tried to create a game before joining a session!", 1);
          return false;
        }

        if (!force && lobby[global.sesId].state == 0) {
         global.debug("tried to create a game before player 2 arrived!", 1);
          return false;
        }

        // validate parameters
        var city = parseInt(global.$d.setupForm.cities.val()),
            mode = parseInt(global.$d.setupForm.mode.filter(":checked").val());

        var errors = [];
        if (isNaN(city))  errors[errors.length] = "you must select a city";
        if (isNaN(mode))  errors[errors.length] = "you must select a mode";

        if (errors.length > 0) {
         global.debug(errors.join("; "), 0);
          return false;
        }
        
        // start the game!
        global.fb.child(global.sesId).update({
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
        if (global.sesId == null) {
          for (var key in lobby) {
            var iAmPlayer1 = typeof lobby[key].player1 != "undefined" &&
              lobby[key].player1.name == global.me.name,
                iAmPlayer2 = typeof lobby[key].player2 != "undefined" &&
              lobby[key].player2.name == global.me.name;

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
                    global.debug("stale - zero state with extraneous player data", 2);
                  }
                  else {
                    global.sesId = key;
                    global.me.player = iAmPlayer1 ? 1 : 2;
                  
                    global.$d.newSessInd.text(sessionName);
                    global.$d.setupForm.begin.prop("disabled", true); // can't start without another player
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
                    global.sesId = key;
                    global.me.player = iAmPlayer1 ? 1 : 2;
                    global.$d.setupForm.begin.prop("disabled", false);
                  }
                  break;
                case 2: // in play
                  if (typeof lobby[key].player1 == "undefined" || typeof lobby[key].player2 == "undefined") {
                    stale = true;
                    global.debug("stale - less than two players defined for an in-play session", 2);
                  }
                  else {
                    // start a new game
                    global.sesId = key;
                    global.me.player = iAmPlayer1 ? 1 : 2;
                    
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
        global.$d.sessionList.empty();
        
        if (!sizeof(lobby)) {
          global.$d.sessionList.append($("<li></li>")
              .addClass("list-group-item")
              .text(global.noSessionsMsg));
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
            global.$d.sessionList.append($("<li></li>")
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

            if (global.sesId == i) {
              // scan for changes
              if (global.me.player == 1) {
                if (global.listenLast.state == 0 && lobby[i].state == 1) {
                  // someone joined!
                  global.$d.setupForm.begin.prop("disabled", false);
                }
                else if (global.listenLast.state == 1 && lobby[i].state == 0) {
                  global.$d.setupForm.begin.prop("disabled", true);
                }
                else if (global.listenLast.state == 2 && lobby[i].state < 2) {
                  // player 2 left (or timed out)!
                  deleteSession(global.sesId);
                  view.change("viewLobby");
                  global.debug("We lost player 2!", 0);
                  global.sesId = null;
                  global.me.player = null;
                }
              }
              else if (global.me.player == 2) {
                if (global.listenLast.state > lobby[i].state) {
                  // player 1 left (or timed out)!
                  deleteSession(global.sesId);
                  view.change("viewLobby");
                 global.debug("We lost player 1!", 0);
                  global.sesId = null;
                  global.me.player = null;
                }
                else if (global.listenLast.state < 2 && lobby[i].state == 2) {
                  // game started by player 1
                 global.debug("game started by player 1 - joining", 2);

                  startGame({
                    city: lobby[i].city,
                    mode: lobby[i].mode // 0: p1 is attacker, 1: p1 is defender
                  });
                }
              }
            }
          }
        }
        
        if (global.me.player == 2 && global.sesId != null && typeof lobby[global.sesId] == "undefined") {
          view.change("viewLobby");
          global.sesId = null;
          global.me.player = null;
         global.debug("player 1 left!", 0);
        }

        global.listenLast = {
          sesId: global.sesId,
          state: typeof lobby[global.sesId] == "undefined" ? null : lobby[global.sesId].state
        };

        return true;
      }

      var fbListenError = function(errorObject) {
       global.debug("error on FireBase listen: " + errorObject.code, 0);

        return true;
      }


      /**
       * onload
       */
      var nickCookie = typeof $.cookie("name") != "undefined";
      if (nickCookie) global.me.name = $.cookie("name");
      var origNick = global.me.name;

      $(document).ready(function(){

        // initialise views
        view.current = $(".viewDefault").attr("id");
        $(".view").addClass("viewHidden");
        $(".viewDefault").removeClass("viewHidden");

        // DOM elements
        global.$d.ctrl = $("#ctrl").children(".inside"); // game items
        global.$d.sessionList = $("#sessionList"); // lobby
        global.$d.sessionName = $("#sessionName"); // session name input in new session section
        global.$d.newSessInd = $("#newSessInd");
        global.$d.inputNickname = $("#inputNickname");
        global.$d.inputNickname.val(global.me.name);

        // FORMS
        // session form
        global.$d.sessionName.val("newsess-" + global.makeid());
        // setup form
        global.$d.setupForm = {
          form:   $("#sessionParamForm"),
          cities: $("#citySelect"),
          mode:   $(".inputMode"),
          begin:  $("#beginGame"),
          force:  $('#forceGame')
        };

        // populate the list of global.cities
        for (var i = 0; i < global.cities.length; i++) {
          global.$d.setupForm.cities.append($("<option></option>")
            .text(global.cities[i].name)
            .attr("value", i)
          );
        }

        // attach events
        $("#btnSetNick").on("click", evSetNick);
        $("#btnSetSessName").on("click", evNewSession);
        global.$d.sessionList.on("click", evJoinSession);
        global.$d.setupForm.begin.on("click", evNewGame);
        global.$d.setupForm.force.on("click", function (e) { evNewGame(e, true); });

        $(window).trigger('doc_ready');
      });

});
