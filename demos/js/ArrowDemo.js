/*
 * Supporting script for Arrow demo.  Copyright (c) 2013, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */

require(['jquery', 'bootstrap', 'easeljs', '../../core/RectangleSelector', '../../shapes/Arrow'], function($, bootstrapRef, easelJS, RectangleSelector, ArrowModule)
{
  var stage;
  var arrow;
  var arrowShape;
  var orientation;
  var arrowLength;
  var major;
  var minor;
  var boundLeft;
  var boundTop;
  var boundRight;
  var boundBottom;
  
  var selector = new RectangleSelector();
  
  $( document ).ready( onPageLoaded );
  
  // various button handlers, toggling, etc ...
  $('#arrowGroup button').click(function() 
  {
    $('#arrowGroup button').addClass('active').not(this).removeClass('active');

    orientation = $(this).attr('id');
    
    newArrow();
  });
  
  $('input[name="length"]').click(function()
  {
    newArrow();
  });
  
  $('input[name="width"]').click(function()
  {
    newArrow();
  });
  
  $('#reset').click(function()
  {
    if( arrowShape )
    {
      arrowShape.graphics.clear();
      stage.update();
    }
    
    if( arrow )
      arrow.clear();
    
    boundLeft   = 0;
    boundTop    = 0;
    boundRight  = 0;
    boundBottom = 0;
    major       = 0;
    minor       = 0;
    
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
    // default orientation
    orientation = "up";
    
    // default fractions of total distance assigned to arrow length/width (not the arrow head)
    major = 0.7;
    minor = 0.7;
    
	  // EaselJS setup
    var canvas = document.getElementById("stageCanvas");
    stage      = new createjs.Stage(canvas);
    stage.enableDOMEvents(true);
    
    // Arrow
    var ArrowRef = new ArrowModule();
    arrow = new ArrowRef.Arrow();
    
    // add a shape to draw the arrow
    arrowShape = new createjs.Shape();
    
    stage.addChild(arrowShape);
    
    // add the rectangle selector - this is a single-use deal; as soon as the bounding rectangle is selected, the selector self-destructs (I like that description)
    selector.addRectangleSelector(stage, onBound);
  };
  
  function newArrow()
  {
    var lengthInput = $('input[name="length"]');
    var widthInput  = $('input[name="width"]' );
    var len         = lengthInput.val();
    var w           = widthInput.val();
    
    var params = {"orient":orientation, "major":len, "minor":w};
    
    if( arrow )
    {
      // All shapes are defined by a bounding rectangle and a small set of parameters
      arrow.create(boundLeft, boundTop, boundRight, boundBottom, params, true);
      
      drawArrow();
    }  
  };
  
  function drawArrow()
  {
    var xCoords = arrow.get_xcoordinates();
    var yCoords = arrow.get_ycoordinates();
    
    // line thickness is 2 - first, draw bounding area
    var g = arrowShape.graphics;
    g.clear();
    g.setStrokeStyle(2);
    g.beginStroke( createjs.Graphics.getRGB(255,255,255,1) );
    g.drawRect(boundLeft, boundTop, (boundRight-boundLeft), (boundBottom-boundTop));
    
    // draw arrow
    g.moveTo(xCoords[0], yCoords[0]);
    g.beginStroke( createjs.Graphics.getRGB(255,215,0,1) );
    
    var n = xCoords.length;
    var i;
    for( i=0; i<n; ++i )
      g.lineTo(xCoords[i], yCoords[i]);
    
    // polygon is always closed
    g.lineTo(xCoords[0], yCoords[0]);
    
    stage.update();
  };
});