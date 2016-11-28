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

define(['../planarCurves/QuadBezier'], function (BezierModule) 
{
  var returnedModule = function () 
  {
    var bezierRef = new BezierModule();
    var __bezier  = new bezierRef.QuadBezier(0,0);
    
   /**
    * An curved arc that may have arrows at either end.  If neither arrow is drawn, this shape defaults to a two-point planar curve.  The curve passes
    * through points P0 (x0,y0) and P1 (x1,y1)
    * 
    * @param x0 : Number - x-coordinate of P0
    * 
    * @param y0 : Number - y-coordiante of P0
    * 
    * @param x1 : Number - x-coordinate of P1
    * 
    * @param y1 : Number - y-coordinate of P1
    * 
    * @author Jim Armstrong (www.algorithmist.net)
    * 
    * @version 1.0
    */
    this.ArrowedArc = function( x0, y0, x1, y1 )
    {
      this._x0 = isNaN(x0) ? 0 : x0;
      this._y0 = isNaN(y0) ? 0 : y0;
      this._x1 = isNaN(x1) ? 0 : x1;
      this._y1 = isNaN(y1) ? 0 : y1;
    }

    this.ArrowedArc.__name__ = true;
    this.ArrowedArc.prototype = 
    {
     /**
      * Return the x0 parameter
      * 
      * @return Number - value of x0
      */
      get_x0: function()
      {
        return this._x0;
      }
    
     /**
      * Return the y0 parameter
      * 
      * @return Number - value of y0
      */
      , get_y0: function()
      {
        return this._y0;
      }
      
     /**
      * Return the x1 parameter
      * 
      * @return Number - value of x1
      */
      , get_x1: function()
      {
        return this._x1;
      }
     
     /**
      * Return the y1 parameter
      * 
      * @return Number - value of y1
      */
      , get_y1: function()
      {
        return this._y1;
      }
       
     /**
      * Assign the x0 parameter
      * 
      * @param value : Number - new x0 value
      * 
      * @return Nothing
      */
      , set_x0: function(value)
      {
        this._x0 = isNaN(value) ? this._x0 : value;
      }
      
     /**
      * Assign the y0 parameter
      * 
      * @param value : Number - new y0 value
      * 
      * @return Nothing
      */
      , set_y0: function(value)
      {
        this._y0 = isNaN(value) ? this._y0 : value;
      }
        
     /**
      * Assign the x1 parameter
      * 
      * @param value : Number - new x1 value
      * 
      * @return Nothing
      */
      , set_x1: function()
      {
        this._x1 = isNaN(value) ? this._x1 : value;
      }
       
     /**
      * Assign the y1 parameter
      * 
      * @param value : Number - new y1 value
      * 
      * @return Nothing
      */
      , set_y1: function(value)
      {
        this._y1 = isNaN(value) ? this._y1 : value;
      }
    
     /**
      * Create a new arrowed arc
      * 
      * @param start : Boolean - true if start arrow is drawn
      * 
      * @param end : Boolean - true if end arrow is drawn
      * 
      * @param arrowWidth : Number - Arrow width (base of isoceles triangle)
      * 
      * @param arrowLength: Number - Arrow length (height of isoceles triangle)
      * 
      * @param dir : String - Direction or orientation of curve (up or down - same as TwoPoint planar curve)
      * 
      * @param multiplier : Number - Affects curvature of the arc - same as TwoPoint planar curve
      * 
      * @return Array - Draw stack for this arrow arc - arrows are oriented in the direction of the arc at each end
      */
      , create: function( start, end, arrowWidth, arrowLength, dir, mult )
      {
        if( start == undefined )
          start = false;
           
        if( end == undefined )
          end = false;
           
        if( isNaN(arrowWidth) || arrowWidth < 1 )
          arrowWidth = 6;
        
        if( isNaN(arrowLength) || arrowLength < 1 )
          arrowLength = 8;
           
        // the two-point curve code is in-lined since we will need some of the interim computations for the arrows
        if( dir == undefined )
          dir = "u";
         
        if( mult == undefined )
          mult = 0.5;
         
        var direction = dir.toLowerCase().charAt(0);
        if( direction != "u" && direction != "d" )
          direction = "u"
             
        // compute a quad Bezier curve that interpolates (__x0,__y0) and (_x1, _y) with shape characteristics determined by the supplied parameters
        var firstx = this._x0;
        var firsty = this._y0;
        var lastx  = this._x1;
        var lasty  = this._y1;
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
           
        var t   = __bezier.interpolate( [ {x:this._x0, y:this._y0}, {x:p1x, y:p1y}, {x:this._x1, y:this._y1} ] );
        var obj = __bezier.toObject();
        var cx  = obj.cx;
        var cy  = obj.cy;
           
        var stack = [];
           
        // draw stack begins with quad bezier
        stack.push( "M " + this._x0 + " " + this._y0 );
        stack.push( "Q " + cx.toFixed(2) + " " + cy.toFixed(2) + " " + this._x1 + " " + this._y1 );
          
        var d, dx, dy;
        var ux, uy;
        var nx, ny;
        var newX, newY;
           
        // tangents at start/end points are determined by convex hull of bezier
           
        // start arrow?
        if( start )
        {
          dx = this._x0 - cx;
          dy = this._y0 - cy;
          d  = Math.sqrt(dx*dx + dy*dy);
           
          // unit vector
          ux = dx/d;
          uy = dy/d;
           
          // and, the normal
          nx = -uy;
          ny = ux;
           
          stack.push( "M " + this._x0 + " " + this._y0 );
          newX = this._x0+arrowWidth*nx;
          newY = this._y0+arrowWidth*ny;
          stack.push( "L " + newX.toFixed(2) + " " + newY.toFixed(2) );
             
          newX = this._x0+arrowLength*ux;
          newY = this._y0+arrowLength*uy;
          stack.push( "L " + newX.toFixed(2) + " " + newY.toFixed(2) );
             
          newX = this._x0-arrowWidth*nx;
          newY = this._y0-arrowWidth*ny;
          stack.push( "L " + newX.toFixed(2) + " " + newY.toFixed(2) );
             
          stack.push( "L " + this._x0 + " " + this._y0 );
        }
           
        // end arrow?
        if( end )
        {
          dx = this._x1 - cx;
          dy = this._y1 - cy;
          d  = Math.sqrt(dx*dx + dy*dy);
             
          // unit vector
          ux = dx/d;
          uy = dy/d;
             
          // and, the normal
          nx = -uy;
          ny = ux;
             
          stack.push( "M " + this._x1 + " " + this._y1 );
             
          newX = this._x1+arrowWidth*nx;
          newY = this._y1+arrowWidth*ny;
          stack.push( "L " + newX.toFixed(2) + " " + newY.toFixed(2) );
             
          newX = this._x1+arrowLength*ux;
          newY = this._y1+arrowLength*uy;
          stack.push( "L " + newX.toFixed(2) + " " + newY.toFixed(2) );
             
          newX = this._x1-arrowWidth*nx;
          newY = this._y1-arrowWidth*ny;
          stack.push( "L " + newX.toFixed(2) + " " + newY.toFixed(2) );
             
          stack.push( "L " + this._x1 + " " + this._y1 );
        }
        
        return stack;
      }
    }
  }

  return returnedModule;
});
