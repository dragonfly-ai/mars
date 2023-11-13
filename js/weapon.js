/*
  global Class AccelerableSpaceMass MovingSpaceMass RelativePosition UUID Victor Sprite DumbBot HomingBot
*/

/*
Categories:
  Strictly Dumb Projectiles:
    blaster, cannon, nuke, rocket/bomb, artillery
  Strictly Homing Projectiles:
    missiles, boomerangs
  Dumb Projectiles that can be Imbued with Homing by Technologies:
    plasma, black hole
  Beams:
    laser, freeze laser, mining, repair, phalanx
  Area of Effect:
    Acid Missiles, Cobra artillery, freeze missiles
*/

var Mount = (function() {
  var factory = function(creationFrame, wielder, props, relativePosition){
    this.creationFrame = creationFrame;
    this.wielder = wielder;
    this.props = props;
    this.position = relativePosition.clone();
  }

  factory.prototype.getAbsolutePosition = function() {
    if (this.wielder.orientation) {
      return this.position.clone().rotate(this.wielder.orientation.angle() + Math.PI/2).add(this.wielder.position);
    } else return this.position.clone().add(this.wielder.position);
  };

  factory.prototype.projectileVelocity = function() {
    return this.getDirection().multiplyScalar(this.wielder.speed).add(this.getOrientation().multiplyScalar(this.props.speed));
  }

  factory.prototype.getDirection = function() {
    return this.wielder.direction.clone();
  };

  factory.prototype.getOrientation = function() {
    return this.wielder.orientation.clone();
  };

  return factory;
})();

var StructureMount = (function() {  // for ship mounted turrets

  var factory = function(creationFrame, wielder, props, relativePosition){
    this.creationFrame = creationFrame;
    this.relativePosition = relativePosition;
    this.wielder = wielder;
    this.props = props;
  };

  factory.prototype.getAbsolutePosition = function() {
    return this.relativePosition.clone().rotate(this.getOrientation().angle() + Math.PI/2).add(this.wielder.getAbsolutePosition());
  };

  factory.prototype.projectileVelocity = function() {
    return this.getOrientation().multiplyScalar(this.props.speed);
  }

  factory.prototype.getOrientation = function() {
    return this.wielder.getOrientation();
  }
  
  return factory;
})();

var DumbProjectile = (function(){
  var factory = function(creationFrame, wielder, sprites, position, direction, speed, orientation, radius, mass, range, damage) {
    Class.inherits(this, new MovingSpaceMass(creationFrame, position, direction, speed, orientation, radius, mass))

    // defaults
    this.sprites = (typeof sprites === 'undefined' ? [] : sprites);
    this.wielder = wielder;
    this.faction = wielder.faction;
    this.range = (typeof range === 'undefined' ? 0 : range);
    this.damage = (typeof damage === 'undefined' ? 0 : damage);
    this.alive = true;

    // derived fields
    this.collisionDistanceSq = this.radius * this.radius;    
  };

  factory.prototype.live = function(currentFrame) { return this.alive && (this.range > this.distanceTravelled); };

  factory.prototype.draw = function(ctx, currentFrame) {
    for (var s in this.sprites) {
      var sprite = this.sprites[s];
      sprite.draw(ctx, this, currentFrame);
    }
  };
  
  return factory;
})();

var SmartProjectile = (function(){
  var factory = function(creationFrame, wielder, sprites, position, direction, speed, maxSpeed, acceleration, orientation, turnRate, radius, mass, range, damage) {
    Class.inherits(this, new AccelerableSpaceMass(creationFrame, position, direction, speed, maxSpeed, acceleration, orientation, turnRate, radius, mass));

    // required fields
    this.sprites = sprites;
    this.wielder = wielder;
    this.faction = wielder.faction;

    // defaults
    this.range = (typeof range === 'undefined' ? 0 : range);
    this.damage = (typeof damage === 'undefined' ? 0 : damage);
    this.alive = true;

    // derived fields
    this.collisionDistanceSq = this.radius * this.radius;    
  };

  factory.prototype.live = function(currentFrame) { return this.alive && (this.range > this.distanceTravelled); };

  factory.prototype.draw = function(ctx, currentFrame) {
    for (var s in this.sprites) {
      var sprite = this.sprites[s];
      sprite.draw(ctx, this, currentFrame);
    }
  };
  return factory;
})();

var Weapon = (function(){
  var factory = function(mount, magazine, range){
    this.mount = mount;
    this.magazine = magazine;
    this.rangeSquared = range * range;
  };
  factory.prototype.reaches = function(distSquared){
    return this.rangeSquared >= distSquared;
  };
  factory.prototype.fire = function(currentFrame, target){
    return this.magazine.pull(currentFrame, this.mount, target);
  };

  return factory;
})();

var Magazine = (function(){
  var factory = function(projectileFactory, capacity, fireDelay, reloadTime){
    // definition
    this.projectileFactory = projectileFactory;

    this.capacity = capacity;
    this.fireDelay = fireDelay;
    this.reloadTime = reloadTime;
    // state
    this.lastFired = 0;
    this.availableRounds = this.capacity;
  };

  factory.prototype.reload = function() { this.availableRounds = this.capacity };
  factory.prototype.pull = function(currentFrame, mount, target) {
    var sinceLastFire = currentFrame - this.lastFired;

    if (this.availableRounds > 0) {
      if (sinceLastFire >= this.fireDelay) {
        this.lastFired = currentFrame;
        this.availableRounds = this.availableRounds - 1;
        return this.projectileFactory(currentFrame, mount, target);
      }
    } else if (sinceLastFire >= this.reloadTime) {
      this.reload();
    }
  };
  return factory;
})();

var BlasterBolt = (function(){
  var tintedSpriteInfo = Sprite.applyTint(imgLoadInfo.blasterBolt, RGB(128, 0, 0), 24, 6);

  var factory = function(currentFrame, mount, target) {
    var velocity = mount.projectileVelocity(); //mount.getVelocity().add(mount.getOrientation().multiplyScalar(mount.props.speed));
    var speed = velocity.length();
    velocity.normalize();

    var sprites = [];
    if (typeof mount.props.scale === 'undefined') {
      sprites.push(new Sprite(tintedSpriteInfo, mount.props.stride));
    } else {
      sprites.push(new ScaledSprite(tintedSpriteInfo, mount.props.stride, mount.props.scale));
    }

    return new DumbBot(
      currentFrame,
      new DumbProjectile(
        currentFrame, mount.wielder, sprites,
        mount.getAbsolutePosition(), velocity,
        speed, mount.getOrientation(),
        mount.props.radius, mount.props.mass, mount.props.range,
        mount.props.damage
      )
    );
  };
  return factory;
})();

//fighter weapons...

var Blaster = (function(){
  var factory = function(mount){
    var magazine = new Magazine(BlasterBolt, mount.props.capacity, mount.props.fireDelay, mount.props.reloadTime);
    Class.inherits(this, new Weapon(mount, magazine, mount.props.range));
  };
  return factory;
})();

var CannonBall = (function(){
  var tintedSpriteInfo = Sprite.applyTint(imgLoadInfo.cannonBall, RGB(128, 0, 0), 24, 6);

  var factory = function(currentFrame, mount, target) {
    var velocity = mount.projectileVelocity(); //mount.getVelocity().add(mount.getOrientation().multiplyScalar(mount.props.speed));
    var speed = velocity.length();
    velocity.normalize();

    var sprites = [];
    if (typeof mount.props.scale === 'undefined') {
      sprites.push(new Sprite(tintedSpriteInfo, mount.props.stride));
    } else {
      sprites.push(new ScaledSprite(tintedSpriteInfo, mount.props.stride, mount.props.scale));
    }

    return new DumbBot(
      currentFrame,
      new DumbProjectile(
        currentFrame, mount.wielder, sprites,
        mount.getAbsolutePosition(), velocity,
        speed, mount.getOrientation(),
        mount.props.radius, mount.props.mass, mount.props.range,
        mount.props.damage
      )
    );
  };
  return factory;
})();

var Cannon = (function(){
  var factory = function(mount){
    var magazine = new Magazine(CannonBall, mount.props.capacity, mount.props.fireDelay, mount.props.reloadTime);
    Class.inherits(this, new Weapon(mount, magazine, mount.props.range));
  };
  return factory;
})();

var Shell = (function(){

  var tintedSpriteInfo = Sprite.applyTint(imgLoadInfo.shell, RGB(128, 0, 0), 12, 6);

  var factory = function(currentFrame, mount) {
    var velocity = mount.projectileVelocity(); //mount.getVelocity().add(mount.getOrientation().multiplyScalar(mount.props.speed));
    var speed = velocity.length();
    velocity.normalize();

    var sprites = [];
    if (typeof mount.props.scale === 'undefined' || mount.props.scale === 1) { sprites.push(new Sprite(tintedSpriteInfo, mount.props.stride)); }
    else { sprites.push(new ScaledSprite(tintedSpriteInfo, mount.props.stride, mount.props.scale)); }

    return new DumbBot(
      currentFrame,
      new DumbProjectile(
        currentFrame, mount.wielder, sprites,
        mount.getAbsolutePosition(), velocity,
        speed, mount.getOrientation(),
        mount.props.radius, mount.props.mass, mount.props.range,
        mount.props.damage
      )
    );
  };
  return factory;
})();

var ArtilleryCannon = (function(){

  var factory = function(mount){
    var magazine = new Magazine(Shell, mount.props.capacity, mount.props.fireDelay, mount.props.reloadTime);
    Class.inherits(this, new Weapon(mount, magazine, mount.props.range));
  };
  return factory;
})();

var Bomb = (function(){
  var factory = function(currentFrame, mount, target) {
    var velocity = mount.projectileVelocity(); //mount.getVelocity().add(mount.getOrientation().multiplyScalar(mount.props.speed));
    var speed = velocity.length();
    velocity.normalize();

    var sprites = [];
    if (typeof mount.props.scale === 'undefined' || mount.props.scale === 1) {
      sprites.push(new Sprite(imgLoadInfo.bomb, mount.props.stride));
      sprites.push(new ThrusterSprite(imgLoadInfo.bombThrust, mount.props.stride));
    } else {
      sprites.push(new ScaledSprite(imgLoadInfo.bomb, mount.props.stride, mount.props.scale));
      sprites.push(new ThrusterSprite(Sprite.getScaledSpriteInfo(imgLoadInfo.bombThrust, mount.props.scale, mount.props.scale), mount.props.stride));
    }

    return new DumbBot(
      currentFrame,
      new SmartProjectile(
        currentFrame, mount.wielder, sprites,
        mount.getAbsolutePosition(), velocity,
        mount.props.initialSpeed, mount.props.maxSpeed, mount.props.acceleration, mount.getOrientation(),
        mount.props.turnRate, mount.props.radius, mount.props.mass, mount.props.range, mount.props.damage
      )
    );
  };
  return factory;
})();

//fighter weapons...

var BombLauncher = (function(){
  var factory = function(mount){
    var magazine = new Magazine(Bomb, mount.props.capacity, mount.props.fireDelay, mount.props.reloadTime);
    Class.inherits(this, new Weapon(mount, magazine, mount.props.range));
  };
  return factory;
})();

var Missile2 = (function(){
  var factory = function(currentFrame, mount, target) {
    var velocity = mount.projectileVelocity(); //mount.getVelocity().add(mount.getOrientation().multiplyScalar(mount.props.initialSpeed));
    var speed = velocity.length();
    velocity.normalize();

    var sprites = [];
    if (typeof mount.props.scale === 'undefined' || mount.props.scale === 1) {
      sprites.push(new Sprite(imgLoadInfo.missile2, mount.props.stride));
      sprites.push(new ThrusterSprite(imgLoadInfo.missile2Thrust, mount.props.stride));
    } else {
      sprites.push(new ScaledSprite(imgLoadInfo.missile2, mount.props.stride, mount.props.scale));
      sprites.push(new ThrusterSprite(Sprite.getScaledSpriteInfo(imgLoadInfo.missile2Thrust, mount.props.scale, mount.props.scale), mount.props.stride));
    }

    return new HomingBot(
      currentFrame,
      new SmartProjectile(
        currentFrame, mount.wielder, sprites,
        mount.getAbsolutePosition(), velocity,
        mount.props.initialSpeed, mount.props.maxSpeed, mount.props.acceleration, mount.getOrientation(),
        mount.props.turnRate, mount.props.radius, mount.props.mass, mount.props.range, mount.props.damage
      )
    );
  };
  return factory;
})();

var Missile2Launcher = (function(){

  var factory = function(mount){
    var magazine = new Magazine(Missile2, mount.props.capacity, mount.props.fireDelay, mount.props.reloadTime);
    Class.inherits(this, new Weapon(mount, magazine, mount.props.range));
  };
  return factory;
})();

var Boomerang = (function(){
  
  var tintedSpriteInfo = Sprite.applyTint(imgLoadInfo.boomerang, RGB(255, 143, 31), 24, 4);

  var factory = function(currentFrame, mount, target) {
    var velocity = mount.projectileVelocity(); //mount.getVelocity().add(mount.getOrientation().multiplyScalar(mount.props.initialSpeed));
    var speed = velocity.length();
    velocity.normalize();

    var sprites = [];
    if (typeof mount.props.scale === 'undefined' || mount.props.scale === 1) {
      sprites.push(new AnimatedSprite(tintedSpriteInfo, mount.props.stride, 1));
    } else {
      sprites.push(new AnimatedSprite(Sprite.getScaledSpriteInfo(tintedSpriteInfo, mount.props.scale, mount.props.scale), mount.props.stride, 1));
    }

    return new HomingBot(
      currentFrame,
      new SmartProjectile(
        currentFrame, mount.wielder, sprites,
        mount.getAbsolutePosition(), velocity,
        mount.props.initialSpeed, mount.props.maxSpeed, mount.props.acceleration, mount.getOrientation(),
        mount.props.turnRate, mount.props.radius, mount.props.mass, mount.props.range, mount.props.damage
      )
    );
  };
  return factory;
})();

var BoomerangLauncher = (function(){

  var factory = function(mount){
    var magazine = new Magazine(Boomerang, mount.props.capacity, mount.props.fireDelay, mount.props.reloadTime);
    Class.inherits(this, new Weapon(mount, magazine, mount.props.range));
  };
  return factory;
})();


var Beam = (function(){
  var factory = function(creationFrame, wielder, position, origin, radius, ttl, damage, color) {
    this.id = UUID();
    this.creationFrame = creationFrame;
    this.wielder = wielder;
    this.position = position;
    this.origin = origin;

    // defaults
    this.ttl = (typeof ttl === 'undefined' ? 1 : ttl);
    this.damage = (typeof damage === 'undefined' ? 0 : damage);
    this.alive = true;
    this.color = (typeof color === 'undefined' ? RGB(238, 130, 238) : color);
    this.radius = (typeof radius === 'undefined' ? 1 : radius);
    this.collisionDistanceSq = this.radius * this.radius;
  };

  factory.prototype.live = function(currentFrame) { return currentFrame - this.creationFrame <= this.ttl; };

  factory.prototype.draw = function(ctx, currentFrame) {
    ctx.strokeStyle = this.color.svg();
    ctx.lineWidth = this.radius;
    ctx.beginPath();
    ctx.moveTo(this.origin.x, this.origin.y);
    ctx.lineTo(this.position.x, this.position.y);
    ctx.stroke();
  };

  return factory;
})();

var PlasmaBall = (function(){
  var tintedSpriteInfo = Sprite.applyTint(imgLoadInfo.plasmaBall, RGB(200, 25, 25), 24, 6);

  var factory = function(currentFrame, mount, target) {
    var velocity = mount.projectileVelocity(); //mount.getVelocity().add(mount.getOrientation().multiplyScalar(mount.props.speed));
    var speed = velocity.length();
    velocity.normalize();

// /*
    var sprites = [];
    if (typeof mount.props.scale === 'undefined' || mount.props.scale === 1) {
      sprites.push(new AnimatedSprite(tintedSpriteInfo, mount.props.stride, 1));
    } else {
      sprites.push(new AnimatedSprite(Sprite.getScaledSpriteInfo(tintedSpriteInfo, mount.props.scale, mount.props.scale), mount.props.stride, 1));
    }

/*
    var sprites = [];
    if (typeof mount.props.scale === 'undefined') {
      sprites.push(new Sprite(tintedSpriteInfo, mount.props.stride));
    } else {
      sprites.push(new ScaledSprite(tintedSpriteInfo, mount.props.stride, mount.props.scale));
    }
    */
    return new DumbBot(
      currentFrame,
      new DumbProjectile(
        currentFrame, mount.wielder, sprites,
        mount.getAbsolutePosition(), velocity,
        speed, mount.getOrientation(),
        mount.props.radius, mount.props.mass, mount.props.range,
        mount.props.damage
      )
    );
  };
  return factory;
})();

var Plasma = (function(){
  var factory = function(mount){
    var magazine = new Magazine(PlasmaBall, mount.props.capacity, mount.props.fireDelay, mount.props.reloadTime);
    Class.inherits(this, new Weapon(mount, magazine, mount.props.range));
  };
  return factory;
})();

var LaserBeam = (function(){
  
  var factory = function(currentFrame, mount, target) {
    return new BeamBot(
      currentFrame,
      new Beam(
        currentFrame, mount.wielder, target.position.clone(),
        mount.getAbsolutePosition(), mount.props.radius, mount.props.ttl,
        mount.props.damage, mount.props.color
      )
    );
  };
  return factory;
})();

var Laser = (function(){
  var factory = function(mount){
    var magazine = new Magazine(LaserBeam, mount.props.capacity, mount.props.fireDelay, mount.props.reloadTime);
    Class.inherits(this, new Weapon(mount, magazine, mount.props.range));
  };
  return factory;
})();
