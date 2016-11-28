/*
 * Supporting script for 2D bounce controller. Copyright (c) 2014, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */
require(['jquery', 
         'bootstrap', 
         'easeljs', 
         '../../core/GraphMarker', 
         '../../graphing/GraphAxis', 
         '../../simplePhysics/Motion',
         '../../simplePhysics/BounceController'
         ], 
         function($,                    // jQuery
                  bootstrapRef,         // Bootstrap
                  easelJS,              // EaselJS
                  GraphMarkerModule,    // GraphMarker
                  GraphAxisModule,      // GraphAxis
                  MotionModule,         // Motion
                  ControllerModule      // GravityController
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
  var objectShape;
  var pxPerUnitX;
  var pxPerUnitY;
  var p0Marker;
  var p1Marker;
  var p0x, p0y;
  var p1x, p1y;
  
  var motionRef     = new MotionModule();
  var controllerRef = new ControllerModule();
  
  var __motion     = new motionRef.Motion();
  var __controller = new controllerRef.BounceController();
  
  __motion.set_controller(__controller);
  
  var __start    = 0;
  var __duration = 8;
  
  $( document ).ready( onPageLoaded );
  
  $('#reset').click(function()
  {
    objectShape.graphics.clear();
    
    p0Marker.set_x(xAxis, axisLength, -5);
    p0Marker.set_y(yAxis, axisHeight, -3);
    
    p0x = -5;
    p0y = -3;
    
    p1Marker.set_x(xAxis, axisLength, -1);
    p1Marker.set_y(yAxis, axisHeight, 3);
    
    p1x = -1;
    p1y = 3;
    
    drawVector();
    
    stage.update();
  });
  
  $('#begin').click(function()
  {
    var speedInput = $('input[name="speed"]');
    var s          = speedInput.val();
    
    // you can set this on the controller as initial position or on the motion object
    __motion.set_position(-9,-2);
    
    // use 0.5 graph unit = 1 meter and the datum line (i.e. ground-level) y=-4 - experiment with different values of r in (0,1)
    __controller.set_motionParams( {x0:p0x, y0:p0y, x1:p1x, y1:p1y, v:s, f:0.5, r:0.8, c:-4} );
    
    // update the controller parameters and begin the simulation
    __start = Date.now();
    
    requestAnimationFrame(simulation);
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
    lineRenderShape      = new createjs.Shape();
    objectShape          = new createjs.Shape();
    
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
    stage.addChild(objectShape);
    
    drawAxes();
    
    var markerRef = new GraphMarkerModule();
    p0Marker      = new markerRef.GraphMarker();
    p0Marker.create(stage, onP0Moved, 6, xAxis, axisLength, yAxis, axisHeight);  
    p0Marker.set_x(xAxis, axisLength, -5);
    p0Marker.set_y(yAxis, axisHeight, -3);
    
    p0x = -5;
    p0y = -3;
    
    p1Marker = new markerRef.GraphMarker();
    p1Marker.create(stage, onP1Moved, 6, xAxis, axisLength, yAxis, axisHeight);  
    p1Marker.set_x(xAxis, axisLength, -1);
    p1Marker.set_y(yAxis, axisHeight, 3);
    
    p1x = -1;
    p1y = 3;
    
    drawVector();
    
    stage.update();
  };
  
  // P0 moved
  function onP0Moved(newX, newY)
  {
    p0x = newX;
    p0y = newY;
    
    drawVector();
  };
  
  // P1 moved
  function onP1Moved(newX, newY)
  {
    p1x = newX;
    p1y = newY;
    
    drawVector();
  };
  
  function drawVector()
  {
    var g = lineRenderShape.graphics;
    g.clear();
    
    // line segment 1 is (x0,y0) to (x1,y1) in Canvas coordinates
    var x0 = (p0x - defaultLeft)*pxPerUnitX;
    var y0 = (defaultTop - p0y)*pxPerUnitY;
    var x1 = (p1x - defaultLeft)*pxPerUnitX;
    var y1 = (defaultTop - p1y)*pxPerUnitY;
 
    g.setStrokeStyle(2);
    g.beginStroke( createjs.Graphics.getRGB(255,255,255) );
    g.moveTo(x0, y0);
    g.lineTo(x1, y1);
    
    g.endStroke();
    
    stage.update();
  };
  
  function simulation()
  {
    // number of seconds since beginning of simulation
    var time = 0.001*(Date.now() - __start);
    var a    = 1 - time/__duration;
    
    __motion.set_time(time);
    var newX = __motion.get_x();
    var newY = __motion.get_y();
    
    var x = (newX - defaultLeft)*pxPerUnitX;
    var y = (defaultTop - newY)*pxPerUnitY;
    
    var g =  objectShape.graphics;
    
    g.beginFill( createjs.Graphics.getRGB(0,255,0,a) );
    g.drawCircle(x,y,4);
    g.endFill();
    
    stage.update();
    
    if( time < __duration )
      requestAnimationFrame(simulation);
  }
  
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