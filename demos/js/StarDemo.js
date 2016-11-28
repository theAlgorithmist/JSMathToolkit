/*
 * Supporting script for Star demo.  Copyright (c) 2013, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */
require(['jquery', 'bootstrap', 'easeljs', '../../shapes/Star', '../../core/RectangleSelector'], function($, bootstrapRef, easelJS, StarModule, SelectorModule)
{ 
  var stage;
  var star;
  var starShape;
  var circleShape;
  var p1;
  var p2;
  var boundLeft;
  var boundTop;
  var boundRight;
  var boundBottom;
  var selector = new SelectorModule();
  
  $( document ).ready( onPageLoaded );
  
  $('input[name="points"]').click(function()
  {
    newStar();
  });
  
  $('input[name="thickness"]').click(function()
  {
    newStar();
  });
  
  $('#reset').click(function()
  {
    if( starShape )
    {
      starShape.graphics.clear();
      circleShape.graphics.clear();
      
      stage.update();
    }
    
    if( star )
      star.clear();
    
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
    
    newStar();
  };
  
  function onPageLoaded()
  {
	  // EaselJS setup
    var canvas = document.getElementById("stageCanvas");
    stage      = new createjs.Stage(canvas);
    stage.enableDOMEvents(true);
    
    // Star Shape
    var starRef = new StarModule();
    star        = new starRef.Star();
    
    // add a shape to draw the star and the bounding circle
    starShape   = new createjs.Shape();
    circleShape = new createjs.Shape();
    
    stage.addChild(starShape);
    stage.addChild(circleShape);
    
    // add the rectangle selector - this is a single-use deal; as soon as the bounding rectangle is selected, the selector self-destructs (I like that description)
    selector.addRectangleSelector(stage, onBound);
  };
  
  function newStar()
  {
    p1        = $('input[name="points"]');
    p2        = $('input[name="thickness"]');
    var p1Val = p1.val();
    var p2Val = p2.val();
    
    var params = {"points":p1Val, "thickness":p2Val};
    
    if( star )
    {
      // All polygonal shapes are defined by a bounding rectangle and a small set of parameters, although thickness values > 1 can cause the Star to exceed the
      // bounding rectangle dimensions.
      star.create(boundLeft, boundTop, boundRight, boundBottom, params, true);
      
      drawStar();
    }  
  };
  
  function drawStar()
  {
    var xCoords = star.get_xcoordinates();
    var yCoords = star.get_ycoordinates();
    
    // line thickness is 2 - first, draw bounding area
    var g = starShape.graphics;
    g.clear();
    g.setStrokeStyle(2);
    g.beginStroke( createjs.Graphics.getRGB(255,255,255,1) );
    g.drawRect(boundLeft, boundTop, (boundRight-boundLeft), (boundBottom-boundTop));
    
    // draw star
    g.beginStroke( createjs.Graphics.getRGB(255,215,0,1) );
    
    var n = xCoords.length;
    var i;
    g.moveTo(xCoords[0], yCoords[0]);
    for( i=0; i<n; ++i )
      g.lineTo(xCoords[i], yCoords[i]);
    
    // polygon is always closed
    g.lineTo(xCoords[0], yCoords[0]);
    
    g = circleShape.graphics;
    g.clear();
    g.setStrokeStyle(2);
    g.beginStroke( createjs.Graphics.getRGB(255,255,255,1) );
    
    var d1 = boundRight - boundLeft;
    var d2 = boundBottom -boundTop;
    var d  = d1 < d2 ? d1 : d2; 
    var r  = 0.5*d;
    
    // bounding rectangle centroid
    var cx = 0.5*(boundLeft + boundRight);
    var cy = 0.5*(boundTop + boundBottom);
    
    // bounding circle, which is exceeded with thickness values > 1 (in fact, it becomes a bounding circle for the interior of the Star)
    g.drawCircle(cx, cy, r);
    
    stage.update();
  };
});