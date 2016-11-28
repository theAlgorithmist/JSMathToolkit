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
define([], function () 
{
  var returnedModule = function () 
  {
   /**
    * A natural cubic spline that interpolates a series of points with increasing x-coordinate values.  Intervals must be non-overlapping.
    * 
    * @author Jim Armstrong (www.algorithmist.net)
    * 
    * @version 1.0
    * 
    */
    this.NaturalCubicSpline = function()
    {
      this.ONE_SIXTH = 0.1666666666667;

      this.__t    = [];
      this.__y    = [];
      this.__u    = [];
      this.__v    = [];
      this.__h    = [];
      this.__b    = [];
      this.__z    = [];
      this.__hInv = [];

      this.__invalidate = true;
      this.__delta      = 0.0;
      this.__knots      = 0;
    }
  
    this.NaturalCubicSpline.__name__ = true;
    this.NaturalCubicSpline.prototype = 
    {
     /**
      * Access type of spline
      * 
      * @return String - 'cartesian'
      */
      getType: function()
      {
        return 'cartesian';
      }
    
     /**
      * Access point count
      * 
      * @return Int - Number of interpolation points or knots in the spline
      */
      , pointCount: function() 
      { 
        return this.__knots;
      }
  
     /**
      * Access the collection of interpolation points
      * 
      * @return Array - Array of objects with "x" and "y" properties for x- and y-coordinates of an interpolation point of the spline.
      */
      , getPoints: function()
      {
        var knotArr = [];
	      var i = 0;
	      while( i < this.__knots )
        {
          knotArr.push( {x:this.__t[i], y:this.__y[i]} );
          i++;
	      }
      
        return knotArr;
      }
  
     /**
      * Add a control or interpolation point to the spline
      * 
      * @param _x : Number - x-coordinate of new control point
      * 
      * @param _y : Number - y-coordinate of new control point
      * 
      * @return Nothing
      */
      , addControlPoint: function(_x, _y)
      {
        this.__invalidate = true;

        if( this.__t.length == 0 )
        {
          this.__t.push(_x);
          this.__y.push(_y);
        }
        else
        {
          if ( _x > this.__t[this.__knots-1] )
          {
            this.__t.push(_x);
            this.__y.push(_y);
          }
          else if( _x < this.__t[0] )
          {
            this.__t.splice(0, 0, _x);
            this.__y.splice(0, 0, _y);
	        }
          else
          {
            if( this.__knots > 1 )
            {
              var i = 0;
              while( i < this.__knots-1 )
              {
                if( _x > this.__t[i] && _x < this.__t[i+1] )
                {
                  this.__t.splice(i+1, 0, _x);
			            this.__y.splice(i+1, 0, _y);
			            break;
			          }
			  
			          i++;
              }
            }
          }
        }
        
        this.__knots++;
      }
  
     /**
      * Clear the spline and prepare for new data
      * 
      * @return Nothing
      */
      , clear: function()
      {
        this.__t.length = 0;
        this.__y.length = 0;

        this.__y.length = 0;
        this.__u.length = 0;
        this.__v.length = 0;
        this.__h.length = 0;
        this.__b.length = 0;
        this.__z.length = 0;
        this.__hInv.length = 0;
    
        this.__knots      = 0;
        this.__invalidate = true;
      }
  
     /**
      * Compute the spline y-coordinate for a given x-coordinate
      * 
      * @param _x : Number - x-coordinate in the domain of the spline
      * 
      * @return Number - Value of the natural cubic spline at the provided x-coordinate provided that the coordinate is in-range
      */
      , getY: function(_x)
      {
        if( this.__knots == 0 )
          return 0;
        else if( this.__knots == 1 )
          return this.__y[0];
        else
        {
          if( this.__invalidate )
            this.__computeZ();

          // determine interval
          var i = 0;
	        var j = this.__knots-2;
          this.__delta = _x - this.__t[0];
          while( j >= 0 )
          {
            if( _x >= this.__t[j] )
            {
              this.__delta = _x - this.__t[j];
              i = j;
              break;
            }
		        j--;
          }

          var b = (this.__y[i+1] - this.__y[i])*this.__hInv[i] - this.__h[i]*(this.__z[i+1] + 2.0*this.__z[i])*this.ONE_SIXTH;
          var q = 0.5*this.__z[i] + this.__delta*(this.__z[i+1]-this.__z[i])*this.ONE_SIXTH*this.__hInv[i];
          var r = b + this.__delta*q;
          var s = this.__y[i] + this.__delta*r;

          return s;
        }
      }
  
     /**
      * Compute the first-derivative of the cubic spline at the specified x-coordinate
      * 
      * @param _x : Number - x-coordinate in the domain of the spline
      * 
      * @return Number - dy/dx, provided the x-coordinate is in-range
      */
      , getYPrime: function(_x) 
      {  
        if( this.__knots == 0 )
          return 0;
        else if( this.__knots == 1 )
          return this.__y[0];
     
        if( this.__invalidate )
          this.__computeZ();

        // determine interval
        var i      = 0;
        var delta  = _x - this.__t[0];
        var delta2 = this.__t[1] - _x;
	      var j      = this.__knots-2;
	
        while( j >= 0 )
        {
          if( _x >= this.__t[j] )
          {
            delta = _x - this.__t[j];
            delta2  = this.__t[j+1] - _x;
            i = j;
            break;
          }
	        j--;
        }
 
        // this can be made more efficient - will complete l8r
        var h  = this.__h[i];
        var h2 = 1/(2.0*h);
        var h6 = h/6;
      
        var a = delta*delta;
        var b = delta2*delta2;
        var c = this.__z[i+1]*h2*a;
        c    -= this.__z[i]*h2*b;
        c    += this.__hInv[i]*this.__y[i+1];
        c    -= this.__z[i+1]*h6;
        c    -= this.__y[i]*this.__hInv[i];
        c    += h6*this.__z[i];

        return c;
      }
  
      // internal method - compute z-values or 2nd-derivative values at the interpolation points.
      , __computeZ: function()
      {
        // pre-generate h^-1 since the same quantity could be repeatedly calculated in eval()
        var i = 0;
        while( i < this.__knots-1 )
        {
          this.__h[i]    = this.__t[i+1] - this.__t[i];
          this.__hInv[i] = 1.0/this.__h[i];
          this.__b[i]    = (this.__y[i+1] - this.__y[i])*this.__hInv[i];
	        i++;
        }

        // recurrence relations for u(i) and v(i) -- tri-diagonal solver
        this.__u[1] = 2.0*(this.__h[0]+this.__h[1]);
        this.__v[1] = 6.0*(this.__b[1]-this.__b[0]);
   
        i = 2;
        while( i < this.__knots-1 )
        {
          this.__u[i] = 2.0*(this.__h[i]+this.__h[i-1]) - (this.__h[i-1]*this.__h[i-1])/this.__u[i-1];
          this.__v[i] = 6.0*(this.__b[i]-this.__b[i-1]) - (this.__h[i-1]*this.__v[i-1])/this.__u[i-1];
	        i++;
        }

        // compute z(i)
        this.__z[this.__knots-1] = 0.0;
	      i = this.__knots-2;
        while( i >= 1 )
        {
          this.__z[i] = (this.__v[i]-this.__h[i]*this.__z[i+1])/this.__u[i];
          i--;
	      }
        this.__z[0] = 0.0;

        this.__invalidate = false;
      }
    }
  }
    
  return returnedModule;
});
