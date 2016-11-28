/*
 * Supporting script for point-cloud reflection. Copyright (c) 2014, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */
require(['jquery', 
         'bootstrap', 
         'easeljs', 
         '../../core/GraphMarker', 
         '../../graphing/GraphAxis', 
         '../../utils/GeomUtils',
         ], 
         function($,                    // jQuery
                  bootstrapRef,         // Bootstrap
                  easelJS,              // EaselJS
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
  var pxPerUnitX;
  var pxPerUnitY;
  var p0Marker;
  var p1Marker;
  var p0x, p0y;
  var p1x, p1y;
  
  var geomUtilsRef = new GeomUtilsModule();
  var geomUtils    = new geomUtilsRef.GeomUtils();
  
  // some points to reflect
  var __points = [ {x:-7, y:-3} ];
  __points.push( {x:-5, y:-2} );
  __points.push( {x:-4, y:1} );
  __points.push( {x:0, y:3} );
  __points.push( {x:3, y:3} );
  __points.push( {x:2, y:-2} );
  
  $( document ).ready( onPageLoaded );
  
  $('#reset').click(function()
  {
    p0Marker.set_x(xAxis, axisLength, -5);
    p0Marker.set_y(yAxis, axisHeight, -3);
    
    p0x = -5;
    p0y = -3;
    
    p1Marker.set_x(xAxis, axisLength, -1);
    p1Marker.set_y(yAxis, axisHeight, 4);
    
    p1x = -1;
    p1y = 4;
    
    drawLines();
    
    stage.update();
    
    $('#instruct').text("Drag the circular markers to adjust line segment endpoints.");
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
    lineRenderShape     = new createjs.Shape();
    
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
    p1Marker.set_y(yAxis, axisHeight, 4);
    
    p1x = -1;
    p1y = 4;
   
    drawLines();
    
    stage.update();
  };
  
  // P0 moved
  function onP0Moved(newX, newY)
  {
    p0x = newX;
    p0y = newY;
    
    drawLines();
  };
  
  // P1 moved
  function onP1Moved(newX, newY)
  {
    p1x = newX;
    p1y = newY;
    
    drawLines();
  };
  
  
  function drawLines()
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
    
    // render the base points in red
    var i, p, x, y;
    var len = __points.length;
    
    for( i=0; i<len; ++i )
    {
      p = __points[i];
      x = (p.x - defaultLeft)*pxPerUnitX;
      y = (defaultTop - p.y)*pxPerUnitY;
      
      g.beginFill( createjs.Graphics.getRGB( 0, 255, 0) );
      g.drawCircle(x, y, 4);
      g.endFill();
    }
    
    var reflect = geomUtils.reflect(__points, p0x, p0y, p1x, p1y);
    len = reflect.length;
    
    for( i=0; i<len; ++i )
    {
      p = reflect[i];
      x = (p.x - defaultLeft)*pxPerUnitX;
      y = (defaultTop - p.y)*pxPerUnitY;
      
      g.beginFill( createjs.Graphics.getRGB( 0, 0, 255) );
      g.drawCircle(x, y, 4);
      g.endFill();
    }
    
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