/*
 * Supporting script for endcap demo.  Copyright (c) 2013, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */
require(['jquery', 
         'bootstrap', 
         'easeljs', 
         '../../core/RenderDrawStack',
         '../../complexShapes/Endcap'
         ], 
         function($, 
             bootstrapRef, 
             easelJS, 
             RenderModule,
             EndcapModule
             )
{
  var stage;
  var axis;
  var endcapShape;
  var canvasLength;
  var canvasHeight;
  
  var renderRef = new RenderModule();
  var __render  = new renderRef.RenderDrawStack();
  
  var __leftEndcap;
  var __rightEndcap;
  var __upEndcap;
  var __downEndcap;
  
  $( document ).ready( onPageLoaded );
  
  function onPageLoaded()
  {
	  // EaselJS setup
    var canvas   = document.getElementById("stageCanvas");
    var bounds   = new createjs.Rectangle();
    canvasLength = canvas.width;
    canvasHeight = canvas.height;
    stage        = new createjs.Stage(canvas);
  
    endcapShape = new createjs.Shape();
    
    stage.addChild(endcapShape);
    
    var endcapRef = new EndcapModule();
    
    __leftEndcap  = new endcapRef.Endcap( 50, 0.5*canvasLength-150, 0.5*canvasHeight );
    __rightEndcap = new endcapRef.Endcap( 50, 0.5*canvasLength+150, 0.5*canvasHeight );
    __upEndcap    = new endcapRef.Endcap( 50, 0.5*canvasLength, 0.5*canvasHeight-50  );
    __downEndcap  = new endcapRef.Endcap( 50, 0.5*canvasLength, 0.5*canvasHeight+50  );
    
    resetDrawing();
  };
  
  function resetDrawing()
  {
    g = endcapShape.graphics;
    g.clear();
    g.setStrokeStyle(2);
    g.beginStroke( createjs.Graphics.getRGB(0, 255,0) );
    
    var stack = __leftEndcap.create("left", false);
    __render.render(g, stack);
    
    stack = __rightEndcap.create("right", true);
    __render.render(g, stack);
    
    stack = __upEndcap.create("up", false);
    __render.render(g, stack);
    
    stack = __downEndcap.create("down", true);
    __render.render(g, stack);
    
    g.endStroke();
    
    stage.update();
  };
});