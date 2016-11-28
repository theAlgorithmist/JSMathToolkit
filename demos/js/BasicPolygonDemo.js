/*
 * Supporting script for basic Polygon demo.  Copyright (c) 2013, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */
require(['jquery', 'bootstrap', 'easeljs', '../../shapes/Polygon'], function($, bootstrapRef, easelJS, PolygonModule)
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
  var activePoint;
  var showBoundingBox;
  var scaleUp;
  var testX;
  var testY;
  
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
  
  $( document ).ready( onPageLoaded );
  
  // various button handlers, toggling, blah, blah ...
  $('#polySelector li a').click(function() 
  {
    var p;
    activePoint = false;
    pointShape.graphics.clear();
    
    switch( $(this).text() )
    {
      case "Example 1":
        curPoly   = polygons[0];
        polyIndex = 0;
        
        drawPolygon(curPoly);
      break;
      
      case "Example 2":
        curPoly   = polygons[1];
        polyIndex = 1;
        
        drawPolygon(curPoly);
      break;
      
      case "Example 3":
        curPoly   = polygons[2];
        polyIndex = 2;
        
        drawPolygon(curPoly);
      break;
      
      case "Example 4":
        curPoly   = polygons[3];
        polyIndex = 3;
        
        drawPolygon(curPoly);
      break;
      
      case "Example 5":
        curPoly   = polygons[4];
        polyIndex = 4;
        
        drawPolygon(curPoly);
      break;
    }
  });
  
  $('#scaleBtnGroup button').click(function() 
  {
    $('#scaleBtnGroup button').addClass('active').not(this).removeClass('active');

    var upDown = $(this).attr('id');
    
    if( upDown == "scaleup" && scaleUp )
    {
      if( curPoly )
      {
        curPoly.scale(2.0);
        drawPolygon(curPoly);
        
        scaleUp = false;
      }
    }
    else if( upDown == "scaledn" && !scaleUp )
    {
      if( curPoly && !scaleUp )
      {
        curPoly.scale(0.5);
        drawPolygon(curPoly);
        
        scaleUp = true;
      }
    }
    
    drawPolygon(curPoly);
  });
  
  $('#right').click(function()
  {
    if( curPoly )
    {
      curPoly.rotate(90);
      drawPolygon(curPoly);
    }
  });
  
  $('#left').click(function()
  {
    if( curPoly )
    {
      curPoly.rotate(-90);
      drawPolygon(curPoly);
    }
  });
  
  $('#reset').click(function()
  {
    if( curPoly )
    {
      activePoint = false;
      switch( polyIndex )
      {
        case 0:
          alert( "case 0");
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
      
      drawPolygon( curPoly );
    
      pointShape.graphics.clear();
    }
  });
  
  $('#showBoundingBox').click(function()
  {
    showBoundingBox = !showBoundingBox;
    
    if( curPoly )
      drawPolygon(curPoly);
  });
  
  $('#point').click(function()
  {
    if( curPoly )
    {
      $('#instruct').text("Click anywhere inside drawing area to define a test point");
      
      stage.addEventListener( "stagemousedown", onMouseDown );
      stage.addEventListener( "stagemouseup"  , onMouseUp   );
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
    
    example1x.push(90);
    example1x.push(210);
    example1x.push(150);
    
    example1y.push(202);
    example1y.push(202);
    example1y.push(98);
    
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
    
    example3x.push(180);
    example3x.push(210);
    example3x.push(210);
    example3x.push(120);
    example3x.push(120);
    
    example3y.push(200);
    example3y.push(180);
    example3y.push(90);
    example3y.push(90);
    example3y.push(120);
    
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
    
    example5x.push(90);
    example5x.push(120);
    example5x.push(180);
    example5x.push(210);
    example5x.push(210);
    example5x.push(180);
    example5x.push(120);
    example5x.push(90);
    
    example5y.push(180);
    example5y.push(210);
    example5y.push(210);
    example5y.push(180);
    example5y.push(130);
    example5y.push(90);
    example5y.push(90);
    example5y.push(130);
    
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
    
    // add a shape to draw the test point graphic
    pointShape = new createjs.Shape();
    
    // add each to the display list
    stage.addChild(polyShape);
    stage.addChild(boundShape);
    stage.addChild(pointShape);
  };
  
  function drawPolygon(polygon)
  {
    var xCoords = polygon.get_xcoordinates();
    var yCoords = polygon.get_ycoordinates();
    
    // line thickness is 2
    var g = polyShape.graphics;
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
    
    // bounding box?
    if( showBoundingBox )
    {
      var bound = polygon.getBoundingBox();
      g = boundShape.graphics;
      g.clear();
      g.setStrokeStyle(2);
      g.beginStroke( createjs.Graphics.getRGB(255,255,255,1) );
      g.drawRect( bound.left, bound.top, (bound.right-bound.left), (bound.bottom-bound.top) );
    }
    else
      boundShape.graphics.clear();
      
    var active = "";
    
    // process an active point for inside/outside polygon?
    if( activePoint )
    {
      g = pointShape.graphics;
      g.clear();
      g.setStrokeStyle(1);
      g.beginStroke( createjs.Graphics.getRGB(255,0,0) );
      g.beginFill( createjs.Graphics.getRGB(255,0,0) );
      g.drawCircle(testX, testY, 3);
      
      var isInside = curPoly.isInside(testX, testY);
      if( isInside )
        active = ", point is strictly inside polygon";
      else
        active = ", point is outside polygon";
    }
    
    stage.update();
    
    // update the polygon stats
    n            = polygon.get_numPoints();
    var area     = polygon.get_area();
    var isConvex = polygon.isConvex();
    
    var p        = polygon.get_centroid();
    var centroid = " Centroid: (" + p.get_x().toFixed(2) + " , " + p.get_y().toFixed(2) + ")"; 
    
    var txt = n + " vertices. Area: " + area.toFixed(2) + " units.  Convex: " + isConvex + ". " + centroid + active;
    
    $('#instruct').text(txt);
  };
  
  function onMouseDown(evt)
  {
    testX       = stage.mouseX;
    testY       = stage.mouseY;
    activePoint = true;
  };
  
  function onMouseUp(evt)
  {
    stage.removeEventListener( "stagemousedown", onMouseDown );
    stage.removeEventListener( "stagemouseup"  , onMouseUp   );
    
    drawPolygon(curPoly);
  };
});