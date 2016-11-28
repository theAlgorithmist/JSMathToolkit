/*
 * Supporting script for Regular N-Gon demo.  Copyright (c) 2013, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */
require(['jquery', 'bootstrap', 'easeljs', '../../core/RectangleSelector', '../../shapes/RegularNGon'], function($, bootstrapRef, easelJS, RectangleSelectorModule, NGonModule)
{
  var stage;
  var nGon;
  var nGonShape;
  var nSides;
  var boundLeft;
  var boundTop;
  var boundRight;
  var boundBottom;
  
  var selector = new RectangleSelectorModule();
  
  $( document ).ready( onPageLoaded );
  
  $('input[name="nSides"]').click(function()
  {
    newNGon();
  });
  
  $('input[name="p2"]').click(function()
  {
    newNGon();
  });
  
  $('#reset').click(function()
  {
    if( nGonShape )
    {
      nGonShape.graphics.clear();
      stage.update();
    }
    
    if( nGon )
      nGon.clear();
    
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
    
    newNGon();
  };
  
  function onPageLoaded()
  {
	  // EaselJS setup
    var canvas = document.getElementById("stageCanvas");
    stage      = new createjs.Stage(canvas);
    
    // Regular N-Gon
    var ngonRef = new NGonModule()
    nGon = new ngonRef.RegularNGon();
    
    // add a shape to draw the nGon
    nGonShape = new createjs.Shape();
    
    stage.addChild(nGonShape);
    
    // add the rectangle selector - this is a single-use deal; as soon as the bounding rectangle is selected, the selector self-destructs (I like that description)
    selector.addRectangleSelector(stage, onBound);
  };
  
  function newNGon()
  {
    nSides     = $('input[name="nSides"]');
    var n      = nSides.val();
    var params = {"sides":n};
    
    if( nGon )
    {
      // All shapes are defined by a bounding rectangle and a small set of parameters
      nGon.create(boundLeft, boundTop, boundRight, boundBottom, params, true);
      
      drawNGon();
    }  
  };
  
  function drawNGon()
  {
    var xCoords = nGon.get_xcoordinates();
    var yCoords = nGon.get_ycoordinates();
    
    // line thickness is 2 - first, draw bounding area
    var g = nGonShape.graphics;
    g.clear();
    g.setStrokeStyle(2);
    g.beginStroke( createjs.Graphics.getRGB(255,255,255,1) );
    g.drawRect(boundLeft, boundTop, (boundRight-boundLeft), (boundBottom-boundTop));
    
    // draw n-gon
    g.beginStroke( createjs.Graphics.getRGB(255,215,0,1) );
    
    var n = xCoords.length;
    var i;
    g.moveTo(xCoords[0], yCoords[0]);
    for( i=0; i<n; ++i )
      g.lineTo(xCoords[i], yCoords[i]);
    
    // polygon is always closed
    g.lineTo(xCoords[0], yCoords[0]);
    
    stage.update();
  };
});