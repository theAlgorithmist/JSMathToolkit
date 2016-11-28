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
   * A motion controller with fixed initial velocity and acceleration due to gravity that bounces off a fixed line y = c.  It is necessary to provide a conversion factor 
   * to convert meters into screen units (these may be pixels or graphing units) as well as the datum or bounce line in graph units.  The object loses kinetic energy
   * on each collision with the datum line.
   * 
   * Note: The initial position must be set above the datum line for the controller to work properly
   *  
   * @author Jim Armstrong (www.algorithmist.net)
   * 
   * @version 1.0
   * 
   */
    this.BounceController = function()
    {
      this._time   = 0;        // current time
      this._prev   = 0;        // previous time setting
      this._x0     = 0;        // initial x-position
      this._y0     = 0;        // initial y-position
      this._x      = 0;        // current position
      this._y      = 0;        // current position
      this._vx     = 0;        // x-component of initial velocity
      this._vy     = 0;        // y-component of initial velocity
      this._g      = -9.8067;  // y-component of acceleration (gravity)
      this._factor = 1;        // conversion factor between screen or graph units and meters.
      this._r      = 0.5;      // rebound coefficient (always in (0,1) )
    }
   
    this.BounceController.__name__ = true;
    this.BounceController.prototype = 
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
      * @param y : Number - Start y-coordinate - The initial position MUST be above the datum line
      * 
      * @return Nothing - Assigns new coordinates, provided they are valid numbers
      */
      , set_position: function(x, y)
      {
        this._x0 = isNaN(x) ? this._x0 : x;
        this._y0 = isNaN(y) ? this._y0 : y;
      }
      
    /**
     * Assign the direction vector, initial velocity, and acceleration along that vector.  Note that this vector only defines the direction of velocity and
     * acceleration.  Its components need not have any relation to initial position of an object under influence of the controller.
     * 
     * @param params : Object - Motion parameters, documented below
     * 
     * x0 : Number - x-coordinate of initial vector position
     * 
     * y0 : Number - y-coordinate of initial vector position
     * 
     * x1 : Number - x-coordinate of terminal vector position
     * 
     * y1 : Number - y-coordinate of terminal vector position
     * 
     * v : Number - Velocity component in units / second along the vector
     * 
     * f : Number - Conversion factor that converts graphing units to meters, i.e. f units/m .  Subsequent queries for position are automatically
     * converted to appropriate screen units for graphing.  Set f to 1 to get position directly in meters and convert to feet manually (i.e. 1 m = 3.28084 ft., so multiply
     * result by 3.28084).
     * 
     * r : Number - Rebound coefficient in (0,1) - describes how much energy is maintained when the object bounces of the datum line.  A value of exactly one would cause
     * the object to bounce up and down forever.  A value of exactly zero would cause it to come to a complete stop on the first bounce.
     * 
     * c : Number - Datum line, y = c
     * 
     * @return Nothing - If all inputs are valid, new velocity and acceleration components along the x- and y- axes are computed.  Otherwise, no action is taken
     */
      , set_motionParams: function(params)
      {
        var x0 = params.x0;
        var y0 = params.y0;
        var x1 = params.x1;
        var y1 = params.y1;
        var v  = params.v;
        var f  = params.f;
        var r  = params.r;
        var c  = params.c;
        
        if( isNaN(x0) )
          return;
        
        if( isNaN(y0) )
          return;
        
        if( isNaN(x1) )
          return;
        
        if( isNaN(y1) )
          return;
        
        if( isNaN(v) )
          return;
        
        if( isNaN(f) )
          return;
        
        if( isNaN(r) )
          return;
        
        if( isNaN(c) )
          return;
        
        var dx = x1-x0;
        var dy = y1-y0;
        var d  = Math.sqrt(dx*dx + dy*dy);
        var ux = dx/d;
        var uy = dy/d;
        
        this._vx = ux*v;
        this._vy = uy*v;
        
        this._factor = Math.max( 0.01, f );
        this._r      = Math.max( 0.1, r );
        this._r      = Math.min( 0.9, this._r );
        
        this._c = c;
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
        // break the motion up into a sequence of time-intervals and compute the motion over each interval.  Time begins at 0 for each interval.
        if( !isNaN(time) && time >= 0 )
        {
          this._time = time - this._prev;
          this._x    = this._x0 + this._time*this._vx;
          this._y    = this._y0 + this._time*(this._vy + 0.5*(this._factor*this._g)*this._time);
          
          if( this._y <= this._c )
          {
            var r      = Math.sqrt(this._r);
            this._y    = this._c;
            this._prev = time;
            this._vy  *= r;
            this._vx  *= r;
            this._x0   = this._x;
            this._y0   = this._y;
          }
        }
      }
    }
  }
  
  return returnedModule;
});
