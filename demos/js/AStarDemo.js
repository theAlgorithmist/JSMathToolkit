/*
 * 2D A* Waypoints demo.  Copyright (c) 2014, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */
require(['jquery', 
         'bootstrap', 
         'easeljs', 
         '../../graphing/GraphAxis', 
         '../../core/datastructures/GraphNode',
         '../../core/datastructures/Graph',
         '../../ai/AStarWaypoint',
         '../../ai/AStar'
         ], 
         function($,                    // jQuery
                  bootstrapRef,         // Bootstrap
                  easelJS,              // EaselJS
                  GraphAxisModule,      // GraphAxis
                  GraphNodeModule,      // GraphNode
                  GraphModule,          // Graph
                  AStarWaypointModule,  // A* Waypoints
                  AStarModule           // A* (for waypoints)
                  )
{
  var stage;
  var xAxis;
  var yAxis;
  var grid;
  var xAxisShape;
  var xAxisArrowsShape;
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
  var pointRenderShape;
  var graphRenderShape;
  var pathRenderShape;
  var pxPerUnitX;
  var pxPerUnitY;
  
  var astarRef = new AStarModule();
  var astar    = new astarRef.AStar();
  
  var astarWaypointRef = new AStarWaypointModule();
  var graphNodeRef     = new GraphNodeModule();
  var graphRef         = new GraphModule();
  
  var waypoints = [];
  var point = new astarWaypointRef.AStarWaypoint("1");
  point.x = 1;
  point.y = 1;

  waypoints.push(point);

  point = new astarWaypointRef.AStarWaypoint("2");
  point.x = 4;
  point.y = 5;

  waypoints.push(point);

  point = new astarWaypointRef.AStarWaypoint("3");
  point.x = 6;
  point.y = 0;

  waypoints.push(point);

  point = new astarWaypointRef.AStarWaypoint("4");
  point.x = 7;
  point.y = 6;

  waypoints.push(point);
  
  point = new astarWaypointRef.AStarWaypoint("5");
  point.x = 8;
  point.y = 3;

  waypoints.push(point);

  point = new astarWaypointRef.AStarWaypoint("6");
  point.x = 9;
  point.y = 1;

  waypoints.push(point);
  
  point = new astarWaypointRef.AStarWaypoint("7");
  point.x = 8;
  point.y = 7;

  waypoints.push(point);
  
  point = new astarWaypointRef.AStarWaypoint("8");
  point.x = 12;
  point.y = 4;

  waypoints.push(point);
  
  // Graph Nodes - 1-1 correspondence between graph nodes and waypoints
  var nodes = []
  var node = new graphNodeRef.GraphNode( waypoints[0] );
  node.id  = "0";
  nodes.push(node);
  
  node    = new graphNodeRef.GraphNode( waypoints[1] );
  node.id = "1";
  nodes.push(node);
  
  node    = new graphNodeRef.GraphNode( waypoints[2] );
  node.id = "2";
  nodes.push(node);
  
  node    = new graphNodeRef.GraphNode( waypoints[3]  );
  node.id = "3";
  nodes.push(node);
  
  node    = new graphNodeRef.GraphNode( waypoints[4] );
  node.id = "4";
  nodes.push(node);
  
  node    = new graphNodeRef.GraphNode( waypoints[5] );
  node.id = "5";
  nodes.push(node);
  
  node    = new graphNodeRef.GraphNode( waypoints[6] );
  node.id = "6";
  nodes.push(node);
  
  node    = new graphNodeRef.GraphNode( waypoints[7] );
  node.id = "7";
  nodes.push(node);
  
  // correspondence (composition model)
  waypoints[0].node = nodes[0];
  waypoints[1].node = nodes[1];
  waypoints[2].node = nodes[2];
  waypoints[3].node = nodes[3];
  waypoints[4].node = nodes[4];
  waypoints[5].node = nodes[5];
  waypoints[6].node = nodes[6];
  waypoints[7].node = nodes[7];
  
  var graph = new graphRef.Graph();
  
  // add graph nodes
  graph.addNode(nodes[0]); // 1
  graph.addNode(nodes[1]); // 2
  graph.addNode(nodes[2]); // 3
  graph.addNode(nodes[3]); // 4
  graph.addNode(nodes[4]); // 5
  graph.addNode(nodes[5]); // 6
  graph.addNode(nodes[6]); // 7
  graph.addNode(nodes[7]); // 8
  
  // create arcs - arc list is 1-2, 1-3, 2-4, 3-4, 3-5, 3-6, 4-7, 5-7, 5-8, 6-8, 7-8
  
  graph.addSingleArc(nodes[0], nodes[1], getCost(waypoints[0], waypoints[1]) );   // 1-2
  graph.addSingleArc(nodes[0], nodes[2], getCost(waypoints[0], waypoints[2]) );   // 1-3
  graph.addSingleArc(nodes[1], nodes[3], getCost(waypoints[1], waypoints[3]) );   // 2-4
  graph.addSingleArc(nodes[2], nodes[3], getCost(waypoints[2], waypoints[3]) );   // 3-4
  graph.addSingleArc(nodes[2], nodes[4], getCost(waypoints[2], waypoints[4]) );   // 3-5
  graph.addSingleArc(nodes[2], nodes[5], getCost(waypoints[2], waypoints[5]) );   // 3-6
  graph.addSingleArc(nodes[3], nodes[6], getCost(waypoints[3], waypoints[6]) );   // 4-7
  graph.addSingleArc(nodes[4], nodes[6], getCost(waypoints[4], waypoints[6]) );   // 5-7
  graph.addSingleArc(nodes[4], nodes[7], getCost(waypoints[4], waypoints[7]) );   // 5-8
  graph.addSingleArc(nodes[5], nodes[7], getCost(waypoints[5], waypoints[7]) );   // 6-8
  graph.addSingleArc(nodes[6], nodes[8], getCost(waypoints[6], waypoints[7]) );   // 7-8
  
 
  $( document ).ready( onPageLoaded );
  
  function onPageLoaded()
  {
    // initial grid values
    defaultTop    = 10;
    defaultLeft   = -1;
    defaultRight  = 13;
    defaultBottom = -1;
    decimals      = 1;
    majorInc      = 1;
    minorInc      = 0.5;
    
	  // EaselJS setup
    var canvas = document.getElementById("stageCanvas");
    stage      = new createjs.Stage(canvas);
    
    // Graph axes (length/height used to manage tic label display)
    var axisRef = new GraphAxisModule();
    xAxis       = new axisRef.GraphAxis();
    yAxis       = new axisRef.GraphAxis();
    axisLength  = canvas.width;
    axisHeight  = canvas.height;
    pxPerUnitX  = axisLength/(defaultRight - defaultLeft);
    pxPerUnitY  = axisHeight/(defaultTop - defaultBottom);
    
    // initialize the axes - default is to display both arrows
    xAxis.setOrientation( xAxis.HORIZONTAL );
    yAxis.setOrientation( yAxis.VERTICAL );
    
    xAxis.setBounds(defaultLeft, defaultTop, defaultRight, defaultBottom, canvas.width, canvas.height);
    yAxis.setBounds(defaultLeft, defaultTop, defaultRight, defaultBottom, canvas.width, canvas.height);
    
    xAxis.set_majorInc(majorInc);
    yAxis.set_majorInc(majorInc);
    xAxis.set_minorInc(minorInc);
    yAxis.set_minorInc(minorInc);
    
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
    graphRenderShape = new createjs.Shape();
    pathRenderShape  = new createjs.Shape();
    pointRenderShape = new createjs.Shape();

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
    stage.addChild(graphRenderShape);
    stage.addChild(pathRenderShape);
    stage.addChild(pointRenderShape);
    
    drawAxes();
    
    drawPath();
  };
  
  function getCost(point1, point2)
  {
    return point1.distanceTo(point2);
  };

  // total cost of path of Waypoint objects
  function getPathCost(path)
  {
    var i;
    var len = path.length;
    var point1 = path[0];
    var point2 = path[1];
    var cost   = point1.distanceTo(point2);
    
    for( i=1; i<len-1; ++i)
    {
      point1 = point2;
      point1 = path[i+1];
      
      cost += point1.distanceTo(point2);
    }
  };
  
  function drawPath()
  {
    // original points
    var i, w;
    var len = waypoints.length;
    var g   = pointRenderShape.graphics;
    g.clear();
    
    var xp, yp;
    for( i=0; i<len; ++i )
    {
      w = waypoints[i];
      g.beginFill( createjs.Graphics.getRGB(0, 255, 0,1) );
      
      xp = (w.x - defaultLeft)*pxPerUnitX;
      yp = (defaultTop - w.y)*pxPerUnitY;
      
      g.drawCircle(xp,yp,4);
      g.endFill();
    }
    
    g = graphRenderShape.graphics;
    g.clear();
    
    g.setStrokeStyle(2);
    g.beginStroke( createjs.Graphics.getRGB(255,255,255,1) );
    
    var xn, yn, xa, ya;
    var n, w, arc;
    len = nodes.length;
    
    for( i=0; i<len; ++i )
    {
      n = nodes[i];
      w = n.val;  // waypoint is node value
      
      xn = (w.x - defaultLeft)*pxPerUnitX;
      yn = (defaultTop - w.y)*pxPerUnitY;
      
      g.moveTo(xn, yn);
      
      arc = n.arcList;
      if( arc != null )
      {
        n   = arc.node;
        w   = n.val;
        xa  = (w.x - defaultLeft)*pxPerUnitX;
        ya  = (defaultTop - w.y)*pxPerUnitY;
      
        g.lineTo(xa, ya);
      
        while( arc != null )
        {
          arc = arc.next;
          if( arc )
          {
            n  = arc.node;
            w  = n.val;
            
            g.moveTo(xn, yn);
            xa = (w.x - defaultLeft)*pxPerUnitX;
            ya = (defaultTop - w.y)*pxPerUnitY;
        
            g.lineTo(xa, ya);
          }
        }
      }
    }
    
    g.endStroke();
    
    // find optimal path from waypoint 1 to waypoint 7
    var path = astar.find( graph, waypoints[0], waypoints[6] );
    
    g = pathRenderShape.graphics;
    g.clear();
    
    g.setStrokeStyle(2);
    g.beginStroke( createjs.Graphics.getRGB(255,0,0,1) );
    
    if( path != null )
    {
      console.log( " ");
      console.log( "path " );
      console.log( " " );
      
      var a   = path.getArray();
      var cost = 0.0;
      
      len = a.length;
      w   = a[0];
      console.log( "waypoint: ", i, ", id: ", w.key );
      
      xn = (w.x - defaultLeft)*pxPerUnitX;
      yn = (defaultTop - w.y)*pxPerUnitY;
      g.moveTo(xn,yn);
      
      for( i=1; i<len; ++i )
      {
        w = a[i];
        console.log( "waypoint: ", i, ", id: ", w.key );
        
        xa = (w.x - defaultLeft)*pxPerUnitX;
        ya = (defaultTop - w.y)*pxPerUnitY;
        g.lineTo(xa, ya);
        
        cost += getCost( a[i-1], a[i] );
      }
      
      console.log( " ");
      console.log( "total path cost (units of distance): ", cost );
    }
   
    g.endStroke();
    
    stage.update();
  };
  
  function drawAxes()
  {
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
    
    // tic labels require managing a display list, so these are rendered externally, similar to the Numberline example
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
});