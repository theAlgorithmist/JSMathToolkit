/**
 * copyright (c) 2012, Jim Armstrong.  All Rights Reserved.
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
    * BezierSplineControl computes tangents and thus geometric constraints for a collection of cubic Bezier segments in a cubic Bezier spline.  The algorithm used
    * is to compute tangent direction as normal to the angle bisector at each control point.  Reflection is used at interior points.  Placement of geometric constraints
    * along the tangent line (i.e. cx,cy and cx1,cy1) is based on the tension parameter.
    * 
    * Author Jim Armstrong (www.algorithmist.net)
    * 
    * Version 1.0
    * 
    */
    this.BezierSplineControl = function()
    {
  	  // properties
  	  this.CLOSED = false;      // true if closed spline
  	  this.ZERO_TOL = 0.000001; // zero-tolerance, suitable for this algorithm
  	
      // core
      this.__bXNR     = 0;      // bisector 'right' normal, x-coordinate
      this.__bYNR     = 0;      // bisector 'right' normal, y-coordinate
      this.__bXNL     = 0;      // bisector 'left' normal, x-coordinate
      this.__bYNL     = 0;      // bisector 'left' normal, y-coordinate
      this.__pX       = 0;      // reflected point, x-coordinate
      this.__pY       = 0;      // reflected point, y-coordinate

      this.__dX1      = 0;      // delta-x, first segment
      this.__dY1      = 0;      // delta-y, first segment
      this.__dX2      = 0;      // delta-x, second segment
      this.__dY2      = 0;      // delta-y, second segment
      this.__d1       = 0;      // first segment length
      this.__d2       = 0;      // second segment length
      this.__tension  = 0.5;    // tension parameter in [0,1]
      this.__uX       = 0;      // unit vector, direction of bisector, x-coordinate
      this.__uY       = 0;      // unit vector, direction of bisector, y-coordinate
      this.__dist     = 0;      // distance measure from segment intersection, along direction of bisector

      this.__segments = [];     // cubic bezier geometric constraints for each segement
      this.__x        = [];     // x-coordinate of interpolation points
    }
      
    this.BezierSplineControl.__name__ = true;
    this.BezierSplineControl.prototype = 
    {
     /**
      * Access the current tension parameter
      * 
      * @return Float - Tension parameter
      */
      get_tension: function() 
      { 
        return __tension;
      }

     /**
      * Assign the tension parameter
      * 
      * @param _t : Float Desired tension in [0,1] where 0 is 'loose' and 1 is 'tight'
      */
      , set_tension: function(_t)
      {
        this.__tension = (1-_t)*0.15 + _t*0.35;
      }

     /**
      * Access the cubic Bezier geometric constraints for the desired spline segment
      *
      * @param _i - Zero-based segment index (there are #points - 2 segments)
      * 
      * @return Object - x0, y0, cx, cy, cx1, cy1, x1, y1 properties contain the cubic Bezier geometric constraints.  All parameters are zero if index is out of range
      *
      */
      , getSegment: function(_i)
      {
        if( _i < 0 || _i > this.__segments.length-1 )
          return {x0:0, y0:0, cx:0, cy:0, cx1:0, cy1:0, x1:0, y1:0};
            
        return this.__segments[_i];
      }

     /**
      * Construct geometric constraints for all cubic bezier segments
      * 
      * @param _x : Array - x-coordinates of spline control or interpolation points
      * @param _y : Array - y-coordinates of spline control or interpolation points
      *
      * @return Nothing
      *
      */
      , construct: function(_x, _y)
      {
        var __numPoints = _x.length;
        var count       = __numPoints-1;
    
        if( count < 2 )
          return;

        var i;
        this.__segments.length = 0;
        for( i=0; i<count; ++i )
          this.__segments[i] = {};

        // this approach is sub-optimal, but very easy to follow and modify for other tangent constructions
        if( this.CLOSED )
          this.__leftClosed(this.__tension, _x, _y);  // 'leftmost' segment, closed spline
        else
          this.__left(this.__tension, _x, _y);        // 'leftmost' segment, open spline (requires a reflection point)

        var j;
        // 'middle' segments
        for( j=1; j<count-1; ++j )
          this.__segmentsCoef(j, this.__tension, _x, _y);

        if( this.CLOSED )
          this.__rightClosed(this.__tension, _x, _y);  // 'rightmost' segment, closed spline
        else
          this.__right(this.__tension, _x, _y);        // 'rightmost' segment, open splne (requires a reflection point)
      }

      // internal method - compute 'middle' segments
      , __segmentsCoef: function(_i, _t, _x, _y)
      {
        this.__getNormals(_i, _x, _y);
      
        var coef = this.__segments[_i];
        coef.x0  = _x[_i];
        coef.y0  = _y[_i];
        coef.cx  = this.__bXNL;
        coef.cy  = this.__bYNL;

        if( this.__dist > this.ZERO_TOL )
        {
          if( this.__isClockWise(_x, _y, _i) )
            this.__CW(_i, _t, _x, _y);
          else
            this.__CCW(_i, _t, _x, _y);
        }
        else
        {
          this.__bXNR = _x[_i] + _t*this.__dX1;
          this.__bYNR = _y[_i] + _t*this.__dY1;

          this.__bXNL = _x[_i] + _t*this.__dX2;
          this.__bYNL = _y[_i] + _t*this.__dY2;
        }

        coef.cx1 = this.__bXNR;
        coef.cy1 = this.__bYNR;
        coef.x1 = _x[_i+1];
        coef.y1 = _y[_i+1];
      }
    
      // internal method
      , __getNormals: function(_i, _x, _y)
      {
        this.__dX1  = _x[_i] - _x[_i+1];
        this.__dY1  = _y[_i] - _y[_i+1];
        this.__d1   = Math.sqrt(this.__dX1*this.__dX1 + this.__dY1*this.__dY1);
        this.__dX1 /= this.__d1;
        this.__dY1 /= this.__d1;

        this.__dX2  = _x[_i+2] - _x[_i+1];
        this.__dY2  = _y[_i+2] - _y[_i+1];
        this.__d2   = Math.sqrt(this.__dX2*this.__dX2 + this.__dY2*this.__dY2);
        this.__dX2 /= this.__d2;
        this.__dY2 /= this.__d2;

        this.__uX   = this.__dX1 + this.__dX2;
        this.__uY   = this.__dY1 + this.__dY2;
        this.__dist = Math.sqrt(this.__uX*this.__uX + this.__uY*this.__uY);
        this.__uX  /= this.__dist; 
        this.__uY  /= this.__dist;	
      }

      // internal method - 'leftmost' control segment, open spline
      , __left: function(_t, _x, _y)
      {
        this.__getNormals(0, _x, _y);

        if( this.__dist > this.ZERO_TOL )
        {
          if( this.__isClockWise(_x, _y, 0) )
            this.__CW(0, _t, _x, _y);
          else
            this.__CCW(0, _t, _x, _y);

          var mX = 0.5*(_x[0] + _x[1]);
          var mY = 0.5*(_y[0] + _y[1]);
          var pX = _x[0] - mX;
          var pY = _y[0] - mY;

          // normal at midpoint
          var n  = 2.0/this.__d1;
          var nX = -n*pY;
          var nY = n*pX;

          // upper triangle of symmetric transform matrix
          var a11 = nX*nX - nY*nY
          var a12 = 2*nX*nY;
          var a22 = nY*nY - nX*nX;

          var dX = this.__bXNR - mX;
          var dY = this.__bYNR - mY;

          // coordinates of reflected vector
          this.__pX = mX + a11*dX + a12*dY;
          this.__pY = mY + a12*dX + a22*dY;
        }
        else
        { 
          this.__bXNR = _x[1] + _t*this.__dX1;
          this.__bYNR = _y[1] + _t*this.__dY1;

          this.__bXNL = _x[1] + _t*this.__dX2;
          this.__bYNL = _y[1] + _t*this.__dY2;

          this.__pX = _x[0] + _t*this.__dX1;
          this.__pY = _y[0] + _t*this.__dY1;
        }
          
        var coef = this.__segments[0];

        coef.x0  = _x[0];
        coef.y0  = _y[0];
        coef.cx  = this.__pX;
        coef.cy  = this.__pY;
        coef.cx1 = this.__bXNR;
        coef.cy1 = this.__bYNR;
        coef.x1  = _x[1];
        coef.y1  = _y[1];
      }

      // internal method - 'leftmost' control segment, closed spline
      , __leftClosed(_t, _x, _y)
      {
        // point order is n-2, 0, 1 (as 0 and n-1 are the same knot in a closed spline).  Use 'right normal' to set first two control segment points
        var n2 = _x.length-2;
      
        this.__dX1  = _x[n2] - _x[0];
        this.__dY1  = _y[n2] - _y[0];
        this.__d1   = Math.sqrt(this.__dX1*this.__dX1 + this.__dY1*this.__dY1);
        this.__dX1 /= this.__d1;
        this.__dY1 /= this.__d1;

        this.__dX2  = _x[1] - _x[0];
        this.__dY2  = _y[1] - _y[0];
        this.__d2   = Math.sqrt(this.__dX2*this.__dX2 + this.__dY2*this.__dY2);
        this.__dX2 /= this.__d2;
        this.__dY2 /= this.__d2;

        this.__uX   = this.__dX1 + this.__dX2;
        this.__uY   = this.__dY1 + this.__dY2;
        this.__dist = Math.sqrt(this.__uX*this.__uX + this.__uY*this.__uY);
        this.__uX  /= this.__dist; 
        this.__uY  /= this.__dist;

        if( this.__dist > this.ZERO_TOL )
        {
          if( ((_y[1]-_y[n2])*(_x[0]-_x[n2]) > (_y[0]-_y[n2])*(_x[1]-x[n2])) )
          {
            var dt      = _t*this.__d2;
            this.__bXNL = _x[0] + dt*this.__uY;
            this.__bYNL = _y[0] - dt*this.__uX;
          }
          else
          {
            dt          = _t*this.__d2;
            this.__bXNL = _x[0] - dt*this.__uY;
            this.__bYNL = _y[0] + dt*this.__uX;
          }
        }
        else
        {
          this.__bXNL = _x[0] + _t*this.__dX1;
          this.__bYNL = _y[0] + _t*this.__dY1;
        }
      
        var coef = this.__segments[0];
        coef.x0  = _x[0];
        coef.y0  = _y[0];
        coef.cx  = this.__bXNL;
        coef.cy  = this.__bYNL;
      
        // now, continue as before using the point order 0, 1, 2
        this.__getNormals(0, _x, _y);

        if( this.__dist > this.ZERO_TOL )
        {
          if( this.__isClockWise(_x, _y, 0) )
            this.__CW(0, _t, _x, _y);
          else
            this.__CCW(0, _t, _x, _y);
        }
        else
        {
          this.__bXNR = _x[1] + _t*this.__dX1;
          this.__bYNR = _y[1] + _t*this.__dY1;

          this.__bXNL = _x[1] + _t*this.__dX2;
          this.__bYNL = _y[1] + _t*this.__dY2;
        }
      
        coef.cx1 = this.__bXNR;
        coef.cy1 = this.__bYNR;
        coef.x1 = _x[1];
        coef.y1 = _y[1];
      }

      // internal method - 'rightmost' control segment, open spline
      , __right: function(_t, _x, _y)
      {
        var count = _x.length-1;
        if( this.__dist > this.ZERO_TOL )
        {
          var mX = 0.5*(_x[count-1] + _x[count]);
          var mY = 0.5*(_y[count-1] + _y[count]);
          var pX = _x[count] - mX;
          var pY = _y[count] - mY;

          // normal at midpoint
          var n  = 2.0/this.__d2;
          var nX = -n*pY;
          var nY = n*pX;

          // upper triangle of symmetric transform matrix
          var a11 = nX*nX - nY*nY
          var a12 = 2*nX*nY;
          var a22 = nY*nY - nX*nX;

          var dX = this.__bXNL - mX;
          var dY = this.__bYNL - mY;

          // coordinates of reflected vector
          this.__pX = mX + a11*dX + a12*dY;
          this.__pY = mY + a12*dX + a22*dY;
        }
        else
        {
          this.__pX = _x[count] - _t*this.__dX2;
          this.__pY = _y[count] - _t*this.__dY2;
        }

        var coef = this.__segments[count-1];

        coef.x0  = _x[count-1];
        coef.y0  = _y[count-1];
        coef.cx  = this.__bXNL;
        coef.cy  = this.__bYNL;
        coef.cx1 = this.__pX;
        coef.cy1 = this.__pY;
        coef.x1  = _x[count];
        coef.y1  = _y[count];
      }
    
      // internal method - 'rightmost' control segment, closed spline
      , __rightClosed: function(_t, _x, _y)
      {
        // no additional computations are required as the P2X, P2Y point is a reflection of the P1X, P1Y point from the very first control segment
        var count = _x.length-1;

        var c0   = this.__segments[0];
        var coef = this.__segments[count-1];

        coef.P0X = _x[count-1];
        coef.P0Y = _y[count-1];
        coef.P1X = this.__bXNL;
        coef.P1Y = this.__bYNL;
        coef.P2X = 2.0*_x[0] - c0.cx;
        coef.P2Y = 2.0*_y[0] - c0.cy;
        coef.P3X = _x[count];           // knot number 'count' and knot number 0 should be the same for a closed spline
        coef.P3Y = _y[count];
      }

      // internal method - bisector normal computations, clockwise knot order
      , __CW: function(_i, _t, _x, _y)
      {
        var dt = _t*this.__d1;

        this.__bXNR = _x[_i+1] - dt*this.__uY;
        this.__bYNR = _y[_i+1] + dt*this.__uX;

        dt          = _t*this.__d2;
        this.__bXNL = _x[_i+1] + dt*this.__uY;
        this.__bYNL = _y[_i+1] - dt*this.__uX;
      }

      // internal method - bisector normal computations, counter-clockwise knot order
      , __CCW: function(_i, _t, _x, _y)
      {
        var dt = _t*this.__d2;

        this.__bXNL = _x[_i+1] - dt*this.__uY;
        this.__bYNL = _y[_i+1] + dt*this.__uX;

        dt     = _t*this.__d1;
        this.__bXNR = _x[_i+1] + dt*this.__uY;
        this.__bYNR = _y[_i+1] - dt*this.__uX;
      }

      // internal method - clockwise order for three-point sequence?
      , __isClockWise: function(_x, _y, _i) 
      {
        return ((_y[_i+2]-_y[_i])*(_x[_i+1]-_x[_i]) > (_y[_i+1]-_y[_i])*(_x[_i+2]-_x[_i]));
      }
    }
  }
  
  return returnedModule;
});