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
    * A 'game quality' implementation of a Park Miller LCG with seeding.  Use of seeding allows a repeatable sequence to be
    * generated for debugging purposes.  The complete algorithm is detailed at http://www.firstpr.com.au/dsp/rand31/
    * 
    * @param seed: Int - Initial seed value, which should be in the interval [1, 0X7FFFFFFE]
    * 
    * @author Jim Armstrong
    * 
    * @version 1.0
    */
    this.SeededRng = function(seed)
		{
      if( isNaN(seed) )
        seed = 1;
      
      if( seed < 1 )
        seed = 1;
      
		  this._seed = seed;
		}
    
    this.SeededRng.__name__ = true;
    this.SeededRng.prototype = 
    {
     /**
	    * returns the next pseudo-random iterate
	    * 
	    * @return Int - next iterate in sequence as an unsigned integer
	    *
	    */	
      next: function()
		  {
			  return this.__generator();
		  }
		
    /**
	    * Return the next pseudo-random iterate in [0,1)
	    * 
	    * @return Number - next number in sequence in the interval [0,1)
	    */
		  , asNumber: function()
		  {
			  return this.__generator() / 2147483647;
		  }
		
		  // internal method - generator function, new = (16807*old * 16807) mod (2^31 - 1)
		  , __generator: function()
		  {
		    // update seed
		    _seed = (16807*_seed) % 2147483647;
		    
			  return _seed;
		  }
    }
  }
  
  return returnedModule;
});