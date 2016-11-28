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

define(['../planarCurves/QuadBezier'], function (BezierModule) 
{
  var returnedModule = function () 
  {
    var bezierRef = new BezierModule();
    var __bezier  = new bezierRef.QuadBezier();
    
   /**
    * Non-interpolative, quadratic bezier spline with G-1 continuity at the joins.  This is intended for fast drawing of a smooth curve that roughly approximates
    * a sequence of points.
    * 
    * Credit:  Based on an algorithm that dates back to the 1970s, although exact attribution is unknown.  Private communication, Dr. R. Tennyson is the best 
    * I can do.  My personal contribution is the tension parameter, although the max. tension never pulls the spline to fully linear; it tends towards linear at 
    * the extremes and minimal curvature in the middle segments.
    * 
    * @author Jim Armstrong (www.algorithmist.net)
    * 
    * @version 1.0
    */
    this.QuadBezierSpline = function() 
    {
      this._index;                // index into a segment of the spline
      this._tension = 0.5         // tension parameter in [0,1]
	    this._quads   = [];	        // reference to Bezier2 instances representing each segment
	    this._xcoord  = [];         // reference to x-coordinates of control points
      this._ycoord  = [];         // reference to y-coordinates of control points
    
	    // min/max t-parameters for mapping non-interpolative tension
	    this._tMin = 0;
	    this._tMax = 1;
    
      // invalidation flag
      this._invalidated = true;

      this.clear();
	  }
    
    this.QuadBezierSpline.__name__ = true;
    this.QuadBezierSpline.prototype = 
    {
	   /**
	    * Return the current tension parameter
	    * 
	    * @return Number - Current tension parameter
	    */
      get_tension: function() 
      { 
        return this._tension; 
      }

	   /**
	    * Assign a new tension parameter
	    * 
	    * @param value : Number - New tension value in [0,1]
	    */
      , set_tension: function(value)
      {
        this._tension = isNaN(value) ? this._tension : value;
        this._tension = Math.max(0, this._tension);
        this._tension = Math.min(this._tension, 1);
	    }
    
     /**
      * Access the current point count
      * 
      * @return Int - Number of control points in the spline
      */
      , get_pointCount: function()
      {
        return this._xcoord.length;
      }
   
     /**
      * Access the sequence of quadratic beziers that comprise the spline
      * 
      * @return Array - Sequence of objects whose x0, y0, cx, cy, x1, and y1 properties define the complete spline
      */
      , get_quads: function()
      { 
        if( this._invalidated )
          this.__createQuads();
      
        return this._quads.slice(); 
      }
		
     /**
      * Assign a sequence of control points
      * 
      * @param _x : Array - Array of x-coordinates
      * 
      * @param _y : Array - Array of y-coordinates
      * 
      * @return Nothing - Assigns the internal control points - the number of control points is determined by the length of the x-coordinate array
      */
      , set_controlPoints(_x, _y)
      {
        this._xcoord = _x.slice();
        this._ycoord = _y.slice();
      }

     /**
      * Clear the spline and prepare for new data
      * 
      * @return Nothing
      */
      , clear: function()
	    {
        this._quads.length  = 0;
        this._xcoord.length = 0;
        this._ycoord.length = 0;
      
        this._tension = 0.5; 
        this._tMin    = 0;
        this._tMax    = 1;
         
	      this._invalidated = true;
	    }
	    
      // internal method - create the quad bezier sequence that defines the spline
      , __createQuads: function()
	    {
        var len = this._xcoord.length;
        if( len < 3 )
          return;
        
        if( len == 3 )
        {
          this._quads.push( {x0:this._xcoord[0], y0:this._ycoord[0], cx:this._xcoord[1], cy:this._ycoord[1], x1:this._xcoord[2], y1:this._ycoord[2]} );
          return;
        }
        
	      var l1 = len-1;
	      	
	      // always start from a clean set
	      this._quads.length = 0;
      
        __bezier.set_x0(this._xcoord[0]);
        __bezier.set_y0(this._ycoord[0]);
    
	      var t  = this._tMin + this._tension*(this._tMax-this._tMin);
        var t1 = 1.0-t;
        var pX = (1-t)*this._xcoord[0] + t*this._xcoord[1];
	      var pY = (1-t)*this._ycoord[0] + t*this._ycoord[1];
	      var qX = (1-t1)*this._xcoord[1] + t1*this._xcoord[2];
        var qY = (1-t1)*this._ycoord[1] + t1*this._ycoord[2];
	        
        __bezier.set_cx( 0.5*(this._xcoord[0]+pX) );
        __bezier.set_cy( 0.5*(this._ycoord[0]+pY) );
        
        __bezier.set_x1(pX);
        __bezier.set_y1(pY);
      
        var b = __bezier.toObject();
        this._quads.push( b );
	     
	      var i;
	      for( i=1; i<l1; ++i )
        {
	        pX = qX;
	        pY = qY;
	        qX = (1-t)*this._xcoord[i] + t*this._xcoord[i+1];
	        qY = (1-t)*this._ycoord[i] + t*this._ycoord[i+1];
	         
	        __bezier.set_x0(pX);
	        __bezier.set_y0(pY);
          __bezier.set_cx(this._xcoord[i]);
          __bezier.set_cy(this._ycoord[i]);
          __bezier.set_x1(qX);
          __bezier.set_y1(qY);
            
          b = __bezier.toObject();
          this._quads.push( b );    
	      }
	      
        pX = qX;
        pY = qY;
        qX = this._xcoord[l1];
        qY = this._ycoord[l1];
      
        __bezier.set_x0(pX);
        __bezier.set_y0(pY);
      
        __bezier.set_cx( 0.5*(pX+qX) );
        __bezier.set_cy( 0.5*(pY+qY) );
        
        __bezier.set_x1(qX);
        __bezier.set_y1(qY);
	     
        b = __bezier.toObject();
        this._quads.push( b );    
      
        this._invalidated = false;
      }
    }
  }
  
  return returnedModule;
});