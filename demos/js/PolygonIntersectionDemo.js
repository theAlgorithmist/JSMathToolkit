/*
 * Supporting script for basic Polygon demo.  Copyright (c) 2013, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */
require(['jquery', 'bootstrap', 'easeljs', '../../shapes/Polygon', '../../utils/PolygonUtils'], function($, bootstrapRef, easelJS, PolygonModule, PolygonUtilsModule)
{
  var stage;
  var axis;
  var polyShape;
  var boundShape;
  var left;
  var top;
  var right;
  var bottom;
  var canvasLength;
  var canvasHeight;
  var curPoly;
  var polyIndex;
  var polygons;
  var showBoundingBox;
  var scaleUp;
  var testX;
  var testY;
  
  var poly1 = false;
  var poly2 = false;
  var polygon1;
  var polygon2;
  
  // polygon collection
  var example1x = [];
  var example1y = [];
  var example2x = [];
  var example2y = [];
  var example3x = [];
  var example3y = [];
  var example4x = [];
  var example4y = [];
  var example5x = [];
  var example5y = [];
  
  var polygonUtilsRef = new PolygonUtilsModule();
  var polygonUtils    = new polygonUtilsRef.PolygonUtils();
  
  $( document ).ready( onPageLoaded );
  
  // various button handlers, toggling, blah, blah ...
  $('#polySelector li a').click(function() 
  {
    var p;
    
    switch( $(this).text() )
    {
      case "Polygon 1":
        curPoly   = polygons[0];
        polyIndex = 0;
        
        checkIntersection();
      break;
      
      case "Polygon 2":
        curPoly   = polygons[1];
        polyIndex = 1;
        
        checkIntersection();
      break;
      
      case "Polygon 3":
        curPoly   = polygons[2];
        polyIndex = 2;
        
        checkIntersection();
      break;
      
      case "Polygon 4":
        curPoly   = polygons[3];
        polyIndex = 3;
        
        checkIntersection();
      break;
      
      case "Polygon 5":
        curPoly   = polygons[4];
        polyIndex = 4;
        
        checkIntersection();
      break;
    }
  });
  
  $('#reset').click(function()
  {
    poly1 = false;
    poly2 = false;
    
    polyShape.graphics.clear();
    stage.update();
    
    if( curPoly )
    {
      switch( polyIndex )
      {
        case 0:
          curPoly.setXCoordinates(example1x);
          curPoly.setYCoordinates(example1y);
        break;
        
        case 1:
          curPoly.setXCoordinates(example2x);
          curPoly.setYCoordinates(example2y);
        break;
        
        case 2:
          curPoly.setXCoordinates(example3x);
          curPoly.setYCoordinates(example3y);
        break;
        
        case 3:
          curPoly.setXCoordinates(example4x);
          curPoly.setYCoordinates(example4y);
        break;
        
        case 4:
          curPoly.setXCoordinates(example5x);
          curPoly.setYCoordinates(example5y);
        break;
      }
    }
  });
  
  function onPageLoaded()
  {
    // current polygon
    curPoly         = null;
    activePoint     = false;
    showBoundingBox = false;
    scaleUp         = true;
    
    polygons = [];
    
    var PolygonRef = new PolygonModule();
    
    polygons.push( new PolygonRef.Polygon() );
    polygons.push( new PolygonRef.Polygon() );
    polygons.push( new PolygonRef.Polygon() );
    polygons.push( new PolygonRef.Polygon() );
    polygons.push( new PolygonRef.Polygon() );
    
    example1x.push(40);
    example1x.push(160);
    example1x.push(100);
    
    example1y.push(110);
    example1y.push(110);
    example1y.push(6);
    
    example2x.push(90);
    example2x.push(210);
    example2x.push(180);
    example2x.push(200);
    example2x.push(100);
    example2x.push(100);
    example2x.push(120);
    
    example2y.push(200);
    example2y.push(200);
    example2y.push(150);
    example2y.push(90);
    example2y.push(90);
    example2y.push(110);
    example2y.push(150);
    
    example3x.push(200);
    example3x.push(230);
    example3x.push(230);
    example3x.push(150);
    example3x.push(150);
    
    example3y.push(250);
    example3y.push(230);
    example3y.push(140);
    example3y.push(140);
    example3y.push(170);
    
    example4x.push(90);
    example4x.push(210);
    example4x.push(210);
    example4x.push(150);
    example4x.push(150);
    example4x.push(110);
    example4x.push(110);
    example4x.push(90);
    
    example4y.push(200);
    example4y.push(200);
    example4y.push(150);
    example4y.push(150);
    example4y.push(120);
    example4y.push(120);
    example4y.push(90);
    example4y.push(90);
    
    example5x.push(190);
    example5x.push(220);
    example5x.push(280);
    example5x.push(310);
    example5x.push(310);
    example5x.push(280);
    example5x.push(220);
    example5x.push(190);
    
    example5y.push(130);
    example5y.push(160);
    example5y.push(160);
    example5y.push(130);
    example5y.push(80);
    example5y.push(40);
    example5y.push(40);
    example5y.push(80);
    
    var poly = polygons[0];
    poly.setXCoordinates(example1x);
    poly.setYCoordinates(example1y);
    
    poly = polygons[1];
    poly.setXCoordinates(example2x);
    poly.setYCoordinates(example2y);
    
    poly = polygons[2];
    poly.setXCoordinates(example3x);
    poly.setYCoordinates(example3y);
    
    poly = polygons[3];
    poly.setXCoordinates(example4x);
    poly.setYCoordinates(example4y);
    
    poly = polygons[4];
    poly.setXCoordinates(example5x);
    poly.setYCoordinates(example5y);
    
	  // EaselJS setup
    var canvas   = document.getElementById("stageCanvas");
    var bounds   = new createjs.Rectangle();
    canvasLength = canvas.width;
    canvasHeight = canvas.height;
    stage        = new createjs.Stage(canvas);
  
    // add a shape to draw a polygon into
    polyShape = new createjs.Shape();
    
    // add a shape to draw the bounding box
    boundShape = new createjs.Shape();
    
    // add each to the display list
    stage.addChild(polyShape);
    stage.addChild(boundShape);
  };
  
  function checkIntersection()
  {
    if( !poly1 || !poly2 )
    {
      if( poly1 )
      {
        poly2    = true;
        polygon2 = curPoly;
        
        drawPolygon(curPoly, false);
        
        // Canvas coordinates are y-down
        var intersect = polygonUtils.intersect(polygon1, polygon2, true);
        $('#instruct').text("polygon-polygon intersection: " + intersect);
      }
      else
      {
        poly1    = true;
        polygon1 = curPoly.clone();
      
        drawPolygon(curPoly, true);
      }
    }
  }
  
  function drawPolygon(polygon, toClear)
  {
    var xCoords = polygon.get_xcoordinates();
    var yCoords = polygon.get_ycoordinates();
    
    // line thickness is 2
    var g = polyShape.graphics;
    
    if( toClear )
       g.clear();
    
    g.setStrokeStyle(2);
    g.beginStroke( createjs.Graphics.getRGB(255,215,0,1) );
    g.moveTo(xCoords[0], yCoords[0]);
    
    var n = xCoords.length;
    var i;
    for( i=0; i<n; ++i )
      g.lineTo(xCoords[i], yCoords[i]);
    
    // polygon is always closed
    g.lineTo(xCoords[0], yCoords[0]);
    
    // uncomment to draw polygon bounding box
//    var bound = polygon.getBoundingBox(true);
//    g = boundShape.graphics;
//    
//    if( toClear )
//      g.clear();
//    
//    g.setStrokeStyle(2);
//    g.beginStroke( createjs.Graphics.getRGB(255,255,255,1) );
//    g.drawRect( bound.left, bound.top, (bound.right-bound.left), (bound.bottom-bound.top) );
    
    stage.update();
  };
  
});