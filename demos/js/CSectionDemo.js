/*
 * Supporting script for circular csection demo.  Copyright (c) 2013, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */
require(['jquery', 
         'bootstrap', 
         'easeljs', 
         '../../core/RenderDrawStack',
         '../../complexShapes/CSection'
         ], 
         function($, 
             bootstrapRef, 
             easelJS, 
             RenderModule,
             CSectionModule
             )
{
  var stage;
  var csectionShape;
  var canvasLength;
  var canvasHeight;
  
  var renderRef = new RenderModule();
  var __render  = new renderRef.RenderDrawStack();
  
  var __csection;
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
  
    csectionShape = new createjs.Shape();
    
    stage.addChild(csectionShape);
    
    var csectionRef = new CSectionModule();
    
    // create the c-section in the center of the drawing area with fixed radius
    __csection = new csectionRef.CSection( 100, 0.5*canvasLength, 0.5*canvasHeight );
    
    resetDrawing();
  };
  
  function resetDrawing()
  {
    var g = csectionShape.graphics;
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
    
    // c-section is drawn from 0 to min(arc, 4pi/3) radians - the width is fixed at 15px.  There is an issue with filling - to be addressed in a future update
    var stack = __csection.create(0, arc, 15);
   
    g = csectionShape.graphics;
    g.clear();
    g.setStrokeStyle(2);
    g.beginStroke( createjs.Graphics.getRGB(0, 255,0) );
   
    __render.render(g, stack);
    
    g.endStroke();
    
    stage.update();
    
    if( __t < 1.0 || arc < 4*Math.PI/3 )
      requestAnimationFrame(update);
  };
});