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
    * Line Simplification using a recursive implementation of the Douglas-Peuker algorithm.  This is a straightforward implementation of the algorithm that is
    * suitable for polylines common in online applications.
    * 
    * @author Jim Armstrong
    * 
    * @version 1.0
    */
    this.DouglasPeucker = function()
    {
    }
    
    this.DouglasPeucker.__name__ = true;
    this.DouglasPeucker.prototype = 
    {
     /**
      * @param coords:Array - Point collection.  Objects with 'x' and 'y' properties for x- and y-coordiantes
      * 
      * @param tolerance : Int - Pixel distance pointsUsed to determine if all points in a test interval can be removed and replaced with a line segment between the first 
      * and last points of the test interval
      * 
      * @param stages : Int - Number of stages - usually small, but at least 1.  This controls the amount of recursing of the core DP algorithm.  The single-stage algorithm
      * is a very efficient way to get a workable, although less optimal line simplification.
      * 
      * @return Array - Simplified Point collection.  There is no error-testing for performance reasons.  Note that this is a compression algorithm; it reduces the number
      * of original points.
      */
      simplify(coords, tol, stages) 
      {
        var tolSq = tol*tol;
		    var pv    = 0;
		    var n     = coords.length;
		    
		    var simplify   = [];
		    var pointsUsed = [];
		    
		    simplify.push( coords[0] );
		    var i;
		    var dx, dy, dv2;
		    
		    for( i=1; i<n; ++i) 
		    {
		      dx = coords[i].x - coords[pv].x;
          dy = coords[i].y - coords[pv].y;
          
          dv2 = dx*dx + dy*dy;
          
			    if( dv2 >= tolSq ) 
				  {
			      simplify.push( coords[i] );
			      pv = i;
				  }
		    }
		
		    if( pv < n-1 ) 
			    simplify.push( coords[n-1] );

		    if( stages > 1 ) 
		    {
		      len = simplify.length;
		      
			    pointsUsed[0] = true;
			    for( i=1; i<len-1; ++i )
			      pointsUsed[i] = false;
			    
			    pointsUsed[len-1] = true;
			    
			    this.__dp(simplify, tol, 0, simplify.length-1, pointsUsed);
			    
			    var coords2 = [];
			    len = pointsUsed.length;
			    for( i=0; i<len; ++i) 
			    {
				    if( pointsUsed[i] ) 
					    coords2.push( simplify[i] );
				  }
			    
			    return coords2;
			  }
        else 
			    return simplify;
		  }
	  
      // internal method - core DP algorithm
	    , __dp: function(coords, tol, start, end, pointsUsed) 
	    {
		    if( end <= start+1 ) 
		      return;
	     
		    var maxi  = start;
		    var maxd2 = 0;
		    var tolSq = tol*tol;
		    var l0    = coords[start];
		    var l1    = coords[end];
		    var u     = {x:l1.x-l0.x, y:l1.y-l0.y};
		    
		    var cu    = u.x*u.x + u.y*u.y;
		  
	      var i, w, cw, dv2;
	      var b, pb, ub;
	      var dx, dy;
		    for( i=start; i<end; ++i) 
		    {
			    w  = {x:coords[i].x-l0.x, y:coords[i].y-l0.y};
			    cw = w.x*u.x + w.y*u.y;
			  
			    if( cw <= 0 ) 
			    {
				    dx = coords[i].x - l0.x;
		        dy = coords[i].y - l0.y;
		        
		        dv2 = dx*dx + dy*dy;
			    }
			    else if( cu <= cw ) 
			    {
			      dx = coords[i].x - l1.x;
            dy = coords[i].y - l1.y;
            
            dv2 = dx*dx + dy*dy;
			    }  
			    else
			    {
				    b   = cw/cu;
				    ub  = {x:u.x*b, y:u.y*b};
				    pb  = {x:l0.x+ub.x, y:l0.y+ub.x};
				    
				    dx = coords[i].x - pb.x;
            dy = coords[i].y - pb.y;
            
            dv2 = dx*dx + dy*dy;
			    }
			  
			    if( dv2 > maxd2 ) 
				  {
            maxi  = i;
			      maxd2 = dv2;
				  }
		    }
		
        if( maxd2 > tolSq ) 
        {
			    pointsUsed[maxi] = true;
			  
			    this.__dp(coords, tol, maxi, end, pointsUsed);
			    this.__dp(coords, tol, start, maxi, pointsUsed);
		    }
		
        return;
	    }
    }
  }
  
  return returnedModule;
});