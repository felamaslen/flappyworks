define([ 'global'], function ( global) { 

function testUnit(unit){
  if(!unit.role || unit.role != "soldier" || unit.role != "turret"){
    return false;
  }
  if(unit.health<1 || unit.health >100){
    return false;
  }
  
}

soldier = {
  role : "soldier",
  health : 50,
  lat : 0 ,
  lon : 0,
  speed : 1,
  range : 10,
  cost: 2000,
  level: 1,
  power: 5,
  sps: 2
  
}
turret = {
  role : "turret",
  health : 10,
  lat : 0 ,
  lon : 0,
  speed : 0,
  range : 20,
  cost: 3000,
  level: 1,
  power: 7,
  sps: 5
  
}



function plopUnit(unit){
  if(!testUnit(unit)){
    console.log('Unit invalid');
    return false;
  }
  if(unit.role == "turret"){
   var unitPlopped = new google.maps.Marker{
    position: new google.maps.LatLng(unit.lat, unit.lon),
    map: global.G.maps,
    icon : 'img/turret.png'

    }
    me.balance -= unit.cost;
  }
  else{
    var unitPlopped = new google.maps.Marker{
    position: new google.maps.LatLng(unit.lat, unit.lon),
    map: global.G.maps
  }
  me.balance -= unit.cost;
  }
}


return {
  plopUnit: plopUnit,
  soldier: soldier,
  turret: turret,
  testUnit: testUnit
}

});
