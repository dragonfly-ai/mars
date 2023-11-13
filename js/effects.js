/* global $ UUID Victor Sprite Class AccelerableSpaceMass imgLoadInfo */

// // Not tested.
// var RotationAnimation = (function(){
//   var factory = function(creationFrame, position, direction, speed, maxSpeed, acceleration, radius, turnRate, sprites) {
//     Class.inherit(this, new SpaceMass(creationFrame, position, direction, speed, maxSpeed, acceleration, radius, turnRate));
//     Class.inherits(this, new AccelerableSpaceMass(creationFrame, position, direction, speed, maxSpeed, acceleration, orientation, turnRate, radius, mass));
//     this.id = UUID();
//     this.creationFrame = creationFrame;
//     this.sprites = sprites;
//     this.live = true;
//   };

//   factory.prototype.draw = function(ctx, currentFrame) {
//     //var rotationAngle = this.turnRate * (currentFrame - this.creationFrame);
//     this.rotate();
//     for (var s in this.sprites) {
//       var sprite = this.sprites[s];
//       sprite.draw(ctx, this, currentFrame);
//     }
//   }

//   return factory;
// })();

var OrangeExplosion = (function(){
  var props = {
    "stride" : 5,
    "imgSrc" : imgLoadInfo.orangeExplosion
  };

  var factory = function(creationFrame, cause) {
    Class.inherits(this, new MovingSpaceMass(creationFrame, cause.position, cause.direction, cause.speed));
    this.sprite = new AnimatedSprite(props.imgSrc, props.stride, 1);
    this.turnRate = 360 / (props.stride * props.stride);
  };

  factory.prototype.draw = function(ctx, currentFrame) {
    this.sprite.draw(ctx, this, currentFrame);
    this.move();
    this.rotate(this.turnRate);
  };

  factory.prototype.live = function(currentFrame) {
    //console.log((currentFrame - this.creationFrame) + " " + props.stride * props.stride)
    return currentFrame - this.creationFrame < (props.stride * props.stride)-1;
  };

  return factory;
})();

var Explosion = (function(){
  var factory = function(imgSrc, position, stride) {

    if (typeof position === 'undefined') { position = new Victor(0, 0); }

    var id = UUID();
    var sprite = Sprite(imgSrc, 0, stride);
    var initialPosition = position.clone();

    var explosion = {
      "id" : id,
      "live" : true,
      "position" : position,
      "sprite" : sprite,
    };

    explosion.draw = function(ctx) { sprite.draw(ctx, position); }
    explosion.squaredDistanceTravelled = function() { return initialPosition.distanceSq(explosion.position); };
    explosion.distanceTravelled = function() { return initialPosition.distance(explosion.position); };
    explosion.rotate = function(angle) {
      sprite.rotate(angle);
      if (sprite.rotationAngle > 359) { explosion.live = false; }
    };
    return explosion;
  };
  return factory;
})();


var StationaryBackdrop = (function(){  // needs driver, ai, multiplayer, or keyboard
  var factory = function(creationFrame, position, sprites){

    Class.inherits(this, new AccelerableSpaceMass(creationFrame, position));

    this.live = true;
    this.sprites = sprites;
  };

  factory.prototype.draw = function(ctx, currentFrame) {
    for (var s in this.sprites) {
      var sprite = this.sprites[s];
      sprite.draw(ctx, this, currentFrame);
    }
  };
  
  return factory;
})();

var StarfieldBackdrop = (function(){
  var factory = function(creationFrame, position){
    Class.inherits(this, new StationaryBackdrop(creationFrame, position, [new Sprite(imgLoadInfo.starfield)]));
  };
  return factory;
})();