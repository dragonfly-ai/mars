/* global
  $ Quadtree UUID Victor Sprite Faction Asset Color factionsMap ProjectileWeapon Weapon Projectile Blaster Rocket imgLoadInfo DerivedImageInfo
  ScaledSprite Class TurretBaseSmall Mount TurretBot
*/

var Turret = (function() {  // for structure mounted turrets

  var factory = function(creationFrame, base, sprites, relativePosition, orientation, turnRate){
    this.id = UUID();
    this.creationFrame = creationFrame;
    this.base = base;
    this.sprites = sprites;
    this.position = relativePosition.clone();
    this.weapons = [];
    this.faction = base.faction;
    this.orientation = orientation;
    //this.direction = orientation;
    this.turnRate = turnRate;
  };

  factory.prototype.equip = function(weapon) { this.weapons.push(weapon); };

  factory.prototype.getAbsolutePosition = function() {
    return this.base.position.clone().add(this.position);
  };

  factory.prototype.turnToward = function(target) {

    var relativePosition = target.position.clone().subtract(this.getAbsolutePosition()).normalize();
    var sign = this.orientation.cross(relativePosition);
    var dTheta = Math.acos(relativePosition.dot(this.orientation));

    if ( dTheta > this.turnRate) { this.orientation.rotate(sign * this.turnRate); }
    else { this.orientation.rotate(sign * dTheta); }
    
    return Math.abs(dTheta);
  };

  factory.prototype.projectileVelocity = function() {
    return this.getOrientation().multiplyScalar(this.props.speed);
  }

  factory.prototype.getOrientation = function() {
    return this.orientation.clone();
  }

  factory.prototype.getOrientedPosition = function() {
    return {
      "position" : this.getAbsolutePosition(),
      "orientation" : this.orientation.clone()
    }
  }

  factory.prototype.draw = function(ctx, currentFrame) {
    for (var s in this.sprites) {
      var sprite = this.sprites[s];
      sprite.draw(ctx, this.getOrientedPosition(), currentFrame);
    }
  };

  return factory;
})();


var BlasterTurret = (function(){

  var props = {
    "stride" : 6,
    "turnRate" : Math.PI / 15, //2.291831,
    "radius" : 16,
    "energyCost" : 50,
    "metalCost" : 0
  };

  var weaponProps = {
    "speed" : 17.142857143,
    "capacity" : 1,
    "fireDelay" : 1,
    "reloadTime" : 30,
    "range" : 150,
    "radius" : 8,
    "damage" : 2,
    "stride" : 6,
    "scale" : 144,
    "mass" : 0.01
  };

  var factory = function(creationFrame, base, relativePosition, orientation) {
    var sprites = [new Sprite(imgLoadInfo.blaster, props.stride)];
    Class.inherits(this, new Turret(creationFrame, base, sprites, relativePosition, orientation, props.turnRate));
    
    var mount = new StructureMount(creationFrame, this, weaponProps, new Victor(0, -8));
    this.equip(new Blaster(mount));
  };

  factory.defaultProps = weaponProps;

  return factory;
})();

var CloudFreezeBlaster = (function(){  //will need turret base updated later

  var props = {
    "stride" : 6,
    "turnRate" : Math.PI / 15, //2.291831,
    "radius" : 16,
    "energyCost" : 50,
    "metalCost" : 0
  };

  var weaponProps = {
    "speed" : 17.142857143,
    "capacity" : 1,
    "fireDelay" : 1,
    "reloadTime" : 30,
    "range" : 150,
    "radius" : 8,
    "damage" : 2,
    "stride" : 6,
    "scale" : 144,
    "mass" : 0.01
  };

  var factory = function(creationFrame, base, relativePosition, orientation) {
    var sprites = [new Sprite(imgLoadInfo.cloudFreezeBlaster, props.stride)];
    Class.inherits(this, new Turret(creationFrame, base, sprites, relativePosition, orientation, props.turnRate));
    
    //needs CloudBase
    
    var mount = new StructureMount(creationFrame, this, weaponProps, new Victor(0, -8));
    this.equip(new Blaster(mount));
  };

  factory.defaultProps = weaponProps;

  return factory;
})();

var MicromissileTurret = (function(){

  var props = {
    "stride" : 6,
    "turnRate" : Math.PI / 15, //2.291831,
    "radius" : 16,
    "energyCost" : 50,
    "metalCost" : 0
  };

  var weaponProps = { //micromissile
    "maxSpeed" : 24,
    "initialSpeed" : 3,
    "acceleration" : 0.3,
    "turnRate" : Math.PI / 5, //2.291831,
    "capacity" : 1,
    "fireDelay" : 1,
    "reloadTime" :30,
    "range" : 200,
    "radius" : 3,
    "damage" : 6,
    "stride" : 6,
    "scale" : 72,
    "mass" : 0.01,
  };

  var factory = function(creationFrame, base, relativePosition, orientation) {
    var sprites = [new Sprite(imgLoadInfo.micromissileTurret, props.stride)];
    Class.inherits(this, new Turret(creationFrame, base, sprites, relativePosition, orientation, props.turnRate));
    
    var mount = new StructureMount(creationFrame, this, weaponProps, new Victor(0, -10));
    this.equip(new Missile2Launcher(mount));
  };

//this.equip(new Missile2Launcher(new Mount(creationFrame, this, missileLauncherProps, new Victor(0, -10))));

  factory.defaultProps = weaponProps;

  return factory;
})();


var DoubleBlasterTurret = (function(){

  var props = {
    "stride" : 6,
    "turnRate" : Math.PI / 15, //2.291831,
    "radius" : 16,
    "energyCost" : 50,
    "metalCost" : 0
  };

  var weaponProps = {
    "speed" : 17.142857143,
    "capacity" : 1,
    "fireDelay" : 1,
    "reloadTime" : 30,
    "range" : 200,
    "radius" : 8,
    "damage" : 2,
    "stride" : 6,
    "scale" : 144,
    "mass" : 0.01
  };

  var factory = function(creationFrame, base, relativePosition, orientation) {
    var sprites = [new Sprite(imgLoadInfo.doubleBlaster, props.stride)];
    Class.inherits(this, new Turret(creationFrame, base, sprites, relativePosition, orientation, props.turnRate));
    
    var mount1 = new StructureMount(creationFrame, this, weaponProps, new Victor(4, -8));
    var mount2 = new StructureMount(creationFrame, this, weaponProps, new Victor(-4, -8));
    this.equip(new Blaster(mount1));
    this.equip(new Blaster(mount2));
  };

  factory.defaultProps = weaponProps;

  return factory;
})();

var EdgeSlasherTurret = (function(){

  var props = {
    "stride" : 6,
    "turnRate" : Math.PI / 15,
    "radius" : 16,
    "energyCost" : 50,
    "metalCost" : 0
  };

  var weaponProps = {  
    "maxSpeed" : 24,
    "initialSpeed" : 0.25,
    "acceleration" : 0.35,
    "turnRate" : Math.PI / 5,
    "capacity" : 4,
    "fireDelay" : 9,
    "reloadTime" : 40,
    "range" : 250,
    "radius" : 9,
    "damage" : 6,
    "stride" : 4,
    "scale" : 125,
    "mass" : 0.01
  };
  
  var factory = function(creationFrame, base, relativePosition, orientation) {
    var baseSpriteInfo = Sprite.applyFactionMask(imgLoadInfo.edgeslasher, imgLoadInfo.edgeslasherMask, base.faction, props.radius, props.stride);

    var sprites = [new Sprite(baseSpriteInfo, props.stride)];
    Class.inherits(this, new Turret(creationFrame, base, sprites, relativePosition, orientation, props.turnRate));
    
    var mount = new StructureMount(creationFrame, this, weaponProps, new Victor(0, -8));
    this.equip(new BoomerangLauncher(mount));
  };

  factory.defaultProps = weaponProps;
  
  return factory;
})();

var BombRackTurret = (function(){

  var props = {
    "stride" : 6,
    "turnRate" : Math.PI / 15, //2.291831,
    "radius" : 16,
    "energyCost" : 50,
    "metalCost" : 0
  };

  var weaponProps = {
    "speed" : 0,
    "maxSpeed" : 8,
    "initialSpeed" : 0,
    "acceleration" : 0.3,
    "capacity" : 1,
    "fireDelay" : 1,
    "reloadTime" : 45,
    "range" : 225,
    "radius" : 12,
    "damage" : 20,
    "stride" : 6,
    "scale" : 144,
    "mass" : 0.01 
  };

  var factory = function(creationFrame, base, relativePosition, orientation) {
    var baseSpriteInfo = Sprite.applyFactionMask(imgLoadInfo.bombRack, imgLoadInfo.bombRackMask, base.faction, props.radius, props.stride);  
    
    var sprites = [new Sprite(baseSpriteInfo, props.stride)];
    Class.inherits(this, new Turret(creationFrame, base, sprites, relativePosition, orientation, props.turnRate));
    
    var mount1 = new StructureMount(creationFrame, this, weaponProps, new Victor(5, -8));
    var mount2 = new StructureMount(creationFrame, this, weaponProps, new Victor(-5, -8));

    this.equip(new BombLauncher(mount1));
    this.equip(new BombLauncher(mount2));
  };

  factory.defaultProps = weaponProps;

  return factory;
})();


var LaserTurret = (function(){  

  var props = {
    "stride" : 6,
    "turnRate" : Math.PI / 15, //2.291831,
    "radius" : 16,
    "energyCost" : 200,
    "metalCost" : 0
  };

  var laserProps = {
    "capacity" : 1,
    "fireDelay" : 0,
    "reloadTime" : 15,
    "range" : 200,
    "ttl" : 3,  // ttl = range/speed
    "damage" : 5,
    "radius" : 1,
    "color" : RGB(238,130,238) //violet
  };
  
  var factory = function(creationFrame, base, relativePosition, orientation) {
    var baseSpriteInfo = Sprite.applyFactionMask(imgLoadInfo.laserTurret, imgLoadInfo.laserTurretMask, base.faction, props.radius, props.stride);  
    
    // var sprites = [new Sprite(imgLoadInfo.laserTurret, props.stride)];
    
    var sprites = [new Sprite(baseSpriteInfo, props.stride)];
    Class.inherits(this, new Turret(creationFrame, base, sprites, relativePosition, orientation, props.turnRate));
  
    //this.equip(new Laser(new Mount(creationFrame, this, laserProps, new Victor(0, -15)))); 
    
    var mount = new StructureMount(creationFrame, this, laserProps, new Victor(0, -12));
    this.equip(new Laser(mount));
    
    factory.defaultProps = laserProps;
  };
  return factory;
})();

var RepairTurret = (function(){  //essentially a microlaser right now

  var props = {
    "stride" : 6,
    "turnRate" : Math.PI / 15, 
    "radius" : 16,
    "energyCost" : 200,
    "metalCost" : 0
  };

  var laserProps = {
    "capacity" : 1,
    "fireDelay" : 0,
    "reloadTime" : 15,
    "range" : 100,
    "ttl" : 3,  
    "damage" : 1,
    "radius" : 1,
    "color" : RGB(50,205,50) //limegreen
  };
  
  var factory = function(creationFrame, base, relativePosition, orientation) {
    var baseSpriteInfo = Sprite.applyFactionMask(imgLoadInfo.repairTurret, imgLoadInfo.repairTurretMask, base.faction, props.radius, props.stride);  
    
    var sprites = [new Sprite(baseSpriteInfo, props.stride)];
    Class.inherits(this, new Turret(creationFrame, base, sprites, relativePosition, orientation, props.turnRate));
  
    this.equip(new Laser(new StructureMount(creationFrame, this, laserProps, new Victor(3, -5))));
    this.equip(new Laser(new StructureMount(creationFrame, this, laserProps, new Victor(-3, -5))));
/*  
    var mount = new StructureMount(creationFrame, this, laserProps, new Victor(2, -5));
    var mount = new StructureMount(creationFrame, this, laserProps, new Victor(-2, -5)); 

// never had tried this first, but generated the "only one beam" error due to overwrighting.
*/
    factory.defaultProps = laserProps;
  };
  return factory;
})();

var Autogun = (function(){

  var props = {
    "stride" : 6,
    "turnRate" : Math.PI / 15, //2.291831,
    "radius" : 16,
    "energyCost" : 50,
    "metalCost" : 0
  };

  var weaponProps = {
    "speed" : 17.142857143,
    "capacity" : 1,
    "fireDelay" : 1,
    "reloadTime" : 10,
    "range" : 150,
    "radius" : 8,
    "damage" : 2,
    "stride" : 6,
    "scale" : 100,
    "mass" : 0.01
  };

  var factory = function(creationFrame, base, relativePosition, orientation) {
    var baseSpriteInfo = Sprite.applyFactionMask(imgLoadInfo.autogun, imgLoadInfo.autogunMask, base.faction, props.radius, props.stride);  
    
    var sprites = [new Sprite(baseSpriteInfo, props.stride)];
    Class.inherits(this, new Turret(creationFrame, base, sprites, relativePosition, orientation, props.turnRate));
    
    var mount1 = new StructureMount(creationFrame, this, weaponProps, new Victor(4, -8));
    var mount2 = new StructureMount(creationFrame, this, weaponProps, new Victor(0, -8));
    var mount3 = new StructureMount(creationFrame, this, weaponProps, new Victor(-4, -8));
    this.equip(new Blaster(mount1));
    this.equip(new Blaster(mount2));
    this.equip(new Blaster(mount3));
  };

  factory.defaultProps = weaponProps;

  return factory;
})();

var Autocannon = (function(){

  var props = {
    "stride" : 6,
    "turnRate" : Math.PI / 15, //2.291831,
    "radius" : 16,
    "energyCost" : 150,
    "metalCost" : 25,
  };

  var weaponProps = {
    "speed" : 17.142857143,
    "capacity" : 1,
    "fireDelay" : 1,
    "reloadTime" : 10,
    "range" : 225,
    "radius" : 8,
    "damage" : 8,
    "stride" : 6,
    "scale" : 175,
    "mass" : 0.01
  };

  var factory = function(creationFrame, base, relativePosition, orientation) {
    var baseSpriteInfo = Sprite.applyFactionMask(imgLoadInfo.autocannon, imgLoadInfo.autocannonMask, base.faction, props.radius, props.stride);  
    
    var sprites = [new Sprite(baseSpriteInfo, props.stride)];
    Class.inherits(this, new Turret(creationFrame, base, sprites, relativePosition, orientation, props.turnRate));
    
    var mount1 = new StructureMount(creationFrame, this, weaponProps, new Victor(5, -8));
    var mount2 = new StructureMount(creationFrame, this, weaponProps, new Victor(0, -8));
    var mount3 = new StructureMount(creationFrame, this, weaponProps, new Victor(-5, -8));
    this.equip(new Cannon(mount1));
    this.equip(new Cannon(mount2));
    this.equip(new Cannon(mount3));
  };

  factory.defaultProps = weaponProps;

  return factory;
})();

var PlasmaCaster = (function(){

  var props = {
    "stride" : 6,
    "turnRate" : Math.PI / 24, //2.291831,
    "radius" : 16,
    "energyCost" : 50,
    "metalCost" : 0
  };

  var weaponProps = {
    "speed" : 5,
    "capacity" : 1,
    "fireDelay" : 1,
    "reloadTime" : 45,
    "range" : 180,
    "radius" : 12,
    "damage" : 80,
    "stride" : 6,  // shouldn't this be a stride of 4 because of the plasmaball.png being 4x4 ?
    "scale" : 250,
    "mass" : 0.01
  };

  var factory = function(creationFrame, base, relativePosition, orientation) {
    var sprites = [new Sprite(imgLoadInfo.plasmaCaster, props.stride)];
    Class.inherits(this, new Turret(creationFrame, base, sprites, relativePosition, orientation, props.turnRate));
    
    var mount = new StructureMount(creationFrame, this, weaponProps, new Victor(0, -2));
    this.equip(new Plasma(mount));
  };

  factory.defaultProps = weaponProps;

  return factory;
})();

var RandomTurret = (function(){

  var options = [
    BlasterTurret,
    DoubleBlasterTurret,
    Autogun,
    Autocannon,
    MicromissileTurret,
    LaserTurret,
    BombRackTurret,
    EdgeSlasherTurret,
    CloudFreezeBlaster,
    RepairTurret,
    PlasmaCaster
  ];

  return function(gameState, index) {
    if (index) {  // abuse of hoisting.  Oh, bad form.
      var TurretType = options[index % options.length];
    } else {
      var TurretType = options[parseInt(options.length * Math.random())];
    }

    var centerWidth = gameState.gameWidth / 2;
    var centerHeight = gameState.gameHeight / 2;

    var turretBase = new TurretBaseSmall(
      gameState.currentFrame,
      new Victor(
        centerWidth + (Math.random() -0.5) * centerWidth/2,
        centerHeight + (Math.random() -0.5) * centerWidth/2
      ),
      gameState.randomFaction()
    );
    var turret = new TurretType(gameState.currentFrame, turretBase, new Victor(0,0), new Victor(0, -1));
    turretBase.equipTurretBot(new TurretBot(gameState.currentFrame, turret));

    return turretBase;
  }  
})();