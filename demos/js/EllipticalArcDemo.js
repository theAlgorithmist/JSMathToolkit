/*
 * Supporting script for elliptical arc demo.  Copyright (c) 2013, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */
require(['jquery', 
         'bootstrap', 
         'easeljs', 
         '../../core/RenderDrawStack',
         '../../complexShapes/EllipticalArc'
         ], 
         function($, 
             bootstrapRef, 
             easelJS, 
             RenderModule,
             EllipticalArcModule
             )
{
  var stage;
  var axis;
  var ellipseShape;
  var canvasLength;
  var canvasHeight;
  
  var renderRef = new RenderModule();
  var __render  = new renderRef.RenderDrawStack();
  
  var __ellipse;
  var __t;
  var __start    = 0;
  var __duration = 2000;
  
  $( document ).ready( onPageLoaded );
  
  // various button handlers, toggling, blah, blah ...
  $('#start').click(onStart);
  
  $('#angle').click(function() 
  {
    var a = $(this).val();
    __ellipse.set_rotation( a*Math.PI/180 );
    
    resetDrawing();
  });
  
 
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
  
    ellipseShape = new createjs.Shape();
    
    stage.addChild(ellipseShape);
    
    var ellipseRef = new EllipticalArcModule();
    
    // create the ellipse in the center of the drawing area with fixed major/minor axis length
    __ellipse = new ellipseRef.EllipticalArc( 300, 150, 0.5*canvasLength, 0.5*canvasHeight, 0) ;
    
    resetDrawing();
  };
  
  function resetDrawing()
  {
    var g = ellipseShape.graphics;
    g.clear();
    g.setStrokeStyle(2);
    g.beginStroke( createjs.Graphics.getRGB(255,215,0,1) );
    
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
    var arc = __t*2*Math.PI;       // ellipse is drawn from 0 to arc radians
    
    var stack = __ellipse.create(0, arc);
   
    g = ellipseShape.graphics;
    g.clear();
    g.setStrokeStyle(2);
    g.beginStroke( createjs.Graphics.getRGB(255,0,0) );
   
    __render.render(g, stack);
    
    g.endStroke();
    stage.update();
    
    if( __t < 1.0 )
      requestAnimationFrame(update);
  };
});