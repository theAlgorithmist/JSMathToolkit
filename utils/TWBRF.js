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
    * TWBRF is a port of Jack Crenshaw's The World's Best Root Finder.  Usage: Identify an interval containing the root (the tighter, the better), then call the <span class='code'>findRoot</span> method.
    * 
    * Author Jim Armstrong (www.algorithmist.net)
    * 
    * Version 1.0
    * 
    */
    this.TWBRF = function() 
    {
      this.TOL      = 0.000001;
      this.MAX_ITER = 50;
      this.__iter   = 0;
    }
    
    this.TWBRF.__name__ = true;
    this.TWBRF.prototype = 
    {
     /**
      * Return the number of iterations
      * 
      * @Return Int - total number of iterations
      */
      getIterations: function() 
      { 
	      return this.__iter; 
      }
  
     /**
      * Find an approximate root to a function in the specified interval.
      * 
      * @param _x0 : Number - root isolated in interval [_x0, _x2]
      * 
      * @param _x2 : Number - root isolated in interval [_x0, _x2]
      * 
      * @param _f  : Function - reference to function whose root in the interval is desired.  Function accepts a single numerical argument and returns a number.
      * 
      * @param _eps: Number - tolerance value for root; defaults to the current <span class='code'>TOL</span> value
      *
      * @return Number: Approximation of desired root within specified tolerance and iteration limit.  In addition to too small an iteration limit or too tight a 
      * tolerance, some pathological numerical conditions exist under which the method may incorrectly report a root.
      *
      */
      , findRoot: function(_x0, _x2, _f, _eps)
      {
        if ( _eps == null )
          _eps = this.TOL;
    
        var _imax = this.MAX_ITER;
        var x0;
        var x1;
        var x2;
        var y0;
        var y1;
        var y2;
        var b;
        var c;
        var y10;
        var y20;
        var y21;
        var xm;
        var ym;
        var temp;
      
        var xmlast = _x0;
        y0         = _f(_x0);
      
        if( y0 == 0.0 )
          return _x0;
  
        y2 = _f(_x2);
        if( y2 == 0.0 ) 
          return _x2;
      
        if( y2*y0 > 0.0 )
        {
          // game over, man ... game over
          return _x0;
        }

        this.__iter = 0;
	      x1          = 0;
        x0          = _x0;
        x2          = _x2;
	      var i = 0;
	  
        while( i < _imax )
        {
          this.__iter++;
        
          x1 = 0.5 * (x2 + x0);
          y1 = _f(x1);
          if( y1 == 0.0 ) 
            return x1;
          
          if( Math.abs(x1 - x0) < _eps) 
            return x1;
          
          if( y1*y0 > 0.0 )
          {
            temp = x0;
            x0   = x2;
            x2   = temp;
            temp = y0;
            y0   = y2;
            y2   = temp;
          }
        
          y10 = y1 - y0;
          y21 = y2 - y1;
          y20 = y2 - y0;
          if( y2*y20 < 2.0*y1*y10 )
          {
            x2 = x1;
            y2 = y1;
          }
          else
          {
            b  = (x1  - x0 ) / y10;   
            c  = (y10 - y21) / (y21 * y20); 
            xm = x0 - b*y0*(1.0 - c*y1);
            ym = _f(xm);
            if( ym == 0.0 ) 
              return xm;
            
            if( Math.abs(xm - xmlast) < _eps )
              return xm;
          
            xmlast = xm;
            if( ym*y0 < 0.0 )
            {
              x2 = xm;
              y2 = ym;
            }
            else
            {
              x0 = xm;
              y0 = ym;
              x2 = x1;
              y2 = y1;
            }
          }
		
	      i++;
        }
      
        // no convergence, either a numerical problem or an issue with the interval or function
        return x1;
      }
    }
  }
  return returnedModule;
});
