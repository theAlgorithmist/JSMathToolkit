/*
 * Supporting script for bounding-box intersection test with y-down coordinate system. Copyright (c) 2014, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */
require(['jquery', 
         'bootstrap', 
         'easeljs', 
         '../../core/RectangleSelector',
         '../../utils/GeomUtils'], 
         function($,                       // jQuery
                  bootstrapRef,            // Bootstrap
                  easelJS,                 // EaselJS
                  RectangleSelectorModule, // RectangleSelector
                  GeomUtilsModule          // GeomUtils
                  )
{
  var stage;
  var rectangleShape;
  var quadApprox;
  var pxPerUnitX;
  var pxPerUnitY;
  var box1Left;
  var box1Top;
  var box1Right;
  var box1Bottom;
 
  var box1 = false;
  var box2 = false;
  
  var rectangleSelector = new RectangleSelectorModule();
  var geomUtilsRef      = new GeomUtilsModule();
  var geomUtils         = new geomUtilsRef.GeomUtils();

  $( document ).ready( onPageLoaded );
  
  $('#reset').click(function()
  {
    var g = rectangleShape.graphics;
    g.clear();
    
    box1 = false;
    box2 = false;
    
    stage.update();
    
    // the rectangle selector is a single-use entity
    rectangleSelector.addRectangleSelector(stage, onSelection);
    
    $('#instruct').text("Click and drag twice to create two test bounding boxes.");
  });
  
  function onPageLoaded()
  {
	  // EaselJS setup
    var canvas = document.getElementById("stageCanvas");
    stage      = new createjs.Stage(canvas);
    
    rectangleShape = new createjs.Shape();
    
    // add everything to the display list
    stage.addChild(rectangleShape);
    
    // the rectangle selector is a single-use entity
    rectangleSelector.addRectangleSelector(stage, onSelection);
    
    stage.update();
  };
  
  function onSelection(__left, __top, __right, __bottom)
  {
    if( !box1 || !box2 )
    {
      if( box1 )
      {
        box2 = true;
        
        var g = rectangleShape.graphics;
        g.setStrokeStyle(2);
        g.beginStroke( createjs.Graphics.getRGB(255,255,255,2) );
        g.moveTo(__left, __top);
        g.lineTo(__right, __top);
        g.lineTo(__right, __bottom);
        g.lineTo(__left, __bottom);
        g.lineTo(__left, __top);
        g.endStroke();
        
        // keep bounding-boxes in Canvas coordinates (y-down)
        
        var bound1 = {left:box1Left, top:box1Top, right:box1Right, bottom:box1Bottom};
        var bound2 = {left:__left, top:__top, right:__right, bottom:__bottom};
        
        var intersects = geomUtils.boxesIntersect(bound1, bound2);
        $('#instruct').text("Bounding-box intersection: " + intersects);
      }
      else
      {
        box1 = true;
        
        // convert from Canvas to x-y coordinates
        box1Left   = __left; 
        box1Top    = __top;
        box1Right  = __right;  
        box1Bottom = __bottom;
        
        var g = rectangleShape.graphics;
        g.clear();
        g.setStrokeStyle(2);
        g.beginStroke( createjs.Graphics.getRGB(255,255,255,2) );
        g.moveTo(__left, __top);
        g.lineTo(__right, __top);
        g.lineTo(__right, __bottom);
        g.lineTo(__left, __bottom);
        g.lineTo(__left, __top);
        g.endStroke();
        
        // the rectangle selector is a single-use entity
        rectangleSelector.addRectangleSelector(stage, onSelection);
      }
      
      stage.update();
    }
  }
});