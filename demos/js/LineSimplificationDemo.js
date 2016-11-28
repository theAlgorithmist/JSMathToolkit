/*
 * Supporting script for basic Polygon demo.  Copyright (c) 2013, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */
require(['jquery', 
         'bootstrap', 
         'easeljs', 
         '../../geometry/Lang',
         '../../geometry/DouglasPeucker',
         '../../geometry/McMaster'
         ], 
         function
         (
           $, 
           bootstrapRef, 
           easelJS, 
           LangModule,
           DPModule,
           McMasterModule
         )
{
  var stage;
  var lineShape;
  var simplifyShape;
  var canvasLength;
  var canvasHeight;
  var simplifyClass; 
  var type;
  var simplifyClasses = [];
  var simplifyType    = []
  
  var langRef = new LangModule();
  var lang    = new langRef.Lang();
  
  var dpRef = new DPModule();
  var dp    = new dpRef.DouglasPeucker();
  
  var mcRef    = new McMasterModule();
  var mcMaster = new mcRef.McMaster();
  
  simplifyClasses["Lang"]           = lang;
  simplifyClasses["DouglasPeucker"] = dp;
  simplifyClasses["McMaster"]       = mcMaster;
  simplifyType["Lang"]              = "Lang Simplification";
  simplifyType["DouglasPeucker"]    = "Douglas Peucker";
  simplifyType["McMaster"]          = "McMaster";
  
  // sample data collection
  var data = [];
  data.push( {x:10, y:50} );
  data.push( {x:11, y:51} );
  data.push( {x:13, y:48} );
  data.push( {x:20, y:40} );
  data.push( {x:22, y:44} );
  data.push( {x:28, y:44} );
  data.push( {x:30, y:48} );
  data.push( {x:32, y:50} );
  data.push( {x:36, y:46} );
  data.push( {x:38, y:44} );
  data.push( {x:40, y:40} );
  data.push( {x:44, y:44} );
  data.push( {x:48, y:50} );
  data.push( {x:50, y:52} );
  data.push( {x:55, y:60} );
  data.push( {x:58, y:62} );
  data.push( {x:60, y:62} );
  data.push( {x:64, y:60} );
  data.push( {x:66, y:65} );
  data.push( {x:68, y:65} );
  data.push( {x:70, y:70} );
  data.push( {y:75, y:65} );
  data.push( {y:78, y:62} );
  data.push( {x:80, y:64} );
  data.push( {x:82, y:65} );
  data.push( {x:85, y:66} );
  data.push( {x:90, y:70} );
  data.push( {x:92, y:60} );
  data.push( {x:95, y:60} );
  data.push( {x:98, y:58} );
  data.push( {x:100, y:55} );
  data.push( {x:102, y:57} );
  data.push( {x:105, y:50} );
  data.push( {x:108, y:48} );
  data.push( {x:110, y:50} );
  data.push( {x:111, y:47} );
  data.push( {x:115, y:40} );
  data.push( {x:118, y:42} );
  data.push( {x:120, y:40} );
  data.push( {x:125, y:30} );
  data.push( {x:128, y:33} );
  data.push( {x:130, y:30} );
  data.push( {x:132, y:30} );
  data.push( {x:135, y:25} );
  data.push( {x:140, y:28} );
  data.push( {x:142, y:28} );
  data.push( {x:145, y:25} );
  data.push( {x:150, y:20} );
  data.push( {x:152, y:18} );
  data.push( {x:155, y:20} );
  data.push( {x:156, y:18} );
  data.push( {x:160, y:15} );
  data.push( {x:162, y:14} );
  data.push( {x:165, y:20} );
  data.push( {x:170, y:25} );
  data.push( {x:175, y:30} );
  data.push( {x:178, y:28} );
  data.push( {x:180, y:25} );
  data.push( {x:182, y:29} );
  data.push( {x:185, y:30} );
  data.push( {x:188, y:28} );
  data.push( {x:190, y:32} );
  data.push( {x:195, y:32} );
  data.push( {x:200, y:35} );
  data.push( {x:210, y:35} );
  data.push( {x:212, y:40} );
  data.push( {x:215, y:45} );
  data.push( {x:220, y:43} );
  data.push( {x:222, y:48} );
  data.push( {x:225, y:50} );
  data.push( {x:230, y:60} );
  data.push( {x:245, y:60} );
  data.push( {x:260, y:65} );
  data.push( {x:265, y:70} );
  data.push( {x:270, y:63} );
  data.push( {x:278, y:60} );
  data.push( {x:290, y:65} );
  data.push( {x:295, y:80} );
  data.push( {x:300, y:82} );
  data.push( {x:305, y:80} );
  data.push( {x:308, y:90} );
  data.push( {x:310, y:90} );
  data.push( {x:315, y:120} );
  data.push( {x:320, y:140} );
  data.push( {x:325, y:135} );
  data.push( {x:330, y:133} );
  data.push( {x:335, y:135} );
  data.push( {x:340, y:150} );
  data.push( {x:345, y:145} );
  data.push( {x:348, y:145} );
  data.push( {x:350, y:143} );
  data.push( {x:355, y:150} );
  data.push( {x:360, y:155} );
  data.push( {x:370, y:200} );
  data.push( {x:375, y:190} );
  data.push( {x:380, y:188} );
  data.push( {x:388, y:185} );
  data.push( {x:390, y:200} );
  data.push( {x:392, y:200} );
  data.push( {x:395, y:195} );
  
  $( document ).ready( onPageLoaded );
  
  // various button handlers, toggling, blah, blah ...
  $('#methodSelector li a').click(function() 
  {
    var theClass = $(this).text();
    simplifyClass = simplifyClasses[theClass];
    type          = simplifyType[theClass];
    
    drawSimplifiedLine();
  });
  
 
  $('#reset').click(function()
  {
    simplifyShape.graphics.clear();
    theClass = "";
  });
  
  function onPageLoaded()
  {
	  // EaselJS setup
    var canvas   = document.getElementById("stageCanvas");
    var bounds   = new createjs.Rectangle();
    canvasLength = canvas.width;
    canvasHeight = canvas.height;
    stage        = new createjs.Stage(canvas);
  
    // add a shape to draw a polygon into
    lineShape = new createjs.Shape();
    
    // add a shape to draw the bounding box
    simplifyShape = new createjs.Shape();
    
    // add a shape to draw the test point graphic
    pointShape = new createjs.Shape();
    
    // add each to the display list
    stage.addChild(lineShape);
    stage.addChild(simplifyShape);
    stage.addChild(pointShape);
    
    showData()
  };
  
  function showData()
  {
    // line thickness is 2
    var g = lineShape.graphics;
    g.clear();
    g.setStrokeStyle(2);
    g.beginStroke( createjs.Graphics.getRGB(255,255,255,1) );
    g.moveTo(data[0].x, data[0].y);
    
    var n = data.length;
    var i;
    for( i=0; i<n; ++i )
      g.lineTo(data[i].x, data[i].y);
    
    stage.update();
  };
  
  function drawSimplifiedLine()
  {
    var g = simplifyShape.graphics;
    g.clear();
    g.setStrokeStyle(2);
    g.beginStroke( createjs.Graphics.getRGB(255,0,0) );
    
    var simplified;
    if( type == "Lang Simplification" )
      simplified = simplifyClass.simplify(data, 5, 5);
    else if( type == "Douglas Peucker")
      simplified = simplifyClass.simplify(data, 3, 2);
    else if( type == "McMaster" )
      simplified = simplifyClass.simplify(data);
    
    var n   = data.length;
    var len = simplified.length;
    
    g.moveTo(simplified[0].x, simplified[0].y);
    
    var n = data.length;
    var i;
    for( i=0; i<len; ++i )
      g.lineTo(simplified[i].x, simplified[i].y);
    
    stage.update();
    
    $('#instruct').text(n + " points reduced to " + len);
  }
});