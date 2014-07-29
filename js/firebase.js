﻿var fb = new Firebase("https://interception.firebaseio.com/");

fb.on('value', function (snapshot) {

    $.each( snapshot.val(), function( data, index ){
        
        $('.data').append( '<li>' + index.name + ' - <button class="removeItem" data-ref="'+ data +'" >Remove Me!</button> </li>' );

    });
    if(document.getElementById('lobbyList').innerHtml == ""){
    	document.getElementById('lobbyList').innerHtml = "No lobbies to display."
    }
    
}, function (errorObject) {
  console.log('The read failed: ' + errorObject.code);
});


function killLobby( event ){
	var ref = $(event.target).data('ref');
	toDie = new Firebase('https://interception.firebaseio.com/'+ref)
	toDie.set( null, function( data ){
		console.log( data );
	} );
}

// Event Handlers
$('body').on( 'click', '.removeItem', killLobby);