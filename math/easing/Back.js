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
    * Back easing function, sometimes (mistakenly) referred to as a Penner easing equation.  This is inaccurate since all the seminal work on easing
    * equations was done in the 1970's during the formative years of the standalone game industry (anyone remember Zaxxon?)  Each of the easing classes
    * has an easeIn(), easeOut(), and easeInOut() method.
    * 
    * @author Jim Armstrong
    * 
    * @version 1.0
    */
    this.Back = function()
    {
    }
    
    this.Back.__name__ = true;
    this.Back.prototype = 
    {
      easeIn: function(t, b, c, d, s) 
	    {
		    if( isNaN(s) )
		      s = 1.70158;
		    
		    return c*(t/=d)*t*((s+1)*t - s) + b;
	    }
	   
	    , easeOut: function(t, b, c, d, s) 
	    {
		    if( isNaN(s) )
		      s = 1.70158;
		    
		    return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
	    }
	   
	    , easeInOut: function(t, b, c, d, s) 
	    {
		    if( isNaN(s) )
		      s = 1.70158;
		     
		    if( (t/=d/2) < 1 ) 
		      return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
		    
		    return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
	    }
	  }
  }
  
  return returnedModule;
});
