/**
 * @file js/modules/global.js
 */

define([
    'firebase',
    'uiMessages'
    // 'units'
],
  function(
    Firebase,
    // Units,
    UIMessages
    ) {

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
          case 3: // non-modal user info (e.g. attempt to place unit in invalid position)
            UIMessages.modalDialog(msg);
            window.console && console.log("[INFO]", msg);
            break;
        }
      },
      sizeof: function(obj) {
        if (typeof Object.keys == "function")
          return Object.keys(obj).length;

        var size = 0, key;
        for (key in obj) {
          if (obj.hasOwnProperty(key)) size++;
        }
        return size;
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
          zoom: 11,
          balance: 2515202,
          radius: [3500, 14000]
        },
        {
          name: "Plymouth",
          coords: [50.375935, -4.143126],
          zoom: 13,
          balance: 2568000,
          radius: [1200, 6000]
        }
      ],
      markerSizeX: 32,
      markerSizeY: 32,
      defenceRadiusColor: "#006",
      attackRadiusColor: "#600",
      noSessionsMsg: "There are no open sessions - why not create one?"
    };

    global.me.name += global.makeid();
    return global;
  }
);

