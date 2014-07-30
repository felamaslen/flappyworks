require.config({
    appDir: '.',
    waitSeconds : 5,
    urlArgs: "bust="+Math.floor(Math.random()*999999),
    
    paths : {
        
      jquery:     'libs/jquery.min',
      //jqueryUI:   'libs/jquery-ui.min',
      bootstrap:  'libs/bootstrap.min',
      jquerycookie: 'libs/jquery.cookie',
      
      firebase:   'libs/firebase',
//      firebase: 'https://cdn.firebase.com/js/client/1.0.15/firebase',

//      maps:       'libs/googlemaps', // this is loaded asynchronously via the footer in index.html
    

      intersection: 'modules/intersection',
      view:       'modules/view',
      admin:      'modules/admin',
      global:     'modules/global',
      mapstuff_fela: 'modules/mapstuff_fela',
      units:      'modules/units'

    },

    shim: {
      'jquery': {exports: '$'},
      //'jqueryUI': { deps: ['jquery'] },
      'bootstrap': {deps:['jquery'], exports: 'bootstrap'},
      'jquerycookie' : {deps:['jquery'], exports: 'jquerycookie'},
      'firebase' : {deps:[], exports: 'Firebase'},
    }
});

require([
        'jquery',
        'intersection'
    ],
    function(
        $,
        intersection
    ) {

        $('document').ready(function(){

            window.console && console.log('REQUIRE::Loaded');

        });

});
