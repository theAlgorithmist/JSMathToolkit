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
   * This is the simplest motion controller and is based on constant velocity and acceleration along a fixed vector.  The (vector) equation of motion is p = p0 + vt + a*t*t/2.
   *  
   * @author Jim Armstrong (www.algorithmist.net)
   * 
   * @version 1.0
   * 
   */
    this.ConstantMotionController = function()
    {
      this._time = 0;      // current time
      this._prev = 0;      // previous time setting
      this._x0   = 0;      // initial x-position
      this._y0   = 0;      // initial y-position
      this._x    = 0;      // current position
      this._y    = 0;      // current position
      this._vx   = 0;      // x-component of initial velocity
      this._vy   = 0;      // y-component of initial velocity
      this._ax   = 0;      // x-component of acceleration
      this._ay   = 0;      // y-component of acceleration
    }
   
    this.ConstantMotionController.__name__ = true;
    this.ConstantMotionController.prototype = 
    {
     /**
      * Access the current x-coordinate of the motion
      * 
      * @return Number - current x-coordinate
      */
      get_x: function()
      {
        return this._x;
      }
    
     /**
      * Access the current y-coordinate of the motion
      * 
      * @return Number - current y-coordinate
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
     * a : Number - Acceleration component in units / second^2 along the vector
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
        var a  = params.a;
        
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
        
        if( isNaN(a) )
          return;
        
        var dx = x1-x0;
        var dy = y1-y0;
        var d  = Math.sqrt(dx*dx + dy*dy);
        var ux = dx/d;
        var uy = dy/d;
        
        this._vx = ux*v;
        this._vy = uy*v;
        this._ax = ux*a;
        this._ay = uy*a;
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
          this._x    = this._x0 + this._time*(this._vx + 0.5*this._ax*this._time);
          this._y    = this._y0 + this._time*(this._vy + 0.5*this._ay*this._time);
        }
      }
    }
  }
  
  return returnedModule;
});
