  

function testUnit(unit){
  if(!unit.role || unit.role != "soldier" || unit.role != "turret"){
    return false;
  }
  if(unit.health<1 || unit.health >100){
    return false;
  }
  
}

solider_example = unit{
  this.role = "soldier";
  this.health = 50;
  this.lat;
  this.lon;
  
}
function plopUnit(unit){
  var unitPlopped = new google.maps.Marker{
    position: new google.maps.LatLng(unit.lat, unit.lon),
    map: global.G.maps
  }
