/* global $ Queue */

var LoadImageInfo = (function(){
  function getFileName(path) {
    var tokens = path.split("/");
    return tokens[tokens.length-1].split(".")[0];    
  }
  var factory = function(src) {
    this.id = UUID();
    this.src = src + "";
    this.name = getFileName(src);
  }
  return factory;
})();

var DerivedImageInfo = (function(){
  var factory = function(name, id, image, width, height) {
    return {
      "id" : id,
      "name" : name,
      "image" : image,
      "width" : width,
      "height" : height
    }
  }
  return factory;
})();

var Asset = (function(){
  var repository = (function(){
    //private arrays:
    var repo = [];

    var apply = function(assetInfo) {  // apply method adds a new asset to the registry.
      repo[assetInfo.id] = assetInfo;
      return assetInfo;
    };

    apply.get = function(id){
      return repo[id];
    }
    return apply;
  })();

  var factory = function(loadableAssetInfo, callback) {
    var asset = repository.get(loadableAssetInfo.id);

    if (typeof asset === 'undefined') {
      asset = repository({
        "id" : loadableAssetInfo.id,
        "image" : null,
        "loaded" : false,
        "width" : null,
        "height" : null,
        "callbackQueue" : new Queue()
      });

      asset.callbackQueue.enqueue(callback);

      if (typeof loadableAssetInfo.src !== 'undefined') {
        var jQryImg = $("<img src='" + loadableAssetInfo.src + "' />");
        $("#preloadContent").append(jQryImg);
  
        jQryImg.on("load", function(){
          console.log("loaded image:" + loadableAssetInfo.src);

          asset.loaded = true;
          asset.image = jQryImg[0];
          asset.width = $(this).width();
          asset.height = $(this).height();
          //console.log(loadableAssetInfo.name + " " + asset.width + " " + asset.height);

          while (!asset.callbackQueue.isEmpty()) {
            asset.callbackQueue.dequeue()(asset);
          }
        });
      }
    } else {
      if (asset.loaded) {
        callback(asset);
      } else {
        asset.callbackQueue.enqueue(callback);
      }
    }

    return asset;
  };

  factory.add = function(derivedAssetInfo, callback) {
    var asset = repository.get(derivedAssetInfo.id);

    if (typeof asset === 'undefined') {
      asset = repository({
        "id" : derivedAssetInfo.id,
        "image" : derivedAssetInfo.image,
        "loaded" : true,
        "width" : derivedAssetInfo.width,
        "height" : derivedAssetInfo.height
      });
    } else {
      asset.image = derivedAssetInfo.image;
      asset.loaded = true;
      asset.width = derivedAssetInfo.width;
      asset.height = derivedAssetInfo.height;
    }

    if (typeof asset.callbackQueue !== 'undefined') {
      while (!asset.callbackQueue.isEmpty()) {
        asset.callbackQueue.dequeue()(asset);
      }
    }

    return asset;
  }

  return factory;
})();
