
var gameState = (function(){
  var gameWidth = 1200;  //$(document).width(),
  var gameHeight = 800;  //$(document).height(),
  var state = {
    "gameWidth" : gameWidth,
    "gameHeight" : gameHeight,
    "canvasContext" : null,
    "backdrop" : null,
    "currentFrame" : 0,
    "testScaledSprite" : null,

    "buildings" : [],
    "bullets" : [],
    "explosions" : [],

    "playerShip" : null,
    "keysDown" : [],

    "nonPlayerShips" : [],
    "factions" : (function(){
      var factions = [];
      for (var f in factionsMap) { factions[factionsMap[f].id] = factionsMap[f]; }
      return factions;
    })(),
    "quadTrees" : {},
    "started" : Date.now()
  };

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
        var someCandidates = state.quadTrees[qt].retrieve({ 'x': blt.position.x, 'y': blt.position.y, width: 20, height: 20 });
        for (var cand in someCandidates) {
          candidates.push(someCandidates[cand]);
        }
      }
    }
    return candidates;
  };

  state.loadImages = function() {
    for( var a in imgLoadInfo ) Asset( imgLoadInfo[a], function(){});
  };

  state.init = function() {
    $("#game").html('<canvas id="gameCanvas" width="' + gameWidth + '" height="' + gameHeight + '">');
      var gameCanvas = document.getElementById("gameCanvas");
      state.canvasContext = gameCanvas.getContext("2d");

      state.backdrop = new StarfieldBackdrop(state.currentFrame, new Victor(state.gameWidth / 2, state.gameHeight / 2));

      var miniJupiterInfo = Sprite.scaleSprite("miniJupiter", imgLoadInfo.jupiter, 304, 304);
      gameState.testScaledSprite = new Sprite(miniJupiterInfo, 8);

      var playerShip = new Piranha(state.currentFrame, new Victor(320, 240), new Victor(0, -1), new Victor(0, -1), 0, factionsMap["purple"]);
      state.playerShip = playerShip;

      for (var f in state.factions) {
        var faction = state.factions[f];
        state.quadTrees[faction.id] = new Quadtree({ x: 0, y: 0, width: gameWidth, height: gameHeight });
      }

      //random pirana generator
      for (var i = 0; i < 250; i = i + 1) {
        var randomShip = new Piranha(
          state.currentFrame,
          new Victor(Math.random() * gameWidth, Math.random() * gameHeight),
          (new Victor(Math.random() - 0.5, Math.random() - 0.5)).normalize(),
          (new Victor(Math.random() - 0.5, Math.random() - 0.5)).normalize(),
          Math.random(),
          state.randomFaction()
        );

        state.nonPlayerShips.push(randomShip);
      }
      
  };
  state.clearQuadTrees = function(){
    for (var qt in state.quadTrees) {
      state.quadTrees[qt].clear();
    }
    
  };
  return state;
})();