$(document).ready(function(){
  /*switch{
    case loc == plymouth:
      latlong = plymouth;
      break;
    case loc == manchester:
      latlong = manchester;
      break;
    case loc == london:
      latlong = london;
      break;
  }*/

	 
  
    if(formParams.citySelect == "London"){
      me.balance = 2515202;
    }
    if(formParams.citySelect == "Plymouth"){
      me.balance = 2568000;
    }
  

	$('#js-budget').append(me.balance);

});
