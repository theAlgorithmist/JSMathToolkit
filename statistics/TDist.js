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
   * Some basic functions for the student-t or t-distribution.  There is no need to compute t-scores as the class accepts raw data regarding sample and population.
   * 
   * @author Jim Armstrong (www.algorithmist.net)
   * 
   * @version 1.0
   * 
   */
    this.TDist = function()
    {
      this._u = 1;  // population mean
      this._s = 0;  // sample std. deviation
      this._n = 1;  // number of samples (n-1 degrees of freedom)
      
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
   
    this.TDist.__name__ = true;
    this.TDist.prototype = 
    {
     /**
      * Access the current sample size
      * 
      * @return Int - Current sample size
      */
      get_n: function()
      {
        return this._n; 
      }
      
     /**
      * Return the sample std. deviation
      * 
      * @return Number - Sample std. deviation
      */
      , get_sigma: function()
      {
        return this._s;
      }
      
     /**
      * Return the population mean
      * 
      * @return Number - Population mean
      */
      , get_population_mean: function()
      {
        return this._u;
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
        this._n = !isNaN(value) && value > 0 ? parseFloat(value) : this._n;
      }
      
     /**
      * Assign a sample std. deviation
      * 
      * @param value : Number - Sample std. deviation, must be greater than or equal to zero
      * 
      * @return Nothing
      */
      , set_sigma: function(value)
      {
        this._s = !isNaN(value) && value >= 0.0 ? parseFloat(value) : this._s;
      }  
    
     /**
      * Assign a population mean
      * 
      * @param value : Number - Population mean
      * 
      * @return Nothing
      */
      , set_population_mean: function(value)
      {
        this._u = !isNaN(value) ? parseFloat(value) : this._u;
      }
      
     /**
      * Compute PDF(x)
      * 
      * @param x : Number - Input number
      * 
      * @return Number - Student-T PDF(x). 
      * 
      */
      , prob: function(_x)
      {
        if( isNaN(_x) )
          return 0;
        
        var np  = 0.5*(this._n + 1.0);
        var fac = this.__gammaln(np) - this.__gammaln(0.5*this._n);
        var t   = (_x-this._u)/this._s;
        
        t *= t;
        return Math.exp(-np*Math.log(1.0 + t/this._n) + fac) / (Math.sqrt(3.14159265358979324*this._n)*this._s);
      }
      
     /**
      * Compute P(X <= x) 
      * 
      * @param x : Number - Test sample mean
      * 
      * @return Number - P(X <= x).  Call prob() method with same argument and add result to compute P(X <= x).
      */
      , cdf: function(_x)
      {
        if( isNaN(_x) )
          return 0.0;
        
        var t = (_x-this._u)/this._s;
        t *= t;
        
        var p = 0.5*this.__incompleteBeta( 0.5*this._n, 0.5, this._n/(this._n+t) );
        return _x >= this._u ? 1.0 - p : p;
      }
      
      // internal methods (Numerical Recipes)
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
    }
  }
  
  return returnedModule;
});