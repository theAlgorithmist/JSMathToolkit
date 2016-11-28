/*
 * Supporting script for 2D interactive, Catmull-Rom spline demo.  Copyright (c) 2014, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */
require(['jquery', 
         'bootstrap', 
         'easeljs', 
         '../../core/GraphMarker', 
         '../../graphing/GraphAxis', 
         '../../splines/CatmullRom',
         '../../splines/SplineToBezier'], 
         function($,                       // jQuery
                  bootstrapRef,            // Bootstrap
                  easelJS,                 // EaselJS
                  GraphMarkerModule,       // GraphMarker
                  GraphAxisModule,         // GraphAxis
                  CatmullRomSplineModule,  // CubicBezierSpline
                  SplineToBezierModule     // SplineToBezier
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
  var spline;
  var pxPerUnitX;
  var pxPerUnitY;
  var p0Marker;
  var p1Marker;
  var p2Marker
  var p3Marker;
  var splineMarker;
  var xArray;
  var yArray;
  
  var splineToBezierRef = new SplineToBezierModule();
  var splineToBezier    = new splineToBezierRef.SplineToBezier();
  
  var splineRef = new CatmullRomSplineModule();
  var spline    = new splineRef.CatmullRom();
  
  // interpolation points
  var _x = [-7, -1, 3, 7 ];
  var _y = [-3,  3, -3, 1 ];
  
  xArray = _x.slice();
  yArray = _y.slice();

  $( document ).ready( onPageLoaded );
  
  $('input[name="sValue"]').click(function()
  {
    var sVal = $('input[name="sValue"]');
    var s    = sVal.val();
        
    // get x- and y-coordinates at the normalized arc length
    var x = spline.getXAtS(s);
    var y = spline.getYAtS(s);
    
    splineMarker.set_x(xAxis, axisLength, x);
    splineMarker.set_y(yAxis, axisHeight, y);
    
    $('#instruct').text( "s = " + s + ", (x,y) = " + x.toFixed(2) + " " + y.toFixed(2) );
    
    stage.update();
  });
  
  $('#reset').click(function()
  {
    spline.clear();
    
    // reset bezier curve and marker coordinates
    p0Marker.set_x(xAxis, axisLength, _x[0]);
    p0Marker.set_y(yAxis, axisHeight, _y[0]);
    
    p1Marker.set_x(xAxis, axisLength, _x[1]);
    p1Marker.set_y(yAxis, axisHeight, _y[1]);
    
    p2Marker.set_x(xAxis, axisLength, _x[2]);
    p2Marker.set_y(yAxis, axisHeight, _y[2]);
    
    p3Marker.set_x(xAxis, axisLength, _x[3]);
    p3Marker.set_y(yAxis, axisHeight, _y[3]);
    
    spline.data(_x, _y);
    
    xArray = _x.slice();
    yArray = _y.slice();
    
    drawSpline();
    
    stage.update();
    
    $('#instruct').text("Drag the circular Markers to change interpolation points.");
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
    xAxis       = new axisRef.GraphAxis();
    yAxis       = new axisRef.GraphAxis();
    axisLength  = canvas.width;
    axisHeight  = canvas.height;
    pxPerUnitX  = axisLength/(defaultRight - defaultLeft);
    pxPerUnitY  = axisHeight/(defaultTop - defaultBottom);
    
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
    p0Marker.set_x(xAxis, axisLength, _x[0]);
    p0Marker.set_y(yAxis, axisHeight, _y[0]);
    
    spline.addControlPoint(_x[0], _y[0]);
    
    // middle marker is the control point
    p1Marker = new markerRef.GraphMarker();
    p1Marker.create(stage, onP1Moved, 6, xAxis, axisLength, yAxis, axisHeight);  
    p1Marker.set_x(xAxis, axisLength, _x[1]);
    p1Marker.set_y(yAxis, axisHeight, _y[1]);
    
    spline.addControlPoint(_x[1], _y[1]);
    
    p2Marker = new markerRef.GraphMarker();
    p2Marker.create(stage, onP2Moved, 6, xAxis, axisLength, yAxis, axisHeight);  
    p2Marker.set_x(xAxis, axisLength, _x[2]);
    p2Marker.set_y(yAxis, axisHeight, _y[2]);
    
    spline.addControlPoint(_x[2], _y[2]);
    
    p3Marker = new markerRef.GraphMarker();
    p3Marker.create(stage, onP3Moved, 6, xAxis, axisLength, yAxis, axisHeight);  
    p3Marker.set_x(xAxis, axisLength, _x[3]);
    p3Marker.set_y(yAxis, axisHeight, _y[3]);
    
    spline.addControlPoint(_x[3], _y[3]);
    
    splineMarker = new markerRef.GraphMarker();
    splineMarker.create(stage, null, 6, xAxis, axisLength, yAxis, axisHeight, 0, 255, 0);  
    splineMarker.set_x(xAxis, axisLength, -10);
    splineMarker.set_y(yAxis, axisHeight, -10);
    
    drawSpline();
    
    stage.update();
  };
  
  function onP0Moved(newX, newY)
  {
    spline.clear();
    
    xArray[0] = newX;
    yArray[0] = newY;
    
    spline.data(xArray, yArray);
    
    drawSpline();
  };
  
  function onP1Moved(newX, newY)
  {
    spline.clear();
    
    xArray[1] = newX;
    yArray[1] = newY;
    
    spline.data(xArray, yArray);
    
    drawSpline();
  };
  
  function onP2Moved(newX, newY)
  {
    spline.clear();
    
    xArray[2] = newX;
    yArray[2] = newY;
    
    spline.data(xArray, yArray);
    
    drawSpline();
  };
  
  function onP3Moved(newX, newY)
  {
    spline.clear();
    
    xArray[3] = newX;
    yArray[3] = newY;
    
    spline.data(xArray, yArray);
    
    drawSpline();
  };
  
  function drawSpline()
  {
    // draw the cubic with a simple point-to-point plot 
    var g = curveRenderShape.graphics;
    g.clear();
    
    var x0 = (spline.getX(0) - defaultLeft)*pxPerUnitX;
    var y0 = (defaultTop  - spline.getY(0))*pxPerUnitY;
    
    // draw the spline, point-to-point
    g.setStrokeStyle(2);
    g.beginStroke( createjs.Graphics.getRGB(255,255,255,2) );
    g.moveTo(x0, y0);
    
    for( t=0.02; t<=1.0; t+=0.02 )
      g.lineTo( (spline.getX(t)-defaultLeft)*pxPerUnitX, (defaultTop - spline.getY(t))*pxPerUnitY );
    
    g.lineTo( (spline.getX(1)-defaultLeft)*pxPerUnitX, (defaultTop - spline.getY(1))*pxPerUnitY );

    g.endStroke();
    
    // quad approximation
    var q     = splineToBezier.convert(spline, 0.005);
    var quads = q.quads;
    
    var g = quadApprox.graphics;
    g.clear();
    
    g.setStrokeStyle(2);
    g.beginStroke( createjs.Graphics.getRGB(0,0,255,2) );
    
    var i, q, cx, cy, cx1, cy1, x1, y1;
    var len = quads.length;
    
    // convert user coordinates to px (graph dimensions and bounds are constant in this demo)
    g.moveTo( (spline.getX(0)-defaultLeft)*pxPerUnitX, (defaultTop - spline.getY(0))*pxPerUnitY );
    for( i=0; i<len; ++i )
    {
      q = quads[i];
    
      cx = (q.cx - defaultLeft)*pxPerUnitX;
      cy = (defaultTop - q.cy)*pxPerUnitY;
      
      x1 = (q.x1 - defaultLeft)*pxPerUnitX;
      y1 = (defaultTop - q.y1)*pxPerUnitY;

      g.curveTo(cx, cy, x1, y1);
    }
    
    g.endStroke();
    
    stage.update();
    
    var len = spline.length();
    $('#instruct').text( "Spline arc length: " + len.toFixed(2 ) );
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