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
    * A very basic view (built on top of EaselJS) of a 2D grid with fixed, square, cells of varying color depending on whether the tiles are open, barriers, occupied 
    * (i.e. part of a path), or start/end tiles.  Barriers are drawn black, high-cost tiles in an off-red, and occupied tiles are drawn in green. Start and end nodes 
    * are colored in a light yellow.  NOTE:  Call drawDefaultGrid FIRST to set internal default properties that carry over to future cell settings.
    * 
    * This is a simple, visual implement intended to help debug tile-based pathfinding heuristics and other game-related methods.
    * 
    * @author by:  Jim Armstrong (www.algorithmist.net)
    * 
    * @version 1.0
    */
    this.GridView = function(cellWidth)
    {
      this.OPEN      = 0;
      this.BARRIER   = 1;
      this.OCCUPIED  = 2;
      this.HIGH_COST = 3;
      this.START     = 4;
      this.END       = 5;
      
      this._width           = Math.max(2, cellWidth);
      this._borderWidth     = 1;
      this._borderColor     = "#000000";
      this._backGroundColor = "#cccccc";
      
      this._graphics = null;
    };

    this.GridView.__name__ = true;
    this.GridView.prototype = 
    {
      drawDefaultGrid: function(g, rows, cols, borderWidth, borderColor, backGroundColor)
      {
        var i, j;
        
        this._borderWidth     = borderWidth;
        this._borderColor     = borderColor;
        this._backgroundColor = backGroundColor;
        
        this._graphics = g;
        
        g.beginFill(backGroundColor);
        g.drawRect( 0, 0, cols*this._width, rows*this._width );
        g.endFill();
        
        g.setStrokeStyle(borderWidth);
        g.beginStroke( createjs.Graphics.getRGB(borderColor, 1) );
        
        var len = cols*this._width;
        for( i=0; i<rows; ++i )
        {
          j = i*this._width;
          g.moveTo(0, j);
          g.lineTo(len, j);
        }
        
        len = rows*this._width;
        for( j=0; j<cols; ++j )
        {
          i = j*this._width;
          g.moveTo(i, 0);
          g.lineTo(i, len);
        }
      }
      
      , set_cell: function(i, j, type)
      {
        if( this._graphics == null )
          return;
        
        var theColor = this._backgroundColor;  // open cell
        
        switch( type )
        {
          case this.BARRIER:
            theColor = "#000000";
          break;
          
          case this.OCCUPIED:
            theColor = "#00ff00";
          break;
          
          case this.HIGH_COST:
            theColor = "#DB2929";
          break;
          
          case this.START:
            theColor = "#FCD116";
          break;
          
          case this.END:
            theColor = "#FCD116";
          break;
        }
        
        this._graphics.setStrokeStyle(this._borderWidth);
        this._graphics.beginStroke( createjs.Graphics.getRGB(this._borderColor, 1) );
        
        this._graphics.beginFill(theColor);
        this._graphics.drawRect( j*this._width, i*this._width, this._width, this._width );
        this._graphics.endFill();
        
        this._graphics.endStroke();
      }
    }
  }
  
  return returnedModule;
});