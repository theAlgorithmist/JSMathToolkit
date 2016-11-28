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
   * Line simplification via Lang's algorithm
   * 
   * @author Jim Armstrong (www.algorithmist.net)
   * 
   * @version 1.0
   */
    this.Lang = function()
    {
      
    }
    
    this.Lang.__name__ = true;
    this.Lang.prototype = 
    {
     /**
      * Simplify a polyline using the Lang algorithm
      * 
      * @param coords : Array - Point collection.  Objects with 'x' and 'y' properties for x- and y-coordiantes
      * 
      * @param lookAhead : Int - Number of points to look ahead in the simplification process, usually small like 3-5
      * 
      * @param tolerance : Int - Pixel distance used to determine if all points in a test interval can be removed and replaced with a line segment between the first 
      * and last points of the test interval
      * 
      * @return Array - Simplified Point collection.  Depending on the input parameters, a number of successive points 'close' to a line segment are replaced by a line segment in the
      * simplified collection.  Note that this is a compression algorithm as it reduces the number of original points.
      */
      simplify: function(coords, lookAhead, tolerance)
      {
        var len = coords.length;
      
        // make sure there's something to do
        if( len < 2 )
          return coords;
      
        if( lookAhead >= len || lookAhead <= 1 )
          return coords;
      
        var simplify = [];
      
        // first one is easy :)
        simplify.push( {x:coords[0].x, y:coords[0].y} );
      
        // implementation is non-recursive, which is less elegant, but should be faster
        var start    = 0;
        var end      = lookAhead;
        var finished = false;
      
        // tolerance squared is used in the actual test for efficiency
        var tol = tolerance*tolerance;
      
        // P0-P2 is the vector from current start to current end, P1 is the interior point being tested
        var p0x = 0;
        var p0y = 0;
        var p1x = 0;
        var p1y = 0;
        var p2x = 0;
        var p2y = 0;
        var px  = 0;
        var py  = 0;
        var dx  = 0;
        var dy  = 0;
        var d   = 0;
        var t   = 0;
      
        var i, j, k;

        // all points within tolerance?
        var withinTolerance = false;
      
        while( !finished )
        {
          // process current interval; line segment under consideration from p0 to p2 (p1 is always the interior point whose distance to the line is computed)
          i   = start;
          j   = end;
          p0x = coords[i].x;
          p0y = coords[i].y;
          p2x = coords[j].x;
          p2y = coords[j].y;
        
          // from end-1 to start+1, see if any point is outside the tolerance
          withinTolerance = true;
          for( k=end-1; k>start; k-- )
          {
            p1x = coords[k].x;
            p1y = coords[k].y;
          
            // parameter at min-distance intersection
            dx = p2x - p0x;
            dy = p2y - p0y;
            d  = dx*dx + dy*dy;  // |P2 - P0|^2
            t  = ( (p1x-p0x)*(p2x-p0x) + (p1y-p0y)*(p2y-p0y) ) / d;
          
            // distance squared from (px,py) to (p1x,p1y)
            dx = p0x + t*(p2x-p0x) - p1x;
            dy = p0y + t*(p2y-p0y) - p1y;
          
            if( dx*dx + dy*dy > tol )
            {
              withinTolerance = false;
              break;
            }
          }
        
          // next interval
          if( withinTolerance )
          {
            simplify.push( {x:coords[end].x, y:coords[end].y} );
          
            start = end;
            if( start > len-2 )
              finished = true;
            else
              end = Math.min(len-1, start+lookAhead);
          }
          else
          {
            // can we narrow the interval?
            if( end > start+1 )
              end--;
            else
            {
              // next interval
              start = end;
              if( start > len-2 )
                finished = true;
              else
                end = Math.min(len-1, start+lookAhead);
            }
          }
        }
      
        return simplify;      
      }
    }
  }
  
  return returnedModule;
});