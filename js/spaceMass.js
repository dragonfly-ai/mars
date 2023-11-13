/* global $ Victor UUID gameState Class */

var AccelerableSpaceMass = (function(){  // for ships and homing projectiles
  var factory = function(creationFrame, position, direction, speed, maxSpeed, acceleration, orientation, turnRate, radius, mass){
    Class.inherits(this, new MovingSpaceMass(creationFrame, position, direction, speed, orientation, radius, mass));

    this.maxSpeed = (typeof maxSpeed === 'undefined' ? this.speed : maxSpeed);
    this.acceleration = (typeof acceleration === 'undefined' ? 0 : acceleration);
    this.turnRate = (typeof turnRate === 'undefined' ? 0 : turnRate);
  };
  factory.prototype.accelerate = function(reverse) {
    if (typeof reverse === 'undefined') { reverse = false; }
    //if (this.speed <= 0) {this.speed = this.acceleration; }
    var dir = this.direction.clone();
    dir.multiplyScalar(this.speed);
    var or = this.orientation.clone();
    or.multiplyScalar(this.acceleration);
    if (reverse) { dir.subtract(or); } else { dir.add(or); }
    this.speed = dir.length();
    dir.divideScalar(this.speed);
    if (this.speed > this.maxSpeed) { this.speed = this.maxSpeed; }
    else if (this.speed < 0) { this.speed = 0; }
    this.direction = dir;
  };
  factory.prototype.decelerate = function() { this.accelerate(true); };
  factory.prototype.stop = function(){ this.speed = this.acceleration; };

  return factory;
})();

var SpacePoint = (function(){ // for turrets and structures
  var factory = function(creationFrame, position, radius){
    this.id = UUID();

    // defaults
    this.creationFrame = (typeof creationFrame === 'undefined' ? 0 : creationFrame);
    this.position = (typeof position === 'undefined' ? new Victor(0, 0) : position.clone());
    this.radius = (typeof radius === 'undefined' ? 1 : radius);

    // derived fields
    this.collisionDistanceSq = this.radius * this.radius;
  };

  factory.prototype.collidesWith = function(body) {
    return this.position.distanceSq(body.position) <= this.collisionDistanceSq + body.collisionDistanceSq;
  };

  return factory;
})();

var MovingSpaceMass = (function(){  // for dumb projectiles
  var factory = function(creationFrame, position, direction, speed, orientation, radius, mass){
    Class.inherits(this, new SpacePoint(creationFrame, position, radius));

    // defaults
    this.direction = (typeof direction === 'undefined' ? new Victor(0, -1) : direction.clone());
    this.speed = (typeof speed === 'undefined' ? 0 : speed);
    this.mass = (typeof maxSpeed === 'undefined' ? 0 : mass);
    this.orientation = (typeof orientation === 'undefined' ? new Victor(0, -1) : orientation.clone());    
    this.turnRate = (typeof turnRate === 'undefined' ? 0 : turnRate);  // ?

    this.distanceTravelled = 0;
  };

  factory.prototype.rotate = function(angle) { this.orientation.rotateDeg(angle); };

  factory.prototype.turnToward = function(target) {

    var relativePosition = target.position.clone().subtract(this.position).normalize();
    var sign = this.orientation.cross(relativePosition);
    var dTheta = Math.acos(relativePosition.dot(this.orientation));

    if ( dTheta > this.turnRate) { this.orientation.rotate(sign * this.turnRate); }
    else { this.orientation.rotate(sign * dTheta); }
    
    return Math.abs(dTheta);
  };


  factory.prototype.move = function() {
    this.distanceTravelled = this.distanceTravelled + this.speed;
    this.position.y = this.position.y + (this.speed * this.direction.y);
    this.position.x = this.position.x + (this.speed * this.direction.x);
  };

  return factory;
})();


var RelativePosition = (function(){  // for mounts
  var factory = function(creationFrame, position, orientation){
    this.id = UUID();
    // defaults
    this.creationFrame = (typeof creationFrame === 'undefined' ? 0 : creationFrame);
    this.position = (typeof position === 'undefined' ? new Victor(0, 0) : position.clone());
    this.orientation = (typeof orientation === 'undefined' ? new Victor(0, -1) : orientation.clone());
  };
  return factory;
})();


// var RelativePosition = (function(){
//   var factory = function(creationFrame, master, position, orientation, turnRate){
//     this.id = UUID();
//     // defaults
//     this.creationFrame = (typeof creationFrame === 'undefined' ? 0 : creationFrame);
//     this.master = (typeof master === 'undefined' ? 0 : master);
//     this.position = (typeof position === 'undefined' ? new Victor(0, 0) : position.clone());
//     this.orientation = (typeof orientation === 'undefined' ? new Victor(0, -1) : orientation.clone());
//     this.turnRate = (typeof turnRate === 'undefined' ? 0 : turnRate);
//   };

//   factory.prototype.rotate = function(sign) { this.orientation.rotateDeg(sign * this.turnRate); }

//   return factory;
// })();
