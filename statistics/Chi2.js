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
   * Some basic functions for the chi-squared distribution.
   * 
   * @author Jim Armstrong (www.algorithmist.net)
   * 
   * @version 1.0
   * 
   */
    this.Chi2 = function()
    {
      this._fac = 0.0;
      this._nu  = 1;
      
      // special functions are in-lined into the class for max. perf. - this may be re-architected in the future, though
      this.__eps     = 1.e-8;
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
   
    this.Chi2.__name__ = true;
    this.Chi2.prototype = 
    {
     /**
      * Assign the nu value or number of degrees of freedom
      * 
      * @param nu : Int - Number of degrees of freedom - must be integral and defaults to 1.0 on incorrect input
      * 
      * @return Nothing - This method MUST be called before any other methods
      */
      set_nu: function(nu)
      {
        var nu = isNaN(nu) || nu < 1 ? 1 : nu
        nu     = Math.floor(nu);
        
        this._nu  = nu;
        this._fac = 0.693147180559945309*(0.5*nu) + this.__gammaln(0.5*nu);
      }
    
     /**
      * Probability that an observed chi-square for a correct model is less than an input value
      * 
      * @param x2 : Number - Input value (greater than zero)
      * 
      * @return Number - Probability in [0,1]
      */
      , p: function(x2)
      {
        if( x2 <= 0.0 )
          return 0.0;
        
        return Math.exp( -0.5*(x2 - (this._nu - 2.0)*Math.log(x2)) - fac);
      }
      
     /**
      * Chi-square CDF
      * 
      * @param x2 : Number - Input value (greater than zero)
      * 
      * @return Number - CDF value.  0 returned on data error
      */
      , cdf: function(x2)
      {
        if( x2 <= 0.0 )
          return 0.0;
          
        return this.__gammp(this._nu/2, 0.5*x2);
      }
      
     /**
      * Chi-square q-value (often used in cross-table analysis)
      * 
      * @param x2 : Number - Input value (greater than zero)
      * 
      * @return Number - Probability in [0,1].  q = 1-p is the probability that the table relationships occur by chance.  -1 returned on data error
      */
      , q: function(x2)
      {
        if( x2 <= 0.0 )
          return -1.0;
         
        return 1.0 - this.__gammp(this._nu/2, 0.5*x2);
      }
      
     /**
      * Critical chi-square value or what must the chi-2 value be to support the supplied probability
      * 
      * @param p : Number - Probability in [0,1] - clamped to zero if out of range
      * 
      * @return Number - Critical chi-square value or inverse CDF
      */
      , invCDF: function(p)
      {
        p = isNaN(p) || (p<0.0 || p > 1.0) ? 0.0 : p;
        
        return 2.0*this.__invgammap(p, 0.5*this._nu);
      }
    
      // internal methods (Numerical Recipes - you don't think I do this from scratch, do you?) - no error testing; you break it, you buy it
      , __invgammp: function(p, a)
      {
        var j;
        var x, err, t, u, pp, lna1, afac;
        
        var a1 = a-1.0;
        var gln = this.__gammaln(a);

        // out-of-range p ignored for internal method (args checked in advance of call), but if you call outside of class, you're on your own
        if( a > 1.0 ) 
        {
          lna1 = Math.log(a1);
          afac = exp(a1*(lna1-1.)-gln);
          pp   = (p < 0.5) ? p : 1.0 - p;
          t    = Math.sqrt(-2.0*Math.log(pp));
          x    = (2.30753+t*0.27061) / (1.0 + t*(0.99229+t*0.04481)) - t;
          
          if( p < 0.5 ) 
            x = -x;
          
          x = Math.max(1.e-3, a*Math.pow(1.0 - 1.0/(9.*a) - x/(3.0*Math.sqrt(a)),3));
        } 
        else 
        {
          t = 1.0 - a*(0.253 + a*0.12);
          if (p < t) 
            x = Math. pow(p/t,1./a);
          else 
            x = 1.0 - Math.log(1.0-(p-t)/(1.0-t));
        }
        
        for( j=0; j<12; ++j) 
        {
          if( x <= 0.0 ) 
            return 0.0;
          
          err = this.__gammp(a,x) - p;
          
          if( a > 1.0 ) 
            t = afac*Math.exp(-(x-a1) + a1*(Math.log(x)-lna1));
          else 
            t = Math.exp(-x + a1*Math.log(x) - gln);
          
          u  = err/t;
          x -= (t = u/(1.-0.5*Math.min(1.0, u*((a-1.0)/x - 1))));
          if( x <= 0.0 ) 
            x = 0.5*(x + t);
          
          if(Math.abs(t) < this.__eps*x ) 
            break;
        }
        
        return x;
      }
      
      
      , __gammp: function(a, x) 
      {
        if( Math.abs(x) < 0.000000001 ) 
          return 0.0;
      
        if( Math.floor(a) >= 100 ) 
          return this.__gammpapprox(a,x,1);
      
        if( x < a+1.0 ) 
          return this.__gser(a,x);
        else 
          return 1.0 - this.__gcf(a,x);
      }
    
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