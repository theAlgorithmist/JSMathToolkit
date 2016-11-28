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

define(['../utils/Gauss', '../utils/CurveUtils'], function (GaussModule, CurveUtilsModule) 
{
  var GaussRef   = new GaussModule();
  var __integral = new GaussRef.Gauss();
  
  var CurveUtilsRef = new CurveUtilsModule();
  
  var returnedModule = function () 
  {
   /**
    * Cubic Catmull-Rom spline with auto-tangent generation and default, uniform parameterization
    * 
    * @author Jim Armstrong (www.algorithmist.net)
    * 
    * @version 1.0
    */
    this.CatmullRom = function() 
    {
      this.UNIFORM    = "uniform";
      this.ARC_LENGTH = "arclength";
      this.FIRST      = "first";
      this.LAST       = "last";
    
      // core
      this._knots       = 0;       // knot count (user-supplied interpolation points)
      this._x           = [];      // x-coordinates
      this._y           = [];      // y-coordinates
      this._coef        = [];      // coefficients for each segment
      this._isClosed    = false;   // true is spline is automatically closed
      this._invalidated = false;   // true if current coefficients are invalid
      
      // cached arc length
      this._arcLength = 0;
      
      // arc-length parameterization
      this.__t = -1;               // current t-value
      this.__s = -1;               // current arc-length
      this.__index = 0;            // current index into coefficient array
      this.__localParam = 0;       // local (segment-based) parameter
      this.__prevIndex = 0;        // previous index reference
  
      this._x.push(0);
      this._y.push(0);
    }
    
    this.CatmullRom.__name__ = true;
    this.CatmullRom.prototype = 
    {
     /**
      * Access the type of spline
      * 
      * @return String - 'catmullRom'
      */
      getType: function()
      { 
        return "catmullRom";
      }
      
     /**
      * Access point count
      * 
      * @return Int - Number of interpolation points or knots in the spline
      */
      , pointCount: function() 
      { 
        return this._knots;
      }
      
     /**
      * Access the collection of interpolation points
      * 
      * @return Array - Array of objects with "x" and "y" properties for x- and y-coordinates - the entire array of internal points is returned, which
      * includes 'artificial' points added to the beginning and end of the point set for purposes of tangent construction.  The original point set is
      * in the middle, unless this method is called before any query that triggers tangent construction, in which case the artificial end point is not
      * in the returned collection.
      */
      , getPoints: function()
      {
        var pointArr = [];
        var i = 0;
        while( i < this._x.length )
        {
          pointArr.push( {x:this._x[i], y:this._y[i]} );
          i++;
        }
       
        return pointArr;
      }
      
     /**
      * Access the arc length of the spline at the specified natural parameter value
      * 
      * @param _t : Float - Natural parameter value in [0,1]
      * 
      * @return Float - Arc length of the spline
      */
      , lengthAt(_t)
      {
        return 0;
      }
      
     /**
      * Access the arc length of the spline at the specified natural parameter value
      * 
      * @param _t : Float - Natural parameter value in [0,1]
      * 
      * @return Float - Arc length of the spline
      */
      , length()
      {
        if( this._invalidated )
          this.__computeCoef();
         
        var i;
        var c;
        var len    = this._coef.length;
        var parent = this;
     
        this._arcLength = 0;
        for( i=1; i<len; ++i )
        {
          c = this._coef[i];
          
          var integrand = function(_t)
          {
            var xPrime = 0.5*( c.c1x + _t*(2.0*c.c2x + _t*(3.0*c.c3x)) );
            var yPrime = 0.5*( c.c1y + _t*(2.0*c.c2y + _t*(3.0*c.c3y)) );
            
            return Math.sqrt(xPrime*xPrime + yPrime*yPrime);
          }
          
          this._arcLength += __integral.eval( integrand, 0, 1, 6 );
        }
         
        return this._arcLength;
      }
    
     /**
      * Access a specific cubic segment 
      * 
      * @param _i : Int - Segment index in [0, #points-1]
      * 
      * @return Float - Object - c0x, c0y, c1x, c1y, c2x, c2y, c3x, c3y properties are the cubic polynomial coefficients for the requested segment, or null
      * if index is out of range
      */
      , getSegment: function(_segment)
      {
        return this._coef[_segment];
      }

     /**
      * Indicate whether or not the spline is to be automatically closed
      * 
      * @return Nothing - this parameter is assigned to the internal tangent-generation manager
      */
      , closed(isClosed)
      {
        this._isClosed = isClosed; 
      }
    
     /**
      * Add a control point
      *
      * @param _x : Float - control point, x-coordinate
      * @param _y : Float - control point, y-coordinate
      *
      * @return Nothing Adds the specified interpolation or control points to the spline.  No error checking is performed on arguments.
      *
      */
      , addControlPoint: function( _xCoord, _yCoord )
      {
        this._knots++;
        this._x[this._knots] = _xCoord;
        this._y[this._knots] = _yCoord;

        this._invalidated = true;
      }
      
     /**
      * Set spline control or interpolation points from arrays
      * 
      * @param x : Array - x-coordinates of new point set
      * @param y : Array - y-coordinates of new point set
      * 
      * @return Nothing
      */
      , data: function(x, y)
      {
        this._invalidated = true;
          
        this._x.length = 0
        this._y.length = 0;
        
        this._x.push(0);
        this._y.push(0);
        
        this._x = this._x.concat(x);
        this._y = this._y.concat(y);
        
        this._knots = x.length;
      }

     /**
      * Clear the spline and prepare for new data
      * 
      * @return Nothing - spline data and other parameters are cleared; the tangent computation module remains unchanged
      */
      , clear: function()
      {
        this._x.length = 0;
        this._y.length = 0;
        this._coef.length = 0;

        this._x.push(0);
        this._y.push(0);

        this._knots       = 0;
        this.__t          = -1;
        this.__s          = -1;
        this._invalidated = true;
      }

     /**
      * getX - Return x-coordinate for a given natural parameter, t
      *
      * @param _t - parameter value in [0,1]
      *
      * @return Number Value of Catmull-Rom spline, provided input is in [0,1], C(0) or C(1).  0 is returned if number of interpolation points is below 2.
      *
      */
      , getX: function(_t)
      {
        if( this._knots < 2 )
          return (this._knots==1) ? this._x[1] : 0;
    
        if( this._invalidated )
          this.__computeCoef();

        // assign the t-parameter for this evaluation
        this.__setParam(_t);

        var c   = this._coef[this.__index];
        var t   = this.__localParam;
        var val = c.c0x + t*(c.c1x + t*(c.c2x + t*(c.c3x)));
        
        return 0.5*val;
      }

     /**
      * Return dx/dt for an input natural parameter, t
      *
      * @param _t - parameter value in [0,1]
      *
      * @return Number: Value of dx/dt, provided input is in [0,1].
      *
      *
      */
      , getXPrime: function(_t)
      {
        if( this._knots < 2 )
          return 0;

        if( this._invalidated )
          this.__computeCoef();

        // assign the t-parameter for this evaluation
        this.__setParam(_t);
        
        var c   = this._coef[this.__index];
        var t   = this.__localParam;
        var val = c.c1x + t*(2.0*c.c2x + t*(3.0*c.c3x));
        
        return 0.5*val;
      }

     /**
      * getY - Return y-coordinate for a given natural parameter,  t
      *
      * @param _t - parameter value in [0,1]
      *
      * @return Number: Value of Catmull-Rom spline, provided input is in [0,1], C(0) or C(1).  0 is returned if number interpolation points is less than 2.
      *
      */
      , getY: function(_t)
      {
        if( this._knots < 2 )
          return (this._knots==1) ? this._y[1] : 0;
    
        if( this._invalidated )
          this.__computeCoef();

        // assign the t-parameter for this evaluation
        this.__setParam(_t);

        var c   = this._coef[this.__index];
        var t   = this.__localParam;
        var val = c.c0y + t*(c.c1y + t*(c.c2y + t*(c.c3y)));
        
        return 0.5*val;
      }

     /**
      * Return dy/dt for a given natural parameter, t
      *
      * @param _t - parameter value in [0,1]
      *
      * @return Number Value of dy/dt, provided input is in [0,1].  0 is returned if interpolation point count is less than 2.
      *
      */
      , getYPrime: function(_t)
      {
        if( this._knots < 2 )
          return 0;

        if( this._invalidated )
          this.__computeCoef();

        // assign the t-parameter for this evaluation
        this.__setParam(_t);
        
        var c   = this._coef[this.__index];
        var t   = this.__localParam;
        var val = c.c1y + t*(2.0*c.c2y + t*(3.0*c.c3y));
        
        return 0.5*val;
      }

      // internal method - compute cubic polynomical coefficients for each segment
      , __computeCoef: function()
      { 
        if( this._isClosed )
        {
          if( this._x[1] != this._x[this._knots-1] || this._y[1] != this._y[this._knots-1] )
            this.addControlPoint(this._x[1], this._y[1]);
          
          this.__closedSplineEndpoints();
        }
        else
        {
          // tbd - test for removal of artificial endpoints
          this.__computeEndpoints();
        }

        // loop over segments
        this._coef.length = 0;
        var i;
        for( var i=1; i<this._knots; ++i )
        {
          var c = {};
          
          c.c0x = 2.0*this._x[i];
          c.c0y = 2.0*this._y[i];
        
          c.c1x = this._x[i+1] - this._x[i-1];
          c.c1y = this._y[i+1] - this._y[i-1];

          c.c2x = 2.0*this._x[i-1] - 5.0*this._x[i] + 4.0*this._x[i+1] - this._x[i+2];
          c.c2y = 2.0*this._y[i-1] - 5.0*this._y[i] + 4.0*this._y[i+1] - this._y[i+2];

          c.c3x = -this._x[i-1] + 3.0*this._x[i] - 3.0*this._x[i+1] + this._x[i+2];
          c.c3y = -this._y[i-1] + 3.0*this._y[i] - 3.0*this._y[i+1] + this._y[i+2];

          this._coef[i] = c;
        }

        this._invalidated = false;
      }
      
     /**
      * Access the x-coordinate at the specified (normalized) arc length along the spline
      * 
      * @param _s : Float - Normalized arc length in [0,1];
      * 
      * @return Float - x-coordinate corresponding to the specified fraction of arc length along the spline.  
      */
      , getXAtS: function(_s)
      {
        var s = Math.max(0,_s);
        s     = Math.min(1,s);
         
        // locate the index corresponding to this fraction of arc length - in the next release, most of the common code between this and related methods
        // will be consolidated into a single, internal method.
        if( s != this._s )
        {
          if( this._invalidated )
            this.__computeCoef();
           
          var curveUtils = new CurveUtilsRef.CurveUtils();
          
          var i, c, t;
          var len = this._coef.length;
          var segLength   = [];
          this._arcLength = 0;
          
          segLength.push(0);
          
          // recompute total arc length and store arc length by segment
          var integrand = function(_t)
          {
            var xPrime = 0.5*( c.c1x + _t*(2.0*c.c2x + _t*(3.0*c.c3x)) );
            var yPrime = 0.5*( c.c1y + _t*(2.0*c.c2y + _t*(3.0*c.c3y)) );
            
            return Math.sqrt(xPrime*xPrime + yPrime*yPrime);
          }
          
          for( i=1; i<len; ++i )
          {
            c = this._coef[i];
            
            segLength[i]     = __integral.eval( integrand, 0, 1, 6 );
            this._arcLength += segLength[i];
          }
           
          var f    = s*this._arcLength;
          var z    = 0;
          var indx = 0;
          var bLen = 0;
          for( i=1; i<len; ++i )
          {
            c      = this._coef[i];
            bLen   = segLength[i];
            z     += bLen;
             
            if( z >= f )
            {
              indx = i;
              z    = z - f;  // leftover
              break;
            }
          }
           
          // fraction along current segment of remaining length
          z = (bLen-z)/bLen;
          t = curveUtils.tAtLength(c, z);
           
          // cache since next call is most likely to getYAtS()
          this._index = indx;
          this._s     = s;
          this._t     = t;
        }
        else
        {
          c = this._coef[this._index];
          t = this._t;
        }
         
        return 0.5*( c.c0x + t*(c.c1x + t*(c.c2x + t*(c.c3x))) );
      }
      
     /**
      * Access the y-coordinate at the specified (normalized) arc length along the spline
      * 
      * @param _s : Float - Normalized arc length in [0,1];
      * 
      * @return Float - y-coordinate corresponding to the specified fraction of arc length along the spline.  
      */
      , getYAtS: function(_s)
      {
        var s = Math.max(0,_s);
        s     = Math.min(1,s);
          
        // locate the index corresponding to this fraction of arc length - in the next release, most of the common code between this and related methods
        // will be consolidated into a single, internal method.
        if( s != this._s )
        {
          if( this._invalidated )
            this.__computeCoef();
            
          var curveUtils = new CurveUtilsRef.CurveUtils();
           
          var i, c, t;
          var len = this._coef.length;
          var segLength   = [];
          this._arcLength = 0;
           
          segLength.push(0);
           
          // recompute total arc length and store arc length by segment
          var integrand = function(_t)
          {
            var xPrime = 0.5*( c.c1x + _t*(2.0*c.c2x + _t*(3.0*c.c3x)) );
            var yPrime = 0.5*( c.c1y + _t*(2.0*c.c2y + _t*(3.0*c.c3y)) );
             
            return Math.sqrt(xPrime*xPrime + yPrime*yPrime);
          }
           
          for( i=1; i<len; ++i )
          {
            c = this._coef[i];
             
            segLength[i]     = __integral.eval( integrand, 0, 1, 6 );
            this._arcLength += segLength[i];
          }
            
          var f    = s*this._arcLength;
          var z    = 0;
          var indx = 0;
          var bLen = 0;
          for( i=1; i<len; ++i )
          {
            c      = this._coef[i];
            bLen   = segLength[i];
            z     += bLen;
              
            if( z >= f )
            {
              indx = i;
              z    = z - f;  // leftover
              break;
            }
          }
            
          // fraction along current segment of remaining length
          z = (bLen-z)/bLen;
          t = curveUtils.tAtLength(c, z);
            
          this._index = indx;
          this._s     = s;
          this._t     = t;
        }
        else
        {
          c = this._coef[this._index];
          t = this._t;
        }
          
        return 0.5*( c.c0y + t*(c.c1y + t*(c.c2y + t*(c.c3y))) );
      }
      
     /**
      * Access the dx/dt at the specified (normalized) arc length along the spline
      * 
      * @param _s : Float - Normalized arc length in [0,1];
      * 
      * @return Float - dx/dt corresponding to the specified fraction of arc length along the spline.  
      */
      , getXPrimeAtS: function(_s)
      {
        var s = Math.max(0,_s);
        s     = Math.min(1,s);
          
        // locate the index corresponding to this fraction of arc length - in the next release, most of the common code between this and related methods
        // will be consolidated into a single, internal method.
        if( s != this._s )
        {
          if( this._invalidated )
            this.__computeCoef();
            
          var curveUtils = new CurveUtilsRef.CurveUtils();
           
          var i, c, t;
          var len = this._coef.length;
          var segLength   = [];
          this._arcLength = 0;
           
          segLength.push(0);
           
          // recompute total arc length and store arc length by segment
          var integrand = function(_t)
          {
            var xPrime = 0.5*( c.c1x + _t*(2.0*c.c2x + _t*(3.0*c.c3x)) );
            var yPrime = 0.5*( c.c1y + _t*(2.0*c.c2y + _t*(3.0*c.c3y)) );
             
            return Math.sqrt(xPrime*xPrime + yPrime*yPrime);
          }
           
          for( i=1; i<len; ++i )
          {
            c = this._coef[i];
             
            segLength[i]     = __integral.eval( integrand, 0, 1, 6 );
            this._arcLength += segLength[i];
          }
            
          var f    = s*this._arcLength;
          var z    = 0;
          var indx = 0;
          var bLen = 0;
          for( i=1; i<len; ++i )
          {
            c      = this._coef[i];
            bLen   = segLength[i];
            z     += bLen;
              
            if( z >= f )
            {
              indx = i;
              z    = z - f;  // leftover
              break;
            }
          }
            
          // fraction along current segment of remaining length
          z = (bLen-z)/bLen;
          t = curveUtils.tAtLength(c, z);
            
          // cache since next call is most likely to getYAtS()
          this._index = indx;
          this._s     = s;
          this._t     = t;
        }
        else
        {
          c = this._coef[this._index];
          t = this._t;
        }
          
        return 0.5*( c.c1x + t*(2.0*c.c2x + t*(3.0*c.c3x)) );
      }
       
     /**
      * Access the dy/dt at the specified (normalized) arc length along the spline
      * 
      * @param _s : Float - Normalized arc length in [0,1];
      * 
      * @return Float - dy/dt corresponding to the specified fraction of arc length along the spline.  
      */
      , getYPrimeAtS: function(_s)
      {
        var s = Math.max(0,_s);
        s     = Math.min(1,s);
           
        // locate the index corresponding to this fraction of arc length - in the next release, most of the common code between this and related methods
        // will be consolidated into a single, internal method.
        if( s != this._s )
        {
          if( this._invalidated )
            this.__computeCoef();
             
          var curveUtils = new CurveUtilsRef.CurveUtils();
            
          var i, c, t;
          var len = this._coef.length;
          var segLength   = [];
          this._arcLength = 0;
            
          segLength.push(0);
            
          // recompute total arc length and store arc length by segment
          var integrand = function(_t)
          {
            var xPrime = 0.5*( c.c1x + _t*(2.0*c.c2x + _t*(3.0*c.c3x)) );
            var yPrime = 0.5*( c.c1y + _t*(2.0*c.c2y + _t*(3.0*c.c3y)) );
              
            return Math.sqrt(xPrime*xPrime + yPrime*yPrime);
          }
            
          for( i=1; i<len; ++i )
          {
            c = this._coef[i];
              
            segLength[i]     = __integral.eval( integrand, 0, 1, 6 );
            this._arcLength += segLength[i];
          }
             
          var f    = s*this._arcLength;
          var z    = 0;
          var indx = 0;
          var bLen = 0;
          for( i=1; i<len; ++i )
          {
            c      = this._coef[i];
            bLen   = segLength[i];
            z     += bLen;
               
            if( z >= f )
            {
              indx = i;
              z    = z - f;  // leftover
              break;
            }
          }
             
          // fraction along current segment of remaining length
          z = (bLen-z)/bLen;
          t = curveUtils.tAtLength(c, z);
             
          this._index = indx;
          this._s     = s;
          this._t     = t;
        }
        else
        {
          c = this._coef[this._index];
          t = this._t;
        }
           
        return 0.5*( c.c1y + t*(2.0*c.c2y + t*(3.0*c.c3y)) );
      }

      // internal method - uniform parameterization
      , __setParam: function(_t)
      {
        var t = (_t < 0) ? 0 : _t;
        t     = (t > 1)  ? 1 : t;

        if( t != this.__t )
        {
          this.__t = t;
          this.__segment();
        }
      }

      // internal method - compute current segment and local parameter value
      , __segment: function()
      {
        // the trivial case -- one segment
        if( this._knots == 2 )
        {
          this.__index      = 1;
          this.__localParam = this.__t;
        }
        else 
        {
          if( this.__t == 0 )
          {
            this.__index = 1;
            this.__localParam = 0;
          }
          else if( this.__t == 1.0 )
          {
            this.__index      = this._knots-1;
            this.__localParam = 1.0;
          }
          else
          {
            var N1  = this._knots-1;
            var N1t = N1*this.__t;
            var f   = Math.floor(N1t);
            
            this.__index      = Math.min(f+1, N1);
            this.__localParam = N1t - f;
          }
        }
      }

      // internal method - compute endpoints at extremes of knot sequence - simple reflection about endpoints (compensating for closed spline)
      , __computeEndpoints: function()
      {
        if( !this._isClosed )
        {
          // simple reflection
          this._x[0] = 2.0*this._x[1] - this._x[2];
          this._y[0] = 2.0*this._y[1] - this._y[2];

          this._x[this._knots+1] = 2.0*this._x[this._knots] - this._x[this._knots-1];
          this._y[this._knots+1] = 2.0*this._y[this._knots] - this._y[this._knots-1];
        }
      }
    
      , __closedSplineEndpoints: function()
      {   
        var x1  = this._x[1];
        var y1  = this._y[1];
        var dX1 = this._x[2] - x1;
        var dY1 = this._y[2] - y1;
        var dX2 = this._x[this._knots-1] - x1;
        var dY2 = this._y[this._knots-1] - y1;
        var d1  = Math.sqrt(dX1*dX1 + dY1*dY1);
        var d2  = Math.sqrt(dX2*dX2 + dY2*dY2);
        dX1    /= d1;
        dY1    /= d1;
        dX2    /= d2;
        dY2    /= d2;
      
        // initial artificial point to close loop
        this._x[0] = x1 + d1*dX2;
        this._y[0] = y1 + d1*dY2;
        
        // terminal artificial point to close loop (and properly match tangents)
        this._x[this._knots+1] = x1 + d2*dX1;
        this._y[this._knots+1] = y1 + d2*dY1;
      }
    }
  }
  
  return returnedModule;
});