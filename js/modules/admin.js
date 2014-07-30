define([
        'jquery',
        'firebase'
    ],
    function(
        $,
        firebase
    ) {

        var Admin = function( window ){

            this.window = window;
            this.init( window );

        };

        Admin.prototype = {

            constructor: Admin,

            init: function( window ){

                this.fb = new Firebase("https://interception.firebaseio.com/sessions");
                this.eventHandlers();

            },

            eventHandlers: function(){

                this.fb.on('value', function (snapshot) {

                    var dataObj = snapshot.val();

                    $('.data').html('');

                    if ( dataObj === null ) { return false; }

                    $.each( dataObj, function( data, index ){

                        $('.data').append( '<li>' + index.name + ' - <button class="removeItem" data-ref="'+ data +'" >Remove Me!</button> </li>' );

                        });

                        }, function (errorObject) {
                            console.log('The read failed: ' + errorObject.code);
                        });

                        function killLobby( event ){
                            var ref = $(event.target).data('ref');
                            toDie = new Firebase('https://interception.firebaseio.com/sessions'+ref)
                            toDie.set( null, function( data ){
                            console.log( data );
                        } );

                };

                $('body').on( 'click', '.removeItem', killLobby);

            }

        };

        return Admin;

});
