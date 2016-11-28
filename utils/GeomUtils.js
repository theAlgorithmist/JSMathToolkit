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

define(['./ApproxEqual'], function (approxModule) 
{
  var returnedModule = function () 
  {
    var approxRef = new approxModule();
    var __approx  = new approxRef.ApproxEqual();
    
  /**
   * Common low-level utility methods for analytic geometry.  Although a PointUtils class exists, that class is designed to work with the Point data structure.  Methods
   * in this utility class use raw coordinate values and are independent from any specific point structure.
   *  
   * @author Jim Armstrong (www.algorithmist.net)
   * 
   * @version 1.0
   * 
   */
    this.GeomUtils = function()
    {
      this.LEFT       = "L";                   // to the left
      this.RIGHT      = "R";                   // to the right
      this.ON         = "O";                   // on a line or plane, etc. within tolerance
      this.ZERO_TOL   = 0.0000001;             // arbitrary zero-tolerance to use as default when tolerance not provided
      this.RAD_TO_DEG = 180/3.14159265359;     // convert radians to degrees
      
      // used in closest-points algorithm
      this._best1    = null;
      this._best2    = null;
      this._bestDist = Number.MAX_VALUE;
      
      this.__t = 0;
      this.__u = 0;
    }
   
    this.GeomUtils.__name__ = true;
    this.GeomUtils.prototype = 
    {
     /**
      * Is the specified point, (x1,y1) inside the rectangle (left,top) to (right,bottom)?
      * 
      * @param x1 : Number x-coordinate of test point
      * 
      * @param y1 : Number y-coordinate of test point
      * 
      * @param left : Number x-coordinate of upper, left-hand corner of bounding box
      * 
      * @param top : Number y-coordinate of upper, left-hand corner of bounding box
      * 
      * @param right : Number x-coordinate or lower, right-hand corner of bounding box
      * 
      * @param botton : Number y-coordinate of lower, right-hand corner of bounding box
      * 
      * @param yDown : Boolean - true if a y-down convention is used in the y-axis, i.e. bottom > top; this is true in many browser-based drawing environments
      * 
      * @return Boolean True if the specified point is strictly inside (not on the boundary) of the bounding box, false otherwise
      */
      insideBox: function(__x1, __y1, __left, __top, __right, __bottom, __yDown )
      {
	      if( __yDown )
	        return __x1 > __left && __x1 < __right && __y1 > __top && __y1 < __bottom;
	      else
	        return __x1 > __left && __x1 < __right && __y1 < __top && __y1 > __bottom;
      }
    
     /**
      * Do two axis-aligned bounding boxes intersect?
      * 
      * @param bound1 : Object - Bounding-box object with left, top, right, and bottom properties for top-left point and bottom-right point
      * 
      * @param bound2 : Object - Bounding-box object with left, top, right, and bottom properties for top-left point and bottom-right point
      * 
      * @return Boolean - True if bounding boxes intersect - a single point of contact is considered an intersection
      */
      , boxesIntersect(__bound1, __bound2)
      {
        // for a y-down coordinate system, bottom > top - reverse internally and copy to temp variables so that all computations are y-up.
        var l1 = __bound1.left;
        var r1 = __bound1.right;
        var t1 = __bound1.top > __bound1.bottom ? __bound1.top : __bound1.bottom;
        var b1 = __bound1.top > __bound1.bottom ? __bound1.bottom : __bound1.top;
        
        var l2 = __bound2.left;
        var r2 = __bound2.right;
        var t2 = __bound2.top > __bound2.bottom ? __bound2.top : __bound2.bottom;
        var b2 = __bound2.top > __bound2.bottom ? __bound2.bottom : __bound2.top;
        
        if( l2 > r1 )
          return false;
        else if( r2 < l1 )
          return false;
        else if( t2 < b1 )
          return false;
        else if( t1 < b2 )
          return false;
        else if( r2 >= l1 )
          return t2 >= b1 && b2 <= t1;
      }
      
     /**
      * Is the specified point (x1,y1) to the left, on, or to the right of the line specified by two input points (x2,y2) - (x3,y3)
      * 
      * <span class='param'>x1</span> : Number x-coordinate of first point on line
      * 
      * <span class='param'>y1</span> : Number y-coordinate of first point on line
      * 
      * <span class='param'>x2</span> : Number x-coordinate of second point on line
      * 
      * <span class='param'>y2</span> : Number y-coordinate of second point on line
      * 
      * <span class='param'>x</span> : Number x-coordinate of test point
      * 
      * <span class='param'>y</span> : Number y-coordinate of test point
      * 
      * <span class='returns'>Returns</span> String One of the codes <span class='code'>GeomUtils.LEFT, GeomUtils.RIGHT, GeomUtils.ON</span> if the point is to the left, right, or on
      * the line, respectively.  Test for point exactly on the line is made first and within a tight tolerance to accommodate for roundoff.
      * 
      */
      , pointOrientation: function(__x1, __y1, __x2, __y2, __x, __y)
      {
        var test = ( (__x2 - __x1)*(__y - __y1) - (__x -  __x1)*(__y2 - __y1) );

        if( Math.abs(test) < 0.0001 )
          return this.ON;
        else
          return test > 0 ? this.LEFT : this.RIGHT; 
      }
      
     /**
      * Does the line segment from (x1,y1) to (x2,y2) intersect the rectangle (left,top) to (right,bottom)?
      * 
      * @param x1 : Number x-coordinate of test point
      * 
      * @param y1 : Number y-coordinate of test point
      * 
      * @param left : Number x-coordinate of upper, left-hand corner of bounding box
      * 
      * @param top : Number y-coordinate of upper, left-hand corner of bounding box
      * 
      * @param right : Number x-coordinate or lower, right-hand corner of bounding box
      * 
      * @param botton : Number y-coordinate of lower, right-hand corner of bounding box
      * 
      * @param yDown : Boolean - true if a y-down convention is used in the y-axis, i.e. bottom > top; this is true in many browser-based drawing environments
      * 
      * @return Boolean True if the line segment intersects any part of the specified rectangle, even if it touches only at a single point
      */
      , intersectBox: function( __x1, __y1, __x2, __y2, __left, __top, __right, __bottom, __yDown )
      {
        // test if segment is completely outside
        if( (__x1 < __left && __x2 < __left) || (__x1 > __right && __x2 > __right) )
          return false;
      
        // y-down
        if( __yDown )
        {
          if( (__y1 < __top && __y2 < __top) || (__y1 > __bottom && __y2 > __bottom) )
            return false;
        }
        else
        {
          if( (__y1 < __bottom && __y2 < __bottom) || (__y1 > __top && __y2 > __top) )
            return false;  
        }
    
        // test intersection with each segment of bounding-box
        if( this.segmentsIntersect(__x1, __y1, __x2, __y2, __left, __top, __right, __top) )
          return true;
    
        if( this.segmentsIntersect(__x1, __y1, __x2, __y2, __right, __top, __right, __bottom) )
          return true;
    
        if( this.segmentsIntersect(__x1, __y1, __x2, __y2, __right, __bottom, __left, __bottom) )
          return true;
    
        if( this.segmentsIntersect(__x1, __y1, __x2, __y2, __left, __bottom, __left, __top) )
          return true;
    
        return false;
      }
      
     /**
      * Return the two points of intersection between the line segment from (x1,y1) to (x2,y2) and the rectangle (left,top) to (right,bottom) - this is intended
      * for use after an intersection test as it is optimized for the case where intersection is known to already exist.
      * 
      * @param x1 : Number x-coordinate of test point
      * 
      * @param y1 : Number y-coordinate of test point
      * 
      * @param left : Number x-coordinate of upper, left-hand corner of bounding box
      * 
      * @param top : Number y-coordinate of upper, left-hand corner of bounding box
      * 
      * @param right : Number x-coordinate or lower, right-hand corner of bounding box
      * 
      * @param botton : Number y-coordinate of lower, right-hand corner of bounding box
      * 
      * @param yDown : Boolean - true if a y-down convention is used in the y-axis, i.e. bottom > top; this is true in many browser-based drawing environments
      * 
      * @return Object - 'x1', 'y1', 'x2', and 'y2' properties of the intersection points (x1,y1) and (x2,y2) with x2 >= x1.  Note that an intersection test is
      * required or other advance knowledge is necessary that the intersection exists.  If there is only one intersection point, i.e. one of the line segment points
      * is inside the box, then one of the coordinate sets will be null
      */
      , lineRectIntersection: function(__x1, __y1, __x2, __y2, __left, __top, __right, __bottom)
      {
        var x1    = null;
        var y1    = null;
        var x2    = null;
        var y2    = null;
        var count = 0;
        
        if( this.segmentsIntersect(__x1, __y1, __x2, __y2, __left, __top, __right, __top) )
        {
          x1 = (1-this.__t)*__x1 + this.__t*__x2;
          y1 = (1-this.__t)*__y1 + this.__t*__y2;
          count++;
        }
    
        if( this.segmentsIntersect(__x1, __y1, __x2, __y2, __right, __top, __right, __bottom) )
        {
          if( count == 0 )
          {
            x1 = (1-this.__t)*__x1 + this.__t*__x2;
            y1 = (1-this.__t)*__y1 + this.__t*__y2;
          }
          else
          {
            x2 = (1-this.__t)*__x1 + this.__t*__x2;
            y2 = (1-this.__t)*__y1 + this.__t*__y2;
          }
          count++;
        }
    
        if( count < 2 )
        {
          if( this.segmentsIntersect(__x1, __y1, __x2, __y2, __right, __bottom, __left, __bottom) )
          {
            if( count == 0 )
            {
              x1 = (1-this.__t)*__x1 + this.__t*__x2;
              y1 = (1-this.__t)*__y1 + this.__t*__y2;
            }
            else
            {
              x2 = (1-this.__t)*__x1 + this.__t*__x2;
              y2 = (1-this.__t)*__y1 + this.__t*__y2;
            }
            count++;
          }
        }
    
        if( count < 2 )
        {
          if( this.segmentsIntersect(__x1, __y1, __x2, __y2, __left, __bottom, __left, __top) )
          {
            if( count == 0 )
            {
              x1 = (1-this.__t)*__x1 + this.__t*__x2;
              y1 = (1-this.__t)*__y1 + this.__t*__y2;
            }
            else
            {
              x2 = (1-this.__t)*__x1 + this.__t*__x2;
              y2 = (1-this.__t)*__y1 + this.__t*__y2;
            }
            count++;
          }
        }
        
        if( x1 == null || x2 == null )
          return {x1:x1, y1:y1, x2:x2, y2:y2}; 
          
        if( x1 > x2 )
          return {x1:x2, y1:y2, x2:x1, y2:y1};
        else
          return {x1:x1, y1:y1, x2:x2, y2:y2};    
      }
  
     /**
      * Are the two points, (x1,y1) and (x2, y2) equal (to within a tolerance)?
      * 
      * @param x1 : Number x-coordinate of first point
      * 
      * @param y1 : Number y-coordinate of first point
      * 
      * @param x2 : Number x-coordinate of second point
      * 
      * @param y2 : Number y-coordinate of second point
      * 
      * @return Boolean True if the two points are equivalent to within a tolerance (currently 0.001 for each coordinate)
      */
      , pointsEqual: function(__x1, __y1, __x2, __y2)
      {
	      return ( __approx.compare(__x1, __x2, 0.001) && __approx.compare(__y1, __y2, 0.001) );
      }
  
     /**
      * Do two lines defined by the points (x1,y1) - (x2,y2) and (x3,y3) - (x4,y4) intersect?
      * 
      * @param x1 : Number x-coordinate of initial point of first vector
      * 
      * @param y1: Number  y-coordinate of initial point of first vector
      * 
      * @param x2 : Number x-coordinate of terminal point of first vector
      * 
      * @param y2 : Number y-coordinate of terminal point of first vector
      *  
      * @param x1 : Number x-coordinate of initial point of first vector
      * 
      * @param y1 : Number y-coordinate of initial point of first vector
      * 
      * @param x2 : Number x-coordinate of terminal point of first vector
      * 
      * @param y2 : Number y-coordinate of terminal point of first vector
      * 
      * @return Boolean True if the two lines intersect.
      * 
      */
      , linesIntersect: function(__x1, __y1, __x2, __y2, __x3, __y3, __x4, __y4)
      {
	      // coincident endpoints?
	      if( this.pointsEqual(__x1, __y1, __x3, __y3) )
	        return true;
	  
	      if( this.pointsEqual(__x1, __y1, __x4, __y4) )
          return true;
	  
	      if( this.pointsEqual(__x2, __y2, __x3, __y3) )
          return true;
	  
	      if( this.pointsEqual(__x2, __y2, __x4, __y4) )
          return true;
	  
	      // have to do it the hard way
	      var m1 = __x2 - __x1;
	      var m2 = __x4 - __x3;
	      var inf1 = Math.abs(m1) < 0.00000001;
	      var inf2 = Math.abs(m2) < 0.00000001;
	
	      m1 = inf1 ? m1 : (__y2-__y1)/m1;
	      m2 = inf2 ? m2 : (__y4-__y3)/m2;
	
	      if( inf1 )
          return !inf2;
        else if( inf2 )
	        return true;
	      else
	        return !__approx.compare(m1, m2, 0.0000001);
      }
  
     /**
      * Do two line segments from points (x1,y1) - (x2,y2) and (x3,y3) - (x4,y4) intersect?
      * 
      * @param x1 : Number x-coordinate of initial point of first segment
      * 
      * @param y1: Number  y-coordinate of initial point of first segment
      * 
      * @param x2 : Number x-coordinate of terminal point of first segment
      * 
      * @param y2 : Number y-coordinate of terminal point of first segment
      *  
      * @param x1 : Number x-coordinate of initial point of second segment
      * 
      * @param y1 : Number y-coordinate of initial point of second segment
      * 
      * @param x2 : Number x-coordinate of terminal point of second segment
      * 
      * @param y2 : Number y-coordinate of terminal point of second segment
      * 
      * @return Boolean True if the two lines intersect. A full intersection test is performed - check bounding boxes of the segments in advance if you expect a
      * large number of tests with no possible intersection based on segments completely to the left/right or top/bottom relative to one another.
      * 
      * Note: Astute readers will recognize this as a 2D implementation of the Graphic Gems algorithm by Goldman.  There is nothing new under the sun :)
      * 
      */
      , segmentsIntersect: function(px, py, p2x, p2y, qx, qy, q2x, q2y)
      {
        var rx = p2x - px;
        var ry = p2y - py;
        var sx = q2x - qx;
        var sy = q2y - qy;
        
        var tx = qx - px;
        var ty = qy - py;
        
        var num = this.__cross(tx, ty, rx, ry);
        var den = this.__cross(rx, ry, sx, sy);
        
        // co-linear test
        if( Math.abs(num) < 0.00000001 && Math.abs(den) < 0.00000001 ) 
        {
          // intersecting points
          if( this.pointsEqual(px, py, qx, qy) || this.pointsEqual(px, py, q2x, q2y) || this.pointsEqual(p2x, p2y, qx, qy) || this.pointsEqual(p2x, p2y, q2x, q2y) ) 
            return true;
          
          // overlap?
          return ( (qx - px < 0) != (qx - p2x < 0) ) || ( (qy - py < 0) != (qy - p2y < 0) );
        }

        // parallel segments?
        if( Math.abs(den) < 0.00000001 ) 
          return false;

        this.__u = num/den;
        this.__t = this.__cross(tx, ty, sx, sy) / den;

        return (this.__t >= 0) && (this.__t <= 1) && (this.__u >= 0) && (this.__u <= 1);
      }
      
     /**
      * Intersection point of infinite lines between two segments
      * 
      * @param x1 : Number x-coordinate of initial point of first segment
      * 
      * @param y1: Number  y-coordinate of initial point of first segment
      * 
      * @param x2 : Number x-coordinate of terminal point of first segment
      * 
      * @param y2 : Number y-coordinate of terminal point of first segment
      *  
      * @param x1 : Number x-coordinate of initial point of second segment
      * 
      * @param y1 : Number y-coordinate of initial point of second segment
      * 
      * @param x2 : Number x-coordinate of terminal point of second segment
      * 
      * @param y2 : Number y-coordinate of terminal point of second segment
      * 
      * @return Object 'x' and 'y' properties contain the x- and y-coordinates of intersection point (for well-posed inputs).  This is NOT a general-purpose line-
      * intersection method.  It is intended to be a fast algorithm for well-posed data, i.e. lines are not colinear or overlapping, and point data is well-defined.  
      * There are no tests for bad data or outlier conditions.  Use at your own risk.
      * 
      */
      , lineIntersection: function(px, py, p2x, p2y, qx, qy, q2x, q2y)
      {
        var rx = p2x - px;
        var ry = p2y - py;
        var sx = q2x - qx;
        var sy = q2y - qy;
         
        var tx = qx - px;
        var ty = qy - py;
         
        var den = this.__cross(rx, ry, sx, sy);
        var t   = this.__cross(tx, ty, sx, sy) / den;
        var t1  = 1-t;
        
        return {x:t1*px + t*p2x, y:t1*py + t*p2y};
      }
      
      // internal method - cross-product
      , __cross: function(p1x, p1y, p2x, p2y)
      {
        return p1x*p2y - p1y*p2x;
      }
  
     /**
      * Compute the interior angle given three points, (x1,y1), (x2,y2), and (x3,y3) - (x2,y2) is the interior point
      *
      * @param x1 : Number x-coordinate of first point (x1,y1)
      * 
      * @param y1 : Number y-coordinate of first point (x1,y1)
      * 
      * @param x2 : Number x-coordinate of second point (x2,y2)
      * 
      * @param y2 : Number y-coordinate of second point (x2,y2)
      * 
      * @param x3 : Number x-coordinate of third point (x3,y3)
      * 
      * @param y3 : Number y-coordinate of third point (x3,y3)
      * 
      * @param toDegrees: Boolean - true if result is returned in degrees
      * 
      * @return Number interior angle in degrees or radians, depending on toDegrees parameter
      *
      */
      , interiorAngle: function(__x1, __y1, __x2, __y2, __x3, __y3, __toDegrees)
      {
        var v1X = __x1 - __x2;
        var v1Y = __y1 - __y2;
        var v2X = __x3 - __x2;
        var v2Y = __y3 - __y2;
      
        var v1 = Math.sqrt(v1X*v1X + v1Y*v1Y);
        var v2 = Math.sqrt(v2X*v2X + v2Y*v2Y);
      
        var innerProd = v1X*v2X + v1Y*v2Y;
      
        if( v1 <= ZERO_TOL || v2 <= ZERO_TOL )
        {
          return 0;
        }
        else
        {
          // tbd - very small magnitudes could cause numerical issues
          var result = Math.acos( innerProd/(v1*v2) );
        
          return __toDegrees ? result*this.RAD_TO_DEG : result;
        }
      }
      
     /**
      * Is a sequence of points, P0, P1, P2 in clockwise or counter-clockwise order?
      * 
      * @param _x0 : Number - x-coordinate of P0
      * @param _y0 : Number - y-coordinate of P0
      * 
      * @param _x1 : Number - x-coordinate of P1
      * @param _y1 : Number - y-coordinate of P1
      * 
      * @param _x2 : Number - x-coordinate of P2
      * @param _y2 : Number - y-coordinate of P2
      */
      , isClockwise: function(_x0, _y0, _x1, _y1, _x2, _y2)
      {
        return ((_y2-_y0)*(_x1-_x0) > (_y1-_y0)*(_x2-_x0));
      }
      
     /**
      * Is an input point (rx,ry) anywhere on the line between two other points (px, py) and (qx, qy)
      * 
      * @param rx : Number - x-coordinate of test point
      * 
      * @param ry : Number - y-coordinate of test point
      * 
      * @param px : Number - x-coordinate of first point on line
      * 
      * @param py : Number - y-coordinate of first point on line
      * 
      * @param qx : Number - x-coordinate of second point on line
      * 
      * @param qy : Number - y-coordinate of second point on line
      * 
      * @return Boolean - true if the input point is numerically 'close enough' to be considered on the line passing through the two other points.
      * The test is designed for computer-based games and is performed very fast and without error checking.  It also has a possible loss of
      * significance if dealing with very close points of very small magnitude.
      */
      , pointOnLine: function(rx, ry, px, py, qx, qy)
      {
        // test for small determinant where 'small' is based on pixel values typical in browser and mobile applications
        var det = (qx - px)*(ry - py) - (qy - py)*(rx - px);
        
        return Math.abs(det) < 0.001;
      }
      
     /**
      * Return the area of a triangle, given the three vertices.  This is a suitably popluar geometric shape whose area is often needed to be computed very
      * fast in games or other online applications, so it is supplied as a separate utility.  Feel free to inline the code into an app.
      * 
      * @param x1 : Number - x-coordiante of first vertex
      * 
      * @param y1 : Number - y-coordiane of first vertex
      * 
      * @param x2 : Number - x-coordiante of second vertex
      * 
      * @param y2 : Number - y-coordiane of second vertex
      * 
      * @param x3 : Number - x-coordiante of third vertex
      * 
      * @param y3 : Number - y-coordiane of third vertex
      * 
      * @return Number - Area of triangle.  No error-checking is performed on inputs for performance reasons.  For best performance, in-line this code into
      * an application after debugging.  Note that if the vertex order (i.e. CCW or CW) can be guaranteed in advance, the Math.abs call can be removed.
      */
      , triangleArea: function( x1, y1, x2, y2, x3, y3 )
      {
        var a = x1*(y2-y3) + x2*(y3-y1) + x3*(y1-y2);
        
        return 0.5*Math.abs(a);
      }
      
     /**
      * Compute the intersection point(s) of two circles
      * 
      * @param xc1 : Number x-coordinate of first circle center
      * 
      * @param yc1 : Number y-coordinate of first circle center
      * 
      * @param r1 : First circle radius
      * 
      * @param xc2 : Number x-coordinate of second circle center
      * 
      * @param yc2 : Number y-coordinate of second circle center
      * 
      * @param r2 : Second circle radius
      * 
      * @return Array - Array of objects with 'x' and 'y' properties containing coordinates of intersection point(s).  The array is empty 
      * if the two circles do not intersect, they are coincident, or one circle is contained inside another.  No error checking is performed 
      * to maximize performance.
      */
      , circleToCircleIntersection: function( x0, y0, r0, x1, y1, r1 )
      { 
        var dx = x1 - x0;                 // delta-x
        var dy = y1 - y0;                 // delta-y 
        var d = Math.sqrt(dx*dx + dy*dy); // distance between centers
        if( d > r0+r1 || d < Math.abs(r0-r1) )
          return [];
        
        if( Math.abs(d) < 0.001 && Math.abs(r1-r0) < 0.001 )
          return [];
        
        var r0sq = r0*r0;
        var a    = (r0sq - r1*r1 + d*d ) / (2*d);
        var h    = Math.sqrt( r0sq - a*a );
        
        dx /= d;
        dy /= d;
        
        // points of intersection are (x3,y3) and possibly (x4,y4)
        var x2 = x0 + a*dx;
        var y2 = y0 + a*dy;
        var x3 = x2 + h*dy;
        var y3 = y2 - h*dx;
        
        var intersect = [ {x:x3, y:y3} ];
        if( d != r0 + r1 ) 
        {
          var x4 = x2 - h*dy;
          var y4 = y2 + h*dx;
          intersect.push( {x:x4, y:y4} );
        }
        
        return intersect;
      }
      
     /**
      * Return the distance from a single point, P, to a line segment passing through P0 and P1
      * 
      * @param p0x : Number - x-coordinate of P0
      * @param p0y : Number - y-coordinate of P0
      * 
      * @param p1x : Number - x-coordinate of P1
      * @param p1y : Number - y-coordinate of P1
      * 
      * @param px : Number - x-coordinate of P
      * @param py : Number - y-coordinate of P
      * 
      * @return Number - Distance from P to line segment between P0 and P1, which could be greater than the distance between P and the infinite line between P0 and P1
      */
      , pointToSegmentDistance( p0x, p0y, p1x, p1y, px, py)
      {
        var vx = p1x - p0x;
        var vy = p1y - p0y;
        
        var wx = px - p0x;
        var wy = py - p0y;

        var c1 = wx*vx + wy*vy;
        if( c1 <= 0 )
          return Math.sqrt(wx*wx + wy*wy);
        
        var c2 = vx*vx + vy*vy;
        if ( c2 <= c1 )
        {
          wx = p1x - px;
          wy = p1y - py;
          
          return Math.sqrt(wx*wx + wy*wy);
        }
        
        var b  = c1 / c2;
        var tx = p0x + b*vx;
        var ty = p0y + b*vy;
        var dx = px - tx;
        var dy = py - ty;
        
        return Math.sqrt( dx*dx + dy*dy);
      }
      
     /**
      * Return the point from projecting a single point, P, to a line segment passing through P0 and P1
      * 
      * @param p0x : Number - x-coordinate of P0
      * @param p0y : Number - y-coordinate of P0
      * 
      * @param p1x : Number - x-coordinate of P1
      * @param p1y : Number - y-coordinate of P1
      * 
      * @param px : Number - x-coordinate of P
      * @param py : Number - y-coordinate of P
      * 
      * @return Object - 'x' and 'y' properties provide the closest point to P on P0-P1.
      */
      , projectToSegment( p0x, p0y, p1x, p1y, px, py)
      {
        var dx = p1x-p0x;
        var dy = p1y-p0y;
        var norm = dx*dx + dy*dy;
        if( norm < 0.0000001)
          return {x:p0x, y:p0y, d:0, d2:0};
          
        var vx, vy;
        var t = ( (px-p0x)*(p1x-p0x) + (py-p0y)*(p1y-p0y) ) / norm;
        
        if( t <= 0 )
        {
          vx = p0x;
          vy = p0y;
        }
        else if( t >= 1 )
        {
          vx = p1x;
          vy = p1y;;
        }
        else
        {
          vx = p0x+t*dx
          vy = p0y+t*dy;
        }
        
        // if you want to return the distance as well
        // dx = vx-px;
        // dy = vy-py;
        // var d = Math.sqrt(dx*dx + dy*dy);
        
        return { x:vx, y:vy };
      }
      
    /**
     * Reflect a point cloud about a line passing through P0 and P1
     * 
     * @param points : Array - Array of Objects with 'x' and 'y' properties that represent the (x,y) coordinates of each point to be reflected
     * 
     * @param x0 : Number - x-coordinate of P0
     * 
     * @param y0 : Number - y-coordinate of P0
     * 
     * @param x1 : Number - x-coordinate of P1
     * 
     * @param y1 : Number - y-coordinate of P1
     * 
     * @return Array - Reflected point cloud, provided that the line segment is (numerically) distinct; otherwise, the original array is returned.
     */
      , reflect: function( points, x0, y0, x1, y1 )
      {
        var p1x, p1y;

        var dx = x1 - x0;
        var dy = y1 - y0;
        var d  = dx*dx + dy*dy;
        if( Math.abs(d) < 0.00000001 )
          return points;
         
        var a = (dx*dx - dy*dy) / d;
        var b = 2*dx*dy / d;

        var i;
        var p;
        var len     = points.length;
        var reflect = [];
        
        for( i=0; i<len; ++i )
        {
          p   = points[i];
          dx  = p.x - x0;
          dy  = p.y - y0;
          p1x = (a*dx + b*dy + x0); 
          p1y = (b*dx - a*dy + y0);

          reflect.push( {x:p1x, y:p1y} );
        }
      
        return reflect;
      }
     
     /**
      * Find the two points in a point cloud that are closest in terms of Euclidean distance
      * 
      * @param xcoord : Array - Array of x-coordinates (point count is taken from the length of this array)
      * 
      * @param ycoord : Array - ARray of y-coordinates
      * 
      * @return Array - Two-element array of Objects whose 'x' and 'y' properties contain the coordinates of the two closest points - there is no
      * error-checking for performance reasons.  The return array is empty if the point collection is less than two.  Note that duplicate points
      * may cause an issue and that is not scanned for at this time.
      * 
      * Attribution:  This is a mashup of code I wrote in C back in the early 90's and a Java code sent to me by a colleague, but I do not have a reference
      * for the Java author.
      */
      , closestPoints( _xcoord, _ycoord )
      {
        if( _xcoord.length != _ycoord.length )
          return [];
        
        var n = _xcoord.length;
        if( n > 0 && n < 2 )
          return [ {x:_xcoord[0], y:_ycoord[0]}, {x:_xcoord[0], y:_ycoord[0]} ];
        
        var points = [];
        if( n == 2 )
        {
          points.push( {x:_xcoord[0], y:_ycoord[0]} );
          points.push( {x:_xcoord[1], y:_ycoord[1]} );
        }
        
        // create a point collection that is sorted on x-coordinate
        var p = [];
        var i;
        for( i=0; i<n; ++i )
          p.push( {x:_xcoord[i], y:_ycoord[i]} );
        
        // in-line a 'sort-on' for performance - leave room open for adding additional criteria
        var args = ['x'];
        p.sort
        (
          function(a,b)
          {
            var props = args.slice();
            var prop  = props.shift();
            while( a[prop] == b[prop] && props.length ) 
              prop = props.shift();
              
            return a[prop] == b[prop] ? 0 : a[prop] > b[prop] ? 1 : -1;
           }
        );
        
        this._best1    = null;
        this._best2    = null;
        this._bestDist = Number.MAX_VALUE;
        var d, dx, dy;
        
        if( n == 3 )
        {
          // this is more efficient and takes advantage of x-sorting
          dx = p[1].x - p[0].x;
          dy = p[1].y - p[0].y;
          d  = Math.sqrt(dx*dx + dy*dy);
          
          this._bestDist = d;
          
          dx = p[2].x - p[1].x;
          dy = p[2].y - p[1].y;
          d  = Math.sqrt( dx*dx + dy*dy );
          
          if( d < this._bestDist )
            return [ p[1], p[2] ];
          else
            return [ p[0], p[1] ];
        }
        
        // now, for the fun part ...
        var pY   = p.slice();  // point set to be ordered/merged by y
        var n1   = n-1;
        
        var d = this.__closestPoint( p, pY, 0, n1 );
        
        return [this._best1, this._best2];
      }
      
      // internal method - closest point in range (pointsByX sorted by x-coord, pointsByY sorted by y-coord)
      , __closestPoint( pointsByX, pointsByY, from, to )
      {
        var dx, dy;
        
        // outlier
        if( to <= from )
          return Number.MAX_VALUE;

        // median point
        var mid    = Math.floor( from + (to - from)/2 );
        var median = pointsByX[mid];
        
        // left-right sections (from-mid) and (mid-to)
        var left  = this.__closestPoint(pointsByX, pointsByY, from, mid);
        var right = this.__closestPoint(pointsByX, pointsByY, mid+1, to);
        var d     = Math.min(left, right);
        
        var args = ['y'];
        pointsByY.sort
        (
          function(a,b)
          {
            var props = args.slice();
            var prop  = props.shift();
            while( a[prop] == b[prop] && props.length ) 
              prop = props.shift();
              
            return a[prop] == b[prop] ? 0 : a[prop] > b[prop] ? 1 : -1;
           }
        );
        
        var tmp = [];
        var m = 0;
        for( i=from; i<=to; ++i) 
        {
          if( Math.abs(pointsByY[i].x - median.x ) < d )
            tmp[m++] = pointsByY[i];
        }
       
        var j;
        var distance;
        for( i=0; i<m; ++i ) 
        {
          j = i+1;
          
          // this iteration count is limited by the presort
          while( (j < m) && (tmp[j].y - tmp[i].y < d) ) 
          {
            dx = tmp[j].x - tmp[i].x;
            dy = tmp[j].y - tmp[i].y;
            
            distance = Math.sqrt(dx*dx + dy*dy);
            if( distance < d ) 
            {
              d = distance;
              if( d < this._bestDist ) 
              {
                this._bestDist = d;
                this._best1    = tmp[i];
                this._best2    = tmp[j];
              }
            }
            
            j++;
          }
        }
        
        return d;
      }
    }
  }
  
  return returnedModule;
});
