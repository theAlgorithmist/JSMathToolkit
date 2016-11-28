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

define(['../DataStats'], function (DataStatsModule) 
{
  var returnedModule = function () 
  {
    var dataStatsRef = new DataStatsModule();
    var __data       = new dataStatsRef.DataStats();
    
  /**
   * Various Student-t tests for comparable mean between two discreet data sets
   * 
   * @author Jim Armstrong (www.algorithmist.net)
   * 
   * @version 1.0
   * 
   */
    this.TTests = function()
    {
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
   
    this.TTests.__name__ = true;
    this.TTests.prototype = 
    {
     /**
      * Compute probability that two samples (drawn from populations with the same variance) have significantly different means
      * 
      * @param data1 - First data array of numbers
      * 
      * @param data2 - Second data array of numbers
      * 
      * @return Object - 't' property contains the Student-t score for the two samples.  The 'prob' property contains the probability in [0,1] that the samples
      * score |t| just by chance.  A low value indicates a higher significance of differing means for the samples
      */
      tTest: function(data1, data2)
      {
        var n1 = data1.length;
        var n2 = data2.length;
          
        var mean1 = __data.get_mean(data1);
        var var1  = __data.get_std(data1);
        var1 *= var1;
        
        var mean2 = __data.get_mean(data2);
        var var2  = __data.get_std(data2);
        var2 *= var2;
        
        var df   = n1 + n2 - 2;
        var svar = ((n1-1)*var1 + (n2-1)*var2) / df;
        var t    = (mean1-mean2) / sqrt(svar*(1.0/n1 + 1.0/n2));
          
        var prob = this__incompletebeta(0.5*df, 0.5, df/(df+t*t));
        
        return {t:t, prob:prob};
      }
    
     /**
      * Compute probability that two samples (drawn from populations with unequal variance) have significantly different means
      * 
      * @param data1 - First data array of numbers
      * 
      * @param data2 - Second data array of numbers
      * 
      * @return Object - 't' property contains the Student-t score for the two samples.  The 'prob' property contains the probability in [0,1] that the samples
      * score |t| just by chance.  A low value indicates a higher significance of differing means for the samples
      */
      , tuTest: function(data1, data2)
      {
        var n1 = data1.length;
        var n2 = data2.length;
         
        var mean1 = __data.get_mean(data1);
        var var1  = __data.get_std(data1);
        var1 *= var1;
       
        var mean2 = __data.get_mean(data2);
        var var2  = __data.get_std(data2);
        var2 *= var2;
       
        var t    = (mean1-mean2) / sqrt(var1/n1 + var2/n2);
        var z1   = var1/n1 + var2/n2;
        z1 *= z1;
        
        var z2 = var1/n1;
        z2 *= z2;
        
        var z3 = var2/n2;
        z3 *= z3;
        
        var df   = z1 / (z2/(n1-1) + z3/(n2-1) );
        var prob = this.__incompleteBeta(0.5*df, 0.5, df/(df + t*t));
        
        return {t:t, prob:prob};
      }
      
     /**
      * Compute probability that two paired samples have significantly different means
      * 
      * @param data1 - First data array of numbers
      * 
      * @param data2 - Second data array of numbers
      * 
      * @return Object - 't' property contains the Student-t score for the two samples.  The 'prob' property contains the probability in [0,1] that the samples
      * score |t| just by chance.  A low value indicates a higher significance of differing means for the samples
      */
      , tpTest: function(data1, data2)
      {
        var n = data1.length;
          
        var mean1 = __data.get_mean(data1);
        var var1  = __data.get_std(data1);
        var1 *= var1;
        
        var mean2 = __data.get_mean(data2);
        var var2  = __data.get_std(data2);
        var2 *= var2;
        
        var j;
        var cov = 0.0;
        
        for( j=0; j<n; ++j ) 
          cov += (data1[j]-mean1)*(data2[j]-mean2);
        
        var df = n-1;
        cov   /= df;
        
        var sd = sqrt( (var1+var2-2.0*cov)/n );
        var t  = (mean1-mean2)/sd;
        
        var prob = this.__incomplteBeta(0.5*df, 0.5, df/(df+t*t) );
         
        return {t:t, prob:prob};
      }
      
     /**
      * Compute probability that two samples have significantly different variances
      * 
      * @param data1 - First data array of numbers
      * 
      * @param data2 - Second data array of numbers
      * 
      * @return Object - 'f' property contains the f-score score for the two samples.  The 'prob' property contains the probability in [0,1] that the samples
      * that f-score by chance; small values indicate a higher probability of significantly different variance between the samples
      */
      , fTest: function(data1, data2)
      {
        var n1 = data1.length;
        var n2 = data2.length;
        
        var mean1 = __data.get_mean(data1);
        var var1  = __data.get_std(data1);
        var1 *= var1;
         
        var mean2 = __data.get_mean(data2);
        var var2  = __data.get_std(data2);
        var2 *= var2;
         
        var df1, df2;
        if( var1 > var2 ) 
        {
          f   = var1/var2;
          df1 = n1-1;
          df2 = n2-1;
        } 
        else 
        {
          f   = var2/var1;
          df1 = n2-1;
          df2 = n1-1;
        }
        
        prob = 2.0*this.__incomplteteBeta(0.5*df2, 0.5*df1, df2/(df2+df1*f) );
        prob = prob > 1.0 ? 2.0 - prob : prob;
        
        return {f:tf, prob:prob};
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