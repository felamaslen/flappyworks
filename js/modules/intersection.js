/**
 * @file js/intersection.js
 * Copyright (c) 2014,
 * Fela, Jacob, Saul, Malachy
 */

/**
 * GENERIC FUNCTIONS
 */

define([
        'jquery',
        'firebase',
        'jquerycookie',

        'admin',
        'global',

        'view',

        'anim',

        'sync',
        'mapstuff_fela',
        'units'
      ],
      function(
        $,
        firebase,
        jquerycookie,

        Admin,
        global,

        view,

        anim,

        sync,
        mapstuff_fela,
        units
      ) {

    // Basic page module loading - refactor
    if (  window.location.pathname.indexOf( 'admin' ) === 1 ) {

      var admin = new Admin( window );

    };

    global.sync = new sync(window);

    // main animation wrapper
    global.anim = new anim(window);

    global.view = new view();

    var mapstuff = new mapstuff_fela( window );

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

      this.init();

      return true;
    }

    game.prototype.init = function(options){
      // change to the appropriate view
      
      global.view.change("viewGame");
      
      $(window).trigger('game_init_start', [this]);
      
      this.units = []; // gameUnits
      this.myUnits = []; // holds dynamic properties of each unit for session communication
      this.theirUnits = []; // opponent's myUnits
      this.theirUnitsRaw = []; // opponent's units

      // render map
      this.map_init();

      $(window).trigger('game_init_end', [this]);

      return true;
    };

    game.prototype.map_init = function() {
      this.cityCenter = new google.maps.LatLng(this.city.coords[0], this.city.coords[1]);

      var opt = {
        center: this.cityCenter,
        zoom: this.city.zoom,
        minZoom: this.city.zoom,
        mapTypeId: google.maps.MapTypeId.HYBRID,
        mapTypeControlOptions: {
          mapTypeIds: [google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.HYBRID,
            google.maps.MapTypeId.SATELLITE]
        },
        draggable: true,
        draggableCursor: "crosshair"
      };

      this.map = new google.maps.Map(document.getElementById("map"), opt);

      this.mapService = new google.maps.DirectionsService();
      this.travelMode = google.maps.DirectionsTravelMode.WALKING;

      $(window).trigger('map_init', [this]);
      
      return true;
    }

    global.startGame = function(options) {
      global.G = new game(options);

      $(window).trigger("define_game"); 
      
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
      global.me.name = global.$d.inputNickname.val();

      if (global.me.name != origNick) {
        $.cookie("name", global.me.name, { expires: 30 });
      }

      $(".nick-display").text(global.me.name);

      global.view.change("viewLobby");
    };

    global.fb.on("value", global.sync.fbLobbyListen, global.sync.fbListenError);

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
      
      global.fbSes = global.fb.push();
      global.fbSes.set({
        name: sessionName,
        state: 0, // 0: waiting for players, 1: waiting for config, 2: in play
        player1: global.me,
        player2: null
      }, function() {
       global.debug("adding new session with name " + sessionName, 2);
      });

      // handle timeouts / disconnects
      global.fbSes.onDisconnect().remove();

      global.sesId = global.fbSes.path.o[1];
      global.$d.newSessInd.text(sessionName);
      global.$d.setupForm.begin.prop("disabled", true); // can't start without another player
      global.view.change("viewSetup");

      global.fbSes = global.fb.child(global.sesId);

      return true;
    }

    var evJoinSession = function(e) {
      // join an existing session
      global.debug("evJoinSession()", 2);
      var $target = $(e.target);
      if (!$target.is("button.btn-join")) return false;

      var key = $target.parent().attr("data-ind");

      if (global.sesId != null) {
        global.debug("please leave the current session before trying to join another.", 1);
        return false;
      }

      switch (global.lobby[key].state) {
        case 0: // awaiting players
          if (typeof global.lobby[key].player1 == "undefined" || typeof global.lobby[key].player2 != "undefined") {
            // stale session
            global.debug("tried to join a broken session - deleting", 1);
            global.sync.deleteSession();
            return false;
          }

          // we are the second player
          global.me.player = 2;
          
          global.fbSes = global.fb.child(key);
          
          //global.sesId = key;

          global.fbSes.update({
            state: 1,
            player2: global.me
          })
        
          global.fbSes.onDisconnect().update({
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
        global.sync.deleteSession();
      }
      else {
        global.fbSes.update({
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

      if (!force && global.lobby[global.sesId].state == 0) {
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
       global.debug(errors.join("; "), 3);
        return false;
      }
      
      // start the game!
      global.fbSes.update({
        city: city,
        mode: mode,
        state: 2
      });

      global.startGame({
        city: city,
        mode: mode
      });
      
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
      global.view.current = $(".viewDefault").attr("id");
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

      // DOM READY EVENT HANDLERS
      $(window).trigger('doc_ready');
    });

return{
  getFormParams:getFormParams
}
});
