define([
  'jquery',
  'global'
],
function(
  $,
  glob
) {
  $(window).on(function(unit,enemyUnit){
    console.log(unit);
    console.log(enemyUnit);
  });
});