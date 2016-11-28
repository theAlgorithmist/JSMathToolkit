/*
 * Supporting script for function graph demo with pre-defined functions.  Copyright (c) 2014, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */
require(['jquery', 
         'bootstrap', 
         'easeljs', 
         '../../functionGraphing/GraphLayer',
         '../../functionGraphing/library/PolynomialInterp',
         '../../functionGraphing/FcnGraphEngine'], 
         function($,                    // jQuery
                  bootstrapRef,         // Bootstrap
                  easelJS,              // EaselJS
                  GraphLayerModule,     // GraphLayer
                  PolynomialModule,     // Polynomial Interpolation
                  FcnGraphModule        // Function Graphing Engine
                  )
{
  var stage;
  var marker;
  var graph;
  
  // initial grid values
  var defaultTop    = 5;
  var defaultLeft   = -10;
  var defaultRight  = 10;
  var defaultBottom = -5;
  var decimals      = 0;
  var majorInc      = 1;
  var minorInc      = 0.5;
  
  var __zoom = "none";
  
  var fcnGraphRef = new FcnGraphModule();
  var layerRef    = new GraphLayerModule();
  var polyRef     = new PolynomialModule();
  
  // Polynomial interpolation
  var __polynomial = new polyRef.PolynomialInterp();
  
  // four initial interpolation points
  var __x = [-5, -3, 2, 6];
  var __y = [1, -2, 0, -3];
  
  $( document ).ready( onPageLoaded );
  
  $('#zoomBtnGroup button').click(function() 
  {
    $('#zoomBtnGroup button').addClass('active').not(this).removeClass('active');

    var dir = $(this).attr('id');
        
    if( dir == "zoomOut" )
    {
      if( __zoom == "in" || __zoom == "none" )
      {
        graph.set_decimals(0);
        graph.set_majorInc(1);
        graph.set_minorInc(0.5);

        __zoom = "out";
        graph.zoom(__zoom, 2.0);
      }
    }
    else if( dir == "zoomIn" )
    {
      if( __zoom == "out" || __zoom == "none" )
      {
        graph.set_decimals(1);
        graph.set_majorInc(0.5);
        graph.set_minorInc(0.1);
        
        __zoom = "in";
        graph.zoom(__zoom, 2.0);
      }
    }
  });
  
  // pan left or right by 20px
  $('#panBtnGroup button').click(function() 
  {
    var dir = $(this).attr('id');
            
    if( dir == "panRight" )
      graph.pan("right", 20);
    else if( dir == "panLeft" )
      graph.pan("left", 20);
  });
      
  $('#reset').click(function()
  {
    graph.set_decimals(0);
    graph.set_majorInc(1);
    graph.set_minorInc(0.5);
    
    graph.set_graphBounds( defaultLeft, defaultTop, defaultRight, defaultBottom, axisLength, axisHeight );

    graph.redraw();
  });
  
  // query the x-y coordinates from the marker
  function onMarkerMouseOver(marker)
  {
    $('#instruct').text( "Marker at: " + marker.get_x().toFixed(2) + " , " + marker.get_y().toFixed(2) );
  }
  
  function onMarkerMouseOut(marker)
  {
    $('instruct').text( "" );
  }
  
  // new coordinates automatically sent to the callback function on move along with marker reference
  function onMarkerMouseMove(newX, newY, marker)
  {
    // test same marker names used when adding the markers to the graph
    switch( marker.name )
    {
      case "marker1":
        __x[0] = newX;
        __y[0] = newY;
      break;
      
      case "marker2":
        __x[1] = newX;
        __y[1] = newY;
      break;
      
      case "marker3":
        __x[2] = newX;
        __y[2] = newY;
      break;
      
      case "marker4":
        __x[3] = newX;
        __y[3] = newY;
      break;
    }
    
    // reset the interpolation points
    __polynomial.set_params( {xpoints:__x, ypoints:__y} );
    
    // redraw the graph
    graph.redraw();
  }
  
  // this handler is coded for a vertical slice tool, which is used to query x-coordinates or lines of constant-y
  function onSliceToolMoved(newX)
  {
    // evaluate the ABS function at the x-coordinate specified by the current location of the graph slice tool
    var v = __absValue.eval(newX);
    $('#instruct').text( "slice at x: " + newX.toFixed(2) + " , ABS function value: " + v.toFixed(2) );
  }
  
  function onPageLoaded()
  {
	  // EaselJS setup
    var canvas = document.getElementById("stageCanvas");
    stage      = new createjs.Stage(canvas);
    axisLength = canvas.width;
    axisHeight = canvas.height;
    
    // set the initial interpolation and marker coordinates
    __polynomial.set_params( {xpoints:__x, ypoints:__y} );
   
    graph = new fcnGraphRef.FcnGraphEngine(stage);
    graph.set_graphBounds( defaultLeft, defaultTop, defaultRight, defaultBottom, axisLength, axisHeight );
    graph.set_axisParams( 3, '#cccccc', 1.0, 3, '#cccccc', 1.0, true, true );
    graph.set_gridParams( 1, '#ebebeb', 0.5, majorInc, minorInc, "", '#ebebeb', decimals, true );
    graph.showGrid(true);
    
    // assign the polynomial interpolation to a layer and add that layer to the graph
    var layer = new layerRef.GraphLayer();
    layer.set_function( __polynomial );
    layer.set_lineProperties( '#00ff00', 2 );
    
    graph.addLayer( "INTERP", layer );
    
    // add the markers that define the interpolation points
    graph.addMarker('marker1', '#ff0000', onMarkerMouseOver, onMarkerMouseOut, onMarkerMouseMove, 6, null, __x[0], __y[0] );
    graph.addMarker('marker2', '#ff0000', onMarkerMouseOver, onMarkerMouseOut, onMarkerMouseMove, 6, null, __x[1], __y[1] );
    graph.addMarker('marker3', '#ff0000', onMarkerMouseOver, onMarkerMouseOut, onMarkerMouseMove, 6, null, __x[2], __y[2] );
    graph.addMarker('marker4', '#ff0000', onMarkerMouseOver, onMarkerMouseOut, onMarkerMouseMove, 6, null, __x[3], __y[3] );
  };
});