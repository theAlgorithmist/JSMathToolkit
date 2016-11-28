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

define(['../planarCurves/TwoPoint', '../shapes/Triangle', '../shapes/ShapeConstants'], function (TwoPointModule, TriangleModule, ShapeConstantsModule) 
{
  var returnedModule = function () 
  {
    var pointRef = new TwoPointModule();
    __twoPoint   = new pointRef.TwoPoint();
    
    var triangleRef = new TriangleModule();
    var __triangle  = new triangleRef.Triangle();
    
    var shapeRef = new ShapeConstantsModule();
    var ShapeConstants = new shapeRef.ShapeConstants();
    
   /**
    * A modified Reuleaux triangle that uses quadratic beziers for its curved sides instead of the intersection between circular segments.  The fundamental shape
    * is determined by an equilateral triangle fit to a bounding box with an orientation parameter.  Note that a y-down (Canvas) coordinate system is required.
    * 
    * Note:  The bounds define the underlying equilateral triangle; the expansion parameter may cause the actual shape to exceed these bounds.
    * 
    * @param left : Number - x-coordinate of top-left point of bounding box
    * @param top : Number - y-coordinate of top-left point of bounding-box
    * @param right : Number - x-coordinate of bottom-right point of bounding box
    * @param bottom : Number - y-coordinate of bottom-right point of bounding box
    * 
    * @author Jim Armstrong (www.algorithmist.net)
    * 
    * @version 1.0
    */
    this.ModifiedReuleauxTriangle = function(left, top, right, bottom)
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

    this.ModifiedReuleauxTriangle.__name__ = true;
    this.ModifiedReuleauxTriangle.prototype = 
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
      * Create a new modified Reuleaux triangle
      * 
      * @param expand : Number - Factor in (0,1] - shape is close to completely triangular when expand is near zero, but never becomes a straight-edged triangle.
      * 
      * @return Array - Draw stack for this shape which is oriented upward
      */
      , create: function(expand)
      {
        if( isNaN(expand) )
          expand = 0.5;
         
        var s = Math.max(0, expand);
        s     = Math.min(1,s);
        
        var mult = (1-s)*0.05 + s*0.15;
        
        // create the triangle
        var params = {type:ShapeConstants.EQUILATERAL, orient:ShapeConstants.UP};
        __triangle.create( this._left, this._top, this._right, this._bottom, params, true );
        
        var xcoord = __triangle.get_xcoordinates();
        var ycoord = __triangle.get_ycoordinates();
        var stack  = [];
        
        // process the series of two-point curves
        __twoPoint.set_first(xcoord[0], ycoord[0]);
        var obj = __twoPoint.create(xcoord[1], ycoord[1], "up", mult);
        
        stack.push( "M " + xcoord[0].toFixed(2) + " " + ycoord[0].toFixed(2) );
        stack.push( "Q " + obj.cx.toFixed(2) + " " + obj.cy.toFixed(2) + " " + obj.x1.toFixed(2) + " " + obj.y1.toFixed(2) );
        
        __twoPoint.set_first(xcoord[1], ycoord[1]);
        obj = __twoPoint.create(xcoord[2], ycoord[2], "up", mult);
        
        stack.push( "Q " + obj.cx.toFixed(2) + " " + obj.cy.toFixed(2) + " " + obj.x1.toFixed(2) + " " + obj.y1.toFixed(2) );
        
        __twoPoint.set_first(xcoord[2], ycoord[2]);
        obj = __twoPoint.create(xcoord[0], ycoord[0], "up", mult);
        
        stack.push( "Q " + obj.cx.toFixed(2) + " " + obj.cy.toFixed(2) + " " + obj.x1.toFixed(2) + " " + obj.y1.toFixed(2) );
         
        return stack;
      }
    }
  }
  
  return returnedModule;
});