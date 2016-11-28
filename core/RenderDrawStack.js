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
    * Render or transform the draw stack returned from jsMathToolkit complex shapes into a Canvas using EaselJS
    * 
    * @author by:  Jim Armstrong (www.algorithmist.net)
    * 
    * @version 1.0
    */
    this.RenderDrawStack = function()
    {
    };

    this.RenderDrawStack.__name__ = true;
    this.RenderDrawStack.prototype = 
    {
     /**
      * Render a draw stack
      * 
      * @param g : Graphics - Reference to user-created EaselJS graphic context for rendering.
      * 
      * @param stack : Array - Draw stack - all coordinates must be pixel coordinates relative to the parent EaselJS Shape
      * 
      * @return Nothing - The draw stack is rendered into the supplied context.  All line and fill properties MUST be set in advance.
      * In order to support advanced drawings of multiple complex shapes into the same EaselJS container, the graphic context is NOT
      * cleared before drawing; that is the caller's responsibility.  The EaselJS stage must be updated by the caller after calling
      * this method.
      * 
      * Note: For performance reasons, there is no error checking on the draw stack.  If a stack is created outside of jsMathToolkit,
      * then take care to create it exactly as inside the library.
      */
      render: function(g, stack) 
      {
        if( g == undefined )
          return;
    
        if( stack == undefined )
          return;
        
        var len = stack.length; 
        if( len == 0 )
          return;
    
        var i, c;
        
        for( i=0; i<len; ++i )
        {
          // strip out the constituents of each drawing command
          c = stack[i].split( " ");
          switch( c[0].toUpperCase() )
          {
            case "M":
              g.moveTo( c[1], c[2] );
            break;
            
            case "L":
              g.lineTo( c[1], c[2] );
            break;
            
            case "Q":
              g.curveTo( c[1], c[2], c[3], c[4] );
            break;
          }
        }
      }
     
     /**
      * Rotate the draw stack about the approximate centroid of the represented shape
      * 
      * @param stack : Array - Draw stack
      * 
      * @param angle : Rotation angle in RADIANS
      * 
      * @return Array - Transformed draw stack - the rotation is about the center of the bounding box based of the draw stack constitutents
      */
      , rotate: function(stack, angle)
      {
        if( Math.abs(angle) < 0.001 )
          return stack.slice();
        
        var len = stack.length;
        if( len == 0 )
          return [];
        
        var centroid = this.__centroid(stack);
        var cx = centroid.cx;
        var cy = centroid.cy;
        var s  = Math.sin(angle);
        var c  = Math.cos(angle);
        var i  = 0;
  
        // translate centroid to origin
        var tX, tY;
        var newX, newY;
        var newCX, newCY;
        var component;
        
        var xform = [];
        for( i=0; i<len; ++i )
        {
          // translate each component of the draw stack to centroid, followed by rotate and translate back
          component = stack[i].split( " ");
          switch( component[0].toUpperCase() )
          {
            case "M":
              tX = component[1] - cx;
              tY = component[2] - cy;
              
              newX = c*tX - s*tY + cx;
              newY = s*tX + c*tY + cy;
              
              xform.push( "M " + newX.toFixed(2) + " " + newY.toFixed(2) );
            break;
              
            case "L":
              tX = component[1] - cx;
              tY = component[2] - cy;
              
              newX = c*tX - s*tY + cx;
              newY = s*tX + c*tY + cy;
              
              xform.push( "L " + newX.toFixed(2) + " " + newY.toFixed(2) );
            break;
              
            case "Q":
              tX = component[1] - cx;
              tY = component[2] - cy;
              
              newCX = c*tX - s*tY + cx;
              newCY = s*tX + c*tY + cy;
              
              tX = component[3] - cx;
              tY = component[4] - cy;
              
              newX = c*tX - s*tY + cx;
              newY = s*tX + c*tY + cy;
              
              xform.push( "Q " + newCX.toFixed(2) + " " + newCY.toFixed(2) + " " + newX.toFixed(2) + " " + newY.toFixed(2) );
            break;
          }
        }
    
        return xform;
      }
     
     /**
      * Translate the draw stack
      * 
      * @param stack : Array - Draw stack
      * 
      * @param deltaX : Number - Number of pixels to translate each constituent of the draw stack in the x-direction
      * 
      * @param deltaY : Number - Number of pixels to translate each constituent of the draw stack in the y-direction
      * 
      * @return Array - Transformed draw stack
      */
      , translate: function(stack, deltaX, deltaY)
      {
        if( Math.abs(deltaX) < 0.01 && Math.abs(deltaY) < 0.01 )
          return stack.slice();
        
        var len = stack.length;
        if( len == 0 )
          return [];
        
        var tX, tY;
        var newX, newY;
        var newCX, newCY;
        
        var xform = [];
        for( i=0; i<len; ++i )
        {
          // strip out the constituents of each drawing command - then translate to centroid, followed by rotate and translate back
          c = stack[i].split( " ");
          switch( c[0].toUpperCase() )
          {
            case "M":
              newX = c[1] + deltaX;
              newY = c[2] + deltaY;
              
              xform.push( "M " + newX.toFixed(2) + " " + newY.toFixed(2) );
            break;
              
            case "L":
              newX = c[1] + deltaX;
              newY = c[2] + deltaY;
              
              xform.push( "L " + newX.toFixed(2) + " " + newY.toFixed(2) );
            break;
              
            case "Q":
              newCX = c[1] + deltaX;
              newCY = c[2] + deltaY;
              
              newX = c[3] + deltaX;
              newY = c[4] + deltaY;
              
              xform.push( "Q " + newCX.toFixed(2) + " " + newCY.toFixed(2) + " " + newX.toFixed(2) + " " + newY.toFixed(2) );
            break;
          }
        }
    
        return xform;
      }
      
     /**
      * Reflect the draw stack about the x-axis
      * 
      * @return Array - Transformed draw stack
      */
      , reflectHorizontal(stack)
      {
        var len = stack.length;
        if( len == 0 )
          return [];
        
        var newX, newY;
        var newCX, newCY;
        
        var xform = [];
        for( i=0; i<len; ++i )
        {
          // strip out the constituents of each drawing command - then translate to centroid, followed by rotate and translate back
          c = stack[i].split( " ");
          switch( c[0].toUpperCase() )
          {
            case "M":
              newX = c[1];
              newY = -c[2];
              
              xform.push( "M " + newX.toFixed(2) + " " + newY.toFixed(2) );
            break;
              
            case "L":
              newX = c[1];
              newY = -c[2];
              
              xform.push( "L " + newX.toFixed(2) + " " + newY.toFixed(2) );
            break;
              
            case "Q":
              newCX = c[1];
              newCY = -c[2];
              
              newX = c[3];
              newY = -c[4];
              
              xform.push( "Q " + newCX.toFixed(2) + " " + newCY.toFixed(2) + " " + newX.toFixed(2) + " " + newY.toFixed(2) );
            break;
          }
        }
    
        return xform;
      }
      
     /**
      * Reflect the draw stack about the y-axis
      * 
      * @return Array - Transformed draw stack
      */
      , reflectVertical(stack)
      {
        var len = stack.length;
        if( len == 0 )
          return [];
         
        var tX, tY;
        var newX, newY;
        var newCX, newCY;
         
        var xform = [];
        for( i=0; i<len; ++i )
        {
          // strip out the constituents of each drawing command - then translate to centroid, followed by rotate and translate back
          c = stack[i].split( " ");
          switch( c[0].toUpperCase() )
          {
            case "M":
              newX = -c[1];
              newY = c[2];
               
              xform.push( "M " + newX.toFixed(2) + " " + newY.toFixed(2) );
            break;
               
            case "L":
              newX = -c[1];
              newY = c[2];
               
              xform.push( "L " + newX.toFixed(2) + " " + newY.toFixed(2) );
            break;
               
            case "Q":
              newCX = -c[1];
              newCY = c[2];
               
              newX = -c[3];
              newY = c[4];
               
              xform.push( "Q " + newCX.toFixed(2) + " " + newCY.toFixed(2) + " " + newX.toFixed(2) + " " + newY.toFixed(2) );
            break;
          }
        }
     
         return xform;
       }
      
      // internal method - compute centroid based on bounding-box
      , __centroid: function(stack)
      {
        // compute the centroid as the geometric center of the bounding box.  This may actually be incorrect for future complex shapes that contain
        // cubic beziers as a component.  In that case, it would be necessary to compute the actual convex hull of the control points.  This consideration
        // may be applied to a future release of the math toolkit.
        
        var len = stack.length; 
        if( len == 0 )
          return;
    
        var i, c;
        var top    = -Number.MAX_VALUE;
        var left   = Number.MAX_VALUE;
        var right  = -Number.MAX_VALUE;
        var bottom = Number.MAX_VALUE;
        
        for( i=0; i<len; ++i )
        {
          // strip out the constituents of each drawing command
          c = stack[i].split( " ");
          switch( c[0].toUpperCase() )
          {
            case "M":
              left   = Math.min(left  , c[1]);
              right  = Math.max(right , c[1]);
              bottom = Math.min(bottom, c[2]);
              top    = Math.max(top   , c[2]);
            break;
            
            case "L":
              left   = Math.min(left  , c[1]);
              right  = Math.max(right , c[1]);
              bottom = Math.min(bottom, c[2]);
              top    = Math.max(top   , c[2]);
            break;
            
            case "Q":
              left   = Math.min(left  , c[1]);
              right  = Math.max(right , c[1]);
              bottom = Math.min(bottom, c[2]);
              top    = Math.max(top   , c[2]);
              
              left   = Math.min(left  , c[3]);
              right  = Math.max(right , c[3]);
              bottom = Math.min(bottom, c[4]);
              top    = Math.max(top   , c[4]);
            break;
          }
        }
        
        return { cx:0.5*(left+right), cy:0.5*(bottom+top) };
      }
    }
  }
  
  return returnedModule;
});