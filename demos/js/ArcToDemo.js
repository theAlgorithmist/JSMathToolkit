/*
 * Supporting script for ArcTo demo.  Copyright (c) 2013, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */
require(['jquery', 
         'bootstrap', 
         'easeljs', 
         '../../utils/GeomUtils',
         '../../core/RenderDrawStack',
         '../../complexShapes/ArcTo' 
         ], 
         function($, 
                  bootstrapRef, 
                  easelJS, 
                  GeomUtilsModule,
                  RenderModule,
                  ArcToModule 
                  )
{ 
  var stage;
  var arcTo;
  var arcToShape;
  var circleShape;
  
  var arcToRef = new ArcToModule();
  
  var renderRef = new RenderModule();
  var __render  = new renderRef.RenderDrawStack();
  
  var utilsRef = new GeomUtilsModule();
  var __geomUtils = new utilsRef.GeomUtils();
  
  $( document ).ready( onPageLoaded );
  
  function onPageLoaded()
  {
	  // EaselJS setup
    var canvas = document.getElementById("stageCanvas");
    stage      = new createjs.Stage(canvas);
    stage.enableDOMEvents(true);
    
    circleShape = new createjs.Shape();
    arcToShape = new createjs.Shape();
    
    stage.addChild(circleShape);
    stage.addChild(arcToShape);
 
    arcTo = new arcToRef.ArcTo(0, 0);
    
    drawArcTo();
  };
  
  function drawArcTo()
  { 
    g = arcToShape.graphics;
    g.clear();
    g.setStrokeStyle(2);
    g.beginStroke( createjs.Graphics.getRGB(0,255,0) );
    
    arcTo.set_pen(20,100);
    var stack = arcTo.create(80,20,150,80,40);
    
    __render.render(g, stack);
    g.endStroke();
    
    arcTo.set_pen(270,20);
    stack = arcTo.create(280,10,290,20,40);
    
    g.beginStroke( createjs.Graphics.getRGB(0,255,0) );
    __render.render(g,stack);
    g.endStroke();
    
    arcTo.set_pen(250,100);
    stack = arcTo.create(200,200,300,240,50);
    
    g.beginStroke( createjs.Graphics.getRGB(0,255,0) );
    __render.render(g,stack);
    g.endStroke();
  
    stage.update();
  };
});