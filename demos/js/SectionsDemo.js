/*
 * Supporting script for architectural sections demo.  Copyright (c) 2013, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */
require(['jquery', 
         'bootstrap', 
         'easeljs', 
         '../../core/RectangleSelector', 
         '../../shapes/CSection',
         '../../shapes/LSection',
         '../../shapes/ISection'
         ], 
         function($, 
                  bootstrapRef, 
                  easelJS, 
                  RectangleSelectorModule, 
                  CSectionModule,
                  LSectionModule,
                  ISectionModule
                  )
{
  var stage;
  var sectionShape;
  var boundShape;
  var boundLeft;
  var boundTop;
  var boundRight;
  var boundBottom;
  var cgSection;
  var orientation;
  var thickness;
  var sectionHolder;
  
  var selector = new RectangleSelectorModule();
  
  $( document ).ready( onPageLoaded );
  
  // various button handlers, toggling, blah, blah ...
  $('#sectionSelector li a').click(function() 
  {
    var type  = $(this).text();
    cgSection = sectionHolder[type];
    
    if( cgSection )
      drawSection(cgSection);
  });
  
  $('#orientGroup button').click(function() 
  {
    $('#orientGroup button').addClass('active').not(this).removeClass('active');

    orientation = $(this).attr('id');
    
    if( cgSection )
      drawSection(cgSection);
  });
  
  $('input[name="thickness"]').click(function()
  {
    if( cgSection )
      drawSection(cgSection);
  });
  
  $('#reset').click(function()
  {
    if( cgSection )
    {
      cgSection.clear();
      sectionShape.graphics.clear();

      selector.addRectangleSelector(stage, onBound);
      
      stage.update();
    }
  });
  
  function onBound(__left, __top, __right, __bottom)
  {
    boundLeft   = __left;
    boundTop    = __top;
    boundRight  = __right;
    boundBottom = __bottom;
    
    drawSection(cgSection);
  };
  
  function onPageLoaded()
  { 
    // create three instances of architectural sections
    var cSectionRef = new CSectionModule();
    var cSection   = new cSectionRef.CSection();
    
    var lSectionRef = new LSectionModule();
    var lSection    = new lSectionRef.LSection();
    
    var iSectionRef = new ISectionModule();
    var iSection  = new iSectionRef.ISection();
    
    cgSection     = cSection;
    sectionHolder = {"C-Section":cSection, "L-Section":lSection, "I-Section":iSection};
    orientation   = "right";
    
	  // EaselJS setup
    var canvas = document.getElementById("stageCanvas");
    var bounds = new createjs.Rectangle();
    stage      = new createjs.Stage(canvas);
  
    // add a shape to draw a polygon into
    sectionShape = new createjs.Shape();
    
    // add to the display list
    stage.addChild(sectionShape);
    
    // the rectangle selector is a single-use entity, so re-establish the selector for the next bounding rectangle
    selector.addRectangleSelector(stage, onBound);
  };
  
  function drawSection(section)
  {
    var thicknessInput = $('input[name="thickness"]');
    var t              = thicknessInput.val();
    var params         = {"orient":orientation, "thickness":t};
    
    if( cgSection )
    {
      // All shapes are defined by a bounding rectangle and a small set of parameters (and creation automatically clears any internal settings/vertices)
      cgSection.create(boundLeft, boundTop, boundRight, boundBottom, params, true);
    }  
    
    var xCoords = section.get_xcoordinates();
    var yCoords = section.get_ycoordinates();
    
    // line thickness is 2
    var g = sectionShape.graphics;
    g.clear();
    g.setStrokeStyle(2);
    g.beginStroke( createjs.Graphics.getRGB(255,255,255,1) );
    g.drawRect(boundLeft, boundTop, (boundRight-boundLeft), (boundBottom-boundTop));
    
    g.beginStroke( createjs.Graphics.getRGB(255,215,0,1) );
    g.moveTo(xCoords[0], yCoords[0]);
    
    var n = xCoords.length;
    var i;
    for( i=0; i<n; ++i )
      g.lineTo(xCoords[i], yCoords[i]);
    
    // polygon is always closed
    g.lineTo(xCoords[0], yCoords[0]);
   
    stage.update();
  };
});