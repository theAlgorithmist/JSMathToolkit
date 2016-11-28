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
   * Some basic functions for the poisson distribution.
   * 
   * @author Jim Armstrong (www.algorithmist.net)
   * 
   * @version 1.0
   * 
   */
    this.Poisson = function()
    {
      this._lambda = 1;
      
      this.__epsilon = 2.220446049250313e-16;
      this.__fpmin   = Number.MIN_VALUE/2.220446049250313e-16;
      
      this.__w = [0.0055657196642445571,
                  0.012915947284065419,
                  0.020181515297735382,
                  0.027298621498568734,
                  0.034213810770299537,
                  0.040875750923643261,
                  0.047235083490265582,
                  0.053244713977759692,
                  0.058860144245324798,
                  0.064039797355015485,
                  0.068745323835736408,
                  0.072941885005653087,
                  0.076598410645870640,
                  0.079687828912071670,
                  0.082187266704339706,
                  0.084078218979661945,
                  0.085346685739338721,
                  0.085983275670394821
                 ];
      
      this.__y = [0.0021695375159141994,
                  0.011413521097787704,
                  0.027972308950302116,
                  0.051727015600492421,
                  0.082502225484340941, 
                  0.12007019910960293,
                  0.16415283300752470,
                  0.21442376986779355, 
                  0.27051082840644336, 
                  0.33199876341447887,
                  0.39843234186401943, 
                  0.46931971407375483, 
                  0.54413605556657973,
                  0.62232745288031077, 
                  0.70331500465597174, 
                  0.78649910768313447,
                  0.87126389619061517, 
                  0.95698180152629142
                 ];
      
      this.__c = [57.1562356658629235,
                  -59.5979603554754912,
                  14.1360979747417471,
                  -0.491913816097620199,
                  0.339946499848118887e-4,
                  0.465236289270485756e-4,
                  -0.983744753048795646e-4,
                  0.158088703224912494e-3,
                  -0.210264441724104883e-3,
                  0.217439618115212643e-3,
                  -0.164318106536763890e-3,
                  0.844182239838527433e-4,
                  -0.261908384015814087e-4,
                  0.368991826595316234e-5
                 ];
    }
   
    this.Poisson.__name__ = true;
    this.Poisson.prototype = 
    {
     /**
      * Access the current lambda value
      * 
      * @return Number - Current lambda value of the distribution
      */
      get_lambda: function()
      {
        return this._lambda; 
      }
      
     /**
      * Return the mean of the current distribution
      * 
      * @return Number - Mean of current Poisson distribution
      */
      , get_mean: function()
      {
        return this._lambda;
      }
      
     /**
      * Return the standard deviation of this distribution
      * 
      * @return Number - standard deviation of the current Poisson distribution
      */
      , get_std: function()
      {
        return Math.sqrt(this._lambda);
      }
      
     /**
      * Return the skewness of this distribution
      * 
      * @return Number - skewness of the current distribution
      */
      , get_skew: function()
      {
        return 1/Math.sqrt(this._lambda);
      }
      
     /**
      * Assign a lambda for this distribution
      * 
      * @param value : Number - Lambda value, must be greater than zero
      * 
      * @return Nothing
      */
      , set_lambda: function(value)
      {
        this._lambda = !isNaN(value) && value > 0 ? parseFloat(value) : this._lambda;
      }
      
     /**
      * Compute the probability of a given number of events
      * 
      * @param x : Int - Event count
      * 
      * @return Number - P(X = x). 
      * 
      */
      , prob: function(_x)
      {
        if( isNaN(_x) )
          return 0;
        
        var x = Math.floor(_x);
        if( x < 0 )
          return 0;
        
        if( x > this._n )
          return 0;
        
        return Math.exp( -this._lambda + x*Math.log(this._lambda) - this.__gammaln(x+1.0) );
      }
      
     /**
      * Compute the probability of less than x events 
      * 
      * @param x : Int - Success count
      * 
      * @return Number - P(X < x).  Call prob() method with same argument and add result to compute P(X <= x).
      */
      , cdf: function(_x)
      {
        if( isNaN(_x) )
          return 0.0;
        
        var x = Math.floor(_x);
        if( x <= 0 )
          return 0.0;
        
        return this.__gammaq( -x, this._lambda );
      }
      
      // internal methods (Numerical Recipes)
      , __gammaq: function(a, x) 
      {
        if( Math.floor(a) >= 100 ) 
          return this.__gammapapprox(a,x,0);
        
        if( x < a+1.0 ) 
          return 1.0 - this.__gser(a,x);
        else 
          return this.__gcf(a,x);
      }
      
      , __gammapapprox: function( a, x, psig ) 
      {
        var a1     = a - 1.0;
        var lna1   = Math.log(a1);
        var sqrta1 = Math.sqrt(a1);
        var gln    = this.__gammaln(a);
        
        if( x > a1 ) 
          xu = Math.max(a1 + 11.5*sqrta1, x + 6.0*sqrta1);
        else 
          xu = Math.max(0.0, Math.min(a1 - 7.5*sqrta1, x - 5.0*sqrta1) );
        
        var j;
        var xu, t, ans;
        var sum = 0;
        
        for (j=0; j<18; j++) 
        {
          t    = x + (xu-x)*this.__y[j];
          sum += this.__w[j]*Math.exp(-(t-a1) + a1*(Math.log(t)-lna1));
        }
        
        var ans = sum*(xu-x)*Math.exp(a1*(lna1-1.0)-gln);
        
        return (psig ? (x > a1 ? 1.0-ans:-ans) : (x > a1 ? ans : 1.0+ans));
      }
      
      , __gser: function(a, x) 
      {
        var gln = this.__gammaln(a);
        var ap = a;
        var sum = 1.0/a;
        var del = sum;
        
        for (;;) 
        {
          ++ap;
          del *= x/ap;
          sum += del;
          
          if( Math.abs(del) < Math.abs(sum)*this.__epsilon ) 
            return sum*Math.exp(-x + a*Math.log(x) - gln);
        }
      }
      
      , __gcf: function(a, x) 
      {
        var gln = this.__gammaln(a);
        var b = x + 1.0 - a;
        var c = 1.0/this.__fpmin;
        var d = 1.0/b;
        var h = d;
        
        var i, del, an;
        
        for( i=1;;i++ ) 
        {
          an = -i*(i-a);
          b += 2.0;
          d  = an* d + b;
          
          if( Math.abs(d) < this.__fpmin) 
            d = this.__fpmin;
          
          c = b + an/c;
          
          if( Math.abs(c) < this.__fpmin) 
            c = this.__fpmin;
          
          d   = 1.0/d;
          del = d*c;
          h  *= del;
          
          if( Math.abs(del-1.0) <= this.__epsilon) 
            break;
        }
        
        return Math.exp(-x + a*Math.log(x) - gln)*h;
      }
      
      , __gammaln: function(_x)
      {
        var j;
        var y = _x;
        var x = _x;
          
        var tmp = x + 5.24218750000000000;
        tmp     = (x+0.5)*Math.log(tmp)-tmp;
        var s   = 0.999999999999997092;
        
        for( j=0; j<14; j++ ) 
          s += this.__c[j]/++y;
       
        return tmp + Math.log(2.5066282746310005*s/x);
      }
    }
  }
  
  return returnedModule;
});