/*
 * Line-Rectangle inersection Demo.  Copyright (c) 2014, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */
require(['jquery', 
         'bootstrap', 
         'easeljs', 
         '../../core/Point',
         '../../core/GraphMarker',
         '../../graphing/GraphAxis', 
         '../../utils/GeomUtils',
         ], 
         function($,                    // jQuery
                  bootstrapRef,         // Bootstrap
                  easelJS,              // EaselJS
                  PointModule,          // Point
                  GraphMarkerModule,    // GraphMarker
                  GraphAxisModule,      // GraphAxis
                  GeomUtilsModule       // GeomUtils
                  )
{
  var stage;
  var xAxis;
  var yAxis;
  var grid;
  var xAxisShape;
  var xAxisArrowsShape;
  var xAxisTicMarks;
  var xAxisTicLabels;
  var xAxisTicDisplayObjects;
  var xAxisTicTextObjects;
  var yAxisShape;
  var yAxisArrowsShape;
  var yAxisTicMarks;
  var yAxisTicLabels;
  var yAxisTicDisplayObjects;
  var yAxisTicTextObjects;
  var defaultTop;
  var defaultLeft;
  var defaultRight;
  var defaultBottom;
  var majorInc;
  var minorInc;
  var axisLength;
  var axisHeight;
  var lineRenderShape;
  var rectRenderShape;
  var pxPerUnitX;
  var pxPerUnitY;
  var p0Marker;
  var p1Marker;
  var p0X, p0Y;
  var p1X, p1Y;
  
  var left = -4;
  var top = 3;
  var right = 6;
  var bottom = -2;
  
  var geomUtilsRef = new GeomUtilsModule();
  var geomUtils    = new geomUtilsRef.GeomUtils();
  
  var _x = [-6, 4];
  var _y = [1, -3];
  
  $( document ).ready( onPageLoaded );
  
  $('#reset').click(function()
  {
    // reset line endpoints
    p0Marker.set_x(xAxis, axisLength, _x[0]);
    p0Marker.set_y(yAxis, axisHeight, _y[0]);
    
    p0X = _x[0];
    p0Y = _y[0];
    
    p1Marker.set_x(xAxis, axisLength, _x[1]);
    p1Marker.set_y(yAxis, axisHeight, _y[1]);
    
    p1X = _x[1];
    p1Y = _y[1];
    
    draw();
    
    stage.update();
  });
  
  function onPageLoaded()
  {
    // initial grid values
    defaultTop    = 5;
    defaultLeft   = -10;
    defaultRight  = 10;
    defaultBottom = -5;
    decimals      = 1;
    majorInc      = 1;
    minorInc      = 0.5;
    
	  // EaselJS setup
    var canvas = document.getElementById("stageCanvas");
    stage      = new createjs.Stage(canvas);
    
    // Graph axes (length/height used to manage tic label display)
    var axisRef = new GraphAxisModule();
    xAxis      = new axisRef.GraphAxis();
    yAxis      = new axisRef.GraphAxis();
    axisLength = canvas.width;
    axisHeight = canvas.height;
    pxPerUnitX = axisLength/(defaultRight - defaultLeft);
    pxPerUnitY = axisHeight/(defaultTop - defaultBottom);
    
    // initialize the axes - default is to display both arrows
    xAxis.setOrientation( xAxis.HORIZONTAL );
    yAxis.setOrientation( yAxis.VERTICAL );
    
    xAxis.setBounds(defaultLeft, defaultTop, defaultRight, defaultBottom, canvas.width, canvas.height);
    yAxis.setBounds(defaultLeft, defaultTop, defaultRight, defaultBottom, canvas.width, canvas.height);
    
    xAxis.set_majorInc(majorInc);
    yAxis.set_majorInc(majorInc);
    xAxis.set_minorInc(minorInc);
    yAxis.set_minorInc(minorInc);
    
    xAxisTicDisplayObjects = [];
    xAxisTicTextObjects    = [];
    yAxisTicDisplayObjects = [];
    yAxisTicTextObjects    = [];
    
    // shapes to draw the axis/tic lines and tic labels
    grid             = new createjs.Shape();
    xAxisShape       = new createjs.Shape();
    xAxisArrowsShape = new createjs.Shape();
    xAxisTicMarks    = new createjs.Shape();
    xAxisTicLabels   = new createjs.Shape();
    yAxisShape       = new createjs.Shape();
    yAxisArrowsShape = new createjs.Shape();
    yAxisTicMarks    = new createjs.Shape();
    yAxisTicLabels   = new createjs.Shape();
    rectRenderShape  = new createjs.Shape();
    lineRenderShape  = new createjs.Shape();
    
    // add everything to the display list
    stage.addChild(grid);
    stage.addChild(xAxisShape);
    stage.addChild(xAxisArrowsShape);
    stage.addChild(xAxisTicMarks); 
    stage.addChild(xAxisTicLabels);  
    stage.addChild(yAxisShape); 
    stage.addChild(yAxisArrowsShape); 
    stage.addChild(yAxisTicMarks); 
    stage.addChild(yAxisTicLabels);
    stage.addChild(rectRenderShape);
    stage.addChild(lineRenderShape);
    
    drawAxes();
    
    var markerRef = new GraphMarkerModule();
    p0Marker      = new markerRef.GraphMarker();
    p0Marker.create(stage, onp0Moved, 6, xAxis, axisLength, yAxis, axisHeight);  
    p0Marker.set_x(xAxis, axisLength, _x[0]);
    p0Marker.set_y(yAxis, axisHeight, _y[0]);
    
    // middle marker is the control point
    p1Marker = new markerRef.GraphMarker();
    p1Marker.create(stage, onp1Moved, 6, xAxis, axisLength, yAxis, axisHeight);  
    p1Marker.set_x(xAxis, axisLength, _x[1]);
    p1Marker.set_y(yAxis, axisHeight, _y[1]);
    
    p0X = _x[0];
    p0Y = _y[0];
    
    p1X = _x[1];
    p1Y = _y[1];
    
    draw();
    
    stage.update();
  };
  
  // p0 moved
  function onp0Moved(newX, newY)
  {
    p0X = newX;
    p0Y = newY;
    
    draw();
  };
  
  // p1 moved
  function onp1Moved(newX, newY)
  {
    p1X = newX;
    p1Y = newY;
    
    draw();
  };
  
  function draw()
  {
    var g = rectRenderShape.graphics;
    g.clear();
    g.setStrokeStyle(2);
    g.beginStroke( createjs.Graphics.getRGB(0,255,0,1) );
    
    var l = (left - defaultLeft)*pxPerUnitX;
    var t = (defaultTop - top)*pxPerUnitY;
    var r = (right - defaultLeft)*pxPerUnitX;
    var b = (defaultTop - bottom)*pxPerUnitY;
    g.drawRect(l, t, r-l, b-t);
    g.endStroke();
    
    var g = lineRenderShape.graphics;
    g.clear();
    
    g.setStrokeStyle(2);
    g.beginStroke( createjs.Graphics.getRGB(255,255,255,1) );
    
    var x0 = (p0X - defaultLeft)*pxPerUnitX;
    var y0 = (defaultTop - p0Y)*pxPerUnitY;
    
    var x1 = (p1X - defaultLeft)*pxPerUnitX;
    var y1 = (defaultTop - p1Y)*pxPerUnitY;
    
    g.moveTo(x0, y0);
    g.lineTo(x1, y1);
    
    var intersect = geomUtils.intersectBox( p0X, p0Y, p1X, p1Y, left, top, right, bottom, false );
    if( intersect )
    {
      var points = geomUtils.lineRectIntersection( p0X, p0Y, p1X, p1Y, left, top, right, bottom );
      var px = points.x1;
      var py = points.y1;
      
      g.beginFill( '#ff0000' );
      x0 = (px - defaultLeft)*pxPerUnitX;
      y0 = (defaultTop - py)*pxPerUnitY;
  
      g.moveTo(x0,y0);
      g.drawCircle(x0,y0,4);
      g.endFill();

      px = points.x2;
      py = points.y2;
      
      x1 = (px - defaultLeft)*pxPerUnitX;
      y1 = (defaultTop - py)*pxPerUnitY;
    
      g.beginFill('#ff0000');
      g.moveTo(x1,y1);
      g.drawCircle(x1,y1,4);
      g.endFill();
      
      $('#instruct').text( "Intersection" );
    }
    else
      $('#instruct').text( "No intersection" );
    
    stage.update();
  };
  
  function drawAxes()
  {
    var g = grid.graphics;
    g.clear();
    g.setStrokeStyle(1);
    g.beginStroke( createjs.Graphics.getRGB(201,201,201,0.5) );
    xAxis.drawGrid(g);
    yAxis.drawGrid(g);
    g.endStroke();
    
    // x- and y-axis thickness is 3
    g = xAxisShape.graphics;
    g.clear();
    g.setStrokeStyle(3);
    g.beginStroke( createjs.Graphics.getRGB(131,156,165,1) );
    xAxis.drawAxis(g, 10, 8);
    
    g = yAxisShape.graphics;
    g.clear();
    g.setStrokeStyle(3);
    g.beginStroke( createjs.Graphics.getRGB(131,156,165,1) );
    yAxis.drawAxis(g, 10, 8);
    
    g = xAxisArrowsShape.graphics;
    g.clear();
    g.beginFill( createjs.Graphics.getRGB(131,156,165,1) );
    xAxis.drawArrows(g, 10, 8);
    g.endFill();
    
    g = yAxisArrowsShape.graphics;
    g.clear();
    g.beginFill( createjs.Graphics.getRGB(131,156,165,1) );
    yAxis.drawArrows(g, 10, 8);
    g.endFill;
    
    // x-axis major and minor tic marks
    g = xAxisTicMarks.graphics;
    g.clear();
    g.setStrokeStyle(2);
    g.beginStroke( createjs.Graphics.getRGB(131,156,165,1) );
    xAxis.drawMajorTicMarks(g, 20);
    g.endStroke();
    
    g.setStrokeStyle(1);
    g.beginStroke( createjs.Graphics.getRGB(131,156,165,1) );
    xAxis.drawMinorTicMarks(g,10);
    g.endStroke();
    
    // y-axis major and minor tic marks
    g = yAxisTicMarks.graphics;
    g.clear();
    g.setStrokeStyle(2);
    g.beginStroke( createjs.Graphics.getRGB(131,156,165,1) );
    yAxis.drawMajorTicMarks(g, 20);
    g.endStroke();
    
    g.setStrokeStyle(1);
    g.beginStroke( createjs.Graphics.getRGB(131,156,165,1) );
    yAxis.drawMinorTicMarks(g,10);
    g.endStroke();
    
    // tic labels require managing a display list, so these are rendered externally, similar to the Numberline example
    // get the pixel locations of the major tic marks
    var majorTics    = xAxis.getTicCoordinates("major");
    var numMajorTics = majorTics.length;
    var numLabels    = xAxisTicDisplayObjects.length;
    var lbl;
    var dispObj;
    var i;
    var ticX;
    
    if( numLabels < numMajorTics )
    {
      // create labels JIT and then re-use the pool every number line redraw
      for( i=numLabels; i<numMajorTics; ++i)
      {
        lbl     = new createjs.Text(" ", 'Bold 15px Arial', "#ebebeb" );
        dispObj = stage.addChild(lbl);
        
        xAxisTicTextObjects.push( lbl );
        xAxisTicDisplayObjects.push( dispObj );
      }
    }
    
    // use however many tic labels are necessary and hide the remaining ones
    var labelText = xAxis.getTicMarkLabels("major", 0, false);

    for( i=0; i<numLabels; ++i )
    {
      // make all tic labels invisible by default
      xAxisTicDisplayObjects[i].visible = false;
    }
    
    if( xAxis.isVisible() )
    {
      // position the labels - it's a matter of style, but for this demo, the endpoint labels are not displayed if they are near the Canvas edge
      var axisY    = xAxis.get_axisOffset();
      var baseline = axisY + 10;
    
      for( i=0; i<numMajorTics; ++i )
      {
        lbl             = xAxisTicTextObjects[i];
        dispObj         = xAxisTicDisplayObjects[i];
        if( labelText[i] != "0" )
        {
          lbl.text        = labelText[i]; 
          ticX            = majorTics[i];
          dispObj.x       = Math.round( ticX - 0.5*lbl.getMeasuredWidth() );
          dispObj.y       = baseline;
          dispObj.visible = ticX > 10 && ticX < axisLength-10;
        }
      }
    }
    
    majorTics    = yAxis.getTicCoordinates("major");
    numMajorTics = majorTics.length;
    numLabels    = yAxisTicDisplayObjects.length;
    var ticY;
    
    if( numLabels < numMajorTics )
    {
      // create labels JIT and then re-use the pool every number line redraw
      for( i=numLabels; i<numMajorTics; ++i)
      {
        lbl     = new createjs.Text(" ", 'Bold 15px Arial', "#ebebeb" );
        dispObj = stage.addChild(lbl);
        
        yAxisTicTextObjects.push( lbl );
        yAxisTicDisplayObjects.push( dispObj );
      }
    }
    
    // use however many tic labels are necessary and hide the remaining ones
    var labelText = yAxis.getTicMarkLabels("major", 0, false);

    for( i=0; i<numLabels; ++i )
    {
      // make all tic labels invisible by default
      yAxisTicDisplayObjects[i].visible = false;
    }
    
    if( yAxis.isVisible() )
    {
      var axisX    = yAxis.get_axisOffset();
      var baseline = axisX + 8;
    
      for( i=0; i<numMajorTics; ++i )
      {
        lbl             = yAxisTicTextObjects[i];
        dispObj         = yAxisTicDisplayObjects[i];
        if( labelText[i] != "0" )
        {
          lbl.text        = labelText[i]; 
          ticY            = axisHeight - majorTics[i];
          dispObj.x       = baseline;
          dispObj.y       =  Math.round( ticY - 0.5*lbl.getMeasuredHeight() ) - 1;
          dispObj.visible = ticY > 10 && ticY < axisHeight-10;
        }
      }
    }
    
    stage.update();
  };
});