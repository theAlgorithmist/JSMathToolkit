/* copyright (c) 2012, Jim Armstrong.  All Rights Reserved.
 * 
 * THIS SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * 
 * This software may be modified for commercial use as long as the above copyright notice remains intact.
 * 
 * This software is derived from software containing the following copyright notice
 * 
 * THIS SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * 
 * This software is derived from software bearing the following notice   
 *                                                                                       
 * POLYGONAL - A HAXE LIBRARY FOR GAME DEVELOPERS
 * Copyright (c) 2009-2010 Michael Baczynski, http://www.polygonal.de
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

define(['../core/datastructures/Heap', '../core/datastructures/DenseArray'], function (HeapModule, DAModule) 
{
  var returnedModule = function () 
  {
    var heapRef = new HeapModule();
    var daRef   = new DAModule();
    
   /**
    * 
    * JS implementation of A* algorithm for Waypoints - call find() method to find optimal path
    * 
    * @return Nothing
    * 
    * @author Jim Armstrong, www.algorithmist.net
    * 
    * @version 1.0
    * 
    * Credit:  Michael Baczynski, polygonal ds
    */
 
    this.AStar = function()
    {
      this._que = new heapRef.Heap();
    }

    this.AStar.__name__ = true;
    this.AStar.prototype = 
    {
     /**
      * Free the pathfinder to accept new data
      * 
      * @return Nothing
      */
      free: function()
      {
        this._que.free();
    
        this._que = null;
      }
  
     /**
      * Find the optimal path along the supplied Graph from source to target node (with shortest Euclidean distance in the plane as the metric)
      * 
      * @param graph : Graph - Waypoint Graph (nodes must be AStarWaypoint instances)
      * 
      * @param soure : GraphNode - Starting Waypoint
      * 
      * @param target : GraphNdoe - Ending Waypoint
      * 
      * @return : DenseArray - Optimal Path (stored as linear sequence of AStarWaypoint references from source to target)
      */
      , find: function(graph, source, target)
      {
        path = new daRef.DenseArray(0,-1);
        
        var pathExists = false;
    
        var walker = graph.getNodeList();
      
        while (walker != null)
        {
          walker.marked = false;
          walker.parent = null;
          walker.val.reset();
          walker = walker.next;
        }
        
        this._que.clear(true);
        this._que.add(source);
    
        while (this._que.size() > 0)
        {
          var waypoint1 = this._que.pop();
          waypoint1.onQue = false;
    
          var node1 = waypoint1.node;
          if (node1.marked) 
            continue;
      
          node1.marked = true;
          
          if (node1 == target.node)
          {
            pathExists = true;
            break;
          }
      
          var arc = node1.arcList;
          
          while (arc != null)
          {
            //the node our arc is pointing at
            var node2 = arc.node;
        
            //skip marked nodes
            if (node2.marked)
            {
              arc = arc.next;
              continue;
            }
        
            var waypoint2 = node2.val;
        
            var distance = waypoint1.distance + waypoint1.distanceTo(waypoint2);
      
            if (node2.parent != null)
            {
              if (distance < waypoint2.distance)
              {
                node2.parent = node1;
                waypoint2.distance = distance;
              }
              else
              {
                arc = arc.next;
                continue;
              }
            }
            else
            {
              node2.parent = node1;
              waypoint2.distance = distance;
            }
        
            var heuristics = waypoint2.distanceTo(target) + distance;
        
            waypoint2.heuristic = heuristics;
        
            if( !waypoint2.onQue )
            {
              waypoint2.onQue = true;
              this._que.add(waypoint2);
            }

            arc = arc.next;
          }
        }
    
        if( pathExists )
        {
          var walker = target;
          while( walker != source )
          {
            path.pushBack(walker);
            walker = walker.node.parent.val;
          }
      
          path.pushBack(source);
          path.reverse();
        }
    
        return path;
      }
    }
  }
  
  return returnedModule;
});