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

define([], function () 
{
  var returnedModule = function () 
  {
   /**
    * Compute the drawing sequence for a Canvas-style arcTo command with a previously-set pen location
    * 
    * @param x0 : Number - x-coordinate of initial pen location
    * 
    * @param y1 : Number - y-coordinate of initial pen location
    * 
    * @author Jim Armstrong (www.algorithmist.net)
    * 
    * @version 1.0
    * 
    * Reference:  For a high-level description of how the method works, http://www.dbp-consulting.com/tutorials/canvas/CanvasArcTo.html
    */
    this.ArcTo = function(x0, y0)
    {
      this._penX = isNaN(x0) ? 0 : x0;
      this._penY = isNaN(y0) ? 0 : y0;
      
      this.PI4_INV = 4/Math.PI;
    }

    this.ArcTo.__name__ = true;
    this.ArcTo.prototype = 
    {
     /**
      * Access the pen point
      * 
      * @return Object - 'x' and 'y' properties contain the x- and y-coordinate of the anchor point
      */
      get_pen()
      {
        return {x:this.__x0, y:this.__y0};
      }
       
     /**
      * Assign the first or initial pen point
      * 
      * @param _x : Number - New x-coordinate
      * @param _y : Number - New y-coordinate
      * 
      * @return Nothing
      */
      , set_pen: function(_x, _y)
      {
        if( !isNaN(_x) )
          this._penX = _x;
         
        if( !isNaN(_y) )
          this._penY = _y;
      }
      
     /**
      * Create a new ArcTo 
      * 
      * @param _x1 : Number x-coordinate of first point
      * @param _y1 : Number y-coordinate of first point
      * 
      * @param _x2 : Number x-coordinate of second point
      * @param _y2 : Number y-coordinate of second point
      * 
      * @param _radius : Number Circular radius that defines the 'curved' shape of the complete ArcTo
      * 
      * @return Array - ArcTo draw stack - minimal error testing for performance - note that there are combinations of inputs that lead to an infeasible draw stack.
      * The current pen location is set to the terminal point of the arcTo stack.  Reset using the class-supplied mutator to begin a new ArcTo.
      */
      , create: function(_x1, _y1, _x2, _y2, _radius)
      {
        if( _radius <= 0 )
          return [];
        
        var stack = [];
        var startAngle;          // start-angle in radians
        var endAngle;            // end-angle in radians
        var delta;               // difference between start and end angles
        var radInv = 1/_radius;  // inverse of radius
        
        // quad. bezier fit through these points
        var p0X = 0;
        var p0Y = 0;
        var p1X = 0;
        var p1Y = 0;
        var p2X = 0;
        var p2Y = 0;
        
        // compute center
        var x1    = this._penX - _x1;
        var y1    = this._penY - _y1;
        var x2    = _x2 - _x1;
        var y2    = _y2 - _y1;
        var d1    = Math.sqrt(x1*x1 + y1*y1);
        var d2    = Math.sqrt(x2*x2 + y2*y2);
        var d     = x1*x2 + y1*y2;
        var angle = Math.acos(d/(d1*d2));
        var t     = Math.tan(0.5*angle);
        
        var dC = _radius*Math.sqrt(1 + 1/(t*t));
        var ux = x1/d1 + x2/d2;
        var uy = y1/d1 + y2/d2;
        d      = Math.sqrt(ux*ux + uy*uy);
        ux    /= d;
        uy    /= d;
        
        var xC = _x1 + ux*dC;
        var yC = _y1 + uy*dC;
        
        // start and end angles - circle-circle intersection to get points, then compute angles from points
        dx = _x1 - xC;                 // delta-x
        dy = _y1 - yC;                 // delta-y 
        d = Math.sqrt(dx*dx + dy*dy); // distance between centers
        
        var r0sq = _radius*_radius;
        var a    = 0.5*d;
        var h    = Math.sqrt( r0sq - a*a );
        
        dx /= d;
        dy /= d;
        
        // points of intersection are (x3,y3) and possibly (x4,y4)
        var x2 = xC + a*dx;
        var y2 = yC + a*dy;
        var x3 = x2 + h*dy;
        var y3 = y2 - h*dx;
        var x4 = x2 - h*dy;
        var y4 = y2 + h*dx;
        
        // intersection points are (x3,y3), (x4,y4) - which is along the line segment (x0,y0) to (x1,y1)?  Reorder so that (x3,y3) is always that point.
        var a1 = 0.5*( Math.abs( this._penX*(_y1-y3) + _x1*(y3-this._penY) + x3*(this._penY-_y1) ) );
        var a2 = 0.5*( Math.abs( this._penX*(_y1-y4) + _x1*(y4-this._penY) + x4*(this._penY-_y1) ) );
        
        // tbd - check if pen-x and x1 are nearly equal (should be done ahead of computations)
        if( a2 < a1 )
        {
          var tempX = x3;
          var tempY = y3;
          x3        = x4;
          y3        = y4;
          x4        = tempX;
          y4        = tempY;
        }
        
        startAngle = Math.atan2(y3-yC, x3-xC);
        endAngle   = Math.atan2(y4-yC, x4-xC);
        delta      = endAngle - startAngle;
        
        // need to take the small arc
        if( delta > Math.PI )
        {
          endAngle = endAngle - 2*Math.PI;
          delta    = endAngle - startAngle;
        }

        var i, dX, dY;
        var numSeg = Math.ceil(Math.abs(delta*this.PI4_INV));
        var arc    = delta/numSeg;
        var pX     = _radius*Math.cos(startAngle);
        var pY     = _radius*Math.sin(startAngle);
        p0X        = xC + pX;
        p0Y        = yC + pY;
        var qX     = 0;
        var qY     = 0;
        var angle  = startAngle;
        
        stack.push( "M " + this._penX.toFixed(2) + " " + this._penY.toFixed(2) );
        stack.push( "L " + p0X.toFixed(2) + " " + p0Y.toFixed(2) );
        
        var cX, cY;
        for( i=0; i<numSeg; ++i )
        {
          angle += arc;
          qX     = _radius*Math.cos(angle);
          qY     = _radius*Math.sin(angle);
          p2X    = xC + qX;
          p2Y    = yC + qY;
          
          dX  = (pX+qX)*radInv;
          dY  = (pY+qY)*radInv;
          d   = Math.sqrt(dX*dX + dY*dY);
          dX /= d;
          dY /= d;
          
          p1X = xC + _radius*dX;
          p1Y = yC + _radius*dY;
          
          cX = 2.0*p1X - 0.5*(p0X + p2X);
          cY = 2.0*p1Y - 0.5*(p0Y + p2Y);
          
          stack.push( "Q " + cX.toFixed(2) + " " + cY.toFixed(2) + " " + p2X.toFixed(2) + " " + p2Y.toFixed(2) );
          
          p0X = p2X;
          p0Y = p2Y;
          pX  = qX;
          pY  = qY;
        }
        
        this._penX = p2X;
        this._penY = p2Y;
        
        return stack;
      }
    }
  }
  
  return returnedModule;
});