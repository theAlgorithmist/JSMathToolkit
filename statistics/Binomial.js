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

define(['./BinomialCoef'], function (BCModule) 
{
  var returnedModule = function () 
  {
    var coefRef = new BCModule();
    var __coef  = new coefRef.BinomialCoef();
    
  /**
   * Some basic functions for the binomial distribution.
   * 
   * @author Jim Armstrong (www.algorithmist.net)
   * 
   * @version 1.0
   * 
   */
    this.Binomial = function()
    {
      this._n = 1;
      this._p = 0.5;
      
      this.PI2  = Math.PI + Math.PI;
      
      this.__S0 = 1/12;
      this.__S1 = 1/360;
      this.__S2 = 1/1260;
      this.__S3 = 1/1680;
      this.__S4 = 1/1188;
      
      this.__epsilon = 2.220446049250313e-16;
      this.__fpmin   = Number.MIN_VALUE/2.220446049250313e-16;
      
      this.__sfe = [0, 
                    0.08106146679532758, 
                    0.04134069595440929,
                    0.02767792568499833,
                    0.02079067210376509,
                    0.01664469118982119,
                    0.01387612882307074,
                    0.01189670994589177,
                    0.01041126526197209,
                    0.00925546218271273,
                    0.00833056343336287,
                    0.00757367548795184,
                    0.00694284010720952,
                    0.00640899418800421,
                    0.00595137011275885,
                    0.00555473355196280
                   ];
      
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
   
    this.Binomial.__name__ = true;
    this.Binomial.prototype = 
    {
     /**
      * Access the current sample count
      * 
      * @return Int - Current sample count
      */
      get_n: function()
      {
        return this._n; 
      }
    
     /**
      * Access the current probability of a single success
      * 
      * @return Number - Current probability
      */
      , get_p: function()
      {
        return this._p;
      }
      
     /**
      * Return the mean of the current distribution
      * 
      * @return Number - Mean of current Binomial distribution (which also serves as the median. although some text take floor(np) or ceil(np) )
      */
      , get_mean: function()
      {
        return this._n * this._p;
      }
      
     /**
      * Return the standard deviation of this distribution
      * 
      * @return Number - standard deviation of the current Binomial distribution
      */
      , get_std: function()
      {
        return Math.sqrt( this._n*this._p*(1.0 - this._p) );
      }
      
     /**
      * Return the skewness of this distribution
      * 
      * @return Number - skewness of the current distribution
      */
      , get_skew: function()
      {
        return (1.0 - 2.0*this._p)/this.get_std();
      }
      
     /**
      * Assign a sample count for this distribution
      * 
      * @param value : Int - Sample count, must be greater than zero
      * 
      * @return Nothing
      */
      , set_n: function(value)
      {
        this._n = !isNaN(value) && value >= 0 ? parseInt(value) : this._n;
      }
      
     /**
      * Assign a probability to this distribution
      * 
      * @param value : Number - Probability value in [0,1].
      * 
      * @return Nothing
      */
      , set_p: function(value)
      {
        this._p = !isNaN(value) && value >= 0 ? parseFloat(value) : this._p;
        this._p = Math.max(this._p,0.0);
        this._p = Math.min(this._p,1.0);
      }
      
     /**
      * Return the binomial coefficient, (n,k)
      * 
      * @param k - k-value in [1,n]
      * 
      * @return Int - Binomial Coefficient (this can also be computed independently with the BinomialCoef class, but is included here for convenience).  Note that 
      * n is set in advance with the sample mutator function.
      */
      , get_coef: function(k)
      {
        if( isNaN(_k) )
          return 0;
        
        var k = Math.floor(k);
        k     = Math.max(1,k);
        k     = Math.min(k,this._n);
        
        return __coef.coef(this._n, k);
      }
      
     /**
      * Compute the probability of x successes in the current trial count
      * 
      * @param x : Int - Success count
      * 
      * @return Number - P(X = x), where n is the current sample count and p is the probability of a single success.  The algorithm should support relatively large sample values,
      * although at some point, consider a Normal :)
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
        
        // the algorithm is due to C. Loader.
        var lc;
        
        if( Math.abs(this._p) < 0.00001 )
          return x == 0 ? 1.0 : 0.0;
        
        if( Math.abs(this._p-1.0) < 0.00001 )
          return x == this._n ? 1.0 : 0.0;
        
        var p1 = 1.0 - this._p;
        var nx = this._n - x;
        if( x == 0 )
          return Math.exp( this._n*Math.log(p1) );
        
        if( x == this._n )
          return Math.exp( this._n*Math.log(this._p) );
        
        var lc = this.__stirlerr(this._n) - this.__stirlerr(x) - this.__stirlerr(nx) - this.__dev(x,this._n*this._p) - this.__dev(nx,this._n*p1);
        
        return Math.exp(lc)*Math.sqrt(this._n/(this.PI2*x*nx));
      }
      
     /**
      * Compute the probability of less than x successes in the current trial count
      * 
      * @param x : Int - Success count
      * 
      * @return Number - P(X < x), where n is the current sample count and p is the probability of a single success.  The algorithm should accommodate large sample counts,
      * although at some point, consider a Normal :)  A zero probability is returned for incorrect inputs.  Simply call prob() method with same argument and add result to
      * compute P(X <= x).
      */
      , cdf: function(_x)
      {
        if( isNaN(_x) )
          return 0.0;
        
        var x = Math.floor(_x);
        if( x <= 0 )
          return 0.0;
        
        if( x > this._n )
          return 1.0;
        
        // the algorithm uses the well-known relationship between the Binomial CDF and the incomplete beta function
        return 1.0 - this.__incompleteBeta( x, this._n-x+1.0, this._p );
      }
      
      // internal methods (many are from Numerical Recipes)
      , __incompleteBeta: function(a, b, x)
      {
        if( x == 0.0 || x == 1.0 ) 
          return x;
        
        if( a > 3000 && b > 3000 ) 
          return this.__betaiapprox(a,b,x);
        
        var bt = Math.exp( this.__gammaln(a+b) - this.__gammaln(a) - this.__gammaln(b) + a*Math.log(x) + b*Math.log(1.0-x) );
        
        if( x < (a+1.0)/(a+b+2.0) ) 
          return bt * this.__betacf(a,b,x)/a;
        else 
          return 1.0-bt * this.__betacf(b,a,1.0-x)/b;
      }

      , __betacf: function(a, b, x)
      {
        var qab = a+b;
        var qap = a+1.0;
        var qam = a-1.0;
        var c = 1.0;
        var d = 1.0 - qab*x/qap;
        
        if( Math.abs(d) < this.__fpmin ) 
          d = this.__fpmin;
        
        d     = 1.0/d;
        var h = d;
        var m, m2, del, dc, aa;
        
        for( m=1; m<10000; m++ ) 
        {
          m2 = m+m;
          aa = m*(b-m)*x / ( (qam+m2)*(a+m2) );
          d  = 1.0 + aa*d;
          
          if(Math.abs(d) < this.__fpmin) 
            d = this.__fpmin;
          
          c = 1.0 + aa/c;
          if( Math.abs(c) < this.__fpmin) 
            c = this.__fpmin;
          
          d  = 1.0/d;
          h *= d*c;
          aa = -(a+m)*(qab+m)*x / ( (a+m2)*(qap+m2) );
          d  = 1.0 + aa*d;
          
          if( Math.abs(d) < this.__fpmin) 
            d = this.__fpmin;
          
          c = 1.0 + aa/c;
          if(Math.abs(c) < this.__fpmin) 
            c = this.__fpmin;
          
          d   = 1.0/d;
          del = d*c;
          h  *= del;
          
          if( Math.abs(del-1.0) <= this.__epsilon ) 
            break;
        }
        
        return h;
      }
      
      , __betaiapprox: function(a, b, x)
      {
        var j;
        var xu, t;
        
        var a1    = a - 1.0;
        var b1    = b - 1.0;
        var ab    = a + b;
        var abSq  = ab*ab;
        var mu    = a/ab;
        var lnmu  = Math.log(mu);
        var lnmuc = Math.log(1.0 - mu);
        var t     = Math.sqrt(a*b/(abSq*(ab + 1.0)));
          
        if( x > a/ab ) 
        {
          if( x >= 1.0 ) 
            return 1.0;
          
          xu = Math.min(1.0, Math.max(mu + 10.0*t, x + 5.0*t));
        } 
        else 
        {
          if( x <= 0.0 ) 
            return 0.0;
          
          xu = Math.max(0.0, Math.min(mu - 10.0*t, x - 5.0*t));
        }
        
        var sum = 0;
        for( j=0; j<18; j++ ) 
        {
          t    = x + (xu-x)*this.__y[j];
          sum += this.__w[j]*Math.exp(a1*(Math.log(t)-lnmu) + b1*(Math.log(1-t)-lnmuc));
        }
          
        var ans = sum*(xu-x)*Math.exp( a1*lnmu-this.__gammaln(a) + b1*lnmuc - this.__gammaln(b) + this.__gammaln(ab) );
          
        return ans > 0.0 ? 1.0-ans : -ans;
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
      
      , __stirlerr: function(n)
      {
        if( n < 16 )
          return this.__sfe[n];
        
        var nSq = n*n;
        if( n > 500 )
          return ( (this.__S0 - this.__S1/nSq) / n );
        
        if( n > 80 )
          return ( (this.__S0 - (this.__S1-this.__S2/nSq) / nSq) / n );
        
        if( n > 35 )
          return ( (this.__S0 - (this.__S1-(this.__S2-this.__S3/nSq) / nSq) / nSq ) / n );
        
        return ( (this.__S0 - (this.__S1-(this.__S2-(this.__S3 - this.__S4/nSq) / nSq ) / nSq) / nSq ) / n );
      }
      
      , __dev: function(x, np)
      {
        var j;
        var s, s1, v;
        var ej;
        
        var xmnp = x - np;
        var xpnp = x + np;
        if( Math.abs(xmnp) < 0.1*xpnp )
        {
          s  = xmnp*xmnp/xpnp;
          v  = xmnp/xpnp;
          ej = 2*x*v;
          j  = 1;
          
          while( true )
          {
            ej *= v*v;
            s1 = s + ej/(2*j+1);
            
            if( Math.abs((s1-s)/s) < 0.01 )
              return s1;
            
            s = s1;
            j++;
          }
        }
        
        return x*Math.log(x/np) + np - x;
      }
    }
  }
  
  return returnedModule;
});