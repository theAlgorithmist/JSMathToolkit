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

/**
 * The NaturalCubicSpline class implements a natural cubic spline that interpolates a series of points with increasing x-cordinate values.  Intervals
 * must be non-overlapping.
 * 
 * Author Jim Armstrong (www.algorithmist.net)
 * 
 * Version 1.0
 * 
 */
define(['../utils/Gauss', './BezierSplineControl', '../planarCurves/CubicBezier'], function (GaussModule, TangentModule, CubicBezierModule) 
{
  var GaussRef   = new GaussModule();
  var __integral = new GaussRef.Gauss();
  
  var TangentRef     = new TangentModule();
  var CubicBezierRef = new CubicBezierModule();
  
  var returnedModule = function () 
  {
   /**
    * A cubic bezier spline that interpolates a series of points.  Each curve segment in between interpolation points is a cubic Bezier.  Tangents are computed
    * using a control-points manager that computes the control points or geometric constraints for each cubic bezier segment, given the set of interpolation
    * points.  A default manager is created at instantiation that computes tangents that are normal to the angle bisector at each point.  Reflection is used
    * at each endpoints.
    * 
    * By default, the spline uses a uniform parameterization when requesting x- and y-coordinates at a natural parameter value, t.  Use the getTAtS() method
    * to access the natural parameter at a specific arc length and then query x- and y-coordinates.  This is equivalent to using arc-length parameterization on
    * the spline.
    * 
    * The spline may be closed.
    * 
    * @author Jim Armstrong (www.algorithmist.net)
    * 
    * @version 1.0
    * 
    */
    this.CubicBezierSpline = function()
    {
      // interpolation points
      this._x = [];
      this._y = [];
      
      this._bezier = [];                       // CubicBezier instance for each cubic segment         
      this._t = 0;                             // local parameter value corresponding to input parameter value                   
      this._s = 0;                             // current normalized arc-length
      this._index = 0;                         // index of cubic segment corresponding to input parameter value  
      this._arcLength = 0;                     // current arc length
      this._invalidated = true;                // true if data change invalidates spline computations
      
      // control points Manager
      this._tangentManager = new TangentRef.BezierSplineControl(); 
    }
  
    this.CubicBezierSpline.__name__ = true;
    this.CubicBezierSpline.prototype = 
    {
     /**
      * Access type of spline
      * 
      * @return String - 'cubicBezier'
      */
      getType: function()
      {
        return 'cubicBezier';
      }
    
     /**
      * Access point count
      * 
      * @return Int - Number of interpolation points or knots in the spline
      */
      , pointCount: function() 
      { 
        return this._x.length;
      }
  
     /**
      * Access the collection of interpolation points
      * 
      * @return Array - Array of objects with "x" and "y" properties for x- and y-coordinates of an interpolation point of the spline.
      */
      , getPoints: function()
      {
        var pointArr = [];
	      var i = 0;
	      while( i < this.__knots )
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
      , length()
      {
        if( this._invalidated )
          this.__tangents();
        
        var i;
        var len         = this._bezier.length;
        this._arcLength = 0;
        for( i=0; i<len; ++i )
        {
          bezier  = this._bezier[i];
          
          this._arcLength += bezier.lengthAt(1.0);
        }
        
        return this._arcLength;
      }
      
     /**
      * Access a specific cubic bezier segment 
      * 
      * @param _i : Int - Segment index in [0, #points-1]
      * 
      * @return Float - Reference to a cubic bezier for the specified index or null if index is out of range
      */
      , getSegment(_i)
      {
        if( this._invalidated )
          this.__tangents();
        
        return ( _i >=0 && _i < this._bezier.length ) ? this._bezier[_i] : null;
      }
      
     /**
      * Add a control point or interpolation point to the spline
      * 
      * @param x : Number - x-coordinate of new point
      * @param y : Number - y-coordinate of new point
      * 
      * @return Nothing
      */
      , addControlPoint: function(x, y)
      {
        this.__invalidated = true;
        
        this._x.push(x);
        this._y.push(y);
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
         
        this._x = x.slice(0);
        this._y = y.slice(0);
      }
      
     /**
      * Assign the tangent-generation module - must expose the same API as BezierSplineControl
      * 
      * @param _control : Dynamic - Reference to instantiated class that implements the same API as BezierSplineControl.  These methods will be called to handle 
      * tangent computation when data is invalidated
      * 
      * @return Nothing The tangent control implementation remains in place until it is changed
      */
      , setTangentControl(_control)
      {
        // no error-checking on API implementation - you break it, you buy it.
        if( _control )
          this._tangentManager = _control;
      }
      
     /**
      * Indicate whether or not the spline is to be automatically closed
      * 
      * @return Nothing - this parameter is assigned to the internal tangent-generation manager
      */
      , closed(isClosed)
      {
        // a user-supplied tangent-generation method may not support auto-closure, but the method should be implemented
        this._tangentManager.closed = isClosed;
      }
      
     /**
      * Assign a tension parameter in [0,1] on the spline.  0 is loosest and 1 is the tightest-possible setting.  The internal tangent-manager should
      * interpret this property and assign tension.
      */
      , tension(t)
      {
        var tension = Math.max(0,t);
        tension     = Math.min(1,tension);
        
        // a user-supplied tangent-generation method may not support tension, but the method should be implemented
        this._tangentManager.tension = tension;
      }
  
     /**
      * Clear the spline and prepare for new data
      * 
      * @return Nothing - spline data and other parameters are cleared; the tangent computation module remains unchanged
      */
      , clear: function()
      {
        this._x = [];
        this._y = [];
        
        this._bezier = [];        
        this._t = 0;             
        this._s = 0;
        this._index = 0; 
        this._arcLength = 0; 
        this._invalidated = false;
      }
  
     /**
      * Access the x-coordinate of the spline at a specified natural parameter in [0,1]
      * 
      * @param _t : Float - Natural parameter in [0,1].  The input value is clipped if it is outside this interval
      * 
      * @return Float - Zero if the input is invalid.  Otherwise, the input is uniform-parameterized into a bezier segment index and local parameter on that
      * Bezier.  The x-coordinate of the cubic Bezier segment at the computed local parameter is returned.
      */
      , getX: function(_t)
      {
        if( isNaN(_t) )
          return 0;
        
        var t = Math.max(0,_t);
        t     = Math.min(1,t)
        if( this._invalidated )
          this.__tangents();
        
        this.__interval(t);
        
        var bezier = this._bezier[this._index];
        if( !bezier )
          console.log( t, this._index, this._t );
        
        return bezier.getX(this._t);
      }
      
     /**
      * Access the y-coordinate of the spline at a specified natural parameter in [0,1]
      * 
      * @param _t : Float - Natural parameter in [0,1].  The input value is clipped if it is outside this interval
      * 
      * @return Float - Zero if the input is invalid.  Otherwise, the input is uniform-parameterized into a bezier segment index and local parameter on that
      * Bezier.  The y-coordinate of the cubic Bezier segment at the computed local parameter is returned.
      */
      , getY: function(_t)
      {
        if( isNaN(_t) )
          return 0;
        
        var t = Math.max(0,_t);
        t     = Math.min(1,t)
        if( this._invalidated )
          this.__tangents();
        
        this.__interval(t);
        
        var bezier = this._bezier[this._index];
        
        return bezier.getY(this._t);
      }
  
     /**
      * Access the x-coordinate of the spline's first derivative at a specified natural parameter in [0,1]
      * 
      * @param _t : Float - Natural parameter in [0,1].  The input value is clipped if it is outside this interval
      * 
      * @return Float - Zero if the input is invalid.  Otherwise, the input is uniform-parameterized into a bezier segment index and local parameter on that
      * Bezier.  The x-coordinate of the cubic Bezier segment's first derivative at the computed local parameter is returned.
      */
      , getXPrime: function(_t)
      { 
        if( isNaN(_t) )
          return 0;
        
        var t = Math.max(0,_t);
        t     = Math.min(1,t)
        if( this._invalidated )
          this.__tangents();
        
        this.__interval(t);
        
        var bezier = this._bezier[this._index];
        
        return bezier.getXPrime(this._t);
      }
  
     /**
      * Access the y-coordinate of the spline's first derivative at a specified natural parameter in [0,1]
      * 
      * @param _t : Float - Natural parameter in [0,1].  The input value is clipped if it is outside this interval
      * 
      * @return Float - Zero if the input is invalid.  Otherwise, the input is uniform-parameterized into a bezier segment index and local parameter on that
      * Bezier.  The y-coordinate of the cubic Bezier segment's first derivative at the computed local parameter is returned.
      */
      , getYPrime: function(_t) 
      {  
        if( isNaN(_t) )
          return 0;
        
        var t = Math.max(0,_t);
        t     = Math.min(1,t)
        if( this._invalidated )
          this.__tangents();
        
        this.__interval(t);
        
        var bezier = this._bezier[this._index];
        
        return bezier.getYPrime(this._t);
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
        s     = Math.min(1,s)
        
        // locate the index corresponding to this fraction of arc length - in the next release, most of the common code between this and related methods
        // will be consolidated into a single, internal method.
        if( s != this._s )
        {
          if( this._invalidated )
            this.__tangents();
          
          var i, t;
          var len         = this._bezier.length;
          this._arcLength = 0;
          for( i=0; i<len; ++i )
          {
            bezier  = this._bezier[i];
            
            this._arcLength += bezier.lengthAt(1.0);
          }
        
          var f    = s*this._arcLength;
          var z    = 0;
          var indx = 0;
          var bLen = 0;
          for( i=0; i<len; ++i )
          {
            bezier = this._bezier[i];
            bLen   = bezier.lengthAt(1.0);
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
          t = bezier.tAtLength(z);
          
          // cache since next call is most likely to getYAtT()
          this._index = indx;
          this._s     = s;
          this._t     = t;
        }
        else
        {
          bezier = this._bezier[this._index];
          t      = this._t;
        }
        
        return bezier.getX(t);
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
        
        // locate the index corresponding to this fraction of arc length
        if( s != this._s )
        {
          if( this._invalidated )
            this.__tangents();
          
          var i,t;
          var len         = this._bezier.length;
          this._arcLength = 0;
          for( i=0; i<len; ++i )
          {
            bezier  = this._bezier[i];
            
            this._arcLength += bezier.lengthAt(1.0);
          }
        
          var f    = s*this._arcLength;
          var z    = 0;
          var indx = 0;
          var bLen = 0;
          for( i=0; i<len; ++i )
          {
            bezier = this._bezier[i];
            bLen   = bezier.lengthAt(1.0);
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
          t = bezier.tAtLength(z);
          
          // cache
          this._index = indx;
          this._s     = s;
          this._t     = t;
        }
        else
        {
          bezier = this._bezier[this._index];
          t      = this._t;
        }
        
        return bezier.getY(t);
      }
      
     /**
      * Access the dx/ds at the specified (normalized) arc length along the spline
      * 
      * @param _s : Float - Normalized arc length in [0,1];
      * 
      * @return Float - dx/dx corresponding to the specified fraction of arc length along the spline.  
      */
      , getXPrimeAtS: function(_s)
      {
        var s = Math.max(0,_s);
        s     = Math.min(1,s)
         
        // locate the index corresponding to this fraction of arc length
        if( s != this._s )
        {
          if( this._invalidated )
            this.__tangents();
           
          var i, t;
          var len         = this._bezier.length;
          this._arcLength = 0;
          for( i=0; i<len; ++i )
          {
            bezier = this._bezier[i];
             
            this._arcLength += bezier.lengthAt(1.0);
          }
         
          var f    = s*this._arcLength;
          var z    = 0;
          var indx = 0;
          var bLen = 0;
          for( i=0; i<len; ++i )
          {
            bezier = this._bezier[i];
            bLen   = bezier.lengthAt(1.0);
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
          t = bezier.tAtLength(z);
           
          // cache since next call is most likely to getYAtT()
          this._index = indx;
          this._s     = s;
          this._t     = t;
        }
        else
        {
          bezier = this._bezier[this._index];
          t      = this._t;
        }
         
        return bezier.getPrimeX(t);
      }
       
     /**
      * Access dy/dx at the specified (normalized) arc length along the spline
      * 
      * @param _s : Float - Normalized arc length in [0,1];
      * 
      * @return Float - dy/dx corresponding to the specified fraction of arc length along the spline.  
      */
      , getYPrimeAtS: function(_s)
      {
        var s = Math.max(0,_s);
        s     = Math.min(1,s);
         
        // locate the index corresponding to this fraction of arc length
        if( s != this._s )
        {
          if( this._invalidated )
            this.__tangents();
           
          var i, t;
          var len         = this._bezier.length;
          this._arcLength = 0;
          for( i=0; i<len; ++i )
          {
            bezier  = this._bezier[i];
             
            this._arcLength += bezier.lengthAt(1.0);
          }
         
          var f    = s*this._arcLength;
          var z    = 0;
          var indx = 0;
          var bLen = 0;
          for( i=0; i<len; ++i )
          {
            bezier = this._bezier[i];
            bLen   = bezier.lengthAt(1.0);
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
          t = bezier.tAtLength(z);
           
          // cache
          this._index = indx;
          this._s     = s;
          this._t     = t;
        }
        else
        {
          bezier = this._bezier[this._index];
          t      = this._t;
        }
         
        return bezier.getYPrime(t);
      }
      
      // internal method - update tangent computations - this causes each internal bezier curve to be reconstructed
      , __tangents()
      {
        // do we have cubic bezier instances already assigned?
        var numPoints = this._x.length;
        var i;
        if( this._bezier.length != numPoints )
        {
          this._bezier.length = 0;
          for( i=0; i<numPoints-1; ++i)
            this._bezier.push( new CubicBezierRef.CubicBezier() );
        }
          
        // closed spline needs to have matching initial and terminal interpolation points 
        if( this._tangentManager.closed && ((this._x[0] != this._x[numPoints-1]) || (this._x[0] != this._y[numPoints-1])) )
        {
          this.addControlPoint( this._x[0], this._y[0]);
        }
    
        this._tangentManager.construct(this._x, this._y);
        var segement;
        var bezier;
        for( i=0; i<numPoints-1; ++i )
        {
          segment = this._tangentManager.getSegment(i);
          bezier  = this._bezier[i];
          
          bezier.fromObject(segment);
        }
    
        this._invalidated = false;
      }
      
      // internal method - compute the index of the cubic bezier segment and local parameter corresponding to the global parameter.  Local parameter must be in [0.1]
      , __interval: function(__t)
      {
        var t = (__t<0) ? 0 : __t;
        t = (t>1) ? 1 : t;
     
        if( t != this._t )
        {
          this._t = t;
          this.__segment();
        }      
      }
      
      // internal method - compute current segment and local parameter value within that segment
      ,__segment: function()
      {
        // the trivial case -- one segment
        var k = this._x.length;
        if( k == 2 )
        {
          this._index = 0;
        }
        else 
        {
          if( this._t == 0 )
          {
            this._index = 0;
          }
          else if( this._t == 1.0 )
          {
            this._index = k-2;
          }
          else
          {
            var N1      = k-1;
            var N1t     = N1*this._t;
            var f       = Math.floor(N1t);
            this._index = Math.min(f+1, N1)-1;
            this._t     = N1t - f;
          }
        }
      }
    }
  }
    
  return returnedModule;
});
