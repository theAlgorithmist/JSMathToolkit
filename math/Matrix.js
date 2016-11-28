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
    * A simple matrix class for dealing with dense 2D matrices containing numerical data and of modest size (for typical online and device-based applications).  Note that
    * on construction, the matrix is 0 x 0 and data is undefined.  Add or delete rows to fill the matrix, in which case the column count is determined by the maximum row 
    * array length.  If you attempt an operation that access any row beyond bounds, that data will be undefined.  The caller is responsible for maintaining proper length in 
    * each input row array.
    * 
    * @author Jim Armstrong
    * 
    * @version 1.0
    */
    this.Matrix = function()
    {
      this._n      = 0;       // column count
	    this._matrix = [];      // internal reference to array of row arrays
	    this._indx   = [];      // store pivot indices in an array 
    }
    
    this.Matrix.__name__ = true;
    this.Matrix.prototype = 
    {
     /**
      * Overwrite the current matrix with an array (of arrays)
      * 
      * @param matrix : Array of arrays containing a completely new matrix that will overwrite the current matrix
      * 
      * @return Nothing
      */
      fromArray: function(matrix)
      {
        this._matrix.length = 0;
        var n = matrix.length;
        var i;
        
        for( i=0; i<n; ++i )
          this.appendRow( matrix[i] );
      }
    
     /**
      * Access the current row count
      * 
      * @return Int - Row count
      */
      , get_m: function()
      {
        return this._matrix.length;
      }
    
     /**
      * Access the current column count
      * 
      * @return Int - Column count
      */
      , get_n: function()
      {
        return this._n;
      }
      
     /**
      * Access a row of the matrix
      * 
      * @param index : Int - Row index of the matrix
      * 
      * @return Array - A copy of the requested row of the matrix or an empty array if the index is out of range
      */
      , get_row: function(index)
      {
        if( index >= 0 && index < this._matrix.length )
          return this._matrix[index].slice();
        else
          return [];
      }
      
     /**
      * Access a column of the matrix
      * 
      * @param index : Int - Column index of the matrix
      * 
      * @return Array - A copy of the requested column of the matrix or an empty array if the index is out of range
      */
      , get_column: function(index)
      {
        var arr = [];
        var i, row;
        var m = this._matrix.length;
        
        if( index >= 0 && index < this._n )
        {
          for( i=0; i<m; ++i )
          {
            row = this._matrix[i];
            arr.push( row[index] );
          }
        }
        
        return arr;
      }
      
     /**
      * Clear the current matrix and prepare it to accept new data
      * 
      * @return Nothing
      */
      , clear: function()
      {
        this._matrix.length = 0;
        this._n             = 0;
      }
      
     /**
      * Add a row to the top of the matrix
      * 
      * @param row : Array - Row array
      * 
      * @return Nothing - The row is added at the top of the matrix.  It is the caller's responsibility for data intergrity, including consistent column count 
      * for each row added to the matrix
      */
      , addRow: function(row)
      {
        if( row )
        {
          this._matrix.splice(0, 0, row);
          
          this._n = Math.max( this._n, row.length );
        }
      }
      
     /**
      * Append a row to the matrix
      * 
      * @param row : Array - Row array
      * 
      * @return Nothing - The row is added to the bottom of the matrix.  It is the caller's responsibility for data intergrity, including consistent column count 
      * for each row added to the matrix
      */
      , appendRow: function(row)
      {
        if( row )
        {
          this._matrix.push( row );
          
          this._n = Math.max( this._n, row.length );
        }
      }

     /**
      * Insert a row into the matrix
      * 
      * @param index : Int - Row index (zero-based), which must be between zero and the current row count minus one.
      * 
      * @param row : Array - Row Array
      * 
      * @return Nothing - The row is added to the bottom of the matrix.  It is the caller's responsibility for data intergrity, including consistent column count 
      * for each row added to the matrix
      */
      , insertRow: function(index, row)
      {
        if( index >= 0 && index < this._matrix.length )
        {
          if( row )
          {
            this._matrix.splice( index, 0, row );
            
            this._n = Math.max( this.n, row.length );
          }
        }
      }
      
     /**
      * Remove the first row of the matrix
      * 
      * @return Nothing - The first row of the matrix is removed.
      */
      , removeFirst: function()
      {
        if( this._matrix.length > 0 )
          this._matrix.shift();
      }
      
     /**
      * Remove the last row of the matrix
      * 
      * @return Nothing - The last row of the matrix is removed.
      */
      , removeLast: function()
      {
        if( this._matrix.length > 0 )
          this._matrix.pop();
      }
      
     /**
      * Delete a row from an arbitrary index in the matrix
      * 
      * @param index : Int - Row index (zero-based), which must be between zero and the current row count minus one.
      * 
      * @return Nothing - The row is deleted from the specified row index.
      */
      , deleteRow: function(index)
      {
        if( index >= 0 && index < this._matrix.length )
          this._matrix.splice( index, 1 );
      }
      
     /**
      * Clone the current matrix
      * 
      * @return Matrix - A clone of the current matrix
      */
      , clone: function()
      {
        var that = this;
        var temp = function temporary() { return that.apply(this, arguments); };
        for( key in this ) 
        {
          temp[key] = this[key];
        }
          
        return temp;
      }
      
     /**
      * Add a matrix to the current matrix and overwrite the current elements
      * 
      * @param m : Matrix 
      * 
      * @return Nothing - The current matrix is overwritten with the element-wise sum of the current and input matrices.  The current matrix is unchanged if the input
      * matrix dimensions do not match the current matrix dimensions
      */
      , add: function(matrix)
      {
        if( matrix.get_m() != this._matrix.length || matrix.get_n() != this._n )
          return;
        
        var m = this._matrix.length;
        var i, j;
        var row;
        var inputRow;
        
        for( i=0; i<m; ++i )
        {
          row      = this._matrix[i];
          inputRow = matrix[i];
          
          for( j=0; j<this._n; ++j )
            row[j] += inputRow[j];
        }
      }
      
     /**
      * Add a matrix to the current matrix and return the result in a new Matrix
      * 
      * @param m : Matrix 
      * 
      * @return Matrix - A new Matrix with the element-wise sum of the current and input matrices.  The return is null if the input matrix dimensions do not match the 
      * current matrix dimensions
      */
      , addTo: function(matrix)
      {
        if( matrix.get_m() != this._matrix.length || matrix.get_n() != this._n )
          return null;
         
        var theMatrix = this.clone();
        return theMatrix.add(matrix);
      }
      
     /**
      * Subtract a matrix from the current matrix and overwrite the current elements
      * 
      * @param m : Matrix 
      * 
      * @return Nothing - The current matrix is overwritten with the element-wise subtraction of the current and input matrices (i.e. a <- a-b).  The current matrix
      * is unchanged if the input matrix dimensions do not match the current matrix dimensions
      */
      , subtract: function(matrix)
      {
        if( matrix.get_m() != this._matrix.length || matrix.get_n() != this._n )
          return;
         
        var m = this._matrix.length;
        var i, j;
        var row;
        var inputRow;
         
        for( i=0; i<m; ++i )
        {
          row      = this._matrix[i];
          inputRow = matrix[i];
           
          for( j=0; j<this._n; ++j )
           row[j] = row[j] - inputRow[j];
        }
      }
      
     /**
      * Subtract a matrix from the current matrix and return the result in a new Matrix
      * 
      * @param m : Matrix 
      * 
      * @return Matrix - A new Matrix with the element-wise subtraction of the current and input matrices, i.e. c = a - b.  The return is null if the input matrix 
      * dimensions do not match the  current matrix dimensions
      */
      , subtractFrom: function(matrix)
      {
        if( matrix.get_m() != this._matrix.length || matrix.get_n() != this._n )
          return null;
          
        var theMatrix = this.clone();
        return theMatrix.subtract(matrix);
      }
      
     /**
      * Transpose the current matrix (in-place)
      * 
      * @return Nothing - The current matrix is transposed in-place, which turns an m x n matrix into a n x m matrix.
      */
      , transpose: function()
      {
        var temp = this._matrix.slice();
        this._matrix.length = 0;
        
        var i, j;
        var m   = temp.length;
        var row = temp[0];
        var n = row.length;
        
        for( j=0; i<m; ++i )
          this._matrix.push([]);
        
        for( i=0; i<m; ++i )
        {
          row = temp[i];
          for( j=0; j<n; ++j )
            this._matrix[j][i] = row[j];
        }
        
        this._n = n;
      }
      
     /**
      * Multiply the current matrix by a vector and return the result in an Array
      * 
      * @param v : Array - Input vector whose length matches the number of columns in the current array
      * 
      * @return Array - If the current matrix is A and the input vector is v (A is m x n and v is n x 1) then the return is the matrix-vector product, Av.  If v contains
      * less than n items, the return array is empty.  If it contains more than n items, the excess number is ignored.
      */
      , byVector: function(v)
      {
        if( !v )
          return [];
        
        if( v.length < this._n )
          return [];
        
        var i, j, row;
        var m = this._matrix.length;
        var s;
        var r = [];
        
        for( i=0; i<m; ++i )
        {
          row = this._matrix[i];
          s   = 0;
          for( j=0; j<this._n; ++j )
            s += row[j]*v[j];
          
          r[i] = s;
        }
        
        return r;
      }
      
     /**
      * Multiply the current matrix by another matrix and store the result in the current matrix
      * 
      * @param m : Matrix 
      * 
      * @return Nothing - The matrices must be of appropriate dimensions for the multiplication.  If the current matrix is m x n, the input matrix must be n x p and
      * the result will be a new, m x p matrix.
      */
      , multiply: function(matrix)
      {
        if( this._n != matrix.get_m() )
          return;
        
        var i, j, k, row, column;
        var t = this.clone();
        var m = this._matrix.length;
        var p = matrix.get_n();
        var s;
        
        for( i=0; i<m; ++i )
        {
          row = t.get_row(i);
          for( j=0; j<p; ++j )
          {
            s      = 0.0;
            column = matrix.get_column(j);
            
            for( k=0; k<this._n; ++k )
              s += row[k]*column[k];
            
            this._matrix[i][j] = s;
          }
        }
        
        this._n = p;
      }
      
     /**
      * Multiply the current matrix by another matrix and store the result in a new Matrix
      * 
      * @param m : Matrix 
      * 
      * @return Matrix - The matrices must be of appropriate dimensions for the multiplication.  If the current matrix is m x n, the input matrix must be n x p and
      * the result will be a new, m x p matrix.
      */
      , multiplyInto: function(matrix)
      {
        var i, j, k, row, column;
        var t = this.clone();
        var m = this._matrix.length;
        var p = matrix.get_n();
        var s;
        var r = [];
        
        t.clear();
        
        for( i=0; i<m; ++i )
        {
          row      = this._matrix[i];
          r.length = 0;
          for( j=0; j<p; ++j )
          {
            s      = 0.0;
            column = matrix.get_column(j);
            
            for( k=0; k<this._n; ++k )
              s += row[k]*column[k];
            
            r.push(s);
          }
          
          t.appendRow(r);
        }
      }
      
     /**
      * Return the transpose of the current matrix
      * 
      * @return Matrix - Transpose of the current matrix
      */
      , transpose: function()
      {
        var t = this.clone();
        t.clear();
        
        var m = this._matrix.length;
        var column = [];
        var i, j;
        
        for( j=0; j=this._n; ++j )
        {
          column.length = 0;
          for( i=0; i<m; ++i )
            column.push( this._matrix[i][j] );
        
          t.appendRow(column);
        }
        
        return t;
      }
      
     /**
      * Solve a linear system of equations, Ax = b with the current matrix being a n x n coefficient matrix
      * 
      * @param b : Array - Right hand side vector
      * 
      * @return Array - Solution vector or empty array if the current matrix is not square, empty, or obviously singular.  Note that the current matrix will be 
      * overwritten by its LU factorization.  Store a clone if a copy of the original coefficients must be maintained.
      */
      , solve: function(b)
      {
        var status = this.__LU();
        
        if( status == 0 )
        {
          var x = b.slice();
          return this.__solve(x);
        }
        else
          return [];
      }
      
      // internal method - compute LU factorization (overwrites current matrix)
      , __LU: function()
      {
        if( this._matrix.length != this._n )
          return;
        
        var n = this._n;
        if( n == 0 )
          return;
        
        var small = 0.0000001;
        
        var i, j, k;
        var imax;  // think result from good, old-fashioned Linpack IDAMAX
        
        var b, temp, z;
        
        // reset pivots
        this._indx.length = 0;
        
        // factor w/partial pivoting
        for( k=0; k<n; ++k ) 
        {
          // get pivot row
          b    = 0.0;
          imax = k;
          for( i=k; i<n; ++i) 
          {
            temp = Math.abs(this._matrix[i][k]);
            if( temp > b ) 
            {
              b    = temp;
              imax = i;
            }
          }
          
          // interchange rows
          if( k != imax ) 
          {
            for( j=0; j<n; ++j ) 
            {
              temp = this._matrix[imax][j];
              
              this._matrix[imax][j] = this._matrix[k][j];
              this._matrix[k][j]    = temp;
            }
          }
          
          this._indx[k] = imax;
          
          if( Math.abs(this._matrix[k][k]) < 0.000000001 ) 
              this._matrix[k][k] = small;
          
          z = 1.0/this._matrix[k][k];
          
          // rank-1 update of sub-matrix
          if( k+1 < n )
          {
            for( i=k+1; i<n; ++i) 
            {
              this._matrix[i][k] *= z;
              temp = this._matrix[i][k];
              
              for( j=k+1; j<n; ++j)
                this._matrix[i][j] -= temp*this._matrix[k][j];
            }
          }
        }
        
        return 0;
      }
      
      , __solve(x)
      {
        var i, ju;
        
        var n  = this._matrix.length;
        var ii = 0;
        var ip, sum;
        
        for( i=0; i<n; ++i ) 
        {
          ip    = this._indx[i];
          sum   = x[ip];
          x[ip] = x[i];
          
          if( ii != 0 )
          {
            for( j=ii-1; j<i; ++j ) 
              sum -= this._matrix[i][j]*x[j];
          }
          else if( sum != 0.0 )
            ii = i+1;
          
          x[i] = sum;
        }
        
        for( i=n-1; i>=0; i--) 
        {
          sum = x[i];
          for( j=i+1; j<n; j++ ) 
            sum -= this._matrix[i][j]*x[j];
          
          x[i] = sum / this._matrix[i][i];
        }
        
        return x;
      }
    }
  }
  
  return returnedModule;
});