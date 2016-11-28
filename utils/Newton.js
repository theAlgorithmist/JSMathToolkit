/**
 * copyright (c) 2012, Jim Armstrong.  All Rights Reserved.
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
   * Compute simple roots of the equation f(x) = 0 given a starting point and convergence criteria, using Newton's method.  To use, set the iteration limit 
   * and tolerance, then call the findRoot method.
   * 
   * @author Jim Armstrong (www.algorithmist.net)
   * 
   * @version 1.0
   */
    this.Newton = function()
    {
      this.TOLERANCE  = 0.000001;
      this.ZERO_TOL   = 0.00000000000001;
      this.ITER_LIMIT = 100;
    
      private var __iter = 0;                      // number of iterations
      private var __iterLimit = this.ITER_LIMIT;   // maximum number of allowed iterations
      private var __tolerance = this.TOLEERANCE;   // tolerance for convergence (absolute error between iterates)
    }
    
    this.Newton.__name__ = true;
    this.Newton.prototype = 
    {
     /**
      * Access iteration count
      * 
      * @return Int - Number of iterations to convergence or iteration limit
      */
      get_iterations: function()
      {   
        return this.__iter;
      }
   
     /**
      * Assign convergence tolerance
      * 
      * @param _tol : Float - Absolute convergence tolerance value (must be greater than zero)
      * 
      * @return Nothing - Convergence tolerance is reset as long as input parameter is greater than zero
      */
      , set_tolerance: function(_tol)
      {
        if( _tol > 0 )
          this.__tolerance = _tol;
      }
   
     /**
      * Assign iteration limit
      * 
      * @param _limit : Int - Maximum number of allowed iterations (must be greater than zero)
      *  
      * @return Nothing - Iteration limit is reset as long as input parameter is greater than zero
      */
      , set_iterLimit(_limit)
      { 
        this.__iterLimit = _limit > 0 ? _limit : 1;
      }

     /**
      * Find a root of the supplied function
      * 
      * @param _start:Number desired starting point for iteration
      * @param _function:Function reference to <code>Function</code> to evalute f(x)
      * @param _deriv:Function reference to <code>Function</code> to evaluate f'(x)
      *
      * @return Number: Approximation of desired root based on tolerance and iteration limit
      *
      */
      , findRoot: function( _start, _function, _deriv )   
      {
        this.__iter     = 0;
        var previous = _start;
      
        if( _function == null || _deriv == null )
          return _start;;
        
        this.__iter  = 1;
        var deriv    = _deriv(previous);
        var x        = Math.abs(deriv) < this.ZERO_TOL ? -Number.MAX_VALUE : previous - _function(previous)/deriv;
        var finished = Math.abs(x - previous) < this.__tolerance;
      
        while( __iter < __iterLimit && !finished )
        {
          previous = x;
        
          deriv    = _deriv(previous);
          x        = Math.abs(deriv) < this.ZERO_TOL ? -Number.MAX_VALUE : previous - _function(previous)/deriv;
          finished = Math.abs(x - previous) < this.__tolerance;
      
          this.__iter++;
        }
      
        return x;
      }
    }
  }
  
  return returnedModule;
});