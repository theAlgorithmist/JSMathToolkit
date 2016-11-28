

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
    * Generate binomial coefficients, either individually or as a single row in Pascal's triangle.  Methods in this class were designed to work best in applications
    * where successive coefficients are generated either in the same row or moving row to row (forward or backward).
    *
    * @author Jim Armstrong
    *
    * @version 1.0
    */
    this.BinomialCoef = function()
    {
      // row 1 = [1]
      this.__row = [1, 2];                // currently generated row (nonsymmetric portion)
      this.__n   = 2;                     // row number or 'n' in binomial coefficient (n k)
    }
    
    this.BinomialCoef.__name__ = true;
    this.BinomialCoef.prototype = 
    {
     /**
      * Generate the binomial coefficient (n k)
      *
      * @param n : Int - n items
      * @param k : Int - taken k at a time
      *
      * @return Int: Binomial coefficient (n k)
      */
      coef: function(n, k)   
      {
        if( n < 0 || k < 0 )
          return 0;
        
        if( k > n )
          return 0;
        else if( k == n )
          return 1;
        
        if( this.__n != n )
          this.__recurse(n);

        var j = this.__n % 2;
        var e = (this.__n+2-j)/2;

        return (k >= e) ? this.__row[n-k] : this.__row[k];
      }

     /**
      * Return the n-th full row of Pascal's triangle
      *
      * @param n:uint - Index of desired row (beginning at zero)
      *
      * @return Array: Full n-th row of Pascal's triangle
      *
      */
      , getRow: function(n)  
      { 
        switch(n)
        {
          case 0:
            return [1];
          break;

          case 1:
            return [1,1];
          break;

          case 2:
            return [1,2,1];
          break;

          default:
            var newRow = ( n == this.__n ) ? this.__fillOut() : this.__recurse(n);
            return newRow;
          break;
        }
      }

      // internal method - fill out nonsymmetric portion of current row & return reference to full array
      , __fillOut: function()
      {
        var i;
        var j   = this.__n % 2;
        var e   = (this.__n+2-j)/2;
        var arr = this.__row.slice(0,e+1);

        if( j == 0 )
        {
          for( i=0; i<e-1; ++i )
            arr[e+i] = arr[e-i-2];
        }
        else
        {
          for( i=0; i<e; ++i )
            arr[e+i] = arr[e-i-1];
        }

        return arr;
      }

      // internal method - recursively generate desired row from the current row
      , __recurse: function(r)
      {
        // forward or reverse?
        if( r > this.__n )
          this.__forward(r);
        else
        {
          if( (r-2) <= (this.__n-r) )
          {
            // reset and move forward
            this.__row[1] = 2;
            this.__n      = 2;
            this.__forward(r);
         }
         else
           this.__reverse(r); // recurse backward
        }

        this.__n = r;
      
        return this.__fillOut(); 
      }

      // private method - recurse forward
      , __forward: function(r)
      {
        var i, j, k, e, h;
        for( i=this.__n+1; i<=r; ++i )
        {
          // how many elements in the nonsymmetric portion of the current row?
          j = i % 2;
          e = (i+2-j)/2;
          h = this.__row[0];

          if( j == 1 ) 
          {  
            for( k=1; k<e; ++k )
            {
              var val       = this.__row[k] + h;
              h             = this.__row[k];
              this.__row[k] = val;
            }
          }
          else
          {
            for( k=1; k<e-1; ++k )
            {
              val           = this.__row[k] + h;
              h             = this.__row[k];
              this.__row[k] = val;
            }
            
            this.__row[e-1] = 2*h;
          }
        }
      }

      // private method - recurse backwards
      , __reverse: function(r)
      {
        var i, j, k, e;
        for( i=this.__n-1; i>=r; i-- )
        {
          // how many elements in the nonsymmetric portion of the current row?
          var j = i % 2;
          var e = (i+2-j)/2;

          for( k=1; k<e; ++k )
            this.__row[k] = this.__row[k] - this.__row[k-1];
        }
      }
    }
  }
  
  return returnedModule;
});