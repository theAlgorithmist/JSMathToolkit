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
   * Common low-level utility methods for general mathematical operations.  
   * 
   * @author Jim Armstrong (www.algorithmist.net)
   * 
   * @version 1.0
   * 
   */
    this.MathUtils = function()
    {
    }
   
    this.MathUtils.__name__ = true;
    this.MathUtils.prototype = 
    {
    /**
      * Compute the least common multiple of two integers
      *
      * @param n1 : Int - First integer
      * 
      * @param n2 : Int - Second integer
      * 
      * @return Int : LCM of the two input integers
      */  
      lcm: function(n1, n2)
      {
        var theGcd = this.gcd(n1, n2);
        return theGcd == 0 ? 0 : Math.floor((n1 * n2) / theGcd);    
      }
         
     /**
      * Compute the greatest common divisor of two integers
      *
      * @param n1 : Int - First integer
      * 
      * @param n2 : Int - Second integer
      * 
      * @return Int : GCD of the two input integers
      * 
      */  
      , gcd: function(n1, n2)
      {
        n1 = Math.floor( Math.abs(n1) );
        n2 = Math.floor( Math.abs(n2) );
         
        var a = Math.max(n1, n2);
        var b = Math.min(n1, n2);
        var r = 0;      
         
        //  Euclid's principle
           
        // if a > b, swap a, b
        // r = a mod b
        // while r > 0
        // a = b
        // b = r
         
        while( b > 0 )
        {
          r = a % b;
          a = b;
          b = r;
        }
           
        return Math.floor(a);
      } 
    }  
  }
  
  return returnedModule;
});