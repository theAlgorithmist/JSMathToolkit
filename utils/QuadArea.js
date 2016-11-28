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
    * A series of QuadData instances that represent a closed space bounded above or below by zero.  This is largely a data-storage class, used for dashboards where
    * a collection of quad beziers above or below the x-axis are to be stored for future reference.
    * 
    * @author Jim Armstrong (www.algorithmist.net). 
    * 
    * @version 1.0
    */
    this.QuadArea = function()
    {
      this._quads = [];
      this._minX  = 0;
      this._maxX  = 0;
      this._minY  = 0;
      this._maxY  = 0;
      this._XAtY  = 0;
      this._area  = 0;
    };

    this.QuadArea.__name__ = true;
    this.QuadArea.prototype = 
    {
     /**
      * Add a new quadratic bezier (raw data only) to the collection
      * 
      * @param _q Reference to quadratic bezier data object with x0, y0, cx, cy, x1, y1, and length properties
      * 
      * @return Nothing
      */
      addQuad: function(_q)
      {
        this._quads.push(_q);
      }

     /**
      * Access the quadratic bezier collection
      * 
      * @return Array Collection of quadratic bezier data objects
      */
      ,getQuads: function()
      {
        return this._quads.slice();
      }
     
     /**
      * Access the minimum x-value across the collection of quadratic beziers
      * 
      * @return Float - Minimum x-value
      */
      ,getMinX: function()
      {
        return this._minX;
      }
  
     /**
      * Access the maximum x-value across the collection of quadratic beziers
      * 
      * @return Float - Maximum x-value
      */
      ,getMaxX: function()
      {
        return this._maxX;
      }
  
     /**
      * Access the minimum y-value across the collection of quadratic beziers
      * 
      * @return Float - Minimum y-value 
      */
      ,getMinY: function()
      {
        return this._minY;
      }
  
     /**
      * Access the maximum y-value across the collection of quadratic beziers
      * 
      * @return Float - Maximum y-value
      */
      , getMaxY: function()
      {
        return this._maxY;
      }
  
     /**
      * Access the area bounded by the collection of quad beziers and the x-axis
      * 
      * @return Float - Area value
      */
      ,getArea: function()
      {
        return this._area;
      }
  
     /**
      * Store the area bounded by the collection of quad. beziers and the x-axis
      * 
      * @param a : Float - Area value (must be greater than zero)
      */
      ,setArea: function(a)
      {
        this._area = Math.abs(a);
      }
  
     /**
      * Set the axis-aligned bounding-box for this collection
      * 
      * @param minX : Float - Minimum x-value
      * @param maxX : Float - Maximum x-value
      * @param minY : Float - Minimum y-value
      * @param maxY : Float - Maximum y-value
      * 
      * @return Nothing
      */
      ,setBounds: function(minX, maxX, minY, maxY)
      {
        if( minX <+ maxX )
        {
          this._minX = minX;
          this._maxX = maxX;
        }
    
        if( minY <+ maxY )
        {
          this._minY = minY;
          this._maxY = maxY;
        }
      }
  
     /**
      * Access a previously store x at y value
      * 
      * @return Float - Previously store x at y value
      */
      ,getXAtY: function()
      {
        return this._xAtY; 
      }
  
     /**
      * Store an x-at-y value for later access
      * 
      * @param _x : Float - Value to be stored
      */
      ,setXatY: function(_x)
      {
        this._xAtY = _x;
      }
  
     /**
      * Clear the collection
      * 
      * @return Nothing - Internal collection is cleared and prepared for new data
      */
      ,clear: function()
      {
        this._quads.length = 0;
    
        this._minX = 0;
        this._maxX = 0;
        this._minY = 0;
        this._maxY = 0;
        this._tAtY = 0;
      }
    }
  }
  
  return returnedModule;
});