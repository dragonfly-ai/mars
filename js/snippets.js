/*
  piranha sprites are 26x26 each.  Whole image is 168 x 168
  Select subsprite with clip as so:
  img {
    position: absolute;
    clip: rect(0px,60px,200px,0px);
  }
*/

// var rotationOffsetMap = [
//   [0,1,1,0],[0,2,1,1],[0,3,1,2],[0,4,1,3],[0,5,1,4],[0,6,1,5],
//   [1,1,2,0],[1,2,2,1],[1,3,2,2],[1,4,2,3],[1,5,2,4],[1,6,2,5],
//   [2,1,3,0],[2,2,3,1],[2,3,3,2],[2,4,3,3],[2,5,3,4],[2,6,3,5],
//   [3,1,4,0],[3,2,4,1],[3,3,4,2],[3,4,4,3],[3,5,4,4],[3,6,4,5],
//   [4,1,5,0],[4,2,5,1],[4,3,5,2],[4,4,5,3],[4,5,5,4],[4,6,5,5],
//   [5,1,6,0],[5,2,6,1],[5,3,6,2],[5,4,6,3],[5,5,6,4],[5,6,6,5]
// ];

function angleToCropOffsets(theta, stride) {
  var tileCount = stride * stride; /* naming the tiles in the .png animation images*/
  var angleGranularity = 360 / tileCount;
  var linearOffset = parseInt(theta / angleGranularity) % tileCount;
  if (linearOffset < 0) linearOffset = tileCount + linearOffset;
  return [
    parseInt(linearOffset / stride),
    parseInt(linearOffset % stride) + 1,
    parseInt(linearOffset / stride) + 1,
    parseInt(linearOffset % stride)
  ]
}



sprite.drawCss = function() {
  //if (typeof offsets === 'undefined') { console.log(rotationMapKey + " " + offsets); }
  var offsets = angleToCropOffsets(sprite.rotationAngle, stride);
 sprite.image.css("top", parseInt(sprite.position.y - (offsets[0] * clipWidth) - clipHeight/2) + "px");
 sprite.image.css("left", parseInt(sprite.position.x - (offsets[3] * clipHeight) - clipWidth/2) + "px");

  sprite.image.css(
    "clip",
    "rect(" +
      (offsets[0] * clipWidth) + "px," +
      (offsets[1] * clipWidth) + "px," +
      (offsets[2] * clipWidth) + "px," +
      (offsets[3] * clipWidth) + "px" +
    ")"
  );
  //sprite.image.css( "transform", "scale(" + scale + "," + scale + ")");
};