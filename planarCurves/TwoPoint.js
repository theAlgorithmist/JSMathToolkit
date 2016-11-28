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

define(['./QuadBezier'], function (QuadBezierModule) 
{
  var returnedModule = function () 
  {
    var bezierRef = new QuadBezierModule();
    var __bezier  = new bezierRef.QuadBezier();
    
   /**
    * The TwoPoint algorithm computes a quadratic bezier curve between two points using an orientation parameter (up/down) and a multiplier of the distance
    * between the two points to place an interpolation point.  A common usage is to set a first point that is unchanged (anchored) and vary the second
    * point and/or multiplier.
    * 
    * @author Jim Armstrong (www.algorithmist.net)
    * 
    * @version 1.0
    * 
    */
    this.TwoPoint = function()
    {
      this.__x0 = 0;
      this.__y0 = 0;
    }
    
    this.TwoPoint.__name__ = true;
    this.TwoPoint.prototype = 
    {
     /**
      * Access the first or anchor point
      * 
      * @return Object - 'x' and 'y' properties contain the x- and y-coordinate of the anchor point
      */
      get_first()
      {
        return {x:this.__x0, y:this.__y0};
      }
    
     /**
      * Assign the first point
      * 
      * @param _x : Number - New x-coordinate
      * @param _y : Number - New y-coordinate
      * 
      * @return Nothing
      */
      , set_first: function(_x, _y)
      {
        if( !isNaN(_x) )
          this.__x0 = _x;
      
        if( !isNaN(_y) )
          this.__y0 = _y;
      }
    
     /**
      * Create a new two-point curve in the specified direction
      * 
      * @param _x : Number - x-coordinate of the second point 
      * 
      * @param _y : Number - y-coordinate of the second point
      * 
      * @param dir : String - "up" or "down" depending on whether the curve is CCW from the first to second point
      * 
      * @param mult : Number - Multiplier of the distance between the first and second points to place the interpolation point.  A value in the range [.2, .8]
      * typically produces visually pleasing results. The smaller the value, the closer the curve is to the line segment.
      * 
      * @return Object - 'x0', 'y0', 'cx', 'cy', 'x1', and 'y1' properties of the quadratic bezier that interpolates the first and second points.  The
      * middle interpolation point is midway between the two points, and project at a distance of mult (perpendicular) times the distance between the
      * two input points.  The direction of the curve will be dependent on whether or not the coordinate system is y-up or y-down.
      */
      , create: function(_x, _y, dir, mult)
      {
        if( dir == undefined )
          dir = "u";
      
        if( mult == undefined )
          mult = 0.5;
      
        var direction = dir.toLowerCase().charAt(0);
        if( direction != "u" && direction != "d" )
          direction = "u"
          
        // compute a quad Bezier curve that interpolates (__x0,__y0) and (_x1, _y) with shape characteristics determined by the supplied parameters
        var firstx = this.__x0;
        var firsty = this.__y0;
        var lastx  = _x;
        var lasty  = _y;
        var deltax = lastx - firstx;
        var deltay = lasty - firsty;
        var dist   = Math.sqrt(deltax*deltax + deltay*deltay);
        
        var midpointx = 0.5*(firstx + lastx);
        var midpointy = 0.5*(firsty + lasty);
        
        var dx = lastx - midpointx; 
        var dy = lasty - midpointy;
        var rx, ry;
      
        // R is the rotated vector
        if( direction == "u" )
        {
          rx = midpointx + dy;
          ry = midpointy - dx;
        }
        else
        {
          rx = midpointx - dy;
          ry = midpointy + dx;
        }
        
        deltax = rx - midpointx;
        deltay = ry - midpointy;
        var d  = Math.sqrt(deltax*deltax + deltay*deltay);
        var ux = deltax / d;
        var uy = deltay / d;
        
        var p1x = midpointx + mult*dist*ux;
        var p1y = midpointy + mult*dist*uy;
        
        var t   = __bezier.interpolate( [ {x:this.__x0, y:this.__y0}, {x:p1x, y:p1y}, {x:_x, y:_y} ] );
        var obj = __bezier.toObject();
      
        return obj;
      }
    }
  }
  
  return returnedModule;
});