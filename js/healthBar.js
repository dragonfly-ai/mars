var HealthBar = (function(){
  var healthColors = [new RGB(0, 255, 0), new RGB(255, 0, 0)];

  var draw = function(ctx, patient) {
    var integrity = Math.max(0, patient.armor) / patient.maxArmor;
    if (integrity < 1.0) {
      var layoutWidth = patient.radius + patient.radius;
      ctx.strokeStyle = healthColors[0].svg(0.33);
      ctx.lineWidth = 2;
      var startX = patient.position.x - patient.radius;
      ctx.beginPath();
      ctx.moveTo(startX, patient.position.y +  patient.radius);
      var healthWidth = integrity * layoutWidth;
      ctx.lineTo(startX + healthWidth, patient.position.y + patient.radius);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.strokeStyle = healthColors[1].svg(0.33);
      ctx.moveTo(startX + healthWidth, patient.position.y +  patient.radius);
      var healthWidth = patient.armor / patient.maxArmor * layoutWidth;
      ctx.lineTo(startX + healthWidth + (layoutWidth - healthWidth), patient.position.y + patient.radius);
      ctx.stroke();
    }
  }
  return draw;
})();