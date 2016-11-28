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

define(['./llsq', './Bagging'], function (LLSQModule, BagModule) 
{
  var returnedModule = function () 
  {
    var llsqRef = new LLSQModule();
    var __llsq  = new llsqRef.LLSQ();
    
    var bagRef = new BagModule();
    var __bag  = new bagRef.Bagging();
    
  /**
   * Linear least squares fit of x-y data with bagging/sub-bagging
   * 
   * @author Jim Armstrong (www.algorithmist.net)
   * 
   * @version 1.0
   * 
   */
    this.BLLSQ = function()
    {
      
    }
   
    this.BLLSQ.__name__ = true;
    this.BLLSQ.prototype = 
    {
     /**
      * Perform a linear regression (least squares fit) with bagged data sets
      * 
      * @param _x : Array - Array of x-coordinates (must have at least three data points)
      * 
      * @param _y : Array - Array of y-coordinates (must have at least three data points)
      * 
      * @param _numSets : Array - Number of data sets or bags to use in the analysis
      * 
      * @return Object - Fit model is ax+b.  'a' parameter is the average regression slope, 'b' parameter is the average intercept.  There is no error checking 
      * for performance reasons.  The 'aArray' parameter contains each of the a-estimates and the 'bArray' parameter contains each of the b-estimates.
      */
      bagFit: function(_x, _y, _numSets)
      {
        var n = _x.length;
        if( n < 3 )
          return { a:0, b:0 };
          
        var numSets = _numSets == undefined || _numSets < 1 ? n : _numSets;
          
        var a_ave = 0.0;
        var b_ave = 0.0;
        
        var i;
        var bfit;
        
        var aArr = [];
        var bArr = [];
        var bag  = __bag.get2DSamplesWithReplacement( _x, _y, numSets );
        
        for( i=0; i<numSets; ++i )
        {
          bfit   = __llsq.fit( bag[i].x, bag[i].y );
          a_ave += bfit.m;
          b_ave += bfit.b;
          
          aArr.push(bfit.m);
          bArr.push(bfit.b)
        }
        
        a_ave /= numSets;
        b_ave /= numSets;
        
        return {a:a_ave, b:b_ave, aArray:aArr, bArray:bArr};
      } 
    
     /**
      * Perform a linear regression (least squares fit) with sub-bagged data sets
      * 
      * @param _x : Array - Array of x-coordinates (must have at least three data points)
      * 
      * @param _y : Array - Array of y-coordinates (must have at least three data points)
      * 
      * @param _m : Int - Number of original data points to use in a bag (must be less than or equal to total number of samples)
      * 
      * @param _numSets : Array - Number of data sets or bags to use in the analysis
      * 
      * @return Object - Fit model is ax+b.  'a' parameter is the average regression slope, 'b' parameter is the average intercept.  There is no error checking 
      * for performance reasons.  The 'aArray' parameter contains each of the a-estimates and the 'bArray' parameter contains each of the b-estimates.
      */
      , subbagFit: function(_x, _y, _m, _numSets)
      {
        var n = _x.length;
        if( n < 3 )
          return { a:0, b:0 };
         
        var m       = _m == undefined || _m < 1 || _m > n ? Math.floor(n/2) : _m;
        var numSets = _numSets == undefined || _numSets < 1 ? n : _numSets;
         
        var a_ave = 0.0;
        var b_ave = 0.0;
       
        var i;
        var bfit;
       
        var aArr = [];
        var bArr = [];
        var bag  = __bag.get2DSamplesWithoutReplacement( _x, _y, m, numSets );
       
        for( i=0; i<numSets; ++i )
        {
          bfit   = __llsq.fit( bag[i].x, bag[i].y );
          a_ave += bfit.m;
          b_ave += bfit.b;
         
          aArr.push(bfit.m);
          bArr.push(bfit.b)
        }
       
        a_ave /= numSets;
        b_ave /= numSets;
       
        return {a:a_ave, b:b_ave, aArray:aArr, bArray:bArr};
      }  
    }
  }
  
  return returnedModule;
});