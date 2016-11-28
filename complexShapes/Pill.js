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

define(['./Endcap'], function (EndcapModule) 
{
  var returnedModule = function () 
  {
    var endcapRef = new EndcapModule();
    
   /**
    * A pill is a rectangle with two straight edges and two semi-circular 'endcaps'.  This version is oriented horizontally or verically and the endcaps
    * are rendered on the ends according to the orientation. 
    *
    * @param centerX : Number - x-coordinate of pill center
    * @param centerY : Number - y-coordinate of pill center
    * @param width : Number - Width horizontal line segment or actual width of vertical pill
    * @param height : Number - Height of vertical line segment or actual height of horizontal pill
    * 
    * @author Jim Armstrong (www.algorithmist.net)
    * 
    * @version 1.0
    */
    this.Pill = function(centerX, centerY, width, height)
    { 
      if( isNaN(centerX) )
        centerX = 0;
      
      if( isNaN(centerY) )
        centerY = 0;
      
      if( isNaN(width) || width <= 0 )
        width = 100;
      
      if( isNaN(height) || height <= 0 )
        height = 50;
      
      this._width  = width;
      this._height = height;
      this._xc     = centerX; 
      this._yc     = centerY;
      this._dir    = "h"; 
    }

    this.Pill.__name__ = true;
    this.Pill.prototype = 
    {
     /**
      * Return the width
      * 
      * @return Number - Pill width
      */
      get_width: function()
      {
        return this._dir == "h" ? this._width + 2*this._height : this._width;
      }
    
    /**
     * Return the height
     * 
     * @return Number - Pill height
     */
      , get_height: function()
      {
        return this._dir == "v" ? this._height + 2*this._width : this._height;
      }
      
     /**
      * Assign the pill width
      * 
      * @param value : Number - Width of the horizontal line segment in a horizontal pill and actual pill width of a vertical pill
      * 
      * @return Nothing
      */
      , set_width: function(value)
      {
        if( !isNaN(value) && value > 0 )
          this._width = value;
      }
     
     /**
      * Assign the pill height
      * 
      * @param value : Number - Height of the vertical line segment in a vertical pill and actual pill height of a horizontal pill
      * 
      * @return Nothing
      */
      , set_height: function(value)
      {
        if( !isNaN(value) && value > 0 )
          this._height = value;
      }
      
     /**
      * Return the x-coordinate of the pill center
      * 
      * @return Number - x-coordinate of ellipse center
      */
      , get_centerX: function()
      {
        return this._xc; 
      }
      
     /**
      * Return the y-coordinate of the pill center
      * 
      * @return Number
      */
      , get_centerY: function()
      {
        return this._yc;
      }
       
     /**
      * Assign the x-coordinate of the Pill center
      * 
      * @param value : Number - x-coordinate of Pill center
      * 
      * @return Nothing 
      */
      , set_centerX: function(value)
      {
        if( !isNaN(value)  )
          this.__xC = value;
      }
       
     /**
      * Assign the y-coordinate of the Pill center
      * 
      * @param value : Number - y-coordinate of Pill center
      * 
      * @return Nothing
      */
      , set_centerY: function(value)
      {
        if( !isNaN(value)  )
          this.__yC = value;
      }
      
     /**
      * Create a new Pill shape based on the supplied direction
      * 
      * @param dir : String - 'horizontal' or 'vertical' (only first letter matters).  
      * 
      * @return Array - Draw stack for the Pill - Note that a y-down (Canvas) coordinate system is required.  The rounded endcaps of the pill shape are 
      * in the same direction as the orientation (i.e. 'right' & 'left' for 'horizontal').
      */
      , create: function(dir)
      {
        var direction = dir.charAt(0).toLowerCase();
        if( direction != "h" && direction != "v" )
          direction = "h";
        
        // endcap angles
        var from1, to1;
        var from2, to2;
        var radius;
        var stack = [];
        var toX, toY;
        var endcap;
        
        var midX = 0.5*this._width;
        var midY = 0.5*this._height;
        
        switch( direction )
        {
          case "v":
            // up
            from1 = Math.PI;
            to1   = from1 + Math.PI;

            // down
            from2 = 0;
            to2   = Math.PI;
            
            radius = 0.5*this._width;
            toX    = this._xc-midX;
            toY    = this._yc+midY;
            stack.push( "M " + toX.toFixed(2) + " " + toY.toFixed(2) );
            
            toY = this._yc-midY;
            stack.push( "L " + toX.toFixed(2) + " " + toY.toFixed(2) );
            
            endcap       = new endcapRef.Endcap(radius, this._xc, this._yc-midY);
            var endStack = endcap.create("up", false);
            
            stack = stack.concat(endStack);
            
            toX = this._xc+midX;
            toY = this._yc+midY;
            
            stack.push( "L " + toX.toFixed(2) + " " + toY.toFixed(2) );
            
            endcap.set_centerX(this._xc);
            endcap.set_centerY(toY);
            
            endStack = endcap.create("down", false);
            stack    = stack.concat(endStack);
          break;
          
          case "h":
            // left
            from1 = Math.PI/2;
            to1   = from1 + Math.PI

            // right
            from2 = -Math.PI/2;
            to2   = Math.PI/2;
            
            radius = 0.5*this._height;
            toX    = this._xc-midX;
            toY    = this._yc-midY;
            stack.push( "M " + toX.toFixed(2) + " " + toY.toFixed(2) );
            
            toX = this._xc+midX;
            stack.push( "L " + toX.toFixed(2) + " " + toY.toFixed(2) );
            
            endcap       = new endcapRef.Endcap(radius, this._xc+midX, this._yc);
            var endStack = endcap.create("right", false);
            
            stack = stack.concat(endStack);
            
            toX = this._xc-midX;
            toY = this._yc+midY;
            
            stack.push( "L " + toX.toFixed(2) + " " + toY.toFixed(2) );
            
            endcap.set_centerX(toX);
            endcap.set_centerY(this._yc);
            
            endStack = endcap.create("left", false);
            stack    = stack.concat(endStack);
          break;
        }
        
        return stack;
      }
    }
  }
  
  return returnedModule;
});