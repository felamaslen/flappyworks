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
      mapstuff_fela:'modules/mapstuff_fela',
      sync:         'modules/sync',
      units:        'modules/units',
      formMethods:  'modules/formMethods',
      uiMessages:   'modules/uiMessages',
      pdr:          'modules/police_data_renderer',
      mapPreview:   'modules/mapPreview'
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
