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
    * Solid-line decorator intended for use in EaselJS or other (Canvas) drawing environment supporting clear(), moveTo(), lineTo() functions (curveTo() for quad. Beziers).
    * This line decorator has a dependency on the quad. Bezier for drawing dashed quad. bezier arcs.  Note that although this is a pass-through method to the graphic
    * context, this decorator allows for run-time switching between solid and non-solid line decorators with a common decorator interface.
    * 
    * @author Jim Armstrong
    * 
    * @version 1.0
    */
    this.SolidLineDecorator = function()
    {
      // empty
    };

    this.SolidLineDecorator.__name__ = true;
    this.SolidLineDecorator.prototype = 
    {
     /**
      * Assign (name-value) parameters to control the line drawing.
      * 
      * @param _data : Object - This decorator uses no parameters; this method is provided to ensure interace consistency between all decorators
      * 
      * @return Nothing
      */
      setParams: function(_value)
      {
        // empty  
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
      * @return Nothing - A line is drawn from current pen location to the specified location according to the attributes of this decorator
      */
      ,lineTo: function(_g, _x, _y)
      { 
        _g.lineTo(_x,_y); 
      }
  
     /** 
      * Draw a quadratic bezier with preset line properties from the current pen location to the input point
      * 
      * @param _g : Dynamic - Graphic context (typically from EaselJS or other Canvas-based drawing environment that supports lineTo() )
      * 
      * @param _cx : Int - x-coordinate of middle quadratic bezier control point
      * 
      * @param _cy : Int - y-coordinate of middle quadratic bezier control point
      * 
      * @param _x : Int - x-coordinate of final quadratic bezier control point
      * 
      * @param _y : Int - y-coordinate of final quadratic bezier control point
      * 
      * @return Nothing - A quadratic bezier is drawn from current pen location to the specified location according to the attributes of this decorator
      */
      , curveTo: function(_g, _cx, _cy, _x1, _y1)
      { 
        _g.curveTo(_cx, _cy, _x1, _y1); 
      }
  
     /**
      * Clear the graphic context
      * 
      * @param _g : Dynamic - Graphic context from EaselJS or any other Canvas-based drawing environement that supports a clear() method
      * 
      * @return Nothing - The graphic context is cleared and internal decorator properties are reset so that this method may be followed by a call to moveTo()
      */
      , clear: function(_g)
      { 
        _g.clear(); 
      }
    }
  }
  
  return returnedModule;
});