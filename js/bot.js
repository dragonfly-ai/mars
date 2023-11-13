/*
 global UUID
*/

var ShipBot = new (function(){
  var angleTolerance = Math.PI / 15;
  var factory = function(creationFrame, ship){
    this.id = ship.id;
    this.creationFrame = creationFrame;
    this.ship = ship;
  }

  factory.prototype.act = function(gameState) {

    var hostile = true;
    var target = gameState.nearestEnemy(this.ship);

    // if no enemies, fly to center
    if (target === null) {
      hostile = false;
      target = gameState.centerPosition();
    }

    var dTheta = this.ship.turnToward(target);   // orientation

    if (dTheta < angleTolerance) { // Acceleration
      this.ship.accelerate();
      if (hostile) { // if enemy is hostile and in range, shoot it!
        var distSquared = this.ship.position.distanceSq(target.position);
        for (var w in this.ship.weapons) {
          var weapon = this.ship.weapons[w];
          if (weapon.reaches(distSquared)) {
            var projectileBot = weapon.fire(gameState.currentFrame, target);
            if (projectileBot) {
              gameState.projectileBots[projectileBot.id] = projectileBot;
            }
          }
        }
      }
    }

    for (var tb in this.ship.turretBots) {
      var turretBot = this.ship.turretBots[tb];
      turretBot.act(gameState);
    }  
  };

  // factory.prototype.drawTargetLines = function(ctx) {
  //   if (typeof this.target !== 'undefined' && this.target !== null) {
  //     ctx.strokeStyle = this.ship.faction.color.rgbaString();
  //     ctx.beginPath();
  //     ctx.moveTo(this.ship.position.x, this.ship.position.y);
  //     ctx.lineTo(this.target.position.x, this.target.position.y);
  //     ctx.stroke();
  //   }
  // }

  return factory;
})();

var BeamBot = new (function(){
  var factory = function(creationFrame, projectile){
    this.id = projectile.id;
    this.creationFrame = creationFrame;
    this.projectile = projectile;
  }

  factory.prototype.act = function(gameState) { };

  return factory;
})();

var DumbBot = new (function(){
  var factory = function(creationFrame, projectile){
    this.id = projectile.id;
    this.creationFrame = creationFrame;
    this.projectile = projectile;
  }

  factory.prototype.act = function(gameState) {
    if (this.projectile.accelerate) { this.projectile.accelerate(); }
    if (this.projectile.move) { this.projectile.move(); }
  };

  return factory;
})();

var HomingBot = new (function(){
  var factory = function(creationFrame, projectile){
    this.id = projectile.id;
    this.creationFrame = creationFrame;
    this.projectile = projectile;
  }

  factory.prototype.act = function(gameState) {

    var target = gameState.nearestEnemy(this.projectile);

    // if no enemies, fly to center
    if (target === null) {
      target = gameState.centerPosition();
    }

    var dTheta = this.projectile.turnToward(target);   // orientation

    //if (dTheta < 0.1) { this.projectile.accelerate(); }
    if (this.projectile.accelerate) { this.projectile.accelerate(); }
    if (this.projectile.move) { this.projectile.move(); }
  };

  return factory;
})();


var TurretBot = new (function(){
  var angleTolerance = Math.PI / 15;
  var factory = function(creationFrame, turret){
    this.id = turret.id;
    this.creationFrame = creationFrame;
    this.turret = turret;
  }

  factory.prototype.act = function(gameState) {

    var absolutePosition = this.turret.getAbsolutePosition();
    var query = {
      "position" : absolutePosition,
      "radius" : this.turret.base.radius,
      "faction" : this.turret.base.faction
    };
    
    var target = gameState.nearestEnemy(query);

    if (target !== null) {
      var dTheta = this.turret.turnToward(target);   // orientation
  
      if (dTheta < angleTolerance) { // try to shoot
        var distSquared = absolutePosition.distanceSq(target.position);
        for (var w in this.turret.weapons) {
          var weapon = this.turret.weapons[w];
          if (weapon.reaches(distSquared)) {
            var projectileBot = weapon.fire(gameState.currentFrame, target);
            if (projectileBot) {
              gameState.projectileBots[projectileBot.id] = projectileBot;
            }
          }
        }
      }
    }
  };

  return factory;
})();