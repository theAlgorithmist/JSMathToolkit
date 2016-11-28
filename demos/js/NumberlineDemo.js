/*
 * Supporting script for Number Line demo.  Copyright (c) 2013, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */
require(['jquery', 'bootstrap', 'easeljs', '../../graphing/Axis', '../../utils/NumberFormatter'], function($, bootstrapRef, easelJS, AxisModule, FormatterModule)
{
  var stage;
  var axis;
  var nlShape;
  var defaultMin;
  var defaultMax;
  var min;
  var max;
  var useScientific;
  var decimals;
  var boundDecimals;
  var majorInc;
  var minorInc;
  var axisLength;
  var canvasHeight;
  var halfHeight;
  var curZoom;
  var zoomDirection;
  var zoomFactor;
  var ticLabels;
  var ticDisplayObjects;
  var xOrig;
  var delta;
  var minMaxTxt;
  var numberFormatter;
  
  $( document ).ready( onPageLoaded );
  
  // various button handlers, toggling, blah, blah ...
  $('#zoomBtnGroup button').click(function() 
  {
    $('#zoomBtnGroup button').addClass('active').not(this).removeClass('active');

    var curLevel = curZoom;
    var level    = $(this).attr('id');
    
    useScientific = false;  // have to do this with EaselJS since it does not support rich text 
    if( level == "zoomDefault")
    {
      curZoom       = 0;
      decimals      = 0;
      boundDecimals = 2;
      majorInc      = 1;
      minorInc      = 0.5;
    }
    else if( level == "zoom1" )
    {
      curZoom       = 1;
      decimals      = 1;
      boundDecimals = 2;
      majorInc      = 0.1;
      minorInc      = 0.05;
    }
    else if( level == "zoom2" )
    {
      curZoom = 2;
      decimals      = 2;
      boundDecimals = 2;
      majorInc      = 0.01;
      minorInc      = 0.002;
    }
    else if( level == "zoom3" )
    {
      curZoom       = 3;
      decimals      = 3;
      boundDecimals = 3;
      majorInc      = 0.002;
      minorInc      = 0.0002;
    }
    
    // zooming is by successive factors of ten - compute factor and set direction
    if( curZoom > curLevel )
    {
      zoomDirection = axis.IN;
      zoomFactor    = Math.pow(10, (curZoom-curLevel));
    }
    else
    {
      zoomDirection = axis.OUT;
      zoomFactor    = Math.pow(10, (curLevel-curZoom));
    }
    
    axis.zoom(zoomDirection, zoomFactor);
    axis.set_majorInc(majorInc);
    axis.set_minorInc(minorInc);
    
    drawNumberLine();
  });
  
  $('#reset').click(function()
  {
    min           = defaultMin;
    max           = defaultMax;
    majorInc      = 1;
    minorInc      = 0.5;
    decimals      = 0;
    boundDecimals = 2;
    curZoom       = 0;
    
    axis.set_min(defaultMin);
    axis.set_max(defaultMax);
    axis.set_majorInc(majorInc);
    axis.set_minorInc(minorInc);
    
    drawNumberLine();
  });
  
  function onPageLoaded()
  {
    // default zoom level
    curZoom = 0;
    
    // initial numberline values
    defaultMin    = -5;
    defaultMax    = 5;
    majorInc      = 1;
    minorInc      = 0.5;
    decimals      = 0;
    boundDecimals = 2;
    useScientific = false;
    
	  // EaselJS setup
    var canvas   = document.getElementById("stageCanvas");
    var bounds   = new createjs.Rectangle();
    axisLength   = canvas.width;
    canvasHeight = canvas.height;
    halfHeight   = Math.round(0.5*canvasHeight);
    stage        = new createjs.Stage(canvas);
    
    // Axis
    var axisRef = new AxisModule();
    axis        = new axisRef.Axis();
    
    // initialize the axis
    if( axisLength > 0 )
      axis.set_length(axisLength);
    
    axis.set_min(defaultMin);
    axis.set_max(defaultMax);
    axis.set_majorInc(majorInc);
    axis.set_minorInc(minorInc);
    
    // add a shape to draw the number line into
    nlShape = new createjs.Shape();
    
    // add to the display list
    stage.addChild(nlShape);
    
    minMaxTxt = new createjs.Text("min: max:", 'Bold 16px Arial', "#ebebeb" );
    stage.addChild(minMaxTxt);
    
    // permanent references to the tic labels and associated display objects - created once and re-used as needed
    ticLabels         = [];
    ticDisplayObjects = [];
    
    stage.addEventListener( "stagemousedown", onMouseDown );
    stage.addEventListener( "stagemouseup"  , onMouseUp   );
    stage.mouseMoveOutside = true; 
    
    // Number formatter
    var formatterRef = new FormatterModule();
    numberFormatter  = new formatterRef.NumberFormatter();
    
    // draw the initial number line
    drawNumberLine();
  };
  
  function drawNumberLine()
  {
    // numberline thickness is 3
    var g = nlShape.graphics;
    g.clear();
    g.setStrokeStyle(3);
    g.beginStroke( createjs.Graphics.getRGB(131,156,165,1) );
    g.moveTo(0, halfHeight);
    g.lineTo(axisLength, halfHeight);
    
    // get the pixel locations of the major tic marks
    var majorTics    = axis.getTicCoordinates("major");
    var numMajorTics = majorTics.length;
    var i;
    var ticX;
      
    // draw the major tics (hardcoded width and height)
    g.setStrokeStyle(2);
    
    for( i=0; i<numMajorTics; ++i)
    {
      ticX = majorTics[i];
      g.moveTo(ticX, halfHeight-10);
      g.lineTo(ticX, halfHeight+10);
    }
    
    // same for the minor tics
    g.setStrokeStyle(1);
    var minorTics    = axis.getTicCoordinates("minor");
    var numMinorTics = minorTics.length;
    
    for( i=0; i<numMinorTics; ++i)
    {
      ticX = minorTics[i];
      g.moveTo(ticX, halfHeight-6);
      g.lineTo(ticX, halfHeight+6);
    }
    
    g.endStroke();
    
    // only the major tics are labeled - do we have enough labels to cover the major tics?
    var numLabels = ticLabels.length;
    var lbl;
    var dispObj;
    
    if( numLabels < numMajorTics )
    {
      // create labels JIT and then re-use the pool every number line redraw
      for( i=numLabels; i<numMajorTics; ++i)
      {
        lbl     = new createjs.Text(" ", 'Bold 16px Arial', "#ebebeb" );
        dispObj = stage.addChild(lbl);
        
        ticLabels.push( lbl );
        ticDisplayObjects.push( dispObj );
      }
    }
    
    minMaxTxt.x = 5;
    minMaxTxt.y = canvasHeight - minMaxTxt.getMeasuredHeight() - 5;
    
    // use however many tics are necessary and hide the remaining ones
    var labelText = axis.getTicMarks("major");
    
    for( i=0; i<numLabels; ++i )
      labelText[i] = numberFormatter.formatNumber(labelText[i], false, useScientific, boundDecimals);

    for( i=0; i<numLabels; ++i )
    {
      // make all tic labels invisible by default
      ticDisplayObjects[i].visible = false;
    }
    
    // position the labels - it's a matter of style, but for this demo, the endpoint labels are not displayed if they are near the Canvas edge
    var baseline = halfHeight + 13;
    
    for( i=0; i<numMajorTics; ++i )
    {
      lbl             = ticLabels[i];
      dispObj         = ticDisplayObjects[i];
      lbl.text        = labelText[i]; 
      ticX            = majorTics[i];
      dispObj.x       = Math.round( ticX - 0.5*lbl.getMeasuredWidth() );
      dispObj.y       = baseline;
      dispObj.visible = ticX > 10 && ticX < axisLength-10;
    }
    
    var minValue   = axis.get_min();
    var maxValue   = axis.get_max();
    var axisMin    = numberFormatter.toFixed(minValue, boundDecimals);
    var axisMax    = numberFormatter.toFixed(maxValue, boundDecimals);
    minMaxTxt.text = "min: " + axisMin + " max: " + axisMax;
    
    stage.update();
  }
  
  function onMouseDown(evt)
  {
    xOrig = stage.mouseX;
    stage.addEventListener( "stagemousemove", onMouseMove );
  }
  
  function onMouseUp(evt)
  {
    stage.removeEventListener( "stagemousemove", onMouseMove );
  }
  
  function onMouseMove(evt)
  {
    delta = evt.stageX - xOrig;
    axis.shift( delta );
    
    drawNumberLine();
    
    // adjust for next increment
    xOrig = evt.stageX;  
  }
});