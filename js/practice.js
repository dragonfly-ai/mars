// TWO ways to declare functions in javascript:

// concise:
function f(x) {
  return 2 * x + 7;
}

// lambda oriented:
var f1 = function(x) {
  return 2 * x + 3;
}



/*
Now we have the same concepts, but because we're programmers, not mathematicians, we have our own name for things.
f is the name of the function.
x is a function parameter, or an argument.  Function parameters give names to the inputs of the function.
everything between { and } are called statements.
the last statement, if it begins with the word: return, is called the return statement.  Return statements control the output of a function.
*/

function makeLinearEquation (m, b) {  // remember algebra?  Y = mX + b where m is the slope, and b is the y-intercept.
  return function(x) {
    return m * x + b;
  }
}

// f is a function that you pass into transformX,
// x is the number to transform, in this case, to square.
function transformX(f, x) {
  return f(x);
}
// transformX accepts two parameters as input: a number called x, and a function called f.
// If you want to call this function, you have to provide it with a number and a lambda
// that takes a number as a parameter like so:
// transformX( function(x){ return 2 * x + 3; }, 3 );  outputs 9.

var z = 6;
var w = 11;

// clear
transformX(
  (function(x){
    return x * x;
  }),
  3
);




// concise 
print(transformX(function(z){ return z+z; }, w));

/* transformX(
  function(x){
    return x*2;
  },
  21
);

// your answer should look like this:
/*transformX(
  (function(x){
    return 2 * x + 3;
  }),
  3
);
*/

function g(x) {
  return x * x + x + 1;
}

// print(function g(w){return w * w + w + 1;})

print (g(w));


/*

//General shape of objects (not syntax'd correctly just getting a handle on it.)


var object = objectName ;
    fieldName1: field1 ;
    fieldName2: field2 ;
    
    methodFunction() {objectName.field1 + ObjectName.field2)
    

*/

// There are two main ways to create objects in javascript.
// to create an Object called o with field x and method run

// Method 1:

var o1 = {};  // This is the right way.
//var o1 = new Object() // this is the wrong way.
o1.x = 0;  // This is a field or data member.
o1.run = function() { console.log("running " + o1.x); } // this is a method

// Method 2:
var o2 = {
  "x" : 0,   // this is a field
  "run" : function() {   // this is a method
    console.log("running " + this.x);
  }
};


// Factories.

// Factory method 1
var oFactory1 = function(){
  var o = {};  // simplest possible object literal
  o.x = 0;// this is a field
  o.run = function() { console.log("running " + o1.x); }  // this is a method
  return o1;
}

// Factory method 2
var Ship = function( x, y ){
  return {
    "x" : x,  // field
    "y" : y,  // field
    "reportLocation" : function() {  // method
      console.log("Ship Location: " + this.x + ", " + this.y);
    }
  }
}

// Factories allow us to create more objects without duplicating code.  Behold:
var ob1 = Ship(1, 4);
var ob2 = Ship(2, 5);
var ob3 = Ship(3, 6);


// Singleton pattern to simulate classes.
var SpaceShip = (function(){

  var shipCounter = 0;  // this counts all of the ships that have been created.  This is a class variable, or a static variable

  var factory = function(x, y) {

    var shipId = shipCounter;  // private data member or field

    shipCounter = shipCounter + 1;

    return {
      "x" : x,  // field
      "y" : y,  // field
      "reportLocation" : function() {  // method
        console.log("Ship " + shipId + "Location: " + this.x + ", " + this.y);
      },
      "getId" : function() {  // 
        return shipId;
      }
    }
  }

  factory.getShipCount = function() {   // this is a class method, or a static method.
    return shipCounter;
  }

  return factory;
})();

console.log(SpaceShip.getShipCount());

var ss1 = SpaceShip(100, 300);
console.log(SpaceShip.getShipCount());

var ss2 = SpaceShip(500, 200);
console.log(SpaceShip.getShipCount());

var ss3 = SpaceShip(100, 800);
console.log(SpaceShip.getShipCount());

var ss4 = SpaceShip(0, 700);
console.log(SpaceShip.getShipCount());



// AWESOME!

var Turret = (function(){
  var factory = function(imgSrc, position, direction, speed, maxSpeed, acceleration, stride ){
    
  }
});