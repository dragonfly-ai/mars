
/* global $ UUID Victor Asset Image RGB HSV */

var Sprite = (function(){
  var factory = function(imgSrc, stride) {

    // defaults
    this.stride = (typeof stride === 'undefined' ? 1 : stride);

    // public variables
    this.id = UUID();
    this.tileCount = this.stride * this.stride;
    this.angleGranularity = 360 / this.tileCount;

    var sprite = this;

    Asset( imgSrc, function(imgAsset){
      sprite.image = imgAsset.image;
      sprite.clipWidth = imgAsset.width / sprite.stride;
      sprite.clipHeight = imgAsset.height / sprite.stride;
    });

  };

  factory.prototype.draw = function(ctx, spaceMass, currentFrame) {
    if (this.image) {
      var linearOffset = 0;
      if (spaceMass.orientation) {
        linearOffset = parseInt((spaceMass.orientation.angleDeg()+90) / this.angleGranularity, 10) % this.tileCount;
        if (linearOffset < 0) { linearOffset = this.tileCount + linearOffset; }
      }
      ctx.drawImage(
        this.image,
        parseInt(linearOffset % this.stride, 10) * this.clipWidth,
        parseInt(linearOffset / this.stride, 10) * this.clipHeight,
        this.clipWidth,
        this.clipHeight,
        parseInt(spaceMass.position.x - this.clipWidth/2, 10),
        parseInt(spaceMass.position.y - this.clipHeight/2, 10),
        this.clipWidth,
        this.clipHeight
      );
    } else {
      var color = RGB(255, 255, 255);
      if (spaceMass.faction) {
        color = spaceMass.faction.color;
      }
      ctx.beginPath();
      ctx.arc(spaceMass.position.x, spaceMass.position.y, spaceMass.radius, 0, 2 * Math.PI, false);
      ctx.fillStyle = color.svg(0.15);
      ctx.fill();
  
      ctx.lineWidth = 1;
      ctx.strokeStyle = RGB(255, 255, 255).svg(0.5);
      ctx.stroke();
    }
  };

  factory.scaleSprite = function(derivedName, baseImageInfo, scaledWidth, scaledHeight) {
    var derivedImgInf = DerivedImageInfo(derivedName, UUID(), null, scaledWidth, scaledHeight);
    Asset(baseImageInfo, function(baseAsset) {
        var baseCanvas = document.createElement('canvas');
        baseCanvas.width = scaledWidth;
        baseCanvas.height = scaledHeight;
        var baseContext = baseCanvas.getContext("2d");
        //  context.drawImage(img,sx,sy,swidth,sheight,x,y,width,height);
        baseContext.drawImage(baseAsset.image, 0, 0, baseAsset.width, baseAsset.height, 0, 0, scaledWidth, scaledHeight );

        derivedImgInf.image = new Image(scaledWidth, scaledHeight);
        derivedImgInf.image.src = baseCanvas.toDataURL('image/png');
        
        Asset.add(derivedImgInf);
    });
    return derivedImgInf;
  };

  factory.getScaledSpriteInfo = (function(){
    var spriteCache = {};
    var getSprite = function(imgSrc, scaledWidth, scaledHeight) {
      var query = imgSrc.name+"-"+scaledWidth+"X"+scaledHeight;
      var scaledSpriteInfo = spriteCache[query];
      if (typeof scaledSpriteInfo === 'undefined') {
        return Sprite.scaleSprite(query, imgSrc, scaledWidth, scaledHeight);
      } else return scaledSpriteInfo;
    };
    return getSprite;
  })();

  function applyColorTint(baseAsset, imageInfo, color) {
    var baseCanvas = document.createElement('canvas');
    baseCanvas.width = imageInfo.width;
    baseCanvas.height = imageInfo.height;
    var baseContext = baseCanvas.getContext("2d");
    baseContext.drawImage(baseAsset.image, 0, 0 );
    var baseImageData = baseContext.getImageData(0, 0, imageInfo.width, imageInfo.height);

    var tintColor = color.toHsv();
    for (var i = 0; i < baseImageData.data.length; i += 4) {
      if (baseImageData.data[i+3] > 0) {
        var tempColor = RGB(baseImageData.data[i], baseImageData.data[i+1], baseImageData.data[i+2]).toHsv();
        tempColor = HSV(tintColor.hue, tempColor.saturation, tempColor.value).toRGB();
        baseImageData.data[i] = tempColor.red;
        baseImageData.data[i+1] = tempColor.green;
        baseImageData.data[i+2] = tempColor.blue;
      }
    }

    baseContext.putImageData(baseImageData, 0, 0);

    var image = new Image(imageInfo.width, imageInfo.height);
    image.src = baseCanvas.toDataURL('image/png');
    return image;
  }

  factory.applyTint = function(baseImageInfo, color, radius, stride) {
    var tintedSpriteInfo = DerivedImageInfo(baseImageInfo.name + "-" + color.toString(), UUID(), null, 2*radius*stride, 2*radius*stride);

    Asset(baseImageInfo, function(baseAsset) {
      tintedSpriteInfo.image = applyColorTint(baseAsset, tintedSpriteInfo, color);
      Asset.add(tintedSpriteInfo);
    });

    return tintedSpriteInfo;
  };

  function applyColorMask(baseAsset, maskAsset, color) {
    var baseCanvas = document.createElement('canvas');
    baseCanvas.width = maskAsset.width;
    baseCanvas.height = maskAsset.height;
    var baseContext = baseCanvas.getContext("2d");
    baseContext.drawImage(baseAsset.image, 0, 0 );
    var baseImageData = baseContext.getImageData(0, 0, maskAsset.width, maskAsset.height);
    var maskCanvas = document.createElement('canvas');
    maskCanvas.width = maskAsset.width;
    maskCanvas.height = maskAsset.height;
    var maskContext = maskCanvas.getContext("2d");
    maskContext.drawImage(maskAsset.image, 0, 0 );
    var maskImageData = maskContext.getImageData(0, 0, maskAsset.width, maskAsset.height);

    var tintColor = color.toHsv();
    for (var i = 0; i < baseImageData.data.length; i += 4) {
      if (maskImageData.data[i] > 0) {
        var tempColor = HSV(tintColor.hue, tintColor.saturation, RGB(baseImageData.data[i], baseImageData.data[i+1], baseImageData.data[i+2]).toHsv().value).toRGB();
        baseImageData.data[i] = tempColor.red;
        baseImageData.data[i+1] = tempColor.green;
        baseImageData.data[i+2] = tempColor.blue;
      }
    }

    baseContext.putImageData(baseImageData, 0, 0);

    var image = new Image(maskAsset.width, maskAsset.height);
    image.src = baseCanvas.toDataURL('image/png');
    return image;
  }

  factory.applyFactionMask = function(baseImageInfo, colorMask, faction, radius, stride) {
    var faction = factionsMap[faction.name];
    var factionSpriteInfo = DerivedImageInfo(baseImageInfo.name + faction.name, UUID(), null, 2*radius*stride, 2*radius*stride);

    Asset(baseImageInfo, function(baseAsset) {
      Asset(colorMask, function(maskAsset) {
        factionSpriteInfo.image = applyColorMask(baseAsset, maskAsset, faction.color);
        Asset.add(factionSpriteInfo);

      });
    });
    return factionSpriteInfo;
  };

  factory.getFactionMasks = function(baseImageInfo, colorMask, radius, stride) {
    var factionSprites = [];
    for (var factionName in factionsMap) {
      var faction = factionsMap[factionName];
      factionSprites[faction.id] = DerivedImageInfo(baseImageInfo.name + factionName, UUID(), null, 2*radius*stride, 2*radius*stride);
    }
  
    Asset(baseImageInfo, function(baseAsset) {
      Asset(colorMask, function(maskAsset) {
  
        for (var factionName in factionsMap) {
          var faction = factionsMap[factionName];
          factionSprites[faction.id].image = applyColorMask(baseAsset, maskAsset, faction.color);
          Asset.add(factionSprites[faction.id]);
  
        } 
      });
    });
    return factionSprites;
  };
  
  return factory;
})();

var ThrusterSprite = (function(){
  // Do not inherit!
  var factory = function(imgSrc, stride) {
    this.baseSprite = new Sprite(imgSrc, stride);
    this.alpha = 0.0;
    this.previousSpeed = 0;
  };

  factory.prototype.draw = function(ctx, spaceMass, currentFrame) {
    if (spaceMass.speed != this.previousSpeed) {
      this.alpha = Math.min(1.0, this.alpha + 0.25);
    } else {
      this.alpha = Math.max(0.0, this.alpha - 0.1);
    }
    this.previousSpeed = spaceMass.speed;
    if (this.alpha > 0.0) {
      ctx.globalAlpha = this.alpha;
      this.baseSprite.draw(ctx, spaceMass);
      ctx.globalAlpha = 1.0;
    }
  };
  return factory;
})();

var LightSprite = (function(){
  var factory = function(imgSrc, stride, lightInterval) {
    this.baseSprite = new Sprite(imgSrc, stride);
    this.lightInterval = (typeof lightInterval === 'undefined' ? 60 : lightInterval);
  };
  factory.prototype.draw = function(ctx, spaceMass, currentFrame) {
    if ((currentFrame - spaceMass.creationFrame) % this.lightInterval === 0) {
      this.baseSprite.draw(ctx, spaceMass);
    }
  };
  return factory;
})();

var AnimatedSprite = (function(){
  var factory = function(imgSrc, stride, frameRate) {
    this.baseSprite = new Sprite(imgSrc, stride);
    this.frameRate = (typeof frameRate === 'undefined' ? 1 : frameRate);
  };
  factory.prototype.draw = function(ctx, spaceMass, currentFrame) {
    
    var linearOffset = (currentFrame - spaceMass.creationFrame) % this.baseSprite.tileCount;

    ctx.drawImage(
      this.baseSprite.image,
      parseInt(linearOffset % this.baseSprite.stride, 10) * this.baseSprite.clipWidth,
      parseInt(linearOffset / this.baseSprite.stride, 10) * this.baseSprite.clipHeight,
      this.baseSprite.clipWidth,
      this.baseSprite.clipHeight,
      parseInt(spaceMass.position.x - this.baseSprite.clipWidth/2, 10),
      parseInt(spaceMass.position.y - this.baseSprite.clipHeight/2, 10),
      this.baseSprite.clipWidth,
      this.baseSprite.clipHeight
    );
  };
  return factory;
})();

var ScaledSprite = (function(){
  // Do not inherit!
  var factory = function(imgSrc, stride, dimension) {
    this.baseSprite = new Sprite(Sprite.getScaledSpriteInfo(imgSrc, dimension, dimension), stride);
    this.dimension = 0.0;
  };

  factory.prototype.draw = function(ctx, spaceMass, currentFrame) {
    this.baseSprite.draw(ctx, spaceMass, currentFrame);
  };
  return factory;
})();