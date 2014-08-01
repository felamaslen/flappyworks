/**
 * @file js/modules/sync.js
 */

define([
  'jquery',
  'global',
  'units'
],
  function($, global, units) {
    var sync = function(window) {
      this.window = window;

      this.init();
    };

    sync.prototype = {
      init: function(){
        var self = this;

        $(window).on("define_game", function(e) {
          // add game to session
          global.debug("adding game to session...", 2);
          self.addToSession(global.G);

          // session listener
          global.fbSessionListen(true);
        });

        return true;
      },

      drawTheirUnits: function() {
        global.debug("drawTheirUnits() called", 2);
        for (var i = 0; i < global.G.theirUnits.length; i++) {
          if (typeof global.G.theirUnitsRaw[i] == "undefined") {
            // create the gameUnit
            var unit = units.units[global.G.theirUnits[i].type];

            unit.level = global.G.theirUnits[i].level;
            unit.health = global.G.theirUnits[i].health;
            unit.lat = global.G.theirUnits[i].lat;
            unit.lon = global.G.theirUnits[i].lon;

            unit.mine = false;
             
            // new gameUnit
            global.G.theirUnitsRaw[i] = new units.gameUnit(global.G, unit);
          }
          else {
            // update the gameUnit's position
            var gu = global.G.theirUnitsRaw[i];

            gu.lat = global.G.theirUnits[i].lat;
            gu.lon = global.G.theirUnits[i].lon;

            gu.position = new google.maps.LatLng(gu.lat, gu.lon);

            gu.marker.setPosition(gu.position);
          }
        }
        return true;
      },

      addToSession: function(game) {
        if (global.sesId == null) {
          global.debug("attempted to add game to non-existent session");
          return false;
        }

        global.playerChild = global.fb.child(global.sesId).child("player" + global.me.player);

        return true;
      },

      // this happens when data updates within the current session (if one is joined)
      fbSessionListen: function(snapshot) {
        global.debug("fbSessionListen() called", 2);
        if (global.G == null) {
          global.debug("tried to call fbSessionListen with no game in progress", 1);
          return false;
        }

        var val = snapshot.val();

        if (val == null) return false;

        var otherPlayer = global.me.player == 1 ? 2 : 1;

        var otherPlayerString = "player" + otherPlayer.toString();

        if (typeof val[otherPlayerString] != "undefined" &&
            typeof val[otherPlayerString].units != "undefined") {
          global.G.theirUnits = val[otherPlayerString].units;
        }

        // check if my units have been updated (i.e. attacked / destroyed)
        var newMyUnits = val["player" + global.me.player];
        for (var i = 0; i < newMyUnits.length; i++) {
          if (newMyUnits[i].health !== global.G.myUnits[i].health) {
            // health updated
            if (newMyUnits[i].health == 0) {
              // my unit was destroyed!
              global.G.myUnits.splice(i, 1);
              global.G.units[i].marker.remove();
              global.G.units.splice(i, 1);
            }
            else {
              global.G.myUnits[i].health = newMyUnits[i].health;
              glboal.G.units[i].updateMarker();
            }
          }
        }

        global.sync.drawTheirUnits();

        return true;
      },

      // this happens whenever the data updates while on the lobby list
      fbLobbyListen: function(snapshot) {
        var val = snapshot.val();

        if (typeof val != "object" || val == null) val = {};

        global.lobby = val;

        // see if we are a member of any of the existing sessions
        if (global.sesId == null) {
          for (var key in global.lobby) {
            var iAmPlayer1 = typeof global.lobby[key].player1 != "undefined" &&
              global.lobby[key].player1.name == global.me.name,
                iAmPlayer2 = typeof global.lobby[key].player2 != "undefined" &&
              global.lobby[key].player2.name == global.me.name;

            if (iAmPlayer1 && iAmPlayer2) {
              // bad session - remove
              global.sync.deleteSession(key);
            }
            else if (!iAmPlayer1 && !iAmPlayer2) {
              continue;
            }
            else {
              var stale = false;

              switch (global.lobby[key].state) {
                case 0: // waiting for players
                  if ((iAmPlayer1 && typeof global.lobby[key].player2 != "undefined") ||
                      (iAmPlayer2 && typeof global.lobby[key].player1 != "undefined")) {
                    stale = true;
                    global.debug("stale - zero state with extraneous player data", 2);
                  }
                  else {
                    global.sesId = key;
                    global.me.player = iAmPlayer1 ? 1 : 2;
                  
                    global.$d.newSessInd.text(sessionName);
                    global.$d.setupForm.begin.prop("disabled", true); // can't start without another player
                    global.view.change("viewSetup");
                  }

                  break;
                case 1: // waiting for config
                  if (iAmPlayer1) {
                    // go to config page, since we are player 1
                    if (typeof global.lobby[key].player2 == "undefined")
                      stale = true;
                    else
                      global.view.change("viewSetup");
                  }
                  else {
                    // we are player 2, so go to the "wait for config" page
                    if (typeof global.lobby[key].player1 == "undefined")
                      stale = true;
                    else
                      global.view.change("viewWaitP1");                
                  }

                  if (!stale) {
                    global.sesId = key;
                    global.me.player = iAmPlayer1 ? 1 : 2;
                    global.$d.setupForm.begin.prop("disabled", false);
                  }
                  break;
                case 2: // in play
                  if (typeof global.lobby[key].player1 == "undefined" || typeof global.lobby[key].player2 == "undefined") {
                    stale = true;
                    global.debug("stale - less than two players defined for an in-play session", 2);
                  }
                  else {
                    // start a new game
                    global.sesId = key;
                    global.me.player = iAmPlayer1 ? 1 : 2;
                    
                    global.startGame({
                      city: global.lobby[key].city,
                      mode: global.lobby[key].mode // 0: p1 is attacker, 1: p1 is defender
                    });
                  }

                  break;
              }

              if (stale) {
                // remove offending data
                global.sync.deleteSession(key);
              }
            }
          }
        }

        // reload lobby list on lobby view
        global.$d.sessionList.empty();

        if (!global.sizeof(global.lobby)) {
          global.$d.sessionList.append($("<li></li>")
              .addClass("list-group-item")
              .text(global.noSessionsMsg));
        }
        else {
          for (var i in global.lobby) {
            if (typeof global.lobby[i].player1 == "undefined") {
              global.sync.deleteSession(i);
              break;
            }

            var players = [];
            
            players[players.length] = global.lobby[i].player1.name;
            if (typeof global.lobby[i].player2 != "undefined")
              players[players.length] = global.lobby[i].player2.name;

            players = players.join(", ");

            var open = global.lobby[i].state == 0;

            // add session to the session list in the lobby
            global.$d.sessionList.append($("<li></li>")
              .addClass("list-group-item")
              .addClass("session-item")
              .toggleClass("accepting", open)
              .append($("<span></span>")
                .addClass("name")
                .text(global.lobby[i].name)
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
                if (global.listenLast.state == 0 && global.lobby[i].state == 1) {
                  // someone joined!
                  global.$d.setupForm.begin.prop("disabled", false);
                }
                else if (global.listenLast.state == 1 && global.lobby[i].state == 0) {
                  global.$d.setupForm.begin.prop("disabled", true);
                }
                else if (global.listenLast.state == 2 && global.lobby[i].state < 2) {
                  // player 2 left (or timed out)!
                  global.sync.deleteSession(global.sesId);
                  global.view.change("viewLobby");
                  global.debug("We lost player 2!", 0);
                  global.sesId = null;
                  global.me.player = null;
                  global.endGame();
                }
              }
              else if (global.me.player == 2) {
                if (global.listenLast.state > global.lobby[i].state) {
                  // player 1 left (or timed out)!
//                  global.sync.deleteSession(global.sesId); // this is done by player 1's onDisconnect() event
                  global.view.change("viewLobby");
                  global.fbSes.onDisconnect().cancel();
                  global.debug("We lost player 1!", 0);
                  global.sesId = null;
                  global.me.player = null;
                  global.endGame();
                }
                else if (global.listenLast.state < 2 && global.lobby[i].state == 2) {
                  // game started by player 1
                  global.debug("game started by player 1 - joining", 2);

                  global.startGame({
                    city: global.lobby[i].city,
                    mode: global.lobby[i].mode // 0: p1 is attacker, 1: p1 is defender
                  });
                }
              }
            }
          }
        }
        
        if (global.me.player == 2 && global.sesId != null &&
            typeof global.lobby[global.sesId] == "undefined") {
          global.view.change("viewLobby");
          global.sesId = null;
          global.me.player = null;
          global.fbSes.onDisconnect().cancel();
          global.debug("player 1 left!", 0);
          global.endGame();
        }

        global.listenLast = {
          sesId: global.sesId,
          state: typeof global.lobby[global.sesId] == "undefined" ? null : global.lobby[global.sesId].state
        };

        return true;
      },

      fbListenError: function(errorObject) {
        global.debug("error on FireBase listen: " + errorObject.code, 0);

        return true;
      },

      deleteSession: function() {
        if (global.fbSes == null) {
          global.debug("tried to call deleteSession() with an empty session!", 1);
          return false;
        }
        //this.init(options);
        global.fbSes.remove(function(error) {
          global.debug(error ? "failure while removing session (" + global.sesId + ") from FireBase"
            : "successfully removed session (" + global.sesId + ") from FireBase", 1);
        });

        global.fbSes = null;
        return true;
      }
    };

    return sync;
  }
);
