/*
 * Supporting script for Curved Arrow demo.  Copyright (c) 2013, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */
require(['jquery', 
         'bootstrap', 
         'easeljs', 
         '../../core/RenderDrawStack',
         '../../complexShapes/CurvedArrow', 
         '../../core/RectangleSelector'], 
         function($, 
                  bootstrapRef, 
                  easelJS, 
                  RenderModule,
                  CurvedArrowModule, 
                  SelectorModule)
{ 
  var stage;
  var arrow;
  var arrowShape;
  var boundShape;
  var boundLeft;
  var boundTop;
  var boundRight;
  var boundBottom;
  var selector = new SelectorModule();
  var factor = 1;
  
  var arrowRef = new CurvedArrowModule();
  
  var renderRef = new RenderModule();
  var __render  = new renderRef.RenderDrawStack();
  
  $( document ).ready( onPageLoaded );
  
  $('input[name="curve"]').click(function()
  {
    newArrow();
  });
  
  $('#reset').click(function()
  {
    if( arrowShape )
    {
      arrowShape.graphics.clear();
      boundShape.graphics.clear();
      
      stage.update();
    }
    
    arrow    = null;
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
    
    newArrow();
  };
  
  function onPageLoaded()
  {
	  // EaselJS setup
    var canvas = document.getElementById("stageCanvas");
    stage      = new createjs.Stage(canvas);
    stage.enableDOMEvents(true);
    
    // add a shape to draw the arrow and the bounding rectangle
    arrowShape = new createjs.Shape();
    boundShape = new createjs.Shape();
    
    stage.addChild(boundShape);
    stage.addChild(arrowShape);
    
    // add the rectangle selector - this is a single-use deal; as soon as the bounding rectangle is selected, the selector self-destructs (I like that description)
    selector.addRectangleSelector(stage, onBound);
  };
  
  function newArrow()
  {
    var curve = $('input[name="curve"]');
    factor = curve.val();
    
    if( !arrow )
      arrow = new arrowRef.CurvedArrow(boundLeft, boundTop, boundRight, boundBottom);
    
    drawArrow();
  };
  
  function drawArrow()
  {
    var g = boundShape.graphics;
    g.clear();
    g.setStrokeStyle(2);
    g.beginStroke( createjs.Graphics.getRGB(255,255,255,1) );
    g.drawRect(boundLeft, boundTop, (boundRight-boundLeft), (boundBottom-boundTop));
    
    g = arrowShape.graphics;
    g.clear();
    g.setStrokeStyle(2);
    g.beginStroke( createjs.Graphics.getRGB(255,210,0,1) );
    
    // draw arrow
    var stack = arrow.create(factor);
   
    __render.render(g, stack);
    
    g.endStroke();
    
    stage.update();
  };
});