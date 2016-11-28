/*
 * Supporting script for function graph demo using freeform function input.  Copyright (c) 2014, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */
require(['jquery', 
         'bootstrap', 
         'easeljs', 
         '../../functionGraphing/GraphLayer',
         '../../functionGraphing/FunctionParser',
         '../../functionGraphing/FcnGraphEngine'], 
         function($,                    // jQuery
                  bootstrapRef,         // Bootstrap
                  easelJS,              // EaselJS
                  GraphLayerModule,     // GraphLayer
                  FcnParserModule,      // Function Parser
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
  
  var __zoom    = "none";
  var __graphed = false;
  
  var fcnGraphRef = new FcnGraphModule();
  var layerRef    = new GraphLayerModule();
  var parserRef   = new FcnParserModule();
  
  // Function parser
  __parser = new parserRef.FunctionParser();
  
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
      
  $('#graph').click(function()
  {
    var equation = $('#equation').val();
    
    if( !__graphed )
    {
      var layer = new layerRef.GraphLayer();
      
      var parsed = __parser.parse(equation);
      if( parsed )
      {
        layer.set_function( __parser, true );
        layer.set_lineProperties( '#ffff00', 2 );
    
        graph.addLayer( "FREE", layer );
        __graphed = true;
      }
      
      return;
    }
    
    if( equation != "" )
    {
      parsed = __parser.parse(equation);
      
      if( parsed )
        graph.redraw();
    }
    
  });
  
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
  };
});