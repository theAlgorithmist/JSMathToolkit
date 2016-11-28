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

define(['../utils/TWBRF'], function (RootFinderModule) 
{
  var returnedModule = function () 
  {
    var rootRef      = new RootFinderModule();
    var __rootFinder = new rootRef.TWBRF();
    
   /**
    * Compute all simple, real roots of a cubic polynomial with real coefficients within a given interval, or indicate that no roots exist.  Set the interval
    * before calling the getRoots method.
    * 
    * @author Jim Armstrong
    * 
    * @version 1.0
    */
    this.CubicRoots = function()
    {
	    this._x0 = 0;  // left endpoint of interval
	    this._x1 = 0;  // right endpoint of interval
	    
	    this.BISECT_LIMIT = 0.05; 
    }
    
    this.CubicRoots.__name__ = true;
    this.CubicRoots.prototype = 
    {
     /**
      * Assign lower endpoint of the search interval
      * 
      * @param value : Number - Lower endpoint of search interval
      * 
      * @returnNothing
      */
	    set_x0: function(value)
	    {
	      this._x0 = isNaN(value) ? this._x0 : value;
	    }
	
     /**
      * Assign upper endpoint of the search interval
      * 
      * @param value : Number - Upper endpoint of search interval
      * 
      * @returnNothing
      */
	    , set_x1(value)
      {
	      this._x1 = isNaN(value) ? this._x1 : value;
	    }

     /**
      * Compute simple, real, roots of the cubic polynomial in the interval [x0,x1]
      * 
      * @param c0 : Number - Constant coefficient of the polynomial
      * @param c1 : Number - Coefficient of the linear term of the polynomial
      * @param c2 : Number - Coefficient of the quadratic term of the polynomial
      * @param c3 : Number - Coefficient of the cubic term of the polynomial
      * 
      * @return Array - Roots found within the interval, i.e. solutions to i.e. solutions to c0 + c1*x + c2*x^2 + c3*x^3 = 0.  Array length is zero if no roots are found.
      */
	    , getRoots(c0, c1, c2, c3)
      {
	      if( c0 == undefined )
	        c0 = 0;
	      
	      if( c1 == undefined )
          c1 = 0;
	      
	      if( c2 == undefined )
          c2 = 0;
	      
	      if( c3 == undefined )
          c3 = 0;
	      
	      if( c0 == 0 && c1 == 0 && c2 == 0 && c3 == 0 )
	        return [0];
	      
	      var roots = [];
		   
	      // validate interval
	      if( this._x1 <= this._x0 || Math.abs(this._x1 - this._x0) < 0.0001 )
	        return roots;
	  
	      // Bairstow's algorithm is probably overkill for a cubic unless you have absolutely no idea of how to bound the roots.  Most of the
	      // time, we have some idea of either bounds for all roots or a specific interval in which we want roots, so the solution is pretty
	      // simple - use Bisection to bound one root in the specified interval.  Compute that single root, then use synthetic division to
	      // divide out the factor.  Use the quadratic formula for the remaining roots.
	   
	      var f = function(_x) { return c0 + _x*(c1 + _x*(c2 + _x*(c3))); }
	 
	      // tbd - may want to make the bisection limit adjustable in the future, so set that here if needed  
	      var interval = this.__bisection(f, this._x0, this._x1);
	   
	      if( !interval )
	        return roots;
	   
	      // first root
	      var r0 = __rootFinder.findRoot(interval.left, interval.right, f, 0.001);
        var eval = Math.abs( f(r0) );
        if( eval > 0.001 )
          return roots;   // compensate in case method quits due to error
		
	      // is the root in the specified interval?
	      if( r0 >= this._x0 && r0 <= this._x1 )
          roots.push( r0 );  
      
        // Factor theorem: t-r is a factor of the cubic polynomial if r is a root.  Use this to reduce to a quadratic poly. using synthetic division
        var a = c3;
        var b = r0*a + c2;
        var c = r0*b + c1;
	  
	      // process the quadratic for the remaining two possible roots
        var d = b*b - 4*a*c;
        if( d < 0 )
          return roots;
      
        d      = Math.sqrt(d);
        a      = 1/(a + a);
        var r1 = (d-b)*a;
        var r2 = (-b-d)*a;
      
        if( r1 >= this._x0 && r1 <= this._x1 )
          roots.push( r1 );
        
        if( r2 >= this._x0 && r2 <= this._x1 )
          roots.push( r2 );
        
        return roots;
	    }
   
      // inline the bisection for performance
      , __bisection(_f, _left, _right)
      {
        
        if( Math.abs(_right-_left) <= this.BISECT_LIMIT )
          return null;
        
        var middle = 0.5*(_left+_right);
        if( _f(_left)*_f(_right) <= 0 )
          return {left:_left, right:_right};
        else
        {
          var leftInterval = this.__bisection(_f, _left, middle);
          if( leftInterval != null )
            return leftInterval;
            
          var rightInterval = this.__bisection(_f, middle, _right);
          if( rightInterval != null )
            return rightInterval;
        }
        
        return null;
      }
    }
  }
  
  return returnedModule;
});