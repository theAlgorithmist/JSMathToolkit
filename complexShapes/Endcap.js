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
    * An endcap is a semicircular arc that is oriented up, down, left, or right.  It can be closed and is typically used to
    * 'round off' the ends of other complex shapes that would otherwise have a straight edge.  The endcap always spans pi radians.
    * 
    * @param r : Number - Endcap radius (must be greater than zero)
    * @param centerX : Number - x-coordinate of endcap center
    * @param centerY : Number - y-coordinate of endcap center
    * 
    * @author Jim Armstrong (www.algorithmist.net)
    * 
    * @version 1.0
    */
    this.Endcap = function(radius, centerX, centerY)
    {
      if( isNaN(radius) )
        radius = 10;
      
      if( isNaN(centerX) )
        centerX = 0;
      
      if( isNaN(centerY) )
        centerY = 0;
      
      this.__radius = Math.max(1, Math.abs(radius)); 
      this.__xC = centerX;            // x-coordinate of center
      this.__yC = centerY;            // y-coordinate of center
      
      this.PI4_INV = 4.0/Math.PI;
    }

    this.Endcap.__name__ = true;
    this.Endcap.prototype = 
    {
     /**
      * Return the  radius
      * 
      * @return Number - Endcap radius
      */
      get_radius: function()
      {
        return this.__radius;
      }
      
     /**
      * Return the x-coordinate of the ellipse center
      * 
      * @return Number - x-coordinate of ellipse center
      */
      , get_centerX: function()
      {
        return this.__xC; 
      }
      
     /**
      * Return the y-coordinate of the Endcap center
      * 
      * @return Number
      */
      , get_centerY: function()
      {
        return this.__yC;
      }
     
     /**
      * Assign the Endcap radius
      * 
      * @param value - Endcap radius (must be greater than zero)
      * 
      * @return Nothing
      */
      , set_radius: function(value)
      {
        if( !isNaN(value) && value > 0 )
          this.__radius = value;
      }
       
     /**
      * Assign the x-coordinate of the Endcap center
      * 
      * @param value : Number - x-coordinate of Endcap center
      * 
      * @return Nothing
      */
      , set_centerX: function(value)
      {
        if( !isNaN(value)  )
          this.__xC = value;
      }
       
     /**
      * Assign the y-coordinate of the Endcap center
      * 
      * @param value : Number - y-coordinate of Endcap center
      * 
      * @return Nothing
      */
      , set_centerY: function(value)
      {
        if( !isNaN(value)  )
          this.__yC = value;
      }
      
     /**
      * Create a new endcap based on the supplied direction
      * 
      * @param dir : String - 'up', 'down', 'right', or 'left'
      * 
      * @param closed : Boolean - True if the endcap is closed - this makes it a Wedge with a span of PI radians
      * @default false
      * 
      * @return Array - Draw stack for the Endcap - NOTE: Setting of from/to angles presumes a y-down (Canvas) coordinate system
      */
      , create: function(dir, closed)
      {
        var direction = dir.toLowerCase();
        if( direction != "up" && direction != "down" && direction != "left" && direction != "right" )
          direction = "up";
        
        if( closed == undefined )
          closed = false;
        
        var from, to;
        switch( direction )
        {
          case "up":
            from = Math.PI;
            to   = from + Math.PI;
          break;
          
          case "down":
            from = 0;
            to   = Math.PI;
          break;
          
          case "left":
            from = Math.PI/2;
            to   = from + Math.PI
          break;
          
          case "right":
            from = -Math.PI/2;
            to   = Math.PI/2;
          break;
        }
        
        // circle code is in-lined for performance with the appropriate span of PI radians
        var stack = [];
        
        var delta  = to - from;
        var radInv = 1.0/this.__radius;
      
        var numSeg = Math.ceil(Math.abs(delta*this.PI4_INV));
	      var arc    = delta/numSeg;
        var pX     = this.__radius*Math.cos(from);
        var pY     = this.__radius*Math.sin(from);
        var p0X    = this.__xC + pX;
        var p0Y    = this.__yC + pY;
        var qX     = 0;
        var qY     = 0;
        var angle  = from;
 
        if( closed )
        {
          stack.push( "M " + this.__xC.toFixed(2) + " " + this.__yC.toFixed(2) );
          stack.push( "L " + p0X.toFixed(2) + " " + p0Y.toFixed(2) );
        }
        else
          stack.push( "M " + p0X.toFixed(2) + " " + p0Y.toFixed(2) );
      
        var i, p1X, p1Y, cx, cy, p2X, p2Y;
        for( i=0; i<numSeg; ++i )
        {
          angle += arc;
          qX     = this.__radius*Math.cos(angle);
          qY     = this.__radius*Math.sin(angle);
          p2X    = this.__xC + qX;
          p2Y    = this.__yC + qY;

          var dX = (pX+qX)*radInv;
          var dY = (pY+qY)*radInv;
          var d  = Math.sqrt(dX*dX + dY*dY);
          dX    /= d;
          dY    /= d;

          p1X  = this.__xC + this.__radius*dX;
          p1Y  = this.__yC + this.__radius*dY;

          cX = 2.0*p1X - 0.5*(p0X + p2X);
          cY = 2.0*p1Y - 0.5*(p0Y + p2Y);

          stack.push( "Q " + cX.toFixed(2) + " " + cY.toFixed(2) + " " + p2X.toFixed(2) + " " + p2Y.toFixed(2) );

          p0X = p2X;
          p0Y = p2Y;
          pX    = qX;
          pY    = qY;
        }
        
        if( closed )
          stack.push( "L " + this.__xC.toFixed(2) + " " + this.__yC.toFixed(2) );
        
        return stack;
      }
    }
  }
  
  return returnedModule;
});