/*
 * Supporting script for Triangle demo.  Copyright (c) 2013, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */
require(['jquery', 'bootstrap', 'easeljs', '../../shapes/Triangle', '../../core/RectangleSelector'], function($, bootstrapRef, easelJS, TriangleModule, SelectorModule)
{  
  var stage;
  var triangle;
  var triangleShape;
  var orientation;
  var triangleType;
  var p1;
  var p2;
  var boundLeft;
  var boundTop;
  var boundRight;
  var boundBottom;
  var selector = new SelectorModule();
  
  $( document ).ready( onPageLoaded );
  
  // various button handlers, toggling, blah, blah ...
  $('#triangleGroup button').click(function() 
  {
    $('#triangleGroup button').addClass('active').not(this).removeClass('active');

    orientation = $(this).attr('id');
    
    newTriangle();
  });
  
  $('#triangleSelector li a').click(function() 
  {
    triangleType = $(this).text();
    if( triangleType == "arbitrary" )
      triangleType = "none";
    
    newTriangle();
  });
      
  
  $('input[name="p1"]').click(function()
  {
    newTriangle();
  });
  
  $('input[name="p2"]').click(function()
  {
    newTriangle();
  });
  
  $('#reset').click(function()
  {
    if( triangleShape )
    {
      triangleShape.graphics.clear();
      stage.update();
    }
    
    if( triangle )
      triangle.clear();
    
    boundLeft   = 0;
    boundTop    = 0;
    boundRight  = 0;
    boundBottom = 0;
    p1          = 0.2;
    p2          = 0.2;
    
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
    // default type and orientation
    orientation  = "up";
    triangleType = "equilateral";
    
    // default fractions of total distance assigned to triangle length/width (not the triangle head)
    p1 = 0.2;
    p2 = 0.2;
    
	  // EaselJS setup
    var canvas = document.getElementById("stageCanvas");
    stage      = new createjs.Stage(canvas);
    stage.enableDOMEvents(true);
    
    // Triangle Shape
    var triangleRef = new TriangleModule();
    triangle = new triangleRef.Triangle();
    
    // add a shape to draw the triangle
    triangleShape = new createjs.Shape();
    
    stage.addChild(triangleShape);
    
    // add the rectangle selector - this is a single-use deal; as soon as the bounding rectangle is selected, the selector self-destructs (I like that description)
    selector.addRectangleSelector(stage, onBound);
  };
  
  function newTriangle()
  {
    p1        = $('input[name="p1"]');
    p2        = $('input[name="p2"]');
    var p1Val = p1.val();
    var p2Val = p2.val();
    
    var params = {"orient":orientation, "type":triangleType, "p1":p1Val, "p2":p2Val};
    
    if( triangle )
    {
      // All shapes are defined by a bounding rectangle and a small set of parameters
      triangle.create(boundLeft, boundTop, boundRight, boundBottom, params, true);
      
      drawTriangle();
    }  
  };
  
  function drawTriangle()
  {
    var xCoords = triangle.get_xcoordinates();
    var yCoords = triangle.get_ycoordinates();

    // line thickness is 2 - first, draw bounding area
    var g = triangleShape.graphics;
    g.clear();
    g.setStrokeStyle(2);
    g.beginStroke( createjs.Graphics.getRGB(255,255,255,1) );
    g.drawRect(boundLeft, boundTop, (boundRight-boundLeft), (boundBottom-boundTop));
    
    // draw triangle
    g.beginStroke( createjs.Graphics.getRGB(255,215,0,1) );
    
    var n = xCoords.length;
    var i;
    g.moveTo(xCoords[0], yCoords[0]);
    for( i=1; i<n; ++i )
      g.lineTo(xCoords[i], yCoords[i]);
    
    // polygon is always closed
    g.lineTo(xCoords[0], yCoords[0]);
    
    stage.update();
  };
});