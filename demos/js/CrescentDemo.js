/*
 * Supporting script for Crescent demo.  Copyright (c) 2013, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */
require(['jquery', 
         'bootstrap', 
         'easeljs', 
         '../../core/RenderDrawStack',
         '../../complexShapes/Crescent' 
         ], 
         function($, 
                  bootstrapRef, 
                  easelJS, 
                  RenderModule,
                  CrescentModule 
                  )
{ 
  var stage;
  var crescent;
  var crescentShape;
  
  var crescentRef = new CrescentModule();
  
  var renderRef = new RenderModule();
  var __render  = new renderRef.RenderDrawStack();
  
  $( document ).ready( onPageLoaded );
  
  function onPageLoaded()
  {
	  // EaselJS setup
    var canvas = document.getElementById("stageCanvas");
    stage      = new createjs.Stage(canvas);
    stage.enableDOMEvents(true);
    
    crescentShape = new createjs.Shape();
    
    stage.addChild(crescentShape);
 
    crescent = new crescentRef.Crescent(60, 60, 40, 15);
    
    drawCrescent();
  };
  
  function drawCrescent()
  { 
    g = crescentShape.graphics;
    g.clear();
    g.setStrokeStyle(2);
    g.beginStroke( createjs.Graphics.getRGB(255,210,0,1) );
    
    // draw crescent
    var stack = crescent.create("left");
    __render.render(g, stack);
    g.endStroke();
    
    crescent.set_centerX(160);
    crescent.set_offset(30);
    
    g.beginStroke( createjs.Graphics.getRGB(255,210,0,1) );
    stack = crescent.create("left");
    __render.render(g, stack);
    g.endStroke();
    
    crescent.set_centerX(280);
    crescent.set_offset(45);
    
    g.beginStroke( createjs.Graphics.getRGB(255,210,0,1) );
    stack = crescent.create("left");
    __render.render(g, stack);
    g.endStroke();
    
    crescent.set_centerX(400);
    crescent.set_offset(60);
    
    g.beginStroke( createjs.Graphics.getRGB(255,210,0,1) );
    stack = crescent.create("left");
    __render.render(g, stack);
    g.endStroke();
    
    // note that offset should always be positive - let the direction parameter handle the details :)
    crescent.set_centerX(420);
    crescent.set_centerY(200);
    crescent.set_offset(15);
    
    g.beginStroke( createjs.Graphics.getRGB(255,210,0,1) );
    stack = crescent.create("right");
    __render.render(g, stack);
    g.endStroke();
    
    crescent.set_centerX(300);
    crescent.set_offset(30);
    
    g.beginStroke( createjs.Graphics.getRGB(255,210,0,1) );
    stack = crescent.create("right");
    __render.render(g, stack);
    g.endStroke();
    
    crescent.set_centerX(180);
    crescent.set_offset(45);
    
    g.beginStroke( createjs.Graphics.getRGB(255,210,0,1) );
    stack = crescent.create("right");
    __render.render(g, stack);
    g.endStroke();
    
    crescent.set_centerX(60);
    crescent.set_offset(60);
    
    g.beginStroke( createjs.Graphics.getRGB(255,210,0,1) );
    stack = crescent.create("right");
    __render.render(g, stack);
    g.endStroke();
    
    stage.update();
  };
});