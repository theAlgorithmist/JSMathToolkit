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

define(['../utils/Gauss', '../utils/TWBRF', '../utils/Solve2x2'], function (gaussModule, rootModule, solveModule) 
{
  var returnedModule = function () 
  {
    // reference to a Gauss-Legendre integration instance for frequent re-computation of arc-length
    var GaussRef = new gaussModule;
    var __integral = new GaussRef.Gauss();
    
    // root-finder reference for natural parameter at normalized-arc length problem
    var RootRef = new rootModule();
    var __root = new RootRef.TWBRF();
    
    // 2x2 equation solver
    var SolveRef = new solveModule();
    var __solver = new SolveRef.Solve2x2();

   /**
    * CubicBezier is the algorithmic representation of a parameterized, quadratic Bezier curve that passes through two points (x0,y0) and (x1,y1) with two middle control points
    * (cx,cy) and (cx1, cy1).  The curve is traced by a natural parameter in [0,1].
    * 
    * @author Jim Armstrong (www.algorithmist.net)
    * 
    * @version 1.0
    * 
    */

    this.CubicBezier = function()
    {  
      // geometric constraints
      this._x0  = 0;
      this._y0  = 0;
      this._cx  = 0;
      this._cy  = 0;
      this._cx1 = 0;
      this._cy1 = 0;
      this._x1  = 0;
      this._y1  = 0;
      
      // cubic coefficient values
      this.__c0X = 0;
      this.__c0Y = 0;
      this.__c1X = 0;
      this.__c1Y = 0;
      this.__c2X = 0;
      this.__c2Y = 0;
      this.__c3X = 0;
      this.__c3Y = 0;
      this.__s   = 0;             // most recently requested normalized arc-length
      this.__t   = 0;             // natural parameter at that normalized arc length;
      this.__length = -1;         // arc length at 0
      
      this._invalidated = true;   // true if parameter settings invalide coefficients
      
      // bisection interval bounds
      this._left;
      this._right;
      
      this._bisectLimit = 0.05;   // bisection tolerance
    }
    
    this.CubicBezier.__name__ = true;
    this.CubicBezier.prototype = 
    {
     /**
      * Return the order of this planar curve
      * 
      * @return Int - Order of the curve, which is 3 for a cubic
      */
      getOrder: function()
      {
	      // third-order curve
        return 3;
      }
  
     /**
      * Access the x0 coordinate
      * 
      * @return Float - x0 coordinate value
      */
      , get_x0: function()
      {
        return this._x0;
      }
      
     /**
      * Access the y0 coordinate
      * 
      * @return Float - y0 coordinate value
      */
      , get_y0: function()
      {
        return this._y0;
      }
      
     /**
      * Access the cx coordinate
      * 
      * @return Float - cx coordinate value
      */
      , get_cx: function()
      {
        return this._cx;
      }
      
     /**
      * Access the cy coordinate
      * 
      * @return Float - cy coordinate value
      */
      , get_cy: function()
      {
        return this._cy;
      }
      
      /**
       * Access the cx1 coordinate
       * 
       * @return Float - cx1 coordinate value
       */
       , get_cx1: function()
       {
         return this._cx1;
       }
       
      /**
       * Access the cy1 coordinate
       * 
       * @return Float - cy1 coordinate value
       */
       , get_cy1: function()
       {
         return this._cy1;
       }
      
     /**
      * Access the x1 coordinate
      * 
      * @return Float - c1 coordinate value
      */
      , get_x1: function()
      {
        return this._x1;
      }
      
     /**
      * Access the y1 coordinate
      * 
      * @return Float - y1 coordinate value
      */
      , get_y1: function()
      {
        return this._y1;
      }
      
     /**
      * Assign the x0 coordinate
      * 
      * @param value : Float - x0 coordinate value
      * 
      * @return Nothing
      */
      , set_x0: function(value)
      {
	      this._x0          = value;
	      this._invalidated = true;
      }
      
     /**
      * Assign the x1 coordinate
      * 
      * @param value : Float - x0 coordinate value
      * 
      * @return Nothing
      */
      , set_x1: function(value)
      {
	      this._x1          = value;
	      this._invalidated = true;
      }
  
     /**
      * Assign the cx coordinate
      * 
      * @param value : Float - cx coordinate value
      * 
      * @return Nothing
      */
      , set_cx: function(value)
      {
	      this._cx          = value;
	      this._invalidated = true;
      }
  
     /**
      * Assign the cy coordinate
      * 
      * @param value : Float - cy coordinate value
      * 
      * @return Nothing
      */
      , set_cy: function(value)
      {
        this._cy          = value;
        this._invalidated = true;
      }
      
     /**
      * Assign the cx1 coordinate
      * 
      * @param value : Float - cx1 coordinate value
      * 
      * @return Nothing
      */
      , set_cx1: function(value)
      {
        this._cx1          = value;
        this._invalidated = true;
      }
   
     /**
      * Assign the cy1 coordinate
      * 
      * @param value : Float - cy1 coordinate value
      * 
      * @return Nothing
      */
      , set_cy1: function(value)
      {
        this._cy1          = value;
        this._invalidated = true;
      }
      
     /**
      * Assign the y0 coordinate
      * 
      * @param value : Float - y0 coordinate value
      * 
      * @return Nothing
      */
       , set_y0: function(value)
       {
         this._y0          = value;
         this._invalidated = true;
       }
   
     /**
      * Assign the y1 coordinate
      * 
      * @param value : Float - y1 coordinate value
      * 
      * @return Nothing
      */
      , set_y1: function(value)
      {
        this._y1          = value;
        this._invalidated = true;
      }
  
     /**
      * Access Bezier curve x-coordinate at the specified natural parameter value
      * 
      * @param t : Float - Natural parameter value, typically in [0,1], although values outside that range are acceptable
      * 
      * @return Float - x-coordinate of Bezier curve at the specified parameter value
      */
      , getX: function(t)
      {
	      if( this._invalidated )
	        this.update();
	  
	      return this.__c0X + t*(this.__c1X + t*(this.__c2X + t*this.__c3X));
      }
     
     /**
      * Quick means to assign cubic bezier geometric constraints from an Object
      * 
      * @param _c : Object - Object with x0, y0, cx, cy, cx1, cy1, x1, and y1 properties
      * 
      * @return Nothing - Internal parameters are assigned directly from the Object.  There is no error checking.
      */
      , fromObject(_c)
      {
        this._x0  = _c.x0;
        this._y0  = _c.y0;
        this._cx  = _c.cx;
        this._cy  = _c.cy;
        this._cx1 = _c.cx1;
        this._cy1 = _c.cy1;
        this._x1  = _c.x1;
        this._y1  = _c.y1;
        
        this._invalidated = true;
      }
      
     /**
      * Quick means to assign internal geometric constraints to an Object
      * 
      * @return : Object - Object with x0, y0, cx, cy, cx1, cy1, x1, and y1 properties
      * 
      */
      , toObject()
      {
        return {x0:this._x0, y0:this._y0, cx:this._cx, cy:this._cy, cx1:this._cx1, cy1:this._cy1, x1:this._x1, y1:this._y1};
      }
      
     /**
      * Access the cubic bezier coefficients
      * 
      * @return Object c0x, c0y, c1x, c1y, c2x, c2y, c3x and c3y properties contain the cubic coefficients of the Bezier in polynomial form
      */
      , getCoef()
      {
        if( this._invalidated )
          this.update();
        
        return {c0x:this.__c0X, c0y:this.__c0Y, c1x:this.__c1X, c1y:this.__c1Y, c2x:this.__c2X, c2y:this.__c2Y, c3x:this.__c3X, c3y:this.__c3Y };
      }
  
     /**
      * Access Bezier curve y-coordinate at the specified natural parameter value
      * 
      * @param t : Float - Natural parameter value, typically in [0,1], although values outside that range are acceptable
      * 
      * @return Float - y-coordinate of Bezier curve at the specified parameter value
      */
      , getY: function(t)
      {
	      if( this._invalidated )
          this.update();
      
        return this.__c0Y + t*(this.__c1Y + t*(this.__c2Y + t*this.__c3Y));
      }
  
     /**
      * Access x-coordinate of first derivative at the specified natural parameter value
      * 
      * @param t : Float - Natural parameter value, typically in [0,1], although values outside that range are acceptable
      * 
      * @return Float - x-coordinate of Bezier first derivative at the specified parameter value
      */
      , getXPrime: function(t)
      {
	      return this.__c1X + 2*t*this.__c2X + 3*t*t*this.__c3X;
      }
  
     /**
      * Access y-coordinate of first derivative at the specified natural parameter value
      * 
      * @param t : Float - Natural parameter value, typically in [0,1], although values outside that range are acceptable
      * 
      * @return Float - y-coordinate of Bezier first derivative at the specified parameter value
      */
      , getYPrime: function(t)
      {
        return this.__c1Y + 2*t*this.__c2Y + 3*t*t*this.__c3Y;
      }
      
      /**
      * Interpolate four points with a cubic Bezier using chord-length parameterization
      *
      * @param _points: Array - Array of four Points. 
      *
      * @return Array - [t1, t2], computed natural parameter values for the interior geometric constraints, i.e. (cx, cy) and (cx1, cy1).  The internal geometric constraints of the 
      * cubic Bezier are computed such that the curve now interpolates the four input points.  No action is taken if the length of the array is less than 4.
      *
      */
      , interpolate: function(_points)
      {
        if( _points.length < 4 )
          return;
        
        // no error-checking ... you break it, you buy it.
        var p0 = points[0];
        var p1 = points[1];
        var p2 = points[2];
        var p3 = points[3];
        
        x0 = p0.x;
        y0 = p0.y;
        x1 = p3.x;
        y1 = p3.y;
        
        // currently, this method auto-parameterizes the curve using chord-length parameterization.  A future version might allow inputting the two t-values, but this is more
        // user-friendly (what an over-used term :) 
        var deltaX = p1.x - p0.x;
        var deltaY = p1.y - p0.y;
        var d1     = Math.sqrt(deltaX*deltaX + deltaY*deltaY);
        
        deltaX = p2.x - p1.x;
        deltaY = p2.y - p1.y;
        var d2 = Math.sqrt(deltaX*deltaX + deltaY*deltaY);
        
        deltaX = p3.x - p2.x;
        deltaY = p3.y - p2.y;
        var d3 = Math.sqrt(deltaX*deltaX + deltaY*deltaY);
        
        var d  = d1 + d2 + d3;
        var t1 = d1/d;
        var t2 = (d1+d2)/d;
        
        // there are four unknowns (x- and y-coords for P1 and P2), which are solved as two separate sets of two equations in two unknowns
        var t12 = t1*t1;
        var t13 = t1*t12;
        
        var t22 = t2*t2;
        var t23 = t2*t22;
        
        // x-coordinates of P1 and P2 (t = t1 and t2) - exercise: eliminate redudant computations in these equations
        var a11 = 3*t13 - 6*t12 + 3*t1;
        var a12 = -3*t13 + 3*t12;
        var a21 = 3*t23 - 6*t22 + 3*t2;
        var a22 = -3*t23 + 3*t22;
        
        var b1 = -t13*x1 + x0*(t13 - 3*t12 + 3*t1 - 1) + p1.x;
        var b2 = -t23*x1 + x0*(t23 - 3*t22 + 3*t2 - 1) + p2.x;
        
        // beware nearly or exactly co-incident interior interpolation points
        var p = __solver.solve(a11, a12, a21, a22, b1, b2);
        if( __solver.determinant < 0.000001 )
        {
          // degenerates to a parabolic interpolation
          var t1m1  = 1.0-t1;
          var tSq   = t1*t1;
          var denom = 2.0*t1*t1m1;

          // to do - handle case where this degenerates into all overlapping points (i.e. denom is numerically zero)
          this._cx = (p1.x - t1m1*t1m1*x0 - tSq*p2.x)/denom;
          this._cy = (p1.y - t1m1*t1m1*y0 - tSq*p2.y)/denom;
          
          this._cx1 = cx;
          this._cy1 = cy;
          
          this._invalidate = true;
           
          return [t1, t1];
        }
        else
        {
          this._cx = p.x
          this._cx1 = p.y;
        }
        
        // y-coordinates of P1 and P2 (t = t1 and t2)      
        b1 = -t13*y1 + y0*(t13 - 3*t12 + 3*t1 - 1) + p1.y;
        b2 = -t23*y1 + y0*(t23 - 3*t22 + 3*t2 - 1) + p2.y;
        
        // resolving with same coefficients, but new RHS
        p   = _solver.solve(a11, a12, a21, a22, b1, b2, 0.00001, true);
        this._cy  = p.x
        this._cy1 = p.y;

        this._invalidated = true;
      }
      
     /**
      * Return the natural parameter(s) at the specified x-coordinate
      * 
      * @param _x : Float - x-coordinate value inside the range covered by the Bezier in [0,1]; that is there must exist t in [0,1] such that Bx(t) = _x. 
      * 
      * @return Array - Natural parameters at the specified x-coordinate.  This return array contains either one, two, or three t-values.  There are 
      * issues with curves that are exactly or nearly (for numerical purposes) vertical in which there could theoretically be an infinite number of 
      * y-coordinates for a single x-coordinate.  This method does not work in such cases, although compensation might be added in the future.
      */
      , getTAtX: function(_x)
      {
        // the necessary y-coordinates are the intersection of the curve with the line x = _x.  The curve is generated in the
        // form c0 + c1*t + c2*t^2 + c3*t^3, so the intersection satisfies the equation 
        // Bx(t) = _x or Bx(t) - _x = 0, or c0x-_x + c1x*t + c2x*t^2 + c3x*t^3 = 0.
        if( this._invalidated )
          this.update();
         
        // Find one root - any root - then factor out (t-r) to get a quadratic poly. for the remaining roots
        var parent = this;
        var f = function(_t) 
        { 
          return + parent.__c0X + _t*(parent.__c1X + _t*(parent.__c2X + _t*(parent.__c3X))) - _x; 
        }
        f.bind(this);
            
        // some curves that loop around on themselves may require bisection
        this._left        = 0;
        this._right       = 1;
        this.__bisect(f, 0, 1);
           
        // experiment with tolerance - but not too tight :)  
        var t0   = __root.findRoot(this._left, this._right, f, 0.0001);
        var eval = Math.abs(f(t0));
        if( eval > 0.001 )
          return [];   // compensate in case method quits due to error
         
        var result = [];
        if( t0 <= 1 )
          result.push( t0 );  
        
        // Factor theorem: t-r is a factor of the cubic polynomial if r is a root.  Use this to reduce to a quadratic poly.
        // using synthetic division
        var a = this.__c3X;
        var b = t0*a+this.__c2X;
        var c = t0*b+this.__c1X;
         
        // process the quadratic for the remaining two possible roots
        var d = b*b - 4*a*c;
        if( d < 0 )
        {
          return result;
        }
         
        d      = Math.sqrt(d);
        a      = 1/(a + a);
        var t1 = (d-b)*a;
        var t2 = (-b-d)*a;
         
        if( t1 >= 0 && t1 <=1 )
          result.push( t1 );
           
        if( t2 >= 0 && t2 <=1 )
          result.push( t2 );
           
        return result;
      }
  
      , // internal method - bisect the specified range to isolate an interval with a root.
      __bisect: function(_f, _l, _r)
      {
        if( Math.abs(_r-_l) <= this._bisectLimit )
        {
          return;
        }
          
        var left   = _l;
        var right  = _r;
        var middle = 0.5*(left+right);
        if( _f(left)*_f(right) <= 0 )
        {
          this._left  = left;
          this._right = right;
          return;
        }
        else
        {
          this.__bisect(_f, left, middle);
          this.__bisect(_f, middle, right);
        }
      }
      
    /**
     * Return the total arc length of this Bezier
     * 
     * @return Float - Arc length of the cubic Bezier
     */
     , length()
     {
       if( this._invalidated || this.__length == -1 )
       {
         this.update();
   
         var parent    = this;
         var integrand = function(_t)
         {
           var xPrime = parent.__c1X + 2*_t*parent.__c2X + 3*_t*_t*parent.__c3X;
           var yPrime = parent.__c1Y + 2*_t*parent.__c2Y + 3*_t*_t*parent.__c3Y;
           
           return Math.sqrt( xPrime*xPrime + yPrime*yPrime );
         }
         integrand.bind(this);
       
         var s = Math.min(t,1);
         this.__length = __integral.eval( integrand, 0, s, 6 );
       }
       
       return this.__length;
     }
  
    /**
     * Return the arc length at the specified natural parameter value
     * 
     * @param t : Float - Natural parameter value (t)
     * 
     * @return Float - Arc length at the specified natural parameter 
     */
      , lengthAt: function(t)
      {
	      if( this._invalidated )
	        this.update();
	
	      if( t <= 0 )
	        return 0;
	  
	      var parent    = this;
        var integrand = function(_t)
        {
          var xPrime = parent.__c1X + 2*_t*parent.__c2X + 3*_t*_t*parent.__c3X;
          var yPrime = parent.__c1Y + 2*_t*parent.__c2Y + 3*_t*_t*parent.__c3Y;
            
          return Math.sqrt( xPrime*xPrime + yPrime*yPrime );
        }
        integrand.bind(this);
        
        var s = Math.min(t,1);
	      return __integral.eval( integrand, 0, s, 6 );
      }
      
    /**
     * Return the natural parameter at the specified (normalized) arc length
     * 
     * @param _s : Float - Normalized arc length (fraction along the curve) in [0,1]
     * 
     * @return Float - Natural parameter, t, at the fraction of arc length (t = 0 at _s = 0 and t = 1 at _s = 1)
     */
      , tAtLength(_s)
      {
        var s = Math.max(0,_s);
        s     = Math.min(s, 1);
        
        if( s == 0 )
        {
          this.__s = this.__t = 0;
          return 0;
        }
        
        if( s == 1 )
        {
          this.__s = this.__t = 1;
          return 1;
        }
        
        // total arc length for this quad.
        var __total   = this.length();
        __total       = __total == 0 ? 0 : 1/__total;
        this._invalidated = false;
          
        var parent = this;
        var integrand = function(_t)
        {
          var xPrime = parent.__c1X + 2*_t*parent.__c2X + 3*_t*_t*parent.__c3X;
          var yPrime = parent.__c1Y + 2*_t*parent.__c2Y + 3*_t*_t*parent.__c3Y;
          
          return Math.sqrt( xPrime*xPrime + yPrime*yPrime );
        }
        integrand.bind(this);
        
        // evaluate the function f(t) = L(t)/S - s = 0 for t (S = total arc length, s = input normalized arc length)
        var __f = function(t)
        {
          return __integral.eval(integrand, 0, t, 8)*__total - s;
        };
        __f.bind(this);
        
        // the name of the game is to quickly get an interval containing the arc length, then let TWBRF do its work; the new __t value is in either
        // [0,__t) or (__t,1] depending on whether or not _s > __s or _s < __s.
        var __left  = 0;
        var __right = 1;
        
        if( s > this.__s )
        {
          // moving uniformly forward in arc-length is the most expected use case
          __left = this.__t + 0.001;
        }
        else
        {
          this.__right = this.__t - 0.001;
        }
        
        // because of the non-decreasing relationship between the natural parameter and normalized arc length, we know that the t-parameter corresponding
        // to the requested s is in the interval [left, right], provided the delta between subsequent requests for s is sufficiently large for the hardcoded
        // delta-t (that's the trick in this approximation scheme).
        var t = __root.findRoot(__left, __right, __f, 0.001);
        if( t >= 0 && t <= 1 )
        {
          this.__s = s;
          this.__t = t;
        }
        else
          t = 0;
        
        return  t;
      }
  
      // internal method - compute quad. Bezier coefficients
      , computeCoef: function()
      {
        this.__c0X = this._x0;
        this.__c0Y = this._y0;

        var dX     = 3.0*(this._cx-this._x0);
        var dY     = 3.0*(this._cy-this._y0);
        this.__c1X = dX;
        this.__c1Y = dY;

        var bX     = 3.0*(this._cx1-this._cx) - dX;
        var bY     = 3.0*(this._cy1-this._cy) - dY;
        this.__c2X = bX;
        this.__c2Y = bY;
         
        this.__c3X = this._x1 - this._x0 - dX - bX;
        this.__c3Y = this._y1 - this._y0 - dY - bY;
      }
  
      // internal method - update coefficients and arc length 
      , update: function()
      {
	      this.computeCoef();
	
	      var parent = this;
	      var integrand = function(_t)
	      {
	        var xPrime = parent.__c1X + 2*_t*parent.__c2X + 3*_t*_t*parent.__c3X;
          var yPrime = parent.__c1Y + 2*_t*parent.__c2Y + 3*_t*_t*parent.__c3Y;
	          
	        return Math.sqrt( xPrime*xPrime + yPrime*yPrime );
	      }
	      integrand.bind(this);
	      
        this._length = __integral.eval( integrand, 0, 1, 8 );
	      this._invalidated = false;
      }
    }
  }
  
  return returnedModule;
});
