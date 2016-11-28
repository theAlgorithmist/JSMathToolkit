/*
 * Supporting script for 2D interactive, cubic Bezier demo.  Copyright (c) 2014, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */
require(['jquery', 
         'bootstrap', 
         'easeljs', 
         '../../core/GraphMarker', 
         '../../core/GraphSlice', 
         '../../graphing/GraphAxis', 
         '../../utils/BezierUtils',
         '../../planarCurves/CubicBezier'], 
         function($,                    // jQuery
                  bootstrapRef,         // Bootstrap
                  easelJS,              // EaselJS
                  GraphMarkerModule,    // GraphMarker
                  GraphSliceModule,     // GraphSlice
                  GraphAxisModule,      // GraphAxis
                  BezierUtilsModule,    // BezierUtils
                  CubicBezierModule     // CubicBeizer
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
  var curveRenderShape;
  var quadApprox;
  var sliceTool;
  var curve;
  var pxPerUnitX;
  var pxPerUnitY;
  var p0Marker;
  var p1Marker;
  var p2Marker
  var p3Marker;
  var markerValue;
  
  var bezierUtilsRef = new BezierUtilsModule();
  var bezierUtils    = new bezierUtilsRef.BezierUtils();
  
  $( document ).ready( onPageLoaded );
  
  $('#reset').click(function()
  {
    // reset bezier curve and marker coordinates
    p0Marker.set_x(xAxis, axisLength, -5);
    p0Marker.set_y(yAxis, axisHeight, -3);
    
    curve.set_x0(-5);
    curve.set_y0(-3);
    
    p1Marker.set_x(xAxis, axisLength, 1);
    p1Marker.set_y(yAxis, axisHeight, 4);
    
    curve.set_cx(1);
    curve.set_cy(4);
    
    p2Marker.set_x(xAxis, axisLength, 3);
    p2Marker.set_y(yAxis, axisHeight, -2);
    
    curve.set_cx1(3);
    curve.set_cy1(-2);
    
    p3Marker.set_x(xAxis, axisLength, 5);
    p3Marker.set_y(yAxis, axisHeight, 1);
    
    curve.set_x1(5);
    curve.set_y1(1);
    
    sliceTool.setValue(xAxis, axisLength, 1);
    
    drawCurve();
    
    stage.update();
    
    $('#instruct').text("Drag the slice tool (triangular markers) to query parameter values and the line coordinates.  Drag the circular Markers to change cubic control points.");
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
    grid                 = new createjs.Shape();
    xAxisShape           = new createjs.Shape();
    xAxisArrowsShape     = new createjs.Shape();
    xAxisTicMarks        = new createjs.Shape();
    xAxisTicLabels       = new createjs.Shape();
    yAxisShape           = new createjs.Shape();
    yAxisArrowsShape     = new createjs.Shape();
    yAxisTicMarks        = new createjs.Shape();
    yAxisTicLabels       = new createjs.Shape();
    curveRenderShape     = new createjs.Shape();
    quadApprox           = new createjs.Shape();
    
    // Cubic Bezier
    var bezierRef = new CubicBezierModule();
    curve = new bezierRef.CubicBezier();
    
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
    stage.addChild(curveRenderShape);
    stage.addChild(quadApprox);
    
    drawAxes();
    
    var markerRef = new GraphMarkerModule();
    p0Marker      = new markerRef.GraphMarker();
    p0Marker.create(stage, onP0Moved, 6, xAxis, axisLength, yAxis, axisHeight);  
    p0Marker.set_x(xAxis, axisLength, -5);
    p0Marker.set_y(yAxis, axisHeight, -3);
    
    // set the line coordinates as well, or as an exercise, read them from the Marker
    curve.set_x0(-5);
    curve.set_y0(-3);
    
    // middle marker is the control point
    p1Marker = new markerRef.GraphMarker();
    p1Marker.create(stage, onP1Moved, 6, xAxis, axisLength, yAxis, axisHeight);  
    p1Marker.set_x(xAxis, axisLength, -1);
    p1Marker.set_y(yAxis, axisHeight, 4);
    
    curve.set_cx(-1);
    curve.set_cy(4);
    
    p2Marker = new markerRef.GraphMarker();
    p2Marker.create(stage, onP2Moved, 6, xAxis, axisLength, yAxis, axisHeight);  
    p2Marker.set_x(xAxis, axisLength, 3);
    p2Marker.set_y(yAxis, axisHeight, -2);
    
    curve.set_cx1(3);
    curve.set_cy1(-2);
    
    p3Marker = new markerRef.GraphMarker();
    p3Marker.create(stage, onP3Moved, 6, xAxis, axisLength, yAxis, axisHeight);  
    p3Marker.set_x(xAxis, axisLength, 5);
    p3Marker.set_y(yAxis, axisHeight, 1);
    
    // again, set the line coords. directly or read from the Marker
    curve.set_x1(5);
    curve.set_y1(1);
    
    // create and display a vertical graph slice tool
    var slice = new GraphSliceModule();
    sliceTool = new slice.GraphSlice();
    sliceTool.create(stage, onToolMoved, "vertical", 26, 15, xAxis, axisLength, yAxis, axisHeight);  // default triangle-marker and line colors
    
    // position the marker in user coordinates at x=1
    sliceTool.setValue(xAxis, axisLength, 1);
    markerValue = 1;
    
    drawCurve();
    
    stage.update();
  };
  
  function onToolMoved(value)
  {
    // we know in advance that this is a vertical slice tool that queries x-coordinates.  First, get the parameter value, then exercise the x-at-t, y-at-t, and arc-length methods
    var t       = curve.getTAtX(value);
    markerValue = value;
    
    var tStr = "";
    if( t.length > 0 )
      tStr += t[0].toFixed(2);
    
    if( t.length > 1 )
      tStr += ", " + t[1].toFixed(2);
    
    if( t.length > 2 )
      tStr += ", " + t[2].toFixed(2);
    
    $('#instruct').text( "t values: " + tStr );
  };
  
  // (x0,y0) moved
  function onP0Moved(newX, newY)
  {
    curve.set_x0(newX);
    curve.set_y0(newY);
    
    $('#instruct').text( "arc length: " + curve.length().toFixed(2) );
    
    drawCurve();
  };
  
  // (cx,cy) moved
  function onP1Moved(newX, newY)
  {
    curve.set_cx(newX);
    curve.set_cy(newY);
    
    $('#instruct').text( "arc length: " + curve.length().toFixed(2) );
    
    drawCurve();
  };
  
  // (cx1,cy1) moved
  function onP2Moved(newX, newY)
  {
    curve.set_cx1(newX);
    curve.set_cy1(newY);
    
    $('#instruct').text( "arc length: " + curve.length().toFixed(2) );
    
    drawCurve();
  };
  
  // (x1,y1) moved
  function onP3Moved(newX, newY)
  {
    curve.set_x1(newX);
    curve.set_y1(newY);
    
    $('#instruct').text( "arc length: " + curve.length().toFixed(2) );
    
    drawCurve();
  };
  
  function drawCurve()
  {
    // draw the cubic with a simple point-to-point plot and overlay the quad approximation
    var g = curveRenderShape.graphics;
    g.clear();
    
    var x0 = (curve.get_x0() - defaultLeft)*pxPerUnitX;
    var y0 = (defaultTop  - curve.get_y0())*pxPerUnitY;
    
    // draw the Bezier curve, point-to-point
    g.setStrokeStyle(2);
    g.beginStroke( createjs.Graphics.getRGB(255,255,255) );
    g.moveTo(x0, y0);
    
    for( t=0.02; t<=1.0; t+=0.02 )
      g.lineTo( (curve.getX(t)-defaultLeft)*pxPerUnitX, (defaultTop - curve.getY(t))*pxPerUnitY );
    
    g.lineTo( (curve.getX(1.0)-defaultLeft)*pxPerUnitX, (defaultTop - curve.getY(1.0))*pxPerUnitY );

    g.endStroke();
    
    // quad approximation
    var quads = bezierUtils.toQuadBezier(curve, 0.005);
    var g = quadApprox.graphics;
    g.clear();
    
    g.setStrokeStyle(2);
    g.beginStroke( createjs.Graphics.getRGB(0,0,255) );
    
    var i, q, cx, cy, x1, y1;
    var len = quads.length;
    
    // convert user coordinates to px (graph dimensions and bounds are constant in this demo)
    g.moveTo( (curve.getX(0)-defaultLeft)*pxPerUnitX, (defaultTop - curve.getY(0))*pxPerUnitY );
    for( i=0; i<len; ++i )
    {
      q = quads[i];
    
      cx = (q.cx - defaultLeft)*pxPerUnitX;
      cy = (defaultTop - q.cy)*pxPerUnitY;
      x1 = (q.x1 - defaultLeft)*pxPerUnitX;
      y1 = (defaultTop - q.y1)*pxPerUnitY;

      // draw the control points (solid line)
      g.curveTo(cx, cy, x1, y1);
    }
    
    g.endStroke();
    
    stage.update();
    
    $('#instruct').text( "arc length: " + curve.length().toFixed(2) );
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