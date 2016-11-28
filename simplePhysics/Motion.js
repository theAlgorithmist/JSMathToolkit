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

define(['./ConstantMotionController'], function (ControllerModule) 
{
  var returnedModule = function () 
  {
    var controllerRef = new ControllerModule(); 
   /**
    * A basic class to deal with simple motions that are defined by physical processes, each of which is defined by an injectable motion controller.  Each
    * controller need only conform to a basic API.  Assign a controller, then start position, followed by start time.  Advance the motion by a number of
    * seconds and query the new position coordinates.  A default ConstantMotionController is automatically assigned with constant unit velocity and no
    * acceleration, along the x-axis.
    *  
    * @author Jim Armstrong (www.algorithmist.net)
    * 
    * @version 1.0
    * 
    */
    this.Motion = function()
    {
      this._controller = new controllerRef.ConstantMotionController();
      this._time       = 0;      // current time
      
      this._controller.set_motionParams( {x0:0, x1:1, y0:0, y1:0, v:1, a:0} );
    }
   
    this.Motion.__name__ = true;
    this.Motion.prototype = 
    {
     /**
      * Access the current x-coordinate of the motion
      * 
      * @return Number - current x-coordinate
      */
      get_x: function()
      {
        return this._controller.get_x();
      }
    
     /**
      * Access the current y-coordinate of the motion
      * 
      * @return Number - current y-coordinate
      */
      , get_y: function()
      {
        return this._controller.get_y();
      }
      
     /**
      * Access the current time
      */
      , get_time: function()
      {
        return this._time;
      }
      
     /**
      * Assign a new motion controller
      * 
      * @param control : MotionController - Reference to a 'class' implementing the MotionController API
      * 
      * @return Nothing
      */
      , set_controller: function(control) 
      {
        if( control )
          this._controller  = control;
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
        var x0 = isNaN(x) ? this._x : x;
        var y0 = isNaN(y) ? this._y : y;
        
        this._controller.set_position(x0, y0);
      }
      
     /**
      * Assign the start time in seconds
      * 
      * @param start : Number - Start time in seconds (must be greater than or equal to zero)
      * 
      * @return Nothing - Assigns the new start time, provided the input is greater than or equal to zero
      */
      , set_startTime: function(start)
      {
        if( !isNaN(start) && start >= 0 )
        {
          this._time = start;
          
          this._controller.set_time(this._time);
        }
      }
      
     /**
      * Advance the motion a number of seconds in time
      * 
      * @param delta : Number - Time delta in seconds (may be negative, although current time may never become negative) - this value MUST be the delta since the most
      * recent increment of time, not elapsed since the beginning of a process.  This allows time to be advanced via an automated timer (although increments must be
      * manually computed) or manually to allow interactive stepping through a process.
      * 
      * @return Nothing - Current time is advanced by the delta value and clipped at zero, if necessary
      */
      , advanceTime: function(delta)
      {
        if( !isNaN(delta) )
        {
          this._time += delta;
          this._time = Math.max(0, this._time);
          
          this._controller.set_time(this._time);
        }
      }
      
     /**
      * Assign the curernt time for this motion
      * 
      * @param time : Number - Current time of the motion, in seconds.  Must be greater than or equal to zero
      * 
      * @return Nothing - Current time is advanced by the delta value and clipped at zero, if necessary
      */
      , set_time: function(time)
      {
        if( !isNaN(time) )
        {
          this._time = Math.max(0, time);
           
          this._controller.set_time(this._time);
        }
      }
    }
  }
  
  return returnedModule;
});
