/*
 * Supporting script for 2D line segment intersection test. Copyright (c) 2014, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */
require(['jquery', 
         'bootstrap', 
         'easeljs', 
         '../../utils/GeomUtils'
         ], 
         function($,                    // jQuery
                  bootstrapRef,         // Bootstrap
                  easelJS,              // EaselJS
                  GeomUtilsModule       // GeomUtils
                  )
{
  var stage;
  var lineRenderShape;
  var p0x, p0y;
  var p1x, p1y;
  var p2x, p2y;
  var p3x, p3y;
  
  var geomUtilsRef = new GeomUtilsModule();
  var geomUtils    = new geomUtilsRef.GeomUtils();
  
  $( document ).ready( onPageLoaded );
  
  function onPageLoaded()
  {
	  // EaselJS setup
    var canvas = document.getElementById("stageCanvas");
    stage      = new createjs.Stage(canvas);
 
    lineRenderShape = new createjs.Shape();
    
    stage.addChild(lineRenderShape);
    
    p0x = 50;
    p0y = 30;
    
    p1x = 300;
    p1y = 150;
    
    p2x = 300;
    p2y = 200;
    
    p3x = 50;
    p3y = 100;
    
    drawLines();
    
    stage.update();
  };
  
  function drawLines()
  {
    // draw the two line segments and perform the segment-segment intersection test
    var g = lineRenderShape.graphics;
    g.clear();
    
 
    g.setStrokeStyle(2);
    g.beginStroke( createjs.Graphics.getRGB(255,255,255,2) );
    g.moveTo(p0x, p0y);
    g.lineTo(p1x, p1y);
    
    g.moveTo(p2x, p2y);
    g.lineTo(p3x, p3y);
    
    g.endStroke();
    
    stage.update();
    
    var intersect = geomUtils.segmentsIntersect( p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y );
    
    $('#instruct').text( "segments intersect: " + intersect );
  };
  
});