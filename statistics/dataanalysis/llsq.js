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
   * Linear least squares analysis of x-y data
   * 
   * @author Jim Armstrong (www.algorithmist.net)
   * 
   * @version 1.0
   * 
   */
    this.LLSQ = function()
    {
      
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
   
    this.LLSQ.__name__ = true;
    this.LLSQ.prototype = 
    {
     /**
      * Perform a linear regression (least squares fit) without data on variance of individual sample y-coordinates
      * 
      * @param _x : Array - Array of x-coordinates (must have at least three data points)
      * 
      * @param _y : Array - Array of y-coordinates (must have at least three data points)
      * 
      * @return Object - Fit model is ax+b.  'm' parameter is the regression slope, 'b' parameter is the intercept.  'siga' parameter is the measure of uncertainty in the
      * a-parameter.  'sigb' is the measure of uncertainty in the b-parameter.  'chi2' is the chi-squared parameter for the fit.  'r' is the square (R^2) of the
      * correlation coefficient.  There is no error checking for performance reasons.
      * 
      * Reference: NRC
      */
      fit: function(_x, _y)
      {
        var n = _x.length;
        if( n < 3 )
          return { a:0, b:0, siga:0, sigb:0, r:0, chi2:0, r:0 };
          
        var a   = 0.0;
        var b   = 0.0;
        var s   = 0.0;
        var sx  = 0.0;
        var sy  = 0.0;
        var st2 = 0.0;
        var i, t, w;
        
        for( i=0; i<n; ++i) 
        {
          sx += _x[i];
          sy += _y[i];
        }
        
        var ss    = n;
        var sxoss = sx/ss;
        var ybar  = sy/ss;
        var st2;
        
        for( i=0; i<n; ++i) 
        {
          t    = _x[i] - sxoss;
          st2 += t*t;
          b   += t*_y[i];
        }
        
        b /= st2;
        a  = (sy-sx*b)/ss;
        
        var siga = Math.sqrt( (1.0 + sx*sx/(ss*st2))/ss );
        var sigb = Math.sqrt(1.0/st2);
        
        var chi2 = 0.0;
        for( i=0; i<n; ++i) 
        {
          w     = _y[i] - ybar;
          t     = _y[i] - a - b*_x[i];
          chi2 += t*t;
          s    += w*w;
        }
        
        if( n > 2 ) 
          sigdat = Math.sqrt( chi2/(n-2) );
        
        siga *= sigdat;
        sigb *= sigdat;
        
        var cov = -sx/st2;
        var r   = 1.0 - chi2/s;
        
        return { m:b, b:a, siga:siga, sigb:sigb, chi2:chi2, r:r };
      } 
    
     /**
      * Perform a linear regression (least squares fit) with data on variance of individual sample y-coordinates
      * 
      * @param _x : Array - Array of x-coordinates (must have at least three data points)
      * 
      * @param _y : Array - Array of y-coordinates (must have at least three data points)
      * 
      * @param _sig : Array - Array of std. dev estimates for the y-coordinates
      * 
      * @return Object - Fit model is ax+b.  'a' parameter is the regression slope, 'b' parameter is the intercept.  'siga' parameter is the measure of uncertainty in the
      * a-parameter.  'sigb' is the measure of uncertainty in the b-parameter.  'chi2' is the chi-squared parameter for the fit.  'q' parameter is the probability the chi2
      * estimate would be obtained by chance.  There is no error checking for performance reasons.
      */
      , fit_sig: function(_x, _y, _sig)
      {
        var n = _x.length;
        if( n < 3 )
          return { a:0, b:0, siga:0, sigb:0, chi2:0, q:0 };
         
        var a   = 0.0;
        var b   = 0.0;
        var sx  = 0.0;
        var sy  = 0.0;
        var st2 = 0.0;
        var i, t, wt;
       
        for( i=0; i<n; ++i) 
        {
          wt = 1.0/(_sig[i]*_sig[i]);
          ss += wt;
          sx += x[i]*wt;
          sy += y[i]*wt;
        }
       
        var ss    = n;
        var sxoss = sx/ss;
        var st2;
       
        for( i=0; i<n; ++i) 
        {
          t    = _x[i] - sxoss;
          st2 += t*t;
          b   += t*_y[i];
        }
       
        b /= st2;
        a  = (sy-sx*b)/ss;
       
        var siga = Math.sqrt( (1.0 + sx*sx/(ss*st2))/ss );
        var sigb = Math.sqrt(1.0/st2);
       
        var chi2 = 0.0;
        for( i=0; i<ndata; ++i) 
        {
          t     = (_y[i] - a - b*_x[i])/_sig[i];
          chi2 += t*t;
        }
        
        if( n > 2 ) 
          q = this.__gammaq(0.5*(n-2), 0.5*chi2 );
        
        var cov = -sx/st2;
        var r   = cov/(siga*sigb);
       
        return { m:b, b:a, siga:siga, sigb:sigb, chi2:chi2, r:r, q:q };
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