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

define(['../planarCurves/CubicBezier', '../utils/BezierUtils'], function (CubicBezierModule, BezierUtilsModule) 
{
  var returnedModule = function () 
  {
    var bezierRef = new CubicBezierModule();
    __bezier      = new bezierRef.CubicBezier();
    
    var utilsRef      = new BezierUtilsModule();
    var __bezierUtils = new utilsRef.BezierUtils();
    
   /**
    * Basic teardrop shape defined with a bounding box and a 'squeeze' factor to adjust the narrowness of the shape at the top.  Note that a y-down (Canvas)
    * coordinate system is required
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
    this.Teardrop = function(left, top, right, bottom)
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

    this.Teardrop.__name__ = true;
    this.Teardrop.prototype = 
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
      * Create a new teardrop shape
      * 
      * @param squeeze : Number - Squeeze factor in [0,1] - shape is 'fatter' when squeeze = 0 and thinnest when squeeze = 1
      * 
      * @return Array - Draw stack for the teardrop shape
      */
      , create: function(squeeze)
      {
        if( isNaN(squeeze) )
          squeeze = 0;
         
        var s = Math.max(0, squeeze);
        s     = Math.min(1,s);
        
        var stack = [];
         
        // A simple way to generate a tear-drop shape is to approximate it with four cubic beziers, two of which are reflected about a
        // vertical axis.  You could also sample the teardrop equation, fit a cubic bezier spline, then convert the spline to quads.
        // After the cubics are defined, they are converted to quads and the quad sequence is returned in the draw stack
        var w     = this._right-this._left;
        var h     = this._bottom-this._top;
        var w2    = 0.5*w;
        var h2    = 0.5*h;
        var z     = Math.min(w2,h2)
        var mx    = this._left + w2;
        var my    = this._top  + h2;
        var alpha = (1-s)*3*Math.PI/4 + s*(5*Math.PI/8);
        
        var ux = Math.cos(alpha);
        var uy = Math.sin(alpha);
        
        var a = (1-s)*0.75 + s*1.05;
        a    *= z;
        
        // complete sequence of points, terminating back at (x0,y0)
        var x0 = mx;
        var y0 = this._top;
        
        var x1 = x0 + a*ux;
        var y1 = y0 + a*uy;
        
        a      = (1-s)*0.08 + s*0.12;
        var x2 = this._left;
        var y2 = y1 + a*h;
        
        var d  = this._bottom - a*h - y2;
        var x3 = x2;
        var y3 = y2 + 0.5*d;
        
        var x4 = x3;
        var y4 = this._bottom - 0.1*h;
        
        var x5 = mx - 0.25*w;
        var y5 = this._bottom;
        
        var x6 = mx;
        var y6 = this._bottom;
        
        var x7 = mx + 0.25*w;
        var y7 = y6;
        
        var x8 = this._right;
        var y8 = y4;
        
        var x9 = this._right;
        var y9 = y3;
        
        var x10 = x9;
        var y10 = y2;
        
        var x11 = 2*mx - x1;
        var y11 = y1;
        
        // process the sequence of cubics
        
        // left-1
        __bezier.set_x0(x0);
        __bezier.set_y0(y0);
        __bezier.set_cx(x1);
        __bezier.set_cy(y1);
        __bezier.set_cx1(x2);
        __bezier.set_cy1(y2);
        __bezier.set_x1(x3);
        __bezier.set_y1(y3);
        
        var quads = __bezierUtils.toQuadBezier(__bezier, 0.05);
        
        stack.push( "M " + x0.toFixed(2) + " " + y0.toFixed(2) );
        
        var i, q;
        var len = quads.length;
        for( i=0; i<len; ++i )
        {
          q = quads[i];
          stack.push( "Q " + q.cx.toFixed(2) + " " + q.cy.toFixed(2) + " " + q.x1.toFixed(2) + " " + q.y1.toFixed(2) );
        }
        
        // left-2
        __bezier.set_x0(x3);
        __bezier.set_y0(y3);
        __bezier.set_cx(x4);
        __bezier.set_cy(y4);
        __bezier.set_cx1(x5);
        __bezier.set_cy1(y5);
        __bezier.set_x1(x6);
        __bezier.set_y1(y6);
        
        quads = __bezierUtils.toQuadBezier(__bezier, 0.05);
        len   = quads.length;
        
        for( i=0; i<len; ++i )
        {
          q = quads[i];
          stack.push( "Q " + q.cx.toFixed(2) + " " + q.cy.toFixed(2) + " " + q.x1.toFixed(2) + " " + q.y1.toFixed(2) );
        }
        
        // right-2
        __bezier.set_x0(x6);
        __bezier.set_y0(y6);
        __bezier.set_cx(x7);
        __bezier.set_cy(y7);
        __bezier.set_cx1(x8);
        __bezier.set_cy1(y8);
        __bezier.set_x1(x9);
        __bezier.set_y1(y9);
        
        
        quads = __bezierUtils.toQuadBezier(__bezier, 0.05);
        len   = quads.length;
        
        for( i=0; i<len; ++i )
        {
          q = quads[i];
          stack.push( "Q " + q.cx.toFixed(2) + " " + q.cy.toFixed(2) + " " + q.x1.toFixed(2) + " " + q.y1.toFixed(2) );
        }
        
        // right-1
        __bezier.set_x0(x9);
        __bezier.set_y0(y9);
        __bezier.set_cx(x10);
        __bezier.set_cy(y10);
        __bezier.set_cx1(x11);
        __bezier.set_cy1(y11);
        __bezier.set_x1(x0);
        __bezier.set_y1(y0);
        
        quads = __bezierUtils.toQuadBezier(__bezier, 0.05);
        len   = quads.length;
        
        for( i=0; i<len; ++i )
        {
          q = quads[i];
          stack.push( "Q " + q.cx.toFixed(2) + " " + q.cy.toFixed(2) + " " + q.x1.toFixed(2) + " " + q.y1.toFixed(2) );
        }
        
        return stack;
      }
    }
  }
  
  return returnedModule;
});