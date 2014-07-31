
define(['intersection', 'global', 'formMethods', 'jquery'], function (intersection, global, formMethods, $) { 

  console.log( global );

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
  sps: 2,
  icon: "img/icon/soldier.png"
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
  sps: 5,
  icon: "img/icon/turret_128.png"
};

var units = {
  soldier: soldier,
  turret: turret
}

function plopUnit(unit){
  if (global.G == null) return false;

 /* if(!testUnit(unit)){
    //global.debug('Unit invalid', 1);
    console.log("OOPS");
    return false;
  }*/

  var unitPlopped = new google.maps.Marker({
    position: new google.maps.LatLng(unit.lat, unit.lon),
    map: global.G.map,
    icon: typeof unit.icon == "undefined" ? null : unit.icon
  });
  
  global.me.balance -= unit.cost;
  $(window).on('budgetUpdate', function (e) { 
      $('#balanceDisplay').html(global.me.balance);
    } );
  $(window).trigger('budgetUpdate');     

  return true;
}

/*function renderUnitsList(units) {
          global.$d.unitsList.empty();
          var formResults = intersection.getFormParams();
              
                
              
          for (var name in units) {
            global.$d.unitsList.append($("<li></li>")
              .addClass("list-item")
              .addClass("unit")
              .addClass("unit-" + name)
              .text(name)
              .css({
                color: units[name].color
              })
              .data({
                unit: units[name]
              })


              .append($("<div></div>")
                .addClass("icon")
                .append($("<img></img>").attr("src", typeof units[name].icon == "undefined"
                    ? "about:blank" : units[name].icon))
              )
            );
          }*/

function bindEvents() {

  $('window').on('game_init_start', $.proxy( addUnits, this ) );
  console.log('UNITS::bindEvents');

};


function addUnits(){
  console.log( 'UNITS::addUnits' );
  var formResults = formMethods.getFormParams( '#sessionParamForm' );

  if(formResults.mode == 0){
    global.$d.unitsList.empty();
    name = "soldier";
    global.$d.unitsList.append($("<li></li>")
               .addClass("list-item")
               .addClass("unit")
               .addClass("unit-" + name)
               .text(name)
               .append($("<div></div>")
               .addClass("icon")
               .append(
                 $("<img></img>").attr("src", "img/icon/soldier.png")
               ))); 
    }
    if (formResults.mode == 1){
    global.$d.unitsList.empty();
    name = "turret";
    global.$d.unitsList.append($("<li></li>")
               .addClass("list-item")
               .addClass("unit")
               .addClass("unit-" + name)
               .text(name)
               .append($("<div></div>")
    .addClass("icon")
    .append($("<img></img>").attr("src", "img/icon/turret.png"))));
    }
};

return {
  plopUnit: plopUnit,
  units: units,
  testUnit: testUnit,
  bindEvents: bindEvents,
  addUnits: addUnits
}

});
