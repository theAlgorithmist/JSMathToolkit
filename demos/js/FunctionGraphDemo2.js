/*
 * Supporting script for function graph demo with pre-defined functions.  Copyright (c) 2014, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */
require(['jquery', 
         'bootstrap', 
         'easeljs', 
         '../../functionGraphing/GraphLayer',
         '../../functionGraphing/library/AbsValue',
         '../../functionGraphing/library/StepFunction',
         '../../functionGraphing/library/ComplexStepFunction',
         '../../functionGraphing/library/IntervalData',
         '../../functionGraphing/library/ScatterPlot',
         '../../functionGraphing/library/Polynomial',
         '../../functionGraphing/FcnGraphEngine'], 
         function($,                    // jQuery
                  bootstrapRef,         // Bootstrap
                  easelJS,              // EaselJS
                  GraphLayerModule,     // GraphLayer
                  AbsValueModule,       // AbsValue module
                  StepFcnModule,        // Step Function
                  CSFcnModule,          // ComplexStepFunction
                  IntervalModule,       // IntervalData
                  ScatterPlot,          // ScatterPlot
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
  var stepFcnRef  = new StepFcnModule();
  var csfRef      = new CSFcnModule();
  var intRef      = new IntervalModule();
  var scatterRef  = new ScatterPlot();
  var polyRef     = new PolynomialModule();
  
  // simple abs. value function
  var __absValue = new absRef.AbsValue();
  __absValue.set_params( {a:0.5, b:-2} );   // |x|/2 + -2
  
  // linear step function
  var __step = new stepFcnRef.StepFunction();
  
  // complex step function
  var __csf = new csfRef.ComplexStepFunction();
  
  // scatter plot
  var __scatter = new scatterRef.ScatterPlot();
  
  // Polynomial
  var __polynomial = new polyRef.Polynomial();
  
  // scatter plot data - use default fill color and circle radius
  var __x = [-28, -27, -26, -25, -24, -20, -18, -17, -13, -11, -10, -8, -7, -6, -3, -2, -1, 0,  2,  3, 4, 5, 7, 9, 11, 13, 14, 15, 18, 20, 22,  28, 30];
  var __y = [1  ,  1,  -2 ,   0, -4 , -1 ,  2  , 1,    1,   0,  -1,  -2,  5,  7,  1,  3,  4, 0, -1, -4, 2, 2, 0, 0, -1, -2, -3, -4, 1,  4,  0,  -2,  3];
  
  // create some intervals for the Complex Step Function
  var interval1 = new intRef.IntervalData();
  interval1.set_interval('-inf', -8);
  interval1.rightClosed = true;
  interval1.rightDot    = true;
  interval1.dotRadius   = 4;
  interval1.fillValue   = '#00ff00';
  interval1.fcn         = function(x) { return 0.25*x - 2.0; }
  
  var interval2 = new intRef.IntervalData();
  interval2.set_interval( -7, 0 );
  interval2.leftDot     = true;
  interval2.rightDot    = true;
  interval2.leftClosed  = true;
  interval2.rightClosed = true;
  interval2.fillValue   = '#00ff00';
  interval2.dotRadius   = 4;
  interval2.fcn         = function(x) { return -0.5*x - 3.0; }
  
  var interval3 = new intRef.IntervalData();
  interval3.set_interval( 1, 'inf' );
  interval3.dotRadius = 4;
  interval3.leftDot   = true;
  interval3.fcn       = function(x) { return -0.1*x*x + 0.5*x + 1.0; }
  
  var intervalSet = [interval1, interval2, interval3];
  
  // create some intervals for the linear step function
  var interval4 = new intRef.IntervalData();
  interval4.set_interval(-20,-11);
  interval4.set_m(0);
  interval4.set_y(2);
  interval4.leftDot     = true;
  interval4.rightDot    = true;
  interval4.leftClosed  = true;
  interval4.rightClosed = true;
  interval4.fillValue = '#00ff00';
  
  var interval5 = new intRef.IntervalData();
  interval5.set_interval(-10,-5);
  interval5.set_m(1);
  interval5.set_y(-3);
  interval5.leftDot     = true;
  interval5.rightDot    = true;
  interval5.leftClosed  = true;
  interval5.rightClosed = true;
  interval5.fillValue = '#00ff00';
  
  var interval6 = new intRef.IntervalData();
  interval6.set_interval(0,4);
  interval6.set_m(-1);
  interval6.set_y(3);
  interval6.leftDot     = true;
  interval6.rightDot    = true;
  interval6.leftClosed  = false;
  interval6.rightClosed = false;
  interval6.fillValue   = '#00ff00';
  
  var interval7 = new intRef.IntervalData();
  interval7.set_interval(6,20);
  interval7.set_m(0.5);
  interval7.set_y(-2);
  interval7.leftDot     = true;
  interval7.rightDot    = true;
  interval7.leftClosed  = true;
  interval7.rightClosed = false;
  interval7.fillValue   = '#00ff00';
  
  var intervalSet2 = [ interval4, interval5, interval6, interval7 ];
  
  // assign the interval set to the complex step function
  __csf.set_params( {'intervals':intervalSet} );
  
  // assign the interval set to the linear setp function
  __step.set_params( {'intervals':intervalSet2} );
  
  // assign the scatter ploat data
  __scatter.set_params( {'xData':__x, 'yData':__y} );
  
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
    
    // add any of the other special functions as the second layer
//    var layer2 = new layerRef.GraphLayer();
//    layer2.set_function( __csf );
//    layer2.set_lineProperties( '#00ff00', 2 );
//    
//    graph.addLayer( "CSF", layer2 );
    
//    var layer2 = new layerRef.GraphLayer();
//    layer2.set_function( __scatter );
//  
//    graph.addLayer( "SCATTER", layer2 );
    
//    var layer2 = new layerRef.GraphLayer();
//    layer2.set_function( __polynomial );
//    layer2.set_lineProperties( '#00ff00', 2 );
//  
//    graph.addLayer( "POLY", layer2 );
    
    var layer2 = new layerRef.GraphLayer();
    layer2.set_function( __step );
    layer2.set_lineProperties( '#00ff00', 2 );

    graph.addLayer( "STEP", layer2 );
  };
});