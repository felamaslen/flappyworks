/**
 * @file js/modules/unitPopulation.js
 */
 
// DEPRECATED AND NOT USED

define([
  'jquery',
  'global',
  'units'
],
function($, global, units){
  
  function renderUnitsList() {
  
    for (var i in units.units) {
      $('#unitsList').append('<li>' + units.units[i].role);
      
      button = $('<button>Buy</button>').on('click', function() { alert('clicked'); buyUnit(units.units[i].role); });
        
      $('#unitsList').append(button);
      $('#unitsList').append("</li>");
      
      }
      
      
    }
  
  function buyUnit(unit) {
    units.plopUnit(units.units[unit]);
    
  }
  
  renderUnitsList();
});
