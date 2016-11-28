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
   * Some basic statistics on a linear collection of numerical data.  Assign a data set and then query various statistical measures across it.  Invalidation
   * is used for most popular statistics to ensure that only the required computations are performed on a JIT basis.  The algorithms used in each method are 
   * designed around the needs of educational and business applications, i.e. the data sets are not very large and inefficiency such as O(n) + O(n log n) can 
   * be tolerated. A stats class for large data sets may be created in the future if there is sufficient demand.  Note that the computations may be less
   * efficient than a texbook formula in order to protect against loss of significance and issues with large numbers.  This is particularly the case with
   * variance and covariance.
   * 
   * @author Jim Armstrong (www.algorithmist.net)
   * 
   * @version 1.0
   * 
   */
    this.DataStats = function()
    {
      this._data   = [0];
      this._mean   = 0;
      this._std    = 0;
      this._median = 0;
      this._mode   = 0;
      this._min    = 0;
      this._max    = 0;
      
      this._minInvalidated    = true;
      this._maxInvalidated    = true;
      this._meanInvalidated   = true;
      this._stdInvalidated    = true;
      this._medianInvalidated = true;
      this._modeInvalidated   = true;
    }
   
    this.DataStats.__name__ = true;
    this.DataStats.prototype = 
    {
     /**
      * Is the integer value even or odd?
      * 
      * @param n : Int - Integer value (must be integral)
      * 
      * @return Boolean - True if n is even and false if odd
      */
      isEven: function(n)
      {
        return (n & 1) == 0;
      }
    
     /**
      * Assign a data set for analysis
      * 
      * @param data : Array - Array of numerical values
      * 
      * @return Nothing
      */
      , set_data: function(data)
      {
        if( !data || data.length == 0 )
          return;
        
        this._data = data.slice();
        
        this._minInvalidated    = true;
        this._maxInvalidated    = true;
        this._meanInvalidated   = true;
        this._stdInvalidated    = true;
        this._medianInvalidated = true;
        this._modeInvalidated   = true;
      }
      
     /**
      * Return the minimum value of this data set
      * 
      * @return Number - min-value of data set
      */
      , get_min()
      {
        var n = this._data.length;
        if ( n == 0 )
          return 0;
        
        if( this._minInvalidated )
        {
          var min = Number.MAX_VALUE;
          var i;
          for( i=0; i<n; ++i )
          {
            if( this._data[i] < min )
              min = this._data[i];
          }
          
          this._min = min;
        }
        
        return this._min;
      }
      
     /**
      * Return the maximum value of this data set
      * 
      * @return Number - max-value of data set
      */
      , get_max()
      {
        var n = this._data.length;
        if ( n == 0 )
          return 0;
         
        if( this._maxInvalidated )
        {
          var max = Number.MIN_VALUE;
          var i;
          for( i=0; i<n; ++i )
          {
            if( this._data[i] > max )
              max = this._data[i];
          }
          
          this._max = max;
        }
         
        return this._max;
      }
      
     /**
      * Return the five-number summary of numeric data based on quartiles
      * 
      * @return Array - First element contains the min. number, second element contains the first quartile, third element contains the median, fourth point contains the 
      * third quartile, and the final point contains the max. number.  An empty array is returned if data is invalid.
      * 
      * The algorithm used is as follows: The median is computed and if it is a datum (not an average of two middle values), then the medium divides the data set into
      * lower and upper halves and is included in each half.  The lower quartile is the median of the lower data set and the upper quartile is the median of the upper
      * data set.
      */
      , get_fiveNumbers: function()
      {
        var n = this._data.length;
        if( n == 0 )
          return [];
        
        if( n == 1 )
          return [ this._data[0], this._data[0], this._data[0], this._data[0], this._data[0] ];
        
        // sort data in ascending order
        var data = this._data.slice();
        data.sort(function(a, b){return a-b});

        var dataMin = data[0];
        var dataMax = data[n-1];
        var lower   = [];
        var upper   = [];
        
        var m, dataMed;
        if( this.isEven(n) )
        {
          m = n/2 - 1;
          dataMed = 0.5*(data[m] + data[m+1]);
          lower   = data.slice(0,m+1);
          upper   = data.slice(m+1,n);
        }
        else
        {
          m       = (n+1)/2 - 1;
          dataMed = data[m];
          lower   = data.slice(0,m);
          upper   = data.slice(m+1,n);
          
          lower.push(dataMed);
          upper.unshift(dataMed);
        }
        
        // data is already sorted, so in-line the next two median computations
        n = lower.length;
        var lowerQuartile, upperQuartile;
        
        if( this.isEven(n) )
        {
          m = n/2 - 1;
          lowerQuartile = 0.5*(lower[m] + lower[m+1]);
        }
        else
        {
          m = (n+1)/2 - 1;
          lowerQuartile = lower[m];
        }
        
        n = upper.length;
        if( this.isEven(n) )
        {
          m = n/2 - 1;
          upperQuartile = 0.5*(upper[m] + upper[m+1]);
        }
        else
        {
          m = (n+1)/2 - 1;
          upperQuartile = upper[m];
        }
        
        return [dataMin, lowerQuartile, dataMed, upperQuartile, dataMax];
      }
      
     /**
      * Return fences (lower/upper ranges) for the current data based on inter-quartile range for use in simple outlier detection
      * 
      * @return Object - 'lower' and 'upper' properties for lower/upper fence values
      */
      , get_fences: function()
      {
        var num = this.get_fiveNumbers();
        var q1  = num[1];
        var q3  = num[3];
        var iqr = q3 - q1;
        
        return { lower:q1-1.5*iqr, upper:q3+1.5*iqr }
      }
      
     /**
      * Return the quantiles associated with the specified fraction
      * 
      * @param p : Number - Number in (0,1) indicating the quantile, i.e. 0.1 for deciles, 0.25 for quartiles.
      * 
      * @return Array - List of quantiles based on linear interpolation (note that result for quartiles may be different from that in the five-number summary due to a 
      * different algorithm).  Quartiles are returned if the input is undefined or out of range and an empty array is returned there is insufficient data in the array to
      * define the necessary quantiles.  The min value is always the first element and the max value is always the last element.  So, five values are returned in the
      * event of p = 0.25 and 12 values are returned in the case of p = 0.1 .
      */
      , get_quantile: function(_p)
      {
        var p = isNaN(_p) || _p < 0.01 || _p > 0.99 ? 0.25 : _p;
        
        var n      = this._data.length;
        var nQuant = Math.floor(1/p) ;
        if( n < 2 )
          return [];
        
        // fractions based on number of data points
        var f  = [0.0];
        var n1 = 1.0/(n-1);
        var i;
        for( i=1; i<n-1; ++i )
          f[i] = f[i-1] + n1;
        
        f.push(1.0);
        
        var quantiles = [];
        var data      = this._data.slice();
        data.sort( function(a, b){return a-b} );
        
        quantiles.push( data[0] );
        
        // have to compute nQuant-1 values, then add the max. value at the end
        n1    = n-1;
        var q = 0.0;
        var r, t, interp;
        for( i=0; i<nQuant-1; ++i )
        {
          // current quantile
          q += p;
          
          // lower index at that quantile
          r = Math.floor(q*n1); 
          
          if( Math.abs(f[r]-q) < 0.001 )
            quantiles.push( data[r] );
          else
          {
            // compute t in (0,1) as parameter along f
            t = (q-f[r])/(f[r+1]-f[r]);
            
            // linearly interpolate to get the required value 
            interp = (1.0-t)*data[r] + t*data[r+1];
            
            quantiles.push(interp);
          }
        }
        
        quantiles.push( data[data.length-1] );
        
        return quantiles;
      }
      
     /**
      * Compute the arithmetic mean of the supplied data set
      * 
      * @return Number - Mean of the data set - call set_data() to assign a data set or re-query a previously-computed mean value
      */
      , get_mean: function()
      {
        if( this._meanInvalidated )
        {
          var s = this._data[0];
          var n = this._data.length;
          if( n == 0 )
            return 0;
          
          var i;
          for( i=1; i<n; ++i )
            s += this._data[i];
          
          this._mean = s/n;
          this._meanInvalidated = false;
        }
        
        return this._mean;
      }
      
     /**
      * Compute the geometric mean of the supplied data set
      * 
      * @return Number - Geometric mean of the data set; this is an infrequent computation, so invalidation is not used.  May return NaN if the product of data elements
      * is negative (not typical for any practical application).
      */
      , get_geo_mean: function()
      {
        var s = this._data[0];
        var n = this._data.length;
        if( n == 0 )
          return 0;
           
        var i;
        for( i=1; i<n; ++i )
          s *= this._data[i];
           
        return Math.pow(s, 1/n);
      }
       
     /**
      * Compute the harmonic mean of the supplied data set
      * 
      * @return Number - Harmonic mean of the data set; this is an infrequent computation, so invalidation is not used.  
      */
      , get_harmonic_mean: function()
      {
        var n = this._data.length;
        if( n == 0 )
          return 0;

        var s = Math.abs(this._data[0] > 0.000000001 ) ? 1/this._data[0] : 0;
        var r;
        var i;
        for( i=1; i<n; ++i )
        {
          r  = Math.abs(this._data[i] > 0.000000001 ) ? 1/this._data[i] : 0;
          s += r;
        }
        
        return n/s;
      }
      
     /**
      * Compute the standard deviation of the supplied data set
      * 
      * @return Number - Standard deviation of the data set - call set_data() to assign a data set or re-query a previously-computed std. dev. value.
      * Note that Welford's method is used for superior numerical stability at the cost of less computational efficiency.
      */
      , get_std: function()
      {
        if( this._stdInvalidated )
        {
          var n = this._data.length;
          if( n == 1 )
            return 0;
          
          // Welford's method - has more divides, but is more numerically stable
          var i;
          var m_old = 0;
          var m     = 0;
          var s     = 0;
          var d;
          for( i=0; i<n; ++i )
          {
            m_old = m;
            d     = (this._data[i] - m_old);
            m     = m + d/(i+1);
            s     = s + (this._data[i] - m)*d;
          }
          
          this._std = Math.sqrt( s/(n-1) );
          this._stdInvalidated = false;
        }
        
        return this._std;
      }
      
     /**
      * Compute the coefficient of variation of the supplied data set
      * 
      * @return Number - CV of the data set
      */
      , get_cv: function()
      {
        var s = this.get_std();
        var m = this.get_mean();
        
        return (s/m)*100;
      }
      
     /**
      * Compute the median of the supplied data set
      * 
      * @return Number - Median value of the data set
      */
      , get_median: function()
      {
        if( this._medianInvalidated )
        {
          var n = this._data.length;
          if( n == 0 )
            return 0;
        
          var tmp = this._data.slice();
          
          // force sort in ascending order - avoid the default lexicographic (string) sort
          tmp.sort( function(a, b){return a-b} );
        
          var m;
          if( this.isEven(n) )
          {
            m = n/2 - 1;
            this._median = 0.5*(tmp[m] + tmp[m+1]);
          }
          else
          {
            m = (n+1)/2 - 1;
            this._median = tmp[m];
          }
          
          this._medianInvalidated = false;
        }
        
        return this._median;
      }
      
     /**
      * Compute the mode of the supplied data set
      * 
      * @return Number - Mode of the data set
      */
      , get_mode: function()
      {
        if( this._modeInvalidated )
        {
          var n = this._data.length
          if( n == 0 )
            return 0;
         
          var hash = {};
          var i = 0;
          var x = "";
          for( i=0; i<n; ++i)
          {
            x = this._data[i].toString();
            if( hash[x] )
              hash[x]++;
            else
              hash[x] = 1;
          }
          
          var count = -1;
          for( value in hash )
          {
            if( hash[value] > count )
            {
              count        = hash[value];
              this._mode = value;
            }
          }
          
          this._modeInvalidated = false;
        }
         
        return this._mode;
      }
      
     /**
      * Compute the confidence limits on a data set given a confidence factor
      * 
      * @param t : Number - Confidence factor in (0,1), i.e. 95% confidence is t = 0.95.  The classic 90% confidence interval is t = .9.
      * 
      * @return Object - 'l' and 'r' properties contain the left and right confidence intervals at the specified confidence level.
      */
      , get_confInterval: function(_t)
      {
        var t = isNaN(t) ? .9 : _t;
        t     = Math.max(0.01,t);
        t     = Math.min(t, 0.99);
        
        if( this._data.length == 0 )
          return { l:0, r:0 };
          
        var s = this.get_std();
        var u = this.get_mean();
        var d = t*s/Math.sqrt(n);
        
        return {l:u-d, r:u+d};
      }
      
     /**
      * Return the skewness of the supplied data set
      * 
      * @return Number - Sample skewness (adjusted from population skewness estimate)
      */
      , get_skewness: function()
      {
        var n = this._data.length;
        if ( n < 3 )
          return 0;
        
        var mult = Math.sqrt( n*(n-1) )/(n-2);
        var u    = this.get_mean();
        var s    = this.get_std();
        
        var s1 = 0;
        var i, z;
        for( i=0; i<n; ++i )
        {
          z   = this._data[i] - u;
          s1 += z*z*z;
        }
        
        var skew = (s1/n) / (s*s*s);
        return mult*skew;
      }
      
     /**
      * Return the kurtosis of the supplied data set
      * 
      * @return Number - Sample excess kurtosis
      */
      , get_kurtosis: function()
      {
        var n = this._data.length;
        if ( n < 4 )
          return 0;
         
        var u  = this.get_mean();
        var s  = this.get_std();
        var s1 = 0;
        var i, z;
        
        for( i=0; i<n; ++i )
        {
          z   = this._data[i] - u;
          s1 += z*z*z*z;
        }
        
        var n1 = n-1;
        var n2 = n-2;
        var n3 = n-3;
        var a = ( (n*(n+1)*s1) ) / ( n1*n2*n3*s*s*s*s );
        var b = 3*n1*n1/(n2*n3);
        
        return a-b;
      }
     
     /**
      * Return the covariance of two numerical data sets
      * 
      * @param A : Array - First data set (n samples)
      * 
      * @param B : Array - Second data set (n samples)
      * 
      * @return Number - Cov(A,B) or zero if inputs are invalid
      */
      , covariance: function(x, y)
      {
        if( !x || !y )
          return 0.0;
        
        var n = x.length;
        if( n < 2 || n != y.length )
          return 0.0;
        
        this.set_data(x);
        var xmean = this.get_mean();
        
        this.set_data(y);
        var ymean = this.get_mean();
        
        var i;
        var xs = 0.0;
        var ys = 0.0;
        var s  = 0.0;
        
        for( i=0; i<n; ++i )
        {
          xs = x[i]-xmean;
          ys = y[i]-ymean;
          s += xs*ys;
        }
        
        return s/(n-1.0);
      }
      
     /**
      * Return the Pearson correlation coefficient of two numerical data sets
      * 
      * @param A : Array - First data set (n samples)
      * 
      * @param B : Array - Second data set (n samples)
      * 
      * @return Number - Pearson correlation coefficient, r,  or zero if inputs are invalid
      */
      , correlation: function(x, y)
      {
        if( !x || !y )
          return 0.0;
         
        var n = x.length;
        if( n < 2 || n != y.length )
          return 0.0;
         
        this.set_data(x);
        var xs = 1.0/this.get_std();
         
        this.set_data(y);
        var ys = 1.0/this.get_std();
         
        return this.covariance(x,y)*xs*ys;
      }
    }  
  }
  
  return returnedModule;
});