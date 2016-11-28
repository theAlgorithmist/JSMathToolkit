/*
 * copyright (c) 2012, Jim Armstrong.  All Rights Reserved.
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
 *
 * Rectangle selector script for EaselJS. 
 * 
 * Usage: addRectangleSelector(stage, selectorRed, selectorGreen, selectorBlue) where stage is an EaselJS stage reference, and (selectorRed, selectorGreen, selectorBlue)
 * are the desired RGB components of the selector rectangle (defaults are provided).  There should be no other stage handlers assigned at the time this call is made.
 * Press, then drag to create a selection rectangle, which is defined on mouse-up by upper left-hand corner (selectorLeft, selectorTop) and bottom, right-hand 
 * corner (selectorRight, selectorTop).  Supply a callback function, callback(left, top, right, bottom) to receive the rectangle bounds on mouse release.
 */
define([], function () 
{
  var returnedModule = function () 
  {
    this.addRectangleSelector = function(stage, callback, selectorRed, selectorGreen, selectorBlue)
    {
      if( stage == null )
        return;
    
      if( selectorRed == null )
        selectorRed = 255;
    
      if( selectorGreen == null )
        selectorGreen = 215;
    
      if( selectorBlue == null )
        selectorBlue = 0;
    
      var selectorTop    = 0;
      var selectorLeft   = 0;
      var selectorRight  = 0;
      var selectorBottom = 0;
      var origX;
      var origY;
      var canvasLength;
      var canvasHeight;
      var selectorShape;
      var selectorR;
      var selectorG;
      var selectorB;
    
      selectorR = selectorRed;
      selectorG = selectorGreen;
      selectorB = selectorBlue;
    
      canvasLength = stage.canvas.width;
      canvasHeight = stage.canvas.height;
  
      // add a shape to draw a selector graphic into
      selectorShape = new createjs.Shape();
    
      stage.addChild(selectorShape);
    
      var onSelectorMouseDown = function(evt)
      {
        selectorLeft   = stage.mouseX;
        selectorRight  = selectorLeft;
        origX          = selectorLeft;
        selectorTop    = stage.mouseY;
        selectorBottom = selectorTop;
        origY          = selectorBottom;
      
        stage.addEventListener( "stagemousemove", onSelectorMouseMove );
        stage.addEventListener( "stagemouseup"  , onSelectorMouseUp   );
      };
      onSelectorMouseDown.bind(this);
    
      var onSelectorMouseMove = function(evt)
      {
        var newX = stage.mouseX;
        var newY = stage.mouseY;
     
        // draw selector and set bounds
        selectorLeft   = Math.min(origX, newX);
        selectorRight  = Math.max(origX, newX);
        selectorTop    = Math.min(origY, newY);
        selectorBottom = Math.max(origY, newY);
      
        if( selectorShape )
        {
          var g = selectorShape.graphics;
          g.clear();
          g.setStrokeStyle(2);
          g.beginStroke( createjs.Graphics.getRGB(selectorR,selectorG,selectorB,1) );
          g.drawRect( selectorLeft, selectorTop, (selectorRight-selectorLeft), (selectorBottom-selectorTop) );
        
          stage.update();
        }
      }
      onSelectorMouseMove.bind(this);
    
      var onSelectorMouseUp = function(evt)
      {
        stage.removeEventListener( "stagemousedown", onSelectorMouseDown );
        stage.removeEventListener( "stagemouseup"  , onSelectorMouseUp   );
        stage.removeEventListener( "stagemousemove", onSelectorMouseMove );
      
        selectorShape.graphics.clear();
        stage.update();
      
        stage.removeChild(selectorShape);
      
        // the bounding rectangle is now (selectorLeft, selectorTop) to (selectorRight, selectorBottom)
        if( callback )
          callback(selectorLeft, selectorTop, selectorRight, selectorBottom);
      };
      onSelectorMouseUp.bind(this);
    
      stage.addEventListener("stagemousedown", onSelectorMouseDown);
    
      stage.mouseMoveOutside = true; 
    
      return this;
    };
  };
  
  return returnedModule;
});