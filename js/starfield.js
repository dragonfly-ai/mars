// function getRandom(min, max) {
// 	return Math.floor(Math.random() * (max - min + 1)) + min;
// }

// var canvas = document.getElementById('starfield'),
// context = canvas.getContext('2d'),
// stars = 600,
// colorrange = [0,60,240];

// for (var i = 0; i < stars; i++) {
// 	var x = Math.random() * canvas.offsetWidth;
// 	y = Math.random() * canvas.offsetHeight,
// 	radius = Math.random() * 1.2,
// 	hue = colorrange[getRandom(0,colorrange.length - 1)],
// 	sat = getRandom(50,100);
// 	context.beginPath();
// 	context.arc(x, y, radius, 0, 360);
// 	context.fillStyle = "hsl(" + hue + ", " + sat + "%, 88%)";
// 	context.fill();
// }

var Star = (function(){
	var factory = function(x, y, color, radius){
		this.x = x;
		this.y = y;
		this.color = color;
		this.radius = radius;
	};
	factory.prototype.draw = function(ctx) {
		ctx.beginPath();
		ctx.fillStyle = this.color.svg();
		ctx.arc(this.x, this.y, this.radius, 2 * Math.PI, false);  // stars are circles.  2 * PI is a circle.  NB: #headdesk
		ctx.fill();
    ctx.closePath();
	};
	var hues = [0,60,240];
	var randomStarColor = function() {
		return HSL(
			hues[parseInt(Math.random()*(hues.length))],
			25 + Math.random() * 50,
			88 + (Math.random() - 0.5) * 10
		).toRGB();
	};
	factory.random = function(minX, minY, maxX, maxY){
		return new Star(
			Math.random() * (maxX - minX) + minX,
			Math.random() * (maxY - minY) + minY,
			randomStarColor(),
			Math.max(0.25, Math.random() * 0.5)
		);
	};
	return factory;
})();

var StarField = (function(){
	var factory = function(stars) {
		this.stars = stars;
	};

	factory.prototype.draw = function(ctx) {
		for (var s in this.stars) {
			var star = this.stars[s];
			star.draw(ctx);
		}
	};

	factory.random = function(starCount, minX, minY, maxX, maxY) {
		var stars = [];
    for (var i2 = 0; i2 < starCount; i2 = i2 + 1) {
      var star = Star.random(minX, minY, maxX, maxY);
      stars.push(star);
    }
    return new factory(stars);
	};
	return factory;
})();