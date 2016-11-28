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
   * A modification of the Gravity controller that allows wind and drag forces. 
   * 
   * Wind acts independently on the object and is not subject to drag.  This makes the model easy to work with and suitably fast for games and some educational
   * applications.
   *  
   * It is necessary to provide a conversion factor to convert meters into screen units (these may be pixels or graphing units).
   *  
   * @author Jim Armstrong (www.algorithmist.net)
   * 
   * @version 1.0
   * 
   */
    this.WindController = function()
    {
      this._time   = 0;        // current time
      this._prev   = 0;        // previous time setting
      this._x0     = 0;        // initial x-position
      this._y0     = 0;        // initial y-position
      this._x      = 0;        // current position
      this._y      = 0;        // current position
      this._vx     = 0;        // x-component of initial velocity
      this._vy     = 0;        // y-component of initial velocity
      this._wx     = 0;        // x-component of wind velocity acting on object
      this._wy     = 0;        // y-component of wind velocity acting on object
      this._k      = 1;        // drag coefficient
      this._g      = -9.8067;  // y-component of acceleration (gravity)
      this._factor = 1;        // conversion factor between screen or graph units and meters.
    }
   
    this.WindController.__name__ = true;
    this.WindController.prototype = 
    {
     /**
      * Access the current x-coordinate of the motion
      * 
      * @return Number - current x-coordinate based on conversion factor between graph units and meters
      */
      get_x: function()
      {
        return this._x;
      }
    
     /**
      * Access the current y-coordinate of the motion
      * 
      * @return Number - current y-coordinate based on conversion factor between graph units and meters
      */
      , get_y: function()
      {
        return this._y;
      }
      
     /**
      * Access the current time
      */
      , get_time: function()
      {
        return this._time;
      }
    
     /**
      * Assign the start position
      * 
      * @param x : Number - Start x-coordinate
      * 
      * @param y : Number - Start y-coordinate
      * 
      * @return Nothing - Assigns new coordinates, provided they are valid numbers
      */
      , set_position: function(x, y)
      {
        this._x0 = isNaN(x) ? this._x0 : x;
        this._y0 = isNaN(y) ? this._y0 : y;
      }
      
    /**
     * Assign motion parameters
     * 
     * @param params : Object - Motion parameters, documented below
     * 
     * x0 : Number - x-coordinate of initial velocity vector position
     * 
     * y0 : Number - y-coordinate of initial velocity vector position
     * 
     * x1 : Number - x-coordinate of terminal velocity vector position
     * 
     * y1 : Number - y-coordinate of terminal velocity vector position
     * 
     * x0w : Number - x-coordinate of initial wind vector position
     * 
     * y0w : Number - y-coordinate of initial wind vector position
     * 
     * x1w : Number - x-coordinate of terminal wind vector position
     * 
     * y1w : Number - y-coordinate of terminal wind vector position
     * 
     * v : Number - Speed in units / second along the initial velocity vector
     * 
     * w : Number - Wind speed in units/second along the wind vector
     * 
     * f : Number - Conversion factor that converts graphing units to meters, i.e. f units/m .  Subsequent queries for position are automatically
     * converted to appropriate screen units for graphing.  Set f to 1 to get position directly in meters and convert to feet manually (i.e. 1 m = 3.28084 ft., so multiply
     * result by 3.28084).
     * 
     * k : Number - Drag coefficient - should be greater than zero and relatively small compared to 1.0
     * 
     * @return Nothing - If all inputs are valid, new velocity and acceleration components along the x- and y- axes are computed.  Otherwise, no action is taken
     */
      , set_motionParams: function(params)
      {
        var x0  = params.x0;
        var y0  = params.y0;
        var x1  = params.x1;
        var y1  = params.y1;
        var x0w = params.x0w;
        var y0w = params.y0w;
        var x1w = params.x1w;
        var y1w = params.y1w;
        var v   = params.v;
        var f   = params.f;
        var k   = params.k;
        var w   = params.w;
        
        if( isNaN(x0) )
          return;
        
        if( isNaN(y0) )
          return;
        
        if( isNaN(x1) )
          return;
        
        if( isNaN(y1) )
          return;
        
        if( isNaN(x0w) )
          return;
        
        if( isNaN(y0w) )
          return;
        
        if( isNaN(x1w) )
          return;
        
        if( isNaN(y1w) )
          return;
        
        if( isNaN(v) )
          return;
        
        if( isNaN(f) )
          return;
        
        if( isNaN(k) )
          return;
        
        if( isNaN(w) )
          return;
        
        var dx = x1-x0;
        var dy = y1-y0;
        var d  = Math.sqrt(dx*dx + dy*dy);
        var ux = dx/d;
        var uy = dy/d;
        
        this._vx = ux*v;
        this._vy = uy*v;
        
        dx = x1w-x0w;
        dy = y1w-y0w;
        d  = Math.sqrt(dx*dx + dy*dy);
        ux = dx/d;
        uy = dy/d;
        
        this._wx = ux*w;
        this._wy = uy*w;
        
        this._factor = Math.max( 0.01, f);
        this._k      = Math.max( 0.1, k );
      }
      
     /**
      * Assign the current time in seconds
      * 
      * @param time : Number - Current time in seconds (must be greater than or equal to zero)
      * 
      * @return Nothing - Assigns the new time and updates position, provided the input is greater than or equal to zero
      */
      , set_time: function(time)
      {
        if( !isNaN(time) && time >= 0 )
        {
          this._time = time;
          var g      = this._factor*this._g;
          var a      = Math.exp(-this._k*this._time);
          var vx     = this._vx*a;
          var vy     = this._vy*a;
          this._x    = this._x0 + this._time*(vx + this._wx);
          this._y    = this._y0 + this._time*((vy + this._wy) + 0.5*g*this._time);
        }
      }
    }
  }
  
  return returnedModule;
});
