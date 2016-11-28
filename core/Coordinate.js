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
  function $extend(from, fields) 
  {
    function inherit() {}; 
    inherit.prototype = from; 
    var proto = new inherit();
    
    for( var name in fields ) 
      proto[name] = fields[name];
    
    if( fields.toString !== Object.prototype.toString ) 
      proto.toString = fields.toString;
    
    return proto;
  }

  var returnedModule = function () 
  {
   /**
    * A simple Coordinate class, which is a Point augmented by methods that are useful for computations with geo-coded data.  A lazy
    * validation model is used for normalization, i.e. normalized coordinates are recomputed only when the first or second coordinate
    * values actually change.
    * 
    *  @param first : Number - x- or first coordinate
    * 
    * @param second : Number - y- or second coordinate
    * 
    * @return  Nothing
    * 
    * @author: Jim Armstrong (www.algorithmist.net)
    * 
    * @version 1.0
    * 
    */
    this.Coordinate = function(__first, __second)
    {
      Point.call(this, __first, __second);
      
      this.TO_MILES   = 0.621371;
      this.DEG_TO_RAD = 0.01745329251; // PI/180.0;
      this.RADIUS_KM  = 6378.5;        // radius of earth in km.
    }
    
    this.Coordinate.__name__ = true;
    this.Coordinate.__super__ = Point;
    this.Coordinate.prototype = $extend(Point.prototype),
    {
     /**
      * Normalize the current coordinate values
      * 
      * @return  Nothing First and second, i.e. x and y coordinates are normalized so that if interpreted as a vector, the 2-norm of
      * the vector is unity (within roundoff)
      */
      normalize: function()
      {
	      if( this._invalidated )
	      {
	        var n = length();
	        if( n > 0.000001 )
	        { 
            this._x = _x/n;
	          this._y = _y/n;
		
		        this._invalidated = true;
	        }
	      }
      }
  
     /**
      * Compute the great-circle distance to another coordinate where both coordinate pairs are interpreted as (lat, long)
      * 
      * @param c : Coordinate - Destination coordinate pair (current instance may be considered an origin) where the first and second values
      * are interpreted as latitude and longitude in degrees.  
      * 
      * @return Float - Approximate great-circle distance between the origin and destination coordinates (both coordinates must be in degrees and
      * west of prime meridian is considered negative).  A simple, spherical model of the earth is used in the computations and returned distance 
      * is in kilometers.  Use the conversion factor TO_MILES to convert to miles.
      */
      public function gcd(__c:Coordinate)
      {
        var lat1  = this._x*DEG_TO_RAD;
        var lat2  = __c.get_x()*DEG_TO_RAD;
        var long1 = this._y*DEG_TO_RAD;
        var long2 = __c.get_y()*DEG_TO_RAD;
        var dlat  = Math.abs(lat2 - lat1); 
        var dlon  = Math.abs(long2 - long1);
        var sLat  = Math.sin(dlat*0.5);
        var sLong = Math.sin(dlon*0.5);
        var a     = sLat*sLat + Math.cos(lat1)*Math.cos(lat2)*sLong*sLong;
        var c     = 2*Math.asin(Math.min(1.0,Math.sqrt(a)));

        return RADIUS_KM*c;  // result in km
      }
    }
  }
  
  return returnedModule;
});