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
    * Elliptical arc
    * 
    * @param a : Number - Major axis length
    * @param b : Number - Minor axis length
    * @param centerX : Number - x-coordinate of ellipse center
    * @param centerY : Number - y-coordinate of ellipse center
    * @param rotation : Number - Rotation of ellipse in radians
    * 
    * @author Jim Armstrong (www.algorithmist.net)
    * 
    * @version 1.0
    */
    this.EllipticalArc = function(a, b, centerX, centerY, rotation)
    {
      if( isNaN(a) )
        a = 300;
      
      if( isNaN(b) )
        b = 150;
      
      if( isNaN(centerX) )
        centerX = 0;
      
      if( isNaN(centerY) )
        centerY = 0;
      
      if( isNaN(rotation) )
        rotation = 0;
      
      var major = Math.max(a,b);
      var minor = Math.min(a,b);
      
      this._a     = major;     // major axis length
      this._b     = minor;     // minor axis length
      this._xc    = centerX;   // center of ellipse, x-coordinate
      this._yc    = centerY;   // center of ellipse, y-coordinate
      this._theta = rotation;  // rotation of ellipse
    }

    this.EllipticalArc.__name__ = true;
    this.EllipticalArc.prototype = 
    {
     /**
      * Return the major axis length
      * 
      * @return Number - Major axis length
      */
      get_a: function()
      {
        return this._a;
      }
    
     /**
      * Return the minor axis length
      * 
      * @return Number - Minor axis length
      */
      , get_b: function()
      {
        return this._b;
      }
      
     /**
      * Return the x-coordinate of the ellipse center
      * 
      * @return Number - x-coordinate of ellipse center
      */
      , get_centerX: function()
      {
        return this._xc; 
      }
      
     /**
      * Return the y-coordinate of the ellipse center
      * 
      * @return Number
      */
      , get_centerY: function()
      {
        return this._yc;
      }
      
     /**
      * Return the ellipse rotation
      * 
      * @return Number - Current rotation in radians
      */
      , get_rotation: function()
      {
        return this._theta;
      }
      
     /**
      * Assign the major axis length
      * 
      * @param value - Major axis length (must be greater than zero)
      * 
      * @return Nothing
      */
      , set_major: function(value)
      {
        if( !isNaN(value) && value > 0 )
          this._a = value;
      }
    
     /**
      * Assign the minor axis length
      * 
      * @param value - Minor axis length (must be greater than zero and <= major axis length before creating an arc)
      * 
      * @return Nothing
      */
      , set_minor: function(value)
      {
        if( !isNaN(value) && value > 0 )
          this._b = value;
      }
      
     /**
      * Assign the x-coordinate of the ellipse center
      * 
      * @param value : Number - x-coordinate of ellipse center
      * 
      * @return Nothing
      */
      , set_centerX: function(value)
      {
        if( !isNaN(value)  )
          this._centerX = value;
      }
      
     /**
      * Assign the y-coordinate of the ellipse center
      * 
      * @param value : Number - y-coordinate of ellipse center
      * 
      * @return Nothing
      */
      , set_centerY: function(value)
      {
        if( !isNaN(value)  )
          this._centerY = value;
      }
     
     /**
      * Assign the ellipse rotation
      * 
      * @param value : Number - rotation value in radians
      * 
      * @return Nothing - Positive rotation is CCW based on the coordinate system (y-down in Canvas coordinates)
      */
      , set_rotation: function(value)
      {
        if( !isNaN(value)  )
          this._theta = value;
      }
      
     /**
      * Create a new arc from one angle to another angle - use 0 to 2PI to draw a construct a complete ellipse
      * 
      * @param from : Number - Initial angle in radians - must be in [0,2PI]
      * @param to : Number - Final angle in radians - must be in [0,2PI]
      * 
      * @return Array - Draw stack for the elliptical arc (sequence of quad Beziers)
      */
      , create: function(from, to)
      {
        var twoPI = 2*Math.PI;
        
        if( isNaN(from) )
          from = 0;
        
        if( isNaN(to) )
          to = twoPI;
        
        from = Math.min( from, to );
        to   = Math.max( from, to );
        
        var lambda1 = Math.max(0, from);
        var lambda2 = Math.min(to, twoPI);
        var stack   = [];
      
        // a rough heuristic is break the arc into segments that span no more than PI/8 per segment and approximate each segment with a quad. Bezier
        var segments = Math.ceil(8*(lambda2-lambda1)/Math.PI);
        var c        = Math.cos(this._theta);
        var s        = Math.sin(this._theta);

        var a2 = 0.5*this._a;  // semi-major axis length
        var b2 = 0.5*this._b;  // semi-minor axis length
        
        // first drawing action is a Move
        var rho1 = Math.atan2(Math.sin(lambda1)/b2, Math.cos(lambda1)/a2);
        var myX  = this._xc + a2*c*Math.cos(rho1) - b2*s*Math.sin(rho1);
        var myY  = this._yc + a2*s*Math.cos(rho1) + b2*c*Math.sin(rho1);

        // first bezier control point
        var p0X = myX;
        var p0Y = myY;

        stack.push( "M " + p0X.toFixed(2) + " " + p0Y.toFixed(2) );
        
        var i, lambda, w;
        var rho2, p2X, p2Y, p1X, p1Y;
        
        for( i=0; i<segments; ++i )
        {
          lambda = i == segments-1 ? lambda2 : lambda1 + i*Math.PI/8;

          // point corresponding to lambda (increment from previous point and last bezier control point)
          rho2 = Math.atan2(Math.sin(lambda)/b2, Math.cos(lambda)/a2);
          p2X  = this._xc + a2*c*Math.cos(rho2) - b2*s*Math.sin(rho2);
          p2Y  = this._yc + a2*s*Math.cos(rho2) + b2*c*Math.sin(rho2);

          // compute the anchor or middle control point
          w   = Math.tan(0.5*(rho2-rho1));
          p1X = p0X - w*(a2*c*Math.sin(rho1) + b2*s*Math.cos(rho1));
          p1Y = p0Y + w*(-a2*s*Math.sin(rho1) + b2*c*Math.cos(rho1));

          stack.push( "Q " + p1X.toFixed(2) + " " + p1Y.toFixed(2) + " " + p2X.toFixed(2) + " " + p2Y.toFixed(2) );

          // here we go again ...
          p0X  = p2X;
          p0Y  = p2Y;
          rho1 = rho2;
        }
        
        // return the drawing stack
        return stack;
      }
    }
  }
  
  return returnedModule;
});