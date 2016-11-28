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
    * Data holder for a simple, 2D spring node
    *  
    * @author Jim Armstrong (www.algorithmist.net)
    * 
    * @version 1.0
    * 
    * @return Nothing - Spring node is created at the origin with zero initial velocity and acceleration
    */
    this.SpringNode = function()
    {
      this._x  = 0;
      this._y  = 0;
      this._vx = 0;
      this._vy = 0;
      this._ax = 0;
      this._ay = 0;
      this._m  = 1;
    }
   
    this.SpringNode.__name__ = true;
    this.SpringNode.prototype = 
    {
     /**
      * Access the current position
      * 
      * @return Object - 'x' and 'y' properties contain current (x,y) position of this spring node
      */
      get_position: function()
      {
        return { x:this._x, y:this._y};
      }
    
     /**
      * Access the current mass of this spring node
      * 
      * @return Number - current mass
      */
      , get_mass: function()
      {
        return this._m;
      }
      
     /**
      * Access the velocity of this spring node
      * 
      * @return Object - 'vx' and 'vy' properties contain the most recently recorded x- and y-components of velocity
      */
      , get_velocity: function()
      {
        return { vx:this._vx, vy:this._vy };
      }
      
     /**
      * Access the acceleration of this spring node
      * 
      * @return Object - 'ax' and 'ay' properties contain the most recently recorded x- and y-components of acceleration
      */
      , get_acceleration: function()
      {
        return { vx:this._ax, vy:this._ay };
      }
      
     /**
      * Assign a mass to this spring node
      * 
      * @param m : Number - Mass of the node - must be greater than zero
      * 
      * @return Nothing
      */
      , set_mass: function(m)
      {
        if( !isNaN(m) && m > 0 )
          this._m = m;
      }
      
     /**
      * Assign a position to this spring node
      * 
      * @param x : Number - Current x-coordinate
      * 
      * @param y : Number - Current y-coordinate
      * 
      * @return Nothing
      */
      , set_position( x, y )
      {
        this._x = isNaN(x) ? this._x : x;
        this._y = isNaN(y) ? this._y : y;
      }
      
     /**
      * Update the acceleration
      * 
      * @param ax : Number - x-component of acceleration
      * 
      * @param ay : Number - y-component of acceleration
      * 
      * @return Nothing
      */
      , update_acceleration(ax, ay)
      {
        this._ax = ax;
        this._ay = ay;
      }
      
     /**
      * Update the spring node's position based on current velocity and acceleration
      * 
      * @return Nothing
      */
      , update: function(dt)
      {
        this._vx += this._ax*dt;
        this._vy += this._ay*dt;
        this._x  += this._vx;
        this._y  += this._vy;
      }
      
    /**
     * Reset this node to a default configuration (position at origin, unit mass, zero velocity, and zero acceleration)
     * 
     * @return Nothing
     */
     , reset: function()
     {
       this._x  = 0;
       this._y  = 0;
       this._vx = 0;
       this._vy = 0;
       this._ax = 0;
       this._ay = 0;
       this._m  = 1;
     }
    }
  }
  
  return returnedModule;
});
