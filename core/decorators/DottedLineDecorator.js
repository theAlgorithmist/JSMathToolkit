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
    * Dotted-line decorator intended for use in EaselJS or other (Canvas) drawing environment supporting clear(), moveTo(), lineTo() functions (curveTo() for quad. Beziers).
    * This line decorator has a dependency on the quad. Bezier for drawing dashed quad. bezier arcs.
    * 
    * @author Jim Armstrong
    * 
    * @version 1.0
    */
    this.DottedLineDecorator = function()
    {
      this.__radius  = 3;                                // dot radius
      this.__spacing = 4;                                // spacing between dots
      this.__dotX   = 0;                                 // x-center of most recent dot
      this.__dotY   = 0;                                 // y-center of most recent dot
      this.__refX   = 0;                                 // reference x-coordinate from most recent moveTo or lineTo
      this.__refY   = 0;                                 // reference y-coordinate from most recent moveTo or lineTo
      this.__length = 2*this.__radius + this.__spacing;  // total length to move between center of prior dot and mouse position
      this.__lSq    = this.__length*this.__length;       // test value
      this.__unused = 0;                                 // unused (squared) distance between last dot and reference coordinates
  
      // normalized arc-length and natural parameter as dot distribution progresses
      this.__s  = 0;
      this.__t  = 0;
  
      // quad control points
      this.__x0 = 0;
      this.__y0 = 0;
      this.__cx = 0;
      this.__cy = 0;
      this.__x1 = 0;
      this.__y1 = 0;
  
      // reference to a quad. bezier
      this.__quad = null;
    };

    this.DottedLineDecorator.__name__  = true;
    this.DottedLineDecorator.prototype = 
    {
     /**
      * Assign (name-value) parameters to control the line drawing.
      * 
      * @param _data : Object - This decorator uses 'radius' for dot radius and 'spacing' for px space between dots.
      * 
      * @return Nothing
      */
      setParams: function(_data)
      {
        if( _data.hasOwnProperty("radius") )
        {
          var isNumber  = !isNaN(parseFloat(_data.radius)) && isFinite(_data.radius);
          this.__radius = isNumber && _data.radius > 0 ? _data.radius : this.__radius;
        }
    
        if( _data.hasOwnProperty("spacing") )
        {
          isNumber       = !isNaN(parseFloat(_data.spacing)) && isFinite(_data.spacing);
          this.__spacing = isNumber && _data.spacing > 0 ? _data.spacing : this.__spacing;
        }
    
        // compensate for Javascript stupidity
        this.__length = 2*Math.floor(this.__radius) + Math.floor(this.__spacing);
        this.__lSq    = this.__length*this.__length;
      }
  
     /**
      * Move the pen to the specified point
      * 
      * @param _g : Dynamic - Graphic context (typically from EaselJS or other Canvas-based drawing environment that supports moveTo() )
      * 
      * @param _x : Int - x-coordinate of pen move in pixels
      * 
      * @param _y : Int - y-coordiante of pen move in pixels
      * 
      * @return Nothing
      */
      , moveTo: function(_g, _x, _y)
      { 
        // always begin a stroke with a dot
        this.drawDot(_g, _x, _y);
      
        this.__dotX   = _x;
        this.__dotY   = _y;
        this.__refX   = _x;
        this.__refY   = _y;
        this.__unused = 0;
    
        // one method does double-duty, whether we're drawing lines or arcs
        this.__x0 = _x;
        this.__y0 = _y;
        this.__s  = 0;
        this.__t  = 0;
      }
  
      // internal method - render dot into the graphic context
      ,drawDot: function(_g, _x, _y)
      {
        _g.drawCircle(_x, _y, this.__radius);
      }
  
     /** 
      * Draw a line with preset line properties from the current pen location to the input point
      * 
      * @param _g : Dynamic - Graphic context (typically from EaselJS or other Canvas-based drawing environment that supports lineTo() )
      * 
      * @param _x : Int - x-coordinate of line terminal point in pixels
      * 
      * @param _y : Int - y-coordinate of line terminal point in pixels
      * 
      * @return Nothing - A solid line is drawn from current pen location to the specified location according to the attributes of this decorator
      */
      ,lineTo: function(_g, _x, _y)
      { 
        // don't draw another dot until the current position is sufficiently far from the prior dot
        if( this.__unused == 0 )
        {
          var dx  = _x - this.__dotX;
          var dy  = _y - this.__dotY;
          var dSq = dx*dx + dy*dy;
        }
        else
        {
          dx  = _x - this.__refX;
          dy  = _y - this.__refY;
          dSq = dx*dx + dy*dy + this.__unused;
        }
    
        var d = 0;
    
        if( dSq <= this.__lSq )
        {
          // haven't moved far enough away from the previous dot
          this.__unused = dSq;
        }
        else
        {
          // we have to draw more than one dot, and that's where things get tricky.  All dots are along the direction from (__refX, __refY) to (_x,_y).  Compute a unit vector in that direction
          dx  = _x - this.__refX;
          dy  = _y - this.__refY;
          d   = Math.sqrt(dx*dx + dy*dy);
          dx /= d;
          dy /= d;

          if( this.__unused == 0 )
          {
            // the easy case
            var numDots = Math.floor( Math.sqrt(dSq)/this.__length );
          }
          else
          {
            // not as easy.  The first dot is at the unused distance from (__refX, __refY);
            d           = Math.sqrt(this.__unused);
            this.__dotX = this.__refX + dx*d;
            this.__dotY = this.__refY + dy*d;
        
            this.drawDot(_g, this.__dotX, this.__dotY);
        
            var tx  = _x - this.__dotX;
            var ty  = _y - this.__dotY;
            numDots = Math.floor( Math.sqrt(tx*tx + ty*ty)/this.__length );
          }
      
          if( numDots > 0 )
          {
            // loop over each dot sequence
            var i;
            for( i=0; i<numDots; ++i )
            {
              // coordinates of new dot center
              this.__dotX = this.__dotX + dx*this.__length;
              this.__dotY = this.__dotY + dy*this.__length;
      
              this.drawDot(_g, this.__dotX, this.__dotY);
            }
          }
      
          dx            = _x - this.__dotX;
          dy            = _y - this.__dotY;
          this.__unused = dx*dx + dy*dy;
        }
    
        // update reference coordinates for next lineTo
        this.__refX = _x;
        this.__refY = _y;
      }
  
      // draw a quadratic Bezier curve with preset line properties from the current point to the point (_x1,_y1) using (_cx, _cy) as a middle control point, into the input graphic context
      ,curveTo: function(_g, _cx, _cy, _x1, _y1)
      { 
        // to be implemented
        _g.curveTo(_cx, _cy, _x1, _y1); 
      }
  
     /**
      * Clear the graphic context
      * 
      * @param _g : Dynamic - Graphic context from EaselJS or any other Canvas-based drawing environement that supports a clear() method
      * 
      * @return Nothing - The graphic context is cleared and internal decorator properties are reset so that this method may be followed by a call to moveTo()
      */
      ,clear: function(_g)
      { 
        _g.clear(); 
    
        this.__s      = 0;
        this.__t      = 0;
        this.__x0     = 0;
        this.__y0     = 0;
        this.__cx     = 0;
        this.__cy     = 0;
        this.__x1     = 0;
        this.__y1     = 0;
        this.__refX   = 0;
        this.__refY   = 0;  
        this.__unused = 0;
      }
    }
  }
  
  return returnedModule;
});