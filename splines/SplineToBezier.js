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

define(['../planarCurves/QuadBezier', '../utils/Gauss', '../utils/BezierUtils', '../planarCurves/CubicBezier'], function (QuadBezierModule, GaussModule, BezierUtilsModule, CubicBezierModule) 
{
  var returnedModule = function () 
  {
    var quadBezierRef  = new QuadBezierModule();
    var gaussRef       = new GaussModule();
    var bezierUtilsRef = new BezierUtilsModule();
    var cubicBezierRef = new CubicBezierModule();
    
   /**
    * Approximate a spline curve with a sequence of quadratic Beziers.  Instead of trying to minimize the total number of quad. bezier segments, the algorithm 
    * produces an integral number of quads between knots, which can be useful in many applications such as custom charts.
    * 
    * @author Jim Armstrong (www.algorithmist.net)
    * 
    * @version 1.0
    * 
    */
    this.SplineToBezier = function() 
    {
      this.ONE_THIRD = 1/3;
      this.ZERO_TOL  = 0.00000001;
      this.LARGE     = 1/this.ZERO_TOL;
  
      this.__count = 0;                                   // number of knots in the spline
      this.__knots = [];                                  // (array) knot collection for the spline
      this.__spline;                                      // spline reference for numerical integration
      this.__bezier   = new quadBezierRef.QuadBezier();   // quad bezier instance for numerical integration
      this.__integral = new gaussRef.Gauss();             // numerical integration by gaussian quadrature
    }
      
    this.SplineToBezier.__name__ = true;
    this.SplineToBezier.prototype = 
    {
     /**
      * Convert a cartesian (or limited parametric) spline to a sequence of quadratic Beziers.  This approximation of the original spline may be used to
      * draw or animate the spline in an environment that draws quadratic beziers as a primitive.
      * 
      * @param _spline: Spline Reference to a cartesian spline such as natural cubic spline
      * 
      * @param _tol: Number - closeness tolerance for quad. bezier approximation.  Values of 0.1 or less are recommended and this value defaults to 0.05.
      * 
      * @return Object - The 'quads' property is an array of Quadratic Bezier data objects (QuadData).  The 'index' property references an array of index values that
      * map the beginning of the i-th spline segment to the j-th quad bezier.  For example, the first segment begins at quad[0].  The second segment might begin at
      * quad[3], the following segment at quad[6], etc. The QuadData objects contain the quad Bezier control points, x0, y0, cx, cy, and x1, y1 as well as as a 'length' 
      * property, which is the arc length of the quad. Bezier.
      */
      convert: function(_spline, _tol)
      {
        if( !_tol )
          _tol = 0.01;
         
        _tol = Math.max( 0.008, _tol);
        
	      if( _spline == null )
	        return {quads:[], index:[]};
	  
        if( _spline.pointCount() == 0 )
          return {quads:[], index:[]};
      
        if( _spline.getType().toLowerCase() == "cartesian" )
        {
          return this.__cartesianToBezier(_spline, _tol);
        }
        else if( _spline.getType().toLowerCase() == "cubicbezier")
        {
          return this.__cubicBezierToQuad(_spline, _tol);
        }
        else if( _spline.getType().toLowerCase() == "catmullrom" )
        {
          return this.__catmullRomToQuad(_spline, _tol);
        }
        else
        {
          return {quads:[], index:[]};
        }
      }
    
      // internal method - approximate a catmull rom spline by a sequence of quads
      , __catmullRomToQuad(_spline, _tol)
      {
        // Each cubic Catmull Rom segment can be converted to a cubic Bezier segment by means of the conversion matrix
        //
        //    0       1       0       0
        //  -1/6      1      1/6      0
        //    0      1/6      1     -1/6
        //    0       0       1       0
        
        var ONE_SIXTH = 1.0/6.0;
        var segments  = _spline.pointCount()-1;
        var i;
        
        var bezierUtils = new bezierUtilsRef.BezierUtils();
        var bezier      = new cubicBezierRef.CubicBezier();
        var q    = [];
        var quad = [];
        var indx = [0];
        
        var bx, by, dx, dy;
        var x0, y0, cx, cy, cx1, cy1, x1, y1;
        
        var points = _spline.getPoints();
        
        for( i=1; i<=segments; ++i )
        {
          var cvt = {};
          
          cvt.x0 = points[i].x;
          cvt.y0 = points[i].y;
          
          cvt.cx = ONE_SIXTH*(-points[i-1].x + points[i+1].x) + points[i].x; 
          cvt.cy = ONE_SIXTH*(-points[i-1].y + points[i+1].y) + points[i].y; 
          
          cvt.cx1 = ONE_SIXTH*(points[i].x - points[i+2].x) + points[i+1].x;
          cvt.cy1 = ONE_SIXTH*(points[i].y - points[i+2].y) + points[i+1].y;
          
          cvt.x1 = points[i+1].x;
          cvt.y1 = points[i+1].y;
          
          // create a new cubic bezier from the converted cubic segment
          bezier.fromObject( cvt );
          
          q         = bezierUtils.toQuadBezier(bezier, _tol);
          quad      = quad.concat(q);
          indx[i+1] = indx[i] + q.length;
        }
        
        return {quads:quad, index:indx};
      }
      
      // internal method - approximate a cubic bezier spline by a sequence of quads
      , __cubicBezierToQuad(_spline, _tol)
      {
        // for this spline, we know in advance that each segment is a cubic bezier and there is already a utility to approximate a single cubic bezier as a sequence of quads
        var bezierUtils = new bezierUtilsRef.BezierUtils();
        var points      = _spline.pointCount();
        var i, j;
        var q = [];
        var quad = []
        var indx = [0];
        
        for( i=0; i<points-1; ++i)
        {
          bezier    = _spline.getSegment(i);
          q         = bezierUtils.toQuadBezier(bezier, _tol);
          quad      = quad.concat(q);
          indx[i+1] = indx[i] + q.length;  
        }
        
        return {quads:quad, index:indx};
      }
  
      // internal method
      , __cartesianToBezier: function (_spline, _tol)
      {     
        this.__spline = _spline;
	      this.__knots  = _spline.getPoints();
        this.__count  = this.__knots.length;
        var quads     = [];
        var indx      = [];

	      var p;
        if( this.__count == 1 )
        {
          p = this.__knots[0];
          return { quads:[{x0:p.x, y0:p.y, cx:p.x, cy:p.y, x1:p.x, y1:p.y, length:0}], index:[0] };
        }
      
        if( this.__count == 2 )
        { 
          p      = this.__knots[0];
          var x1 = p.x;
          var y1 = p.y;
        
          p      = this.__knots[1];
          var x2 = p.x;
          var y2 = p.y;
        
          return { quads:[{x0:x1, y0:y1, cx:0.5*(x1+x2), cy:0.5*(y1+y2), x1:x2, y1:y2, length:0}], index:[0] };
        }
      
        var q   = [];
        indx[0] = 0;
	
        // process each segment, producing an integral number of quads between each knot.
        var i = 0;
        while( i < this.__count-1 )
        {
          var qSegment = this.__subdivideCartesian(_spline, i, _tol);
          indx[i+1]    = indx[i] + qSegment.length;  
          q            = q.concat(qSegment);
	  
	        i++;
        }
      
        return {quads:q, index:indx};
      }
  
      // internal method
      , __subdivideCartesian: function(_spline, _segment, _tol)
      {   
        var q        = [];
        var complete = [];
        var limit    = 3;
        var finished = false;
      
        var p  = this.__knots[_segment];
        var x0 = p.x;
        var y0 = p.y;
      
	      var x1 = this.__knots[_segment+1].x;
        var y1 = this.__knots[_segment+1].y; 
      
        // slope at each endpoint
        var m1 = _spline.getYPrime(x0);
        var m2 = _spline.getYPrime(x1);
        p      = this.__intersect(x0, y0, m1, x1, y1, m2);
       
        var quad     = {x0:x0, y0:y0, cx:p.x, cy:p.y, x1:x1, y1:y1, length:0};
        q[0]         = quad;
        complete[0]  = false;
      
	      var i;
	      var j;
	  
        // this approach could be implemented recursively, but I think it's more difficult to understand and recursive calls are usually computationally inefficient
        while( !finished )
        {
          // check each quad segment vs. closeness metric unless it's already completed
          i = 0;
          while( i < q.length )
          {
            if( !complete[i] )
            {
              quad           = q[i];
              var isComplete = this.__compare(quad, _spline, _tol);
            
              if( !isComplete )
              {
                // subdivide
                var newX = 0.5*(quad.x0 + quad.x1);
                var newY = _spline.getY(newX);
              
                // slope at each new endpoint
                m1 = _spline.getYPrime(quad.x0);
                m2 = _spline.getYPrime(newX);
                p  = this.__intersect(quad.x0, quad.y0, m1, newX, newY, m2);
       
                var q1 = {x0:x0, y0:y0, cx:p.x, cy:p.y, x1:newX, y1:newY, length:0};
              
                // replace existing quad
                q[i]        = q1;
                complete[i] = false;
      
                m1 = m2;
                m2 = _spline.getYPrime(quad.x1);
                p  = this.__intersect(newX, newY, m1, quad.x1, quad.y1, m2);
       
                var q2 = {x0:newX, y0:newY, cx:p.x, cy:p.y, x1:quad.x1, y1:quad.y1, length:0};
              
                // add to the collective
                q.splice(i+1, 0, q2);
                complete.splice(i+1, 0, false);
                i++;
			  
                if( q.length >= limit )
                {
                  return q;
                }
              }
              else
              {
                complete[i] = true; // finished with this one
              }   
            }
		        i++;
          }
        
          // are we finished - this is the simple and straightforward way to do it
          finished = true;
          j        = 0;
          while( j < complete.length )
          {
            finished = finished && complete[j];
		        j++;
          }
        }
      
        return q;
      }
  
      // compute intersection of line with slope m1 through P0 and line with slope m2 through P2
      , __intersect: function(_p0X, _p0Y, _m1, _p2X, _p2Y, _m2)
      {  
        var px = 0;
        var py = 0;
      
        if( Math.abs(_m1) >= this.LARGE )
        {
          px  = _p0X;
          py  = (Math.abs(_m2) >= this.LARGE) ? _p0Y + 3*(_p0Y-_p0X) : _m2*(_p0X-_p2X)+_p2Y;
        }
        else if( Math.abs(_m2) >= this.LARGE )
        {
          px = _p2X;
          py = (Math.abs(_m1) >= this.LARGE) ? _p2Y + 3*(_p2Y-_p0X) : _m1*(_p2X-_p0X)+_p0Y;
        }
        else
        {   
          if( Math.abs(_m1-_m2) <= 0.05 )
          {
            // lines nearly parallel, meaning no intersection or the difference in slope is sufficiently small that the intersection will be well outside
            // where we would like a control point to be positioned.  This is subject to some future tweaking :)
            px = 0.5*(_p0X+_p2X);
            py = 0.5*(_p0Y+_p2Y);
          }
          else
          {
            var b1 = _p0Y - _m1*_p0X;
            var b2 = _p2Y - _m2*_p2X;
            px            = (b2-b1)/(_m1-_m2);
            py            = _m1*px + b1;
          
            if( this.__spline.getType().toLowerCase() == "cartesian" && (px >= _p2X || px <= _p0X) )
            {
              px = 0.5*(_p0X+_p2X);
              py = 0.5*(_p0Y+_p2Y);
            }
            
            // quad must have unique control points
            if( (Math.abs(px-_p0X) < this.ZERO_TOL && Math.abs(py-_p0Y) < this.ZERO_TOL ) || 
                (Math.abs(px-_p2X) < this.ZERO_TOL && Math.abs(py-_p2Y) < this.ZERO_TOL ) )
            {
              px += 1;
              py += 1;
            }
          }
        }
      
        return {x:px, y:py}
      }
  
      // compare the quad. Bezier approximation to the spline over an interval - return true if the approximation is within tolerance
      , __compare: function(_quad, _spline, _tol, _t1, _t2)
      {
        if( !_t1 )
          _t1 = 0;
        
        if( !_t2 )
          _t2 = 0;
        
        if( _spline.getType().toLowerCase() == "cartesian" )
        { 
          // Bezier arc length - closed-form solution has numberical problems, so use approximation
	
	        this.__bezier.set_x0(_quad.x0);
	        this.__bezier.set_y0(_quad.y0);
	        this.__bezier.set_cx(_quad.cx);
	        this.__bezier.set_cy(_quad.cy);
	        this.__bezier.set_x1(_quad.x1);
	        this.__bezier.set_y1(_quad.y1);
	   
	        var quadLength = this.__bezier.lengthAt(1);
	        
	        var parent = this;
	        // arc-length integrand for spline in cartesian form
	        var cartesianIntegrand = function(_x)
	        {
	          var d = parent.__spline.getYPrime(_x);
	        
	          return Math.sqrt( 1 + d*d );
	        }
	        cartesianIntegrand.bind(this);
          
	        var sLength = this.__integral.eval(cartesianIntegrand, _quad.x0, _quad.x1, 6);
	  
	        _quad.length = quadLength;
	  
          var test1 = Math.abs(sLength-quadLength)/sLength;
	  
	        var newX = 0.5*(_quad.x0 + _quad.x1);
	        var yArr = this.__bezier.getYAtX(newX);
	  
	        var y1 = yArr[0];
	        var y2 = _spline.getY(newX);
	  
	        var test2 = Math.abs(y2 - y1)/Math.abs(y1);
	   
	        return test1 <= _tol && test2 <= 0.15;
        }
        else
        {
          // future development
	        return true;
        }
      }
    }
  }
  
  return returnedModule;
});
