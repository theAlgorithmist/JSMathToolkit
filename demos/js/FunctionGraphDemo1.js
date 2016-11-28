/*
 * Supporting script for function graph demo #1.  Copyright (c) 2014, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */
require(['jquery', 
         'bootstrap', 
         'easeljs', 
         '../../core/GraphMarker', 
         '../../functionGraphing/GraphLayer',
         '../../functionGraphing/FcnGraphEngine'], 
         function($,                    // jQuery
                  bootstrapRef,         // Bootstrap
                  easelJS,              // EaselJS
                  GraphMarkerModule,    // GraphMarker
                  GraphLayerModule,     // GraphLayer
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
  
  $( document ).ready( onPageLoaded );
  
  function onPageLoaded()
  {
	  // EaselJS setup
    var canvas = document.getElementById("stageCanvas");
    stage      = new createjs.Stage(canvas);
    axisLength = canvas.width;
    axisHeight = canvas.height;
   
    // create an instance of the function graph engine and give it a reference to the Stage
    graph = new fcnGraphRef.FcnGraphEngine(stage);
    
    // set the graph bounds
    graph.set_graphBounds( defaultLeft, defaultTop, defaultRight, defaultBottom, axisLength, axisHeight );
    
    // set the render parameters for the axes
    graph.set_axisParams( 3, '#cccccc', 1.0, 3, '#cccccc', 1.0, true, true );
    
    // set the remaining grid render properties - we will use the default tic label font assigned by the graph engine (bold arial 15pt)
    graph.set_gridParams( 1, '#ebebeb', 0.5, majorInc, minorInc, "", '#ebebeb', decimals, true );
    
    // render the grid or axis layer, which consists of axes, grid lines, tic marks, and tic labels
    graph.showGrid(true);
    
    // create a graph layer - will use the default, solid-line decorator
    var layer = new layerRef.GraphLayer();
    
    // create a function to be graphed
    var f = function(x){ return Math.sin(x); };
    layer.set_function( f );
    
    // graph the function with a 2px, yellow line
    layer.set_lineProperties( '#ffff00', 2 );
    
    // add the layer to the graph - note that we are defining the function to be plotted - self-plotting functions will be covered in another demo - the
    // layer is plotted as soon as it is added to the graph
    graph.addLayer( "SIN", layer );
    
    layer = new layerRef.GraphLayer();
    layer.set_derivative(true);
    layer.set_function( f );
    layer.set_decorator(layer.DASHED);         // create a dashed-line decorator for the derivative plot with default dash-space properties
    layer.set_lineProperties( '#00ff00', 2 );
   
    graph.addLayer( "COS", layer );
    
  };
});