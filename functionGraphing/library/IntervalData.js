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
    * Store interval-related data for linear and complex step functions.  A function reference may be supplied in which case the function is evaluated over the 
    * interval, [a,b].  Otherwise, the interval is treated as linear with slope, m, and a value of y at x=a.
    * 
    * @author Jim Armstrong (www.algorithmist.net)
    * 
    * @version 1.0
    */
    this.IntervalData = function()
    {
      // interval endpoints
      this._a = 0;
      this._b = 0;
      
      // these apply to a linear step function
      
      this._m = 1;       // slope of line segment
      this._y = 0;       // y-value of left endpoint
      
      // these may be considered public properties and are used for complex step functions
      
      this.fcn         = null;      // function reference for interval
      this.leftDot     = false;     // true if left dot is rendered
      this.rightDot    = false;     // true if right dot is rendered
      this.leftClosed  = false;     // true if left dot is solid (interval closed at that end), false if outline only
      this.rightClosed = false;     // true if right dot is solid (interval closed at that end), false if outline only
      this.fillValue   = '#ff0000'; // fill color applied to solid dots
      this.dotRadius   = 3;         // circle radius for interval endpoint dots
    }

    this.IntervalData.__name__ = true;
    this.IntervalData.prototype = 
    {
     /**
      * Access the left endpoint value
      * 
      * @return Number - Left endpoint, a in [a,b]
      */
      get_a: function()
      {
        return this._a;
      }
    
     /**
      * Access the right endpoint value
      * 
      * @return Number - Right endpoint, b in [a,b]
      */
      , get_b: function()
      {
        return this._b;
      }
      
     /**
      * Access slope of a linear interval
      * 
      * @return Number - Slope of line segment in this interval, provided that a function reference does not override default, linear definition
      */
      , get_m: function()
      {
        return this._m;
      }
      
     /**
      * Access the y-coordinate at the left endpoint (for a linear interval)
      * 
      * @return Number - f(a). f(b) can be easily computed with this value and the slope
      */
      , get_y: function()
      {
        return this._y;
      }
      
     /**
      * Assign the interval endpoints.
      *
      * @param left : String "-inf" for minus infinity or the numerical value of the left endpoint.
      * 
      * @param right : String "inf" for plus infinity or the numerical value of the right endpoint.
      * 
      * @return Nothing.  Interval endpoints are changed if left and right values are valid and left < right.
      */
      , set_interval: function(left, right)
      {
        var a = this._a;
        var b = this._b;
        
        var n;
        if( left != "" )
        {
          var l = left.toString().toLowerCase();
          n     = l == "-inf" ? -Number.MAX_VALUE : parseFloat(left)
          a     = isNaN(n) ? this._a : n;
        }
        
        if( right != "" )
        {
          var r = right.toString().toLowerCase();
          n     = r == "inf" ? Number.MAX_VALUE : parseFloat(right)
          b     = isNaN(n) ? this._b : n;
        }
        
        if( a < b )
        {
          this._a = a;
          this._b = b;
        }
      }

     /**
      * Assign slope of the line segment in the current interval.
      *
      * @param m : Number - Numerical value of slope.
      * 
      * @return Nothing.
      */
      , set_m: function(m)
      {
        this._m = isNaN(m) ? this._m : m;
      }
    
     /**
      * Assign linear function value at left endpoint.
      *
      * @param y : Number - Numerical value of function value at left endpoint, i.e. y = f(a)
      * 
      * @return Nothing.  Assigns f(a) = y.
      */
      , set_y: function(y)
      {
        this._y = isNaN(y) ? this._y : y;
      }
    }
  }
  
  return returnedModule;
});