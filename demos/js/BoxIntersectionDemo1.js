/*
 * Supporting script for bounding-box intersection test with y-up coordinate system. Copyright (c) 2014, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */
require(['jquery', 
         'bootstrap', 
         'easeljs', 
         '../../graphing/GraphAxis', 
         '../../core/RectangleSelector',
         '../../utils/GeomUtils'], 
         function($,                       // jQuery
                  bootstrapRef,            // Bootstrap
                  easelJS,                 // EaselJS
                  GraphAxisModule,         // GraphAxis
                  RectangleSelectorModule, // RectangleSelector
                  GeomUtilsModule          // GeomUtils
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
  var rectangleShape;
  var pxPerUnitX;
  var pxPerUnitY;
  var box1Left;
  var box1Top;
  var box1Right;
  var box1Bottom;
  var box2Left;
  var box2Top;
  var box2Right;
  var box2Bottom;
 
  var box1 = false;
  var box2 = false;
  
  var rectangleSelector = new RectangleSelectorModule();
  var geomUtilsRef      = new GeomUtilsModule();
  var geomUtils         = new geomUtilsRef.GeomUtils();

  $( document ).ready( onPageLoaded );
  
  $('#reset').click(function()
  {
    var g = rectangleShape.graphics;
    g.clear();
    
    box1 = false;
    box2 = false;
    
    stage.update();
    
    // the rectangle selector is a single-use entity
    rectangleSelector.addRectangleSelector(stage, onSelection);
    
    $('#instruct').text("Click and drag twice to create two test bounding boxes.");
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
    grid             = new createjs.Shape();
    xAxisShape       = new createjs.Shape();
    xAxisArrowsShape = new createjs.Shape();
    xAxisTicMarks    = new createjs.Shape();
    xAxisTicLabels   = new createjs.Shape();
    yAxisShape       = new createjs.Shape();
    yAxisArrowsShape = new createjs.Shape();
    yAxisTicMarks    = new createjs.Shape();
    yAxisTicLabels   = new createjs.Shape();
    rectangleShape   = new createjs.Shape();
    
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
    stage.addChild(rectangleShape);
    
    drawAxes();
    
    // the rectangle selector is a single-use entity
    rectangleSelector.addRectangleSelector(stage, onSelection);
    
    stage.update();
  };
  
  function onSelection(__left, __top, __right, __bottom)
  {
    if( !box1 || !box2 )
    {
      if( box1 )
      {
        box2 = true;
        
        var g = rectangleShape.graphics;
        g.setStrokeStyle(2);
        g.beginStroke( createjs.Graphics.getRGB(255,255,255,2) );
        g.moveTo(__left, __top);
        g.lineTo(__right, __top);
        g.lineTo(__right, __bottom);
        g.lineTo(__left, __bottom);
        g.lineTo(__left, __top);
        g.endStroke();
        
        // convert from Canvas to x-y coordinates
        box2Left   = xAxis.get_min() + __left/pxPerUnitX; 
        box2Top    = yAxis.get_max() - __top/pxPerUnitY;
        box2Right  = xAxis.get_min() + __right/pxPerUnitX;  
        box2Bottom = yAxis.get_max() - __bottom/pxPerUnitY;
        
        var bound1 = {left:box1Left, top:box1Top, right:box1Right, bottom:box1Bottom};
        var bound2 = {left:box2Left, top:box2Top, right:box2Right, bottom:box2Bottom};
        
        var intersects = geomUtils.boxesIntersect(bound1, bound2);
        $('#instruct').text("Bounding-box intersections: " + intersects);
      }
      else
      {
        box1 = true;
        
        // convert from Canvas to x-y coordinates
        box1Left   = xAxis.get_min() + __left/pxPerUnitX; 
        box1Top    = yAxis.get_max() - __top/pxPerUnitY;
        box1Right  = xAxis.get_min() + __right/pxPerUnitX;  
        box1Bottom = yAxis.get_max() - __bottom/pxPerUnitY;
        
        var g = rectangleShape.graphics;
        g.clear();
        g.setStrokeStyle(2);
        g.beginStroke( createjs.Graphics.getRGB(255,255,255,2) );
        g.moveTo(__left, __top);
        g.lineTo(__right, __top);
        g.lineTo(__right, __bottom);
        g.lineTo(__left, __bottom);
        g.lineTo(__left, __top);
        g.endStroke();
        
        // the rectangle selector is a single-use entity
        rectangleSelector.addRectangleSelector(stage, onSelection);
      }
      
      stage.update();
    }
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