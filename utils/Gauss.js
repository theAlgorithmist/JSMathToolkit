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
    * A utility to perform Gauss-Legendre numerical integration (without error checking for fast performance)
    * 
    * @author: Jim Armstrong (www.algorithmist.net)
    * 
    * @version 1.0
    * 
    */
    this.Gauss = function() 
    {
      this.__abscissa = [];       // abscissa table
      this.__weight = [];         // weight table
  
	    // N=2
      this.__abscissa.push(-0.5773502692);
      this.__abscissa.push( 0.5773502692);

      this.__weight.push(1);
      this.__weight.push(1);

      // N=3
      this.__abscissa.push(-0.7745966692);
      this.__abscissa.push( 0.7745966692);
      this.__abscissa.push(0);
    
      this.__weight.push(0.5555555556); 
      this.__weight.push(0.5555555556);
      this.__weight.push(0.8888888888);

      // N=4
      this.__abscissa.push(-0.8611363116);
      this.__abscissa.push( 0.8611363116);
      this.__abscissa.push(-0.3399810436);
      this.__abscissa.push( 0.3399810436);

      this.__weight.push(0.3478548451);
      this.__weight.push(0.3478548451);
      this.__weight.push(0.6521451549);
      this.__weight.push(0.6521451549);

      // N=5
      this.__abscissa.push(-0.9061798459);
      this.__abscissa.push( 0.9061798459);
      this.__abscissa.push(-0.5384693101);
      this.__abscissa.push( 0.5384693101);
      this.__abscissa.push( 0.0000000000);

      this.__weight.push(0.2369268851);
      this.__weight.push(0.2369268851);
      this.__weight.push(0.4786286705);
      this.__weight.push(0.4786286705);
      this.__weight.push(0.5688888888);
 
      // N=6
      this.__abscissa.push(-0.9324695142);
      this.__abscissa.push( 0.9324695142);
      this.__abscissa.push(-0.6612093865);
      this.__abscissa.push( 0.6612093865);
      this.__abscissa.push(-0.2386191861);
      this.__abscissa.push( 0.2386191861);

      this.__weight.push(0.1713244924);
      this.__weight.push(0.1713244924);
      this.__weight.push(0.3607615730);
      this.__weight.push(0.3607615730);
      this.__weight.push(0.4679139346);
      this.__weight.push(0.4679139346);
 
      // N=7
      this.__abscissa.push(-0.9491079123);
      this.__abscissa.push( 0.9491079123);
      this.__abscissa.push(-0.7415311856);
      this.__abscissa.push( 0.7415311856);
      this.__abscissa.push(-0.4058451514);
      this.__abscissa.push( 0.4058451514);
      this.__abscissa.push( 0.0000000000);

      this.__weight.push(0.1294849662);
      this.__weight.push(0.1294849662);
      this.__weight.push(0.2797053915);
      this.__weight.push(0.2797053915);
      this.__weight.push(0.3818300505);
      this.__weight.push(0.3818300505);
      this.__weight.push(0.4179591837);

      // N=8
      this.__abscissa.push(-0.9602898565); 
      this.__abscissa.push( 0.9602898565);
      this.__abscissa.push(-0.7966664774);
      this.__abscissa.push( 0.7966664774);
      this.__abscissa.push(-0.5255324099);
      this.__abscissa.push( 0.5255324099);
      this.__abscissa.push(-0.1834346425); 
      this.__abscissa.push( 0.1834346425);

      this.__weight.push(0.1012285363);
      this.__weight.push(0.1012285363);
      this.__weight.push(0.2223810345);
      this.__weight.push(0.2223810345);
      this.__weight.push(0.3137066459);
      this.__weight.push(0.3137066459);
      this.__weight.push(0.3626837834);
      this.__weight.push(0.3626837834);
    }
    
    this.Gauss.__name__ = true;
    this.Gauss.prototype = 
    {
     /**
      * Compute approximate integral over specified range
      *
      * @param _f : Function - Reference to function to be integrated - must accept a numerical argument and return the function value at that argument.
      *
      * @param _a : Number - Left-hand value of interval.
      * 
      * @param _b : Number - Right-hand value of inteval.
      * 
      * @param _n : Number  - Number of points -- must be between 2 and 8
      *
      * @return Number - approximate integral value over [_a, _b], provided inputs are valid.
      *
      */
      eval: function(_f, _a, _b, _n)
      {
        var n = _n < 2 ? 2 : _n;
        n         = n > 8 ? 8 : n;

        var l   = (n==2) ? 0 : Math.floor( n*(n-1)/2 - 1 );
        var sum = 0;
        var i   = 0;
	  
        if( _a == -1 && _b == 1 )
        {
          while( i < n )
		      {
            sum += _f(__abscissa[l+i])*__weight[l+i];
            i++;
		      }
		
          return sum;
        }
        else
        {
          // change of variable
          var mult = 0.5*(_b-_a);
          var ab2  = 0.5*(_a+_b);
		
          while( i < n )
          {
            sum += _f(ab2 + mult*this.__abscissa[l+i])*this.__weight[l+i];
            i++;
		      }
		
          return mult*sum;
        }
      }
    }
  }

  return returnedModule;
});
