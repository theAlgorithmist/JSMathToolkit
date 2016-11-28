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

define(['../DataStats', '../Chi2'], function (StatsModule, ChiSqModule) 
{
  var returnedModule = function () 
  {
    var statsRef = new StatsModule();
    var __stats  = new statsRef.DataStats();
    
    var chi2Ref = new ChiSqModule();
    var __chisq = new chi2Ref.Chi2();
    
   /**
    * Some methods for working with tabular data or simple 'data frames' in R lingo. A data table consists of header information, or category labels, and a 2D set
    * of either character, numerical, or boolean data.  Categories are listed across the first row of the table and each data point is in a single row underneath
    * each category.  Thus, category data is down columns and must be consistent along each column (i.e. do not mix numeric and character data in the same column).
    * 
    * @author Jim Armstrong
    * 
    * @version 1.0
    */
    this.Table = function()
		{
      this.NUMERIC   = 0;
      this.CHARACTER = 1;
      this.BOOLEAN   = 2;
      
      this._table      = [];  // actual data table (array of arrays, stored column-major)
      this._categories = [];  // categories (character labels) for each column
      this._types      = [];  // type of each category of data (NUMERIC, CHARACTER, or BOOLEAN)
		}
    
    this.Table.__name__ = true;
    this.Table.prototype = 
    {
     /**
      * Assign the table from an array of arrays (where the first row ALWAYS contains the category labels)
      * 
      * @param data : Array - Each element is an array containing one row of data and the first row is ALWAYS the category labels
      * 
      * @param dataTypes:Array - One element for each column that indicates the type of data - must be Table.NUMERIC, TABLE.CHARACTER, or TABLE.BOOLEAN.  The
      * number of elements in this array must be the same as the number of elements in the first array of the data parameter
      * 
      * @return Nothing - The internal table is assigned provided that all input is valid
      */
      fromArray: function(data, dataTypes)
      {
        if( !data || data.length < 2 )
          return;
        
        if( !dataTypes || dataTypes.length == 0 )
          return;
        
        if( data[0].length != dataTypes.length )
          return;
        
        this.__clear();
        
        this._categories = data[0].slice();
        var n            = this._categories.length;
        
        this._types = dataTypes.slice();
        
        // initialize each column
        var i;
        for( i=0; i<n; ++i )
          this._table[i] = new Array();
        
        // copy the data in, column-major
        var len = data.length;
        var j;
        var row;
        for( i=1; i<len; ++i )
        {
          row = data[i];
          for( j=0; j<n; ++j )
            this._table[j].push( row[j] );
        }
      }
    
     /**
      * Access the categories or character names assigned to each column of data
      * 
      * @return Array - Array of column names (categories) in order originally input
      */
      , get_categories: function()
      {
        return this._categories.slice();
      }
      
     /**
      * Access the data type of each category
      * 
      * @return Array - Array of data types for each cateogry name in order originally input
      */
      , get_dataTypes: function()
      {
        return this._types.slice();
      }
      
     /**
      * Access the number of data items (not category labels) in a the table 
      * 
      * @return Int - Number of data items in any column of the Table
      */
      , get_itemCount: function()
      {
        if( this._table.length == 0 )
          return 0;
        
        return this._table[0].length;
      }
      
     /**
      * Access a single column of data as a standalone array
      * 
      * @param category : String - category (column) name
      * 
      * @return Array - Copy of the current data in the specified column or an empty array if the category name is incorrect
      */
      , get_column: function(category)
      {
        var index = this._categories.indexOf(category);
        if( index == -1 )
          return [];
          
        return this._table[index].slice();
      }

     /**
      * Remove a column from the current table
      *
      * @param category : String - category (column) name (often a dependent variable that will be forecast based on remaining table data)
      *
      * @return Nothing - If the named column exists in the table, it is removed and all other columns are shifted left
      */
      , removeColumn : function(category)
      {
        var index = this._categories.indexOf(category);
        if( index == -1 )
          return;

        this._table.splice(index, 1);
      }

     /**
      * Access summary statistics for a column of numerical data
      * 
      * @param category : String - Category or column name
      * 
      * @return Array - Five number summary of the data column, min., 1st quartile, median, 3rd auartile, max.
      */
      , get_summary: function(category)
      {
        var index = this._categories.indexOf(category);
        if( index == -1 )
          return {};
          
        if( this._types[index] != this.NUMERIC )
          return {};
          
        __stats.set_data( this._table[index] );
        
        return __stats.get_fiveNumber();
      }
      
     /**
      * Access the range of a category or column of numerical data
      * 
      * @param category : String - Category or column name
      * 
      * @return Number - Difference between the max. and min. values of the column or zero if inputs are invalid
      */
      , get_range: function(category)
      {
        var index = this._categories.indexOf(category);
        if( index == -1 )
          return {};
          
        if( this._types[index] != this.NUMERIC )
          return {};
          
        __stats.set_data( this._table[index] );
        
        var min = __stats.get_min();
        var max = __stats.get_max();
        
        return max - min;
      }
      
     /**
      * Access the mean of a column of numerical data
      * 
      * @param category : String - Category or column name
      * 
      * @return Number - Arithmetic mean of the data or zero if inputs are invalid
      */
      , get_mean: function(category)
      {
        var index = this._categories.indexOf(category);
        if( index == -1 )
          return 0;
        
        __stats.set_data( this._table[index] );
        
        return __stats.get_mean();
      }
      
     /**
      * Access the standard deviation of a column of numerical data
      * 
      * @param category : String - Category or column name
      * 
      * @return Number - Standard deviation of the data or zero if inputs are invalid
      */
      , get_std: function(category)
      {
        var index = this._categories.indexOf(category);
        if( index == -1 )
          return 0;
         
        __stats.set_data( this._table[index] );
         
        return __stats.get_std();
      }
      
     /**
      * Access quantiles of a category or column of numerical data
      * 
      * @param category : String - Category or column name
      * 
      * @param q : Number - Quantile fraction in (0,1), i.e. 0.25 for quartiles, 0.2 for quintiles, or 0.1 for deciles. 
      * 
      * @return Array - First and last elements are min and max elements of the data column.  Middle elements are the requested quantiles in order, i.e. 0.25, 0.5, 0.75 or
      * 0.2, 0.4, 0.6, 0.8 - currently computed by straight linear interpolation.  Will likely get more sophisticated in a future release.
      * 
      * Array will be empty for invalid data and quartile will default to 0.25 for invalid entries.
      */
      , get_quantiles: function(category, q)
      {
        var index = this._categories.indexOf(category);
        if( index == -1 )
          return [];
           
        if( this._types[index] != this.NUMERIC )
          return [];
           
        __stats.set_data( this._table[index] );
         
        return __stats.get_quantile(q);
      }
      
     /**
      * Create a one-way table of categorical data for the specified column
      * 
      * @param category : String - Category or column name
      * 
      * @param asProportion : Boolean - True if the count is to be converted into a percentage (which is automatically rounded to two decimal places)
      * @default false
      * 
      * @return Object - name-value or key-value pairs.  Keys contain independent data items in the specified column of the original.  Values are the frequency count of each item.
      */
      , oneWayTable: function(category, _asPercentage)
      {
        var index = this._categories.indexOf(category);
        if( index == -1 )
          return [];
        
        var asPercentage = _asPercentage == undefined ? false : _asPercentage;
        if( typeof(asPercentage) !== "boolean" )
          asPercentage = false;
        
        var data = this._table[index];
        var n    = data.length;
        
        // store occurrences of the category here
        var count = {};
        var i, item;
        
        for( i=0; i<n; ++i )
        {
          item = data[i];
          
          if( count.hasOwnProperty(item) )
            count[item]++;
          else
            count[item] = 1;
        }
        
        if( asPercentage )
        {
          var n1 = 1.0/n;
          for( var item in count )
            count[item] = (count[item]*n1*100).toFixed(2);
        }
        
        return count;
      }
      
     /**
      * Create a CrossTable between two columns of data
      * 
      * @param category1 : String - Name of first category that represents the independent variable in the contingency analysis
      * 
      * @param category 2 : String - Name of second category that represents the dependent variable(s)
      * 
      * @param grouping : Array - Optional array of space-delimited Strings used to group the second category for counting purposes (in which case the second column must contain 
      * character data).  If this argument is omitted or the array is blank, then the number of columns in the cross-table with be equal to the number of unique items in the
      * second category of data.  Otherwise, the number of columns in the CrossTable is the number of elements in the grouping array.  For example, a collection of colors such 
      * as 'Black,' 'Silver', 'Gray', 'White', 'Blue', 'Gold', 'Green', 'Yellow', 'Red' might be grouped as ["Black Silver White Gray", "Blue Gold Green Red Yellow"].  This results 
      * in a CrossTable with two columns, one for each group.
      * 
      * @param colNames : Array - Optional array of column names associated with each group.  It is only necessary to provide this information of grouping is applied.  Otherwise,
      * column names consist of each unique value in the dependent variable.
      * 
      * @return Object - 'chi2' property is total chi-squared value, 'df' (table degrees of freedom), and 'q' property represents the q-value or probability that the table results 
      * occur by chance, based on chi-squared.  'table' property is a 2D associative array, each element of which is an object of the CrossTable with the exception of the final 
      * column which contains the row counts and percentages of each row count of the total item count.  Row names are unique category names of the independent variable.  Output is 
      * ordered by ROWS.
      * 
      * Each cell object contains 'c' property, which is the fraction of the column total, 'r' property for fraction of the row total, 't' property for fraction of the table
      * total, and 'n' property for the cell count.  'chi2' property may be added in the future for cell chi-2 value.
      * 
      * The array will be empty if inputs are invalid.  It is acceptable to not supply the grouping argument as lack of presence of that array is interpreted as there is no 
      * grouping applied in the dependent variable.
      * 
      */
      , crossTable: function(category1, category2, grouping, colNames)
      {
        var index1 = this._categories.indexOf(category1);
        var index2 = this._categories.indexOf(category2);
        
        if( index1 == -1 || index2 == -1 )
          return [];
        
        var grouped = grouping != undefined && grouping != null;
        if( grouped )
          grouped = grouping.hasOwnProperty("length");
        
        var i, j, len;
        
        var columnNames = !colNames || !colNames.hasOwnProperty("length") ? [] : colNames;
        if( columnNames.length != grouping.length )
        {
          // provide some default column name so at least the table data gets returned
          len = grouping.length;
          for( i=0; i<len; ++i )
            columnNames[i] = "G" + i.toString();
        }

        // final output table
        var counts = [];
        
        // independent and dependent variables
        var x = this._table[index1];
        var n = x.length;
        var y = this._table[index2];
        
        // build the output table
        var item, col;
        
        // groups stored in arrays - if the data is not grouped, then create a grouped array from the unique elements in the dependent variable
        var groups, columns;
        
        if( !grouped )
        {
          grouping = []          
          for( i=0; i<n; ++i )
          {
            item = y[i];
            if( grouping.indexOf(item) == -1 )
              grouping.push( item );
          }
        }
        
        // convert groups into a collection of arrays that can be quickly checked for presence of an item 
        columns = grouping.length;
        groups  = [];
          
        // tbd - could check to see if each element is String - not done for now
        for( i=0; i<columns; ++i )
          groups.push( grouping[i].split(" ") );
          
        // process each element in the independent variable
        for( i=0; i<n; ++i )
        {
          item = x[i];
          col  = y[i];
          var g;
            
          // which group?
          var indx = -1;
          for( j=0; j<columns; ++j )
          {
            g    = groups[j];
            indx = g.indexOf(col);
            if( indx != -1 )
            {
              indx = j;
              break;
            }
          }
            
          // update the count in the appropriate row
          var row;
          if( counts.hasOwnProperty(item) )
          {
            row = counts[item];
            if( isNaN(row[indx]) )
              row[indx] = 1;
            else
              row[indx]++;
          }
          else
          {
            row          = [];
            row[indx]    = 1;
            counts[item] = row;
          }
        }
        
        // get the row and column counts - we have to keep the column counts in separate array - the row totals are appended onto each row count array
        var rowCount = 0;
        var colCount = 0;
        
        var columnCounts = [];
        for( j=0; j<columns; ++j )
          columnCounts.push(0);
        
        sum = 0.0;
        
        for( var key in counts )
        {
          rowCount = 0;
          if( counts.hasOwnProperty(key) )
          {
            row = counts[key];
            
            for( j=0; j<columns; ++j )
            {
              columnCounts[j] += row[j];
              rowCount        += row[j];
            }
            
            row.push(rowCount);
            
            sum += rowCount;
          }
        }
        
        // and, finally, we can compute chi-2 and the other goodies, then load them into the production table
        var expected = [];
        var chi2     = 0.0;
        var e, t, x, obj;
        
        sum = 1.0/sum;
        
        for( var key in counts )
        {
          if( counts.hasOwnProperty(key) )
          {
            row = counts[key];
            if( !expected.hasOwnProperty(key) )
              expected[key] = [];
        
            e        = expected[key];        // row-vector of expected (and then observed - expected) values
            row      = counts[key];          // current row counts 
            rowCount = row[columns];         // count was appended onto the array in previous step
            
            for( j=0; j<columns; ++j )
            {
              t    = (columnCounts[j]*rowCount)*sum;  // divide is probably a wash next to memory access times, but I'm kicking it old-school and invert-multiply
              s    = row[j] - t;                      // observed - expected
              e[j] = s*s/t;                           // (o-e)^2 / e
              
              chi2 += e[j];
              
              obj    = {};
              obj.n  = row[j];    
              obj.r  = row[j]/rowCount;
              obj.c  = row[j]/columnCounts[j];
              obj.t  = row[j]*sum;
              
              row[j] = obj;
            }
          }
        }
        
        var df = (n-1)*(columns-1);
        __chisq.set_nu( df );
        
        return {chi2:chi2, df:df, q:__chisq.q(chi2), table:counts};
      }
      
     /**
      * Create a full cross-tabulation between the first column of data and all other columns of data.  Note that the first column of data MUST be character (categorical)
      * and remaining columns MUST contain numeric data (column labels are always character, so the first row is an exception).
      * 
      * @return Object - Same return object as the CrossTable method.  NOTE:  Output is ordered by columns, not rows.
      */
      , crossTabulation: function()
      {
        if( this._table.length == 0 )
          return {};
          
        // final output table
        var counts = [];
        var n      = this._table[0].length;
        var chi2   = 0.0;
        
        // build the output table
        var item, col, sum;
        var columns = this._categories.length - 1;
        
        // row and column counts 
        var colCount = 0;
        
        var rowCounts = [];
        for( j=0; j<n; ++j )
          rowCounts.push(0);
        
        var colCounts = [];
        for( i=0; i<columns; ++i )
          colCounts.push(0);
                  
        // process each element in the independent variable against each other column in the table - since the table is column-major,
        // process the data by column
        sum = 0.0;
        
        for( j=0; j<columns; ++j )
        {
          col = this._table[j+1];
          
          colCount = 0;
          for( i=0; i<n; ++i )
          {
            colCount     += col[i];
            rowCounts[i] += col[i];
          }
          
          colCounts[j] = colCount;
          
          sum += colCount;
        }
        
        // finish off production table
        var e, t;
        
        sum = 1.0/sum;  // 1/total count
        
        for( j=0; j<columns; ++j )
        {
          col = this._table[j+1];
          
          counts[j] = [];
          e         = counts[j];  // colum -vector of expected (and then observed - expected) values
          
          for( i=0; i<n; ++i )
          {
            rowCount = rowCounts[i];  // current row count

            // the usual suspects
            t    = (colCounts[j]*rowCount)*sum;     // divide is probably a wash next to memory access times, but I'm kicking it old-school and invert-multiply
            s    = col[i] - t;                      // observed - expected
            e[i] = s*s/t;                           // (o-e)^2 / e
              
            chi2 += e[i];
            
            obj   = {};
            obj.n = col[i];    
            obj.r = col[i]/rowCount;
            obj.c = col[i]/colCounts[j];
            obj.t = col[i]*sum;
            
            e[i] = obj;
          }
        }
        
        // degrees of freedom
        var df = (n-1)*(columns-1);
        __chisq.set_nu( df );
        
        return {chi2:chi2, df:df, q:__chisq.q(chi2), table:counts};
      }

     /**
      * Normalize the current table and return the data in an Array
      *
      * @return Array - 2D Array of normalized data, i.e. each column is normalized to the range [0,1] with 0 equal to the minimum column element and 1 equal
      * to the column maximum.  The original table is unchanged
      */
      , normalize : function()
      {
        var output = this._table.slice();
        var n      = this._table.length;  // column count

        var i, len;
        var minValue, maxValue;

        // process the data by column
        var len = data.length;
        var j;
        var col;
        var r;

        for( j=0; j<n; ++j )
        {
          col = output[j];
          len = col.length;

          minValue = Number.MAX_VALUE;
          maxValue = Number.MIN_VALUE;

          for( i=0; i<len; ++i )
          {
            if( col[i] > minValue )
              minValue = col[i];

            if( col[i] > maxValue )
              maxValue = col[i];
          }
   
          // inverse of range
          r = 1.0/(maxValue - minValue);

          // normalize the column
          for( i=0; i<len; ++i )
            col[i] = r*(col[i] - minValue);
        }

        return output;
      }

     /**
      * Transform all column data in the table to z-scores return the data in an Array
      *
      * @return Array - 2D Array of z-scored data.  The original table is unchanged
      */
      , zScore : function()
      {
        var output = this._table.slice();
        var n      = this._table.length;  // column count

        var i, len;
        var mu, sigma;

        // process the data by column
        var len = data.length;
        var j;
        var col;

        for( j=0; j<n; ++j )
        {
          col = output[j];
          len = col.length;

          // (mu, sigma) for column
          __stats.set_data(col);

          mu    = __stats.get_mean();
          sigma = 1.0/__stats.get_std();  // tbd - add numerical check 

          // z-scores for the column
          for( i=0; i<len; ++i )
            col[i] = (col[i]-mu)*sigma; 
        }
      }

     /**
      * Break the current table (by row division) into a training set and a test, or validation set
      *
      * @param row : Int - Zero-based row index so that all rows from 0 to row are in the training set and rows row+1 to end of table are in the 
      * validation set.
      *
      * @param data : Array - Optional 2D data source to use in lieu of the current table; this is used in cases where normalized or externally 
      * transformed data is used in analysis
      *
      * @return Object - 'train' property contains a 2D array of the training data and 'test' contains the test or validation set as a 2D array
      */
      , split : function(row, data)
      {
        var n,m;

        if( !data )
        {
          n = this._table.length;
          m = n == 0 ? 0 : this._table[0].length;
        }
        else
        {
          n = data.length;
          m = n == 0 ? 0 : data[0].length;
        }

        if( row < 0 || row >= m )
          return { train:[], test:[] };

        var train = [];
        var test  = [];

        var j;
        for( j=0; j<n; ++j )
          train[j] = data ? data[j].slice(0,row+1) : this._table[j].slice(0,row+1);
        
        if( row < m )
        {
          for( j=0; j<n; ++j )
            test[j] = data ? data[j].slice(row+1,m) : this._table[j].slice(row+1, m);
        }

        return { train:train, test:test };
      }
      
      // utility method to convert table object with items and counts into a 2D array with first row containing items in a selected category and the second row containing the item
      // counts - this is a convenience for those wishing to work with the result data in a table-style format
      , __tblToArray: function(obj)
      {
        var table = [];
        table.push( new Array() );
        table.push( new Array() );
        
        for( var key in obj )
        {
          table[0].push( key );
          table[1].push( obj[key] );
        }
        
        return table;
      }
      
      // internal method - clear the current table and prepare for new input
      , __clear: function()
      {
        this._table.length      = 0;
        this._categories.length = 0;
        this._types.length      = 0;
      }
    }
  }
  
  return returnedModule;
});