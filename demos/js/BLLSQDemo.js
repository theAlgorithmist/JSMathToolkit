/*
 * 2D Linear Least Squares with Bagging Demo.  Copyright (c) 2014, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */
require(['jquery', 
         'bootstrap', 
         'easeljs', 
         '../../core/Point',
         '../../graphing/GraphAxis', 
         '../../statistics/dataanalysis/llsq',
         '../../statistics/dataanalysis/bllsq'
         ], 
         function($,                    // jQuery
                  bootstrapRef,         // Bootstrap
                  easelJS,              // EaselJS
                  PointModule,          // Point
                  GraphAxisModule,      // GraphAxis
                  LLSQModule,           // LLSQ
                  BLLSQModule           // Bagged LLSQ
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
  var pointRenderShape;
  var llsqRenderShape;
  var sliceTool;
  var curve;
  var pxPerUnitX;
  var pxPerUnitY;
  
  var llsqRef = new LLSQModule();
  var llsq    = new llsqRef.LLSQ();
  
  var bllsqRef = new BLLSQModule();
  var bllsq    = new bllsqRef.BLLSQ();
  
  // sample set with some possible outlier points/clusters
  var _x = [ -6.5 , -6.1, -5.5, -5.0, -4.5, -4.1, -3.0, -2.4, -1.1, -0.5,  0.0, 1.2, 2.1, 2.3, 3.0, 3.8, 4.7, 5.9, 6.1, 6.4, 7.0, 7.5, 8.0, 8.2, 8.5, 9.7 ];
  var _y = [ -0.25, -3.3, -5.7,  0.1, -1.0, -2.7,  0.1,  0.5, -2.7,  1.0, -0.5, 1.1, 1.8, 2.1, 3.1, 4.0, 4.9, 5.7, 8.5, 5.9, 8.1, 8.9, 7.5, 7.7, 5.1, 4.25];
  
  $( document ).ready( onPageLoaded );
  
  function onPageLoaded()
  {
    // initial grid values
    defaultTop    = 10;
    defaultLeft   = -10;
    defaultRight  = 10;
    defaultBottom = -10;
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
    pointRenderShape = new createjs.Shape();
    llsqRenderShape  = new createjs.Shape();
    
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
    stage.addChild(pointRenderShape);
    stage.addChild(llsqRenderShape);
    
    drawAxes();
    
    drawHull();
  };
  
  function drawHull()
  {
    // original points
    var i;
    var len = _x.length;
    var g = pointRenderShape.graphics;
    g.clear();
    
    var xp, yp;
    for( i=0; i<len; ++i )
    {
      g.beginFill( createjs.Graphics.getRGB(0, 255, 0,1) );
      
      xp = (_x[i] - defaultLeft)*pxPerUnitX;
      yp = (defaultTop - _y[i])*pxPerUnitY;
      
      g.drawCircle(xp,yp,4);
      g.endFill();
    }
    
    // least squares fit (we know nothing about the variances in the y-samples)
    var fit = llsq.fit(_x, _y);
    
    g = llsqRenderShape.graphics;
    g.clear();
    
    g.setStrokeStyle(3);
    g.beginStroke( createjs.Graphics.getRGB(0, 0, 255, 1) );
    
    // evaluate two points on the regression line at x = +/-8
    var y  = -8*fit.m + fit.b;
    var x0 = (-8 - defaultLeft)*pxPerUnitX;
    var y0 = (defaultTop - y)*pxPerUnitY;

    g.moveTo(x0, y0);
   
    y = 8*fit.m + fit.b;
    var x1 = (8 - defaultLeft)*pxPerUnitX;
    var y1 = (defaultTop - y)*pxPerUnitY;
      
    g.lineTo(x1, y1);
    
    g.endStroke();
    
    var m = fit.m.toFixed(4);
    var b = fit.b.toFixed(4);
    var r = fit.r.toFixed(3);
    
    console.log( "Baseline linear model, m: " + m + ", b: " + b + ", r: " + r );
    
    // graph the bagged fits
    g.setStrokeStyle(2);
    g.beginStroke( createjs.Graphics.getRGB(255,255,0,0.65) );
    
    var baggedFit = bllsq.bagFit(_x, _y, 8);
    var aArr      = baggedFit.aArray;
    var bArr      = baggedFit.bArray;
    
    for( i=0; i<8; ++i )
    {
      m = aArr[i];
      b = bArr[i];
      
      y  = -8*m + b;
      x0 = (-8 - defaultLeft)*pxPerUnitX;
      y0 = (defaultTop - y)*pxPerUnitY;

      g.moveTo(x0, y0);
     
      y = 8*m + b;
      x1 = (8 - defaultLeft)*pxPerUnitX;
      y1 = (defaultTop - y)*pxPerUnitY;
        
      g.lineTo(x1, y1);
    }
    
    // aggregated fit parameters
    g.beginStroke( createjs.Graphics.getRGB(255,0,0,1) );
    
    m  = baggedFit.a;
    b  = baggedFit.b;
    y  = -8*m + b;
    x0 = (-8 - defaultLeft)*pxPerUnitX;
    y0 = (defaultTop - y)*pxPerUnitY;

    g.moveTo(x0, y0);
   
    y = 8*m + b;
    x1 = (8 - defaultLeft)*pxPerUnitX;
    y1 = (defaultTop - y)*pxPerUnitY;
      
    g.lineTo(x1, y1);
    
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