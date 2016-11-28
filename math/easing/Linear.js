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
    * Linear easing function, sometimes (mistakenly) referred to as a Penner easing equation.  This is inaccurate since all the seminal work on easing
    * equations was done in the 1970's during the formative years of the standalone game industry (anyone remember Zaxxon?)  Each of the easing classes
    * has an easeIn(), easeOut(), and easeInOut() method.
    * 
    * @author Jim Armstrong
    * 
    * @version 1.0
    */
    this.Linear = function()
    {
    }
    
    this.Linear.__name__ = true;
    this.Linear.prototype = 
    {
	    easeIn: function(t, b, c, d) 
	    {
		    return c*t/d + b;
	    }
	   
	    , easeOut: function(t, b, c, d) 
	    {
		    return c*t/d + b;
	    }
	   
	    , easeInOut: function(t, b, c, d) 
	    {
		    return c*t/d + b;
	    }
	  }
  }
  
  return returnedModule;
});
