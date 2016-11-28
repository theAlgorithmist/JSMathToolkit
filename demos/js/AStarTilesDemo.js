/*
 * Supporting script for A* Tiles demo.  Copyright (c) 2013, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */
require(['jquery', 
         'bootstrap', 
         'easeljs', 
         '../../core/GridView',
         '../../ai/AStarTiles',
         '../../ai/TileNode',
         '../../ai/Grid2D'
         ], 
         function($, 
                  bootstrapRef, 
                  easelJS, 
                  GridViewModule,
                  AStarTilesModule, 
                  TileNodeModule,
                  Grid2DModule)
{ 
  var stage;
  var gridShape;
  
  var cellWidth = 10; // this will make a 40 x 30 grid
  
  
  var gridViewRef = new GridViewModule();
  var gridView    = new gridViewRef.GridView(cellWidth);
  
  var aStarTilesRef = new AStarTilesModule();
  var aStarTiles    = new aStarTilesRef.AStarTiles();
  
  var tileNodeRef = new TileNodeModule();
  
  var grid2DRef = new Grid2DModule();
  var grid2D    = new grid2DRef.Grid2D(40,30);
  
  $( document ).ready( onPageLoaded );
  
  $('#begin').click(function()
  {
    var path = aStarTiles.findPath(grid2D);
    
    if( path.length > 0 )
    {
      var i;
      var len = path.length;
      var node;
      
      for( i=1; i<len-1; ++i )
      {
        node = path[i];
        grid2D.isOccupied(node.row, node.col, true);
      }
      
      stage.update();
    }
    else
      console.log( "WARNING - no path exists" );
  });
  
  function onPageLoaded()
  {
	  // EaselJS setup
    var canvas = document.getElementById("stageCanvas");
    stage      = new createjs.Stage(canvas);
    stage.enableDOMEvents(true);
    
    // add a shape to draw the teardrop and the bounding rectangle
    gridShape = new createjs.Shape();
    stage.addChild(gridShape);
    
    var g = gridShape.graphics;
    g.clear();
    
    // take up the entire canvas dimensions with the grid
    gridView.drawDefaultGrid(g, 40, 30, 2, "#000000", "#ebebeb");
    
    // link the grid view with the actual 2D grid so that grid updates are reflected in the view
    grid2D.set_gridView(gridView);
    
    // now, define some barriers
    var i;
    var j = 10;
    
    for( i=0; i<20; ++i )
    {
      grid2D.isReachable(i, j, false);
      grid2D.isReachable(i, j+1, false);
    }
    
    i = 30;
    for( j=0; j<15; ++j )
      grid2D.isReachable(i, j, false);
    
    i = 18;
    for( j=21; j<30; ++j )
    {
      grid2D.isReachable(i, j, false);
      grid2D.isReachable(i+1, j, false);
      grid2D.isReachable(i+2, j, false);
      grid2D.isReachable(i+3, j, false);
    }
    
    i = 32;
    for( j=21; j<28; ++j )
    {
      grid2D.isReachable(i, j, false);
      grid2D.isReachable(i+1, j, false);
      grid2D.isReachable(i+2, j, false);
    }
    
    // some high-cost areas
    grid2D.isHazard(20, 15, 1.2);
    grid2D.isHazard(20, 16, 1.2);
    grid2D.isHazard(20, 17, 1.5);
    grid2D.isHazard(21, 16, 1.2);
    grid2D.isHazard(21, 17, 1.1)
    grid2D.isHazard(22, 17, 1.25);
    
    // and, the start/end tiles
    grid2D.set_startNode(3,2);
    grid2D.set_targetNode(9, 26);
    
    stage.update();
  };

});