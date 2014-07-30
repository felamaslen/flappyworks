require.config({
    appDir: '.',
    waitSeconds : 5,
    urlArgs: "bust="+Math.floor(Math.random()*999999),
    
    paths : {
        
      jquery:     'libs/jquery.min',
      jqueryUI:   'libs/jquery-ui.min',
      bootstrap:  'libs/bootstrap.min',
      jquerycookie: 'libs/jquery.cookie',
//      firebase: 'https://cdn.firebase.com/js/client/1.0.15/firebase',
//      maps: 'http://maps.googleapis.com/maps/api/js?key=AIzaSyByQNXD_ayeApNf_LSuZDYWcoSSA8gQWto',
    
      firebase:   'libs/firebase',
      maps:       'libs/googlemaps',

      intersection: 'modules/intersection',
      view:       'modules/view',
      admin:      'modules/admin',
      global:     'modules/global',
      mapstuff_fela: 'modules/mapstuff_fela',
      units: 'modules/units',
      //unitPopulation: 'modules/unitPopulation'

    },

    shim: {
      'jquery': {exports: '$'},
      'jqueryUI': { deps: ['jquery'] },
      'bootstrap': {deps:['jquery'], exports: 'bootstrap'},
      'jquerycookie' : {deps:['jquery'], exports: 'jquerycookie'},
      'firebase' : {deps:[], exports: 'Firebase'},
    }
});

require([
        'jquery',
        'intersection',
        //'unitPopulation',
        'units'
    ],
    function(
        $,
        intersection
    ) {

        $('document').ready(function(){

            window.console && console.log('REQUIRE::Loaded');

        });

});
