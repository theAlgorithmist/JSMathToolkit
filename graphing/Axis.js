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
   * An Axis class for a 2D coordinate grid, responsible for parameter storage and supporting computations necessary for drawing
   * 
   * @Author Jim Armstrong (www.algorithmist.net)
   * 
   * @Version 1.0
   * 
   */
    this.Axis = function()
    {
      this.IN    = "in";
      this.OUT   = "out";
      this.MAJOR = "major";
      this.MINOR = "minor";
      this.LEFT  = "left";
      this.RIGHT = "right";
       
      this._pxPerUnit = 0;    // number pixels per unit axis value
      this._min       = 0;    // minimum axis value
      this._max       = 0;    // maximum axis value
      this._length    = 0;    // number of (integer) pixels across the length of this axis
      this._majorInc  = 0;    // one major tic every this many units
      this._minorInc  = 0;    // one minor tic every this many units
    }
    
    this.Axis.__name__ = true;
    this.Axis.prototype = 
    {
     /**
      * Access the number of pixels per unit value along this axis
      * 
      * @return Number - The number of pixels per unit value along the axis.  This requires the min-value, max-value, and axis
      * length to have been previously assigned.
      */
      get_pxPerUnit: function()
      {
        return this._pxPerUnit;
      }
  
     /**
      * Access the current minimum Axis value
      * 
      * @return Number - The current Axis minimum value
      */       
      , get_min: function()
      {
        return this._min;
      }
         
     /**
      * Access the current maximum Axis value
      * 
      * @Return Number - The current Axis maximum value
      */
      , get_max: function()
      {
        return this._max;
      }
      
     /**
      * Assign the minimum value to this axis
      * 
      * @param value : Number - Minimum axis value in current units, i.e. 4.0, -1.75, etc.
      * 
      * @return Nothing - Assigns the minimum value and updates the pixels per unit value as long as the new minimum is less than
      * or equal to the current maximum.  The axis degenerates to a point in the latter case.
      */
      ,set_min: function(__value)
      {
        this._min       = __value != this._min ? __value : this._min;
        this._pxPerUnit = this._min <= this._max ? this._length/(this._max-this._min) : 0;
      }
        
     /**
      * Assign the maximum value to this axis
      *
      * @param value : Number - Maximum axis value in current units, i.e. 4.0, -1.75, etc.
      * 
      * @Return Nothing - Assigns the maximum value and updates the pixels per unit value as long as the new maximum is greater than
      * or equal to the current minimum.  The axis degenerates to a point in the latter case.
      */
      , set_max: function(__value)
      {
        this._max       = this.__value != this._max ? __value : this._max;
        this._pxPerUnit = this._min <= this._max ? this._length/(this._max-this._min) : 0;
      }
      
     /**
      * Access the pixel length of this Axis
      * 
      * @return Int - Axis pixel length
      */
      , get_length: function()
      {
        return this._length;
      }
      
     /**
      * Assign the pixel length of this axis
      * 
      * @param : Int - Number of pixels that comprise the length of this axis - must be greater than or equal to zero.
      * 
      * @return Nothing - Negative values are converted to positive before computing the new number of pixels per unit value 
      * (provided length is non-zero and current min-value is less than or equal to current max-value).  A zero-length axis is degenerate.
      */
      , set_length: function(__value)
      {
        this._length    = Math.round(__value);
        this._length    = __value != this._length ? __value : this._length;
        this._length    = this._length < 0 ? -this._length : this._length;
        this._pxPerUnit = this._min <= this._max ? this._length/(this._max-this._min) : 0;
        
        return this._length;
      }
      
     /**
      * Assign the major tic increment in current units
      * 
      * @param : Number - Major tic increment, i.e. major tics every 0.5 units
      * 
      * @return Nothing
      */
      , set_majorInc: function(__inc)
      {
        if( __inc > 0 )
          this._majorInc = __inc;
      }
      
     /**
      * Assign the minor tic increment in current units
      * 
      * @param : Number - Minor tic increment, i.e. minor tics every 0.5 units
      * 
      * @return Nothing
      */
      ,set_minorInc: function(__inc)
      {
        if( __inc > 0 )
          this._minorInc = __inc;
      }
      
     /**
      * Return a collection of tic marks for this axis
      * 
      * @param type : String - Use the symbolic code Axis.MAJOR to query major tic increments and Axis.MINOR to query minor tic increments
      * 
      * @return Array - Computed tic marks.  If axis bounds and length have not been set or the major/minor tic increment is 
      * zero, then this method returns an empty array. An empty array is also returned for an invalid type parameter.
      */
      , getTicMarks: function(__type)
      {
        var px = this.get_pxPerUnit();
        if( px == 0 )
          return [];
          
        var tic      = 0;
        var ticMarks = [];
        
        if( __type == this.MAJOR )
        {
          if( this._majorInc != 0 )
          {
            tic  = Math.ceil(this._min/this._majorInc);
            tic *= this._majorInc;
          
            ticMarks.push( tic );
            tic += this._majorInc;
          
            while( tic <= this._max )
            {
              ticMarks.push( tic );
            
              tic += this._majorInc;
            }
          }
          else
            return [];
        }
        else if( __type == MINOR )
        {
          if( this._minorInc == 0 )
          {
            tic  = Math.ceil(this._min/this._minorInc);
            tic *= this._minorInc;
          
            ticMarks.push( tic );
            tic += this._majorInc;
            while( tic <= this._max )
            {
              ticMarks.push( tic );
            
              tic += this._majorInc;
            }
          }
          else
            return [];
        }
        
        return ticMarks;
      }
    
     /**
      * Return a collection of integer tic mark locations based on a graphic container with a presumed start index of zero
      * 
      * @param type : String - Use the symbolic code Axis.MAJOR to query tic locations and Axis.MINOR to query minor tic locations
      * 
      * @return Array - Coordinates for tic marks with the understanding that the axis begins at a zero coordinate inside a graphic container
      * in some production rendering environment.  The caller may loop over this array to draw tic marks at the correct position based on current axis settings.
      */
      , getTicCoordinates: function(__type)
      {
        var px = this.get_pxPerUnit();
        if( px == 0 )
          return [];
          
        var tic      = 0;
        var delta    = 0;
        var ticMarks = [];
      
        if( __type == this.MAJOR )
        {
          if( this._majorInc != 0 )
          {
            tic  = Math.ceil(this._min/this._majorInc);
            tic *= this._majorInc;
        
            while( tic <= this._max )
            {
             delta = tic - this._min;
              ticMarks.push( Math.round(delta*px) );
          
              tic += this._majorInc;
            }
          }
        }
        else if( __type == this.MINOR )
        {
          if( this._minorInc != 0 )
          {
            tic  = Math.ceil(this._min/this._minorInc);
            tic *= this._minorInc;
            
            while( tic <= this._max )
            {
              delta = tic - this._min;
              ticMarks.push( Math.round(delta*px) );
              
              tic += this._minorInc;
            }
          }
        }
      
        return ticMarks;
      }
    
     /**
      * Zoom the axis in or out
      *  
      * @param : String - Zoom direction; should be either Axis.IN or Axis.OUT
      * 
      * @param : Int - Zoom factor, i.e. 2, 4, 10, etc.  Note that zoom factor is applied to the current axis bounds which are
      * modified by each successive zoom. Take this into account if adjusting the zoom factor in a loop since the zooming is exponential.
      * 
      * @return Nothing - If zoom direction is correct, the axis is zoomed about its current midpoint.  Rounding in internal division and 
      * multiplication may affect axis bounds.
      */
      , zoom: function(__dir, __factor)
      {
        if( __factor < 1 )
          return;
      
        __factor = __factor < 0 ? -__factor : __factor;
        __factor = Math.round(__factor);
        if( __factor == 0 )
          return;
      
        var midpoint = 0.5*(this._max+this._min);
        var d        = this._max - midpoint;
      
        if( __dir == this.IN )
        {
          d = d/__factor;
        }
        else if( __dir == this.OUT )
        {
         d = d*__factor;
        } 
        
        // new min and max values 
        this._min = midpoint - d;
        
        // adjust px per unit as well as set new max value
        this.set_max(midpoint+d);
      }
    
     /**
      * Shift the axis by a number of pixels
      * 
      * @param amount : Integer - Number of pixels moved.  This value is negative if the axis is moved in a direction of decreasing
      * coordinate value (both min and max decrease) and positive if the axis is moved in a direction of increasing coordinate value (min
      * and max increase).  Directions are in user (not screen) coordinates.  Some graphic systems employ a y-down convention.
      * 
      * @return Nothing - The internal minimum and maximum axis values in actual coordinates are adjusted based on the specified pixel
      * shift.  The axis minimum, maximum, and pixels per unit must be set in advance of calling this method.
      */
      ,shift: function(__amount)
      {
        var px = this.get_pxPerUnit();
        if( px == 0 )
          return;
     
        px         = __amount/px;
        this._min -= px;
        this._max -= px;
      }
    }
  }
  
  return returnedModule;
});