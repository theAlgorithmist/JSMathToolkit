/*
 * Supporting script for Star demo.  Copyright (c) 2013, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */
require(['jquery', 
         'bootstrap', 
         'easeljs', 
         '../../core/RenderDrawStack',
         '../../complexShapes/Heart', 
         '../../core/RectangleSelector'], 
         function($, 
                  bootstrapRef, 
                  easelJS, 
                  RenderModule,
                  HeartModule, 
                  SelectorModule)
{ 
  var stage;
  var heart;
  var heartShape;
  var boundShape;
  var boundLeft;
  var boundTop;
  var boundRight;
  var boundBottom;
  var selector = new SelectorModule();
  var squeeze = 1;
  
  var heartRef = new HeartModule();
  
  var renderRef = new RenderModule();
  var __render  = new renderRef.RenderDrawStack();
  
  $( document ).ready( onPageLoaded );
  
  $('#reset').click(function()
  {
    if( heartShape )
    {
      heartShape.graphics.clear();
      boundShape.graphics.clear();
      
      stage.update();
    }
    
    heart    = null;
    boundLeft   = 0;
    boundTop    = 0;
    boundRight  = 0;
    boundBottom = 0;
    
    // the rectangle selector is a single-use entity, so re-establish the selector for the next bounding rectangle
    selector.addRectangleSelector(stage, onBound);
  });
  
  function onBound(__left, __top, __right, __bottom)
  {
    boundLeft   = __left;
    boundTop    = __top;
    boundRight  = __right;
    boundBottom = __bottom;
    
    newHeart();
  };
  
  function onPageLoaded()
  {
	  // EaselJS setup
    var canvas = document.getElementById("stageCanvas");
    stage      = new createjs.Stage(canvas);
    stage.enableDOMEvents(true);
    
    // add a shape to draw the heart and the bounding rectangle
    heartShape = new createjs.Shape();
    boundShape = new createjs.Shape();
    
    stage.addChild(heartShape);
    stage.addChild(boundShape);
    
    // add the rectangle selector - this is a single-use deal; as soon as the bounding rectangle is selected, the selector self-destructs (I like that description)
    selector.addRectangleSelector(stage, onBound);
  };
  
  function newHeart()
  {
    if( !heart )
      heart = new heartRef.Heart(boundLeft, boundTop, boundRight, boundBottom);
    
    drawHeart();
  };
  
  function drawHeart()
  {
    var g = boundShape.graphics;
    g.clear();
    g.setStrokeStyle(2);
    g.beginStroke( createjs.Graphics.getRGB(255,255,255,1) );
    g.drawRect(boundLeft, boundTop, (boundRight-boundLeft), (boundBottom-boundTop));
    
    g = heartShape.graphics;
    g.clear();
    g.setStrokeStyle(2);
    g.beginStroke( createjs.Graphics.getRGB(255,210,0,1) );
    
    // draw heart
    var stack = heart.create();
   
    __render.render(g, stack);
    
    stage.update();
  };
});