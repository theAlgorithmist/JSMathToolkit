/*
 * Supporting script for circular wedge demo.  Copyright (c) 2013, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */
require(['jquery', 
         'bootstrap', 
         'easeljs', 
         '../../core/RenderDrawStack',
         '../../complexShapes/Wedge'
         ], 
         function($, 
             bootstrapRef, 
             easelJS, 
             RenderModule,
             WedgeModule
             )
{
  var stage;
  var axis;
  var wedgeShape;
  var canvasLength;
  var canvasHeight;
  
  var renderRef = new RenderModule();
  var __render  = new renderRef.RenderDrawStack();
  
  var __wedge;
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
  
    wedgeShape = new createjs.Shape();
    
    stage.addChild(wedgeShape);
    
    var wedgeRef = new WedgeModule();
    
    // create the wedge in the center of the drawing area with fixed radius
    __wedge = new wedgeRef.Wedge( 100, 0.5*canvasLength, 0.5*canvasHeight );
    
    resetDrawing();
  };
  
  function resetDrawing()
  {
    var g = wedgeShape.graphics;
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
    var arc = Math.min(__t*2*Math.PI, 4*Math.PI/3);  
    
    // wedge is drawn from 0 to min(arc, 4pi/3) radians and it is filled
    var stack = __wedge.create(0, arc);
   
    g = wedgeShape.graphics;
    g.clear();
    g.setStrokeStyle(2);
    g.beginStroke( createjs.Graphics.getRGB(0, 255,0) );
    g.beginFill( createjs.Graphics.getRGB(0,0,255,0.5) );
   
    __render.render(g, stack);
    
    g.endStroke();
    g.endFill();
    
    stage.update();
    
    if( __t < 1.0 || arc < 4*Math.PI/3 )
      requestAnimationFrame(update);
  };
});