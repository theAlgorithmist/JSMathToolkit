/*
 * 2D Polynomial Least Squares Demo.  Copyright (c) 2014, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */
require(['jquery', 
         'bootstrap', 
         'easeljs', 
         '../../core/Point',
         '../../graphing/GraphAxis', 
         '../../statistics/dataanalysis/pllsq',
         ], 
         function($,                    // jQuery
                  bootstrapRef,         // Bootstrap
                  easelJS,              // EaselJS
                  PointModule,          // Point
                  GraphAxisModule,      // GraphAxis
                  PLLSQModule           // PLLSQ
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
  
  var pllsqRef = new PLLSQModule();
  var pllsq    = new pllsqRef.PLLSQ();
  
  // sample data to fit
  var _x = [-9.5, -8.7, -8.0, -7.1, -6.0, -5.0, -4.5, -4.0, -3.5, -3.1, -2.0, -1.5, -1.0, -0.6, 0.0, 0.5, 1.2, 1.5, 2.6,  3.0,  3.2,  4.0,  4.5,  4.9, 5.5,  6.0, 6.1, 6.5, 6.8, 7.0, 7.1, 7.6, 8.0, 8.5, 9.0, 9.2, 9.5];
  var _y = [-6.1, -7.2, -1.4, -6.2, -2.4, 0.2 , -1.1, 1.2 ,  0.2,  2.4,  4.2,  6.7,  2.1,  0.0, 1.4, 1.8, 3.7, 4.6, 0.5, -1.7, -4.2, -1.2, -1.0, -0.5, 1.0, -0.6, 2.9, 7.3, 9.1, 5.0, 9.9, 2.6, 3.7, 2.0, 1.3, 0.0, 1.2];
  
//  var sums = [];
//  var n = _x.length;
//  var m = 3;
//  var len = 2*m;
//  var i, j;
//
//  var s;
//  s = 0.0;
//  for( j=0; j<n; ++j )
//    s += _x[j];
//  
//  sums[0] = s;
//  
//  for( i=1; i<len; ++i )
//  {
//    s = 0.0;
//    for( j=0; j<n; ++j )
//      s += Math.pow(_x[j], i+1);
//    
//    sums[i] = s;
//  }  
//  
//  console.log( "sums: ", sums );
  
  $( document ).ready( onPageLoaded );
  
  function onPageLoaded()
  {
    // initial grid values
    defaultTop    = 11;
    defaultLeft   = -10;
    defaultRight  = 10;
    defaultBottom = -11;
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
    
    plot();
  };
  
  function plot()
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
    
    // least squares fit, order 2-4
    var j;
    for( j=2; j<5; ++j )
    {
      var fit = pllsq.fit(_x, _y, j );
    
      drawFit(j);
    
      console.log( "" );
      switch( j )
      {
        case 2:
          console.log( "Quadratic fit" );
        break;
      
        case 3:
          console.log( "Cubic fit" );
        break;
      
        case 4:
          console.log( "Quartic fit" );
        break;
      }
    
      console.log( "   R-squared: ", fit.r, "RMS Error: ", fit.rms );
    }
    
    stage.update();
  };
  
  function drawFit(order)
  {
    g = llsqRenderShape.graphics;
    
    g.setStrokeStyle(2);
    switch( order )
    {
      case 2:
        g.beginStroke( createjs.Graphics.getRGB(255,255,255,1) );
      break;
      
      case 3:
        g.beginStroke( createjs.Graphics.getRGB(0,0,255,1) );
      break;
      
      case 4:
        g.beginStroke( createjs.Graphics.getRGB(255,255,0,1) );
      break;
    }
    
    // evaluate two regression curve point-to-point
    var y  = pllsq.eval(-10);
    var x0 = (-10 - defaultLeft)*pxPerUnitX;
    var y0 = (defaultTop - y)*pxPerUnitY;
    var delta = 0.05;
    
    g.moveTo(x0, y0);
   
    var x, x1, y1;
    for( x=-10+delta; x <= 10.0; x+=delta )
    {
      y  = pllsq.eval(x);
      x1 = (x - defaultLeft)*pxPerUnitX;
      y1 = (defaultTop - y)*pxPerUnitY;
      
      g.lineTo(x1, y1);
    }
    
    y  = pllsq.eval(10);
    x1 = (10 - defaultLeft)*pxPerUnitX;
    y1 = (defaultTop - y)*pxPerUnitY;
    
    g.lineTo(x1, y1);
    
    g.endStroke();
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