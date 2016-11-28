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

define(['../../utils/GeomUtils'], function (utilsModule) 
{
  var returnedModule = function () 
  {
    var utilsRef    = new utilsModule();
    var __geomUtils = new utilsRef.GeomUtils();
    
   /**
    * A step function is defined by linear functions over specific (open or closed) intervals, f(x) = m(i)*x + y(i).  An interval may be unbounded to the left or right
    * by using the special identifiers '-inf' and 'inf', respectively.  See the set_params() method for more information on how to define intervals.
    * 
    * Derivative plotting is not yet supported since plotting of the derivative of linear step function is of little value as it is a constant over the interval.  The eval()
    * method will also be implemented at a later time.
    * 
    * @author Jim Armstrong (www.algorithmist.net)
    * 
    * @version 1.0
    */
    this.StepFunction = function()
    {
      // always expose this property to indicate to the GraphLayer that this is a self-plotting function
      this.selfPlot = true;
      
      // plot derivative?
      this._deriv = false;
      
      this._clipped   = false;
      this._intervals = [];    // collection of IntervalData references that represent all intervals in the step function
    }
    
    this.StepFunction.__name__ = true;
    this.StepFunction.prototype = 
    {
     /**
      * Assign function parameters
      * 
      * @param params : Object - The Step function takes parameters 'intervals', which is an array of IntervalData instances that define each interval to be plotted. 
      * 
      * @return Nothing - Assign function params before plotting
      */
      set_params: function(fcnParams)
      { 
        if( fcnParams == null )
          return;
     
        if( fcnParams.hasOwnProperty('intervals') )
          this._intervals = fcnParams.intervals.slice();
      }

     /**
      * Indicate whether or not to plot the function or its derivative (derivative plotting not supported in the current release)
      * 
      * @param derivative : Boolean - true if the function's derivative is to be plotted
      * 
      * @return Nothing
      */
      , set_derivative: function(derivative)
      { 
        if( derivative == undefined )
          derivative = false;
       
        this._deriv = derivative;
      }

     /**
      * Assign a line decorator to this function
      * 
      * @param decorator : Function - Reference to a jsMathToolkit line decorator
      * 
      * @return Nothing - An internal reference is set to the line decorator, which is externally created
      */
      , set_decorator: function(decorator)
      {
        if( decorator != null )
          this._decorator = decorator;
      }
      
     /**
      * Plot the function over the specified range
      * 
      * @param g : Graphics - Graphics context for the plot, which will be completely prepared for plotting in advance.
      * 
      * @param left : Number - x-coordinate of the upper, left-hand corner of the graph range
      * 
      * @param top : Number - y-coordinate of the upper, left-hand corner of the graph range
      * 
      * @param right : Number - x-coordinate of the lower, right-hand corner of the graph range
      * 
      * @param bottom : Number - y-coordinate of the lower, right-hand corner of the graph range
      * 
      * @param pxPerUnitX : Number - Number of pixels per unit x, which is used to compute the sampling granularity
      * 
      * @param pxPerUnitY : Number - Number of pixels per unit y
      * 
      * @return Nothing - The function is plotted over the supplied interval using the supplied graphic context - line properties should be set in advance of call
      */
      , plot: function( g, graphLeft, graphTop, graphRight, graphBottom, pxPerUnitX, pxPerUnitY )
      {
        // plot each visible interval
	      var intervals = this.__getIntervals(graphLeft, graphRight);
	     
	      var len = intervals.length;
	      if( len == 0 )
	        return;
	      
	      var i, int, fb;
	      var a, b, m, y;
	      var leftX, rightX;
	      var leftY, rightY;
	      var points;
	      var px1, py1, px2, py2;
	      
	      for( i=0; i<len; ++i )
	      {
	        // reference to current interval
	        int = intervals[i];
	        a   = int.get_a();
	        b   = int.get_b();
	        m   = int.get_m();
	        y   = int.get_y();   // y at x=a
	        
	        // f(b)
	        fb = y + m*(b-a);
	            
	        // manually clip since there may eventually be multiple graph areas in a single Canvas, so do not count on automatic clipping at the Convas extents
	        
	        // is the interval entirely inside the graph area?
	        if( a >= graphLeft && b <= graphRight )
	        {
	          this._decorator.moveTo( g, (a-graphLeft)*pxPerUnitX, (graphTop-y)*pxPerUnitY );
            this._decorator.lineTo( g, (b-graphLeft)*pxPerUnitX, (graphTop-fb)*pxPerUnitY );
	        }
	        // does the line segment from (a, f(a)) to (b, f(b)) intersect the visible graph box?
	        else if( __geomUtils.intersectBox( a, y, b, fb, graphLeft, graphTop, graphRight, graphBottom, false ) )
	        {
	          // get the exact intersection points
	          var points = __geomUtils.lineRectIntersection( a, y, b, fb, graphLeft, graphTop, graphRight, graphBottom );
	          
	          if( points.x2 == null )
	          {
	            // which interval endpoint is visible?
	            if( a < graphLeft && b >= graphLeft )
	            {
	              px1 = points.x1;
	              py1 = points.y1;
	              px2 = b;
	              py2 = fb;
	            }
	            else if( a < graphRight && b >= graphRight )
	            {
	              px1 = a;
	              py1 = y;
	              px2 = points.x1;
	              py2 = points.y1;
	            }
	          }
	          else
	          {
	            px1 = points.x1;
	            py1 = points.y1;
	            px2 = points.x2;
	            py2 = points.y2;
	          }
	            
	          this._decorator.moveTo( g, (px1-graphLeft)*pxPerUnitX, (graphTop-py1)*pxPerUnitY );
	          this._decorator.lineTo( g, (px2-graphLeft)*pxPerUnitX, (graphTop-py2)*pxPerUnitY );
	        }
	        
	        // render the dots at interval endpoints, if visible in graph area
          if( int.leftDot && a != -Number.MAX_VALUE && a >= graphLeft && a <= graphRight )
          {
            y = this.__clip( y, graphBottom, graphTop );
            if( !this._clipped )
            {
              g.moveTo( (a-graphLeft)*pxPerUnitX, (graphTop-y)*pxPerUnitY );
            
              if( int.leftClosed )
                g.beginFill( int.fillValue );
          
              g.drawCircle( (a-graphLeft)*pxPerUnitX, (graphTop-y)*pxPerUnitY, int.dotRadius);
             
              if( int.leftClosed )
                g.endFill();
            }
          }
          
          if( int.rightDot && b != Number.MAX_VALUE && b >= graphLeft && b <= graphRight )
          {
            y = this.__clip( fb, graphBottom, graphTop );
            if( !this._clipped )
            {
              g.moveTo( (b-graphLeft)*pxPerUnitX, (graphTop-y)*pxPerUnitY );
            
              if( int.rightClosed )
                g.beginFill( int.fillValue );
            
              g.drawCircle( (b-graphLeft)*pxPerUnitX, (graphTop-y)*pxPerUnitY, int.dotRadius);
             
              if( int.rightClosed )
                g.endFill();
            }
	        }
	      }
      }
      
      // internal method - clip y-values
      , __clip: function(y, bottom, top)
      {
        if( isNaN(y) )
        {
          this._clipped = true;
          return top;
        }
        
        // since the sampling granularity is sufficiently small, we can get away with just marking the clip and setting y to the upper or lower bound
        if( y < bottom )
        {
          this._clipped = true;
          return bottom;
        }
        else if ( y > top )
        {
          this._clipped = true;
          return top;
        }
        
        this._clipped = false;
        return y;
      }
    
      // internal method - return a list of all intervals that are at least partially visible in the current display range and their corresponding function
      // references
      , __getIntervals: function(left, right)
      {
        var interval = [];
        var i;
        var len = this._intervals.length;
        var int, a, b;
        
        for( i=0; i<len; ++i )
        {
          int = this._intervals[i];
          a   = int.get_a();
          b   = int.get_b();
          
          if( !(b < left || a > right) )
            interval.push(int);
        }
        
        return interval;
      }
	  }
  }
  
  return returnedModule;
});