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

define(['../core/Point', './PointUtils', './GeomUtils'], function (PointModule, PointUtilsModule, GeomUtilsModule) 
{
  var returnedModule = function () 
  {
    var pointRef      = new PointModule();
    var pointUtilsRef = new PointUtilsModule();
    var geomUtilsRef  = new GeomUtilsModule();
    
    var __pointUtils = new pointUtilsRef.PointUtils();
    
  /**
   * Some utility methods for polygons (note that coordinate convention is y-up)
   *  
   * @author Jim Armstrong (www.algorithmist.net)
   * 
   * @version 1.0
   * 
   */
    this.PolygonUtils = function()
    {
    }
   
    this.PolygonUtils.__name__ = true;
    this.PolygonUtils.prototype = 
    {
    /**
     * Compute a set of tangent points from an arbitrary polygon (which may not be convex) to an input point.  Often used for rough line-of-sight or shooting
     * computations in games.
     * 
     * @param poylygon : Polygon - Input Polygon (must have at least three vertices)
     * 
     * @param p : Point - Input Point - MUST BE EXTERIOR TO THE POLYGON
     * 
     * @return Array - Indices of leftmost and rightmost tangent point on the polygon.  Returns [0,0] if there are less than three points in the polygon.
     * Note that faster algorithms exist if the polygon is known to be convex in advance.  Results will not be reliable if the test point is inside the polygon and
     * no error check is made for that condition.
     * 
     * Credit: geomalgorithms.com
     */
      tangents(polygon, p)
      {
        var n = polygon.get_numPoints();
        if( n < 3 )
          return [0, 0];
        
        var i;
        var ePrev = false;
        var eNext = false;
        var rTan  = 0;
        var lTan  = 0;
        
        var xcoord   = polygon.get_xcoordinates();
        var ycoord   = polygon.get_ycoordinates();
        var vertices = [];
        
        for( i=0; i<n; ++i )
          vertices.push( new pointRef.Point(xcoord[i], ycoord[i]) );
        
        vertices.push( new pointRef.Point(xcoord[0], ycoord[0]) );
        
        ePrev = __pointUtils.isLeft( vertices[0], vertices[1], p );
        for( i=1; i<n; ++i ) 
        {
          eNext = __pointUtils.isLeft(vertices[i], vertices[i+1], p);
          if( !ePrev && eNext ) 
          {
            if( !this.__below(p, vertices[i], vertices[rTan]) )
              rTan = i;
          }
          else if( ePrev && !eNext ) 
          {
            if( !this.__above(p, vertices[i], vertices[lTan]) )
              lTan = i;
          }
          
          ePrev = eNext;
        }
        
        return [ lTan, rTan ];
      }
      
     /**
      * Do two polygons intersect?
      * 
      * @param poly1 : Polygon - First polygon
      * 
      * @param poly2 : Polygon - Second polygon
      * 
      * @return Boolean : True if the polygons intersect.  Any point of contact within zero tolerance counts as an intersection.  The algorithm is suitable for
      * online applications where the polygons have at most several dozen vertices.
      */
      , intersect: function( poly1, poly2, yDown )
      {
        if( yDown == undefined )
          yDown = false;
        
        // outlier cases
        var n1 = poly1.get_numPoints();
        var n2 = poly2.get_numPoints();
        var p1, p2;
        var p1x, p1y;
        var p2x, p2y;
        
        if( n1 == 0 || n2 == 0 )
          return false;
        
        var xc1 = poly1.get_xcoordinates();
        var yc1 = poly1.get_ycoordinates();
        var xc2 = poly2.get_xcoordinates();
        var yc2 = poly2.get_ycoordinates();
        
        if( n1 == 1 || n2 == 1 )
          return Math.abs(xc1[0]-xc2[0]) < 0.0001 && Math.abs(yc1[0]-yc2[0]) < 0.0001;
          
        // simplest test is to see if the bounding boxes intersect - if not, then the polygons can not intersect
        var bound1 = poly1.getBoundingBox(yDown);
        var bound2 = poly2.getBoundingBox(yDown);
        
        var __geomUtils = new geomUtilsRef.GeomUtils();
        console.log( "bounding-box intersect: ", __geomUtils.boxesIntersect(bound1,bound2) );
        
        if( !__geomUtils.boxesIntersect(bound1,bound2) )
          return false;
        
        // now we have to do it the hard way.  preface segment-segment intersection to return a quick false if there is no intersection based on bounding-box
        // of the segments, so it's a very fast test to eliminate what are often a large set of non-intersections.  For this version, intended for online use, 
        // test each segment (edge) in one polygon vs. the other.  As soon as an intersection is found, the method breaks and returns true.  If users require a faster 
        // test, one can be implemented in a future release.
        var i;
        var j;
        var intersect;
        var p1x, p1y, q1x, q1y;
        var p2x, p2y, q2x, q2y;
        var minX1, minY1, minX2, minY2;
        var maxX1, maxY1, maxX2, maxY2;
        var bailout = false;
        
        // poly1
        for( i=0; i<n1; ++i )
        {
          p1x = xc1[i];
          p1y = yc1[i];
          q1x = i == n1-1 ? xc1[0] : xc1[i+1];
          q1y = i == n1-1 ? yc1[0] : yc1[i+1];
          
          minX1 = Math.min(p1x, q1x);
          minY1 = Math.min(p1y, q1y);
          maxX1 = Math.max(p1x, q1x);
          maxY1 = Math.max(p1y, q1y);
          
          //console.log( "i: ", i, " - 1st segment: ", p1x, p1y, " - ", q1x, q1y );
          
          // poly2
          for( j=0; j<n2; ++j )
          {
            p2x = xc2[j];
            p2y = yc2[j];
            q2x = j == n2-1 ? xc2[0] : xc2[j+1];
            q2y = j == n2-1 ? xc2[0] : yc2[j+1];
            
            minX2 = Math.min(p2x, q2x);
            minY2 = Math.min(p2y, q2y);
            maxX2 = Math.max(p2x, q2x);
            maxY2 = Math.max(p2y, q2y);
            
            //console.log( "   j: ", j, " - 2nd test segment: ", p2x, p2y, " - ", q2x, q2y );
            
            // quick non-intersection test
            bailout = false;
            if( yDown )
            {
              if( maxY1 < minY2 || minY1 > maxY2 )
                bailout = true;
              
              if( maxX1 < minX2 || minX1 > maxX2 )
                bailout = true;
            }
            else
            {
              if( minY1 > maxY2 || maxY1 < minY2 )
                bailout = true;
            
              if( minX1 > maxX2 || maxX1 < minX2)
                bailout = true;
            }
            
            // full segment intersection
            if( !bailout )
            {
              if( __geomUtils.segmentsIntersect(p1x, p1y, q1x, q1y, p2x, p2y, q2x, q2y) )
                return true;
            }
          }
        }
        
        return false;
      }
      
      // internal method - Vi above Vj ?
      , __above: function(P,Vi,Vj)
      {
        var amt = (Vi.get_x()-P.get_x())*(Vj.get_y()-P.get_y()) - (Vj.get_x()-P.get_x())*(Vi.get_y()-P.get_y());
        
        return amt > 0;
      }
      
      // internal method - Vi (strictly) below Vj? 
      , __below(P,Vi,Vj)
      {
        var amt = (Vi.get_x()-P.get_x())*(Vj.get_y()-P.get_y()) - (Vj.get_x()-P.get_x())*(Vi.get_y()-P.get_y());
        
        return amt < 0;
      }
    }
  }
  
  return returnedModule;
});
