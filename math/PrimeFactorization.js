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
    * A simple, prime factorization, suitable for modest-size, positive integers.
    * 
    *
    * @author Jim Armstrong (www.algorithmist.net)
    * 
    * @version 1.0
    */
    this.PrimeFactorization = function()
    {
      this.__isFinished = false;
    }
    
    this.PrimeFactorization.__name__ = true;
    this.PrimeFactorization.prototype = 
    {
    /**
     * Return an array of prime factors of a positive integer
     * 
     * @param n: Int - Integer whose prime factorization is desired (this method is not recommended for very large integers)
     * 
     * @return Array - Prime factors
     */
      factorize: function(_n)
      {
        if( _n < 0 || isNaN(_n) )
          return [];
        
        var arg = Math.floor(_n);
        if( arg == 0 )
          return [0];
  
        if( arg == 1 )
          return [1];

        if( arg == 2 )
          return [2];

        var primes        = [];
        this.__isFinished = false;
        
        this.__factors(arg, 2, primes);
    
        return (primes.length == 0) ? [arg] : primes;
      }

      // internal method - recursively generate prime factors - this is best suited to modest-sized integers and will be inefficient for very large ones
      , __factors(_n, _start, _primes)
      {
        var c;
        for( c=_start; c<=_n+1; ++c )
        {
          if( this.__isFinished )
            return;

          if( _n%c == 0 && this.__isPrime(c) )
          {
            _primes.push(c); 
            var next = _n/c;
            if( next > 1 )
              this.__factors(next, c, _primes);
            else
            {
              this.__isFinished = true;
              return;
            }
          }  
        }  
      }

      // internal method - is the input prime?  Algorithm is a bit of a hack, but quickly identifies non-primes
      , __isPrime: function(_n)
      {
        if( _n == 2 )
          return true;

        var upper = Math.floor( Math.sqrt(_n)+1 );
        var i;
        for( i=2; i<=upper; ++i )
        {
          if( _n%i == 0 )
            return false;
        }
        return true;
      }
    }
  }
  
  return returnedModule;
});