/*
 * Supporting script for 2D interactive, parametric line.  Copyright (c) 2013, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */
require(['jquery', 
         'bootstrap', 
         'easeljs', 
         '../../planarCurves/Line',
         '../../graphing/GraphAxis',
         '../../core/GraphMarker', 
         '../../core/GraphSlice', 
         '../../core/decorators/SolidLineDecorator'], 
         function($,                    // jQuery
                  bootstrapRef,         // Bootstrap
                  easelJS,              // EaselJS
                  LineModule,           // Line
                  GraphAxisModule,      // Graph Axis
                  GraphMarkerModule,    // GraphMaker
                  GraphSliceModule,     // GraphSlice
                  SolidDecoratorModule) // SolidLineDecorator
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
  var sliceTool;
  var line;
  var lineDecorator;
  var pxPerUnitX;
  var pxPerUnitY;
  var beginMarker;
  var endMarker;
  
  $( document ).ready( onPageLoaded );
  
  $('#reset').click(function()
  {
    // reset line and marker coordinates, or as an exercise, reset the line and read the marker coordinates from the line values at t=0 and t=1.
    beginMarker.set_x(xAxis, axisLength, -5);
    beginMarker.set_y(yAxis, axisHeight, -3);
    
    line.set_x0(-5);
    line.set_y0(-3);
    
    endMarker.set_x(xAxis, axisLength, 4);
    endMarker.set_y(yAxis, axisHeight, 2);
    
    line.set_x1(4);
    line.set_y1(2);
    
    sliceTool.setValue(xAxis, axisLength, 1);
    
    drawLine();
    
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
    xAxis       = new axisRef.GraphAxis();
    yAxis       = new axisRef.GraphAxis();
    axisLength  = canvas.width;
    axisHeight  = canvas.height;
    pxPerUnitX  = axisLength/(defaultRight - defaultLeft);
    pxPerUnitY  = axisHeight/(defaultTop - defaultBottom);
    
    // initialize the axes - default is to display both arrows
    xAxis.setOrientation(xAxis.HORIZONTAL);
    yAxis.setOrientation(yAxis.VERTICAL);
    
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
    lineRenderShape      = new createjs.Shape();
    
    // Parametric line
    var lineRef = new LineModule();
    line        = new lineRef.Line();
    
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
    stage.addChild(lineRenderShape);
    
    drawAxes();
    
    // GraphMarker
    var markerRef = new GraphMarkerModule();
    beginMarker   = new markerRef.GraphMarker();
    beginMarker.create(stage, onBeginMoved, 6, xAxis, axisLength, yAxis, axisHeight);  
    beginMarker.set_x(xAxis, axisLength, -5);
    beginMarker.set_y(yAxis, axisHeight, -3);
    
    // set the line coordinates as well, or as an exercise, read them from the Marker
    line.set_x0(-5);
    line.set_y0(-3);
    
    endMarker = new markerRef.GraphMarker();
    endMarker.create(stage, onEndMoved, 6, xAxis, axisLength, yAxis, axisHeight);  
    endMarker.set_x(xAxis, axisLength, 4);
    endMarker.set_y(yAxis, axisHeight, 2);
    
    // again, set the line coords. directly or read from the Marker
    line.set_x1(4);
    line.set_y1(2);
    
    // create and display a vertical graph slice tool
    var sliceRef = new GraphSliceModule();
    sliceTool    = new sliceRef.GraphSlice();
    sliceTool.create(stage, onToolMoved, "vertical", 26, 15, xAxis, axisLength, yAxis, axisHeight);  // default triangle-marker and line colors
    
    // position the marker in user coordinates at x=1
    sliceTool.setValue(xAxis, axisLength, 1);
    
    drawLine();
    
    stage.update();
  };
  
  function onToolMoved(value)
  {
    // we know in advance that this is a vertical slice tool that queries x-coordinates.  First, get the parameter value, then exercise the x-at-t and y-at-t methods
    var t = line.getTAtX(value);
    $('#instruct').text( "t: " + t.toFixed(2) + "  point: (" + line.getX(t).toFixed(2) + "," + line.getY(t).toFixed(2) + ")" );
  };
  
  // beginning-point marker moved
  function onBeginMoved(newX, newY)
  {
    // suggestion: rewrite drawLine() to get the line endpoints from the Markers
    line.set_x0(newX);
    line.set_y0(newY);
    
    drawLine();
  };
  
  // end-point marker moved
  function onEndMoved(newX, newY)
  {
    // suggestion: rewrite drawLine() to get the line endpoints from the Markers
    line.set_x1(newX);
    line.set_y1(newY);
    
    drawLine();
  };
  
  function drawLine()
  {
    var g = lineRenderShape.graphics;
    
    // clear the decorator, not the context directly - this does not matter for the current demo, but will be important for more complex line decorators
    lineDecorator.clear(g);
    
    g.setStrokeStyle(2);
    g.beginStroke( createjs.Graphics.getRGB(255,255,255,1) );
    
    // convert user coordinates to px (graph dimensions and bounds are constant in this demo)
    var x0 = (line.get_x0() - defaultLeft)*pxPerUnitX;
    var y0 = (defaultTop  - line.get_y0())*pxPerUnitY;
    var x1 = (line.get_x1() - defaultLeft)*pxPerUnitX;
    var y1 = (defaultTop  - line.get_y1())*pxPerUnitY;

    // all drawing is done with the line decorator
    lineDecorator.moveTo(g, x0, y0 );
    lineDecorator.lineTo(g, x1, y1 );
    
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