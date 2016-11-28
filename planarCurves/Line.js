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
    * The Line class is the algorithmic representation of a parameterized, 2D line that passes through two points (x0,y0) and (x1,y1).  The line segment between
    * these two points is parameterized by a natural parameter, t, in [0,1].
    * 
    * @author Jim Armstrong (www.algorithmist.net)
    * 
    * @version 1.0
    * 
    */
    this.Line = function()
    { 
      this._x0          = 0;
      this._y0          = 0;
      this._x1          = 0;
      this._y1          = 0;
      this._length      = 0;
      this._invalidated = false;
    }

    this.Line.__name__ = true;
    this.Line.prototype = 
    {
     /**
      * Access the initial x-coordinate
      * 
      * @return Float - The line passes through (x0,y0) and (x1,y1).  This method returns the x0 coordinate
      */
      get_x0: function()
      {
        return this._x0;
      }
    
     /**
      * Access the terminal x-coordinate
      * 
      * @return Float - The line passes through (x0,y0) and (x1,y1).  This method returns the x1 coordinate
      */
      , get_x1: function()
      {
        return this._x1;
      }
      
     /**
      * Access the initial y-coordinate
      * 
      * @return Float - The line passes through (x0,y0) and (x1,y1).  This method returns the y0 coordinate
      */
      , get_y0: function()
      {
        return this._y0;
      }
    
     /**
      * Access the terminal y-coordinate
      * 
      * @return Float - The line passes through (x0,y0) and (x1,y1).  This method returns the y1 coordinate
      */
      , get_y1: function()
      {
        return this._y1;
      }
      
      , set_x0: function(_value)
      {
        if( !isNaN(_value) )
          this._x0 = _value;
      }
      
     /**
      * Assign the terminal x-coordinate
      * 
      * @param _value : Float - The line passes through (x0,y0) and (x1,y1).  This method assigns the x1 coordinate
      * 
      * @return Nothing
      */
      , set_x1: function(_value)
      {
        if( !isNaN(_value) )
          this._x1 = _value;
      }
      
     /**
      * Assign the initial y-coordinate
      * 
      * @param _value : Float - The line passes through (x0,y0) and (x1,y1).  This method assigns the y0 coordinate
      * 
      * @return Nothing
      */
      , set_y0: function(_value)
      {
        if( !isNaN(_value) )
          this._y0 = _value;
      }
      
     /**
      * Assign the terminal y-coordinate
      * 
      * @param _value : Float - The line passes through (x0,y0) and (x1,y1).  This method assigns the y1 coordinate
      * 
      * @return Nothing
      */
      , set_y1: function(_value)
      {
        if( !isNaN(_value) )
          this._y1 = _value;
      }
      
     /**
      * Query the x-coordinate at a parameter value
      * 
      * @param t : Float - Parameter value.  t in [0,1] queries x-coordinates from x0 to x1.  Negative values query x-coordinates less than x0 and parameter values
      * greater than 1 query x-coordinates greater than x1.
      * 
      * @return Float - x-coordinate on the line at the specified parameter value
      */
      , getX: function(t)
      {
	      return (1-t)*this._x0 + t*this._x1;
      }
  
     /**
      * Query the y-coordinate at a parameter value
      * 
      * @param t : Float - Parameter value.  t in [0,1] queries y-coordinates from y0 to y1.  Negative values query y-coordinates less than y0 and parameter values
      * greater than 1 query y-coordinates greater than x1.
      * 
      * @return Float - y-coordinate on the line at the specified parameter value
      */
      , getY: function(t)
      {
	      return (1-t)*this._y0 + t*this._y1;
      }
  
     /**
      * Query x'(t)
      * 
      * @param t : Float - Parameter value.
      * 
      * @return Float - First derivative of x with respect to t, evaluated at the specified parameter value
      */
      , getXPrime: function(t)
      {
	      return this._x1 - this._x0;
      }
  
     /**
      * Query y'(t)
      * 
      * @param t : Float - Parameter value.
      * 
      * @return Float - First derivative of y with respect to t, evaluated at the specified parameter value
      */
      , getYPrime: function(t)
      {
	      return this._y1 - this._y0;
      }
  
     /**
      * Query natural parameter at a specific arc-length from (x0,y0), up to and including (x1,y1)
      * 
      * @param s : Float - Length value - must be greater than zero.
      * 
      * @return Float - t-parameter at the specified length, starting from (x0,y0).  s = 0 is trivial and would return t = 0.  This method returns 1 for
      * any input length length that exceeds the Euclidean distance between (x0,y0) and (x1,y1) 
      */
      , getTAtLength: function(s)
      {
        if( s < 0 )
	        return 0;
	  
	      if( s > 1 )
	        return 1;
	  
	      return s;
      }
  
     /**
      * Query the natural parameter at the specified x-coordinate
      * 
      * @param x : Float - Input x-coordinate
      * 
      * @return Float -  t-parameter at the specified x-coordinate.  This value will be in [0,1] if x is in [x0,x1].  The returned parameter will be negative if
      * x < x0 and greater than 1 if x > x1.
      */
      , getTAtX: function(x)
      {
        var dx = this._x1 - this._x0;
        if( Math.abs(dx) < 0.0000001 )
          return this._y0;
    
        return (x-this._x0)/dx;
      }
  
     /**
      * Query the y-coordinate at the specified x-coordinate.
      * 
      * @param x : Float - Input x-coordinate
      * 
      * @return Float - y-coordinate of the line at the specified x-coordinate.  It is possible that the query may be degenerate, i.e. a vertical line and an
      * input x-coordinate other than the x-intercept.  The method returns y0 in such cases.
      */
      , getYAtX: function(x)
      {
	      // solve for t at the specified x-coordinate, i.e. (1-t)*x0 + t*x1 = x -> t(x1-x0) = x - x0 or = (x-x0)/(x1-x0).  return y0 if the line is degenerate
        var dx = this._x1 - this._x0;
	      if( Math.abs(dx) < 0.0000001 )
	        return [ this._y0 ];
	
	      var t = (x-this._x0)/dx;
	
	      return [ this.getY(t) ];
      }
  
     /**
      * Query the x-coordinate at the specified y-coordinate.
      * 
      * @param x : Float - Input x-coordinate
      * 
      * @return Float - y-coordinate of the line at the specified x-coordinate.  It is possible that the query may be degenerate, i.e. a vertical line and an
      * input x-coordinate other than the x-intercept.  The method returns y0 in such cases.
      */
      , getXAtY: function(y)
      {
	      // solve for t at the specified y-coordinate, i.e. (1-t)*y0 + t*y1 = y -> t(y1-y0) = y - y0 or = (y-y0)/(y1-y0).  return x0 if the line is degenerate
	      var dy = this._y1 - this._y0;
        if( Math.abs(dy) < 0.0000001 )
          return [ this._x0 ];
    
        var t = (y-this._y0)/dy;
	
	      return [ this.getX(t) ];
      }
  
     /**
      * Query the length at the specified parameter value, starting from the initial point
      * 
      * @param s : Float - Input parameter, typically in [0,1], but could be greater. 
      * 
      * @return Float - Length at the the specified parameter value.  An input value of 1 for a line will return the Euclidean distance from (x0,y0) to (x1,y1).
      * An input value of 2 would return twice the distance from (x0,y0) to (x1,y1).  Return value is always greater than or equal to zero.
      */
      , lengthAt: function(s)
      {
	      this.update();
	
	      if( Math.abs(this._length) < 0.0000001 ) 
	        return 0;
	   
	      var x  = this.getX(s);
	      var y  = this.getY(s);
        var dx = x - this._x0;
	      var dy = y - this._y0;
	
	      return Math.sqrt(dx*dx + dy*dy);
      }
  
      // internal method - update internal parameters
      , update: function()
      {
	      var dx = this._x1 - this._x0;
        var dy = this._y1 - this._y0;
	  
        this._length = Math.sqrt(dx*dx + dy*dy);
      }
    }
  };
  
  return returnedModule;
});
