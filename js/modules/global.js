/**
 * @file js/modules/global.js
 */

define([
    'firebase', 'units'
],
  function(Firebase) {
    var global = {
      debug: function(msg, level) {
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
      },
      makeid: function(length) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        var length = typeof length == "undefined" ? 5 : length;

        for ( var i = 0; i < length; i++) {
          text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return text;
      },
      me: {
        name: "player-",
        balance: 2000,
        player: null, // becomes 1 or 2 when joining / creating session
        mode: null // Becomes either attacker or defender. (0/1)
      },
      $d: {},
      G: null,
      sesId: null,
      lobby: [],
      fb: new Firebase("https://interception.firebaseio.com/sessions"),
      listenLast: {
        sesId: null,
        state: null
      },
      cities: [
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
      noSessionsMsg: "There are no open sessions - why not create one?"
    };

    global.me.name += global.makeid();

    return global;
  }
);

