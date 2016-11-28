/*
 * Supporting script for 2D interactive, natural cubic spline demo.  Copyright (c) 2014, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */
require(['jquery', 
         'bootstrap', 
         'easeljs', 
         'canvastooltip', 
         '../../core/GraphSlice', 
         '../../splines/SplineToBezier',
         '../../utils/BezierUtils',
         '../../utils/Gauss',
         '../../shapes/Polygon',
         '../../graphing/GraphAxis',
         '../../core/GraphDataMarker',
         '../../planarCurves/QuadBezier',
         '../../utils/QuadArea',
         '../../splines/NaturalCubicSpline'], 
         function($,                   // jQuery
                  bootstrapRef,        // Bootstrap
                  easelJS,             // EaselJS
                  CanvasTooltipModule, // CanvasTooltip
                  GraphSliceModule,    // GraphSlice Tool
                  ToBezierModule,      // Spline -> Beizer conversion
                  BezierUtilsModule,   // BezierUtils
                  GaussModule,         // Gauss-Legendre
                  PolygonModule,       // Polygon
                  GraphAxisModule,     // Graph Axis
                  MarkerModule,        // GraphDataMarker
                  BezierModule,        // QuadBezier
                  QuadAreaModule,      // QuadArea
                  SplineModule)        // Natural Cubic Spline
{
  var stage;
  var xAxis;
  var yAxis;
  var grid;
  var xAxisShape;
  var xAxisArrowsShape;
  var markerContainer;
  var quadShape;
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
  var fillShape;
  var sliceTool;
  var spline;   
  var pxPerUnitX;
  var pxPerUnitY; 
  var steps;
  var dataX;
  var dataY;
  var quads;
  var areaQuads;
  var toBezier;
  var displayMarkers;
  var markers;
  var markerTip;
  var areaTip;
  var tipContainer;
  var bezierUtils;
  var splineQuadData;
  var totalArea;
  var totalPositive;
  var totalNegative;
  
  // area computation and hit test
  var __bezier;
  var __integral;
  var __polygon;
  
  // timing
  var __duration;
  var __start;
  var __graphAnimation;
  var __parameterize;
  
  $( document ).ready( onPageLoaded );
  
  $('#showMarkers').click(function()
  {
    displayMarkers          = !displayMarkers;
    markerContainer.visible = displayMarkers; 
    
    stage.update();
  });
  
  function onPageLoaded()
  {
    // initial grid values
    defaultTop     = 2;
    defaultLeft    = -10;
    defaultRight   = 90;
    defaultBottom  = -2;
    decimals       = 1;
    majorXInc      = 10;
    minorXInc      = 5;
    majorYInc      = 1;
    minorYInc      = 0.5;
    steps          = 100;
    displayMarkers = false;
    markers        = [];
    areaQuads      = [];
    leftOver       = null;
    
    var bezierUtilsRef = new BezierUtilsModule();
    var gaussRef       = new GaussModule();
    var polygonRef     = new PolygonModule();
    
    bezierUtils    = new bezierUtilsRef.BezierUtils();
    __integral     = new gaussRef.Gauss();
    __polygon      = new polygonRef.Polygon();
    
    __duration     = 2000; // 2 seconds anim. duration
    __parameterize = [];
    
	  // EaselJS setup
    var canvas = document.getElementById("stageCanvas");
    stage      = new createjs.Stage(canvas);
    
    // CompGeoJS graph axes (length/height used to manage tic label display)
    var graphAxisRef = new GraphAxisModule();
    
    xAxis      = new graphAxisRef.GraphAxis();
    yAxis      = new graphAxisRef.GraphAxis();
    axisLength = canvas.width;
    axisHeight = canvas.height;
    pxPerUnitX = axisLength/(defaultRight - defaultLeft);
    pxPerUnitY = axisHeight/(defaultTop - defaultBottom);
    
    // initialize the axes - default is to display both arrows
    xAxis.setOrientation( xAxis.HORIZONTAL );
    yAxis.setOrientation( yAxis.VERTICAL );
    
    xAxis.setBounds(defaultLeft, defaultTop, defaultRight, defaultBottom, canvas.width, canvas.height);
    yAxis.setBounds(defaultLeft, defaultTop, defaultRight, defaultBottom, canvas.width, canvas.height);
    
    xAxis.set_majorInc(majorXInc);
    yAxis.set_majorInc(majorYInc);
    xAxis.set_minorInc(minorXInc);
    yAxis.set_minorInc(minorYInc);
    
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
    fillShape        = new createjs.Shape();
    quadShape        = new createjs.Shape();
    markerContainer  = new createjs.Container();
    tipContainer     = new createjs.Container();
    
    markerContainer.visible = displayMarkers;
    
    markerTip = new CanvasTooltip();
    markerTip.init( stage, tipContainer, 1, 'Bold 15px Arial' );
    
    areaTip = new CanvasTooltip();
    areaTip.init( stage, tipContainer, 1, 'Bold 15px Arial', {width:180} );
    
    // natural cubic spline
    splineRef = new SplineModule();
    toBezier  = new ToBezierModule();
    spline    = new splineRef.NaturalCubicSpline();
    toBezier  = new toBezier.SplineToBezier();
    
    var sliceContainer = new createjs.Container();
    
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
    stage.addChild(fillShape);
    stage.addChild(quadShape);
    stage.addChild(markerContainer);
    stage.addChild(sliceContainer);
    
    stage.enableMouseOver(10);
    
    drawAxes();
    
    // create and display a vertical graph slice tool
    var sliceToolRef = new GraphSliceModule();
    sliceTool = new sliceToolRef.GraphSlice();
    
    sliceTool.create(stage, sliceContainer, onToolMoved, "vertical", 26, 15, xAxis, axisLength, yAxis, axisHeight);  // default triangle-marker and line colors
    
    sliceTool.set_value(40);
    
    // spline data
    dataX = [];
    dataY = [];
    
    dataX.push(0.0);
    dataY.push(0.8);
    
    dataX.push(6);
    dataY.push(-0.34);
    
    dataX.push(15);
    dataY.push(0.59);
    
    dataX.push(17);
    dataY.push(0.59);
    
    dataX.push(19); 
    dataY.push(0.23);
    
    dataX.push(21); 
    dataY.push(0.1);
    
    dataX.push(23);
    dataY.push(0.28);
    
    dataX.push(26); 
    dataY.push(1.03);
    
    dataX.push(28);
    dataY.push(1.5);
    
    dataX.push(30); 
    dataY.push(1.44);
    
    dataX.push(36);
    dataY.push(0.74);
    
    dataX.push(47); 
    dataY.push(-0.82);
    
    dataX.push(52);
    dataY.push(-1.27);
    
    dataX.push(57);
    dataY.push(-0.92);
    
    dataX.push(58); 
    dataY.push(-0.92);
    
    dataX.push(60); 
    dataY.push(-1.04);
    
    dataX.push(64);
    dataY.push(-0.79);
    
    dataX.push(69);
    dataY.push(-0.16);
    
    dataX.push(76);
    dataY.push(1.0);
    
    dataX.push(80); 
    dataY.push(0.0);
    
    addData(dataX, dataY);
    
    if( markers.length == 0 )
      createMarkers();
    
    segmentGraph();
    
    stage.addChild(tipContainer);
    
    __start = Date.now();

    requestAnimationFrame(__graphAnimation);
  };
  
  function addData(_x, _y)
  {
    var i;
    var len = _x.length;
    for( i=0; i<len; ++i )
      spline.addControlPoint( _x[i], _y[i] );
  }
  
  function onToolMoved(value)
  {
    // we know in advance that this is a vertical slice tool that queries x-coordinates.
    if( value >= dataX[0] && value <= dataX[dataX.length-1] )
      $('#instruct').text( "T: " + value.toFixed(2) + "  EF: " + spline.getY(value).toFixed(2) );
  };
  
  function createMarkers()
  {
    var len = dataX.length;
    var i;
    var marker;
    
    var markerRef = new MarkerModule();
    for( i=0; i<len; ++i )
    {
      marker = new markerRef.GraphDataMarker();
      marker.create(stage, markerContainer, onMarkerRollOver, onMarkerRollOut, null, 6, xAxis, axisLength, yAxis, axisHeight, "#1111ff" );  
      marker.set_x( dataX[i] );
      marker.set_y( dataY[i] );
      
      marker.setData("index", i);
      marker.setData("time", dataX[i]);
      marker.setData('eff', dataY[i]);
      
      markers[i] = marker;
    }  
  };
  
  function onMarkerRollOver(marker)
  {
    var index   = marker.getData("index");
    var markerX = (dataX[index] - defaultLeft)*pxPerUnitX;
    var markerY = (defaultTop  - dataY[index])*pxPerUnitY;
    
    var tipText = "T: " + dataX[index] + "  EF: " + dataY[index].toFixed(2);
    markerTip.render( "roundRect", tipText, markerX, markerY, {offsetX:10, offsetY:-15} );
    markerTip.show();
    
    stage.update();
  };
  
  function onMarkerRollOut(marker)
  {
    markerTip.hide();
    stage.update();
  };
  
  function segmentGraph()
  {
    // convert cubic spline to quad. bezier sequence and then compute all properties of each area above/below x-axis.
    splineQuadData = toBezier.convert(spline, 0.01);
    
    var q;
    var newSign;
    var split;
    var quads      = splineQuadData.quads;
    var i          = 0;
    var t          = -1;
    var len        = quads.length;
    var compensate = false;
    var leftover   = null;
    var sign       = dataY[i] >= 0 ? 1 : -1;
    
    // store computed information about sequences of quads above or below x-axis
    var quadAreaRef = new QuadAreaModule();
    var quadArea    = new quadAreaRef.QuadArea();
    
    var bezierRef = new BezierModule();
    __bezier      = new bezierRef.QuadBezier();
    
    areaQuads.push(quadArea);
    
    for( i=0; i<len; ++i)
    {
      q       = quads[i];
      newSign = q.y1 >= 0 ? 1 : -1;
      
      if( sign + newSign == 0 )
      {
        __bezier.set_x0(q.x0);
        __bezier.set_y0(q.y0);
        __bezier.set_cx(q.cx);
        __bezier.set_cy(q.cy);
        __bezier.set_x1(q.x1);
        __bezier.set_y1(q.y1);
        
        // numerical consideration
        if( Math.abs(q.y1) > 0.05 )
        {
          if( compensate )
          {
            var qAC = new quadAreaRef.QuadArea();
            
            qAC.addQuad(q);
            
            sign       = newSign;
            compensate = false;
            
            areaQuads.push(qAC);
          }
          else
          { 
            t     = bezierUtils.getTAtY(__bezier, 0.0);
            split = bezierUtils.subdivideQuadBezier(t, __bezier, true);
            
            areaQuads[areaQuads.length-1].addQuad(split[0]);

            var qA = new quadAreaRef.QuadArea();
            sign   = newSign;
          
            areaQuads.push(qA);
            qA.addQuad(split[1]);
          }
        }
        else
        {
          areaQuads[areaQuads.length-1].addQuad(q);
          
          compensate = true;
        }
      }
      else
        areaQuads[areaQuads.length-1].addQuad(q);
    }
      
    len = areaQuads.length;
    
    var x;
    var y;
    var t;
    var j;
    var len2;
    var qArr;
    var area;
    
    var minX = 0;
    var maxX = 0;
    var minY = 0;
    var maxY = 0;
    
    var xAtY = 0;
    
    totalPositive = 0;
    totalNegative = 0;
    totalArea     = 0;
    
    for( i=0; i<len; ++i )
    {
      qArr = areaQuads[i].getQuads();
      len2 = qArr.length;
      area = 0;
      
      minX = 0;
      maxX = 0;
      minY = 0;
      maxY = 0;
      
      for( j=0; j<len2; ++j )
      {
        q = qArr[j];
 
        if( j == 0 )
          minX = q.x0;
        
        if( j == len2-1 )
          maxX = q.x1;
        
        __bezier.set_x0(q.x0);
        __bezier.set_y0(q.y0);
        __bezier.set_cx(q.cx);
        __bezier.set_cy(q.cy);
        __bezier.set_x1(q.x1);
        __bezier.set_y1(q.y1);
        
        t = bezierUtils.tAtMinY(__bezier);
        y = __bezier.getY(t);
        
        if( y < minY )
        {
          minY = y;
          xAtY = __bezier.getX(t);
        }
       
        t = bezierUtils.tAtMaxY(__bezier);
        y = __bezier.getY(t);
        if( y > maxY )
        {
          maxY = y;
          xAtY = __bezier.getX(t);
        }
        
        area += __integral.eval( __integrand, 0, 1, 8 );
      }
    
      if( area >= 0 )
        totalPositive += area;
      else
        totalNegative += area;
      
      totalArea += Math.abs(area);
        
      areaQuads[i].setArea( Math.abs(area) );
      areaQuads[i].setBounds(minX, maxX, minY, maxY);
      areaQuads[i].setXatY(xAtY);
    }
    
    totalNegative = Math.abs(totalNegative);
    
    len = areaQuads.length;
    __parameterize.push(0);
    var base = 0;
    
    for( i=0; i<len; ++i )
    {
      q     = areaQuads[i];
      base += (q.getArea()/totalArea);
      
      __parameterize.push(base);
    }
    
    __parameterize[__parameterize.length-1] = 1.0;
  }
  
  function __integrand(_t)
  {
    return __bezier.getY(_t);
  }
  
  function __graphAnimation()
  {
    var len = areaQuads.length;
    var fillColor;
    var q;
    var i;
    var len = __parameterize.length;
    
    var tStar = (Date.now() - __start)/__duration;
    tStar     = tStar > 1 ? 1 : tStar;
    
    var segment;
    
    for( i=1; i<len; ++i)
    {
      if( __parameterize[i] >= tStar )
      {
        segment = i-1;
        t       = (tStar - __parameterize[i-1])  / (__parameterize[i] - __parameterize[i-1]);
        break;
      }
    }
    
    for( i=0; i<=segment; ++i )
    {
      q = areaQuads[i];
      fillColor = ( Math.abs(q.getMinY()) < 0.05 && q.getMaxY() > 0 ) ? "#00ff00" : "#ff0000"

      if( i < segment )
        __drawQuadArea( q, "#ffff00", fillColor, 1.0 );
      else
        __drawQuadArea( q, "#ffff00", fillColor, t );
    }
    
    if( tStar < 1 )
      requestAnimationFrame(__graphAnimation);
    
    areaInteractivity(true);
  }
  
  function __drawQuadArea(quadArea, strokeColor, fillColor, tEnd)
  {
    var gSpline = quadShape.graphics;
    gSpline.setStrokeStyle(2);
    gSpline.beginStroke(strokeColor);
    
    var gArea = fillShape.graphics;
    gArea.beginFill(fillColor);
    
    var x0;
    var y0;
    var cx;
    var cy;
    var x1;
    var y1;
    var t;
    var j;
    var split;
    var segment = -1;
    
    var qArr = quadArea.getQuads();
    var len  = qArr.length;
    var end  = len;
    
    // which segment is split?
    if( tEnd != 1 )
    {
      segment = Math.floor(tEnd*len);
      t       = tEnd - segment/len; 
      end     = segment+1;
    } 

    for( j=0; j<end; ++j )
    {
      q = qArr[j];
      
      x0 = (q.x0 - defaultLeft)*pxPerUnitX;
      y0 = (defaultTop  - q.y0)*pxPerUnitY;
      cx = (q.cx - defaultLeft)*pxPerUnitX;
      cy = (defaultTop  - q.cy)*pxPerUnitY;
      x1 = (q.x1 - defaultLeft)*pxPerUnitX;
      y1 = (defaultTop  - q.y1)*pxPerUnitY;
        
      if( j == 0 )
      {
        gSpline.moveTo(x0, y0);
        gArea.moveTo(x0,y0);
      }
      
      if( j == segment )
      {
        // split curve at t
        __bezier.set_x0(q.x0);
        __bezier.set_y0(q.y0);
        __bezier.set_cx(q.cx);
        __bezier.set_cy(q.cy);
        __bezier.set_x1(q.x1);
        __bezier.set_y1(q.y1);
        
        split = bezierUtils.subdivideQuadBezier(t, __bezier);
        
        q  = split[0];
        x0 = (q.x0 - defaultLeft)*pxPerUnitX;
        y0 = (defaultTop  - q.y0)*pxPerUnitY;
        cx = (q.cx - defaultLeft)*pxPerUnitX;
        cy = (defaultTop  - q.cy)*pxPerUnitY;
        x1 = (q.x1 - defaultLeft)*pxPerUnitX;
        y1 = (defaultTop  - q.y1)*pxPerUnitY;
      }
      
      gSpline.curveTo(cx, cy, x1, y1);
      gArea.curveTo(cx, cy, x1, y1);
    }
    
    q  = qArr[0];
    y0 = (defaultTop - 0)*pxPerUnitY;
    if( segment != -1 )
    {
      gArea.lineTo(x1,y0);
    }
    else
    {
      x0 = (q.x0 - defaultLeft)*pxPerUnitX;
    
      gArea.lineTo(x0, y0);
    }
  
    x0 = (q.x0 - defaultLeft)*pxPerUnitX;
    y0 = (defaultTop  - q.y0)*pxPerUnitY;
    
    gArea.lineTo(x0, y0);
    
    gSpline.endStroke();
    gArea.endFill();
    
    stage.update();
  }
  
  function areaInteractivity(show)
  {
    if( show )
    {
      stage.addEventListener( "stagemousedown", onStageMouseDown );
      stage.addEventListener( "stagemouseup"  , onStageMouseUp   );
    }
  }
  
  function onStageMouseDown(evt)
  {
    
  }
  
  function onStageMouseUp(evt)
  {
    var mx       = stage.mouseX;
    var my       = stage.mouseY;
    var numAreas = areaQuads.length;
    var i;
    var j;
    var len;
    var quads;
    var area;
    var x0;
    var y0;
    var cx;
    var cy;
    var x1; 
    var y1;
    var q;
    var hit;
    var zeroY = ( defaultTop - 0 )*pxPerUnitY;
    var inisde;
    
    var totalArea = 0.0;
    var a;
    
    for( i=0; i<numAreas; ++i )
      totalArea += areaQuads[i].getArea();
    
    for( i=0; i<numAreas; ++i )
    { 
      area = areaQuads[i];
      
      // bopunding box text
      x0 = ( area.getMinX() - defaultLeft )*pxPerUnitX;
      y0 = ( defaultTop  - area.getMinY() )*pxPerUnitY;
      x1 = ( area.getMaxX() - defaultLeft )*pxPerUnitX;
      y1 = ( defaultTop  - area.getMaxY() )*pxPerUnitY;
      
      // bounding box
      if( mx >= x0 && mx <= x1 )
      {
        if( my >= y1 && my <= y0 )
        {
          // check quads
          quads = areaQuads[i].getQuads();
          len   = quads.length;
          for( j=0; j<len; ++j )
          {
            q = quads[j];
            
            // bounding box
            x0 = ( q.x0 - defaultLeft )*pxPerUnitX;
            y0 = ( defaultTop  - q.y0 )*pxPerUnitY;
            cx = ( q.cx - defaultLeft )*pxPerUnitX;
            cy = ( defaultTop  - q.cy )*pxPerUnitY;
            x1 = ( q.x1 - defaultLeft )*pxPerUnitX;
            y1 = ( defaultTop  - q.y1 )*pxPerUnitY;
            
            __polygon.clear();
            __polygon.addPoint(x0,zeroY);
            __polygon.addPoint(x0,y0);
            __polygon.addPoint(cx,cy);
            __polygon.addPoint(x1,y1);
            __polygon.addPoint(x1,zeroY);
            
            inside = __polygon.isInside(mx,my);
            if( inside )
            {
              hit = area;
              break;
            }
          }
        }
      }
    }
    
    var percent;
    
    if( hit != undefined )
    {
      var tipText = "Range: T = " + Math.round(hit.getMinX()) + " to " + Math.round(hit.getMaxX()) + " Min EF: " + hit.getMinY().toFixed(1) + " Max EF: " + hit.getMaxY().toFixed(1);
      areaTip.render( "roundRect", tipText, stage.mouseX, stage.mouseY, {offsetX:10, offsetY:-15} );
      areaTip.show();
      
      a       = hit.getArea();
      percent = (a/totalArea)*100;
      
      $('#instruct').text( "Area under curve: " + hit.getArea().toFixed(2)  + " P: " + percent.toFixed(0) );
      
      stage.update();
    }
    else
      areaTip.hide();
  }
  
  function drawAxes()
  {
    // the graphic context is passed into CompGeoJS - only clearing, line properties, and fills are directly managed
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
    
    // tic labels require managing a display list, so these are rendered external to CompGeoJS, similar to the Numberline example
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
  
  // A series of QuadData instances that represent a closed space bounded above or below by zero.  
  var QuadArea = function()
  {
    this._quads = new Array();
    this._minX  = 0;
    this._maxX  = 0;
    this._minY  = 0;
    this._maxY  = 0;
    this._XAtY  = 0;
    this._area  = 0;
  };

  QuadArea.__name__ = true;
  QuadArea.prototype = 
  {
    addQuad: function(_q)
    {
      this._quads.push(_q);
    }

    ,getQuads: function()
    {
      return this._quads.slice();
    }
   
    ,getMinX: function()
    {
      return this._minX;
    }
   
    ,getMaxX: function()
    {
      return this._maxX;
    }
   
    ,getMinY: function()
    {
      return this._minY;
    }
   
    ,getMaxY: function()
    {
      return this._maxY;
    }
   
    ,getArea: function()
    {
      return this._area;
    }
   
    ,setArea: function(a)
    {
      this._area = a;
    }
   
    ,setBounds: function(minX, maxX, minY, maxY)
    {
      if( minX <= maxX )
      {
        this._minX = minX;
        this._maxX = maxX;
      }
     
      if( minY <= maxY )
      {
        this._minY = minY;
        this._maxY = maxY;
      }
    }
   
    ,getXAtY: function()
    {
      return this._xAtY; 
    }
   
    ,setXatY: function(_x)
    {
      this._xAtY = _x;
    }
   
    ,clear: function()
    {
      this._quads.length = 0;
     
      this._minX = 0;
      this._maxX = 0;
      this._minY = 0;
      this._maxY = 0;
     this._tAtY = 0;
    }
  };
});