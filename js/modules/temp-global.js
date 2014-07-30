define(['firebase'], function (Firebase) {
    return {
        me: {
          balance: 2000,
          player: null // becomes 1 or 2 when joining / creating session
        },
        $d: {}, // dom objects
        G: null, // game object
        
        sesId: null,
        lobby: [],
        fb: new Firebase("https://interception.firebaseio.com/sessions"),

        listenLast: { // what things were on the last listen
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
        assets: [ // weapons / soldiers / etc.
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
        noSessionsMsg: "There are no open sessions - why not create one?" 
    }
});
