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
 */

define([], function () 
{
  var returnedModule = function () 
  {
	 /**
	  * This is a straightforward implementation of A* with a 2d grid of tiles (or nodes).  The code supports injectable heuristics and is written for the needs of typical
	  * online or device-based gaming applications.  Every attempt is made to make variables names and general code structure conform to popular online tutorials on the topic.
	  * 
	  * @author Jim Armstrong (www.algorithmist.net)
	  * 
	  * @version 1.0
	  */
    this.AStarTiles = function()
	  {
      // the infamouse open and closed lists
		  this._openList   = [];
		  this._closedList = [];
		  
		  // start and target nodes for a search
		  this._startNode  = null;
		  this._targetNode = null;
		  
		  // heuristic
      this._heuristic = this.__diagonal;
	  }
		
    this.AStarTiles.__name__ = true;
    this.AStarTiles.prototype = 
    {
     /**
      * Set the heuristic to compute cost between two nodes
      * 
      * @param f : Function - Function reference that takes a current node and a target node as arguments, i.e. (node, target) and returns a numerical cost metric.
      */
      set_heuristic: function(f)
      {
        if( f != null )
          this._heuristic = f;
      }
    
     /**
      * Find the optimal path from a specified start node to a specified target node across the supplied grid
      * 
      * @param grid : Grid2D - Reference to a 2D grid of TileNodes with start and target nodes pre-set.  All tile characteristics should be set in advance.  This is analogous
      * to setting up a Graph of Waypoints for the A* algorithm with waypoints.
      * 
      * @return Array - A* path or a zero-length array if a path does not exist.
      */
      , findPath: function(_grid)
		  {
			  this._openList.length   = 0;
			  this._closedList.length = 0;
			
			  // set the internal start/target node references
			  this._startNode  = _grid.get_startNode();
			  this._targetNode = _grid.get_targetNode();
			
			  // set the f/g/h properties
			  this._startNode.g = 0;
			  this._startNode.h = this._heuristic(this._startNode, this._targetNode);
			  this._startNode.f = this._startNode.g + this._startNode.h;
			
			  var node = this._startNode;
			  
			  var i,j;
			  var iStart, iEnd;
			  var jStart, jEnd;
			  var temp, cost;
			  var f, g, h;
			  
			  while( node != this._targetNode )
			  {
				  iStart = Math.max(0, node.row-1);
				  iEnd   = Math.min(_grid.get_numRows()-1, node.row+1);
			  
				  jStart = Math.max(0, node.col-1);
				  jEnd   = Math.min(_grid.get_numCols()-1, node.col+1);
				
				  for( i=iStart; i<=iEnd; ++i )
				  {
					  for( j=jStart; j<=jEnd; ++j)
					  {
						  temp = _grid.get_Node(i, j);
						  
						  // compensate for going around the edges of an unreachable region
						  if( temp == node || !temp.reachable || !_grid.get_Node(node.row, temp.col).reachable || !_grid.get_Node(temp.row, node.col).reachable )
							  continue;
						
						  cost = 1.0;
						  if( !( (node.row == temp.row) || (node.col == temp.col) ) )
							  cost = Math.SQRT2;
						  
						  g = node.g + cost*temp.multiplier;
						  h = this._heuristic(temp, this._targetNode);
						  f = g + h;
						  
						  if( this.__isInOpenList(temp) || this.__isInClosedList(temp) )
						  {
							  if( temp.f > f )
							  {
							    temp.parent = node;
							    
								  temp.f = f;
								  temp.g = g;
								  temp.h = h;
							  }
						  }
						  else
						  {
						    temp.parent = node;
						    
							  temp.f = f;
							  temp.g = g;
							  temp.h = h;
							  
                this._openList.push(temp);
						  }
					  }
				  }
				
				  this._closedList.push(node);
				
				  if( this._openList.length == 0 )
					  return [];
				
				  // an in-line sort-on
				  var args = ["f"];
	        this._openList.sort
	        (
	          function(a,b)
	          {
	            var props = args.slice();
	            var prop  = props.shift();
	            while( a[prop] == b[prop] && props.length ) 
	              prop = props.shift();
	              
	            return a[prop] == b[prop] ? 0 : a[prop] > b[prop] ? 1 : -1;
	           }
	        );

				  node = this._openList.shift();
			  }
			
			  // an optimal path must exist; load it into a return array in the desired order
			  var path = [];
        node     = this._targetNode;
        path.push(node);
        
        while( node != this._startNode )
        {
          node = node.parent;
          path.unshift(node);
        }
			
        return path;
		  }
      
      // internal method, is the node in the open list?
      , __isInOpenList: function(node)
      {
        var i = 0;
        var len = this._openList.length;
        
        for( i=0; i<len; ++i )
        {
          if( this._openList[i] == node )
            return true;
        }
        
        return false;
      }
      
      // internal method, is the node in the closed list
      ,__isInClosedList: function(node)
      {
        var i = 0;
        var len = this._closedList.length;
        
        for( i=0; i<len; ++i )
        {
          if( this._closedList[i] == node )
            return true;
        }
        
        return false;
      }
		
      // internal method so that we have at least one established heuristic
		  , __diagonal: function(node, target)
		  {
		    // TileNodes use a matrix row-column means to define location, so the column index is the x-coordinate and the row index is the y-coordinate for cost heuristics
			  var dx = Math.abs(node.col - target.col);
			  var dy = Math.abs(node.row - target.row);
			  
			  var diagonal = Math.min(dx, dy);
			  var straight = dx + dy;
			  
			  return straight + (Math.SQRT2-2.0)*diagonal;
		  }
	  }
  }
  
  return returnedModule;
});
