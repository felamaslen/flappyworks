require.config({
    appDir: '.',
    waitSeconds : 5,
    urlArgs: "bust="+Math.floor(Math.random()*999999),
    
    paths : {
      
      jquery:       'libs/jquery.min',
      jqueryUI:     'libs/jquery-ui.min',
      bootstrap:    'libs/bootstrap.min',
      jquerycookie: 'libs/jquery.cookie',
      firebase:     'libs/firebase',
    //firebase:     'https://cdn.firebase.com/js/client/1.0.15/firebase',
    //maps:         'libs/googlemaps', // this is loaded asynchronously via the footer in index.html
      intersection: 'modules/intersection',

      view:         'modules/view',
      admin:        'modules/admin',
      global:       'modules/global',
      mapMethods:   'modules/mapMethods',
      mapstuff_fela:  'modules/mapstuff_fela',
      sync:         'modules/sync',
      units:        'modules/units',
      formMethods: 'modules/formMethods'
      uiMessages:     'modules/uiMessages',


    },

    shim: {
      'jquery': {exports: '$'},
      'jqueryUI': { deps: ['jquery'] /*, exports: '$'*/ },
      'bootstrap': {deps:['jquery'], exports: 'bootstrap'},
      'jquerycookie' : {deps:['jquery'], exports: 'jquerycookie'},
      'firebase' : {deps:[], exports: 'Firebase'},
    }
});

require([
        'jquery',
        'global',
        'intersection',
        'units',
        'uiMessages'
    ],
    function(
        $,
        global,
        intersection,
        units,
        uiMessages
    ) {

        $('document').ready(function(){

          window.console && console.log('REQUIRE::Loaded');        
         
          uiMessages.modalDialog("hi.");
         
          global.debug("test",1)
          global.debug("test",3)
          
          
           
        });

});
