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

define(['../core/Point', '../utils/PointUtils'], function (PointModule, PointUtilsModule) 
{
  var returnedModule = function () 
  {
    var pointRef      = new PointModule();
    var pointUtilsRef = new PointUtilsModule();
    var __pointUtils  = new pointUtilsRef.PointUtils();
    
   /**
    * Convex Hull computations
    * 
    * @author Jim Armstrong
    * 
    * @version 1.0
    */
    this.ConvexHull = function()
    {
	  }
    
    this.ConvexHull.__name__ = true;
    this.ConvexHull.prototype = 
    {
     /**
      * Compute and return the convex hull of an arbitrary point set using Grahmn's Scan
      * 
      * @param points : Array - Collection of arbitrary Point instances in 2D space
      * 
      * @return Array - Collection of Point instances that represent the convex hull of the input point collection.
      */
      grahamScan(points)
      {
        // initial CCW sort with bottom-right starting location
        var index = __pointUtils.bottomRight(points);
        var pt    = points[index];
        var same  = [];
        
        var compareFcn = function(a, b)
        {
          var aR = __pointUtils.angle(pt, a, false);
          var bR = __pointUtils.angle(pt, b, false);
          if( aR > bR ) 
          {
            return -1;
          } 
          else if( aR < bR ) 
          {
            return 1;
          } 
          else 
          {
            same.push(a);
            return 0;
          }
        }
          
        points.sort(compareFcn); 
    
        var i, j, v;
        var len = same.length;
        for( i=0; i<len; ++i )
        {
          v = same[i];
          for( j=0; j<points.length; ++j) 
          {
            if( points[j] == v ) 
            {
              points.splice(j, 1);
              j--;
            }
          }
        }
        
        points.reverse();
        points.unshift( points.pop() );
         
        var hull = [ points[1], points[0] ];
        i        = 2;
        while( i < points.length ) 
        {
          if( !__pointUtils.isLeft( hull[0], hull[1], points[i]) ) 
          {
            hull.unshift( points[i] );
            i++;
          } 
          else 
          {
            hull.splice(0, 1);
          }
        }
        
        hull.push( hull[0] );
        
        return hull;
      }
        
     /**
      * Compute and return the convex hull of a simple polyline using Melkman's algorithm
      * 
      * @param points : Array - Collection of Point instances in 2D space that form a simple polyline
      * 
      * @return Array - Collection of Point instances that represent the convex hull of the input point collection.
      * 
      * Reference: Melkman, A.A., "On line construction of the convex hull of a simple polyline," Information Processing Letters 25, (1987), pp. 11-12.
      */
	    , melkman: function(points) 
	    {
	      if( points.length < 3 )
	        return points.slice();
	      
	      var i, j;
		    var n      = points.length;
		    var tmp    = [];
		    var bottom = n-2;
		    var top    = bottom+3;
		    
		    // init - tmp is a primitive deque
		    tmp[bottom] = points[2];
		    tmp[top]    = points[2];
		    
		    if( __pointUtils.isLeft(points[0], points[1], points[2]) ) 
		    {
			    tmp[bottom+1] = points[0];
			    tmp[bottom+2] = points[1];
		    } 
		    else 
		    {
			    tmp[bottom+1] = points[1];
			    tmp[bottom+2] = points[0];
		    }
		    
		    // process remaining vertices
		    for( i=3; i<n; ++i) 
		    {
		      // hull candidate?
			    if( !__pointUtils.isLeft(tmp[bottom], tmp[bottom+1], points[i])  ||
			        !__pointUtils.isLeft(tmp[top-1] , tmp[top]     , points[i]) ) 
			    {
			
			      while( !__pointUtils.isLeft(tmp[bottom], tmp[bottom+1], points[i]) ) 
			      {
				      ++bottom;
			      }
			      tmp[--bottom] = points[i];
			      
			      while( !__pointUtils.isLeft(tmp[top-1], tmp[top], points[i]) ) 
			      {
				      --top;
			      }
			      tmp[++top] = points[i];
			    }
		    }
		
		    var hull = [];
		    var len  = top-bottom;
		    for( j=0; j<=len; ++j) 
		    {
			    hull[j] = tmp[bottom+j];
		    }
		
		    return hull;
	    }
    }  
  }
  
  return returnedModule;
  
});