/*
 * Supporting script for 2D interactive, quadratic Bezier demo.  Copyright (c) 2014, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */
require(['jquery', 
         'bootstrap', 
         'easeljs', 
         '../../core/decorators/SolidLineDecorator',
         '../../core/GraphMarker', 
         '../../core/GraphSlice', 
         '../../graphing/GraphAxis', 
         '../../planarCurves/QuadBezier'], 
         function($,                    // jQuery
                  bootstrapRef,         // Bootstrap
                  easelJS,              // EaselJS
                  SolidDecoratorModule, // SolidLineDecorator
                  GraphMarkerModule,    // GraphMarker
                  GraphSliceModule,     // GraphSlice
                  GraphAxisModule,      // GraphAxis
                  QuadBezierModule      // QuadBeizer
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
  var sliceTool;
  var curve;
  var lineDecorator;
  var pxPerUnitX;
  var pxPerUnitY;
  var beginMarker;
  var middleMarker;
  var endMarker;
  var markerValue;
  
  $( document ).ready( onPageLoaded );
  
  $('#reset').click(function()
  {
    // reset bezier curve and marker coordinates
    beginMarker.set_x(xAxis, axisLength, -5);
    beginMarker.set_y(yAxis, axisHeight, -3);
    
    curve.set_x0(-5);
    curve.set_y0(-3);
    
    middleMarker.set_x(xAxis, axisLength, 1);
    middleMarker.set_y(yAxis, axisHeight, 4);
    
    curve.set_cx(1);
    curve.set_cy(4);
    
    endMarker.set_x(xAxis, axisLength, 5);
    endMarker.set_y(yAxis, axisHeight, 1);
    
    curve.set_x1(5);
    curve.set_y1(1);
    
    sliceTool.setValue(xAxis, axisLength, 1);
    
    drawCurve();
    
    stage.update();
    
    $('#instruct').text("Drag the slice tool (triangular markers) to query parameter and the line coordinates.  Drag the circular Markers to change endpoints.");
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
    
    // Quadratic Bezier
    var bezierRef = new QuadBezierModule();
    curve = new bezierRef.QuadBezier();
    
    // line decorator for drawing
    var decorator = new SolidDecoratorModule();
    lineDecorator = new decorator.SolidLineDecorator();
    
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
    
    drawAxes();
    
    var markerRef = new GraphMarkerModule();
    beginMarker   = new markerRef.GraphMarker();
    beginMarker.create(stage, onBeginMoved, 6, xAxis, axisLength, yAxis, axisHeight);  
    beginMarker.set_x(xAxis, axisLength, -5);
    beginMarker.set_y(yAxis, axisHeight, -3);
    
    // set the line coordinates as well, or as an exercise, read them from the Marker
    curve.set_x0(-5);
    curve.set_y0(-3);
    
    // middle marker is the control point
    middleMarker = new markerRef.GraphMarker();
    middleMarker.create(stage, onControlMoved, 6, xAxis, axisLength, yAxis, axisHeight);  
    middleMarker.set_x(xAxis, axisLength, 1);
    middleMarker.set_y(yAxis, axisHeight, 4);
    
    curve.set_cx(1);
    curve.set_cy(4);
    
    endMarker = new markerRef.GraphMarker();
    endMarker.create(stage, onEndMoved, 6, xAxis, axisLength, yAxis, axisHeight);  
    endMarker.set_x(xAxis, axisLength, 5);
    endMarker.set_y(yAxis, axisHeight, 1);
    
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
    
    $('#instruct').text( "t: " + t.toFixed(2) + "  point: (" + curve.getX(t).toFixed(2) + "," + curve.getY(t).toFixed(2) + ")" + " arc length: " + curve.lengthAt(t).toFixed(2) );
  };
  
  // beginning-point marker moved
  function onBeginMoved(newX, newY)
  {
    curve.set_x0(newX);
    curve.set_y0(newY);
    
    onToolMoved(markerValue);
    
    drawCurve();
  };
  
  // control-point marker moved
  function onControlMoved(newX, newY)
  {
    curve.set_cx(newX);
    curve.set_cy(newY);
    
    $('#instruct').text( "arc length: " + curve.lengthAt(1.0).toFixed(2) );
    
    drawCurve();
  };
  
  // end-point marker moved (in case you want to do something different on endpoints vs. middle control point)
  function onEndMoved(newX, newY)
  {
    curve.set_x1(newX);
    curve.set_y1(newY);
    
    $('#instruct').text( "arc length: " + curve.lengthAt(1.0).toFixed(2) );
    
    drawCurve();
  };
  
  function drawCurve()
  {
    var g = curveRenderShape.graphics;
    
    lineDecorator.clear(g);
    
    g.setStrokeStyle(2);
    g.beginStroke( createjs.Graphics.getRGB(205,205,205,1) );
    
    // convert user coordinates to px (graph dimensions and bounds are constant in this demo)
    var x0 = (curve.get_x0() - defaultLeft)*pxPerUnitX;
    var y0 = (defaultTop  - curve.get_y0())*pxPerUnitY;
    var cx = (curve.get_cx() - defaultLeft)*pxPerUnitX;
    var cy = (defaultTop  - curve.get_cy())*pxPerUnitY;
    var x1 = (curve.get_x1() - defaultLeft)*pxPerUnitX;
    var y1 = (defaultTop  - curve.get_y1())*pxPerUnitY;

    // draw the control points (solid line)
    lineDecorator.moveTo(g, x0, y0);
    lineDecorator.lineTo(g, cx, cy);
    lineDecorator.lineTo(g, x1, y1);
    g.endStroke();
    
    // draw the Bezier curve
    g.setStrokeStyle(2);
    g.beginStroke( createjs.Graphics.getRGB(255,255,255,1) );
    lineDecorator.moveTo(g, x0, y0 );
    lineDecorator.curveTo(g, cx, cy, x1, y1 );
    g.endStroke();
    
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