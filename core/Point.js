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
    * 
    * A simple Point class that can be used in a variety of applications requiring 2D (x,y) coordinates
    * (no computations are modified to handle potential overflow or underflow).  Lazy validation is used
    * to only recomputed the l-2 norm of the Point (if interpreted as a vector) when one of the coordindates
    * changes.
    * 
    * @param first : Number - first or, most often, x-coordinate of the Point
    * 
    * @param second : Number - second or, most often, y-coordinate of the Point
    * 
    * @return Nothing The x- and y-coordinates of the Point are assigned to the respective input values
    * 
    * @author Jim Armstrong (www.algorithmist.net)
    * 
    * @version 1.0
    */
 
    this.Point = function( __first, __second)
    {
      this._x           = __first;
      this._y           = __second;
	    this._invalidated = true;
	    this._norm        = this.length();
    }

    this.Point.__name__ = true;
    this.Point.prototype = 
    {
     /**
      * Return a copy of the current Point
      * 
      * @eturn Point - New Point instance with identical x- and y-coordinates as the current Point
      */
      clone: function()
      {
        var that = this;
        var temp = function temporary() { return that.apply(this, arguments); };
        for( key in this ) 
        {
          temp[key] = this[key];
        }
        
        return temp;
      }
  
     /**
      * Access the current x-coordinate
      * 
      * @return Number - Current x-coordinate value
      */
      , get_x: function()
      {
        return this._x;
      }
  
     /**
      * Set the current x-coordinate
      * 
      * @param x : Number - x-coordinate value
      * 
      * @return Number - Assigned x-coordinate (returns zero if unable to coerce to number)
      */
      , set_x: function(__value)
      {
        this._x = this.__assign(__value);
        this._invalidated = true;
	      return this._x;
      }
      
      , __assign: function(__value)
      {
        switch (typeof __value)
        {
          case "number":
            return __value;
          break;
          
          case "string":
            var t = parseFloat(__value);
            return !isNaN(t) ? t : 0;
          break;
          
          case "boolean":
            return __value ? 0 : 1;
          break;
        }
        
        return __value;
      }
  
     /**
      * Access the current y-coordinate
      * 
      * @return Number - Current y-coordinate value
      */
      , get_y: function()
      {
        return this._y;
      }
  
     /**
      * Assign the current y-coordinate
      * 
      * @param y : Number - y-coordinate value
      * 
      * @return Number - Actual, assigned y-coordinate
      */
      , set_y: function(__value)
      {
        this._y = this.__assign(__value);
        this._invalidated = true;
        return this._y;
      }

     /**
      * Return the Euclidean length or l-2 norm of the Point
      * 
      * @return Number - Euclidean length with the coordinate values interpreted as endpoints of a vector in 2D space) and the origin
      * as the origin-point of the vector.
      */
      , length: function()
      {
        if( this._invalidated )
 	      {
	        this._norm        = Math.sqrt(this._x*this._x + this._y*this._y);
	        this._invalidated = false;
	      }
	
	      return this._norm;
      }

     /**
      * Return the l-1 norm of the Point (interpreted as a vector in 2D space)
      * 
      * @return Number - l-1 norm of the Point
      */
      , l1Norm: function()
      {
        return Math.abs(this._x) + Math.abs(this._y);
      }

     /**
      * Return the l-infinity norm of the Point (interpreted as a vector in 2D space)
      * 
      * @return Number - l-infinity norm of the Point
      */
      , lInfNorm: function()
      {
        var absX = Math.abs(this._x);
        var absY = Math.abs(this._y);
	
        return Math.max( absX, absY );
      }

     /**
      * Return the Euclidean distance between the current Point and an input Point
      * 
      * @param point : Point - Input Point
      * 
      * @return Number - Euclidean distance between the current and input Point
      */
      , distance: function(__point)
      {
        var dx = __point.x - this._x;
        var dy = __point.y - this._y;

        return Math.sqrt(dx*dx + dy*dy); 
      }

     /**
      * Compute dot or inner product of the current Point and another Point (both Points interpreted as vectors with the origin as initial points)
      * 
      * @param point : Point - Input Point
      * 
      * @return Number - Inner product of the current and input Points (vectors)
      */
      , dot: function(__point)
      {
        return this._x*__point.x + this._y*__point.y;
      }

     /**
      * Cross or outer product of the current Point and another Point (both Points interpreted as vectors with the origin as initial points)
      * 
      * @param point : Point - Input Point
      * 
      * @return Number - Outer product of the current and input Points (vectors); mathematically, the output is a vector that is normal to the
      * two input vectors whose direction is computed via the right-hand rule.  This method returns the magnitude of that vector.
      */
      ,cross: function(__point)
      {
        return this._x*__point.y - this._y*__point.x;
      }

     /**
      * Return a String representation of the current Point
      * 
      * @return String - "(x, y)" where 'x' and 'y' are replaced by String representations of the x- and y-coordinates
      */
      , toString: function()
      {
        var s1 = _x.toString();
        var s2 = _y.toString();

        return "(" + s1 + " , " + s2 + ")";
      }
    }
  }
  return returnedModule;
});