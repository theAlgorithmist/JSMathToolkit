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

define(['../planarCurves/CubicBezier', '../utils/GeomUtils'], function (CubicBezierModule, GeomUtilsModule) 
{
  var returnedModule = function () 
  {
    var bezierRef = new CubicBezierModule();
    __bezier      = new bezierRef.CubicBezier();
    
    var utilsRef    = new GeomUtilsModule();
    var __geomUtils = new utilsRef.GeomUtils();
    
   /**
    * Basic crescent shape defined with a center coordinate, offset, and a left/right orientation.  Note that a y-down (Canvas) coordinate system is required.
    * 
    * @param centerX : x-coordinate of crescent center
    * @param centerY : y-coordinate of crescent center
    * @param radius : Number - Radius of the circular segment that forms the outermost ring of the crescent
    * @param offset : Number - Value in (1, 2r) that determines the inner ring of the cresent.  Small values produce very thin cresents.  As the offset approaches
    * twice the radius, the crescent appears closer and closer to a full circle (but never reaches quite that extent).  The offset will be clipped if necessary.
    * 
    * @author Jim Armstrong (www.algorithmist.net)
    * 
    * @version 1.0
    */
    this.Crescent = function(centerX, centerY, radius, offset)
    {
      // y-down coordinate system
      this._xc     = isNaN(centerX) ? 0 : centerX;
      this._yc     = isNaN(centerY) ? 0 : centerY;
      this._radius = isNaN(radius) ? 40 : Math.abs(radius);
      this._offset = isNaN(offset) ? 15 : Math.abs(offset);
      
      this.PI4_INV = 4.0/Math.PI;
    }

    this.Crescent.__name__ = true;
    this.Crescent.prototype = 
    {
     /**
      * Return the radius
      * 
      * @return Number - Radius value
      */
      get_radius: function()
      {
        return this._radius;
      }
         
     /**
      * Return the x-coordinate of the circle center
      * 
      * @return Number - x-coordinate of circle center
      */
      , get_centerX: function()
      {
        return this._xc; 
      }
     
     /**
      * Return the offset
      * 
      * @return Number - Current offset
      */
      , get_offset: function()
      {
        return this._offset;
      }
         
     /**
      * Return the y-coordinate of the circle center
      * 
      * @return Number
      */
      , get_centerY: function()
      {
        return this._yc;
      }
        
     /**
      * Assign the radius
      * 
      * @param value - Circle radius (must be greater than zero)
      * 
      * @return Nothing
      */
      , set_radius: function(value)
      {
        if( !isNaN(value) && value > 0 )
          this._radius = value;
      }
          
     /**
      * Assign the x-coordinate of the circle center
      * 
      * @param value : Number - x-coordinate of circle center
      * 
      * @return Nothing
      */
      , set_centerX: function(value)
      {
        if( !isNaN(value)  )
          this._xc = value;
      }
          
     /**
      * Assign the y-coordinate of the circle center
      * 
      * @param value : Number - y-coordinate of circle center
      * 
      * @return Nothing
      */
      , set_centerY: function(value)
      {
        if( !isNaN(value)  )
          this._yc = value;
      }
      
     /**
      * Assign the offset
      * 
      * @param value : Number - offset value (must be greater than zero and should be less than 2r)
      * 
      * @return Nothing
      */
      , set_offset: function(value)
      {
        if( !isNaN(value) && value > 0 )
          this._offset = value;
      }
      
     /**
      * Create a new crescent shape
      * 
      * @param dir : String - 'left' or 'right' to define the orientation of the crescent
      * 
      * @return Array - Draw stack for the crescent shape - Note that the current version produces fractional coordinates.  It may be that fills do not work
      * since the two crescent circular arcs are created with the same angle sweep.  A canvas renderer may not recognize the shape as closed.  This will be
      * addressed in a future release.
      */
      , create: function(dir)
      {
        var direction = dir.toLowerCase();
        if( direction.charAt(0) != "l" && direction.charAt(0) != "r" )
          direction = "l";
        
        var offset = Math.max(1, this._offset);
        offset     = Math.min(offset, 2*this._radius-1);
        
        direction = direction.charAt(0);
        offset    = direction == "l" ? offset : -offset;
        
        // get the inner and outer circle intersections
        var intersect = __geomUtils.circleToCircleIntersection(this._xc, this._yc, this._radius, this._xc+offset, this._yc, this._radius);
        var x1        = intersect[0].x;
        var y1        = intersect[0].y;
        var x2        = intersect[1].x;
        var y2        = intersect[1].y;
        
        // circular arc code is in-lined for performance 
        var dx = x1 - this._xc;
        var dy = y1 - this._yc;
        var f  = Math.atan2(dy, dx);
        
        dx        = x2 - this._xc;
        dy        = y2 - this._yc;
        var t     = Math.atan2(dy, dx);
        var from  = Math.min(f, t);
        var to    = Math.max(f,t);
        
        // adjust for orientation
        if( direction == "l")
        {
          var h = from;
          from  = to; 
          to    = h + 2*Math.PI;
        }
        
        var delta = to - from;
        var stack = [];
        
        // outer crescent edge
        var xc      = this._xc;
        var yc      = this._yc;
        var radInv  = 1.0/this._radius;
        var numSeg  = Math.ceil(Math.abs(delta*this.PI4_INV));
        var arc     = delta/numSeg;
        var pX      = this._radius*Math.cos(from);
        var pY      = this._radius*Math.sin(from);
        var p0X     = xc + pX;
        var p0Y     = yc + pY;
        var qX      = 0;
        var qY      = 0;
        var angle   = from;
        var inverse = 1/(this._radius);

        stack.push( "M " + p0X.toFixed(2) + " " + p0Y.toFixed(2) );
        
        var i, qX, qY, p1X, p1Y, p2X, p2Y, dX, dY, d, cx, cy;
        for( i=0; i<numSeg; ++i )
        {
          angle += arc;
          qX     = this._radius*Math.cos(angle);
          qY     = this._radius*Math.sin(angle);
          p2X    = xc + qX;
          p2Y    = yc + qY;

          dX = (pX+qX)*inverse;
          dY = (pY+qY)*inverse;
          d  = Math.sqrt(dX*dX + dY*dY);
          dX /= d;
          dY /= d;

          p1X  = xc + this._radius*dX;
          p1Y  = yc + this._radius*dY;

          cX = 2.0*p1X - 0.5*(p0X + p2X);
          cY = 2.0*p1Y - 0.5*(p0Y + p2Y);

          stack.push( "Q " + cX.toFixed(2) + " " + cY.toFixed(2) + " " + p2X.toFixed(2) + " " + p2Y.toFixed(2) );
          
          p0X = p2X;
          p0Y = p2Y;
          pX  = qX;
          pY  = qY;
        }
        
        // inner edge
        xc += offset;
        dx  = x1 - xc;
        dy  = y1 - yc;
        f   = Math.atan2(dy, dx);
        
        dx    = x2 - xc;
        dy    = y2 - yc;
        t     = Math.atan2(dy, dx);
        from  = Math.min(f, t);
        to    = Math.max(f, t);
        
        // adjust for orientation
        if( direction == "l")
        {
          h     = from;
          from  = to; 
          to    = h + 2*Math.PI;
        }
        
        delta = to - from;
        
        pX     = this._radius*Math.cos(to);
        pY     = this._radius*Math.sin(to);
        pX     = this._radius*Math.cos(from);
        pY     = this._radius*Math.sin(from);
        p0X    = xc + pX;
        p0Y    = yc + pY;
        qX     = 0;
        qY     = 0;
        angle  = from;
        numSeg = Math.ceil(Math.abs(delta*this.PI4_INV));
        arc    = delta/numSeg;
        
        stack.push( "M " + p0X.toFixed(2) + " " + p0Y.toFixed(2) );
        
        for( i=0; i<numSeg; ++i )
        {
          angle += arc;
          qX     = this._radius*Math.cos(angle);
          qY     = this._radius*Math.sin(angle);
          p2X    = xc + qX;
          p2Y    = yc + qY;
          
          dX  = (pX+qX)*radInv;
          dY  = (pY+qY)*radInv;
          d   = Math.sqrt(dX*dX + dY*dY);
          dX /= d;
          dY /= d;
          
          p1X  = xc + this._radius*dX;
          p1Y  = yc + this._radius*dY;
          
          cX = 2.0*p1X - 0.5*(p0X + p2X);
          cY = 2.0*p1Y - 0.5*(p0Y + p2Y);
          
          stack.push( "Q " + cX.toFixed(2) + " " + cY.toFixed(2) + " " + p2X.toFixed(2) + " " + p2Y.toFixed(2) );
          
          p0X = p2X;
          p0Y = p2Y;
          pX  = qX;
          pY  = qY;
        }
        
        return stack;
      }
    }
  }
  
  return returnedModule;
});