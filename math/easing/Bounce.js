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
    * Bounce easing function, sometimes (mistakenly) referred to as a Penner easing equation.  This is inaccurate since all the seminal work on easing
    * equations was done in the 1970's during the formative years of the standalone game industry (anyone remember Zaxxon?)  Each of the easing classes
    * has an easeIn(), easeOut(), and easeInOut() method.
    * 
    * @author Jim Armstrong
    * 
    * @version 1.0
    */
    this.Bounce = function()
    {
    }
    
    this.Bounce.__name__ = true;
    this.Bounce.prototype = 
    {
	    easeOut: function(t, b, c, d) 
	    {
		    if( (t/=d) < (1/2.75) ) 
			    return c*(7.5625*t*t) + b;
		    else if( t < (2/2.75) ) 
			    return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
		    else if( t < (2.5/2.75) ) 
			    return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
		    else 
		      return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
		  }

	    , easeIn: function(t, b, c, d) 
	    {
		    return c - this.easeOut (d-t, 0, c, d) + b;
	    }
	   
	    , easeInOut: function(t, b, c, d) 
	    {
		    if( t < d/2 ) 
		      return this.easeIn(t*2, 0, c, d) * .5 + b;
		    else 
		    {
		      return this.easeOut(t*2-d, 0, c, d) * .5 + c*.5 + b;
		    }
 	    }
    }
 	}
  
  return returnedModule;
});
