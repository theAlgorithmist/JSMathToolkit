/*
 * Supporting script for function graph demo with pre-defined functions.  Copyright (c) 2014, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */
require(['jquery', 
         'bootstrap', 
         'easeljs', 
         '../../functionGraphing/GraphLayer',
         '../../functionGraphing/library/AbsValue',
         '../../functionGraphing/library/Polynomial',
         '../../functionGraphing/FcnGraphEngine'], 
         function($,                    // jQuery
                  bootstrapRef,         // Bootstrap
                  easelJS,              // EaselJS
                  GraphLayerModule,     // GraphLayer
                  AbsValueModule,       // AbsValue module
                  PolynomialModule,     // Polynomial
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
  var absRef      = new AbsValueModule();
  var polyRef     = new PolynomialModule();
  
  // simple abs. value function
  var __absValue = new absRef.AbsValue();
  __absValue.set_params( {a:0.5, b:-2} );   // |x|/2 + -2
  
  // Polynomial
  var __polynomial = new polyRef.Polynomial();
  
  // third-degree polynomial
  __polynomial.set_params( {'coef':[-3, 1.25, 0.25] } );
  
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
    $('#instruct').text( "marker x: " + marker.get_x().toFixed(2) + " , marker y: " + marker.get_y().toFixed(2) );
  }
  
  function onMarkerMouseOut(marker)
  {
    
  }
  
  // new coordinates automatically sent to the callback function on move
  function onMarkerMouseMove(newX, newY)
  {
    $('#instruct').text( "marker x: " + newX.toFixed(2) + " , marker y: " + newY.toFixed(2) );
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
   
    graph = new fcnGraphRef.FcnGraphEngine(stage);
    graph.set_graphBounds( defaultLeft, defaultTop, defaultRight, defaultBottom, axisLength, axisHeight );
    graph.set_axisParams( 3, '#cccccc', 1.0, 3, '#cccccc', 1.0, true, true );
    graph.set_gridParams( 1, '#ebebeb', 0.5, majorInc, minorInc, "", '#ebebeb', decimals, true );
    graph.showGrid(true);
    
    var layer = new layerRef.GraphLayer();
    layer.set_function( __absValue );
    layer.set_lineProperties( '#ffff00', 2 );
    
    graph.addLayer( "ABS", layer );
    
    var layer2 = new layerRef.GraphLayer();
    layer2.set_function( __polynomial );
    layer2.set_lineProperties( '#00ff00', 2 );
  
    graph.addLayer( "POLY", layer2 );

    // add a marker constrained to a function and a slice tool
    graph.addMarker('polyMarker', '#ff0000', onMarkerMouseOver, onMarkerMouseOut, onMarkerMouseMove, 6, 'POLY', 0);
    
    graph.addSliceTool("vSlice", "vertical", onSliceToolMoved, 26, 15, "#7F00FF", "#FFC125", 2, -3.0 );
  };
});