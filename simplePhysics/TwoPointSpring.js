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
    * A simple stiffness/damping model between two spring nodes.  General usage is to define the nodes, create the spring system, and then set parameters.
    * Modify one of the nodes and then call the update() method to update the spring system.  This class uses a pure displacement model; there are no
    * torque considerations, although that might be considered in a future release.
    * 
    * @param node1 : SpringNode - Reference to first SpringNode in the system
    * 
    * @param node2 : SpringNode - Reference to second SpringNode in the system
    *  
    * @author Jim Armstrong (www.algorithmist.net)
    * 
    * @version 1.0
    * 
    */
    this.TwoPointSpring = function(node1, node2)
    {
      // nodes may be independently modified outside the system, so keep references, not clones.
      this._node1 = node1;
      this._node2 = node2;
      
      this._k = 1;      // stiffness
      this._b = 0.05;   // damping coefficient
      
      // rest distance as an initial measure of desired distance between the spring nodes
      var p1 = node1.get_position();
      var p2 = node2.get_position();
      var dx = p2.x - p1.x;
      var dy = p2.y - p1.y;
      
      this._d = Math.sqrt(dx*dx + dy*dy);
    }
   
    this.TwoPointSpring.__name__ = true;
    this.TwoPointSpring.prototype = 
    {
     /**
      * Access the spring system stiffness
      * 
      * @return Number - Spring stiffness
      */
      get_stiffness: function()
      {
        return this._k;
      }
    
     /**
      * Access the damping coefficient
      * 
      * @return Number - Damping coefficient
      */
      , get_damping: function()
      {
        return this._b;
      }
      
     /**
      * Access the desired distance between the spring nodes, which is rest distance on initialization
      * 
      * @return Number - Desired distance between spring nodes
      */
      , get_dist: function()
      {
        return this._d;
      }
      
     /**
      * Assign the spring system stiffness
      * 
      * @param value : Number - Spring stiffness - should be greater than zero
      * 
      * @return Nothing
      */
      , set_stiffness: function(value)
      {
        if( !isNaN(value) && value > 0 )
          this._k = value;
      }
       
     /**
      * Assign the damping coefficient
      * 
      * @param value : Number - New damping coefficient (should be relatively small compared to 1 and greater than zero)
      * 
      * @return Nothing
      */
      , set_damping: function(value)
      {
        this._b = isNaN(value) ? this._b : value;
        this._b = Math.abs(this._b);
        this._b = Math.max( 0.001, this._b );
      }
      
     /**
      * Assign the desired distance between the spring nodes
      * 
      * @param value : Number - Desired distance between spring nodes - should be greater than zero
      * 
      * @return Nothing
      */
      , get_dist: function(value)
      {
        if( !isNaN(value) && value > 0 )
          this._d = value;
      }
      
     /**
      * Update the spring system after modifying a node
      * 
      * @return Nothing
      */
      , update: function()
      {
        if (this.isString && xAbs < this.d)
          return;

        var p1  = this._node1.get_position();
        var p2  = this._node2.get_position();
        var dx1 = p1.x - p2.x;
        var dy1 = p1.y - p2.y;
        var dx2 = -dx1;
        var dy2 = -dy1;
        
        var x     = Math.sqrt(dx1*dx1 + dy1*dy1);  // |x|
        var normX = x;
        if( Math.abs(x) < 0.00001 )
        {
          this._node1.update_acceleration(0, 0);
          this._node2.update_acceleration(0, 0);  
          
          return;
        }
        
        var n   = 1/x;
        var nx1 = n*dx1;
        var ny1 = n*dy1;
        var nx2 = n*dx2;
        var ny2 = n*dy2;
        
        var v1  = this._node1.get_velocity();
        var v2  = this._node2.get_velocity();
        var v1x = v1.vx - v2.vx;
        var v1y = v1.vy - v2.vy;
        var v2x = -v1x;
        var v2y = -v1y;

        // compute the spring forces from the basic equation  F = -k(|x|-d)(x/|x|) - bv where x is the dist. between spring nodes
        var nd  = -this._k*(normX - this._d);
        
        var fx1 = nd*nx1 - this._b*v1x;
        var fy1 = nd*ny1 - this._b*v1y;

        var fx2 = nd*nx2 - this._b*v2x;
        var fy2 = nd*ny2 - this._b*v2y;
        
        // Compute acceleration and update each node's acceleration. Updating velocity & position after the spring is updated could be done internally, 
        // but would be incorrect for a network of springs since each spring needs to be updated first.
        var m  = this._node1.get_mass();
        var ax = fx1 / m;
        var ay = fy1 / m;

        this._node1.update_acceleration(ax, ay);
        
        m  = this._node2.get_mass();
        ax = fx2 / m;
        ay = fy2 / m;
        
        this._node2.update_acceleration(ax, ay);
      }
    }
  }
  
  return returnedModule;
});
