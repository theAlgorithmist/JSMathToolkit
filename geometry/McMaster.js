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
    * The McMaster slide averaging algorithm.  This is a straightforward implementation that is suitable for polylines common in online applications.
    * 
    * @author Jim Armstrong
    * 
    * @version 1.0
    */
    this.McMaster = function()
    {
    }
    
    this.McMaster.__name__ = true;
    this.McMaster.prototype = 
    {
     /** 
      * Simplify the polyline, although this is largely for an element of compatibility with other line-simplification algorithms.  This is not a compression algorithm;
      * it is a smoothing algorithm.  The total number of points remains unchanged
      * 
      * @param points : Array - Point collection of Objects with 'x' and 'y' properties that represent the (x,y) coordinates of each point
      * 
      * @return Array - Simplified (actually smoothed) point collection.  This is not a compression algorithm.
      */
      simplify: function(points)
      {
		    var simplify = [];
		    var len      = points.length;
		    if( len < 5 )
		      return points;
		  
		    var j, avX, avY;
		    var i = len;
		    while( i-- )
		    {
			    if( i==len-1 || i==len-2 || i==1 || i==0 )
				    simplify[i] = { x:points[i].x, y:points[i].y };
          else
			    {
				    j   = 5;
				    avX = 0; 
				    avY = 0;
				    while( j-- )
				    {
					    avX += points[i+2-j].x; 
					    avY += points[i+2-j].y;
				    }
				    
				    avX *= 0.2; 
				    avY *= 0.2;
				    simplify[i] = {x:0.5*(points[i].x+avX), y:0.5*(points[i].y+avY)};
			    }
		    } 
		  
		    return simplify;
	    }
    }
  }
  
  return returnedModule;
});
    
	
	



