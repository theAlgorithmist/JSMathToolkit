/*
 * Supporting script for very basic testing of Graph class. Copyright (c) 2014, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */
require(['jquery', 
         'bootstrap', 
         '../../core/datastructures/GraphNode',
         '../../core/datastructures/Graph'], 
         function($,                  // jQuery
                  bootstrapRef,       // Bootstrap
                  GraphNodeModule,    // GraphNode
                  GraphModule         // Graph
                  )
{
  $( document ).ready( onPageLoaded );
  
  function onPageLoaded()
  {
    var graphNodeRef = new GraphNodeModule();
    
    var graphRef = new GraphModule();
    var __graph  = new graphRef.Graph();

    var nodes = []
    var node = new graphNodeRef.GraphNode("1");
    
    nodes.push(node);
    node = new graphNodeRef.GraphNode("2");
    nodes.push(node);
    
    node = new graphNodeRef.GraphNode("3");
    nodes.push(node);
    
    node = new graphNodeRef.GraphNode("4");
    nodes.push(node);
    
    node = new graphNodeRef.GraphNode("5");
    nodes.push(node);
    
    node = new graphNodeRef.GraphNode("6");
    nodes.push(node);
  
    // {1, 4}, {1, 5}, {1, 6}, {2, 5}, {2, 6}, {3, 6}, {4, 1}, {5, 1}, {5, 2}, {6, 1}, {6, 2}, {6, 3}
    __graph.addNode(nodes[0]); // 1
    __graph.addNode(nodes[1]); // 2
    __graph.addNode(nodes[2]); // 3
    __graph.addNode(nodes[3]); // 4
    __graph.addNode(nodes[4]); // 5
    __graph.addNode(nodes[5]); // 6
    
    __graph.addSingleArc(node[0], node[3], 1.0);   // 1-4
    __graph.addSingleArc(node[0], node[4], 0.75);  // 1-5
    __graph.addSingleArc(node[0], node[5], 1.2);   // 1-6
    __graph.addSingleArc(node[1], node[4], 0.5);   // 2-5
    __graph.addSingleArc(node[1], node[5], 1.0);   // 2-6
    __graph.addSingleArc(node[2], node[5], 1.8);   // 3-6
    __graph.addSingleArc(node[3], node[0], 1.4);   // 4-1
    __graph.addSingleArc(node[4], node[0], 0.9);   // 5-1
    __graph.addSingleArc(node[4], node[1], 1.2);   // 5-2
    __graph.addSingleArc(node[5], node[0], 1.6);   // 6-1
    __graph.addSingleArc(node[5], node[1], 1.2);   // 6-2
    __graph.addSingleArc(node[5], node[2], 1.0);   // 6-3
    
    console.log( "nodelist (6): ", __graph.getNodeList() );
    
    console.log( "find node (1): ", __graph.findNode("1") );
  }
});