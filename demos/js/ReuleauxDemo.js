/*
 * Supporting script for Modified demo.  Copyright (c) 2013, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */
require(['jquery', 
         'bootstrap', 
         'easeljs', 
         '../../core/RenderDrawStack',
         '../../complexShapes/ModifiedReuleauxTriangle', 
         '../../core/RectangleSelector'], 
         function($, 
                  bootstrapRef, 
                  easelJS, 
                  RenderModule,
                  TriangleModule, 
                  SelectorModule)
{ 
  var stage;
  var triangle;
  var triangleShape;
  var boundShape;
  var p1;
  var p2;
  var boundLeft;
  var boundTop;
  var boundRight;
  var boundBottom;
  var selector = new SelectorModule();
  var expand = 1;
  
  var triangleRef = new TriangleModule();
  
  var renderRef = new RenderModule();
  var __render  = new renderRef.RenderDrawStack();
  
  $( document ).ready( onPageLoaded );
  
  $('input[name="expand"]').click(function()
  {
    newTriangle();
  });
  
  $('#reset').click(function()
  {
    if( triangleShape )
    {
      triangleShape.graphics.clear();
      boundShape.graphics.clear();
      
      stage.update();
    }
    
    triangle    = null;
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
    
    newTriangle();
  };
  
  function onPageLoaded()
  {
	  // EaselJS setup
    var canvas = document.getElementById("stageCanvas");
    stage      = new createjs.Stage(canvas);
    stage.enableDOMEvents(true);
    
    // add a shape to draw the triangle and the bounding rectangle
    triangleShape = new createjs.Shape();
    boundShape = new createjs.Shape();
    
    stage.addChild(triangleShape);
    stage.addChild(boundShape);
    
    // add the rectangle selector - this is a single-use deal; as soon as the bounding rectangle is selected, the selector self-destructs (I like that description)
    selector.addRectangleSelector(stage, onBound);
  };
  
  function newTriangle()
  {
    var sq  = $('input[name="expand"]');
    expand = sq.val();
    
    if( !triangle )
      triangle = new triangleRef.ModifiedReuleauxTriangle(boundLeft, boundTop, boundRight, boundBottom);
    
    drawTriangle();
  };
  
  function drawTriangle()
  {
    var g = boundShape.graphics;
    g.clear();
    g.setStrokeStyle(2);
    g.beginStroke( createjs.Graphics.getRGB(255,255,255,1) );
    g.drawRect(boundLeft, boundTop, (boundRight-boundLeft), (boundBottom-boundTop));
    
    g = triangleShape.graphics;
    g.clear();
    g.setStrokeStyle(2);
    g.beginStroke( createjs.Graphics.getRGB(255,210,0,1) );
    
    // draw triangle
    var stack = triangle.create(expand);
   
    __render.render(g, stack);
    
    stage.update();
  };
});