/*
 * Supporting script for pill demo.  Copyright (c) 2013, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */
require(['jquery', 
         'bootstrap', 
         'easeljs', 
         '../../core/RenderDrawStack',
         '../../complexShapes/Pill'
         ], 
         function($, 
             bootstrapRef, 
             easelJS, 
             RenderModule,
             PillModule
             )
{
  var stage;
  var axis;
  var pillShape;
  var canvasLength;
  var canvasHeight;
  
  var renderRef = new RenderModule();
  var __render  = new renderRef.RenderDrawStack();
  
  var __horPill;
  var __vertPill;
  var __rotate1Pill;
  var __rotate2Pill;
  
  $( document ).ready( onPageLoaded );
  
  function onPageLoaded()
  {
	  // EaselJS setup
    var canvas   = document.getElementById("stageCanvas");
    var bounds   = new createjs.Rectangle();
    canvasLength = canvas.width;
    canvasHeight = canvas.height;
    stage        = new createjs.Stage(canvas);
  
    pillShape = new createjs.Shape();
    
    stage.addChild(pillShape);
    
    var pillRef = new PillModule();
    
    __horPill     = new pillRef.Pill( 0.5*canvasLength-150, 0.5*canvasHeight-100, 100, 50 );
    __vertPill    = new pillRef.Pill( 0.5*canvasLength+150, 0.5*canvasHeight, 50, 100 );
    __rotate1Pill = new pillRef.Pill( 0.5*canvasLength, 0.5*canvasHeight, 100, 50  );
    __rotate2Pill = new pillRef.Pill( 0.5*canvasLength, 0.5*canvasHeight, 100, 50  );
    
    resetDrawing();
  };
  
  function resetDrawing()
  {
    g = pillShape.graphics;
    g.clear();
    g.setStrokeStyle(2);
    g.beginStroke( createjs.Graphics.getRGB(0, 255,0) );
    
    var stack = __horPill.create("hor");
    __render.render(g, stack);
    
    stack = __vertPill.create("ver", true);
    __render.render(g, stack);
    
    stack = __rotate1Pill.create("hor");
    var xFormStack = __render.rotate(stack, 30*Math.PI/180);
    __render.render(g, xFormStack);
    
    stack = __rotate2Pill.create("hor");
    xFormStack = __render.rotate(stack, 120*Math.PI/180);
    __render.render(g, xFormStack);
    
    g.endStroke();
    
    stage.update();
  };
});