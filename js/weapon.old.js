/* global $ UUID Victor Sprite Faction Asset imgLoadInfo PointMass*/

var Projectile = (function(){
  var factory = function(sprites, wielder, position, direction, speed, radius, turnRate, ttl, creationFrame ) {

    // position, direction, speed, maxSpeed, acceleration, radius, creationFrame, turnRate
    var projectile = PointMass(position, direction, speed, speed, 0, radius, creationFrame, turnRate);

    projectile.sprites = sprites;
    projectile.wielder = wielder;
    projectile.ttl = ttl;

    projectile.live = function(currentFrame) { return creationFrame - currentFrame < ttl; };
    projectile.move = function(){
      projectile.position.y = projectile.position.y + (projectile.speed * projectile.direction.y);
      projectile.position.x = projectile.position.x + (projectile.speed * projectile.direction.x);
    };
    projectile.rotate = function(dTheta) { projectile.orientation.rotateDeg(dTheta); };
    projectile.draw = function(ctx, currentFrame) {
      if (projectile.live()) {
        for (var s in projectile.sprites) {
          var sprite = projectile.sprites[s];
          sprite.draw(ctx, projectile, currentFrame);
        }
      }
    };
    return projectile;
  };
  return factory;
})();

var ProjectileWeapon = (function(){
  var factory = function(wielder, projectileFactory){

    var weapon = {
      "lastFired" : 0,
      "ttl" : projectileFactory.properties.range,
      "damage" : projectileFactory.properties.damage,
      "reloadDelay" : projectileFactory.properties.delay
    };

    weapon.fire = function(currentFrame){
      if ((currentFrame - weapon.lastFired) > projectileFactory.properties.delay) {  // this is the problem!
        weapon.lastFired = currentFrame;
        return projectileFactory(wielder);
      }
    };

    return weapon;
  };
  return factory;
})();

var Blaster = (function(){
  var BlasterProperties = {
    "imgSrc" : imgLoadInfo.blaster,
    "speed" : 10,
    "delay" : 10,
    "range" : 500,
    "radius" : 2,
    "damage" : 1,
    "stride" : 6
  };

  // wielderId, imgSrc, position, direction, speed, range, stride, factionId, radius
  var blasterBoltFactory = function(wielder) {
    return new Projectile(
      wielder.id,
      BlasterProperties.imgSrc,
      wielder.position.clone(),
      wielder.orientation.clone(),
      BlasterProperties.speed,
      BlasterProperties.range,
      BlasterProperties.stride,
      wielder.faction.id,
      BlasterProperties.radius
    );
  };
  blasterBoltFactory.properties = BlasterProperties;

  var factory = function(wielder){
    var blaster = ProjectileWeapon(wielder, blasterBoltFactory);
    blaster.properties = BlasterProperties;
    return blaster;
  };
  return factory;
})();


var Rocket = (function(){
  var RocketProperties = {
    "imgSrc" : imgLoadInfo.rocket,
    "speed" : 5,
    "delay" : 90,
    "range" : 700,
    "radius" : 4,
    "damage" : 4,
    "stride" : 6
  };

  // wielderId, imgSrc, position, direction, speed, range, stride, factionId, radius
  var rocketFactory = function(wielder) {
    return new Projectile(
      wielder.id,
      RocketProperties.imgSrc,
      wielder.position.clone(),
      wielder.orientation.clone(),
      RocketProperties.speed,
      RocketProperties.range,
      RocketProperties.stride,
      wielder.faction.id,
      RocketProperties.radius
    );
  };
  rocketFactory.properties = RocketProperties;

  var factory = function(wielder){
    var rocket = ProjectileWeapon(wielder, rocketFactory);
    rocket.properties = RocketProperties;
    return rocket;
  }
  return factory;
})();