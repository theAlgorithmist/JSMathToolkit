/*
 * Supporting script for circular arc demo.  Copyright (c) 2013, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */
require(['jquery', 
         'bootstrap', 
         'easeljs', 
         '../../core/RenderDrawStack',
         '../../complexShapes/CircularArc'
         ], 
         function($, 
             bootstrapRef, 
             easelJS, 
             RenderModule,
             CircularArcModule
             )
{
  var stage;
  var axis;
  var circleShape;
  var canvasLength;
  var canvasHeight;
  
  var renderRef = new RenderModule();
  var __render  = new renderRef.RenderDrawStack();
  
  var __circle;
  var __t;
  var __start    = 0;
  var __duration = 2000;
  
  $( document ).ready( onPageLoaded );
  
  // various button handlers, toggling, blah, blah ...
  $('#start').click(onStart);
  
  $('#reset').click(function()
  {
    resetDrawing();
  });
  
  function onPageLoaded()
  {
	  // EaselJS setup
    var canvas   = document.getElementById("stageCanvas");
    var bounds   = new createjs.Rectangle();
    canvasLength = canvas.width;
    canvasHeight = canvas.height;
    stage        = new createjs.Stage(canvas);
  
    circleShape = new createjs.Shape();
    
    stage.addChild(circleShape);
    
    var circleRef = new CircularArcModule();
    
    // create the circle in the center of the drawing area with fixed radius
    __circle = new circleRef.CircularArc( 150, 0.5*canvasLength, 0.5*canvasHeight ) ;
    
    resetDrawing();
  };
  
  function resetDrawing()
  {
    var g = circleShape.graphics;
    g.clear();
    
    stage.update();
  };
  
  function onStart()
  {
    __start = Date.now();
    
    requestAnimationFrame(update);
  }
  
  function update()
  {
    __t     = (Date.now() - __start)/__duration;
    var arc = __t*2*Math.PI;  
    
    // circle is drawn from 0 to arc radians
    var stack = __circle.create(0, arc);
    console.log( stack.length );
   
    g = circleShape.graphics;
    g.clear();
    g.setStrokeStyle(2);
    g.beginStroke( createjs.Graphics.getRGB(0, 255,0) );
   
    __render.render(g, stack);
    
    g.endStroke();
    stage.update();
    
    if( __t < 1.0 )
      requestAnimationFrame(update);
  };
});