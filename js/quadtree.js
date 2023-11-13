/*
 * Javascript Quadtree 
 * @version 1.1.1
 * @licence MIT
 * @author Timo Hausmann
 * https://github.com/timohausmann/quadtree-js/
 */
 
/*
 Copyright © 2012 Timo Hausmann

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENthis. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/* global $ Victor  */

;(function(window, Math) {

  // utility method.
  function pRectToPoint(pRect) {
    return {
      "x" : typeof pRect.width === 'undefined' ? pRect.x : (2 * pRect.x + pRect.width) / 2,
      "y" : typeof pRect.height === 'undefined' ? pRect.y : (2 * pRect.y + pRect.height) / 2
    };
  }
 	
	 /*
	  * Quadtree Constructor
	  * @param Object bounds		bounds of the node, object with x, y, width, height
	  * @param Integer max_objects		(optional) max objects a node can hold before splitting into 4 subnodes (default: 10)
	  * @param Integer max_levels		(optional) total max levels inside root Quadtree (default: 4) 
	  * @param Integer level		(optional) deepth level, required for subnodes  
	  */
	function Quadtree( bounds, max_objects, max_levels, level ) {
		
		this.max_objects	= max_objects || 10;
		this.max_levels		= max_levels || 4;
		
		this.level 		= level || 0;
		this.bounds 		= bounds;
		
		this.objects 		= [];
		this.nodes 		= [];

		this.size = 0;
	};
	
	
	/*
	 * Split the node into 4 subnodes
	 */
	Quadtree.prototype.split = function() {
		
		var 	nextLevel	= this.level + 1,
			subWidth	= Math.round( this.bounds.width / 2 ),
			subHeight 	= Math.round( this.bounds.height / 2 ),
			x 		= Math.round( this.bounds.x ),
			y 		= Math.round( this.bounds.y );		
	 
	 	//top right node
		this.nodes[0] = new Quadtree({
			x	: x + subWidth, 
			y	: y, 
			width	: subWidth, 
			height	: subHeight
		}, this.max_objects, this.max_levels, nextLevel);
		
		//top left node
		this.nodes[1] = new Quadtree({
			x	: x, 
			y	: y, 
			width	: subWidth, 
			height	: subHeight
		}, this.max_objects, this.max_levels, nextLevel);
		
		//bottom left node
		this.nodes[2] = new Quadtree({
			x	: x, 
			y	: y + subHeight, 
			width	: subWidth, 
			height	: subHeight
		}, this.max_objects, this.max_levels, nextLevel);
		
		//bottom right node
		this.nodes[3] = new Quadtree({
			x	: x + subWidth, 
			y	: y + subHeight, 
			width	: subWidth, 
			height	: subHeight
		}, this.max_objects, this.max_levels, nextLevel);
	};
	
	
	/*
	 * Determine which node the object belongs to
	 * @param Object pRect		bounds of the area to be checked, with x, y, width, height
	 * @return Integer		index of the subnode (0-3), or -1 if pRect cannot completely fit within a subnode and is part of the parent node
	 */
	Quadtree.prototype.getIndex = function( pRect ) {

		var 	index 			= -1,
			verticalMidpoint 	= this.bounds.x + (this.bounds.width / 2),
			horizontalMidpoint 	= this.bounds.y + (this.bounds.height / 2),
	 
			//pRect can completely fit within the top quadrants
			topQuadrant = (pRect.y < horizontalMidpoint && pRect.y + pRect.height < horizontalMidpoint),
			
			//pRect can completely fit within the bottom quadrants
			bottomQuadrant = (pRect.y > horizontalMidpoint);
		 
		//pRect can completely fit within the left quadrants
		if( pRect.x < verticalMidpoint && pRect.x + pRect.width < verticalMidpoint ) {
			if( topQuadrant ) {
				index = 1;
			} else if( bottomQuadrant ) {
				index = 2;
			}
			
		//pRect can completely fit within the right quadrants	
		} else if( pRect.x > verticalMidpoint ) {
			if( topQuadrant ) {
				index = 0;
			} else if( bottomQuadrant ) {
				index = 3;
			}
		}
	 
		return index;
	};
	
	
	/*
	 * Insert the object into the node. If the node
	 * exceeds the capacity, it will split and add all
	 * objects to their corresponding subnodes.
	 * @param Object pRect		bounds of the object to be added, with x, y, width, height
	 */
	Quadtree.prototype.insert = function( pRect ) {
		
		var i = 0, index;
		this.size = this.size + 1;
	 	
	 	//if we have subnodes ...
		//if( typeof this.nodes[0] !== 'undefined' ) {
	  if (this.nodes.length > 0) {
			index = this.getIndex( pRect );
	 
	  	if( index !== -1 ) {
				this.nodes[index].insert( pRect );	 
			 	return;
			}
		}

	 	this.objects.push( pRect );

		if( this.objects.length > this.max_objects && this.level < this.max_levels ) {

			//split if we don't already have subnodes
			if( typeof this.nodes[0] === 'undefined' ) {
				this.split();
			}

			//add all objects to their corresponding subnodes
			var newObjects = [];
			for( var i in this.objects ) {
				var obj = this.objects[i];
				index = this.getIndex(obj);
				
				if( index !== -1 ) {					
					this.nodes[index].insert(obj); //this.objects.splice(i, 1)[0] );
				} else {
					newObjects.push(obj);
			 	}
		 	}
		}
	 };
	 
	 
	/*
	 * Return all objects that could collide with the given object
	 * @param Object pRect		bounds of the object to be checked, with x, y, width, height
	 * @Return Array		array with all detected objects
	 */
	Quadtree.prototype.retrieve = function( pRect ) {
	 	
		var index = this.getIndex( pRect ), returnObjects = this.objects;
			
		//if we have subnodes ...
		if( typeof this.nodes[0] !== 'undefined' ) {
			
			//if pRect fits into a subnode ..
			if( index !== -1 ) {
				returnObjects = returnObjects.concat( this.nodes[index].retrieve( pRect ) );
				
			//if pRect does not fit into a subnode, check it against all subnodes
			} else {
				for( var i=0; i < this.nodes.length; i=i+1 ) {
					returnObjects = returnObjects.concat( this.nodes[i].retrieve( pRect ) );
				}
			}
		}

		return returnObjects;
	};

	/*
	 * Return the object nearest to the query object
 	 * @param Object pRect		bounds of the object to be checked, with x, y, width, height
	 * @Return Object o       The nearest object in the quadtree
	 */

  Quadtree.prototype.nearestNeighbor = function( pRect ) {
    var queryPoint = pRectToPoint(pRect);

    // find the smallest rectangle that contains this pRect
    var index = this.getIndex(pRect);
    var qt = this;
    while ( index >= 0 && qt.nodes.length > 0) {
      qt = qt.nodes[index];
      index = qt.getIndex(pRect);
    }

    var nearestObj = null;
    var candidates = [];
    var minDistSquared = Number.MAX_VALUE;

    if (qt.size <= 0){
      return nearestObj;
    }

    if (qt.objects.length > 0) {
      for (var o in qt.objects) {
        var mco = qt.objects[o];
        var matchCandidate = pRectToPoint(mco);
        var dx = queryPoint.x - matchCandidate.x; dx = dx * dx;
        var dy = queryPoint.y - matchCandidate.y; dy = dy * dy;
        var tempDist = dx * dx + dy * dy;
        if (tempDist < minDistSquared) {
          nearestObj = mco;
          minDistSquared = tempDist;
        }
      }
      var minDist = Math.sqrt(minDistSquared);
      candidates = this.retrieve({
        "x" : queryPoint.x,
        "y" : queryPoint.y,
        "width" : minDist,
        "height" : minDist
      });
    } else {
      candidates = this.retrieve({
        "x" : Number.MIN_VALUE,
        "y" : Number.MIN_VALUE,
        "width" : Number.MAX_VALUE,
        "height" : Number.MAX_VALUE
      });
    }

    for (var o1 in candidates) {
      var mco1 = candidates[o1];
      var matchCandidate1 = pRectToPoint(mco1);
      var dx1 = queryPoint.x - matchCandidate1.x; dx1 = dx1 * dx1;
      var dy1 = queryPoint.y - matchCandidate1.y; dy1 = dy1 * dy1;
      var tempDist1 = dx1 * dx1 + dy1 * dy1;
      if (tempDist1 < minDistSquared) {
        nearestObj = mco1;
        minDistSquared = tempDist1;
      }
    }

    return nearestObj;

  }

	/*
	 * Return 0-k objects that are nearest to the given object
 	 * @param Object pRect		bounds of the object to be checked, with x, y, width, height
	 * @Return Array		array with 0-k detected objects, default k = 1
	 */
// 	Quadtree.prototype.knn = function( pRect, k ) {
// 	  // default k value is 1
// 	  k = typeof k === 'undefined' ? 1 : k;

//     var returnObjects = [];
    
// 	  if (this.nodes.length > 0) {
// 	    var index = this.getIndex(pRect);
	    
// 	    returnObjects = this.nodes[index].knn(pRect, k);  // recursive part

//       var selfPos = Victor(pRect.x, pRect.y);  // Maybe we shouldn't use Victor in quadtree because QuadTree is a stand alone library.

// 	    if (returnObjects.length() < k) {  // if we have less objects
	      
// 	      var radius = 0;
	      
// 	      for (var tested in this.objects) {  // if we get less than k objects we try to get more
//           radius = Math.max(radius, selfPos.distanceSq(Victor(this.objects[tested].position.x), Victor(this.objects[tested].position.y))); // This creates two 1 dimensional vectors for comparison.
// 	      }
	      
// 	      radius = Math.sqrt(radius)*2;  // what's the square root for?
//         // trying to get more objects
//         returnObjects = this.retrieve({"x": pRect.x, "y": pRect.y, radius, radius});
        
//         radius = radius*radius/2;
        
//         var inRadiusObjects = []
        
//         for (var tested in returnObjects){//here objects beyond radius are removed, just to be safe
//           if(selfPos.distanceSq(Victor(this.objects[tested].position.x), Victor(this.objects[tested].position.y)) <= radius){
//             inRadiusObjects.push(returnObjects[tested]);
//           }
//         }
        
//         returnObjects = inRadiusObjects;
// 	    }
	    
// 	    if (returnObjects.length > k) {
//         // just throw off not needed objects
// 	      // need sorta a sorting/compare function
// 	      var closestObjects = []
	      
// 	      for (var tested in returnObjects){
// 	        closestObjects[selfPos.distanceSq(Victor(this.objects[tested].position.x), Victor(this.objects[tested].position.y))] = returnObjects[tested];
// 	      }
	      
// 	      closestObjects.sort();
	      
// 	      closestObjects.length -= closestObjects.length - k;
	      
// 	      returnObjects = closestObjects;
	      
// 	    }

// 	  }else{
	    
// 	    returnObjects = this.objects;
	    
// 	  }
	  
	  
// 	  return returnObjects;
// 	  //behavior with returning self is left
// 	  //works as intended
// 	}

	
	/*
	 * Clear the quadtree
	 */
	Quadtree.prototype.clear = function() {
		this.objects = [];
		this.nodes = [];
	};

	//make Quadtree available in the global namespace
	window.Quadtree = Quadtree;	

})(window, Math);