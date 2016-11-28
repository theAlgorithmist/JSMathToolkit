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

define(['./SeededRng'], function (SeededRngModule) 
{
  var returnedModule = function () 
  {
    var rngRef = new SeededRngModule();
    
   /**
	  * Returns a pseudo-random Number within the input range [a,b], where a and b are floats and b > a.  This
	  * method can be used with the system-supplied RNG or an optional seeded RNG.  There is automatic compensation for 
	  * bias towards endpoints, but no error-testing on inputs for performance reasons.
	  * 
	  * @param min:Number - minium value of range
	  * 
    * @param max:Number - maximum value of range
    * 
    * @param seed:uint  - seed value to use if seeded RNG is desired
	  * 
	  * @author Jim Armstrong
	  * 
	  * @version 1.0
	  */
    this.RandomInRange = function(min, max, seed)
    {
      this._min   = Math.min(min,max);     // minimum value
      this._max   = Math.max(min,max);     // maximum value
      this._delta = this._max-this._min;   // delta between max and min
      
      this._rng = new rngRef.SeededRng(seed);
    }
    
    this.SeededRng.__name__ = true;
    this.SeededRng.prototype = 
    {
     /**
      * Access the minimum value of the range
      * 
      * @return Number - Minimum value in the current range
      */
      get_min()
      { 
        return this_min; 
      }
      
     /**
      * Access the minimum value of the range
      * 
      * @return Number - Minimum value in the current range
      */
      , get_max:function () 
      { 
        return _max;
      }
    
     /**
	    * Generate a pseudo-random <code>Number</code> in an input range using the system-supplied RNG.
	    * 
	    * @param min:Number - minimum value of range
	    * 
	    * @param max:Number - maximum value of range
	    *
	    * @return Int - New iterate in the specified range
	    */
      , generateInRange: function(min, max)
      {
        var theMin = Number(min);
        var theMax = Math.max( min, Number(max) );
      
        // generate more statistically reliable results from the rounding (which is very noticeable for tight intervals)
        theMax += 0.499;
        theMin -= 0.499;
			   
        return Math.round(theMin + Math.random()*(theMax - theMin));
      }

     /**
	    * Generate a pseudo-random integer in the current range.
	    * 
	    * @param useSeeded:Boolean - true if the seeded RNG is used
	    * @default false
	    * 
	    * @return Int - new random iterate in the range specified during construction
	    */
      , generate: function(useSeeded)
      {
        if( useSeeded == undefined )
          useSeeded = false;
        
        var u = useSeeded ? this._rng.next() : Math.random();
      
        // generate more statistically reliable results from the rounding (which is very noticeable for tight intervals)
        var theMax = this._max + 0.499;
        var theMin = this._min - 0.499;
         
        return Math.round(theMin + u*(theMax - theMin));
      }
    }
  }
  
  return returnedModule;
});