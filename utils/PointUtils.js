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

define(['../core/Point', './ApproxEqual'], function (PointModule, ApproxEqualModule) 
{
  var returnedModule = function () 
  {
    var pointRef  = new PointModule();
    var approxRef = new ApproxEqualModule();
    var __approx  = new approxRef.ApproxEqual();
    
  /**
   * Some utility methods dealing with point-to-point and point-to-line operations
   *  
   * @author Jim Armstrong (www.algorithmist.net)
   * 
   * @version 1.0
   * 
   */
    this.PointUtils = function()
    {
      
    }
   
    this.PointUtils.__name__ = true;
    this.PointUtils.prototype = 
    {
     /**
      * Compute the Euclidean distance between two points
      * 
      * @param p0 : Point - First point
      * 
      * @param p1 : Point - Second point
      * 
      * @return Number - Euclidean distance between the input points or 0 if either input is null
      */
      length: function(p0, p1) 
      {
        if( !p0 || !p1 )
          return 0;
        
        var dx = p0.get_x()-p1.get_x();
        var dy = p0.get_y()-p1.get_y();
          
        return Math.sqrt((dx*dx) + (dy*dy));
      }
    
     /**
      * Return the interior (minimum) angle between the origin and the two input points
      * 
      * @param p0 : Point - First point
      * 
      * @param p1 : Point - Second point
      * 
      * @param toDegree : Boolean - true if the result is to be returned in degrees
      * 
      * @return Number - Angle between two vectors from the origin to the first point and origin to the second point in radians unless toDegree is true
      */
      , angle: function(p0, p1, toDegree)
      {
        var value = Math.atan2( p1.get_y()-p0.get_y(), p1.get_x()-p0.get_x() );
        
        return toDegree ? 180*value/Math.PI : value;
      }
      
     /**
      * Compute the (distance) ratio between two line segments
      * 
      * @param p0 : Point - First point
      * 
      * @param p1 : Point - Second point
      * 
      * @param p2 : Point - Third point
      * 
      * @return Number  - Ratio of the distance from line segment P0-P2 to the distance of line segment P0-P1
      */
      , ratio(p0, p1, p2)
      {
        var l1 = this.length(p0, p1);
        var l2 = this.length(p0, p2);
        return (l2/l1);
      }
      
     /**
      * Are two line segments parallel
      * 
      * @param p0 : Point - First endpoint of first line segment
      * 
      * @param p1 : Point - Second endpoint of first line segment
      * 
      * @param p2: Point - First endpoint of second line segment
      * 
      * @param p3: Point - Second endpoint of second line segment
      */
      , isParallel(p0, p1, p2, p3)
      {
        var a1 = this.angle(p0, p1); 
        var a2 = this.angle(p2, p3);
        
        return __approx.compare( a1, a2, 0.0001 );
      }
      
     /**
      * Is the input point on the line segment between two other points?
      * 
      * @param p0 : Point - First endpoint of line segment
      * 
      * @param p1 : Point - Second endpoint of line segment
      * 
      * @param p : Point - Test point
      * 
      * @return Boolean - true if the test point is (numerically) on the line segment IN BETWEEN AND INCLUDING P0 to P1.
      */
      , pointOnLine: function(p0, p1, p)
      {
        // if p is on line segment from p0 to p1, then it must satisfy p = (1-t)*p0 + t*p1 for t in [0,1] - the process is, of course, complicated
        // by nearly horizontal/vertical lines and numerical issues.
        var tx = -1;
        var ty = -2;
        
        // endpoint tests
        var dx0 = p.get_x() - p0.get_x();
        var dy0 = p.get_y() - p0.get_y();
        if( Math.abs(dx0) < 0.00000001 && Math.abs(dy0) < 0.00000001 )
          tx = 0;
          
        var dx1 = p1.get_x() - p.get_x();
        var dy1 = p1.get_y() - p.get_y();
        if( Math.abs(dx1) < 0.00000001 && Math.abs(dy1) < 0.00000001 )
          ty = 1;
        
        if( tx == 0 || ty == 1 )
          return true;
        
        var dx = (p1.get_x() - p0.get_x());
        var dy = (p1.get_y() - p0.get_y());
        if( Math.abs(dx) < 0.00000001 )
        {
          if( Math.abs(dy) < 0.00000001 )
            return false;                 // otherwise coincident point test
          else
          {
            ty = dy0/(p1.get_y()-p0.get_y());
            return ty >= 0 && ty <= 1;
          }
        }
        else
        {
          tx = dx0/(p1.get_x()-p0.get_x());
          if( Math.abs(dy) < 0.00000001 )
            return tx >= 0 && tx <= 1;
          else
          {
            ty = dy0/(p1.get_y()-p0.get_y());
            if( tx >= 0 && tx <= 1 && ty >= 0 && ty <= 1 )
              return __approx.compare(tx, ty, 0.001);
            else
              return false;
          }
        }
      }
      
    /**
     * Is a point to the left of the line through two other points?
     * 
     * @param p0 : Point - Initial point of line segment
     * 
     * @param p1 : Point - Terminal point of line segment
     * 
     * @param p : Point - Test point
     * 
     * @return Boolean - true if the point is strictly to the left of the line segment
     */
      , isLeft(p0, p1, p2) 
      {
        var amt = (p1.get_x()-p0.get_x())*(p2.get_y()-p0.get_y()) - (p2.get_x()-p0.get_x())*(p1.get_y()-p0.get_y());
          
        return amt > 0;
      }
        
     /**
      * Project a specified distance in the direction of two points
      * 
      * @param p0 : Point - Origin point
      * 
      * @param p1 : Point - Direction point
      * 
      * @param d : Number - Projection distance
      * 
      * @return Object - 'x' and 'y' properties contain the x- and y-coordinates of the point projected a distance, d, in the direction from P0 to P1
      */
      , project: function(p0, p1, d) 
      {
        // trig. approach vs. unit vectors
        var a = this.angle(p0, p1);
        return { x:p0.get_x()+Math.cos(a)*d, y:p0.get_y()+Math.sin(a)*d };
      }
      
     /**
      * Return the index of the 'bottom left' element in an array of Points representing 2D coordinates (this presumes a y-up coordinate system)
      * 
      * @param points : Array - Point collection
      * 
      * @return Int - Index of bottom-left coordinate value
      */
      , bottomLeft: function(points)
      {
        var i     = 0;
        var index = 0;
        var pt;
        var len   = points.length;
        
        for( i=0; i<len; ++i) 
        {
          pt = points[i];
          if ( pt.get_y() < points[index].get_y() || (pt.get_y() <= points[index].get_y() && pt.get_x() < points[index].get_x() ) ) 
            index = i;
        }
        
        return index;
      }
      
     /**
      * Return the index of the 'bottom right' element in an array of Points representing 2D coordinates (this presumes a y-up coordinate system)
      * 
      * @param points : Array - Point collection
      * 
      * @return Int - Index of bottom-right coordinate value
      */ 
      , bottomRight: function(points)
      {
        var i     = 0;
        var index = 0;
        var pt;
        var len = points.length;
        
        for( i=0; i<len; ++i) 
        {
          pt = points[i];
          if ( pt.get_y() < points[index].get_y() || (pt.get_y() <= points[index].get_y() && pt.get_x() > points[index].get_x() ) ) 
            index = i;
        }
  
        return index;
      }
      
     /**
      * Return the index of the closest point from a point collection to an infinite line passing through two other points
      * 
      * @points : Array - Point collection 
      * 
      * @p0 : Point - First point on line
      * 
      * @p1 : Point - Second point on line
      * 
      * @return Int - Index of closest point to the infinite line passing through P0 and P1
      */
      , closestPointToLine(points, p0, p1)
      {
        var a = p0.get_y() - p1.get_y();
        var b = p1.get_x() - p0.get_x();
        var c = p0.get_x() * p1.get_y() - p1.get_x()*p0.get_y();
        
        var minIndex = 0;
        var min      = Math.abs( a*points[0].get_x() + b*points[0].get_y()+ c );
        var len      = points.length;
        var i, d;
        
        for( i=1; i<len; ++i ) 
        {
          d = Math.abs( a*p[i].get_x() + b*p[i].get_y() + c );
          if( d < min) 
          {
            minIndex = i;
            min      = d;
           }
        }
        
        return minIndex;
      }
      
     /**
      * Return the distance from a single point to the infinite line passing through two other points
      * 
      * @param p0 : Point - First point of line 
      * 
      * @param p1 : Point - Second point of line
      * 
      * @param p : Test point
      * 
      * @return Number - Distance from P to the infinite line passing through P0 and P1
      */
      , pointToLineDistancee( p0, p1, p)
      {
        var vx = p1.get_x() - p0.get_x();
        var vy = p1.get_y() - p0.get_y();
        
        var wx = p.get_x() - p0.get_x();
        var wy = p.get_y() - p0.get_y();;

        var c1 = vx*wx + vy*wy;
        var c2 = vx*vx + vy*vy;
        var b  = c1 / c2;

        var px = p0.get_x() + b*vx;
        var py = p0.get_y() + b*vy;
        
        var dx = p.get_x() - px;
        var dy = p.get_y() - py;
        
        return Math.sqrt( dx*dx + dy*dy);
      }
      
     /**
      * Return the distance from a single point to a line segment
      * 
      * @param p0 : Point - First point of line segment
      * 
      * @param p1 : Point - Second point of line segment
      * 
      * @param p : Test point
      * 
      * @return Number - Distance from P to line segment between P0 and P1, which could be greater than the distance between P and the infinite line between P0 and P1
      */
      , pointToSegmentDistance( p0, p1, p)
      {
        var vx = p1.get_x() - p0.get_x();
        var vy = p1.get_y() - p0.get_y();
        
        var wx = p.get_x() - p0.get_x();
        var wy = p.get_y() - p0.get_y();

        var c1 = wx*vx + wy*vy;
        if( c1 <= 0 )
          return Math.sqrt(wx*wx + wy*wy);
        
        var c2 = vx*vx + vy*vy;
        if ( c2 <= c1 )
        {
          wx = p1.get_x() - p.get_x();
          wy = p1.get_y() - p.get_y();
          
          return Math.sqrt(wx*wx + wy*wy);
        }
        
        var b  = c1 / c2;
        var px = p0.get_x() + b*vx;
        var py = p0.get_y() + b*vy;
        var dx = p.get_x() - px;
        var dy = p.get_y() - py;
        
        return Math.sqrt( dx*dx + dy*dy);
      }
        
     /** 
      * 
      * Return the intersection point from projecting a point onto a line 
      * 
      * @param p0 : Point - First point of line segment
      * 
      * @param p1 : Point - Second point of line segment
      * 
      * @param p : Input point
      * 
      * @return Point - Intersection point from the perpendicular projection of P onto the infinite line passing through P0 and P1.
      */
      , pointSegmentProjection( p0, p1, p )
      {
        var p0x = p0.get_x();
        var p0y = p0.get_y();
        var p1x = p1.get_x();
        var p1y = p1.get_y();
        var px  = p.get_x();
        var py  = p.get_y();
        
        var t;
        var dx = p1x-p0x;
        var dy = p1y-p0y;
        var d = dx*dx + dy*dy;
        if( d < 0.0000001 )
          return new pointRef.Point(p0x, p0y);
        
        t = ( (px-p0x)*(p1x-p0x) + (py-p0y)*(p1y-p0y) ) / d;
        
        if( t < 0 )
          return new pointRef.Point(p0x, p0y);
        
        if( t > 1 )
          return new pointRef.Point(p1x, p1y);
        
        px = (1-t)*p0x + t*p1x;
        py = (1-t)*p0y + t*p1y;
        
        return new pointRef.Point(px,py);
      }
      
     /**
      * Reflect a point cloud about a line passing through P0 and P1
      * 
      * @param points : Array - Array of Points
      * 
      * @param p0 : Point - First point of line 
      * 
      * @param p1 : Point - Second point of line
      * 
      * @return Array - Reflected point cloud, provided that the line segment is (numerically) distinct; otherwise, the original array is returned.
      */
      , reflect: function( points, p0, p1 )
      {
        var p1x, p1y;

        var x0 = p0.get_x();
        var y0 = p0.get_y();
        var x1 = p1.get_x();
        var y1 = p1.get_y();
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
          dx  = p.get_x() - x0;
          dy  = p.get_y() - y0;
          p1x = (a*dx + b*dy + x0); 
          p1y = (b*dx - a*dy + y0);

          reflect.push( new pointRef.Point(p1x, p1y) );
        }
        
        return reflect;
      }
    }
  }
  
  return returnedModule;
});
