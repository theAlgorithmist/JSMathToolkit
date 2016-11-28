/*
 * Supporting script for 2D bounce controller. Copyright (c) 2014, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */
require(['jquery', 
         'bootstrap', 
         'easeljs', 
         'bootstrapslider',
         '../../graphing/GraphAxis', 
         '../../statistics/Normal'
         ], 
         function($,                    // jQuery
                  bootstrapRef,         // Bootstrap
                  easelJS,              // EaselJS
                  bootstrapslider,      // bootstrap-slider
                  GraphAxisModule,      // GraphAxis
                  NormalModule          // Normal
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
  var normalRenderShape;
  var approxShape;
  var pxPerUnitX;
  var pxPerUnitY;
  
  var __a = -4;
  var __b = 4;
  
  var M = Math.sqrt(Math.PI + Math.PI);
  
  var normalRef = new NormalModule();
  var __normal  = new normalRef.Normal();
  
  $('#mean').change(drawCurve);
  $('#std').change(drawCurve);
  
  $('#reset').click(function()
  {
    normalRenderShape.graphics.clear();
    approxShape.graphics.clear();
    
    drawCurve();
    
    stage.update();
  });
  
  $('#normalRange').slider().on('slide', function(evt)
  {
    var v = evt.value;
    __a = v[0];
    __b = v[1];
    
    drawCurve();
  });
  
  $( document ).ready( onPageLoaded );
  
  function onPageLoaded()
  {
    
    // initial grid values
    defaultTop    = 3;
    defaultLeft   = -5;
    defaultRight  = 5;
    defaultBottom = -1;
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
    normalRenderShape    = new createjs.Shape();
    approxShape          = new createjs.Shape();
    
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
    stage.addChild(normalRenderShape);
    stage.addChild(approxShape);
    
    drawAxes();
    
    drawCurve();
    
    stage.update();
  };
  
  function drawCurve()
  {
    var meanInput = $('#mean');
    var u         = meanInput.val();
    
    var stdInput = $('#std');
    var s        = stdInput.val();
    
    __normal.set_mean(u);
    __normal.set_std(s);
    
    var g = normalRenderShape.graphics;
    g.clear();
    
    g.setStrokeStyle(2);
    g.beginStroke( createjs.Graphics.getRGB(255,0,0) );
    
    // kick it old-school (always draw normal curve from -4 to 4)
    var yVal = normalAt(-4, u, s);
    
    var x = (-4 - defaultLeft)*pxPerUnitX;
    var y = (defaultTop - yVal)*pxPerUnitY;
    g.moveTo(x,y);
    
    // 100 increments over the range - hardcoded for demo purposes
    var d = 8/100;
    var t;
    for( t=-4+d; t<4; t+=d )
    {
      yVal = normalAt(t, u, s);
      x    = (t - defaultLeft)*pxPerUnitX;
      y    = (defaultTop - yVal)*pxPerUnitY;
      
      g.lineTo(x,y);
    }
    
    yVal = normalAt(4, u, s);
    
    x = (4 - defaultLeft)*pxPerUnitX;
    y = (defaultTop - yVal)*pxPerUnitY;
    g.lineTo(x,y);
    
    g.endStroke();
    
    g = approxShape.graphics;
    g.clear();
    g.setStrokeStyle(2)
    g.beginStroke( createjs.Graphics.getRGB(255,255,255) );
    
    var stack = __normal.toBezier(__a, __b);

    var q = stack[0];
    
    x = (q.x0 - defaultLeft)*pxPerUnitX;
    y = (defaultTop - q.y0)*pxPerUnitY;
    
    var cx = (q.cx - defaultLeft)*pxPerUnitX;
    var cy = (defaultTop - q.cy)*pxPerUnitY;
    
    var x1 = (q.x1 - defaultLeft)*pxPerUnitX;
    var y1 = (defaultTop - q.y1)*pxPerUnitY;
    
    g.moveTo(x,y);
    g.curveTo(cx, cy, x1, y1);
    
    var len = stack.length;
    for( i=1; i<len; ++i )
    {
      q = stack[i];
     
      var cx = (q.cx - defaultLeft)*pxPerUnitX;
      var cy = (defaultTop - q.cy)*pxPerUnitY;
      
      var x1 = (q.x1 - defaultLeft)*pxPerUnitX;
      var y1 = (defaultTop - q.y1)*pxPerUnitY;
      
      g.curveTo(cx, cy, x1, y1);
    }
    
    g.endStroke();
    stage.update();
  };
  
  function normalAt(x, u, s)
  {
    var z = (x-u)/s;
    var d = -0.5*z*z;
    
    return (1/(s*M)) * Math.exp(d); 
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