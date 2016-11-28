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

define(['./GeomUtils'], function (UtilsModule) 
{
  var returnedModule = function () 
  {
    var utilsRef    = new UtilsModule();
    var __geomUtils = new utilsRef.GeomUtils();
    
  /**
   * Common low-level utility methods for dealing with Circles.  Circles are a fundamental geometric entity and are often used as a bounding approximation
   * for game sprites.  This is NOT a circle class and all inputs are raw values, such as center-x, center-y, and radius.  So, the utilities will work with
   * any circle structure used in an application.  There are also many methods for very common computations for those who don't like looking up formulas ...
   * even simple ones :)
   * 
   * Note:  ALL angle measures are input and returned in radians.  Embrace the power of the radian, my young Padawans.
   * 
   * @author Jim Armstrong (www.algorithmist.net)
   * 
   * @version 1.0
   * 
   */
    this.CircleUtils = function()
    {
      this.TWO_PI = Math.PI + Math.PI;
      this._s     = 1 / Math.sqrt(2);
    }
   
    this.CircleUtils.__name__ = true;
    this.CircleUtils.prototype = 
    {
     /**
      * Return the area of the circle with given radius
      * 
      * @param r : Number - Radius (must be non-negative)
      * 
      * @return Number - Area of circle
      */
      area: function(r)
      {
        return isNaN(r) || r < 0 ? 0 : Math.PI*r*r; 
      }
    
     /**
      * Return the circumference of the circle with given radius
      * 
      * @param r : Number - Radius (must be non-negative)
      * 
      * @return Number - Circumference of circle
      */
      , circumference: function(r)
      {
        return isNaN(r) || r < 0 ? 0 : this.TWOPI*r; 
      }
    
     /**
      * Return the length of a circular arc with a given angular measure
      * 
      * @param r : Number - Circle radius (must be non-negative)
      * 
      * @param theta : Number - Angle in radians
      * 
      * @return Number - Measure of the circular arc that spans the given angle measure
      */
      , arc_length: function(r, t)
      {
        var radius = isNaN(r) || r < 0 ? 0 : r;
        var theta  = isNaN(t) ? 0 : t;
       
        return radius*theta;
      }
     
     /**
      * Compute properties of a circular segment defined by a chord a prescribed distance from the circle's center
      * 
      * @param r : Number - Circle radius (must be non-negative)
      * 
      * @param d : Number - Distance from chord midpoint to circle center in [0,r]
      * 
      * @return Object : 'l' property is the chord length.  'theta' property is the central angle, and 'area' property is the segment area.
      */
      , chord_params(radius, dist)
      {
        var r = isNaN(radius) || radius < 0 ? 0.05 : radius;
        var d = isNaN(dist) ? 0 : dist;
        d     = Math.max(0,d);
        d     = Math.min(r,d);
       
        var theta = Math.acos(d/r);
        var len   = r*Math.sqrt( theta - 2*Math.cos(theta) );
        var area  = 0.5*r*r( theta - sin(theta) );
        
        return { l:len, theta:theta, area:area };
      }
      
     /**
      * Compute properties of a circular sector defined by central angle
      * 
      * @param r : Number - Circle radius (must be non-negative)
      * 
      * @param theta : Number - Central angle in radians
      * 
      * @return Object - 'area' property is the area of the sector.  'l' is the arc length of the sector. 'p' property is total perimeter of the sector.
      */
      , sector_params: function(radius, theta)
      {
        var r = isNaN(radius) || radius < 0 ? 0.05 : radius;
        var t = isNaN(theta) ? 0 : theta;
        
        var len = r*theta;
        return { area:0.5*r*len, l:len, p:r*(theta+2) };
      }
      
     /**
      * Compute the coordinates of a point at an angle of theta (in radians) from the origin
      * 
      * @param r : Number - Circle radius (must be non-negative)
      * 
      * @param theta : Number - Central angle in radians
      * 
      * @return : Object - 'x' and 'y' properties contain the (x,y) coordinates 
      */
      , get_coords: function(radius, theta)
      {
        var r = isNaN(radius) || radius < 0 ? 0.05 : radius;
        var t = isNaN(theta) ? 0 : theta;
        
        return { x:r*Math.cos(theta), y:r*Math.sin(theta) };
      }
      
     /**
      * Return the properties of the largest inscribed rectangle inside a circle
      * 
      * @param r : Number - Circle radius (must be non-negative)
      * 
      * @return Object : 'w' and 'h' properties contain with width and height of the rectangle.  Note that the answer is always a square :)
      */
      , inscribedRect_props: function(radius)
      {
        var r = isNaN(radius) || radius < 0 ? 0 : radius;
        var d = r+r;
        
        return { w:d*this._s, h:d*this._s };
      }
      
     /**
      * Return the properties of an equilateral triangle inscribed inside a circle of known radius
      * 
      * @param r : Number - Circle radius (must be non-negative)
      * 
      * @return Object : 's' is the length of any side of the triangle and 'area' is the triangle area
      */
      , inscribedTriangle_props: function(radius)
      {
        var r = isNaN(radius) || radius < 0 ? 0 : radius;
        var s = r*Math.sqrt(3);
        var a = 0.25*Math.sqrt(3)*s*s;
        
        return { s:s, area:a };
      }
      
     /**
      * Return the radius of the circumcircle of a triangle with three side lengths
      * 
      * @param a : Side length 1 - must be non-negative
      * 
      * @param b : Side length 2 - must be non-negative
      * 
      * @param c : Side length 3 - must be non-negative
      * 
      * @return Number - Radius of circumcircle, i.e. circle that passes through all three vertices of the triangle
      */
      , triangle_circumcircle: function(a, b, c)
      {
        var _a = isNaN(a) || a < 0 ? 0 : a;
        var _b = isNaN(a) || a < 0 ? 0 : a;
        var _c = isNaN(a) || a < 0 ? 0 : a;
        
        if( _a == 0 && _b == 0 && _c == 0 )
          return 0;
        
        return abc / Math.sqrt( (a+b+c) * (b+c-a) * (c+a-b) * (a+b-c) );
      }
      
     /**
      * Return the incircle propeties for a triangle ABC through points (ax,ay), (bx,by), and (cx,cy)
      * 
      * @param ax : Number - x-coordinate of A
      * 
      * @param ay : Number - y-coordinate of A
      * 
      * @param bx : Number - x-coordinate of B
      * 
      * @param by : Number - y-coordinate of B
      * 
      * @param cx : Number - x-coordinate of C
      * 
      * @param cy : Number - y-coordinate of C
      * 
      * @return Object - 'r' property is radius of in-circle.  'x' and 'y' properties are x-y coordinates of the circle center.  'area' is the area of the triangle and
      * 'p' is its perimeter.  This type of operation is often performed interactively, so there is no error checking for max. performance.
      */
      , triangle_incircle: function(ax, ay, bx, by, cx, cy)
      {
        // opposite side lengths
        var dx = cx - bx;
        var dy = cy - by;
        var a  = Math.sqrt(dx*dx + dy*dy);
        
        dx    = cx - ax;
        dy    = cy - ay;
        var b = Math.sqrt(dx*dx + dy*dy);
        
        dx    = bx - ax;
        dy    = by - ay;
        var c = Math.sqrt(dx*dx + dy*dy);
        
        // perimiter
        var s = a + b + c;
        if( s < 0.00000001 )
          return { r:0, x:ax, y:ay, area:0, p:0 };
          
        var p = 1.0/s;
        
        // incenter coordinates
        var cx = (a*ax + b*bx + c*cx) * p;
        var cy = (a*ay + b*by + c*cy) * p;
        
        console.log( a, b, c );
        console.log( cx, cy );
        
        // area - since we already have permiter, use heron's forumula
        var semi = 0.5*s;
        var area = Math.sqrt( semi*(semi-a)*(semi-b)*(semi-c) );
        
        // incircle radius
        var r = 2*area*p;
        
        return { r:r, x:cx, y:cy, area:area, p:s };
      }
      
     /**
      * Circle-Circle Intersection
      * 
      * @param xc1 : Number - x-coordinate of first circle center
      * 
      * @param yc1 : Number - y-coordinate of first circle center
      * 
      * @param r1 : Number - first circle radius
      * 
      * @param xc2 : Number - x-coordinate of second circle center
      * 
      * @param yc2 : Number - y-coordinate of second circle center
      * 
      * @param r2 : Number - second circle radius
      * 
      * @return Object -  Array of objects with 'x' and 'y' properties containing coordinates of intersection point(s).  The array is empty 
      * if the two circles do not intersect, they are coincident, or one circle is contained inside another.  Unlike the GeomUtils utility,
      * this one is rigidly error-checked.  Use the GeomUtils method if you are confident of inputs and want a small performance boost for
      * gaming.
      */
      , circleCircleIntersection( xc1, yc1, r1, xc2, yc2, r2 )
      {
        if( isNaN(xc1) )
          return [];
        
        if( isNaN(yc1) )
          return [];
        
        if( isNaN(r1) )
          return [];
        
        if( isNaN(xc2) )
          return [];
        
        if( isNaN(yc2) )
          return [];
        
        if( isNaN(r2) )
          return [];
        
        if( r1 <= 0 )
          return [];
        
        if( r2 <= 0 )
          return [];
        
        return __geomUtils.circleToCircleIntersection( xc1, yc1, r1, xc2, yc2, r2 );
      }
    
     /**
      * Cicle-Line Segment intersection (intersection between circle and line segment passing through two points P0 and P1)
      * 
      * @param x1 - x-coordinate of P0
      * 
      * @param y1 - y-coordinate of P0
      * 
      * @param x2 - x-coordinate of P1
      * 
      * @param y2 - y-coordiante of P1
      * 
      * @param xc - x-coordinate of circle center
      * 
      * @param yc - y-coordinate of circle center
      * 
      * @return Array - Array of Objects with 'x' and 'y' properties that represent the (x,y) coordinates of each intersection point (up to two).  The array is 
      * empty if there is no intersection.  This algorithm is commonly used in games or highly-interactive applications, so there is no error-checking for performance
      * reasons.
      */
      , circleSegmentIntersection( x1, y1, x2, y2, xc, yc, r )
      {
        var dx     = x2-x1;
        var dy     = y2-y1;
        var normSq = dx*dx + dy*dy;
        
        var t = ( (xc-x1)*(x2-x1) + (yc-y1)*(y2-y1) ) / normSq;  
        
        if( t < 0 || t > 1 )
          return [];  // no intersection within line segment

        // compute the coordinates of the corresponding point, E
        var ex = (1-t)*x1 + t*x2;
        var ey = (1-t)*y1 + t*y2;

        // distance from E to center
        var tx = ex-xc;
        var ty = ey-yc;
        var d  = Math.sqrt( tx*tx + ty*ty );

        // intersection tests
        if( Math.abs(d-r) < 0.0001 )
        {
          // tangent
          return [ {x:ex, y:ey} ];
        }
        else if( d < r )
        {
          // two possible intersection points; account for IP outside line segment
          var norm = Math.sqrt(normSq);
          
          var dt = Math.sqrt( Math.abs(r*r - d*d) )/norm;
          var t1 = t - dt;
          var t2 = t + dt;
          
          var points = [];
          if( t1 >= 0 && t1 <= 1 )
            points.push( {x:t1*dx + x1, y:t1*dy + y1} );
          
          if( t2 >= 0 && t2 <= 1 )
            points.push( {x:t2*dx + x1, y:t2*dy + y1} );
          
          return points;
        }
        else
        {
          // no intersection
          return [];
        }
      }
     
     /**
      * Return the tangent points to a circle from a point, P,  that is external to the circle
      * 
      * @param xc - x-coordinate of circle center
      * 
      * @param yc - y-coordinate of circle center
      * 
      * @param r - circle radius
      * 
      * @param px - x-coordinate of point
      * 
      * @param py - y-coordinate of point
      * 
      * @return Array - Array of two objects whose 'x' and 'y' properties contain the coordinates of the tangent points.  The array is empty if the
      * point is inside the circle.  Otherwise, there is almost no error-checking for performance reasons.
      */
      , circleTangentsFromPoint( xc, yc, r, px, py )
      {
        var dx = px-xc;
        var dy = py-yc;
        var d  = Math.sqrt(dx*dx + dy*dy);
        
        if( d <= r || r <= 0 )
          return [];
        
        // this is actually the circle-circle intersection problem with the second circle at (px,py) and a radius of d
        return this.circleCircleIntersection( xc, yc, r, px, py, d );
      }
    }  
  }
  
  return returnedModule;
});