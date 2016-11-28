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
    * Circular easing function, sometimes (mistakenly) referred to as a Penner easing equation.  This is inaccurate since all the seminal work on easing
    * equations was done in the 1970's during the formative years of the standalone game industry (anyone remember Zaxxon?)  Each of the easing classes
    * has an easeIn(), easeOut(), and easeInOut() method.
    * 
    * @author Jim Armstrong
    * 
    * @version 1.0
    */
    this.Elastic = function()
    {
    }
    
    this.Elastic.__name__ = true;
    this.Elastic.prototype = 
    {
	    easeIn: function(t, b, c, d, a, p)
	    {
		    if( t==0 ) 
		      return b;
		    
		    if( (t/=d) == 1 ) 
		      return b+c;
		    
		    if(!p) 
		      p=d*.3;
		    
		    var s;
		    if( !a || a < Math.abs(c) )
		    { 
		      a = c; 
		      s = p/4; 
		    }
		    else 
		      s = p/(2*Math.PI) * Math.asin(c/a);
		    
		    return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
	    }
	   
	    , easeOut: function(t, b, c, d, a, p) 
	    {
		    if( t == 0 ) 
		      return b;
		    
		    if( (t/=d) == 1 ) 
		      return b+c;
		    
		    if( !p ) 
		      p = d*.3;
		    
		    var s;
		    if( !a || a < Math.abs(c) )
		    {
		      a = c; 
		      s = p/4; 
		    }
		    else 
		      s = p/(2*Math.PI) * Math.asin (c/a);
		    
		    return (a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b);
	    }
	   
	    , easeInOut: function(t, b, c, d, a, p) 
	    {
		    if( t == 0 ) 
		      return b;
		    
		    if( (t/=d/2) == 2 ) 
		      return b+c;
		    
		    if( !p ) 
		      p = d*(0.3*1.5);
		    
		    var s;
		    if( !a || a < Math.abs(c) ) 
		    { 
		      a = c; 
		      s = 0.25*p; 
		    }
		    else 
		      s = p/(2*Math.PI) * Math.asin (c/a);
		    
		    if( t < 1 ) 
		      return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
		    
		    return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*0.5 + c + b;
	    }
	  }
  }
  
  return returnedModule;
});
