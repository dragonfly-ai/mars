/* global
  $ Quadtree UUID Victor Sprite Faction Asset RGB factionsMap ProjectileWeapon Weapon Projectile Blaster Rocket imgLoadInfo DerivedImageInfo Image AccelerableSpaceMass
  ThrusterSprite LightSprite Class
*/

var Ship = (function(){
  var factory = function(creationFrame, sprites, faction, position, direction, speed, maxSpeed, acceleration, orientation, turnRate, radius, mass, armor){

    Class.inherits(this, new AccelerableSpaceMass(creationFrame, position, direction, speed, maxSpeed, acceleration, orientation, turnRate, radius, mass));
    this.armor = armor;
    this.maxArmor = armor;
    this.alive = true;
    this.sprites = sprites;
    this.weapons = [];
    this.turretBots = [];
    this.faction = faction;
  };

  factory.prototype.equip = function(weapon) { this.weapons.push(weapon); };

  factory.prototype.equipTurretBot = function(turretBot) { this.turretBots.push(turretBot); };

  factory.prototype.draw = function(ctx, currentFrame) {
    for (var s in this.sprites) {
      var sprite = this.sprites[s];
      sprite.draw(ctx, this, currentFrame);
    }
    for (var tb in this.turretBots) {
      var turretBot = this.turretBots[tb];
      turretBot.turret.draw(ctx, currentFrame);
    }
    HealthBar(ctx, this);
  };
  
  return factory;
})();


var Satellite = (function(){

  var props = {
    "maxSpeed" : 5,
    "armor" : 6,
    "acceleration" : 0.1,
    "stride" : 6,
    "turnRate" : Math.PI / 10, //2.291831,
    "radius" : 32,
    "mass" : 5,
    "lightInterval" : 30,
    "energyCost" : 25
  };

  var factory = function(creationFrame, position, direction, orientation, speed, faction){

    var sprites = [ new Sprite(imgLoadInfo.customSprite, props.stride) ];

    Class.inherits(this, new Ship(creationFrame, sprites, faction, position, direction, speed, props.maxSpeed, props.acceleration, orientation, props.turnRate, props.radius, props.mass, props.armor));

  };
  return factory;
})();

var Piranha = (function(){

  var props = {
    "maxSpeed" : 5,
    "armor" : 6,
    "acceleration" : 0.1,
    "stride" : 6,
    "turnRate" : Math.PI / 10, //2.291831,
    "radius" : 14,
    "mass" : 5,
    "lightInterval" : 30,
    "energyCost" : 25
  };

  var blasterProps = {
    "speed" : 17.142857143,
    "capacity" : 3,
    "fireDelay" : 2,
    "reloadTime" : 10,
    "range" : 120,
    "radius" : 3,
    "damage" : 1,
    "stride" : 6,
    "scale" : 108,
    "mass" : 0.01
  };

  var missile2LauncherProps = { //micromissile
    "maxSpeed" : 24,
    "initialSpeed" : 3,
    "acceleration" : 0.3,
    "turnRate" : Math.PI / 5, //2.291831,
    "capacity" : 1,
    "fireDelay" : 1,
    "reloadTime" :60,
    "range" : 150,
    "radius" : 3,
    "damage" : 6,
    "stride" : 6,
    "scale" : 72,
    "mass" : 0.01
  };  

  var factory = function(creationFrame, position, direction, orientation, speed, faction){

    var baseSpriteInfo = Sprite.applyFactionMask(imgLoadInfo.piranha, imgLoadInfo.piranhaMask, faction, props.radius, props.stride);

    var sprites = [
      new Sprite(baseSpriteInfo, props.stride),
      new ThrusterSprite(imgLoadInfo.piranhaThrust, props.stride),
      new LightSprite(imgLoadInfo.piranhaLights, props.stride, props.lightInterval),
    ];

    Class.inherits(this, new Ship(creationFrame, sprites, faction, position, direction, speed, props.maxSpeed, props.acceleration, orientation, props.turnRate, props.radius, props.mass, props.armor));

    this.equip(new Blaster(new Mount(creationFrame, this, blasterProps, new Victor(0, -10))));
    this.equip(new Missile2Launcher(new Mount(creationFrame, this, missile2LauncherProps, new Victor(0, -10))));

  };
  return factory;
})();

var Mantis = (function(){

  var props = {
    "maxSpeed" : 4.5,
    "armor" : 12,
    "acceleration" : 0.1,
    "stride" : 6,
    "turnRate" : Math.PI / 10, //2.291831,
    "radius" : 14,
    "mass" : 5,
    "lightInterval" : 30,
    "energyCost" : 35
  };

  var blasterProps = {
    "speed" : 17.142857143,
    "capacity" : 1,
    "fireDelay" : 1,
    "reloadTime" : 6,
    "range" : 100,
    "radius" : 3,
    "damage" : 2,
    "stride" : 6,
    "scale" : 72,
    "mass" : 0.01
  };

  var factory = function(creationFrame, position, direction, orientation, speed, faction){

    var baseSpriteInfo = Sprite.applyFactionMask(imgLoadInfo.mantis, imgLoadInfo.mantisMask, faction, props.radius, props.stride);

    var sprites = [
      new Sprite(baseSpriteInfo, props.stride),
      new ThrusterSprite(imgLoadInfo.mantisThrust, props.stride),
      new LightSprite(imgLoadInfo.mantisLights, props.stride, props.lightInterval),
    ];

    Class.inherits(this, new Ship(creationFrame, sprites, faction, position, direction, speed, props.maxSpeed, props.acceleration, orientation, props.turnRate, props.radius, props.mass, props.armor));

    this.equip(new Blaster(new Mount(creationFrame, this, blasterProps, new Victor(3.5, -15)))); // these numbers come from this.guns[?] array in actionScript.
    this.equip(new Blaster(new Mount(creationFrame, this, blasterProps, new Victor(-3.5, -15))));  // we can't use these numbers at all.  :(  They're like guidelines, I guess.

  };
  return factory;
})();

var Knight = (function(){

  var props = {
    "maxSpeed" : 6,
    "armor" : 15,
    "acceleration" : 0.15,
    "stride" : 6,
    "turnRate" : Math.PI / 10, //2.291831,
    "radius" : 14,
    "mass" : 5,
    "lightInterval" : 30,
    "energyCost" : 75
  };
  
  var missileLauncherProps = {  //micromissile
    "maxSpeed" : 24,
    "initialSpeed" : 2,
    "acceleration" : 4,
    "turnRate" : Math.PI / 5, //2.291831,
    "capacity" : 1,
    "fireDelay" : 1,
    "reloadTime" :5,
    "range" : 160,
    "radius" : 6,
    "damage" : 6,
    "stride" : 6,
    "scale" : 72,
    "mass" : 0.01
  };

  var factory = function(creationFrame, position, direction, orientation, speed, faction){

    var baseSpriteInfo = Sprite.applyFactionMask(imgLoadInfo.knight, imgLoadInfo.knightMask, faction, props.radius, props.stride);

    var sprites = [
      new Sprite(baseSpriteInfo, props.stride),
      new ThrusterSprite(imgLoadInfo.knightThrust, props.stride),
      new LightSprite(imgLoadInfo.knightLights, props.stride, props.lightInterval),
    ];

    Class.inherits(this, new Ship(creationFrame, sprites, faction, position, direction, speed, props.maxSpeed, props.acceleration, orientation, props.turnRate, props.radius, props.mass, props.armor));

    this.equip(new Missile2Launcher(new Mount(creationFrame, this, missileLauncherProps, new Victor(0, -15))));

  };
  return factory;
})();

var Hawk = (function(){

  var props = {
    "maxSpeed" : 4,
    "armor" : 12,
    "acceleration" : 0.1,
    "stride" : 6,
    "turnRate" : Math.PI / 24, //2.291831,
    "radius" : 13,
    "mass" : 5,
    "lightInterval" : 45,
    "energyCost" : 90
  };

  var missileLauncherProps = { //micromissile
    "maxSpeed" : 24,
    "initialSpeed" : 3,
    "acceleration" : 0.3,
    "turnRate" : Math.PI / 99, //2.291831,
    "capacity" : 2,
    "fireDelay" : 4,
    "reloadTime" :20,
    "range" : 300,
    "radius" : 3,
    "damage" : 6,
    "stride" : 6,
    "scale" : 72,
    "mass" : 0.01
  };  

  var factory = function(creationFrame, position, direction, orientation, speed, faction){

    var baseSpriteInfo = Sprite.applyFactionMask(imgLoadInfo.hawk, imgLoadInfo.hawkMask, faction, props.radius, props.stride);

    var sprites = [
      new Sprite(baseSpriteInfo, props.stride),
      new ThrusterSprite(imgLoadInfo.hawkThrust, props.stride),
      new LightSprite(imgLoadInfo.hawkLights, props.stride, props.lightInterval),
    ];

    Class.inherits(this, new Ship(creationFrame, sprites, faction, position, direction, speed, props.maxSpeed, props.acceleration, orientation, props.turnRate, props.radius, props.mass, props.armor));

    this.equip(new Missile2Launcher(new Mount(creationFrame, this, missileLauncherProps, new Victor(3.5, -10))));
    this.equip(new Missile2Launcher(new Mount(creationFrame, this, missileLauncherProps, new Victor(-3.5, -10))));

  };
  return factory;
})();

var Sapphire = (function(){

  var props = {
    "maxSpeed" : 4.5,
    "armor" : 12,
    "acceleration" : 0.1,
    "stride" : 6,
    "turnRate" : Math.PI / 10, //2.291831,
    "radius" : 13,
    "mass" : 5,
    "lightInterval" : 30,
    "energyCost" : 35
  };

  var boomerangProps = {
    "maxSpeed" : 24,
    "initialSpeed" : 0.25,
    "acceleration" : 0.35,
    "turnRate" : Math.PI / 5,
    "capacity" : 4,
    "fireDelay" : 9,
    "reloadTime" : 40,
    "range" : 100,
    "radius" : 3,
    "damage" : 3,
    "stride" : 4,
    "scale" : 72,
    "mass" : 0.01    
  };

  var factory = function(creationFrame, position, direction, orientation, speed, faction){

    var baseSpriteInfo = Sprite.applyFactionMask(imgLoadInfo.sapphire, imgLoadInfo.sapphireMask, faction, props.radius, props.stride);

    var sprites = [
      new Sprite(baseSpriteInfo, props.stride),
      new ThrusterSprite(imgLoadInfo.sapphireThrust, props.stride),
      new LightSprite(imgLoadInfo.sapphireLights, props.stride, props.lightInterval),
    ];

    Class.inherits(this, new Ship(creationFrame, sprites, faction, position, direction, speed, props.maxSpeed, props.acceleration, orientation, props.turnRate, props.radius, props.mass, props.armor));

    this.equip(new BoomerangLauncher(new Mount(creationFrame, this, boomerangProps, new Victor(3.5, -15)))); // these numbers come from this.guns[?] array in actionScript.
    this.equip(new BoomerangLauncher(new Mount(creationFrame, this, boomerangProps, new Victor(-3.5, -15))));  // we can't use these numbers at all.  :(  They're like guidelines, I guess.

  };
  return factory;
})();

var Rapier = (function(){

  var props = {
    "maxSpeed" : 4.5,
    "armor" : 5,
    "acceleration" : 0.1,
    "stride" : 6,
    "turnRate" : Math.PI / 10, //2.291831,
    "radius" : 14,
    "mass" : 5,
    "lightInterval" : 30,
    "energyCost" : 50,
    "metalCost" : 35
  };

  var laserProps = {
    "capacity" : 1,
    "fireDelay" : 0,
    "reloadTime" : 30,
    "range" : 150,
    "ttl" : 3,
    "damage" : 6,
    "radius" : 1,
    "color" : RGB(238,130,238) //violet
  };


  var factory = function(creationFrame, position, direction, orientation, speed, faction){

    var baseSpriteInfo = Sprite.applyFactionMask(imgLoadInfo.rapier, imgLoadInfo.rapierMask, faction, props.radius, props.stride);

    var sprites = [
      new Sprite(baseSpriteInfo, props.stride),
      new ThrusterSprite(imgLoadInfo.rapierThrust, props.stride),
      new LightSprite(imgLoadInfo.rapierLights, props.stride, props.lightInterval),
    ];

    Class.inherits(this, new Ship(creationFrame, sprites, faction, position, direction, speed, props.maxSpeed, props.acceleration, orientation, props.turnRate, props.radius, props.mass, props.armor));

    this.equip(new Laser(new Mount(creationFrame, this, laserProps, new Victor(0, -10))));

  };
  return factory;
})();

var Hydra = (function(){ // infest fighter

  var props = {
    "maxSpeed" : 4.5,
    "armor" : 35,
    "acceleration" : 0.1,
    "stride" : 6,
    "turnRate" : Math.PI / 10, //2.291831,
    "radius" : 16,
    "mass" : 5,
    "lightInterval" : 30,
    "energyCost" : 35
  };

  var blasterProps = {
    "speed" : 17.142857143,
    "capacity" : 1,
    "fireDelay" : 1,
    "reloadTime" : 6,
    "range" : 100,
    "radius" : 3,
    "damage" : 2,
    "stride" : 6,
    "scale" : 90,
    "mass" : 0.01
  };

  var factory = function(creationFrame, position, direction, orientation, speed, faction){

    var baseSpriteInfo = Sprite.applyFactionMask(imgLoadInfo.infestHydra, imgLoadInfo.infestHydraMask, faction, props.radius, props.stride);

    var sprites = [
      new Sprite(baseSpriteInfo, props.stride),
      new ThrusterSprite(imgLoadInfo.infestHydraThrust, props.stride),
    ];

    Class.inherits(this, new Ship(creationFrame, sprites, faction, position, direction, speed, props.maxSpeed, props.acceleration, orientation, props.turnRate, props.radius, props.mass, props.armor));

    this.equip(new Blaster(new Mount(creationFrame, this, blasterProps, new Victor(4, -15)))); // these numbers come from this.guns[?] array in actionScript.
    this.equip(new Blaster(new Mount(creationFrame, this, blasterProps, new Victor(-4, -15))));  // we can't use these numbers at all.  :(  They're like guidelines, I guess.

  };
  return factory;
})();

var CloudMiniSaucer = (function(){ //cloud fighter

  var props = {
    "maxSpeed" : 3,
    "armor" : 18, // 3,
    //"shieldmax" : 15,
    "acceleration" : 0.1,
    "stride" : 6,
    "turnRate" : Math.PI / 18, //2.291831,
    "radius" : 16,
    "mass" : 5,
    "energyCost" : 25
  };

  var factory = function(creationFrame, position, direction, orientation, speed, faction){

    var baseSpriteInfo = Sprite.applyFactionMask(imgLoadInfo.cloudMiniSaucer, imgLoadInfo.cloudMiniSaucerMask, faction, props.radius, props.stride);

    var sprites = [
      new Sprite(baseSpriteInfo, props.stride),
    ];

    Class.inherits(this, new Ship(creationFrame, sprites, faction, position, direction, speed, props.maxSpeed, props.acceleration, orientation, props.turnRate, props.radius, props.mass, props.armor));

 var turret = new CloudFreezeBlaster(creationFrame, this, new Victor(0,-5), new Victor(0, -1));
    this.equipTurretBot(new TurretBot(creationFrame, turret)); 

  };
  return factory;
})();



var Puma = (function(){

  var props = {
    "maxSpeed" : 3.5,
    "armor" : 125,
    "acceleration" : 0.2,
    "stride" : 6,
    "turnRate" : Math.PI / 24, //2.291831,
    "radius" : 21,
    "mass" : 100,
    "lightInterval" : 50,
    "energyCost" : 100
  };

  var blasterProps = {
    "speed" : 17.142857143,
    "capacity" : 3,
    "fireDelay" : 1,
    "reloadTime" : 20,
    "range" : 150,
    "radius" : 3,
    "damage" : 2,
    "stride" : 6,
    "scale" : 144,
    "mass" : 0.01
  };
  
  var missileLauncherProps = {
    "maxSpeed" : 20,
    "initialSpeed" : 3,
    "acceleration" : 2,
    "turnRate" : Math.PI / 5, //2.291831,
    "capacity" : 1,
    "fireDelay" : 1,
    "reloadTime" :40,
    "range" : 200,
    "radius" : 3,
    "damage" : 6,
    "stride" : 6,
    "scale" : 72,
    "mass" : 0.01
  };  

  var factory = function(creationFrame, position, direction, orientation, speed, faction){

    var baseSpriteInfo = Sprite.applyFactionMask(imgLoadInfo.puma, imgLoadInfo.pumaMask, faction, props.radius, props.stride);

    var sprites = [
      new Sprite(baseSpriteInfo, props.stride),
      new ThrusterSprite(imgLoadInfo.pumaThrust, props.stride),
      new LightSprite(imgLoadInfo.pumaLights, props.stride, props.lightInterval),
    ];

    Class.inherits(this, new Ship(creationFrame, sprites, faction, position, direction, speed, props.maxSpeed, props.acceleration, orientation, props.turnRate, props.radius, props.mass, props.armor));

    this.equip(new Blaster(new Mount(creationFrame, this, blasterProps, new Victor(5, -15)))); 
    this.equip(new Blaster(new Mount(creationFrame, this, blasterProps, new Victor(-5, -15)))); 
    this.equip(new Missile2Launcher(new Mount(creationFrame, this, missileLauncherProps, new Victor(6, -10))));
    this.equip(new Missile2Launcher(new Mount(creationFrame, this, missileLauncherProps, new Victor(-6, -10))));

  };
  return factory;
})();


var Falcon = (function(){

  var props = {
    "maxSpeed" : 3,
    "armor" : 150,
    "acceleration" : 0.15,
    "stride" : 6,
    "turnRate" : Math.PI / 10, //2.291831,
    "radius" : 24,
    "mass" : 5,
    "lightInterval" : 45,
    "energyCost" : 50,
    "metalCost" : 35
  };

  var laserProps = {
    "capacity" : 1,
    "fireDelay" : 0,
    "reloadTime" : 30,
    "range" : 160,
    "ttl" : 3,  
    "damage" : 10,
    "radius" : 2,
    "color" : RGB (238,130,238) //violet
  };

  var bombProps = {
    "speed" : 0,
    "maxSpeed" : 10,
    "initialSpeed" : 0,
    "acceleration" : 0.4,
    "capacity" : 1,
    "fireDelay" : 1,
    "reloadTime" : 45,
    "range" : 160,
    "radius" : 12,
    "damage" : 20,
    "stride" : 6,
    "scale" : 144,
    "mass" : 0.01 
  };

  
 var factory = function(creationFrame, position, direction, orientation, speed, faction){

    var baseSpriteInfo = Sprite.applyFactionMask(imgLoadInfo.falcon, imgLoadInfo.falconMask, faction, props.radius, props.stride);

    var sprites = [
      new Sprite(baseSpriteInfo, props.stride),
      new ThrusterSprite(imgLoadInfo.falconThrust, props.stride),
      new LightSprite(imgLoadInfo.falconLights, props.stride, props.lightInterval),
    ];

    Class.inherits(this, new Ship(creationFrame, sprites, faction, position, direction, speed, props.maxSpeed, props.acceleration, orientation, props.turnRate, props.radius, props.mass, props.armor));

    this.equip(new Laser(new Mount(creationFrame, this, laserProps, new Victor(0, -15)))); 
    this.equip(new BombLauncher(new Mount(creationFrame, this, bombProps, new Victor(5, -10))));
    this.equip(new BombLauncher(new Mount(creationFrame, this, bombProps, new Victor(-5, -10))));


  };
  return factory;
})();


var Grendel = (function(){

  var props = {
    "maxSpeed" : 1.5,
    "armor" : 175,
    "acceleration" : 0.15,
    "stride" : 6,
    "turnRate" : Math.PI / 36, //2.291831,
    "radius" : 24,
    "mass" : 100,
    "lightInterval" : 50,
    "energyCost" : 100
  };

  var cannonProps = {
    "speed" : 17.142857143,
    "capacity" : 2,
    "fireDelay" : 2,
    "reloadTime" : 30,
    "range" : 150,
    "radius" : 3,
    "damage" : 2,
    "stride" : 6,
    "scale" : 144,
    "mass" : 0.01
  };
  
  var missileLauncherProps = {
    "maxSpeed" : 20,
    "initialSpeed" : 3,
    "acceleration" : 1,
    "turnRate" : Math.PI / 10, //2.291831,
    "capacity" : 3,
    "fireDelay" : 2,
    "reloadTime" :60,
    "range" : 200,
    "radius" : 3,
    "damage" : 6,
    "stride" : 6,
    "scale" : 72,
    "mass" : 0.01
  };  

  var factory = function(creationFrame, position, direction, orientation, speed, faction){

    var baseSpriteInfo = Sprite.applyFactionMask(imgLoadInfo.grendel, imgLoadInfo.grendelMask, faction, props.radius, props.stride);

    var sprites = [
      new Sprite(baseSpriteInfo, props.stride),
      new ThrusterSprite(imgLoadInfo.grendelThrust, props.stride),
      new LightSprite(imgLoadInfo.grendelLights, props.stride, props.lightInterval),
    ];

    Class.inherits(this, new Ship(creationFrame, sprites, faction, position, direction, speed, props.maxSpeed, props.acceleration, orientation, props.turnRate, props.radius, props.mass, props.armor));

    this.equip(new Cannon(new Mount(creationFrame, this, cannonProps, new Victor(6, -15)))); 
    this.equip(new Cannon(new Mount(creationFrame, this, cannonProps, new Victor(-6, -15)))); 
    this.equip(new Missile2Launcher(new Mount(creationFrame, this, missileLauncherProps, new Victor(7, -10))));
    this.equip(new Missile2Launcher(new Mount(creationFrame, this, missileLauncherProps, new Victor(-7, -10))));

  var turret = new DoubleBlasterTurret(creationFrame, this, new Victor(0,-5), new Victor(0, -1));
    this.equipTurretBot(new TurretBot(creationFrame, turret)); 
    
  };

  return factory;
})();

var Spartan = (function(){

  var props = {
    "maxSpeed" : 1.4,
    "armor" : 225,
    "acceleration" : 0.1,
    "stride" : 6,
    "turnRate" : Math.PI / 60, //2.291831,
    "radius" : 24,
    "mass" : 5,
    "lightInterval" : 45,
    "energyCost" : 200,
    "metalCost" : 100
  };

  var laserProps = {
    "capacity" : 1,
    "fireDelay" : 0,
    "reloadTime" : 120,
    "range" : 200,
    "ttl" : 3,  // ttl = range/speed
    "damage" : 400,
    "radius" : 5,
    "color" : RGB(238,130,238) //violet RGB(255,128,0) //orange 
  };


  var factory = function(creationFrame, position, direction, orientation, speed, faction){

    var baseSpriteInfo = Sprite.applyFactionMask(imgLoadInfo.spartan, imgLoadInfo.spartanMask, faction, props.radius, props.stride);

    var sprites = [
      new Sprite(baseSpriteInfo, props.stride),
      new ThrusterSprite(imgLoadInfo.spartanThrust, props.stride),
      new LightSprite(imgLoadInfo.spartanLights, props.stride, props.lightInterval),
    ];

    Class.inherits(this, new Ship(creationFrame, sprites, faction, position, direction, speed, props.maxSpeed, props.acceleration, orientation, props.turnRate, props.radius, props.mass, props.armor));

    this.equip(new Laser(new Mount(creationFrame, this, laserProps, new Victor(0, -15)))); 

  };
  return factory;
})();

var Minotaur = (function(){

  var props = {
    "maxSpeed" : 1.5,
    "armor" : 175,
    "acceleration" : 0.15,
    "stride" : 6,
    "turnRate" : Math.PI / 36, //2.291831,
    "radius" : 24,
    "mass" : 100,
    "lightInterval" : 50,
    "energyCost" : 100
  };

    var missileLauncherProps = {
    "maxSpeed" : 10,
    "initialSpeed" : 0.5,
    "acceleration" : 1,
    "turnRate" : Math.PI / 6, //2.291831,
    "capacity" : 1,
    "fireDelay" : 1,
    "reloadTime" :25,
    "range" : 250,
    "radius" : 3,
    "damage" : 30,
    "stride" : 6,
    "scale" : 200,
    "mass" : 0.01
  };  

  var factory = function(creationFrame, position, direction, orientation, speed, faction){

    var baseSpriteInfo = Sprite.applyFactionMask(imgLoadInfo.minotaur, imgLoadInfo.minotaurMask, faction, props.radius, props.stride);

    var sprites = [
      new Sprite(baseSpriteInfo, props.stride),
      new ThrusterSprite(imgLoadInfo.minotaurThrust, props.stride),
      new LightSprite(imgLoadInfo.minotaurLights, props.stride, props.lightInterval),
    ];

    Class.inherits(this, new Ship(creationFrame, sprites, faction, position, direction, speed, props.maxSpeed, props.acceleration, orientation, props.turnRate, props.radius, props.mass, props.armor));

    this.equip(new Missile2Launcher(new Mount(creationFrame, this, missileLauncherProps, new Victor(0, -10))));

  };

  return factory;
})();


var Goliath = (function(){

  var props = {
    "maxSpeed" : 1.25,
    "armor" : 1500,
    "acceleration" : 0.025,
    "stride" : 8,
    "turnRate" : Math.PI/45, // 55, //2.291831,
    "radius" : 36,
    "mass" : 5,
    "lightInterval" : 60,
    "energyCost" : 200,
    "metalCost" : 100
  };

  var laserProps = {
    "capacity" : 1,
    "fireDelay" : 0,
    "reloadTime" : 120,
    "range" : 200,
    "ttl" : 3,  // ttl = range/speed
    "damage" : 400,
    "radius" : 6,
    "color" : RGB(255,128,0) //orange 
  };


  var factory = function(creationFrame, position, direction, orientation, speed, faction){

    var baseSpriteInfo = Sprite.applyFactionMask(imgLoadInfo.goliath, imgLoadInfo.goliathMask, faction, props.radius, props.stride);

    var sprites = [
      new Sprite(baseSpriteInfo, props.stride),
      new ThrusterSprite(imgLoadInfo.goliathThrust, props.stride),
      new LightSprite(imgLoadInfo.goliathLights, props.stride, props.lightInterval),
    ];

    Class.inherits(this, new Ship(creationFrame, sprites, faction, position, direction, speed, props.maxSpeed, props.acceleration, orientation, props.turnRate, props.radius, props.mass, props.armor));

    this.equip(new Laser(new Mount(creationFrame, this, laserProps, new Victor(4, -20))));
    this.equip(new Laser(new Mount(creationFrame, this, laserProps, new Victor(-4, -20))));

    var turret = new LaserTurret(creationFrame, this, new Victor(0,-5), new Victor(0, -1));
    this.equipTurretBot(new TurretBot(creationFrame, turret));

  };
  return factory;
})();

var Hammerhead =(function(){

  var props = {
    "maxSpeed" : 1.5,
    "armor" : 800,
    "acceleration" : 0.025,
    "stride" : 8,
    "turnRate" : Math.PI / 55, 
    "radius" : 32,
    "mass" : 100,
    "lightInterval" : 60,
    "energyCost" : 50,
    "metalCost" : 150
  };

  var shellProps = {
    "speed" : 15,
    "capacity" : 1,
    "fireDelay" : 1,
    "reloadTime" : 16,
    "range" : 500,
    "radius" : 3,
    "damage" : 36, //56,
    "stride" : 6,
    "scale" : 108,
    "mass" : 0.01
  };

  var factory = function(creationFrame, position, direction, orientation, speed, faction){

    var baseSpriteInfo = Sprite.applyFactionMask(imgLoadInfo.hammerhead, imgLoadInfo.hammerheadMask, faction, props.radius, props.stride);

    var sprites = [
      new Sprite(baseSpriteInfo, props.stride),
      new ThrusterSprite(imgLoadInfo.hammerheadThrust, props.stride),
      new LightSprite(imgLoadInfo.hammerheadLights, props.stride, props.lightInterval),
    ];

    Class.inherits(this, new Ship(creationFrame, sprites, faction, position, direction, speed, props.maxSpeed, props.acceleration, orientation, props.turnRate, props.radius, props.mass, props.armor));

    this.equip(new ArtilleryCannon(new Mount(creationFrame, this, shellProps, new Victor(9, -15)))); 
    this.equip(new ArtilleryCannon(new Mount(creationFrame, this, shellProps, new Victor(-9, -15)))); 

    var turret = new EdgeSlasherTurret(creationFrame, this, new Victor(0,-5), new Victor(0, -1));
    this.equipTurretBot(new TurretBot(creationFrame, turret));
  };
  return factory;
})();

var Trident = (function(){

  var props = {
    "maxSpeed" : 1.25,
    "armor" : 1500,
    "acceleration" : 0.025,
    "stride" : 8,
    "turnRate" : Math.PI/45, // 55, //2.291831,
    "radius" : 32,
    "mass" : 5,
    "lightInterval" : 60,
    "energyCost" : 100,
    "metalCost" : 100
  };

  var cannonProps1 = {
    "speed" : 12,
    "capacity" : 1,
    "fireDelay" : 1,
    "reloadTime" : 8,
    "range" : 225,
    "radius" : 3,
    "damage" : 16,
    "stride" : 6,
    "scale" : 250,
    "mass" : 0.02
  };

  var cannonProps2 = {
    "speed" : 14,
    "capacity" : 1,
    "fireDelay" : 1,
    "reloadTime" : 8,
    "range" : 225,
    "radius" : 3,
    "damage" : 8,
    "stride" : 6,
    "scale" : 250,
    "mass" : 0.02
  };

  var factory = function(creationFrame, position, direction, orientation, speed, faction){

    var baseSpriteInfo = Sprite.applyFactionMask(imgLoadInfo.trident, imgLoadInfo.tridentMask, faction, props.radius, props.stride);

    var sprites = [
      new Sprite(baseSpriteInfo, props.stride),
      new ThrusterSprite(imgLoadInfo.tridentThrust, props.stride),
      new LightSprite(imgLoadInfo.tridentLights, props.stride, props.lightInterval),
    ];

    Class.inherits(this, new Ship(creationFrame, sprites, faction, position, direction, speed, props.maxSpeed, props.acceleration, orientation, props.turnRate, props.radius, props.mass, props.armor));

    this.equip(new Cannon(new Mount(creationFrame, this, cannonProps2, new Victor(10, -14)))); 
    this.equip(new Cannon(new Mount(creationFrame, this, cannonProps1, new Victor(3, -22)))); 
    this.equip(new Cannon(new Mount(creationFrame, this, cannonProps1, new Victor(-3, -22)))); 
    this.equip(new Cannon(new Mount(creationFrame, this, cannonProps2, new Victor(-10, -14)))); 

    var turret = new LaserTurret(creationFrame, this, new Victor(0,-5), new Victor(0, -1));
    this.equipTurretBot(new TurretBot(creationFrame, turret));

  };
  return factory;
})();



var RandomShip = (function() {

  var fighters = [
    CloudMiniSaucer,
    Hydra,
    Hawk,
    Piranha,
    Mantis,
    Knight,
    Sapphire,
    Rapier
  ];

  var cruisers = [
   // Puma,
  //  Falcon,
  //  Grendel,
  //  Spartan,
    Minotaur
  ];

  var capitalShips = [
    Hammerhead,
    Trident,
    Goliath
  ];

  var shipsBySize = [fighters, cruisers, capitalShips];

  return function(gameState) {

    var options = shipsBySize[0];
    
    var dice = Math.random();

    if (dice < 0.90) { options = fighters; }
    else if (dice < 0.99) { options = cruisers; }
    else { options = capitalShips; }

    var ShipType = options[parseInt(options.length * Math.random())];
    return new ShipType(
      gameState.currentFrame,
      new Victor(Math.random() * gameState.gameWidth, Math.random() * gameState.gameHeight),
      (new Victor(Math.random() - 0.5, Math.random() - 0.5)).normalize(),
      (new Victor(Math.random() - 0.5, Math.random() - 0.5)).normalize(),
      0,
      gameState.randomFaction()
    );
  }  
})();