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

define(['./Gauss', '../planarCurves/QuadBezier', '../planarCurves/CubicBezier', '../core/Point'], function (gaussModule, QuadBezierModule, CubicBezierModule, PointModule) 
{
  var returnedModule = function () 
  {
    var gaussRef   = new gaussModule();
    var __integral = new gaussRef.Gauss();
    
    var pointRef = new PointModule();

    this.BezierUtils = function()
    {
      // natural parameters at cubic stationary points
      this._t1X = 0;
      this._t2X = 0;
      this._t1Y = 0;
      this._t2Y = 0;
      
      // Closest point to a Bezier
      this.MAX_DEPTH = 64;                                      // maximum recursion depth
      this.EPSILON   = 1.0 * Math.pow(2, -this.MAX_DEPTH-1);    // flatness tolerance
      
      // pre-computed z(i,j)
      this.Z_CUBIC = [1.0, 0.6, 0.3, 0.1, 0.4, 0.6, 0.6, 0.4, 0.1, 0.3, 0.6, 1.0];
      this.Z_QUAD  = [1.0, 2/3, 1/3, 1/3, 2/3, 1.0];
      
      // minimum distance
      this.__dMinimum = 0;      
    }
    
    this.BezierUtils.__name__ = true;
    this.BezierUtils.prototype = 
    {
     /**
       * Subdivide a cubic Bezier curve at the specified parameter
       * 
       * @param _t : Float - Natural parameter in (0,1)
       * 
       * @param _c : CubicBezier - Reference to a cubic Bezier 
       * 
       * @param _setLength : Bool - true if the segment lengths are to be measured (not yet implemented)
       * 
       * @return Array : Each element is an object with x0, y0, cx, cy, cx1, cy1, x1, y1, and length properties for each subdivided cubic. segment.  Length
       * will be zero unless the _setLength parameter is set to true.  The natural parameter must be in the range (0,1) for a non-trivial return.
       * 
       * Note: Arc length computation will be implemented in a future release.
       */
       subdivideCubicBezier: function( _t, _c, _setLength)
       {
         if( _t <= 0.0 || _t >= 1.0 )
           return [];
         
         var t1    = 1.0 - _t;
         var left  = {};        // left cubic segment
         var right = {};        // right cubic segment

         left["x0"] = _c.get_x0();
         left["y0"] = _c.get_y0();

         var p11X = t1*_c.get_x0() + _t*_c.get_cx();
         var p11Y = t1*_c.get_y0() + _t*_c.get_cy();

         var p21X = t1*_c.get_cx() + _t*_c.get_cx1();
         var p21Y = t1*_c.get_cy() + _t*_c.get_cy1();

         var p31X = t1*_c.get_cx1() + _t*_c.get_x1();
         var p31Y = t1*_c.get_cy1() + _t*_c.get_y1();

         var p12X = t1*p11X + _t*p21X;
         var p12Y = t1*p11Y + _t*p21Y;

         var p22X = t1*p21X + _t*p31X;
         var p22Y = t1*p21Y + _t*p31Y;

         var p13X = t1*p12X + _t*p22X;
         var p13Y = t1*p12Y + _t*p22Y;

         left["cx"] = p11X;
         left["cy"] = p11Y;

         left["cx1"] = p12X;
         left["cy1"] = p12Y;

         left["x1"] = p13X;
         left["y1"] = p13Y;

         right["x0"] = p13X;
         right["y0"] = p13Y;

         right["cx"] = p22X;
         right["cy"] = p22Y;

         right["cx1"] = p31X;
         right["cy1"] = p31Y;

         right["x1"] = _c.get_x1();
         right["y1"] = _c.get_y1();

         return [left, right];
       }
    
      /**
       * Approximate a cubic bezier with a sequence of quadratic bezier curves
       * 
       * @param _c : Cubic Bezier - Reference to a cubic Bezier
       * 
       * @param _fit: Float - Measure of acceptable relative error between arc length of cubic and quad segments. This affects the quality of fit vs. number of quad.
       * segments generated.
       * 
       * @return Array - Array of Objects with x0, y0, cx, cy, and x1, y1 properties that comprise a sequence of quadratic bezier curves that 
       * approximate the original cubic bezier curve
       */
       , toQuadBezier(_c, _fit)
       {
         if( _c.getOrder() != 3 )
           return [];
         
         var finished = false;
         var i        = 0;
         
         if( _fit == null )
           _fit = 0.02;
         
         var bezierRef = new CubicBezierModule();
         var __cubic   = new bezierRef.CubicBezier();
         
         bezierRef = new QuadBezierModule();
         var __quad = new bezierRef.QuadBezier();
         
         // compute tolerance based on current user-specified fit
         var p;
         var cubic;
         var __numSeg    = 1;            // total number of quad bezier segments
         var inTolerance = [];           // true if the i-th segment is within tolerance
         
         // return array - start with subdivided cubics and then do quad. approx at end.
         var __return = [ _c.toObject() ];
         
         // recursive would be easier to write and more compact - this should be faster
         while( !finished )
         {
           // finished sweep - test each segment
           finished = true;
           __numSeg = __return.length;
           
           // test for too tight a tolerance or pathological conditions
           if( __numSeg >= 16 )
             break;
           
           for( i=0; i<__numSeg; ++i )
           {
             cubic = __return[i];
             p     = this.__intersect(cubic);
             if( __numSeg == 1 )
             {
               // force at least one subdivision
               inTolerance[i] = false;
               finished   = false; 
             }
             else
             {
               var r = __return[i];
               __cubic.fromObject( r );
               __quad.fromObject( {x0:r.x0, y0:r.y0, cx:p.px, cy:p.py, x1:r.x1, y1:r.y1} );
               
               var error  = this.__compare( __cubic, __quad);
               inTolerance[i] = error <= _fit;
               finished   = finished && inTolerance[i];
             }
           }

           // subdivide unfinished segments
           if( !finished )
           {
             var j    = 0;
             var sub  = [];
             var left;
             var right;
             
             var testArr = __return.slice();
             for( i=0; i<__numSeg; ++i )
             {
               if( !inTolerance[i] )
               {
                 __cubic.fromObject( testArr[i] );
                 
                 sub   = this.subdivideCubicBezier(0.5, __cubic, false);
                 left  = sub[0];
                 right = sub[1];
                 
                 if( __return.length == 1 )
                 {
                   __return[0] = left;
                   __return[1] = right;
                 }
                 else
                 {
                   __return[j] = left;
                   __return.splice(j+1, 0, right);
                 }
                 
                 j += 2;
               }
               else
                 j++;
             }
           }
         }
         
         // the return array currently contains a sequence of subdivided cubics that can be approximated by quads.  Compute the quad. sequence here by taking each
         // set of cubic endpoints and computing the intersection as the quad. bezier interior control point (cx, cy).
         
         for( i=0; i<__numSeg; ++i )
         {  
           cubic = __return[i];

           // compute middle control point for quad. bezier
           p = this.__intersect(cubic);

           // quadratic segment
           __return[i] = {x0:cubic.x0, y0:cubic.y0, cx:p.px, cy:p.py, x1:cubic.x1, y1:cubic.y1};
         }
         
         return __return;
       }
       
       // internal method - compare arc length of two curves and return the relative error between the distances
       , __compare( _c, _q )
       {
         var l1 = _c.lengthAt(1.0);
         var l2 = _q.lengthAt(1.0);
         var e = Math.abs(l1-l2)/l1;
         
         if( isNaN(e) )
         {
           e = 0;
           // tbd
         }
         
         return e;
       }
       
       // internal method - compute intersection of p0-p1 and p3-p2 segments
       , __intersect: function(_c)
       {
         var x0  = _c.x0;
         var y0  = _c.y0;
         var cx  = _c.cx;
         var cy  = _c.cy;
         var cx1 = _c.cx1;
         var cy1 = _c.cy1;
         var x1  = _c.x1;
         var y1  = _c.y1;
         
         var deltaX1 = cx - x0;
         var deltaX2 = cx1 - x1;
         var d1Abs   = Math.abs(deltaX1);
         var d2Abs   = Math.abs(deltaX2);
         var m1      = 0;
         var m2      = 0;
         var __pX;
         var __pY;
         
         if( d1Abs <= 0.0000001 )
         {
           __pX = x0;
           m2   = (cy1 - y1)/deltaX2;
           __pY = (d2Abs <= 0.0000001) ? (x0 + 3*(y0-x0)) : (m2*(x0-x1)+y1);
         }
         else if( d2Abs <= 0.0000001 )
         {
           __pX = x1;
           m1   = (cy - y0)/deltaX1;
           __pY = (d1Abs <= 0.0000001) ? (cx1 + 3*(cx1-x1)) : (m1*(x1-x0)+y0);
         }
         else
         {
           m1 = (cy - y0)/deltaX1;
           m2 = (cy1 - y1)/deltaX2;

           if( Math.abs(m1) <= 0.0000001 && Math.abs(m2) <= 0.0000001 )
           {
             __pX = 0.5*(x0 + x1);
             __pY = 0.5*(y0 + y1);
           }
           else
           {
             var b1 = y0 - m1*x0;
             var b2 = y1 - m2*x1;
             __pX   = (b2-b1)/(m1-m2);
             __pY   = m1*__pX + b1;
           }
         }
         
         return {px:__pX, py:__pY};
       }
    
      /**
       * Subdivide a quadratic Bezier curve at the specified parameter
       * 
       * @param _t : Float - Natural parameter in (0,1)
       * 
       * @param _q : QuadBezier - Reference to a quadratic Bezier 
       * 
       * @param _setLength : Bool - true if the segment lengths are to be measured
       * 
       * @return Array : Each element is an object with x0, y0, cx, cy, x1, y1, and length properties for each subdivided quad. segment.  Length
       * will be zero unless the _setLength parameter is set to true.  The natural parameter must be in the range (0,1) for a non-trivial return.
       */
      ,subdivideQuadBezier: function(_t, _q, _setLength)
      {
        if( _t <= 0 )
          return [];
        
        if( _t >= 1 )
          return [];
        
        if(_setLength == null) 
          _setLength = false;
        
        var t1 = 1.0 - _t;
  
        var cx = _t*_q.get_cx() + t1*_q.get_x0();
        var cy = _t*_q.get_cy() + t1*_q.get_y0();

        var px = _t*_q.get_x1() + t1*_q.get_cx();
        var py = _t*_q.get_y1() + t1*_q.get_cy();
    
        var q0 = {x0:0.0, y0:0.0, cx:0.0, cy:0.0, x1:0.0, y1:0.0, length:0.0};
        var q1 = {x0:0.0, y0:0.0, cx:0.0, cy:0.0, x1:0.0, y1:0.0, length:0.0};
    
        q0.x0 = _q.get_x0();
        q0.y0 = _q.get_y0();
        q0.cx = cx;
        q0.cy = cy;
        q0.x1 = _q.getX(_t);
        q0.y1 = _q.getY(_t);
    
        q1.x0 = q0.x1;
        q1.y0 = q0.y1;
        q1.cx = px;
        q1.cy = py;
        q1.x1 = _q.get_x1();
        q1.y1 = _q.get_y1();
    
        if( _setLength )
        {
          // first quad
          var __c0X = q0.x0;
          var __c0Y = q0.y0;

          var __c1X = 2.0*(q0.cx-q0.x0);
          var __c1Y = 2.0*(q0.cy-q0.y0);

          var __c2X = q0.x0-2.0*q0.cx+q0.x1;
          var __c2Y = q0.y0-2.0*q0.cy+q0.y1;
      
          var integrand = function(_t)
          {
            var dx = __c1X + 2*__c2X*_t;
            var dy = __c1Y + 2*__c2Y*_t;
      
            return Math.sqrt(dx*dx + dy*dy);
          }
          integrand.bind(this);
          
          q0.length = __integral.eval(integrand, 0, 1, 8);
      
          // second quad
          __c0X = q1.x0;
          __c0Y = q1.y0;

          __c1X = 2.0*(q1.cx - q1.x0);
          __c1Y = 2.0*(q1.cy - q1.y0);

          __c2X = q1.x0 -2.0*q1.cx + q1.x1;
          __c2Y = q1.y0 -2.0*q1.cy + q1.y1;
      
          q1.length = __integral.eval(integrand, 0, 1, 8);
        }
        else
        {
          q0.length = 0;
          q1.length = 0;
        }
    
        return [q0, q1];
      }
  
     /**
      * Return t at minimum x-value for a quadratic or cubic bezier curve
      * 
      * @param _curve : QuadBezier - Reference to a quadratic or cubic bezier
      * 
      * @return Float : Natural parameter corresponding to minimum x-value with t in [0,1]
      */
      , tAtMinX: function(_curve)
      {
	      if( _curve.getOrder() == 2 )
	      {
          var tStar = (_curve.get_x0() - _curve.get_cx()) / (_curve.get_x0() - 2*_curve.get_cx() + _curve.get_x1());
          var t     = 0;
          var minX  = _curve.getX(0);
     
          var newX = _curve.getX(1);
          if( newX < minX )
          {
            t    = 1;
            minX = newX;  
          }   
      
          if( tStar > 0 && tStar < 1 )
          {
            if( _curve.getX(tStar) < minX )
            {
              t = tStar;  
            }   
          }
      
          return t;
        }
	      else if ( _curve.getOrder() == 3 )
	      {
	        this.__cubicStationaryPoints(_curve, true);
	        
	        var t    = 0;
	        var minX = _curve.getX(0);
	        
	        var newX = _curve.getX(1);
	        if( newX < minX )
	        {
	          t    = 1;
	          minX = newX;  
	        }
	        
	        if( this._t1X > 0 && this._t1X < 1 )
	        {
	          newX = _curve.getX(this._t1X);
	          if( newX < minX )
	          {
	            t    = this._t1X;
	            minX = newX;
	          }  
	        }
	        
	        if( this._t2X > 0 && this._t2X < 1 )
	        {
	          if( _curve.getX(this._t2X) < minX )
	          {
	            t = this._t2X;
	          }  
	        }
	        
	        return t;
	      }
        else
	        return 0;
      }
      
      // private method - compute stationary points of a cubic bezier - if actual stationary point is outside t in [0,1], then the natural parameter is clipped
      , __cubicStationaryPoints: function(_c, useX)
      {
        var cObj = _c.getCoef();
        
        // given polynomial coefficients, the bezier curve equation is of the form c0 + c1*t + c2*t^2 + c3*t^3, so the derivative is of 
        // the form c1 + 2*c2*t + 3*c3*t^2, which has two roots
        var d  = -1;
        var t1 = -1;
        var t2 = -1;
        
        if( useX )
        {
          var _c1X = cObj.c1x;
          var _c2X = cObj.c2x;
          var _c3X = cObj.c3x;
          
          d = 4*_c2X*_c2X - 12*_c1X*_c3X;
          if( d >= 0 )
          {
            d     = Math.sqrt(d);
            var a = 6*_c3X;
            var b = 2*_c2X;
            t1    = (-b + d)/a;
            t2    = (-b - d)/a;
          }
          
          this._t1X = t1 >= 0 && t1 <= 1 ? t1 : 0;
          this._t2X = t2 >= 0 && t2 <= 1 ? t2 : 1;
        }
        else
        {
          var _c1Y = cObj.c1y;
          var _c2Y = cObj.c2y;
          var _c3Y = cObj.c3y;
          
          d = 4*_c2Y*_c2Y - 12*_c1Y*_c3Y;
          if( d >= 0 )
          {
            d  = Math.sqrt(d);
            a  = 6*_c3Y;
            b  = 2*_c2Y;
            t1 = (-b + d)/a;
            t2 = (-b - d)/a;
          }  
          
          this._t1Y = t1 >= 0 && t1 <= 1 ? t1 : 0;
          this._t2Y = t2 >= 0 && t2 <= 1 ? t2 : 1;
        }
      }
     
     /**
      * Return t at maximum x-value for a quadratic or cubic bezier curve
      * 
      * @param _curve : QuadBezier - Reference to a quadratic or cubic bezier
      * 
      * @return Float : Natural parameter corresponding to maximum x-value in [0,1]
      */
      , tAtMaxX: function(_curve)
      {
	      if( _curve.getOrder() == 2 )
	      {
          var tStar = (_curve.get_x0() - _curve.get_cx()) / (_curve.get_x0() - 2*_curve.get_cx() + _curve.get_x1());
          var t     = 0;
          var maxX  = _curve.getX(0);
     
          var newX = _curve.getX(1)
          if( newX > maxX )
          {  
            t    = 1;
            maxX = newX;  
          }
      
          if( tStar > 0 && tStar < 1 )
          {
            if( _curve.getX(tStar) > maxX )
            {
              t = tStar;  
            }  
          }
      
          return t;
        }
	      else if( _curve.getOrder() == 3 )
	      {
	        this.__cubicStationaryPoints(_curve, true);
	        
	        var t    = 0;
	        var maxX = _curve.getX(0);
	       
	        var newX = _curve.getX(1)
	        if( newX > maxX )
	        {
	          t    = 1;
	          maxX = newX;  
	        }
	        
	        if( this._t1X > 0 && this._t1X < 1 )
	        {
	          var newX = _curve.getX(this._t1X)
	          if( newX > maxX )
	          {
	            t    = this._t1X;
	            maxX = newX;
	          }  
	        }
	        
	        if( this._t2X > 0 && this._t2X < 1 )
	        {
	          if( _curve.getX(this._t2X) > maxX )
	          {
	            t = this._t2X;
	          }  
	        }
	        
	        return t;
	      }
	      else
	        return 0;
      }
    
     /**
      * Return t at minimum y-value for a quadratic or cubic bezier curve
      * 
      * @param _curve : QuadBezier - Reference to a quadratic or cubic bezier
      * 
      * @return Float : Natural parameter corresponding to minimum y-value (will support cubics in the future)
      */
      , tAtMinY: function(_curve)
      {
	      if( _curve.getOrder() == 2 )
	      {
          var tStar = (_curve.get_y0() - _curve.get_cy()) / (_curve.get_y0() - 2*_curve.get_cy() + _curve.get_y1());
          var t     = 0;
          var minY  = _curve.getY(0);
     
          var newY = _curve.getY(1)
          if( newY < minY )
          {
            t    = 1;
            minY = newY;  
          }
      
          if( tStar > 0 && tStar < 1 )
          {
            if( _curve.getY(tStar) < minY )
            {
              t = tStar;  
            }  
          }
      
          return t;
        }
	      else if( _curve.getOrder() == 3 )
	      {
	        this.__cubicStationaryPoints(_curve, false);
	        
	        var t    = 0;
	        var minY = _curve.getY(0);
	        
	        var newY = _curve.getY(1)
	        if( newY < minY )
	        {
	          t    = 1;
	          minY = newY;  
	        }
	        
	        if( this._t1Y > 0 && this._t1Y < 1 )
	        {
	          newY = _curve.getY(this._t1Y);
	          if( newY < minY )
	          {
	            t    = this._t1Y;
	            minY = newY;
	          }  
	        }
	        
	        if( this._t2Y > 0 && this._t2Y < 1 )
	        {
	          if( _curve.getY(this._t2Y) < minY )
	          {
	            t = this._t2Y;
	          }  
	        }
	        
	        return t;
	      }
	      else
	        return 0;
      }
    
     /**
      * Return t at maximum y-value for a quadratic or cubic bezier curve
      * 
      * @param _curve : QuadBezier - Reference to a quadratic or cubic bezier
      * 
      * @return Float : Natural parameter corresponding to maximum y-value in [0,1].
      */
      , tAtMaxY: function(_curve)
      {
	      if( _curve.getOrder() == 2 )
	      {
          var tStar = (_curve.get_y0() - _curve.get_cy()) / (_curve.get_y0() - 2*_curve.get_cy() + _curve.get_y1());
          var t     = 0;
          var maxY  = _curve.getY(0);
     
          var newY =  _curve.getY(1);
          if( newY > maxY )
          {
            t    = 1;
            maxY = newY;  
          }
      
          if( tStar > 0 && tStar < 1 )
          {
            if( _curve.getY(tStar) > maxY )
            {
              t = tStar;  
            }    
          }
      
          return t;
        }
	      else if( _curve.getOrder() == 3 )
	      {
	        this.__cubicStationaryPoints(_curve, false);
	        
	        var t    = 0;
	        var maxY = _curve.getY(0);
	       
	        var newY = _curve.getY(1);
	        if( newY > maxY )
	        {
	          t    = 1;
	          maxY = newY;  
	        }
	        
	        if( this._t1Y > 0 && this._t1Y < 1 )
	        {
	          newY = _curve.getY(this._t1Y)
	          if( newY > maxY )
	          {
	            t    = this._t1Y;
	            maxY = newY;
	          }  
	        }
	        
	        if( this._t2Y > 0 && this._t2Y < 1 )
	        {
	          if( _curve.getY(this._t2Y) > maxY )
	          {
	            t = this._t2Y;
	          }  
	        }
	        
	        return t;
	      }
	      else
	        return 0;
      }

     /**
      * Return t at specified y-value for a quadratic bezier curve
      * 
      * @param _curve : QuadBezier - Reference to a quadratic bezier
      * 
      * @param _y : Float - y-value for which natural parameter is desired
      * 
      * @return Float : Natural parameter corresponding to specified y-value (will support cubics in the future)
      */
      , getTAtY: function(_curve, _y)
      {
	      if( _curve.getOrder() == 2 )
	      {
          // return the minimum of the two possible parameter values
          var _x0   = _curve.get_x0();
	        var _y0   = _curve.get_y0();
	        var _cx   = _curve.get_cx();
	        var _cy   = _curve.get_cy();
	        var _x1   = _curve.get_x1();
	        var _y1   = _curve.get_y1();
	
          var __c0X = _x0;
          var __c0Y = _y0;

          var __c1X = 2.0*(_cx - _x0);
          var __c1Y = 2.0*(_cy - _y0);

          var __c2X = _x0 - 2.0*_cx + _x1;
          var __c2Y = _y0 - 2.0*_cy + _y1;
	
          var c = __c0Y - _y;
          var b = __c1Y;
          var a = __c2Y;
	  
	        if( Math.abs(a) < 0.00001 )
	        {
		        // solve linear equation in y
		        return -__c0Y/__c1Y;
	        }
      
          var d = b*b - 4*a*c;
          if( d < 0 )
          {
            // no solutions
            return 0;
          }
      
          d      = Math.sqrt(d);
          a      = 1/(a + a);
          var t0 = (d-b)*a;
          var t1 = (-b-d)*a;
    
          // one of the roots could be BS, so take the one that produces a t-value whose y-value on the curve that most closely matches the input, unless
          // both values are 'sufficiently close' in which case, take any root in [0,1]
          var y0 = _curve.getY(t0);
          var y1 = _curve.getY(t1);
          var d0 = Math.abs(y0-_y);
          var d1 = Math.abs(y1-_y);
          
          if( Math.abs(d0-d1)/d0 < 0.005 )
          {
            if( t0 >= 0 && t0 <= 1 )
              return t0;
            else
              return t1;
          }
    
          if( d0 <= d1 )
            return t0;
          else 
            return t1;
	      }
	      else
	        return 0;
      }
      
     /**
      * Join an input quadratic beizer at an arbitrary point with a second quadratic bezier - this is useful for producing quick 's-shaped' curves that can be
      * drawn quickly as two simple curveTo() commands in a Canvas environment.
      *
      * @param _x : Number -x-coordinate of final interpolation point of output quadratic Bezier.
      * 
      * @param _y : Number - y-coordinate of final interpolation point of output quadratic Bezier.
      * 
      * @param _tension : Number - tension parameter between 0 and 1.  0 produces a near linear curve while 1 produces a curve whose control point is the projection of (_x,_y),
      * onto the vector from (cx,cy) to (x1,y1), unless that point is less than one third the distance from (cx,cy) to (x1,y1).  This may be broken into two parameters in 
      * the future for more control.  Values outside the interval [0,1] are clipped to either 0 or 1.
      *
      * @return Object - Quadratic Bezier parameters x0, y0, cx, cy, and x1, y1 such that the new quad. Bezier can be considered an 'add on' curve to the input
      * quadratic bezier with matching tangents at the join (endpoint of input bezier).  NOTE:  The sequence of points should form a natural connected shape to
      * begin with or the algorithm can break down; there is no error-testing for performance reasons.
      *
      */
      , quadBezierJoin(_bezier, _x, _y, _tension)
      {
        var cx      = _bezier.get_cx();
        var cy      = _bezier.get_cy();
        var x1      = _bezier.get_x1();
        var y1      = _bezier.get_y1();
        var deltaX  = x1 - cx;
        var deltaY  = y1 - cy;
        var m1      = 0;
        var m2      = 0;
        var pX      = 0;
        var pY      = 0;
        var tension = Math.max(_tension,0);
        tension     = Math.min(tension,1);
            
        // get the t-parameter corresponding to projecting the vector from (_x,_y) to (px,py) onto the vector from (cx,cy) to (x1,y1).  This determines the 'direction'
        // of the projection point.  Tbd - will need to test vs. the tension parameter to avoid kinking.
        var t      = ((_x-cx)*(x1-cx) + (_y-cy)*(y1-cy)) / (deltaX*deltaX + deltaY*deltaY);
        var target = 1 + tension/3;
        t          = t < target ? target : 1 + tension*(t-1); 
           
        pX = cx + t*deltaX;
        pY = cy + t*deltaY;
            
        return {x0:x1, y0:y1, cx:pX, cy:pY, x1:_x, y1:_y};
      }
        
     /**
      * Compute the inflection points of a cubic Bezier curve
      * 
      * @param _curve : Cubic Bezier - must be a jsMathToolkit CubicBezier - no error checking for performance reasons
      * 
      * @return Array - Natural parameter in [0,1] corresponding to each inflection point (maximum of two - one is expected case)
      */
      , cubicInflection: function(_curve)
      {
        var __p0X = _curve.get_x0();
        var __p0Y = _curve.get_y0();
        var __p1X = _curve.get_cx();
        var __p1Y = _curve.get_cy();
        var __p2X = _curve.get_cx1();
        var __p2Y = _curve.get_cy1();
        var __p3X = _curve.get_x1();
        var __p3Y = _curve.get_y1();
          
        var aX = -__p0X + 3*(__p1X - __p2X) + __p3X;
        var aY = -__p0Y + 3*(__p1Y - __p2Y) + __p3Y;

        var bX = 3*(__p0X - 2*__p1X + __p2X);
        var bY = 3*(__p0Y - 2*__p1Y + __p2Y);

        var cX = 3*(__p1X -__p0X);
        var cY = 3*(__p1Y -__p0Y);

        // both velocity and acceleration are zero at the inflection point(s)
        var dInverse = 1.0/(aY*bX - aX*bY);
        var tC       = -0.5*((aY*cX - aX*cY)*dInverse);
        var radical  = tC*tC - 0.333333333334*((bY*cX - bX*cY)*dInverse);

        if( radical < 0 )
          return [];
        else
        {
          var inflect = [];
            
          var tS = Math.sqrt(radical);
          var t1 = tC - tS;
          var t2 = tC + tS;
            
          if( t1 >= 0 && t1 <= 1 ) 
            inflect.push(t1);
            
          if( t2 >= 0 && t2 <= 1 ) 
            inflect.push(t2);
        }
      }
      
     /**
      * Find the closest point on a quadratic or cubic Bezier curve to an arbitrary point
      *
      * @param _curve: Dynamic Reference to QuadBezier or CubicBezier
      * 
      * @param _p:Point reference to Point to which the closest point on the Bezier curve is desired
      *
      * @return Number t-parameter of the closest point on the parametric curve.  Returns 0 if inputs are invalid
      *
      * Credit: This code is derived from the Graphic Gem, "Solving the Nearest-Point-On-Curve Problem", by P.J. Schneider, published in 'Graphic Gems', 
      * A.S. Glassner, ed., Academic Press, Boston, 1990, pp. 607-611.
      *
      */
      , closestPointToBezier: function( _curve, _p )
      {
        if( _curve == null || _p == null )
        {
          return 0;
        }
            
        this.__dMinimum = 0;
        
        var _px = _p.get_x();
        var _py = _p.get_y();
        
        // record distances from point to endpoints
        var px = _curve.getX(0);
        var py = _curve.getY(0);
        var deltaX = px-_px;
        var deltaY = py-_py;
        var d0     = Math.sqrt(deltaX*deltaX + deltaY*deltaY);
            
        px     = _curve.getX(1);
        py     = _curve.getY(1);
        deltaX = px-_px;
        deltaY = py-_py;
        var d1 = Math.sqrt(deltaX*deltaX + deltaY*deltaY);
            
        var n = _curve.getOrder();
            
        // array of control points
        var v    = [];
        var cObj = _curve.toObject();
        if( n == 2 )
        {
          v[0] = new pointRef.Point(cObj.x0, cObj.y0);
          v[1] = new pointRef.Point(cObj.cx, cObj.cy);
          v[2] = new pointRef.Point(cObj.x1, cObj.y1);
        }
        else
        {
          v[0] = new pointRef.Point(cObj.x0 , cObj.y0 );
          v[1] = new pointRef.Point(cObj.cx , cObj.cy );
          v[2] = new pointRef.Point(cObj.cx1, cObj.cy1);
          v[3] = new pointRef.Point(cObj.x1 , cObj.y1 );
        }
            
        // instaead of power form, convert the function whose zeros are required to Bezier form
        var w = this.toBezierForm(_p, v);
            
        // Find roots of the Bezier curve with control points stored in 'w' (algorithm is recursive, this is root depth of 0)
        var roots = this.findRoots(w, 2*n-1, 0);
            
        // compare the candidate distances to the endpoints and declare a winner :)
        if( d0 < d1 )
        {
          var tMinimum = 0;
          __dMinimum   = d0;
        }
        else
        {
          tMinimum   = 1;
          __dMinimum = d1;
        }
            
        var i;
        var t;
        var d;
        
        // tbd - compare 2-norm squared
        for( i=0; i<roots.length; ++i )
        {
          t = roots[i];
          if( t >= 0 && t <= 1 )
          {
            deltaX       = _curve.getX(t) - _px;
            deltaY       = _curve.getY(t) - _py;
            d = Math.sqrt(deltaX*deltaX + deltaY*deltaY);
                
            if( d < __dMinimum )
            {
              tMinimum    = t;
              __dMinimum = d;
            }
          }
        }
            
        // tbd - alternate optima.
        return tMinimum;
      } 
          
      // internal method - compute control points of the polynomial resulting from the inner product of B(t)-P and B'(t), constructing the result as a Bezier
      // curve of order 2n-1, where n is the degree of B(t).
      , toBezierForm: function(_p, _v)
      {
        var row    = 0;  // row index
        var column = 0;  // column index
            
        var c = [];  // V(i) - P
        var d = [];  // V(i+1) - V(i)
        var w = [];  // control-points for Bezier curve whose zeros represent candidates for closest point to the input parametric curve
         
        var n      = _v.length-1;    // degree of B(t)
        var degree = 2*n-1;          // degree of B(t) . P
            
        var pX = _p.get_x();
        var pY = _p.get_y();
            
        var i;
        var v, v1;
        for( i=0; i<=n; ++i )
        {
          v    = _v[i];
          c[i] = new pointRef.Point(v.get_x() - pX, v.get_y() - pY);
        }
            
        var s = n;
        for( i=0; i<=n-1; ++i )
        {
          v    = _v[i];
          v1   = _v[i+1];
          d[i] = new pointRef.Point( s*(v1.get_x()-v.get_x()), s*(v1.get_y()-v.get_y()) );
        }
            
        var cd = [];
        var di, dx, dy;
        // inner product table
        for( row=0; row<=n-1; ++row )
        {
          var di = d[row];
          var dX = di.get_x();
          var dY = di.get_y();
              
          for( col=0; col<=n; ++col )
          {
            var k = this.getLinearIndex(n+1, row, col);
            cd[k] = dX*c[col].get_x() + dY*c[col].get_y();
            k++;
          }
        }
            
        // Bezier is uniform parameterized
        var dInv = 1.0/Number(degree);
        for( i=0; i<=degree; ++i )
        {
          w[i] = new pointRef.Point(i*dInv, 0);
        }
            
        // reference to appropriate pre-computed coefficients
        var z = n == 3 ? this.Z_CUBIC : this.Z_QUAD;
            
        // accumulate y-coords of the control points along the skew diagonal of the (n-1) x n matrix of c.d and z values
        var m = n-1;
        var lb;
        var j;
        var index;
        var py;
        for( k=0; k<=n+m; ++k ) 
        {
          lb = Math.max(0, k-m);
          ub = Math.min(k, n);
          for( i=lb; i<=ub; ++i) 
          {
            j     = k - i;
            p     = w[i+j];
            index = this.getLinearIndex(n+1, j, i);
                
            py  = p.get_y();
            py += cd[index]*z[index];
            p.set_y(py);
            
            w[i+j] = p;
          }
        }
            
        return w; 
      }
          
      // internal method - convert 2D array indices in a k x n matrix to a linear index (this is an interim step ahead of a future implementation optimized for 1D array indexing)
      , getLinearIndex: function(_n, _row, _col)
      {
        // no range-checking; you break it ... you buy it!
        return _row*_n + _col;
      }
          
      // internal method - how many times does the Bezier curve cross the horizontal axis - the number of roots is less than or equal to this count
      , crossingCount: function(_v, _degree)
      {
        var i;
        var nCrossings = 0;
        var sign       = _v[0].get_y() < 0 ? -1 : 1;
        var oldSign    = sign;
        for( i=1; i<=_degree; ++i) 
        {
          sign = _v[i].get_y() < 0 ? -1 : 1;
          if( sign != oldSign ) 
            nCrossings++;
                 
           oldSign = sign;
        }
            
        return nCrossings;
      }
          
      // is the control polygon for a Bezier curve suitably linear for subdivision to terminate?
      , isControlPolygonLinear: function(_v, _degree) 
      {
        // Given array of control points, _v, find the distance from each interior control point to line connecting v[0] and v[degree]
          
        // implicit equation for line connecting first and last control points
        var a = _v[0].get_y() - _v[_degree].get_y();
        var b = _v[_degree].get_x() - _v[0].get_x();
        var c = _v[0].get_x() * _v[_degree].get_y() - _v[_degree].get_x() * _v[0].get_y();
          
        var abSquared = a*a + b*b;
        var distance  = [];       // Distances from control points to line
          
        var i;
        for( i=1; i<_degree; ++i) 
        {
          // Compute distance from each of the points to that line
          distance[i] = a * _v[i].get_x() + b * _v[i].get_y() + c;
          if( distance[i] > 0.0 ) 
          {
            distance[i] = (distance[i] * distance[i]) / abSquared;
          }
          if( distance[i] < 0.0 ) 
          {
            distance[i] = -((distance[i] * distance[i]) / abSquared);
          }
        }
          
        // Find the largest distance
        var maxDistanceAbove = 0.0;
        var maxDistanceBelow = 0.0;
        for( i=1; i<_degree; ++i) 
        {
          if( distance[i] < 0.0 ) 
          {
            maxDistanceBelow = Math.min(maxDistanceBelow, distance[i]);
          }
          if( distance[i] > 0.0 ) 
          {
            maxDistanceAbove = Math.max(maxDistanceAbove, distance[i]);
          }
        }
          
        // Implicit equation for zero line
        var a1 = 0.0;
        var b1 = 1.0;
        var c1 = 0.0;
          
        // Implicit equation for "above" line
        var a2 = a;
        var b2 = b;
        var c2 = c + maxDistanceAbove;
          
        var det  = a1*b2 - a2*b1;
        var dInv = 1.0/det;
              
        var intercept1 = (b1*c2 - b2*c1)*dInv;
          
        //  Implicit equation for "below" line
        a2 = a;
        b2 = b;
        c2 = c + maxDistanceBelow;
              
        var intercept2 = (b1*c2 - b2*c1)*dInv;
          
        // Compute intercepts of bounding box
        var leftIntercept  = Math.min(intercept1, intercept2);
        var rightIntercept = Math.max(intercept1, intercept2);
          
        var error = 0.5*(rightIntercept-leftIntercept);    
              
        return error < this.EPSILON;
      }
          
      // internal method - compute intersection of line segnet from first to last control point with horizontal axis
      , computeXIntercept: function(_v, _degree)
      {
        var XNM = _v[_degree].get_x() - _v[0].get_x();
        var YNM = _v[_degree].get_y() - _v[0].get_y();
        var XMK = _v[0].get_x();
        var YMK = _v[0].get_y();
          
        var detInv = - 1.0/YNM;
          
        return (XNM*YMK - YNM*XMK) * detInv;
      }
          
      // internal method - return roots in [0,1] of a polynomial in Bernstein-Bezier form
      , findRoots(_w, _degree, _depth)
      {  
        var t = []; // t-values of roots
        var m = 2*_degree-1;
            
        switch( this.crossingCount(_w, _degree) ) 
        {
          case 0: 
            return [];   
          break;
                 
          case 1: 
            // Unique solution - stop recursion when the tree is deep enough (return 1 solution at midpoint)
            if( _depth >= this.MAX_DEPTH ) 
            {
              t[0] = 0.5*(_w[0].get_x() + _w[m].get_x());
              return t;
            }
                  
            if( this.isControlPolygonLinear(_w, _degree) ) 
            {
              t[0] = this.computeXIntercept(_w, _degree);
              return t;
            }
          break;
        }
       
        // Otherwise, solve recursively after subdividing control polygon
        var left  = [];
        var right = [];
             
        // child solutions
               
        this.subdivide(_w, 0.5, left, right);
        var leftT  = this.findRoots(left,  _degree, _depth+1);
        var rightT = this.findRoots(right, _degree, _depth+1);
           
        // Gather solutions together
        for( i= 0; i<leftT.length; ++i) 
          t[i] = leftT[i];
             
        for( i=0; i<rightT.length; ++i) 
          t[i+leftT.length] = rightT[i];
          
        return t;
      }
          
      // internal method - deCasteljau subdivision of an arbitrary-order Bezier curve
      //
      // _c : Array array of control points for the Bezier curve
      // _t : Number t-parameter at which the curve is subdivided (must be in (0,1) = no check at this point
      // _left : Array reference to an array in which the control points, <code>Array</code> of <code>Point</code> references, of the left control cage after subdivision are stored
      // _right : Array reference to an array in which the control points, <code>Array</code> of <code>Point</code> references, of the right control cage after subdivision are stored
      , subdivide: function( _c, _t, _left, _right )
      {
        var degree = _c.length-1;
        var n      = degree+1;
        var p      = _c.slice();
        var t1     = 1.0 - _t;
        var vertex;
        var i, j;
        
        for( i=1; i<=degree; ++i ) 
        {  
          for( j=0; j<=degree-i; ++j ) 
          {
            var ij     = this.getLinearIndex(n, i, j);
            var im1j   = this.getLinearIndex(n, i-1, j);
            var im1jp1 = this.getLinearIndex(n, i-1, j+1);
                
            vertex = new pointRef.Point( t1*p[im1j].get_x() + _t*p[im1jp1].get_x(), t1*p[im1j].get_y() + _t*p[im1jp1].get_y() );
            p[ij]  = vertex;
          }
        }
            
        for( j=0; j<=degree; ++j )
        {
          var index = this.getLinearIndex(n, j, 0);
          _left[j]  = p[index];
        }
              
        for( j=0; j<=degree; ++j) 
        {
           index    = this.getLinearIndex(n, degree-j, j);
          _right[j] = p[index];
        }
      }
    }
  }
  
  return returnedModule;
});
