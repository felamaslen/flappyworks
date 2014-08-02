require.config({
    appDir: '.',
    waitSeconds : 10,
    urlArgs: "bust="+Math.floor(Math.random()*999999),

    paths : {

      async:        'libs/async',
      google:   'libs/googleShim',
      jquery:       'libs/jquery.min',
      bootstrap:    'libs/bootstrap.min',
      jquerycookie: 'libs/jquery.cookie',

      markerwithlabel: 'libs/markerwithlabel',
      'v3_epoly':   'libs/v3_epoly',

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
      pdr:          'modules/police_data_renderer',
      mapPreview:   'modules/mapPreview',
      unitObj:      'modules/unitObj'
      },

    shim: {
      'jquery': {exports: '$'},
      'bootstrap': {deps:['jquery'], exports: 'bootstrap'},
      'jquerycookie' : {deps:['jquery'], exports: 'jquerycookie'},
      'firebase' : {deps:[], exports: 'Firebase'}
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
