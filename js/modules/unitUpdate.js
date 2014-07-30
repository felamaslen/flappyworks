define([ 'global', 'units'], function ( global, units) {

  function upgradeUnit(unit){
  	unit.health += 5;
  	if(unit.role == "soldier"){
  	 unit.speed += 1;
  	}
  	unit.range += 2;
  	unit.power += 1;
  	unit.sps *= 1.5;
  	unit.level += 1;
    global.me.balance -=unit.level * 1.5;

  }
  return{
    upgradeUnit: upgradeUnit
  }
}); 
