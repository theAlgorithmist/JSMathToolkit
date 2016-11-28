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
   * Compute simple roots of the equation f(x) = 0 given a starting point and convergence criteria, using Halley's method.  To use, set the iteration limit 
   * and tolerance, then call the findRoot method.
   * 
   * @author Jim Armstrong (www.algorithmist.net)
   * 
   * @version 1.0
   */

    this.Halley = function()
    {
      this.TOLERANCE  = 0.000001;
      this.ZERO_TOL   = 0.00000000000001;
      this.ITER_LIMIT = 100;
    
      private var __iter = 0;                      // number of iterations
      private var __iterLimit = this.ITER_LIMIT;   // maximum number of allowed iterations
      private var __tolerance = this.TOLEERANCE;   // tolerance for convergence (absolute error between iterates)
    }
    
    this.Halley.__name__ = true;
    this.Halley.prototype = 
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
      * @param _secondDeriv:Function reference to <code>Function</code> to evaluate f''(x)
      *
      * @return Number: Approximation of desired root based on tolerance and iteration limit
      */
      , findRoot( _start, _function, _deriv, _secondDeriv )   
      {
        this.__iter = 0;
      
        if( _function == null || _deriv == null )
          return _start;
        
        var previous  = _start;
        this.__iter   = 1;
        var f         = _function(previous);
        var deriv     = _deriv(previous);
        var x         = previous - (2*f*deriv) / (2*deriv*deriv - f*_secondDeriv(previous));
        var finished  = Math.abs(x - previous) < this.__tolerance;
      
        while( this.__iter < this.__iterLimit && !finished )
        {
          previous = x;
          f        = _function(previous);
          deriv    = _deriv(previous);
          x        = previous - (2*f*deriv) / (2*deriv*deriv - f*_secondDeriv(previous));
          finished = Math.abs(x - previous) < this.__tolerance;
      
          this.__iter++;
        }
      
        return x;
      }
    }
  }
  
  return returnedModule;
});