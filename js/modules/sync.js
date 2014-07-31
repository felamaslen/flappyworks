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
        });

        return true;
      },

      addToSession: function(game) {
        if (global.sesId == null) {
          global.debug("attempted to add game to non-existent session");
          return false;
        }

        global.me.playerChild = global.fb.child(global.sesId).child("player" + global.me.player);

        global.me.playerChild.update({
          units: []
        });

        return true;
      },

      // main FireBase listener events
      fbListenSuccess: function(snapshot) {
        var val = snapshot.val();

//        console.log(snapshot, val);

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
              global.sync.deleteSession(key);
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
                    global.view.change("viewSetup");
                  }

                  break;
                case 1: // waiting for config
                  if (iAmPlayer1) {
                    // go to config page, since we are player 1
                    if (typeof lobby[key].player2 == "undefined")
                      stale = true;
                    else
                      global.view.change("viewSetup");
                  }
                  else {
                    // we are player 2, so go to the "wait for config" page
                    if (typeof lobby[key].player1 == "undefined")
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
                  if (typeof lobby[key].player1 == "undefined" || typeof lobby[key].player2 == "undefined") {
                    stale = true;
                    global.debug("stale - less than two players defined for an in-play session", 2);
                  }
                  else {
                    // start a new game
                    global.sesId = key;
                    global.me.player = iAmPlayer1 ? 1 : 2;
                    
                    global.startGame({
                      city: lobby[key].city,
                      mode: lobby[key].mode // 0: p1 is attacker, 1: p1 is defender
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
       
        if (!global.sizeof(lobby)) {
          global.$d.sessionList.append($("<li></li>")
              .addClass("list-group-item")
              .text(global.noSessionsMsg));
        }
        else {
          for (var i in lobby) {
            if (typeof lobby[i].player1 == "undefined") {
              global.sync.deleteSession(i);
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
                  global.sync.deleteSession(global.sesId);
                  view.change("viewLobby");
                  global.debug("We lost player 2!", 0);
                  global.sesId = null;
                  global.me.player = null;
                }
              }
              else if (global.me.player == 2) {
                if (global.listenLast.state > lobby[i].state) {
                  // player 1 left (or timed out)!
                  global.sync.deleteSession(global.sesId);
                  view.change("viewLobby");
                 global.debug("We lost player 1!", 0);
                  global.sesId = null;
                  global.me.player = null;
                }
                else if (global.listenLast.state < 2 && lobby[i].state == 2) {
                  // game started by player 1
                 global.debug("game started by player 1 - joining", 2);

                  global.startGame({
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
      },

      fbListenError: function(errorObject) {
        global.debug("error on FireBase listen: " + errorObject.code, 0);

        return true;
      },

      deleteSession: function(key) {
        //this.init(options);
        global.fb.child(key).remove(function(error) {
         global.debug(error ? "failure while removing session (" + key + ") from FireBase"
            : "successfully removed session (" + key + ") from FireBase", 1);
        });
        return true;
      }
    };

    return sync;
  }
);
