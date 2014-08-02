require.config({
    appDir: '.',
    waitSeconds : 5,
    urlArgs: "bust="+Math.floor(Math.random()*999999),

    paths : {

      jquery:       'libs/jquery.min',
      bootstrap:    'libs/bootstrap.min',
      jquerycookie: 'libs/jquery.cookie',
      firebase:     'libs/firebase',
      intersection: 'modules/intersection',
      view:         'modules/view',
      admin:        'modules/admin',
      global:       'modules/global',
      mapMethods:   'modules/mapMethods',
      map:          'modules/map',
      anim:         'modules/anim',
      sync:         'modules/sync',
      units:        'modules/units',
      formMethods:  'modules/formMethods',
      uiMessages:   'modules/uiMessages',
      policeData:   'modules/police_data',
      pdr:          'modules/police_data_renderer',
      mapPreview:   'modules/mapPreview',
      unitObj:      'modules/unitObj'
      },

    shim: {
      'jquery': {exports: '$'},
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
        'pdr'
    ],
    function(
        $,
        global,
        intersection,
        units,
        pdr
    ) {

        $('document').ready(function(){

          window.console && console.log('REQUIRE::Loaded');

        });

});
