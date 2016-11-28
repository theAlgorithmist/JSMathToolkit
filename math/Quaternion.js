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
    * Methods for defining and operating with Quaternions.  This is one of the few 'coordinate' classes that considers three-dimensional coordinates so that the class
    * may be used in games where simple (drawn) objects are manipulated with 3D transforms.
    * 
    * Note that the presumed Quaternion form is q[0] + q[1]i + q[2]j + q[3]k or (real, img).
    * 
    * A unit Quaternion is defined on initialization.
    * 
    * @author Jim Armstrong
    * 
    * @version 1.0
    */
    this.Quaternion = function()
    {
      this.PI_2 = 0.5*Math.PI
      this._q   = [1, 0, 0, 0];
    }
    
    this.Quaternion.__name__ = true;
    this.Quaternion.prototype = 
    {
     /**
      * Access the Quaternion values
      * 
      * @return Array - A four-element array containing a copy of the Quaternion values
      */
      get_values: function()
      {
        return this._q.slice();
      }
    
     /**
      * Create a new Quaternion from an array of numbers
      * 
      * @param values : Array - x, y, z, w values - length must be at least 3 in which case the real value is set to 1
      * 
      * @return Nothing 
      */
      , fromArray: function(values)
      {
        if( !values || values.length < 3 )
          return;
        
        if( values.length == 3 )
        {
          this._q[1] = values[0];
          this._q[2] = values[1];
          this._q[3] = values[2];
        
          this._q[0] = 1.0;
        }
        else
        {
          this._q[0] = values[0];
          this._q[1] = values[1];
          this._q[2] = values[2];
          this._q[3] = values[3];
        }
      }
      
     /**
      * Create a Quaternion that has the specified x-axis rotation
      * 
      * @param angle : Number - x-axis rotation value in radians
      * 
      * @return Nothing - The current Quaternion has the specified x-axis rotation
      */
      , fromXRotation: function(angle) 
      {
        var a      = 0.5*angle;
        this._q[0] = Math.sin(a);
        this._q[1] = 0;
        this._q[2] = 0;
        this._q[3] = Math.cos(a);
      }
      
     /**
      * Create a Quaternion that has the specified y-axis rotation
      * 
      * @param angle : Number - y-axis rotation value in radians
      * 
      * @return Nothing - The current Quaternion has the specified y-axis rotation
      */
      , fromYRotation: function(angle) 
      {
        var a      = 0.5*angle;
        this._q[0] = 0;
        this._q[1] = Math.sin(a);
        this._q[2] = 0;
        this._q[3] = Math.cos(a);
      }
      
     /**
      * Create a Quaternion that has the specified z-axis rotation
      * 
      * @param angle : Number - z-axis rotation value in radians
      * 
      * @return Nothing - The current Quaternion has the specified z-axis rotation
      */
      , fromZRotation: function(angle) 
      {
        var a      = 0.5*angle;
        this._q[0] = 0;
        this._q[1] = 0;
        this._q[2] = Math.sin(a);
        this._q[3] = Math.cos(a);
      }
      
     /**
      * Create a Quaternion that has the specified rotation about the specified axis
      * 
      * @param axis : Vector - 3D vector from origin to point in 3-space that defines a rotation axis
      * 
      * @param angle : Number - Rotation angle in degrees
      * 
      * @return Nothing - The current Quaternion has the specified rotation about the specified axis; there is no error-checking for performance - the method 
      * returns 'something' even if inputs are partially invalid.
      */
      , fromAxisRotation: function(axis, angle) 
      {
        var l = Math.sqrt( axis[0]*axis[0] + axis[1]*axis[1] + axis[2]*axis[2] );
        var d = Math.abs(l) < 0.0000000001 ? 100000 : 1/l;

        var a = 0.5*angle;
        var c = Math.cos(a);
        var s = Math.sin(a)*d;
        
        this._q[0] = c;
        this._q[1] = s*axis[0];
        this._q[2] = s*axis[1]; 
        this._q[3] = s*axis[2];
      }
      
     /**
      * Compute the current Quaternion that is equivalent to the supplied 3x3 rotation matrix
      * 
      * @param m : Array - Array of arrays that contains a 3x3 rotation matrix
      * 
      * @return Nothing
      */
      , fromRotationMatrix: function(m)
      {
        var u, v, w;

        // u, v, and w are chosen so that u is the index of max. diagonal of m.  u v w are an even permutation of 0, 1, 2.
        if( m[0][0] > m[1][1] && m[0][0] > m[2][2] ) 
        {
          u = 0;
          v = 1;
          w = 2;
        } 
        else if( m[1][1] > m[0][0] && m[1][1] > m[2][2] ) 
        {
          u = 1;
          v = 2;
          w = 0;
        } 
        else 
        {
          u = 2;
          v = 0;
          w = 1;
        }

        var r = Math.sqrt(1 + m[u][u] - m[v][v] - m[w][w]);
        this._q[u] = 0.5*r;
        
        r = 0.5/r;
        this._q[v] = r*(m[v][u] + m[u][v]);
        this._q[w] = r*(m[u][w] + m[w][u]);
        this._q[3] = r*(m[v][w] - m[w][v]);
      }

     /**
      * Computes a 3-by-3 rotation matrix from the current Quaternion
      * 
      * @return Array - An array of arrays that represents a 3x3 Euler rotation matrix from the current Quaternion values
      */
      , toRotationMatrix: function() 
      {
        var qW = this._q[0];
        var qX = this._q[1];
        var qY = this._q[2];
        var qZ = this._q[3];

        var qWqW = qW*qW;
        var qWqX = qW*qX;
        var qWqY = qW*qY;
        var qWqZ = qW*qZ;
        var qXqW = qX*qW;
        var qXqX = qX*qX;
        var qXqY = qX*qY;
        var qXqZ = qX*qZ;
        var qYqW = qY*qW;
        var qYqX = qY*qX;
        var qYqY = qY*qY;
        var qYqZ = qY*qZ;
        var qZqW = qZ*qW;
        var qZqX = qZ*qX;
        var qZqY = qZ*qY;
        var qZqZ = qZ*qZ;

        var d = qWqW + qXqX + qYqY + qZqZ;
        var r = [];
        if( Math.abs(d) > 0.0000000001 )
        {
          d      = 1/d;
          var d2 = d+d;
          
          r.push( [ d*(qWqW + qXqX - qYqY - qZqZ), d2*(qWqZ + qXqY), d2*(qXqZ - qWqY)] );
          r.push( [ d2*(qXqY - qWqZ), d*(qWqW - qXqX + qYqY - qZqZ), d2*(qWqX + qYqZ)] );
          r.push( [ d2*(qWqY + qXqZ), d2*(qYqZ - qWqX), d*(qWqW - qXqX - qYqY + qZqZ)] );
        }
        
        return r;
      }

     /**
      * Clone the current Quaternion
      * 
      * @return Quaternion - Clone of the current Quaternion
      */
      , clone: function()
      {
        var that = this;
        var temp = function temporary() { return that.apply(this, arguments); };
        for( key in this ) 
        {
          if( this[key].constructor === Array )
            temp[key] = this[key].slice();
          else
            temp[key] = this[key];
        }
          
        return temp;
      }
      
     /**
      * Compute the length of the current Quaternion, 
      * 
      * @return Number - Length of the current Quaternion.
      */
      , length: function()
      {
        return Math.sqrt( this._q[0]*this._q[0] + this._q[1]*this._q[1] + this._q[2]*this._q[2] + this._q[3]*this._q[3] );
      }
      
     /**
      * Normalize the current Quaternion
      * 
      * @return Nothing - The current Quaternion points in the same direction and is of unit length
      */
      , normalize: function() 
      {
        var l = this.length();
        var d = Math.abs(l) < 0.0000000001 ? 1 : 1.0 / l;
        
        this._q[0] *= d; 
        this._q[1] *= d; 
        this._q[2] *= d; 
        this._q[3] *= d; 
      }
      
     /**
      * Add a Quaternion to the current Quaternion and overwrite the current Quaternion
      * 
      * @param q : Quaternion
      * 
      * @return Nothing - The current Quaternion, s, is overwritten by s + q.
      */
      , add: function(q)
      {
        var t = q.get_values();
        
        this._q[0] += t[0];
        this._q[1] += t[1];
        this._q[2] += t[2];
        this._q[3] += t[3];
      }
      
     /**
      * Add a Quaternion to the current Quaternion and return the result in a new Quaternion
      * 
      * @param q : Quaternion
      * 
      * @return Quaternion.  The current Quaternion, s, is added to q and the result returned in a new Quaternion.
      */
      , addTo: function(q)
      {
        var t = q.get_values();
        var s = this.clone();
         
        s.add(q);
         
        return s;
      }
       
     /**
      * Add a scalar to the current Quaternion and overwrite the current Quaternion
      * 
      * @param a : Number - Scalar value
      * 
      * @return Nothing:  The current Quaternion, q, is overwritten by q + a
      */
      , addScalar: function(a)
      {
        this._q[0] += a;
      }
       
     /**
      * Add a scalar to the current Quaternion and return the result in a new Quaternion
      * 
      * @param a : Number - Scalar value
      * 
      * @return Quaternion -  q + a, where q is the current Quaternion
      */
      , addScalarTo: function(a)
      {
        var s = this.clone();
        s.addScalar(a);
         
        return s;
      }

     /**
      * Subtract a Quaternion from the current Quaternion and overwrite the current Quaternion
      * 
      * @param q : Quaternion
      * 
      * @return Nothing - The current Quaternion, s, is ovewritten by s - q
      */
      , subtract: function(q)
      {
        var t = q.get_values();
         
        this._q[0] -= t[0];
        this._q[1] -= t[1];
        this._q[2] -= t[2];
        this._q[3] -= t[3];
      }
       
     /**
      * Subtract a Quaternion from the current Quaternion and return the result in a new Quaternion
      * 
      * @param q : Quaternion
      * 
      * @return Quaternion - s - q, where s is the current Quaternion
      */
      , subractFrom: function(q)
      {
        var s = this.clone();
        s.subtract(q);
          
        return s;
      }

     /**
      * Subtract a scalar from the current Quaternion and overwrite the current Quaternion with the result
      * 
      * @param a : Number
      * 
      * @return Nothing - The current Quaternion, q, is overwritten by q - a
      */
      , subtractScalar: function(a)
      {
        this._q[0] -= a;
      }
       
     /**
      * Subtract a scalar from the current Quaternion and return the result in a new Quaternion
      * 
      * @param a : Number
      * 
      * @return Quaternion - q - a, where q is the current Quaternion
      */
      , subractScalarFrom: function(a)
      {
        var s = this.clone();
        s.subtractScalar(a);
         
        return s;
      }
       
     /**
      * Multiply the current Quaternion by another Quaternion and overwrite the current Quaternion with the result
      * 
      * @param q : Quaternion
      * 
      * @return Nothing - The current Quaternion, s, is ovewritten by s*q
      */
      , multiply: function(q)
      {
        var b = q.get_values();
         
        // this will make it look closer to a textbook formula
        var aW = this._q[0];
        var aX = this._q[1];
        var aY = this._q[2];
        var aZ = this._q[3];
        var bW = b[0];
        var bX = b[1];
        var bY = b[2];
        var bZ = b[3];
        
        console.log ( this._q.slice() );
        console.log( b );
     
        this._q[0] = aW*bW - aX*bX - aY*bY - aZ*bZ;
        this._q[1] = aW*bX + aX*bW + aY*bZ - aZ*bY;
        this._q[2] = aW*bY - aX*bZ + aY*bW + aZ*bX;
        this._q[3] = aW*bZ + aX*bY - aY*bX + aZ*bW;
      }
       
     /**
      * Multiply the current Quaternion by another Quaternion and return the result in a new Quaternion
      * 
      * @param q : Quaternion
      * 
      * @return Quaternion - s*q, where s is the current Quaternion
      */
      , multiplyInto: function(q)
      {
        var s = this.clone();
        s.multiply(q);
          
        return s;
      }
       
     /**
      * Multiply the current Quaternion by a scalar and overwrite the current Quaternion with the result
      * 
      * @param a : Number
      * 
      * @return Nothing - The current Quaternion, q, is ovewritten by q*a
      */
      , multiplyByScalar: function(a) 
      {
        this.q[0] *= a;
        this.q[1] *= a;
        this.q[2] *= a;
        this.q[3] *= a;
      }
        
     /**
      * Multiply the current Quaternion by a scalar and return the result in a new Quaternion
      * 
      * @param a : Number
      * 
      * @return Quaternion - q*a, where q is the current Quaternion
      */
      , multiplyByScalarInto: function(a)
      {
        var s = this.clone();
        s.multiplyByScalar(a);
          
        return s;
      }

     /**
      * Divide the current Quaternion by another Quaternion and ovewrite the current Quaternion with the result
      * 
      * @param q : Quaternion
      * 
      * @return Nothing - The current Quaternion, s, is overwritten by s / q
      */
      , divide: function(q)
      {
        var b = q.get_values();
          
        var aX = this._q[0];
        var aY = this._q[1];
        var aZ = this._q[2];
        var aW = this._q[3];
        var bX = b[0];
        var bY = b[1];
        var bZ = b[2];
        var bW = b[3];

        var d = 1 / (bX*bX + bY*bY + bZ*bZ + bW*bW);
          
        this._q[0] = (aX*bW - aW*bX - aY*bZ + aZ*bY) * d;
        this._q[1] = (aX*bZ - aW*bY + aY*bW - aZ*bX) * d,
        this._q[2] = (aY*bX + aZ*bW - aW*bZ - aX*bY) * d,
        this._q[3] = (aW*bW + aX*bX + aY*bY + aZ*bZ) * d;
      }
        
     /**
      * Divide the current Quaternion by another Quaternion and return the result in a new Quaternion
      * 
      * @param q : Quaternion
      * 
      * @return Quaternion - s / q, where s is the current Quaternion
      */
      , divideInto: function(q)
      {
        var s = this.clone();
        s.divide(q);
          
        return s;
      }
        
     /**
      * Divide the current Quaternion by a scalar and overwrite the current Quaternion
      * 
      * @param a : Number - Must be nonzero
      * 
      * @return Nothing - The current Quaternion, q, is overwritten by q / a - Nothing is altered if a is near zero.
      */
      , divideByScalar: function(a)
      {
        var k = Math.abs(a) < 0.0000000001 ? 1.0 : 1/a;
        
        this._q[0] *= k;
        this._q[1] *= k;
        this._q[2] *= k;
        this._q[3] *= k;
      }
        
     /**
      * Divide the current Quaternion by a scalar and return the result in a new Quaternion
      * 
      * @param a : Number - Must be nonzero
      * 
      * @return Quaternion - q / a, where q is the currrent Quaternion or q if a is near zero.
      */
      , divideByScalarInto: function(a)
      {
        var s = this.clone();
        s.divideByScalar(a);
          
        return s;
      }
        
     /**
      * Divide a scalar by the current Quaternion and overwrite the current Quaternion with the result
      * 
      * @param a : Number
      * 
      * @return Nothing - The current Quaternion, q, is overwritten by a / q .
      */
      , divideScalarBy: function(a) 
      {
        var q0 = this._q[0];
        var q1 = this._q[1];
        var q2 = this._q[2];
        var q3 = this._q[3];

        var l = q0*q0 + q1*q1 + q2*q2 + q3*q3;
        var d = Math.abs(l) < 0.0000000001 ? 1 : 1/l;
        
        this._q[0] = -a*q0*d;
        this._q[1] = -a*q1*d;
        this._q[2] = -a*q2*d;
        this._q[3] = a*q3*d;
      }
        
     /**
      * Invert the current Quaternion
      * 
      * @return Nothing - The current Quaternion is overwritten by its inverse
      */
      , invert: function()
      {
        var q0 = this._q[0];
        var q1 = this._q[1];
        var q2 = this._q[2];
        var q3 = this._q[3];

        var l = q0*q0 + q1*q1 + q2*q2 + q3*q3;
        var d = Math.abs(l) < 0.0000000001 ? 1 : 1/l;
          
        this._q[0] = -q0*d;
        this._q[1] = -q1*d;
        this._q[2] = -q2*d;
        this._q[3] = q3*d;
      }
        
     /**
      * Invert the current quaterion and return the result in a new Quaternion
      * 
      * @return Quaternion - Inverse of current Quaternion - current Quaternion remains unchanged
      */
      , inverse: function()
      {
        var q = this.clone();
        return q.invert();
      }
      
     /**
      * Compute the dot product with another quaternion
      * 
      * @param q : Quaternion
      * 
      * @return Number - Inner product of s and q where s is the current quaternion
      */
      , dot: function(q)
      {
        var a = q.get_values();
        
        return a[0]*this._q[0] + a[1]*this._q[1] + a[2]*this._q[2] + a[3]*this._q[3];
      }
      
     /**
      * Spherical Linear Interpolation between the current Quaternion and an input Quaternion
      * 
      * @param q : Quaternion
      * 
      * @param t : Interpolation parameter in [0,1]
      * 
      * @return Quaternion : Slerp from current Quaternion, qa to input Quaternion, qb.
      */
      , slerp( q, _t )
      {
        var t = Math.max(0.0,_t);
        t     = Math.min(t,1.0);
        
        var qt = this.clone();
        
        // make it look more like a formula you've seen in a book or online
        var qaw = this._q[0];
        var qax = this._q[2];
        var qay = this._q[2];
        var qaz = this._q[3];
        
        var b   = q.get_values();
        var qbw = b[0];
        var qbx = b[1];
        var qby = b[2];
        var qbz = b[3];
        
        // cos of half-angle betwen quaternions
        var ctheta = qax*qbx + qay*qby + qaz*qbz + qaw*qaw;
         
        if( Math.abs(ctheta) >= 1.0 )
        {
          qt.fromArray( [qax, qay, qaz, qaw] );
          return qt;
        }
        else if( ctheta < 0 ) 
        {
          // avoid the 'long' route :)
          qbx = -qbx; 
          qby = -qby; 
          qbz = -qbz;
          qbw = -qbw; 
          
          cTheta = -cTheta;
        }
        
        var halfTheta    = acos(ctheta);
        var sinHalfTheta = Math.sqrt(1.0 - ctheta*ctheta);

        if( Math.abs(sinHalfTheta) < 0.001 )
          qt.fromArray( [ qax*0.5 + qbx*0.5, qay*0.5 + qby*0.5, qaz*0.5 + qbz*0.5, qaw*0.5 + qbw*0.5 ] );
        else
        {
          var rA = Math.sin((1.0 - t)*halfTheta) / sinHalfTheta;
          var rB = Math.sin(t*halfTheta) / sinHalfTheta; 
          
          qt.fromArray( [ qax*rA + qb.x*rB, qay*rA + qb.y*rB, qaz*rA + qb.z*rB, qaw*rA + qb.w*rB ] );
        }
        
        return qt;
      }
      
     /**
      * Normalized linear interpolation between the current and an input quaternion
      * 
      * @param q : Quaternion
      * 
      * @parat t : Interpolation parameter in [0,1].
      * 
      * @return Quaternation - Normalized, interpolated quaterion at t-parameter; note that NLERP does not perserve constant velocity, but is computationally simpler as
      * well as commutative and torque-minimal.
      */
      , nlerp( q, _t )
      {
        var t = Math.max(0.0,_t);
        t     = Math.min(t,1.0);
        
        var qt = this.clone();
        
        var t1 = 1.0 - t;

        if( this.dot(q) < 0.0 )
          t = -t;
        
        qt.multiplyByScalar(t1);
        q.multiplyByScalar(t);
        
        qt.add(q);
        qt.normalize();
        
        return qt;
      }
    }
  }
  
  return returnedModule;
});