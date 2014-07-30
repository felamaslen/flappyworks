define([ 'global', 'jquery'], function ($, global) {

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
    $(window).on('budgetUpdate', function (e) { 
      $('#balanceDisplay').html(global.me.balance);
    } );
    $(window).trigger('budgetUpdate');     
  }
  return{
    upgradeUnit: upgradeUnit
  }
}); 
