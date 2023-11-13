/*
  global $ Quadtree UUID Victor Piranha Sprite Explosion Ship Faction Asset ShipBot RGB
*/

var factionsMap = {
//  "white" : new Faction("white", RGB(255,255,255)),
  "red" : new Faction("red", RGB(255, 0, 0)),
  "blue" : new Faction("blue", RGB(0,0,255)),
  // "black" : new Faction("black", RGB(0,0,0)),
  // "green" : new Faction("green", RGB(50,205,50)),
  // "purple" : new Faction("purple", RGB(128,0,255))
  // "orange" : new Faction("orange", RGB(255,128,0)) 
  // "yellow" : new Faction("yellow", RGB(255,255,0)),
  // "cyan" : new Faction("cyan", RGB(0,255,255)),
   "gold" : new Faction("gold", RGB(204, 153, 0))
};

// Key Aliases
var keys = {
  "UP" : 38,
  "LEFT" :  37,
  "RIGHT" : 39,
  "DOWN" : 40,
  "SPACE" : 32,
  "z" : 90,
  "x" : 88,
  "c" : 67
};

// game loop
var step = function(){

  // IO
	if (gameState.keysDown[keys.RIGHT]) { gameState.playerShip.rotate(4); }
	if (gameState.keysDown[keys.LEFT]) { gameState.playerShip.rotate(-4); }
	if (gameState.keysDown[keys.UP]) { gameState.playerShip.accelerate(); }
	if (gameState.keysDown[keys.DOWN]) { gameState.playerShip.decelerate(); }
  if (gameState.keysDown[keys.SPACE]) {
    for (var w in gameState.playerShip.weapons) {
      var projectileBot = gameState.playerShip.weapons[w].fire(gameState.currentFrame);
      if (projectileBot) {
        gameState.projectileBots[projectileBot.id] = projectileBot;
      }
    }
  }

  // Update
  animate();  // mars
  //requestAnimFrame(tick);

  var center = gameState.centerPosition();
  gameState.clearQuadTrees();
  gameState.playerShip.move();

  var newExplosions = [];
  for (var eid in gameState.explosions) {
    if (gameState.explosions[eid].live(gameState.currentFrame)) {
      newExplosions[eid] = gameState.explosions[eid];
    }
  }
  gameState.explosions = newExplosions;

  var shipCount = 0;
  var newShipBots = [];
  for (var nps in gameState.shipBots) {
    var bot = gameState.shipBots[nps];
    if (bot.ship.position.distanceSq(center.position) > 4000000) { bot.ship.alive = false; }  // destroy ships that get too far away.
    if (!bot.ship.alive) {
      var explosion = new OrangeExplosion(gameState.currentFrame, bot.ship);
      gameState.explosions[explosion.id] = explosion;
    } else {
      shipCount = shipCount + 1;
      newShipBots[bot.id] = bot;
      bot.ship.move();
      gameState.quadTrees[bot.ship.faction.id].insert({
        'x': bot.ship.position.x - bot.ship.radius,
        'y': bot.ship.position.y - bot.ship.radius,
        'width': 2 * bot.ship.radius,
        'height': 2 * bot.ship.radius,
        'ship': bot.ship
      });
    }
  }
  gameState.shipBots = newShipBots;

  for (var nps in gameState.shipBots) {
    var bot = gameState.shipBots[nps];
    bot.act(gameState);
  }

  for (var s in gameState.structures) {
    var structure = gameState.structures[s];
    for (var tb in structure.turretBots) {
      var turretBot = structure.turretBots[tb];
      turretBot.act(gameState);
    }
  }  

  // var circles = [];
  // // nearestNeighbor test:
  // var nn = gameState.nearestEnemy(gameState.playerShip);
  // if (nn !== null) { circles.push(nn); } else { console.log("no nearest enemy?");}

  var newProjectileBots = [];
  for (var b in gameState.projectileBots) {
    var bulletBot = gameState.projectileBots[b];
    if (bulletBot.projectile.live(gameState.currentFrame)) {

      var collisionCandidates = gameState.bulletHits(bulletBot.projectile);
      for (var cc in collisionCandidates) {
        var collisionCandidate = collisionCandidates[cc].ship;
        if (collisionCandidate.collidesWith(bulletBot.projectile)) {
          bulletBot.projectile.alive = false;
          collisionCandidate.armor = collisionCandidate.armor - bulletBot.projectile.damage;
          if (collisionCandidate.armor <= 0) {
            collisionCandidate.alive = false;
          }
          break;
        }
      }
      if (bulletBot.projectile.live(gameState.currentFrame)) {
         newProjectileBots[bulletBot.id] = bulletBot;
         bulletBot.act(gameState);
      }
    }
  }
  gameState.projectileBots = newProjectileBots;

  // draw

  drawMars();

  if (gameState.canvasContext !== null) {
    //gameState.canvasContext.fillStyle = "rgba(" + 0 + "," + 0 + "," + 0 + "," + 0 + ")";
    //gameState.canvasContext.fillRect(0, 0, gameState.gameWidth, gameState.gameHeight);
    gameState.canvasContext.clearRect(0, 0, gameState.gameWidth, gameState.gameHeight);

    // for (var s0 in gameState.stars) {
    //   var star = gameState.stars[s0];
    //   star.draw(gameState.canvasContext);
    // }

    for (var s1 in gameState.structures) {
      var structure = gameState.structures[s1];
      structure.draw(gameState.canvasContext, gameState.currentFrame);
    }

    for (var e1 in gameState.explosions) {
      gameState.explosions[e1].draw(gameState.canvasContext, gameState.currentFrame);
    }

    for (var bot1 in gameState.shipBots) {
      var shipBot1 = gameState.shipBots[bot1];
      shipBot1.ship.draw(gameState.canvasContext, gameState.currentFrame);
    }


    for (var b in gameState.projectileBots) {
      var bulletBot1 = gameState.projectileBots[b];
      bulletBot1.projectile.draw(gameState.canvasContext, gameState.currentFrame);
    }
    gameState.playerShip.draw(gameState.canvasContext);
  }

  //random ship generator
  for (var i = shipCount; i < 25; i = i + 1) {
    var randomShip = RandomShip(gameState);
    gameState.shipBots[randomShip.id] = new ShipBot(gameState.currentFrame, randomShip);
  }

  //$("#playerInfo").html('Angle: ' + gameState.playerShip.sprite.rotationAngle);


  gameState.currentFrame = gameState.currentFrame + 1;

  // variable frame rate?
  if (gameState.currentFrame % 30 === 0) {
    var now = Date.now();
    var fr = 30 / ((now - gameState.lastMeasured) / 1000);
    $("#playerInfo").html(fr.toPrecision(3) + " fps");
    gameState.lastMeasured = now;
    gameState.frameRate = fr;
  }
  var error = 30 - gameState.frameRate;
  var delay = 1000 / (30 + error);
  //$("#playerInfo").append("<br />" + delay.toPrecision(3));
  setTimeout(step, delay);
};

var gameState = (function(){

  var state = {
    "gameWidth" : 0,
    "gameHeight" : 0,
    "canvasContext" : null,
    "backdrop" : null,
    "currentFrame" : 0,
    "testScaledSprite" : null,

    "buildings" : [],
    "projectileBots" : [],
    "explosions" : [],

    "playerShip" : null,
    "keysDown" : [],

    "structures" : [],
    "shipBots" : [],
    "stars" : [],
    "factions" : (function(){var fxns=[];for(var f in factionsMap){fxns[factionsMap[f].id]=factionsMap[f];}return fxns;})(),
    "quadTrees" : {},
    "started" : Date.now(),
    "lastMeasured" : Date.now(),
    "frameRate" : 30
  };

  state.centerPosition = function () {
    return { "position" : new Victor(state.gameWidth / 2, state.gameHeight / 2) };
  }

  state.randomFaction = (function(){
    var factionsArr = [];
    for (var f in state.factions) { factionsArr.push(state.factions[f]); }
    return function() {
      return factionsArr[Math.floor(Math.random() * factionsArr.length)];
    };
  })();

  state.bulletHits = function(blt) {
    var candidates = [];
    for (var qt in state.quadTrees) {
      if (qt !== blt.wielder.faction.id) {
        var someCandidates = state.quadTrees[qt].retrieve({ 'x': blt.position.x - blt.radius, 'y': blt.position.y - blt.radius, 'width': 2 * blt.radius, 'height': 2 * blt.radius });
        for (var cand in someCandidates) {
          candidates.push(someCandidates[cand]);
        }
      }
    }
    return candidates;
  };

  state.loadImages = function() {
    for( var a in imgLoadInfo ) { Asset( imgLoadInfo[a], function(){}); }
  };

  state.init = function() {
    var gameWidth = $(document).width();
    var gameHeight = $(document).height();

    console.log("Creating game with dimensions: " + gameWidth + "x" + gameHeight);
    state.gameWidth = gameWidth;
    state.gameHeight = gameHeight;

    $("#starfield").html('<canvas id="starfieldCanvas" style="border: none; position: absolute; top: 0px; left: 0px; width: ' + gameWidth + 'px; height: ' + gameHeight + 'px;" width="' + gameWidth + '" height="' + gameHeight + '"></canvas>');
    var starfieldCanvas = document.getElementById("starfieldCanvas");
    state.starfieldContext = starfieldCanvas.getContext("2d");

    $("#marsView").html('<canvas id="martianView" style="border: none; position: absolute; top: 0px; left: 0px; width: ' + gameWidth + 'px; height: ' + gameHeight + 'px;" width="' + gameWidth + '" height="' + gameHeight + '"></canvas>');

    $("#game").html('<canvas id="gameCanvas" style="border: none; position: absolute; top: 0px; left: 0px; width: ' + gameWidth + 'px; height: ' + gameHeight + 'px;"  width="' + gameWidth + '" height="' + gameHeight + '">');
    var gameCanvas = document.getElementById("gameCanvas");
    state.canvasContext = gameCanvas.getContext("2d");

    // random turret generator
    for (var i1 = 0; i1 < 10; i1 = i1 + 1) {
      var randomTurret = RandomTurret(gameState, i1);
      gameState.structures[randomTurret.id] = randomTurret; //new TurretBot(gameState.currentFrame, randomTurret);
    }

    var playerShip = new Hammerhead(state.currentFrame, new Victor(320, 240), new Victor(0, -1), new Victor(0, -1), 0, factionsMap.blue);
    state.playerShip = playerShip;

    for (var f in state.factions) {
      var faction = state.factions[f];
      state.quadTrees[faction.id] = new Quadtree({ x: 0, y: 0, width: gameWidth, height: gameHeight });
    }

    var starfield = StarField.random(800, 0, 0, gameWidth, gameHeight);
    starfield.draw(state.starfieldContext);
    webGLStart();
  };

  state.clearQuadTrees = function(){
    for (var qt in state.quadTrees) {
      state.quadTrees[qt].clear();
    }
    
  };
  state.nearestEnemy = function(seeker) {

    var nearestEnemy = null;
    var nearestDistanceSq = Number.MAX_VALUE;

    var queryObject = {
      'x': seeker.position.x - seeker.radius,
      'y': seeker.position.y - seeker.radius,
      'width': 2 * seeker.radius,
      'height': 2 * seeker.radius
    };

    for (var factionId in state.quadTrees) {
      if (seeker.faction.id !== factionId) {
        var quadTree = state.quadTrees[factionId];
        var nn = quadTree.nearestNeighbor(queryObject);
        if (nn !== null) {
          var tempDist = seeker.position.distanceSq(nn.ship.position);
          if (tempDist < nearestDistanceSq) {
            nearestDistanceSq = tempDist;
            nearestEnemy = nn.ship;
          }
        }
      }
    }
    
    return nearestEnemy;
  };

  return state;
})();


$(document).ready(function(){
  
  gameState.loadImages();
  gameState.init();

	setTimeout(step, 33);

  // control
  $(document).keyup(function(e){
    if (e.preventDefault) { e.preventDefault(); } else { e.returnValue = false; }
    var kc = e.keyCode || e.which;
    gameState.keysDown[kc] = false;
  });

	$(document).keydown(function(e){
    if (e.preventDefault) { e.preventDefault(); } else { e.returnValue = false; }
    var kc = e.keyCode || e.which;
    gameState.keysDown[kc] = e.type == 'keydown';
	});
});