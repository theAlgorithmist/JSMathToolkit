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
    * Circular wedge (aka pie shape - circular arc that can be filled to center of circle)
    * 
    * @param r : Number - Circle radius (must be greater than zero)
    * @param centerX : Number - x-coordinate of circle center
    * @param centerY : Number - y-coordinate of circle center
    * 
    * @author Jim Armstrong (www.algorithmist.net)
    * 
    * @version 1.0
    */
    this.Wedge = function(radius, centerX, centerY)
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

    this.Wedge.__name__ = true;
    this.Wedge.prototype = 
    {
     /**
      * Return the circle radius
      * 
      * @return Number - Circle radius
      */
      get_radius: function()
      {
        return this.__radius;
      }
      
     /**
      * Return the x-coordinate of the Wedge center
      * 
      * @return Number - x-coordinate of Wedge center
      */
      , get_centerX: function()
      {
        return this.__xC; 
      }
      
     /**
      * Return the y-coordinate of the Wedge center
      * 
      * @return Number
      */
      , get_centerY: function()
      {
        return this.__yC;
      }
     
     /**
      * Assign the circle radius
      * 
      * @param value - Circle radius (must be greater than zero)
      * 
      * @return Nothing
      */
      , set_radius: function(value)
      {
        if( !isNaN(value) && value > 0 )
          this.__radius = value;
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
          this.__xC = value;
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
          this.__yC = value;
      }
      
     /**
      * Create a new Wedge from one angle to another angle
      * 
      * @param from : Number - Initial angle in radians - must be in [0,2PI]
      * @param to : Number - Final angle in radians - must be in [0,2PI]
      * 
      * @return Array - Draw stack for the wedge
      */
      , create: function(from, to)
      {
        // this is really the code from CircularArc in-lined for max performance
        if( isNaN(from) )
          from = 0;
         
        if( isNaN(to) )
          to = twoPI;
        
        var stack = [];
         
        from = Math.min( from, to );
        to   = Math.max( from, to );
        
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
 
        stack.push( "M " + this.__xC.toFixed(2) + " " + this.__yC.toFixed(2) );
        stack.push( "L " + p0X.toFixed(2) + " " + p0Y.toFixed(2) );
        
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
        
        stack.push( "L " + this.__xC.toFixed(2) + " " + this.__yC.toFixed(2) );
        return stack;
      }
    }
  }
  
  return returnedModule;
});
