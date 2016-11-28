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
    * Utilities for floating-point number comparison
    * 
    * Author: Jim Armstrong (www.algorithmist.net)
    * 
    * Version 1.0
    * 
    */
    this.ApproxEqual = function() 
    {
      // empty
    }
    
    this.ApproxEqual.__name__ = true;
    this.ApproxEqual.prototype = 
    {
     /**
      * Compare two floating-point numbers within a tolerance
      * 
      * @param a : Number - Floating-point number
      * 
      * @param b : Number - Floating-point number for comparison with first number
      * 
      * @param tol : Number - Relative-error tolerance (defaults to 0.001)
      * 
      * @return Boolean - True if the two input numbers are equal within the prescribed relative error or false if either input is undefined
      */
      compare: function(a, b, tol)
      {
        if ( tol <= 0 )
          tol = 0.001;
        
	      if( isNaN(a) )
	        return false;
	  
	      if( isNaN(b) )
	        return false;
	  
        if( a == b )
	        return true;
	  
	      if( Math.abs(b) > Math.abs(a) )
          return Math.abs((a - b) / b) <= tol;
        else
          return Math.abs((a - b) / a) <= tol;
      } 
    }
  }
  
  return returnedModule;
});
