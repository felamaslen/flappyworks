define([
  'jquery'
],
function(
  $
) {

  var soldier = {
    role: "soldier",
    health: 50,
    lat: 0,
    lon: 0,
    speed: 1,
    range: 750,
    cost: 20000,
    level: 1,
    power: .5,
    sps: 2,
    icon: "img/icon/soldier.png",
    attack: true,
    defence: true
  };

  var turret = {
    role: "turret",
    health: 100,
    lat: 0,
    lon: 0,
    speed: 0,
    range: 1000,
    cost: 30000,
    level: 1,
    power: .8,
    sps: 5,
    icon: "img/icon/turret_128.png",
    attack: false,
    defence: true 
  };

  var artillery = {
    role: "artillery",
    health: "30",
    lat: 0,
    lon: 0,
    speed: 0.5,
    range: 500,
    cost: 40000,
    level: 1,
    power: .8,
    sps: 1,
    icon: 'img/icon/artillery.png',
    attack: true,
    defence: true
  };

  var tank = {
    role: "tank",
    health: 150,
    lat: 0,
    lon: 0,
    speed: 0.5,
    range: 100,
    cost: 100000,
    level: 1,
    power: 1.5,
    sps: 3,
    icon: 'img/icon/tank.png',
    attack: true,
    defence: false
  }


  var units = {
    soldier: soldier,
    turret: turret,
    tank: tank,
    artillery: artillery
  }

  return {
    soldier: soldier,
    turret: turret,
    artillery: artillery,
    tank: tank,
    units: units
  }

});
