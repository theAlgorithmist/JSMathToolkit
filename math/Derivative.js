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
    * Some methods for numerically approximating the derivative of a function
    * 
    * @author Jim Armstrong
    * 
    * @version 1.0
    */
    this.Derivative = function()
    {
      this.LIMIT = 8;  // Iteration limit for Ridders' method
    }
    
    this.Derivative.__name__ = true;
    this.Derivative.prototype = 
    {
     /**
      * Approximate the derivative using central differences
      * 
      * @param f : Function - Function reference that takes single argument, x, and returns f(x) - the function whose derivative is desired
      * 
      * @param x : Domain value at which the derivative is desired
      * 
      * @parah h : Increment - must be greater than zero and suitably small for the domain over which the derivative is desired.
      * 
      * @return Number - Numerical estimate of dy/dx at the input x-coordinate.  For performance reasons, there is no error checking; you break it, you buy it.
      */
      centralDiff: function(f, x, h)
      {
        return (f(x+h) - f(x-h))/(h+h);
      }
    
     /**
      * Approximate the derivative using a higher-order difference formula (better accuracy, but assumption of the existence of up to fifth-order continuous derivative)
      * 
      * @param f : Function - Function reference that takes single argument, x, and returns f(x) - the function whose derivative is desired
      * 
      * @param x : Domain value at which the derivative is desired
      * 
      * @parah h : Increment - must be greater than zero and suitably small for the domain over which the derivative is desired.
      * 
      * @return Number - Numerical estimate of dy/dx at the input x-coordinate.  For performance reasons, there is no error checking; you break it, you buy it.
      */
      , cdiff_high: function(f, x, h)
      {
        var h2 = h+h;
        return ( -f(x+h2) + 8.0*f(x+h) -8.0*f(x-h) + f(x-h2) ) / (12.0*h);
      }
    
     /**
      * Approximate the derivative using Ridders' method (more appropriate for a single or small number of derivative evaluations in an interval)
      *   
      * @param f : Function - Function reference that takes single argument, x, and returns f(x) - the function whose derivative is desired
      * 
      * @param x : Domain value at which the derivative is desired
      * 
      * @parah h : Increment - must be greater than zero and represent a range over which the function varies in a notable manner - it need not be small.
      * 
      * @return Number - Numerical estimate of dy/dx at the input x-coordinate.  For performance reasons, there is no error checking; you break it, you buy it.
      */
      , rDeriv: function(f, x, h)
      {
        var con  = 1.4;
        var con2 = (con*con);
        var safe = 2.0;
        var i, j;
        
        var errt, fac, deriv;
        
        var a = [];
        for( i=0; i<this.LIMIT; ++i )
          a.push( [] );
        
        var hh = h;
        a[0][0] = (f(x+hh)-func(x-hh))/(2.0*hh);
        err = Number.MAX_VALUE;
        
        for( i=1; i<this.LIMIT; ++i ) 
        {
          hh     /= con;
          a[0][i] = (f(x+hh)-func(x-hh))/(2.0*hh);
          fac     = con2;
          
          for( j=1; j<=i; ++j ) 
          {
            a[j][i] = (a[j-1][i]*fac - a[j-1][i-1])/(fac-1.0);
            fac     = con2*fac;
            errt    = Math.max( Math.abs(a[j][i]-a[j-1][i]), Math.abs( a[j][i]-a[j-1][i-1]) );
            
            if( errt < err ) 
            {
              err = errt;
              deriv = a[j][i];
            }
          }
          
          if( Math.abs(a[i][i] - a[i-1][i-1]) >= safe*err ) 
            break;
        }
        
        return deriv;
      }
    }
  }
  
  return returnedModule;
});