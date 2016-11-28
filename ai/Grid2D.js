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

define(['./TileNode'], function (TileNodeModule) 
{
  var returnedModule = function () 
  {
    var tileNodeRef = new TileNodeModule();
    
   /**
    * A 2D grid-based layout of grid tiles or nodes for use in 2D pathfinding with tiles.
    *  
    * @author Jim Armstrong
    * 
    * @version 1.0
    * 
    */
    this.Grid2D = function(rows, cols)
	  {
      // number of rows and columns in the 2D Grid
      this._numRows = !isNaN(rows) && rows >= 0 ? rows : 0;
      this._numCols = !isNaN(cols) && cols >= 0 ? cols : 0;
     
      // the node list for this 2D Grid
      this._nodeList = [];  
      
      // an optional GridView
      this._gridView = null;
	
      // record start and target nodes for any path through the grid
		  this._startNode  = null;
		  this._targetNode = null;
		  
		  // initialize the grid
		  var i, j, t;
		  
		  for( i=0; i<this._numRows; ++i )
      {
        this._nodeList[i] = [];
        for( j=0; j<this._numCols; ++j )
        {
          t = new tileNodeRef.TileNode(i, j);
          t.id = i + " " + j;
          
          this._nodeList[i][j] = t;
        }
      }
	  }
		
    this.Grid2D.__name__ = true;
    this.Grid2D.prototype = 
    {
     /**
      * Access the number of rows
      * 
      * @return Int - Number of rows in the grid
      */
      get_numRows: function()
      {
        return this._numRows
      }

     /**
      * Access the number of rows
      * 
      * @return Int - Number of rows in the grid
      */
      , get_numCols: function()
      {
        return this._numCols;
      }
      
     /**
      * Access the current start node
      * 
      * @return TileNode - Reference to the current start node or null if no start node has been assigned
      */
      , get_startNode: function()
      {
        return this._startNode;
      }
      
     /**
      * Access the current target node
      * 
      * @return TileNode - Reference to the current target node or null if no start node has been assigned
      */
      , get_targetNode: function()
      {
        return this._targetNode;
      }
      
     /**
      * Access the TileNode at the specified x-y grid location
      * 
      * @param i : Int - Row number in the grid
      * 
      * @param j : Int - Column number in the grid
      * 
      * @return TileNode - Reference to tile at the specified location or null if the indices are out of range
      */
      , get_Node: function(i, j)
      {
        if( i >= 0 && i <= this._numRows )
        {
          if( j >= 0 && j <= this._numCols )
            return this._nodeList[i][j];
          else
            return null;
        }
        else
          return null;
      }
      
	   /**
	    * Set a particular tile (or node) in the grid as reachable or not (all tiles are reachable by default, on construction)
	    * 
	    * @param i : Int - row coordinate
	    * 
	    * @param j : Int - column coordinate
	    * 
	    * @param reachable : Boolean - True if the node is reachable.
	    * 
	    * @return Nothing - The tile status is changed provided that the indices are in the proper range.
	    */
      , isReachable: function(i, j, reachable)
      {
        if( i >= 0 && i <= this._numRows )
        {
          if( j >= 0 && j <= this._numCols )
          {
            var tile = this._nodeList[i][j];
            tile.reachable = reachable;
            
            if( this._gridView != null )
              this._gridView.set_cell(i, j, 1);
          }
        }
      }
      
     /**
      * Set a particular tile (or node) in the grid as open or occupied
      * 
      * @param i : Int - row coordinate
      * 
      * @param j : Int - column coordinate
      * 
      * @param occupied : Boolean - True if the node is occupied, false if open.
      * 
      * @return Nothing - The tile visual status is changed provided that the indices are in the proper range and a grid view has been assigned.
      */
      , isOccupied: function(i, j, occupied)
      {
        if( i >= 0 && i <= this._numRows )
        {
          if( j >= 0 && j <= this._numCols )
          {
            var indicator = occupied ? 2 : 0;
            
            if( this._gridView != null )
              this._gridView.set_cell(i, j, indicator);
          }
        }
      }
      
     /**
      * Set a particular tile (or node) in the grid as hazardous or high-cost to cross
      * 
      * @param i : Int - row coordinate
      * 
      * @param j : Int - column coordinate
      * 
      * @param cost : Number - Cost multiplier of the node.
      * 
      * @return Nothing - The tile status is changed provided that the indices are in the proper range.
      */
      , isHazard: function(i, j, cost)
      {
        if( i >= 0 && i <= this._numRows )
        {
          if( j >= 0 && j <= this._numCols )
          {
            var tile = this._nodeList[i][j];
            tile.multiplier = cost;
            
            if( this._gridView != null )
              this._gridView.set_cell(i, j, 3);
          }
        }
      }
      
		 /**
		  * Assign the start node from one of the nodes in the grid
		  * 
		  * @param i : Int - row coordinate
      * 
      * @param j : Int - column coordinate
      * 
      * @return Nothing - The start node is assigned from the specified node or remains unchanged if the indices are invalid
		  */
      , set_startNode: function(i, j)
      {
        if( i >= 0 && i <= this._numRows )
        {
          if( j >= 0 && j <= this._numCols )
          {
            this._startNode = this._nodeList[i][j];
            
            if( this._gridView )
              this._gridView.set_cell(i, j, 4);
          }
        }
      }
      
     /**
      * Assign the target node from one of the nodes in the grid
      * 
      * @param i : Int - row coordinate
      * 
      * @param j : Int - column coordinate
      * 
      * @return Nothing - The target node is assigned from the specified node or remains unchanged if the indices are invalid
      */
      , set_targetNode: function(i, j)
      {
        if( i >= 0 && i <= this._numRows )
        {
          if( j >= 0 && j <= this._numCols )
          {
            this._targetNode = this._nodeList[i][j];

            if( this._gridView )
              this._gridView.set_cell(i, j, 5);
          }
        }
      }
      
     /**
      * Assign an optional GridView to this 2D grid, which allows for tight updates of the view at the expense of the view being tied to EaselJS
      * 
      * @param view : GridView (see core folder)
      * 
      * @return Nothing - A GridView is attached to this grid so that grid updates are automatically reflected in the view
      */
      , set_gridView: function(view)
      {
        if( view != null )
          this._gridView = view;
      }
    }
	}
  
  return returnedModule;
});