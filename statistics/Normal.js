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

define(['../utils/GeomUtils', '../planarCurves/QuadBezier'], function (GeomUtilsModule, QuadBezierModule) 
{
  var returnedModule = function () 
  {
    var utilsRef    = new GeomUtilsModule();
    var __geomUtils = new utilsRef.GeomUtils();
    
  /**
   * Some basic functions for the venerable normal distribution.
   * 
   * @author Jim Armstrong (www.algorithmist.net)
   * 
   * @version 1.0
   * 
   */
    this.Normal = function()
    {
      this.SQRT_2    = Math.sqrt(2);
      this.SQRT_2_PI = Math.sqrt(Math.PI + Math.PI);
      
      this._mean = 0.0;
      this._std  = 1.0;
      
      // for rational approx. of inv. cumulative normal
      this.__a = [ -39.69683028665376,  220.9460984245205, -275.9285104469687,  138.3577518672690, -30.66479806614716,  2.506628277459239 ];
      
      this.__b = [ -54.47609879822406,  161.5858368580409, -155.6989798598866,  66.80131188771972, -13.28068155288572 ];
         
      this.__c = [ -.007784894002430293, -.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968,  2.938163982698783 ];
      
      this.__d = [ .007784695709041462,  .3224671290700398, 2.445134137142996,  3.754408661907416 ];
      
      this.__bezier = null;
    }
   
    this.Normal.__name__ = true;
    this.Normal.prototype = 
    {
     /**
      * Access the current mean
      * 
      * @return Number - Current mean of the distribution
      */
      get_mean: function()
      {
        return this._mean; 
      }
    
     /**
      * Access the current standard deviation
      * 
      * @return Number - Current std. deviation of the distribution
      */
      , get_std: function()
      {
        return this._std;
      }
      
     /**
      * Assign a mean to this normal distribution
      * 
      * @param value : Number - Mean for the normal distribution (must be greater than or equal to zero)
      * 
      * @return Nothing
      */
      , set_mean: function(value)
      {
        this._mean = !isNaN(value) && value >= 0 ? parseFloat(value) : this._mean
      }
      
     /**
      * Assign a standard deviation to this normal distribution
      * 
      * @param value : Number - Std. dev. for the normal distribution (must be greater than or equal to zero)
      * 
      * @return Nothing
      */
      , set_std: function(value)
      {
        this._std = !isNaN(value) && value >= 0 ? parseFloat(value) : this._std;
      }
      
     /**
      * Compute the probability that N(X) <= x
      * 
      * @param x : Number - Input value to test
      * 
      * @return Number - P( N(X) <= x ) 
      * 
      */
      , normaldist: function( x )
      {
        if( isNaN(x) )
          return 0;
        
        // normalize
        var z = (x - this._mean)/this._std;
        
        return this.__normalCDF(z);
      }
      
     /**
      * Inverse normal distribution
      * 
      * @param p : Number - Probability in (0,1)
      * 
      * @return Number :  x such that P(X<=x) = p.  Note that p MUST be strictly in the interval (0,1).  You break it, you buy it.
      */
      , invnormaldist: function(p)
      {
        var inv = this.__invNormalCDF(p);
        
        return this._std*inv + this._mean;
      }
      
     /**
      * Prediction interval
      * 
      * @param n : Number - Number of standard deviations from the mean - must be greater than zero and typically less than 4.
      * 
      * @return Number : Probability that a sample from the current normal distribution lies within n standard deviations of the mean.  The result is computed for
      * a standard normal distribution.
      */
      , predictionInterval: function(n)
      {
        if( n <= 0 )
          return 0;
        
        return this.__normalCDF(n) - this.__normalCDF(-n) ;
      }
      
     /**
      * Return the prediction or confidence interval as a multiplier to the standard deviation such that a sample from the distribution is expected to be inside that
      * range with the supplied probability.
      * 
      * @param p : Number - Probability - must be in (0,1)
      * 
      * @return Number - If u is the mean and s is the standard deviation, then X is expected to be in u +/- ns with probability, p.
      */
      , inversePredictionInterval: function(p)
      {
        if( p <= 0 || p >= 1 )
          return NaN;
        
        return this.SQRT_2*this.__invERF(p);
      }
      
     /**
      * Evaluate the normal function at the supplied input value
      * 
      * @param x : Number - x-coordinate
      * 
      * @return Number - N(x) or normal distribution function (not CDF) evaluated at x
      */
      , get_normal: function(_x)
      {
        var z = (_x-this._mean)/this._std;
        var d = -0.5*z*z;
        var c = 1/(this._std*this.SQRT_2_PI);
        
        return c * Math.exp(d); 
      }
      
     /**
      * Evaluate the first derivative of the normal function at the supplied input value
      * 
      * @param x : Number - x-coordinate
      * 
      * @return dN(x)/dx
      */
      , get_normal_derivative: function(_x)
      {
        var s = this._std*this._std;
        var f = this.get_normal(_x);
        
        return (this._mean-_x)*f/s;
      }
      
     /**
      * Return a sequence of quadratic bezier curves that approximate the current normal curve over the supplied interval
      * 
      * @param a : Number - Left endpoint of interval
      * 
      * @param b : Number - Right endpoint of interval, b > a
      * 
      * @return Array - Sequence of quadratic bezier curves that approximate the current normal distribution over the specified interval.  If b <= a, an empty array is returned.  
      * You break it, you buy it.
      * 
      */
      , toBezier: function(_a, _b)
      {
        if( isNaN(_a) || isNaN(_b) || _b <= _a )
          return [];

        // In terms of graphing, it is necessary to capture the single extreme point at x=u and the two inflection points at x = u +/= s, provided they fall in [a,b], as
        // interpolation points of the quad. bezier sequence.
        //
        // One pass of iterative refinement has shown to be suitable for online or device-based graphing applications.  
        var stack = [];
        if( _a < this._mean )
        {
          stack = this.__leftOfMean(_a, Math.min(this._mean, _b) );
          
          if( _b > this._mean )
            stack = stack.concat( this.__rightOfMean(this._mean,_b) );
        }
        else
          stack = this.__rightOfMean(_a, _b);
        
        return stack;
      }
      
      // internal method - bezier sequence for [a,c], c = min(u,b), where u is the current mean
      , __leftOfMean(a, b)
      {
        // left endpoint
        var x0 = a;
        var y0 = this.get_normal(a);
        var m  = this.get_normal_derivative(a);
        var x1 = x0+1;
        var y1 = y0+m;
        
        // first division is at inflection point u-s or midpoint if a >= u-s
        var xVal, yVal;
        var x2, x3, y2, y3;
        if( a < this._mean-this._std )
          xVal = this._mean-this._std;
        else
          xVal = 0.5*(a+b);
        
        yVal = this.get_normal(xVal);
        
        // slope and vectors along either direction of the curve
        m  = this.get_normal_derivative(xVal);
        x2 = xVal+1;
        x3 = xVal-1;
        y2 = yVal+m;
        y3 = yVal-m;
        
        var q = {};
        q.x0  = x0;
        q.y0  = y0;
        var o = __geomUtils.lineIntersection(x0, y0, x1, y1, xVal, yVal, x3, y3);
        
        q.cx = o.x;
        q.cy = o.y;
        q.x1 = xVal;
        q.y1 = yVal;
        
        var split;
        var stack = [];
        if( this._std <= 1 )
        { 
          split = this.__split(q);
          stack = [split.left, split.right];
        }
        else
          stack = [q];
        
        var x4, y4, x5, y5;
        if( b == this._mean )
        {
          x4 = this._mean-1;
          y4 = 1/(this._std*this.SQRT_2_PI);
        
          x5 = this._mean;
          y5 = y4;
        }
        else
        {
          x5 = b;
          y5 = this.get_normal(x5);
          m  = this.get_normal_derivative(x5);
          
          x4 = x5-1;
          y4 = y-m;
        }
        
        o    = __geomUtils.lineIntersection(xVal, yVal, x2, y2, x5, y5, x4, y4);
        q    = {};
        q.x0 = xVal;
        q.y0 = yVal;
        q.cx = o.x;
        q.cy = o.y;
        q.x1 = x5;
        q.y1 = y5;
        
        stack.push(q);
        
        if( this._std <= 1 )
        {
          if( !this.__bezier )
          {
            var quadRef   = new QuadBezierModule();
            this.__bezier = new quadRef.QuadBezier();
          }
          
          // refine inner segments - final segment is tested for refinement in case right endpoint less than mean or extremely small sigma
          var x, y, yNorm;
          for( i=1; i<stack.length; ++i )
          {
            q = stack[i];
            
            this.__bezier.fromObject(q);
            x = this.__bezier.getX(0.5);
            y = this.__bezier.getY(0.5);
            
            yNorm = this.get_normal(x);
            
            // this test is a bit arbitrary and is based on how closely you want to match for typical online and device-based graphing applications.
            if( Math.abs(y-yNorm) > 0.025 )
            {
              // refine - because of the shape of the normal curve, it will always be the rightmost segment that may need further refining, but for most all
              // cases, one refinement is all that will be required.
              split    = this.__split(q);
              stack[i] = split.left;
              stack.splice(i+1, 0, split.right);
            }
          }
          
          // tbd, for extremely low sigmas, the final segment may need refining to better match curvature at x=u.  See if this will be necessary based on actual
          // user experience
        }
        
        return stack;
      }
      
      // internal method - bezier sequence for [c,b], c = max(a,u), where u is the current mean
      , __rightOfMean(a, b)
      {
        // left endpoint
        var x0 = a;
        var y0 = this.get_normal(a);
        var m  = this.get_normal_derivative(a);
        var x1 = x0+1;
        var y1 = y0+m;
        
        // first division is at inflection point u+s or midpoint if a >= u+s
        var xVal, yVal;
        var x2, x3, y2, y3;
        if( a < this._mean+this._std )
          xVal = this._mean+this._std;
        else
          xVal = 0.5*(a+this._mean+this._std);
        
        yVal = this.get_normal(xVal);
        
        // slope and vectors along either direction of the curve
        m  = this.get_normal_derivative(xVal);
        x2 = xVal+1;
        x3 = xVal-1;
        y2 = yVal+m;
        y3 = yVal-m;
        
        var q = {};
        q.x0  = x0;
        q.y0  = y0;
        var o = __geomUtils.lineIntersection(x0, y0, x1, y1, xVal, yVal, x3, y3);
        
        q.cx = o.x;
        q.cy = o.y;
        q.x1 = xVal;
        q.y1 = yVal;
        
        var split;
        var stack = [q];
        
        var x4, y4, x5, y5;
        x5 = b;
        y5 = this.get_normal(x5);
        m  = this.get_normal_derivative(x5);
        
        x4 = x5-1;
        y4 = y5-m;
        
        o    = __geomUtils.lineIntersection(xVal, yVal, x2, y2, x5, y5, x4, y4);
        q    = {};
        q.x0 = xVal;
        q.y0 = yVal;
        q.cx = o.x;
        q.cy = o.y;
        q.x1 = x5;
        q.y1 = y5;
        
        if( this._std <= 1 )
        { 
          split = this.__split(q);
          stack.splice(1, 0, split.left, split.right);
        }
        else
          stack.push(q);
          
        if( this._std <= 1 )
        {
          if( !this.__bezier )
          {
            var quadRef   = new QuadBezierModule();
            this.__bezier = new quadRef.QuadBezier();
          }
          
          // refine inner segments - similar to 'left of mean' except that all segments need refinement test except last
          var x, y, yNorm;
          for( i=0; i<stack.length-1; ++i )
          {
            q = stack[i];
            
            this.__bezier.fromObject(q);
            x = this.__bezier.getX(0.5);
            y = this.__bezier.getY(0.5);
            
            yNorm = this.get_normal(x);
            
            // this test is a bit arbitrary and is based on how closely you want to match for typical online and device-based graphing applications.
            if( Math.abs(y-yNorm) > 0.025 )
            {
              // refine - because of the shape of the normal curve, it will always be the rightmost segment that may need further refining, but for most all
              // cases, one refinement is all that will be required.
              split    = this.__split(q);
              stack[i] = split.left;
              stack.splice(i+1, 0, split.right);
            }
          }
          
        }
        
        return stack;
      }
      
      // internal method - split a quad bezier at the approximate midpoint of the normal curve (not the bezier - this is not bezier subdivision) - we take x at t = 0.5
      // as an approximation to the midpoint of the normal curve segment.
      , __split(q)
      {
        if( !this.__bezier )
        {
          var quadRef   = new QuadBezierModule();
          this.__bezier = new quadRef.QuadBezier();
        }
        
        // get x at t = 0.5
        this.__bezier.fromObject(q);
        var x0  = q.x0;
        var y0  = q.y0;
        var m   = this.get_normal_derivative(x0);
        var x0m = x0 + 1;
        var y0m = y0 + m;
        
        var xm = this.__bezier.getX(0.5);
        var ym = this.get_normal(xm);
        var m  = this.get_normal_derivative(xm);
        
        var x1m = xm-1;
        var y1m = ym-m;
        
        // compute control point for left approximating quad. 
        var o = __geomUtils.lineIntersection(x0, y0, x0m, y0m, xm, ym, x1m, y1m);
        
        var left = {};
        left.x0 = q.x0;
        left.y0 = q.y0;
        left.cx = o.x;
        left.cy = o.y;
        left.x1 = xm;
        left.y1 = ym;
        
        // right quad bezier
        x0  = xm;
        y0  = ym;
        x0m = x0+1
        y0m = y0+m;
        
        var x1 = q.x1;
        var y1 = this.get_normal(x1);
        m      = this.get_normal_derivative(x1);
        
        x1m = x1-1;
        y1m = y1-m;
        
        // control point for right approximating quad.
        o = __geomUtils.lineIntersection(x0, y0, x0m, y0m, x1, y1, x1m, y1m);
        var right = {};
        right.x0 = x0;
        right.y0 = y0;
        right.cx = o.x;
        right.cy = o.y;
        right.x1 = x1;
        right.y1 = y1;
        
        return {left:left, right:right};
      }
      
      // internal methods for normal CDF and inverse
      //
      // References:  Hart, J.F., Computer Approximations, SIAM Series in Applied Mathematics, Wiley, N.Y., 1968.
      // Cody, J.W., Rational Chebyshev Approximations for the Error Function, Math. Comp., 1969, pp. 631-637.
      // lest anyone think I'm making this up myself :) 
      , __normalCDF: function(x)
      {
        var b, c, exp;
        
        // Hart approximation
        var zAbs = Math.abs(x);
          
        if( zAbs > 37 )
          return 0;
          
        exp = Math.exp(-0.5*zAbs*zAbs);
        if( zAbs < 7.07106781186547 )
        {
          b = 0.0352624965998911*zAbs + 0.700383064443688;
          b = b*zAbs + 6.37396220353165;
          b = b*zAbs + 33.912866078383;
          b = b*zAbs + 112.079291497871;
          b = b*zAbs + 221.213596169931;
          b = b*zAbs + 220.206867912376;
          c = exp*b;
          
          b = 0.0883883476483184*zAbs + 1.75566716318264;
          b = b*zAbs + 16.064177579207;
          b = b*zAbs + 86.7807322029461;
          b = b*zAbs + 296.564248779674;
          b = b*zAbs + 637.333633378831;
          b = b*zAbs + 793.826512519948;
          b = b*zAbs + 440.413735824752;
          
          c = c/b;
        }
        else
        {
          b = zAbs + 0.65;
          b = zAbs + 4/b;
          b = zAbs + 3/b;
          b = zAbs + 2/b;
          b = zAbs + 1/b;
            
          c = exp / b / 2.506628274631;
        }
          
        if( x > 0 )
          c = 1-c;
      
        return c;
      }
      
      // internal method, inverse normal CDF.  Serious props to Peter J. Acklman.
      , __invNormalCDF: function(p)
      {
        if( isNaN(p) || p > 1.0 || p < 0.0 )
          return NaN;
        
        if( Math.abs(p) < 0.0000000000001 )
          return -Number.MAX_VALUE;
         
        if( Math.abs(p-1) < 0.0000000000001 )
          return Number.MAX_VALUE;
         
        var t, q, x;
        
        if( p < 0.02425 ) 
        {
          // low
          q = Math.sqrt( -2*Math.log(p) );
          x = (((((this.__c[0]*q + this.__c[1])*q + this.__c[2])*q + this.__c[3])*q + this.__c[4])*q + this.__c[5]) / 
              ((((this.__d[0]*q + this.__d[1])*q + this.__d[2])*q + this.__d[3])*q + 1.0);
        } 
        else if( p <= 0.97575 )
        {
          // central
          q = p-0.5;
          t = q*q;
          x = (((((this.__a[0]*t + this.__a[1])*t + this.__a[2])*t + this.__a[3])*t + this.__a[4])*t + this.__a[5])*q /
              (((((this.__b[0]*t + this.__b[1])*t + this.__b[2])*t + this.__b[3])*t + this.__b[4])*t + 1.0);
        }
        else
        {
          // high
          q = Math.sqrt( -2*Math.log(1-p) );
          x = -(((((this.__c[0]*q + this.__c[1])*q + this.__c[2])*q + this.__c[3])*q + this.__c[4])*q + this.__c[5]) / 
              ((((this.__d[0]*q + this.__d[1])*q + this.__d[2])*q + this.__d[3])*q + 1.0);
        }
        
        // note that this computation could be refined to further precision at the expense of performance.  Will see if this refinement is needed in
        // a future release based on actual library usage.  Also, the low/high (tail) region computations could be merged.
        return x;
      }
      
      // internal method - approximate inverse error function of suitable accuracy for prediction interval computations
      , __invERF: function(x)
      {
        // this is a quick-and-dirty implementation tha requires two sqrts.  I have another method that only uses one sart in part of the domain, but it
        // does not agree with published tables in some areas, so that one is on hold.

        var w = Math.log( 1 - x*x );
        var p = 18.75537 - 2.47197*w + .25*w*w;
        p = Math.sqrt(p);
        var t = p - 4.33074 - 0.5*w;
        t = Math.sqrt(t);
        
        return t >= 0 ? t : -t;
      }
    }
  }
  
  return returnedModule;
});