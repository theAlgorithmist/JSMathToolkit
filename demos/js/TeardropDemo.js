/*
 * Supporting script for Teardrop shape demo.  Copyright (c) 2013, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */
require(['jquery', 
         'bootstrap', 
         'easeljs', 
         '../../core/RenderDrawStack',
         '../../complexShapes/Teardrop', 
         '../../core/RectangleSelector'], 
         function($, 
                  bootstrapRef, 
                  easelJS, 
                  RenderModule,
                  TeardropModule, 
                  SelectorModule)
{ 
  var stage;
  var teardrop;
  var teardropShape;
  var boundShape;
  var p1;
  var p2;
  var boundLeft;
  var boundTop;
  var boundRight;
  var boundBottom;
  var selector = new SelectorModule();
  var squeeze = 1;
  
  var teardropRef = new TeardropModule();
  
  var renderRef = new RenderModule();
  var __render  = new renderRef.RenderDrawStack();
  
  $( document ).ready( onPageLoaded );
  
  $('input[name="squeeze"]').click(function()
  {
    newTeardrop();
  });
  
  $('#reset').click(function()
  {
    if( teardropShape )
    {
      teardropShape.graphics.clear();
      boundShape.graphics.clear();
      
      stage.update();
    }
    
    teardrop    = null;
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
    
    newTeardrop();
  };
  
  function onPageLoaded()
  {
	  // EaselJS setup
    var canvas = document.getElementById("stageCanvas");
    stage      = new createjs.Stage(canvas);
    stage.enableDOMEvents(true);
    
    // add a shape to draw the teardrop and the bounding rectangle
    teardropShape = new createjs.Shape();
    boundShape = new createjs.Shape();
    
    stage.addChild(teardropShape);
    stage.addChild(boundShape);
    
    // add the rectangle selector - this is a single-use deal; as soon as the bounding rectangle is selected, the selector self-destructs (I like that description)
    selector.addRectangleSelector(stage, onBound);
  };
  
  function newTeardrop()
  {
    var sq  = $('input[name="squeeze"]');
    squeeze = sq.val();
    
    if( !teardrop )
      tearDrop = new teardropRef.Teardrop(boundLeft, boundTop, boundRight, boundBottom);
    
    drawTeardrop();
  };
  
  function drawTeardrop()
  {
    var g = boundShape.graphics;
    g.clear();
    g.setStrokeStyle(2);
    g.beginStroke( createjs.Graphics.getRGB(255,255,255,1) );
    g.drawRect(boundLeft, boundTop, (boundRight-boundLeft), (boundBottom-boundTop));
    
    g = teardropShape.graphics;
    g.clear();
    g.setStrokeStyle(2);
    g.beginStroke( createjs.Graphics.getRGB(255,210,0,1) );
    
    // draw teardrop
    var stack = tearDrop.create(squeeze);
   
    __render.render(g, stack);
    
    stage.update();
  };
});