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
    * An implementation of Neville's method for polynomial interpolation of a SMALL (ideally less than 10) number of data points.  
    * 
    * Credit: Derived from NRC polint.c
    *
    * @author Jim Armstrong (www.algorithmist.net)
    * 
    * @version 1.0
    */
    this.Neville = function()
    {
      this.__isFinished = false;
    }
    
    this.Neville.__name__ = true;
    this.Neville.prototype = 
    {
     /**
      * Interpolate a single data point
      * 
      * @param xa : Array - x-coordinates of interpolation points
      * 
      * @param ya : Array - y-coordinates of interpolation points
      * 
      * @param x : x-coordinate of point to be interpolated
      * 
      * @return Number - y-coordinate of interpolated point or NaN in the case of suffiently bad inputs to make the method fail.  DO not use this method for larger numbers
      * of interpolation point - in very well-behaved cases, 10 or 20 might work, but 100 or 200 will not.
      */
      interpolate: function(xa, ya, x)
      {
        var c = [];
        var d = [];
        var n = xa.length;
        
        var den, dif, dift;
        var ho, hp, w;
        var i, m, ns;

        var y  = 0;
        var dy = 0;
               
        ns  = 0;
        dif = Math.abs(x-xa[0]);
            
        for( i=0; i<n; ++i ) 
        {
          dift = Math.abs( x-xa[i] );
                
          if( dift < dif ) 
          {
            ns  = i;
            dif = dift;
          }
                
          c[i] = ya[i];
          d[i] = ya[i];
        }
       
        y  = ya[ns];
        ns = ns-1;
            
        for( m=0; m<n-1; ++m ) 
        {
          for( i=0; i< n-m-1; ++i ) 
          {
            ho   = xa[i] - x;
            hp   = xa[i+m+1] - x;
            w   = c[i+1] - d[i];
            den = ho - hp;
                    
            if( Math.abs(den) < 0.00000001 )
            {
              // bad news
              return NaN;
            }
                    
            den  = w/den;
            d[i] = hp*den;
            c[i] = ho*den;
          }
         
          if( 2*(ns+1) < n-m-1 ) 
            dy = c[ns+1];
          else 
          {
            dy = d[ns];
            ns = ns-1;
          }
                
          y = y + dy;
        }
       
        return y;
      }
    }
  }
  
  return returnedModule;
});