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

define(['../planarCurves/QuadBezier'], function (QuadBezierModule) 
{
  var returnedModule = function () 
  {
    var bezierRef = new QuadBezierModule();
    var __bezier  = new bezierRef.QuadBezier();
    
   /**
    * Create a arrow with a curved base, based on a bounding box.  Note that a y-down (Canvas) coordinate system is required
    * 
    * @param left : Number - x-coordinate of top-left point of bounding box
    * 
    * @param top : Number - y-coordinate of top-left point of bounding-box
    * 
    * @param right : Number - x-coordinate of bottom-right point of bounding box
    * 
    * @param bottom : Number - y-coordinate of bottom-right point of bounding box
    * 
    * @author Jim Armstrong (www.algorithmist.net)
    * 
    * @version 1.0
    * 
    */
    this.CurvedArrow = function(left, top, right, bottom)
    {
      if( isNaN(top) )
        top = 0;
      
      if( isNaN(left) )
        left = 0;
      
      if( isNaN(right) )
        right = 0;
      
      if( isNaN(bottom) )
        bottom = 0;
      
      // y-down coordinate system
      this._left   = Math.min(left, right);
      this._right  = Math.max(left, right);
      this._bottom = Math.max(bottom, top);
      this._top    = Math.min(bottom, top);
    }

    this.CurvedArrow.__name__ = true;
    this.CurvedArrow.prototype = 
    {
     /**
      * Return the left property
      * 
      * @return Number - x-coordinate of top-left point of bounding box
      */
      get_left: function()
      {
        return this._left;
      }
         
     /**
      * Return the top property
      * 
      * @return Number - y-coordinate of top-left point of bounding box
      */
      , get_top: function()
      {
        return this._top; 
      }
         
     /**
      * Return the right property
      * 
      * @return Number - x-coordinate of bottom-right point of bounding box
      */
      , get_right: function()
      {
        return this._right;
      }
         
     /**
      * Return the bottom property
      * 
      * @return Number - y-coordinate of bottom-right point of bounding box
      */
      , get_bottom: function()
      {
        return this._bottom;
      }
        
     /**
      * Assign the left property
      * 
      * @param value - new x-coordinate of top-left point of bounding box
      * 
      * @return Nothing
      */
      , set_left: function(value)
      {
        if( !isNaN(value) )
          this._left = value;
      }
          
     /**
      * Assign the top property
      * 
      * @param value : Number - new y-coordinate of top-left point of bounding box
      * 
      * @return Nothing
      */
      , set_top: function(value)
      {
        if( !isNaN(value)  )
          this._top = value;
      }
          
     /**
      * Assign the right property
      * 
      * @param value : Number - new x-coordinate of bottom-right point of bounding box
      * 
      * @return Nothing
      */
      , set_right: function(value)
      {
        if( !isNaN(value)  )
          this._right = value;
      }
         
     /**
      * Assign the bottom property
      * 
      * @param value : Number - new y-coordinate of bottom-right point of bounding box
      * 
      * @return Nothing
      */
      , set_bottom: function(value)
      {
        if( !isNaN(value)  )
          this._bottom = value;
      }
         
     /**
      * Create a new curved arrow 
      * 
      * factor : Number - Number in [0,1] that controls the amount of curvature of the arrow bottom.
      * 
      * @return Array - Draw stack for the curved arrow -  - default orientation is up.  Transform the draw stack to create a different arrow.
      * There is little error-checking so that animated arrows can be drawn very fast
      */
      , create: function(_factor)
      {
        var t = 1.25;
        var f = _factor;
        if( isNaN(f) )
          f = 0;
        
        f = Math.max(0,f);
        f = Math.min(1,f);
        
        // three-point interpolation
        var d = f*0.5*(this._bottom-this._top);
        
        var p1 = {x:this._left, y:this._bottom};
        var p2 = {x:0.5*(this._right + this._left), y:this._bottom-d};
        var p3 = {x:this._right, y:this._bottom};
        
        __bezier.interpolate( [p1, p2, p3] );
        var obj = __bezier.toObject();
        
        var stack = [];
        
        stack.push( "M " + this._left + " " + this._bottom );
        stack.push( "Q " + obj.cx.toFixed(2) + " " + obj.cy.toFixed(2) + " " + this._right + " " + this._bottom );
        stack.push( "L " + 0.5*(this._left+this._right) + " " + this._top );
        stack.push( "L " + this._left + " " + this._bottom );
        
        return stack;
      }
    }
  }
  
  return returnedModule;
});