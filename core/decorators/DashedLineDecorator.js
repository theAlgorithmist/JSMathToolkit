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
    * Dashed-line decorator intended for use in EaselJS or other (Canvas) drawing environment supporting clear(), moveTo(), lineTo() functions (curveTo() for quad. Beziers).
    * This line decorator has a dependency on the quad. Bezier for drawing dashed quad. bezier arcs.
    * 
    * @author Jim Armstrong
    * 
    * @version 1.0
    */
    this.DashedLineDecorator = function()
    {
      this.__penX        = 0;     // current pen x-coordinate
      this.__penY        = 0;     // current pen y-coordinate
      this.__upLength    = 3;     // pen-up length or space between dashes
      this.__dnLength    = 5;     // pen-down length
      this.__overflow    = 0;     // how much of the current dash overflows to the next line segment
      this.__drawingLine = true;  // true if drawing a line, false if space
  
      // total dash length
      this.__dashLength = this.__upLength + this.__dnLength;
  
      // normalized arc-length and natural parameter as dashing progresses
      this.__s  = 0;
      this.__t  = 0;
      this.__t0 = 0;
  
      // quad control points
      this.__x0 = 0;
      this.__y0 = 0;
      this.__cx = 0;
      this.__cy = 0;
      this.__x1 = 0;
      this.__y1 = 0;
  
      // normalized arc length consumed by pen-down and pen-up
      this.__sDown = 0;
      this.__sUp   = 0;
  
      // reference to a CompGeoJS quad. bezier to handle arc-length parameterization
      this.__quad = null;
    }

    this.DashedLineDecorator.__name__  = true;
    this.DashedLineDecorator.prototype = 
    {
     /**
      * Assign (name-value) parameters to control the line drawing.
      * 
      * @param _data : Object - This decorator uses the 'up' dash length (px length the pen is up) and 'down' dash length (px length the pen is down), 'uplength' and 'dnlength' parameters.
      * 
      * @return Nothing
      */
      setParams: function(_data)
      {
        if( _data.hasOwnProperty("dnLength") )
        {
          var isNumber = !isNaN(parseFloat(_data.dnLength)) && isFinite(_data.dnLength);
          this.__dnLength   = isNumber && _data.dnLength > 0 ? _data.dnLength : this.__dnLength;
        }
    
        if( _data.hasOwnProperty("upLength") )
        {
          isNumber   = !isNaN(parseFloat(_data.upLength)) && isFinite(_data.upLength);
          this.__upLength = isNumber && _data.upLength > 0 ? _data.upLength : this.__upLength;
        }
    
        // total dash length - compensate for Javascript stupidity
        this.__dashLength = Math.floor(this.__upLength) + Math.floor(this.__dnLength);
      }
  
     /**
      * Move the pen to the specified point
      * 
      * @param _g : Dynamic - Graphic context (typically from EaselJS or other Canvas-based drawing environment that supports moveTo() )
      * 
      * @param _x : Int - x-coordinate of pen move in pixels
      * 
      * @param _y : Int - y-coordinate of pen move in pixels
      * 
      * @return Nothing
      */
      , moveTo: function(_g, _x, _y)
      {  
        _g.moveTo(_x,_y); 
    
        this.__penX = _x;
        this.__penY = _y;
    
        // same method is used for drawing line or arc
        this.__x0 = _x;
        this.__y0 = _y;
        this.__t0 = 0;
        this.__s  = 0;
        this.__t  = 0;
      }
  
      /** 
       * Draw a line with preset line properties from the current pen location to the input point
       * 
       * @param _g : Dynamic - Graphic context (typically from EaselJS or other Canvas-based drawing environment that supports lineTo() )
       * 
       * @param _x : Int - x-coordinate of line terminal pointin pixels
       * 
       * @param _y : Int - y-coordinate of line terminal point in pixels
       * 
       * @return Nothing - A solid line is drawn from current pen location to the specified location according to the attributes of this decorator
       */
      , lineTo: function(_g, _x, _y)
      { 
        var dx = _x - this.__penX;
        var dy = _y - this.__penY;
  
        // angle of this line segment
        var ang  = Math.atan2(dy, dx);
        var ca   = Math.cos(ang)
        var sa   = Math.sin(ang);
  
        // total length of segment to be drawn
        var segLength = Math.sqrt(dx*dx + dy*dy);
    
        // any carry-over from previous segment?
        if( this.__overflow > 0 )
        {
          if( this.__overflow > segLength )
          {
            if( this.__drawingLine ) 
              this.execLineTo(_g, _x, _y);
            else 
              this.moveTo(_g, _x, _y);
      
            this.__overflow -= segLength;
            return;
          }
    
          if( this.__drawingLine ) 
            this.execLineTo(_g, this.__penX + ca*this.__overflow, this.__penY + sa*this.__overflow );
          else 
            this.moveTo(_g, this.__penX + ca*this.__overflow, this.__penY + sa*this.__overflow);
    
          segLength      -= this.__overflow;
          this.__overflow = 0;
    
          // reverse line to dash (or vice versa)
          this.__drawingLine = !this.__drawingLine;
    
          // finished if all remaining distance consumed with current line segment
          if( Math.abs(segLength) < 0.001 ) 
            return;
        }
  
        // how many full dash (dn-up) cycles?
        var dashes = Math.floor(segLength/this.__dashLength);
  
        if( dashes > 0 )
        {
          // coordinates of 'up' and 'down' part of dashed segment
          var dnX = ca*this.__dnLength;
          var dnY = sa*this.__dnLength;
          var upX = ca*this.__upLength;
          var upY = sa*this.__upLength;
          var i      = 0;
    
          for( i=0; i<dashes; ++i )
          {
            if( this.__drawingLine )
            {
              this.execLineTo(_g, this.__penX+dnX, this.__penY+dnY);
        
              this.moveTo(_g, this.__penX+upX, this.__penY+upY);
            }
            else
            {
              this.moveTo(_g, this.__penX+upX, this.__penY+upY);
        
              this.execLineTo(_g, this.__penX+dnX, this.__penY+dnY);
            }
          }
    
          segLength -= this.__dashLength*dashes;
        }
  
        // handle any leftover after drawing an equal number of dash-space or space-dash pairs
        if( this.__drawingLine )
        {
          if( segLength > this.__dnLength )
          {
            this.execLineTo(_g, this.__penX + ca*this.__dnLength, this.__penY + sa*this.__dnLength);
   
            this.moveTo(_g, _x, _y);
      
            this.__overflow    = this.__upLength - (segLength-this.__dnLength);
            this.__drawingLine = false;
          }
          else
          {
            this.execLineTo(_g, _x, _y);
      
            if( segLength == this.__dnLength )
            {
              this.__overflow    = 0;
              this.__drawingLine = !this.__drawingLine;
            }
            else
            {
              this.__overflow = this.__dnLength-segLength;
          
              this.moveTo(_g, _x, _y);
            }
          }
        }
        else
        {
          if( segLength > this.__upLength )
          {
            this.moveTo(_g, this.__penX+ca*this.__upLength, this.__penY+sa*this.__upLength);
      
            this.__overflow    = this.__dnLength - (segLength-this.__upLength);
            this.__drawingLine = true;
      
            this.execLineTo(_g, _x, _y);
          }
          else
          {
            this.moveTo(_g, _x, _y);
            if( segLength == this.__upLength )
            {
              this.__overflow    = 0;
              this.__drawingLine = !this.__drawingLine;
            }
            else 
              this.__overflow = this.__upLength-segLength;
          }
        }
      }
  
      // internal method
      , execLineTo: function(_g, _x, _y)
      {
        if( _x == this.__penX && _y == this.__penY ) 
          return;
      
        this.__penX = _x;
        this.__penY = _y;
      
        _g.lineTo(_x, _y);
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
    
        this.__overflow    = 0;
        this.__drawingLine = true;
    
        this.__s     = 0;
        this.__t     = 0;
        this.__t0    = 0;
        this.__x0    = 0;
        this.__y0    = 0;
        this.__cx    = 0;
        this.__cy    = 0;
        this.__x1    = 0;
        this.__y1    = 0;
        this.__sDown = 0;
        this.__sUp   = 0;
      }
    }
  }
  
  return returnedModule;
});