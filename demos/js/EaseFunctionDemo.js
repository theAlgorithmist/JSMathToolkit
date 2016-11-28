/*
 * Supporting script for illustrating basic easing functions.  Copyright (c) 2013, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */
require(['jquery', 
         'bootstrap', 
         'easeljs', 
         '../../math/easing/Back',
         '../../math/easing/Bounce',
         '../../math/easing/Cubic',
         '../../math/easing/Elastic',
         '../../math/easing/Exponential',
         '../../math/easing/Linear',
         '../../math/easing/Quadratic'
         ], 
         function($, 
             bootstrapRef, 
             easelJS, 
             BackEasingModule,
             BounceEasingModule,
             CubicEasingModule,
             ElasticEasingModule,
             ExponentialEasingModule,
             LinearEasingModule,
             QuadraticEasingModule)
{
  var stage;
  var axis;
  var lineShape;
  var markerShape;
  var left;
  var top;
  var right;
  var bottom;
  var canvasLength;
  var canvasHeight;
  var easeMethod;
  var easeFunction;
  var third;
  var half;
  var twoThird;
  
  var __t;
  var __tIn;
  var __tOut;
  var __start    = 0;
  var __duration = 10000;
  var __easing   = [];
  
  var easeRef = new BackEasingModule();
  __easing["Back"] = new easeRef.Back();
  
  easeRef = new BounceEasingModule();
  __easing["Bounce"] = new easeRef.Bounce();
  
  easeRef = new CubicEasingModule();
  __easing["Cubic"] = new easeRef.Cubic();
  
  easeRef = new ElasticEasingModule();
  __easing["Elastic"] = new easeRef.Elastic();
  
  easeRef = new ExponentialEasingModule();
  __easing["Exponential"] = new easeRef.Exponential();
  
  easeRef = new LinearEasingModule();
  __easing["Linear"] = new easeRef.Linear();
  
  easeRef = new QuadraticEasingModule();
  __easing["Quadratic"] = new easeRef.Quadratic();
  
  $( document ).ready( onPageLoaded );
  
  // various button handlers, toggling, blah, blah ...
  $('#start').click(onStart);
  
  $('#easeSelector li a').click(function() 
  {
    easeMethod   = $(this).text();
    easeFunction = __easing[easeMethod];
    
    resetDrawing();
  });
  
 
  $('#reset').click(function()
  {
    easeMethod = "Back";
    
    resetDrawing();
  });
  
  function onPageLoaded()
  {
    easeMethod   = "Back";
    easeFunction = __easing[easeMethod];
    
	  // EaselJS setup
    var canvas   = document.getElementById("stageCanvas");
    var bounds   = new createjs.Rectangle();
    canvasLength = canvas.width;
    canvasHeight = canvas.height;
    stage        = new createjs.Stage(canvas);
  
    lineShape = new createjs.Shape();
    
    // add a shape to draw circular markers into
    markerShape = new createjs.Shape();
    
    // add each to the display list
    stage.addChild(lineShape);
    stage.addChild(markerShape);
    
    resetDrawing();
  };
  
  function resetDrawing()
  {
    var g = lineShape.graphics;
    g.clear();
    g.setStrokeStyle(2);
    g.beginStroke( createjs.Graphics.getRGB(255,215,0,1) );
    
    third = 0.33*canvasHeight;
    g.moveTo(0, third);
    g.lineTo(canvasLength,third);
    
    half = 0.5*canvasHeight;
    g.moveTo(0, half);
    g.lineTo(canvasLength,half);
    
    twoThird = 0.67*canvasHeight;
    g.moveTo(0, twoThird);
    g.lineTo(canvasLength,twoThird);
    
    g = markerShape.graphics;
    g.clear();
    g.setStrokeStyle(1);
    g.beginStroke( createjs.Graphics.getRGB(255,0,0) );
    g.beginFill( createjs.Graphics.getRGB(255,0,0) );
    g.drawCircle(0, third, 4);
    
    g = markerShape.graphics;
    g.setStrokeStyle(1);
    g.beginStroke( createjs.Graphics.getRGB(0,255,0) );
    g.beginFill( createjs.Graphics.getRGB(0,255,0) );
    g.drawCircle(0, half, 4);
    
    g = markerShape.graphics;
    g.setStrokeStyle(1);
    g.beginStroke( createjs.Graphics.getRGB(0,0,255) );
    g.beginFill( createjs.Graphics.getRGB(0,0,255) );
    g.drawCircle(0, twoThird, 4);
    
    stage.update();
  };
  
  function onStart()
  {
    __start  = Date.now();
    __tEased = 0;
    
    requestAnimationFrame(update);
  }
  
  function update()
  {
    // most easing functions take an updated time parameter, t, a beginning value, b, a change (or end value), c, and a duration, d.
    // I personally like to map [0,1] into [0,1] (although that range is too restrictive for Bounce and similar easing), so the begin/change 
    // values will always be 0 and 1.  The duration is ten seconds, although the ease is considered as happening over a unit time interval.
    // So, we should observe both t and t* move in [0,1] unless the ease function is such that a wider range of values is computed for t*.
    
    // linear motion in natural parameter
    __t = (Date.now() - __start)/__duration;
    
    // compute eased value according to the selected function
    switch( easeMethod )
    {
      case "Back":
        __tIn  = easeFunction.easeIn(__t, 0.0, 1.0, 1.0, 1.0);   // goes left off-stage then moves to the right
        __tOut = easeFunction.easeOut(__t, 0.0, 1.0, 1.0, 1.0);  // quickly goes right, off-stage, and then moves back
      break;
      
      case "Elastic":
        __tIn  = easeFunction.easeIn(__t, 0.0, 1.0, 1.0, 1.0, 1.5); 
        __tOut = easeFunction.easeOut(__t, 0.0, 1.0, 1.0, 1.0, 1.5); 
      break;
      
      default:
        __tIn  = easeFunction.easeIn(__t, 0.0, 1.0, 1.0); 
        __tOut = easeFunction.easeOut(__t, 0.0, 1.0, 1.0); 
      break;
    }
    
    var x0 = __t*canvasLength;
    var x1 = __tIn*canvasLength;
    var x2 = __tOut*canvasLength;
    
    g = markerShape.graphics;
    g.clear();
    g.setStrokeStyle(1);
    g.beginStroke( createjs.Graphics.getRGB(255,0,0) );
    g.beginFill( createjs.Graphics.getRGB(255,0,0) );
    g.drawCircle(x0, third, 4);
    
    g.setStrokeStyle(1);
    g.beginStroke( createjs.Graphics.getRGB(0,255,0) );
    g.beginFill( createjs.Graphics.getRGB(0,255,0) );
    g.drawCircle(x1, half, 4);
    
    g.setStrokeStyle(1);
    g.beginStroke( createjs.Graphics.getRGB(0,0,255) );
    g.beginFill( createjs.Graphics.getRGB(0,0,255) );
    g.drawCircle(x2, twoThird, 4);
    
    stage.update();
    
    var txt = "Ease Method: " + easeMethod + "  t: " + __t.toFixed(2) + "   t-in : " + __tIn.toFixed(2) + "   t-out : " + __tOut.toFixed(2);
    
    $('#instruct').text(txt);
    
    if( __t < 1.0 )
      requestAnimationFrame(update);
  };
});