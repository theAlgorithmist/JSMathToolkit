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
	  * This should be called a game tile, but in A* parlance, it's a Node.  So, we'll split the difference and call it a TileNode.
	  * 
	  * @author Jim Armstrong (www.algorithmist.net)
	  * 
	  * @version 1.0
	  * 
	  * @return Nothing - This is largely a placeholder for values/functions/etc important to a tile.  There is no post-construction error-checking for performance reasons,
	  * so you break it, you buy it!
	  */
    this.TileNode = function(rowVal, colVal)
    {
      // coordinates in the grid (row/col)
		  this.row = !isNaN(rowVal) && rowVal >= 0 ? rowVal : 0;
		  this.col = !isNaN(colVal) && colVal >= 0 ? colVal : 0;
		  
		  // this TileNode's id and value properties
		  this.id    = "";
		  this.value = 0;
		  
		  // multiplier onto the cost to visit this node by any distance-based metric.
		  this.multiplier = 1.0;
   
      // is the node reachable?
      this.reachable = true;
   
      // This TileNode's parent
      this.parent = null;
   
      // A* functions
		  this.f = 0;
		  this.g = 0;
		  this.h = 0;
	  }
  }
  
  return returnedModule;
});