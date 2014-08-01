define(['jquery', 'view'], function($,view){
//3&sensor=false&libraries=geometry&key=AIzaSyByQNXD_ayeApNf_LSuZDYWcoSSA8gQWto

function init(){
	var mapOptions = new google.,maps.LatLng([51.514756, -0.125631]),
	zoom = 12;
	}
	var mapOptionsreview  = new google.maps.Map($('#mapPreview'),mapOptions);
}
 google.maps.event.addDomListener(window, 'load', initialize);

return{
	init:init;
}
});