/* global $ UUID RGB */

// For faction colors.
// var Color = (function(){
//   var factory = function(r, g, b) {
//     this.r = r;
//     this.g = g;
//     this.b = b;
//   }
//   factory.prototype.rgbaString = function(a) {
//     if (typeof a === 'undefined') a = 1.0;
//     return "rgba(" + this.r + "," + this.g + "," + this.b + "," + a + ")";
//   }
//   return factory;
// })();

var Faction = (function(){
  var factory = function(name, color) {
    this.id = UUID();
    this.name = name;
    this.color = color;
  }
  return factory;
})();