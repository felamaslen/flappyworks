require.config({
    appDir: '.',
    waitSeconds : 5,
    urlArgs: "bust="+Math.floor(Math.random()*999999),
    
    paths : {
        
        jquery: 'libs/jquery.min',
        bootstrap: 'libs/bootstrap.min',
        jquerycookie: 'libs/jquery.cookie',
        firebase: 'http://cdn.firebase.com/js/client/1.0.15/firebase',
        maps: 'http://maps.googleapis.com/maps/api/js?key=AIzaSyByQNXD_ayeApNf_LSuZDYWcoSSA8gQWto',

        intersection: 'modules/intersection',
        view: 'modules/view',
        admin: 'modules/admin'

    },

    shim: {
        'bootstrap': {deps:['jquery'], exports: 'bootstrap'},
        'jquerycookie' : {deps:['jquery'], exports: 'jquerycookie'}
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

            console.log('REQUIRE::Loaded');

        });

});
