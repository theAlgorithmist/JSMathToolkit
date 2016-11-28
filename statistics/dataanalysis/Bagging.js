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

define(['../../math/Deviates', '../DataStats'], function (DeviatesModule, StatsModule) 
{
  var returnedModule = function () 
  {
    var deviatesRef = new DeviatesModule();
    var __deviates  = new deviatesRef.Deviates();
    
    var statsRef = new StatsModule();
    var __stats  = new statsRef.DataStats();
    
   /**
    * Some methods for assisting with rudimentary Bootstrap Aggregating (Bagging), including sub-bagging 
    * 
    * @author Jim Armstrong
    * 
    * @version 1.0
    */
    this.Bagging = function()
		{
      // empty
		}
    
    this.Bagging.__name__ = true;
    this.Bagging.prototype = 
    {
     /**
	    * Return an array of samples of equivalent size to an input sample
	    * 
	    * @param data : Array - Array of numerical data (n observations) 
	    * 
	    * @param numSets : int - Total number of data sets to generate (B in many online references)
	    * 
	    * @return Array : Array of arrays, each of which contains n uniformly sampled observations (with replacement) from the original data set 
	    *
	    */	
      get1DSamplesWithReplacement: function( data, numSets )
		  {
			  if( !data || data.length == 0 )
			    return [];
			  
			  var n   = data.length;
			  numSets = numSets == undefined || numSets < 1 ? n : numSets;
			  
			  var i, j, index;
			  var r = __deviates.uniform(1001, true);
			  
			  var output = [];
			  var min    = -0.499;
			  var max    = n - 1 + 0.499;
         
			  for( i=0; i<numSets; ++i )
			  {
			    output[i] = [];
			    for( j=0; j<n; ++j )
			    {
			      r     = __deviates.uniform(1001,false);
			      index = Math.floor( Math.round(min + r*(max - min) ));
			      index = Math.abs(index);  // sometimes computes -0
			      
			      output[i].push( data[index] );
			    }
			  }
			  
			  return output;
		  }
      
     /**
      * Return an array of samples from an input data set of less than the original sample size 
      * 
      * @param data : Array - Array of numerical data (n observations)
      * 
      * @param m : Int - New sample size (must be less than n - defaults to [n/2])
      * 
      * @param numSets : int - Total number of data sets to generate (B in many online references)
      * 
      * @return Array : Array of arrays, each of which contains uniformly sampled observations (WITHOUT replacement) from the original data set (subbagging)
      * 
      */
      , get1DSamplesWithoutReplacement: function( data, m, numSets )
      {
        if( !data || data.length == 0 )
          return [];
        
        var n   = data.length;
        m       = m == undefined || m < 1 || m > n ? Math.floor(n/2) : m;
        numSets = numSets == undefined || numSets < 1 ? n : numSets;
        
        var i;
        var r = __deviates.uniform(1001, true);
        
        var output = [];
        var min    = -0.499;
        var max    = n - 1 + 0.499;
         
        // record indices that have already been sampled
        var sampledIndices;
        
        for( i=0; i<numSets; ++i )
        {
          output[i]      = [];
          sampledIndices = [];
          
          var tmp = output[i];
          
          while( tmp.length < m )
          {
            r     = __deviates.uniform(1001,false);
            index = Math.floor( Math.round(min + r*(max - min) ));
            index = Math.abs(index);  // sometimes computes -0
            
            if( sampledIndices[index] == undefined )
            {
              tmp.push( data[index] );
              sampledIndices[index] = true;
            }
          }
        }
        
        return output;
      }
      
     /**
      * Return the Pearson correlation coefficient of a bagged sample (with replacement) vs. an original sample set
      * 
      * @param orig : Array - Original sample set (n samples)
      * 
      * @param bag : Array - Bagged sample set (with replacement, n samples)
      * 
      * @return Number : Pearson correlation coefficient or zero if data errors are present (both arrays are sorted in ascending order, pre-computation)
      */
      , correlate( orig, bag )
      {
        if( !orig || !bag )
          return 0.0;
        
        var n = orig.length;
        if( bag.length != n )
          return 0.0;
        
        var x = orig.slice();
        var y = bag.slice();
        
        // sort numeric, ascending
        x.sort(function(a, b){return a-b});
        y.sort(function(a, b){return a-b});
        
        return __stats.correlation(x,y);
      }
      
     /**
      * Return an array of (2D) samples of equivalent size to an input sample
      * 
      * @param x : Array - Array of x-coordinates
      * 
      * @param y : Array - Array of y-coordinates
      * 
      * @param numSets : int - Total number of data sets to generate (B in many online references)
      * 
      * @return Array : Array of Objects, each of which contains n uniformly sampled observations (with replacement) from the original data sets, with x-coordinates array
      * in the 'x' property and y-coordinates array in the 'y' property.
      *
      */  
      , get2DSamplesWithReplacement: function( x, y, numSets )
      {
        if( !x || !y || x.length == 0 )
          return [];
         
        var n = x.length;
        if( y.length != n )
          return [];
        
        numSets = numSets == undefined || numSets < 1 ? n : numSets;
         
        var i, j, index;
        var r = __deviates.uniform(1001, true);
         
        var output = [];
        var min    = -0.499;
        var max    = n - 1 + 0.499;
        
        for( i=0; i<numSets; ++i )
        {
          output[i] = {};
          var newX  = [];
          var newY  = [];
          for( j=0; j<n; ++j )
          {
            r     = __deviates.uniform(1001,false);
            index = Math.floor( Math.round(min + r*(max - min) ));
            index = Math.abs(index);  // sometimes computes -0
            
            newX.push( x[index] );
            newY.push( y[index] );
          }
          
          output[i].x = newX;
          output[i].y = newY;
        }
        
        return output;
      }
      
     /**
      * Return an array of (2D) samples of equivalent size to an input sample
      * 
      * @param x : Array - Array of x-coordinates (length n)
      * 
      * @param y : Array - Array of y-coordinates (length n)
      * 
      * @param m : Number of samples, m < n
      * 
      * @param numSets : int - Total number of data sets to generate (B in many online references)
      * 
      * @return Array : Array of Objects, each of which contains n uniformly sampled observations (without replacement) from the original data sets, with x-coordinates array
      * in the 'x' property and y-coordinates array in the 'y' property.
      *
      */  
      , get2DSamplesWithoutReplacement: function( x, y, m, numSets )
      {
        if( !x || !y || x.length == 0 )
          return [];
          
        var n = x.length;
        if( y.length != n )
          return [];
         
        m       = m == undefined || m < 1 || m > n ? Math.floor(n/2) : m;
        numSets = numSets == undefined || numSets < 1 ? n : numSets;
          
        var i, j, index;
        var r = __deviates.uniform(1001, true);
          
        var output = [];
        var min    = -0.499;
        var max    = n - 1 + 0.499;
         
        // record indices that have already been sampled
        var sampledIndices;
         
        for( i=0; i<numSets; ++i )
        {
          output[i]      = {};
          sampledIndices = [];
           
          var newX = [];
          var newY = [];
           
          while( newX.length < m )
          {
            r     = __deviates.uniform(1001,false);
            index = Math.floor( Math.round(min + r*(max - min) ));
            index = Math.abs(index);  // sometimes computes -0
             
            if( sampledIndices[index] == undefined )
            {
              newX.push( x[index] );
              newY.push( y[index] );
               
              sampledIndices[index] = true;
            }
          }
           
          output[i].x = newX;
          output[i].y = newY;
        }
         
        return output;
      }    
    }
  }
  
  return returnedModule;
});