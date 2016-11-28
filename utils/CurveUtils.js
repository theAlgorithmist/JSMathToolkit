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

define(['./Gauss', './TWBRF'], function (GaussModule, RootFinderModule) 
{
  var returnedModule = function () 
  {
    var gaussRef   = new GaussModule();
    var __integral = new gaussRef.Gauss();
    
    var rootFinderRef = new RootFinderModule();
    var __root        = new rootFinderRef.TWBRF();
    
  /**
   * Some utility methods for arbitrary (currently cubic) parametric curves
   *  
   * @author Jim Armstrong (www.algorithmist.net)
   * 
   * @version 1.0
   * 
   */
    this.CurveUtils = function()
    {
      this.ZERO_TOL = 0.0000001;             // arbitrary zero-tolerance to use as default when tolerance not provided
      
      // most recently requested normalized arc length and returned parameter - cached for multiple calls in sequence
      this.__s = 0;
      this.__t = 0;
    }
   
    this.CurveUtils.__name__ = true;
    this.CurveUtils.prototype = 
    {
     /**
      * Return natural parameter, t, at the specified normalized arc length
      * 
      * @curve : Object - Cubic coefficients store in the c0x, c0y, c1x, c1y, c2x, c2y, c3x, and c3y properties
      * 
      * @param s : Float - Normalized arc length in [0,1] or fraction of length between t = 0 and t = 1
      * 
      * @return Float Natural parameter, t, that corresponds to the input normalized arc length
      */
      tAtLength: function(_curve, _s)
      {
	      var s = Math.max(0, _s);
	      s     = Math.min(s, 1);
	      
	      if( s == 0 )
        {
          this.__s = this.__t = 0;
          return 0;
        }
        
        if( s == 1 )
        {
          this.__s = this.__t = 1;
          return 1;
        }
      
        var integrand = function(_t)
        {
          var xPrime = _curve.c1x + 2*_t*_curve.c2x + 3*_t*_t*_curve.c3x;
          var yPrime = _curve.c1y + 2*_t*_curve.c2y + 3*_t*_t*_curve.c3y;
          
          return Math.sqrt( xPrime*xPrime + yPrime*yPrime );
        }
        integrand.bind(this);
        
        // total arc length for this curve from t = 0 to t = 1
        var __total = __integral.eval(integrand, 0, 1, 8);
        
        // invert
        __total = __total == 0 ? 0 : 1/__total;
        
        // evaluate the function f(t) = L(t)/S - s = 0 for t (S = total arc length, s = input normalized arc length)
        var __f = function(t)
        {
          return __integral.eval(integrand, 0, t, 8)*__total - s;
        };
        __f.bind(this);
        
        // the name of the game is to quickly get an interval containing the arc length, then let TWBRF do its work; the new __t value is in either
        // [0,__t) or (__t,1] depending on whether or not _s > __s or _s < __s.
        var __left  = 0;
        var __right = 1;
        
        if( s > this.__s )
        {
          // moving uniformly forward in arc-length is the most expected use case
          __left = this.__t + 0.001;
        }
        else
        {
          this.__right = this.__t - 0.001;
        }
        
        // because of the non-decreasing relationship between the natural parameter and normalized arc length, we know that the t-parameter corresponding
        // to the requested s is in the interval [left, right], provided the delta between subsequent requests for s is sufficiently large for the hardcoded
        // delta-t (that's the trick in this approximation scheme).
        var t = __root.findRoot(__left, __right, __f, 0.001);
        if( t >= 0 && t <= 1 )
        {
          this.__s = s;
          this.__t = t;
        }
        else
          t = 0;
        
        return  t;
        
      }
    }
  }
  
  return returnedModule;
});
