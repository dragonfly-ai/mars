/* global
  $ Quadtree UUID Victor Sprite Faction Asset Color factionsMap ProjectileWeapon Weapon Projectile Blaster Rocket imgLoadInfo DerivedImageInfo Image AccelerableSpaceMass
  ThrusterSprite LightSprite ScaledSprite Class SpacePoint
*/

var Structure = (function(){
  var factory = function(creationFrame, position, sprites, faction, radius, armor){

    Class.inherits(this, new SpacePoint(creationFrame, position, radius));

    this.faction = faction;
    this.armor = armor;
    this.alive = true;
    this.sprites = sprites;
    this.turretBots = [];
  };

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
  };
  
  return factory;
})();

var TurretBaseSmall = (function(){
  var props = { "radius" : 16, "armor" : 150 }
  var factionSprites = Sprite.getFactionMasks(imgLoadInfo.turretBaseSmall, imgLoadInfo.turretBaseSmallMask, props.radius, 1);
  var factory = function(creationFrame, position, faction) {
    var sprites = [new Sprite(factionSprites[faction.id], 1)];
    Class.inherits(this, new Structure(creationFrame, position, sprites, faction, props.radius, props.armor));
  }
  return factory;
})();

var TurretBaseLarge = (function(){
  var props = { "radius" : 32, "armor" : 600 }
  var factionSprites = Sprite.getFactionMasks(imgLoadInfo.turretBaseLarge, imgLoadInfo.turretBaseLargeMask, props.radius, 1);
  var factory = function(creationFrame, position, faction) {
    var sprites = [new Sprite(factionSprites[faction.id], 1)];
    Class.inherits(this, new Structure(creationFrame, position, sprites, faction, props.radius, props.armor));
  }
  return factory;
})();

/*

var CloudBaseSmall = (function(){  //needs stride, has no mask

  var props = { "radius" : 16, "armor" : 150 }
//  var factionSprites = Sprite.getFactionMasks(imgLoadInfo.cloudBaseSmall, imgLoadInfo.cloudBaseSmall, props.radius, 1);
  var factory = function(creationFrame, position, faction) {
    var sprites = [new Sprite(factionSprites[faction.id], 1)];
    Class.inherits(this, new Structure(creationFrame, position, sprites, faction, props.radius, props.armor));
  }
  return factory;
})();

*/