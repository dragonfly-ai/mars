/*
* RGB Singleton
*
* includes : RGB object factory method, toHex, toLab, random
*/

var RGB = (function() {
  function componentToHex(c) { var hex = c.toString(16); return hex.length == 1 ? "0" + hex : hex; }
  function validIntensity(i) { return i >= 0 && i < 256; }
  function fromInt(color) {
		var r = (color >> 16) & 255; // 255
		var g = (color >> 8) & 255; // 122
		var b = color & 255; // 15
		return RGB(r,g,b);
  }
  var factory = function(red, green, blue) {
    if (validIntensity(red) && validIntensity(green) && validIntensity(blue)) {
      return {
        "red" : red,
        "green" : green,
        "blue" : blue,
        "html" : function() { return "#" + this.toString(); },
        "svg" : function(alpha) {
          if (typeof alpha === 'undefined') alpha = 1.0;
          return "rgba(" + this.red + "," + this.green + "," + this.blue + "," + alpha + ")";
        },
        "toHsv" : function() { return HSV.fromRgb(this); },
        "toHsl" : function() { return HSL.fromRgb(this); },
        "toLab" : function() { return Lab.fromRgb(this); },
	      "toCMYK": function() { return CMYK.fromRgb(this);},
        "equals" : function() { return this.red===red && this.green===green && this.blue===blue; },
        "toString" : function() { return componentToHex(red) + componentToHex(green) + componentToHex(blue); },
	      "watermark" : function() {
          var lab = this.toLab();
          var water = (lab.L > 50 ? Lab(lab.L - 35, lab.a, lab.b) : Lab(lab.L + 35, lab.a, lab.b));
          return water.toRGB();
        },
	      "toInt" : function() {
      		return 0xff000000 | ((red & 255) << 16) | ((green & 255) << 8) | (blue & 255);
      	}
      }
    } else throw "RGB(" + red + "," + green + "," + blue + ") intensities must lie between [0 and 255]";
  }
  factory.random = function(){ return RGB(parseInt(Math.random() * 255), parseInt(Math.random() * 255), parseInt(Math.random() * 255)); };

  factory.WHITE = function(){ return factory(255, 255, 255); };
  factory.GRAY = function(){ return factory(128, 128, 128); };
  factory.BLACK = function(){ return factory(0, 0, 0); };
  factory.fromInt = fromInt;
  return factory;
})();


/*
* Lab Singleton
*
* includes : Lab object factory method, toRGB, random
*/
var Lab = (function(){

  function prepLab(u){if (u > 0.008856) return Math.pow(u, 1.0/3.0); else return (7.787 * u) + 0.137931034;}
  function strikeLab(v){ var u = v*v*v; return (u > 0.008856 ? u : (v - 0.137931034) / 7.787); }

  function prepXyz(u){
    if (u > 10) return Math.pow(u * 0.003717126661090977 + 0.05213270142180095, 2.4) * 100.0;
    else return u * 0.03035269835488375;
  }

  function strikeXyz(v){
    var u0 = (Math.pow((v * 0.01), 0.4166666666666667) - 0.05213270142180095) * 269.025;
    var u = (u0 > 10.0 ? u0 : (v / 0.03035269835488375));
    return Math.max(0, Math.min(u, 255));
  }



  var factory = function(L, a, b) {
    return {
      "L" : L,
      "a" : a,
      "b" : b,
      "equals" : function(){return this.L===L && this.a===a && this.b===b;},
      "toString" : function(){ return "Lab(" + L + "," + a + "," + b + ")"; },
      "html" : function() { return this.toRGB().html(); },
      "snap" : function() { return Lab(parseInt(L), parseInt(a), parseInt(b)) },
      "toRGB" : function toRgb() {
		    var labY = (this.L + 16.0) / 116.0;

		    var X = strikeLab(this.a / 500.0 + labY) * 95.047;
		    var Y = strikeLab(labY) * 100.0;
		    var Z = strikeLab(labY - this.b / 200.0) * 108.883;
		    var rgb = RGB(
		      parseInt(strikeXyz(X * 3.24065 + Y * -1.5372 + Z * -0.4986)),
		      parseInt(strikeXyz(X * -0.9689 + Y * 1.87585 + Z * 0.04155)),
		      parseInt(strikeXyz(X * 0.05575 + Y * -0.2040 + Z * 1.0570))
		    );
		    return rgb;
  		}
    }
  }

  factory.fromRgb = function(rgb) {
    var R = prepXyz(rgb.red);
    var G = prepXyz(rgb.green);
    var B = prepXyz(rgb.blue);

    var labX = prepLab(R * 0.004338906014918935 + G * 0.0037623491535766513 + B * 0.0018990604648226666);
    var labY = prepLab(R * 0.0021260000000000003 + G * 0.0071519999999999995 + B * 0.000722);
    var labZ = prepLab(R * 0.00017725448417108274 + G * 0.0010947530835851327 + B * 0.008729553741171717);

    return Lab((116.0 * labY) - 16.0, 500.0 * (labX - labY), 200.0 * (labY - labZ));
  };

  factory.random = function () { return RGB.random().toLab(); };

  return factory;
  
})();

var CMYK = (function(){
  
  function toRgb(CMYK) {
  
      function padZero(str) {
          return "000000".substr(str.length)+str
      }
  
      var cyan = (CMYK.C * 255 * (1-CMYK.K)) << 16;
      var magenta = (CMYK.M * 255 * (1-CMYK.K)) << 8;
      var yellow = (CMYK.Y * 255 * (1-CMYK.K)) >> 0;
  
      var black = 255 * (1-CMYK.K);
      var white = black | black << 8 | black << 16;
  
      var color = white - (cyan | magenta | yellow );
      //console.log(cyan + " " + magenta + " " + yellow);
      //fix this.
      var hex = padZero(color.toString(16));
      var r = parseInt(hex.substr(0,2), 16);
      var g = parseInt(hex.substr(2,2), 16);
      var b = parseInt(hex.substr(4,2), 16);
      return RGB(r,g,b);
  }
  
  var factory = function(C,M,Y,K){
    return{
      "C" : C,
      "M" : M,
      "Y" : Y,
      "K" : K,
      "toRGB" : function() { return toRgb(this) },
    }
  };
  
  factory.fromRgb = function(rgb){
    var r = rgb.red;
    var g = rgb.green;
    var b = rgb.blue;
    var computedC = 0;
    var computedM = 0;
    var computedY = 0;
    var computedK = 0;
    
    //remove spaces from input RGB values, convert to int
    var r = parseInt( (''+r).replace(/\s/g,''),10 ); 
    var g = parseInt( (''+g).replace(/\s/g,''),10 ); 
    var b = parseInt( (''+b).replace(/\s/g,''),10 ); 
    
    if ( r==null || g==null || b==null ||
     isNaN(r) || isNaN(g)|| isNaN(b) )
    {
    alert ('Please enter numeric RGB values!');
    return;
    }
    if (r<0 || g<0 || b<0 || r>255 || g>255 || b>255) {
    alert ('RGB values must be in the range 0 to 255.');
    return;
    }
    
    // BLACK
    if (r==0 && g==0 && b==0) {
    computedK = 1;
    return [0,0,0,1];
    }
    
    computedC = 1 - (r/255);
    computedM = 1 - (g/255);
    computedY = 1 - (b/255);
    
    var minCMY = Math.min(computedC, Math.min(computedM,computedY));
    computedC = (computedC - minCMY) / (1 - minCMY) ;
    computedM = (computedM - minCMY) / (1 - minCMY) ;
    computedY = (computedY - minCMY) / (1 - minCMY) ;
    computedK = minCMY;
    
    computedC = computedC.toFixed(2);
    computedM = computedM.toFixed(2);
    computedY = computedY.toFixed(2);
    computedK = computedK.toFixed(2);
    return CMYK(computedC,computedM,computedY,computedK);
  }
  return factory;
})();

var HSV = (function(){
  var factory = function(h, s, v) {
    return {
      "hue" : h,
      "saturation" : s,
      "value" : v,
      "toRGB" : function() {
        var r, g, b;
      	s = Math.max(0, Math.min(100, s)) / 100;
      	v = Math.max(0, Math.min(100, v)) / 100;
      	if(s == 0) return RGB(Math.round(v * 255), Math.round(v * 255), Math.round(v * 255));
      	h = Math.max(0, Math.min(360, h)) / 60;
      	
      	var i = Math.floor(h);

      	var f = h - i; // factorial part of h
      	var p = v * (1 - s);
      	var q = v * (1 - s * f);
      	var t = v * (1 - s * (1 - f));

      	switch(i) {
      		case 0:r = v; g = t; b = p; break;
          case 1:r = q; g = v; b = p; break;
          case 2:r = p; g = v; b = t; break;
          case 3:r = p; g = q; b = v; break;
          case 4:r = t; g = p; b = v; break;
          default:r = v; g = p; b = q;
      	}

      	return RGB(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255));
      }
    };
  }

  // factory.fromRgb = function(rgb){
  //   //  1/255 = 0.00392156862745098
  //   var r = rgb.red * 0.00392156862745098;
  //   var g = rgb.green * 0.00392156862745098;
  //   var b = rgb.blue * 0.00392156862745098;

  //   var min = Math.min(r, Math.min(g, b));

  //   var V = Math.max(r, Math.max(g, b));

  //   var delta = V - min;
  //   if (delta < 0.0039) return HSV(0, 0, parseInt(100.0 * V));
  //   else {
  //     var h =  60.0;
  //     if (r == V) h = h * ((g - b) / delta) % 6;
  //     else if (g == V) h = h * (( b - r ) / delta) + 2;
  //     else h = h * ((r - g) / delta) + 4;
  //     h = parseInt((360.0 + h) % 360);
  //     return HSV(h, parseInt(100 * delta / V), parseInt(100.0 * V));
  //   }
  // }
  
      /*
      * added by Sanghyun on FEB 21, 2016
      */
      factory.fromRgb = function(rgb) {
        var rr, gg, bb,
            r = rgb.red / 255,
            g = rgb.green / 255,
            b = rgb.blue / 255,
            h, s,
            v = Math.max(r, g, b),
            diff = v - Math.min(r, g, b),
            diffc = function(c){
                return (v - c) / 6 / diff + 1 / 2;
            };
    
        if (diff == 0) {
            h = s = 0;
        } else {
            s = diff / v;
            rr = diffc(r);
            gg = diffc(g);
            bb = diffc(b);
    
            if (r === v) {
                h = bb - gg;
            }else if (g === v) {
                h = (1 / 3) + rr - bb;
            }else if (b === v) {
                h = (2 / 3) + gg - rr;
            }
            if (h < 0) {
                h += 1;
            }else if (h > 1) {
                h -= 1;
            }
        }
        return HSV(h * 360, s * 100, v * 100);
    }

  return factory;
})();

var HSL = (function(){
  var factory = function(h, s, l) {
    return {
      "hue" : h,
      "saturation" : s,
      "lightness" : l,
      "toRGB" : function() {
        var r, g, b, m, c, x;
        if (!isFinite(h)) h = 0;
        if (!isFinite(s)) s = 0;
        if (!isFinite(l)) l = 0;

        h = h / 60;
        if (h < 0) h = 6 - (-h % 6);
        h = h % 6;

        s = Math.max(0, Math.min(1, s / 100));
        l = Math.max(0, Math.min(1, l / 100));
        c = (1 - Math.abs((2 * l) - 1)) * s;
        x = c * (1 - Math.abs((h % 2) - 1));

        h = Math.floor(h);
        switch(h) {
          case 0:r = c; g = x; b = 0; break;
          case 1:r = x; g = c; b = 0; break;
          case 2:r = 0; g = c; b = x; break;
          case 3:r = 0; g = x; b = c; break;
          case 4:r = x; g = 0; b = c; break;
          default:r = c; g = 0; b = x; break;
        }
        m = l - c / 2;
        return RGB(Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255));
      }
    };
  }

  // factory.fromRgb = function(rgb) {
  //   //  1/255 = 0.00392156862745098
  //   var r = rgb.red * 0.00392156862745098;
  //   var g = rgb.green * 0.00392156862745098;
  //   var b = rgb.blue * 0.00392156862745098;

  //   var min = Math.min(r, Math.min(g, b));

  //   var V = Math.max(r, Math.max(g, b));
  //   var L = (V + min) * 0.5;

  //   var delta = V - min;
  //   if (delta < 0.0039) {
  //     return HSL(0, 0, parseInt(100.0 * L));
  //   } else {
  //     var h =  60.0;
  //     if (r == V) h = h * ((g - b) / delta) % 6;
  //     else if (g == V) h = h * (( b - r ) / delta) + 2;
  //     else h = h * ((r - g) / delta) + 4;
  //     h = parseInt((360.0 + h) % 360);

  //     return factory(h, parseInt(100.0 * delta / (1.0 - Math.abs(2.0 * L-1))), parseInt(100.0 * L));
  //   }
  // }
  
    /*
      * added by Sanghyun on FEB 21, 2016
    */
    factory.fromRgb = function(rgb){
      var r = rgb.red/255;
      var g = rgb.green/255;
      var b = rgb.blue/255;
      var max = Math.max(r, g, b), min = Math.min(r, g, b);
      var h, s, l = (max + min) / 2;
  
      if(max == min){
          h = s = 0; // achromatic
      }else{
          var d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          switch(max){
              case r: h = (g - b) / d + (g < b ? 6 : 0); break;
              case g: h = (b - r) / d + 2; break;
              case b: h = (r - g) / d + 4; break;
          }
          h /= 6;
      }
  
      return HSL(h * 360, s * 100, l * 100);
  }
      
    
  

  return factory;
})();

var ColorFrequency = (function(){
  var factory = function(c, f) {
    return {
      "c" : c,
      "f" : f,
      "toString" : function() {
        return "[" + c.toString() + ", " + f + "]";
      }
    }
  }
  factory.random = function() {
    return factory(RGB.random(), 50 + Math.random() * 10000);
  };
  return factory;
})();

var ColorPalette = (function(){
  var factory = function(){
    var counter = 0;
    var colorFrequencies = [];
    var id = -1;
    return {
      "setID" : function(n) {
        id = n;
      },
      "getID" : function() {
        return id;
      },
      "add" : function(cf) {
        colorFrequencies[counter] = cf;
        counter = counter + 1;
      },
      "each" : function(lambda) {
        for (var i in colorFrequencies) {
          lambda(colorFrequencies[i]);
        }
      },
      "toJson" : function() {
        var intFormat = [];
        for(var i in colorFrequencies){
          intFormat[i] = {};
          intFormat[i].f = colorFrequencies[i].f;
          intFormat[i].c = colorFrequencies[i].c.toInt();
          console.log("------------");
          console.log(colorFrequencies[i].c);
          console.log(colorFrequencies[i].c.toInt());
        }
        return { "colorFrequencies" : intFormat };
      },
      "colorFrequencies" : function() {
        return colorFrequencies;
      },
      "modifyColor" : function(index, colorFrequency){
        colorFrequencies[index] = colorFrequency;
        return this;
      },
      "cfAtIndex" : function(index){
        return colorFrequencies[index];
      }
    };
  };

  factory.random = function() {
    var palette = factory();
    for (var i = 0; i < 10 + Math.random() * 50; i = i + 1){
      palette.add(ColorFrequency.random());
    }
    return palette;
  }

  factory.fromJson = function(paletteJson) {
    var temp = (typeof paletteJson === "string" ? JSON.parse(paletteJson) : paletteJson);
    var p = factory();
    for (var i in temp.colorFrequencies) {
      var tcf = temp.colorFrequencies[i];
      p.add(ColorFrequency(RGB.fromInt(tcf.c), tcf.f));
    }
    p.setID(temp.id);
    return p;
  }
  

  return factory;
})();

var StreamingLabHistogram = (function(){
  var factory = function(hist){
    if (typeof hist === 'undefined') { hist = {}; }

    return {
      "histogram" : hist,
      "add" : function(c) {
        var lab = c.toLab();
        var rgba = lab.snap().toRGB().toInt();
        if (typeof hist[rgba] === 'undefined') {
          this.histogram[rgba] = [lab.L, lab.a, lab.b, 1];
        } else {
          this.histogram[rgba][0] = this.histogram[rgba][0] + lab.L;
          this.histogram[rgba][1] = this.histogram[rgba][1] + lab.a;
          this.histogram[rgba][2] = this.histogram[rgba][2] + lab.b;
          this.histogram[rgba][3] = this.histogram[rgba][3] + 1;
        }
      },
      "merge" : function(hist2Merge) {
        for(var rgba in hist2Merge.hist) {
          if (typeof hist[rgba] === 'undefined') {
            this.histogram[rgba] = [
              hist2Merge.hist[rgba][0],
              hist2Merge.hist[rgba][1],
              hist2Merge.hist[rgba][2],
              hist2Merge.hist[rgba][3]
            ];
          } else {
            this.histogram[rgba][0] = this.histogram[rgba][0] + hist2Merge.hist[rgba][0];
            this.histogram[rgba][1] = this.histogram[rgba][1] + hist2Merge.hist[rgba][1];
            this.histogram[rgba][2] = this.histogram[rgba][2] + hist2Merge.hist[rgba][2];
            this.histogram[rgba][3] = this.histogram[rgba][3] + hist2Merge.hist[rgba][3];
          }
        }
      }
    }
  }
})();
