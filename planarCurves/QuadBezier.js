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

define(['../utils/Gauss', '../utils/TWBRF'], function (gaussModule, rootModule) 
{
  var returnedModule = function () 
  {
    // reference to a Gauss-Legendre integration instance for frequent re-computation of arc-length
    var GaussRef = new gaussModule;
    var __integral = new GaussRef.Gauss();
    
    // root-finder reference for natural parameter at normalized-arc length problem
    var RootRef = new rootModule();
    var __root = new RootRef.TWBRF();

   /**
    * QuadBezier is the algorithmic representation of a parameterized, quadratic Bezier curve that passes through two points (x0,y0) and (x1,y1) with a middle control point
    * (cx,cy).  The curve is traced by a natural parameter in [0,1].
    * 
    * @author Jim Armstrong (www.algorithmist.net)
    * 
    * @version 1.0
    * 
    */

    this.QuadBezier = function()
    {  
      // geometric constraints
      this._x0 = 0;
      this._y0 = 0;
      this._cx = 0;
      this._cy = 0;
      this._x1 = 0;
      this._y1 = 0;
      
      // quad. coefficient values
      this.__c0X = 0;
      this.__c0Y = 0;
      this.__c1X = 0;
      this.__c1Y = 0;
      this.__c2X = 0;
      this.__c2Y = 0;
      this.__s   = 0;             // most recently requested normalized arc-length
      this.__t   = 0;             // natural parameter at that normalized arc length;
      this.__normArcLength = 0;   // record input normalized arc length
    }
    
    this.QuadBezier.__name__ = true;
    this.QuadBezier.prototype = 
    {
     /**
      * Return the order of this planar curve
      * 
      * @return Int - Order of the curve, which is 2 for a quadratic
      */
      getOrder: function()
      {
	      // second-order curve
        return 2;
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
      * Assign the x0 coordinate
      * 
      * @param value : Float - x0 coordinate value
      * 
      * @return Nothing
      */
      , set_y0: function(value)
      {
        this._y0          = value;
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
      * Quick means to assign quadratic bezier geometric constraints from an Object
      * 
      * @param _c : Object - Object with x0, y0, cx, cy, x1, and y1 properties
      * 
      * @return Nothing - Internal parameters are assigned directly from the Object.  There is no error checking.
     */
      , fromObject(_c)
      {
        this._x0  = _c.x0;
        this._y0  = _c.y0;
        this._cx  = _c.cx;
        this._cy  = _c.cy;
        this._x1  = _c.x1;
        this._y1  = _c.y1;
         
        this._invalidated = true;
      }
       
     /**
      * Quick means to assign internal geometric constraints to an Object
      * 
      * @return : Object - Object with x0, y0, cx, cy, x1, and y1 properties
      * 
      */
      , toObject()
      {
        return {x0:this._x0, y0:this._y0, cx:this._cx, cy:this._cy, x1:this._x1, y1:this._y1};
      }
  
     /**
      * Access Bezier curve x-coordinate at the specified natural parameter value
      * 
      * @param t : Float - Natural parameter value, typically in [0,1], although values outside that range are acceptable
      * 
      * @return Float - x-coordinate of quadratic Bezier curve at the specified parameter value
      */
      , getX: function(t)
      {
	      if( this._invalidated )
	        this.update();
	  
	      return this.__c0X + t*(this.__c1X + t*(this.__c2X));
      }
  
     /**
      * Access Bezier curve y-coordinate at the specified natural parameter value
      * 
      * @param t : Float - Natural parameter value, typically in [0,1], although values outside that range are acceptable
      * 
      * @return Float - y-coordinate of quadratic Bezier curve at the specified parameter value
      */
      , getY: function(t)
      {
	      if( this._invalidated )
          this.update();
      
        return this.__c0Y + t*(this.__c1Y + t*(this.__c2Y));
      }
  
     /**
      * Access x-coordinate of first derivative at the specified natural parameter value
      * 
      * @param t : Float - Natural parameter value, typically in [0,1], although values outside that range are acceptable
      * 
      * @return Float - x-coordinate of quadratic Bezier first derivative at the specified parameter value
      */
      , getXPrime: function(t)
      {
	 
	      return this.__c1X + 2*t*this.__c2X;
      }
  
     /**
      * Access y-coordinate of first derivative at the specified natural parameter value
      * 
      * @param t : Float - Natural parameter value, typically in [0,1], although values outside that range are acceptable
      * 
      * @return Float - y-coordinate of quadratic Bezier first derivative at the specified parameter value
      */
      , getYPrime: function(t)
      {
        return this.__c1Y + 2*t*this.__c2Y;
      }
      
      /**
      * Interpolate three points with a quadractic Bezier using chord-length parameterization
      *
      * @param _points: Array - Array of three Points. 
      *
      * @return Array - [t1], the natural parameter at the internal geometric constraint, (cx,cy).  This is an array to allow for easy switching between quadratic and
      * cubic Beziers without altering the function signature.
      * 
      * The internal geometric constraints of the quadratic Bezier are computed such that the curve now interpolates the three input points.
      *
      */
      , interpolate: function(_points)
      {
        // compute t-value using chord-length parameterization
        var dX = _points[1].x - _points[0].x;
        var dY = _points[1].y - _points[0].y;
        var d1 = Math.sqrt(dX*dX + dY*dY);
        var d  = d1;

        dX = _points[2].x - _points[1].x;
        dY = _points[2].y - _points[1].y;
        d += Math.sqrt(dX*dX + dY*dY);

        var t = d1/d;

        var t1    = 1.0-t;
        var tSq   = t*t;
        var denom = 2.0*t*t1;

        this._x0 = _points[0].x;
        this._y0 = _points[0].y;

        this._cx = (_points[1].x - t1*t1*_points[0].x - tSq*_points[2].x)/denom;
        this._cy = (_points[1].y - t1*t1*_points[0].y - tSq*_points[2].y)/denom;

        this._x1 = _points[2].x;
        this._y1 = _points[2].y;

        this._invalidate = true;
        
        return [t];
      }
  
    /**
     * Access the natural parameter at the specified (normalized) arc length
     * 
     * @param s : Float - Normalized arc length in [0,1], i.e. 0 is at the (x0,y0) point, 1 is at the (x1,y1) point and 0.5 is halfway along the length of the curve
     * 
     * @return Float - Natural parameter (t) corresponding to the specified normalized arc length
     */
      , getTAtLength: function(s)
      {  
        if( s == this.__s )
          return this.__t;
      
        if( s <= 0 )
        {
          this.__s = this.__t = 0;
          return 0;
        }
      
        if( s >= 1 )
        {
          this.__s = this.__t = 1;
          return 1;
        }
      
        if( this._invalidated )
	        this.update();
	  
        this.__normArcLength = s;
	
        // the name of the game is to quickly get an interval containing the arc length, then let TWBRF do its work; the new __t value is in either
        // [0,__t) or (__t,1] depending on whether or not _s > __s or _s < __s.
        var left  = 0;
        var right = 1;
      
        if( s > this.__s )
        {
          // moving uniformly forward in arc-length is the most expected use case
          left = this.__t + 0.05;
        }
        else
        {
          right = this.__t - 0.05;
        }
      
        // because of the non-decreasing relationship between the natural parameter and normalized arc length, we know that the t-parameter corresponding
        // to the requested s is in the interval [left, right], provided the delta between subsequent requests for s is sufficiently large for the hardcoded
        // delta-t (that's the trick in this approximation scheme).
        var parent = this;
        var integrand = function(_t)
        {
          var xPrime = parent.__c1X + 2*_t*parent.__c2X;
          var yPrime = parent.__c1Y + 2*_t*parent.__c2Y;
          
          return Math.sqrt( xPrime*xPrime + yPrime*yPrime );
        }
        integrand.bind(this);
        
        var invFcn = function()
        {
          return parent.__integral.eval(parent.integrand, 0, t, 6)*parent._length - parent.__normArcLength;
        }
        invFcn.bind(this);
        
        var t = this.__root.findRoot(left, right, invFcn);
        if( t >= 0 && t <= 1 )
        {
          this.__s = s;
          this.__t = t;
        }
        else
          t = 0;
      
        return  t;
      }
  
    /**
     * Return the natural parameter at the specified x-coordinate
     * 
     * @param _x : Float - x-coordinate value
     * 
     * @return Float - Natural (t) parameter at the specified x-coordinate
     */
      , getTAtX: function(_x)
      {
	      // return the minimum of the two possible parameter values
        if( this._invalidated )
          this.update();
        
        var c = this.__c0X - _x;
        var b = this.__c1X;
        var a = this.__c2X;
      
        var d = b*b - 4*a*c;
        if( d < 0 )
        {
          // no solutions
          return 0;
        }
      
        d             = Math.sqrt(d);
        a             = 1/(a + a);
        var t0 = (d-b)*a;
        var t1 = (-b-d)*a;
	
	      // one of the roots could be BS, so take the one that produces a t-value whose x-value on the curve most closely matches the input
	      var x0 = this.getX(t0);
	      var x1 = this.getX(t1);
	      var d0 = Math.abs(x0-_x);
	      var d1 = Math.abs(x1-_x);
	
	      if( d0 <= d1 )
	        return t0;
	      else 
	        return t1;
      }
  
     /**
      * Return the y-coordinate at the specified x-coordinate
      * 
      * @param _x : Float - x-coordinate value
      * 
      * @return Float - y-coordinate at the specified x-coordinate
      */
      , getYAtX: function(_x)
      {
        // the necessary y-coordinates are the intersection of the curve with the line x = _x.  The curve is generated in the
        // form c0 + c1*t + c2*t^2, so the intersection satisfies the equation Bx(t) = _x or Bx(t) - _x = 0, or c0x-_x + c1x*t + c2x*t^2 = 0,
        // which is quadratic in t.  I wonder what formula can be used to solve that ????
        if( this._invalidated )
          this.update();
        
        var result = [];
        var c = this.__c0X - _x;
        var b = this.__c1X;
        var a = this.__c2X;
	
	      if( Math.abs(a) < 0.0001 )
	      {
          var x1 = this.getX(0);
	        var x2 = this.getX(1);
	  
	        result.push( (_x - x1)/(x2 - x1) );
	        return result;
	      }
      
        var d = b*b - 4*a*c;
        if( d < 0 )
        {
          // no solutions
          return [];
        }
      
        d      = Math.sqrt(d);
        a      = 1/(a + a);
        var t0 = (d-b)*a;
        var t1 = (-b-d)*a;
      
	      if( t0 >= 0 && t0 <= 1 )
          result.push( this.getY(t0) );
	  
	      if( t1 >= 0 && t1 <= 1 )
          result.push( this.getY(t1) );
        
        return result;
      }
  
     /**
      * Return the x-coordinate at the specified y-coordinate
      * 
      * @param _y : Float - y-coordinate value
      * 
      * @return Float - x-coordinate at the specified x-coordinate
      */
      , getXAtY: function(_y)
      {
	      // the necessary y-coordinates are the intersection of the curve with the line y = _y.  The curve is generated in the
        // form c0 + c1*t + c2*t^2, so the intersection satisfies the equation By(t) = _y or By(t) - _y = 0, or c0y-_y + c1y*t + c2y*t^2 = 0,
        // which is quadratic in t.
    
        if( this._invalidated )
          this.update();
        
        var c = this.__c0Y - this._y;
        var b = this.__c1Y;
        var a = this.__c2Y;
      
        var d = b*b - 4*a*c;
        if( d < 0 )
        {
          // no solutions
          return [];
        }
      
        d             = Math.sqrt(d);
        a             = 1/(a + a);
        var t0 = (d-b)*a;
        var t1 = (-b-d)*a;
      
        // allow natural parameters outside of [0,1] as the curve can be extrapolated for t-values outside that range
        var result = [];
        result.push( getY(t0) );
        result.push( getY(t1) );
        
        return result;
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
	
	      if( Math.abs(this._length) < 0.0000001 ) 
	        return 0;
	  
	      if( t <= 0 )
	        return 0;
	  
	      if( t >= 1 )
	        return this._length;
	   
	      var parent = this;
        var integrand = function(_t)
        {
          var xPrime = parent.__c1X + 2*_t*parent.__c2X;
          var yPrime = parent.__c1Y + 2*_t*parent.__c2Y;
            
          return Math.sqrt( xPrime*xPrime + yPrime*yPrime );
        }
        integrand.bind(this);
        
	      return __integral.eval( integrand, 0, t, 5 );
      }
  
      // internal method - compute quad. Bezier coefficients
      , computeCoef: function()
      {
        this.__c0X = this._x0;
	      this.__c0Y = this._y0;

        this.__c1X = 2.0*(this._cx-this._x0);
	      this.__c1Y = 2.0*(this._cy-this._y0);

        this.__c2X = this._x0-2.0*this._cx+this._x1;
	      this.__c2Y = this._y0-2.0*this._cy+this._y1;
      }
  
      // internal method - update coefficients and arc length 
      , update: function()
      {
	      this.computeCoef();
	
	      var parent = this;
	      var integrand = function(_t)
	      {
	        var xPrime = parent.__c1X + 2*_t*parent.__c2X;
	        var yPrime = parent.__c1Y + 2*_t*parent.__c2Y;
	          
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
