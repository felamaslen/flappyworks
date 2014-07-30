define([ 'global'], function ( global) { 

function testUnit(unit){
  if(!unit.role || unit.role != "soldier" || unit.role != "turret"){
    return false;
  }
  if(unit.health<1 || unit.health >100){
    return false;
  }
  
}

var soldier = {
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
  
};

var turret = {
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
  
};

var units = {
  soldier: soldier,
  turret: turret;
}

function plopUnit(unit){
  if (global.G == null) return false;

  if(!testUnit(unit)){
    global.debug('Unit invalid', 1);
    return false;
  }
  if(unit.role == "turret"){
    var unitPlopped = new google.maps.Marker({
      position: new google.maps.LatLng(unit.lat, unit.lon),
      map: global.G.map,
      icon : 'img/turret.png'
    });
    
    global.me.balance -= unit.cost;
  } else {
    var unitPlopped = new google.maps.Marker({
      position: new google.maps.LatLng(unit.lat, unit.lon),
      map: global.G.maps
    });
    global.me.balance -= unit.cost;
  }

  return true;
}

return {
  plopUnit: plopUnit,
  units: units,
  testUnit: testUnit
}

});
