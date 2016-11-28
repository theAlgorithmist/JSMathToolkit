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

define(['../../math/Matrix', '../DataStats'], function (MatrixModule, DataStatsModule) 
{
  var returnedModule = function () 
  {
    var matrixRef = new MatrixModule();
    var __matrix  = new matrixRef.Matrix();
    
    var dataRef = new DataStatsModule();
    var __data  = new dataRef.DataStats();
    
  /**
   * General polynomial least squares analysis of x-y data, suitable for very small-order polynomials and well-behaved data (i.e. normal equations are applicable
   * without potential numerical issues) - when SVD is added to the matrix tools, a version of PLLSQ will be made available that takes advantage of that capability
   * for more general-purpose applications.
   * 
   * @author Jim Armstrong (www.algorithmist.net)
   * 
   * @version 1.0
   * 
   */
    this.PLLSQ = function()
    {
      this._c = []; 
    }
   
    this.PLLSQ.__name__ = true;
    this.PLLSQ.prototype = 
    {
     /**
      * Perform a linear regression (least squares fit) using a polynomial of the specified order 
      * 
      * @param _x : Array - Array of x-coordinates (n data points)
      * 
      * @param _y : Array - Array of y-coordinates (n data points)
      * 
      * @param _m : Int - Order of polynomial (4 or lower is strongly recommended) and n > m (defaults to 1 for invalid inputs)
      * 
      * @return Object - Fit model is c0 + c1*x + c2*x^2 + ... c(m-1)*x^m-1 - 'coef' property contains the array of polynomial coefficients.  'r' property contains the
      * r-squared or square of corr. coefficient value.  'rms' is the square root of the average squared error between the LS estimator and the actual y-values (i.e. RMS error).
      * 
      */
      fit: function(_x, _y, _m)
      {
        var n = _x.length;
        var m = isNaN(_m) || _m < 1 ? 1 : _m+1;
        
        if( n <= m )
          return { coef:[] };
          
        // coefficient matrix
        var a = [];
        var i, j;
        for( i=0; i<m; ++i )
          a[i] = [];
        
        // summations
        var asums = [];
        var b     = [];
        var len   = 2*(m-1);
        
        asums[0] = n;
        for( i=1; i<=len; ++i )
          asums[i] = 0.0;
        
        for( i=0; i<m; ++i )
          b[i] = 0.0;
        
        var xj, yj, tmp;
        for( j=0; j<n; ++j )
        {
          xj      = _x[j];
          yj      = _y[j];
          tmp     = [];
          tmp[1]  = xj;
          b[0]   += yj;
          
          for( i=2; i<=len; ++i )
            tmp[i] = tmp[i-1]*xj;
          
          for( i=1; i<=len; ++i )
          {
            asums[i] += tmp[i];
            
            if( i < m )
              b[i] += tmp[i]*yj;
          }
        }
        
        // now, assemble the matrix - technically symmetric (and probably positive-definite), but currently assembled as a general matrix since order is expected 
        // to be very small
        var start = 0;
        var row;
        for( i=0; i<m; ++i )
        {
          row = a[i];
          for( j=0; j<m; ++j )
            row[j] = asums[start+j];
          
          start++;
        }
        
        // Solve Ac = b for the coefficient vector, c
        __matrix.fromArray(a);
        this._c = __matrix.solve(b);
        this._n = _m;
        
        // r-squared
        __data.set_data(_y);
        var mean = __data.get_mean();
        var s    = 0.0;
        var sr   = 0.0;
        var t;
        
        for( i=0; i<n; ++i)
        {
          t  = _y[i] - mean;
          s += t*t;
          
          t   = this.eval(_x[i]) - mean;
          sr += t*t;
        }
        
        return { coef:this._c, r:1.0-sr/s, rms:Math.sqrt(sr)/n };
      }
    
     /**
      * Evaluate the LS polynomial at an input value
      * 
      * @param x : Number - x-coordinate at which the polynomial is to be evaluated
      * 
      * @return Number - LS polynomial evaluated at the specified x-coordinate, or zero if the fit method is not called before the evaluate method.
      */
      , eval: function(x)
      {
        if( this._c.length == 0 )
          return 0.0;
       
        var n   = this._c.length;
        var i   = 0;
        var val = this._c[n-1];
       
        for( i=n-2; i>=0; i--)
          val = x*val + this._c[i];
       
        return val;
      }
    }
  }
  
  return returnedModule;
});