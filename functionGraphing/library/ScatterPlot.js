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
    * Graph a circle at each data point that falls within the the visible graph limits.  The x-coordinates are presumed to be time-series or similar data in which
    * those coordinates are naturally sorted in ascending order.  A future version may work with unsorted data.  Sorting is important to fast clipping in the event
    * a graph does not consume the entire Canvas limits (i.e. multiple graphs per canvas).
    * 
    * An eval() method is not supported at this time.
    * 
    * @author Jim Armstrong (www.algorithmist.net)
    * 
    * @version 1.0
    */
    this.ScatterPlot = function()
    {
      // always expose this property to indicate to the GraphLayer that this is a self-plotting function
      this.selfPlot = true;
      
      // plot derivative (this will always be ignored, but is maintained for consistency with other library classes)
      this._deriv = false;
      
      // plotting properties
      this._fillColor = '#00ff00';
      this._radius    = 4;
      
      // (x,y) coordinates
      this._x = [];
      this._y = [];
      
      // clipping
      this._xLeft = -1;    // index into x-coordinate list where graph was last clipped at the left-most extent
      this._xRight= -1;    // index into x-coordinate list where graph was last clipped at the right-most extent
    }
    
    this.ScatterPlot.__name__ = true;
    this.ScatterPlot.prototype = 
    {
     /**
      * Assign function parameters
      * 
      * @param params : Object - The Scatterplot function takes four parameters, a 'fillColor' (String hex code), 'radius' (dot radius - will always be clipped to a maximum of 2), 
      * 'xData' (array of x-coordinates) and 'yData' (array of y-coordinates)
      * 
      * @return Nothing - Assign function params before plotting
      */
      set_params: function(fcnParams)
      { 
        if( fcnParams == null )
          return;
     
        if( fcnParams.hasOwnProperty('fillColor') )
          this._fillColor = fcnParams.fillColor;
        
        if( fcnParams.hasOwnProperty('radius') )
          this._radius = isNaN(fcnParams.radius) ? this_radius : Math.max( 2, parseFloat(fcnParams.radius) );
        
        if( fcnParams.hasOwnProperty('xData') )
        {
          this._x      = fcnParams.xData.slice();
          this._xLeft  = -1;
          this._xRight = -1;
        }
        
        if( fcnParams.hasOwnProperty('yData') )
        {
          this._y      = fcnParams.yData.slice();
          this._xLeft  = -1;
          this._xRight = -1;
        }
      }
    
      // for compatibility with function graphing engine only
      , set_derivative: function(derivative)
      {
        // empty
      }
      
      , set_decorator: function(decorator)
      {
        // empty
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
	      this.__clipLeft(graphLeft, graphRight);
	      this.__clipRight(graphLeft, graphRight);
	      
	      g.clear();
	      if( this._xLeft == -1 && this._xRight == -1 )
	        return;
	      
	      var i;
	      var x,y;
	      for( i=this._xLeft; i<=this._xRight; ++i )
	      {
	        x = (this._x[i]-graphLeft)*pxPerUnitX;
          y = (graphTop-this._y[i])*pxPerUnitY;
          
          g.moveTo(x,y);
          
          g.beginFill(this._fillColor);
          g.drawCircle( x, y, this._radius );
          g.endFill();
	      }
      }
      
	    // internal method - lowest index at which the x-coordinate is greater than or equal to the left bound or number of points-1 if the final data point lies to the left 
      // of visible graph range
	    , __clipLeft: function(graphLeft, graphRight)
	    {
	      var i     = 0;
	      var index = 0;
	      var len   = this._x.length;
		    var xl;
		    
        if( len == 0 )
	      {
	        this._xLeft = -1;
		      return;
	      }
		
        // check for outside visible graph range first
	      if( this._x[len-1] < graphLeft )
	      {
	        this._xLeft = len-1;
		      return;
        }
		
	      if( this._xLeft == -1 )
	      {
		      for( i=0; i<len; ++i )
		      {
		        if( this._x[i] >= graphLeft )
		        {
		          index = i;
			        break;
		        }
		      }
	      }
	      else
	      {
	        // new left-most graph extent < or > than the current x-coordinate?
		      xl    = this._x[this._xLeft];
          index = this._xLeft;
		      if( xl > graphLeft && this._xLeft != 0 )
		      {
		        // panned right - left bound decreased
		        for( i=this._xLeft; i>=0; i-- )
		        {
		          if( this._x[i] < graphLeft )
			        {
			          index = i == 0 ? i : i+1;
			          break;
		          }
		        }
		      }
		      else
		      {
		        if( this._xLeft != len-1 )
		        {
		          for( i=this._xLeft; i<len; ++i )
		          {
		            if( this._x[i] >= graphLeft )
			          {
			            index = i;
			            break;
		            }
		          }
		        }
		      }
	      }
	  
	      this._xLeft = index;
	    }
	
	    // internal method - greatest index at which the x-coordinate is less than or equal to the right bound or 0 if the first data point is to the right of the visible graph range
	    , __clipRight(graphLeft, graphRight)
	    {
	      var i     = 0;
	      var index = 0;
	      var len   = this._x.length;
		    var xr;
		    
	      if( len == 0 )
	      {
	        this._xRight = -1;
		      return;
        }
		
        // check if outside visible graph range
	      if( this._x[0] > graphRight )
	      {
	        this._xRight = 0;
		      return;
        }
	  	
        if( this._xRight == -1 )
	      {
		      for( i=len-1; i>=0; i-- )
		      {
		        if( this._x[i] <= graphRight )
		        {
		          index = i;
		          break;
            }
		      }
	      }
	      else
	      {
	        // new right-most graph extent < or > than current x-value?
		      var xr = this._x[this._xRight];
          index  = this._xRight;
		      if( xr <= graphRight )
		      {
		        for( i=len-1; i>this._xRight; i-- )
		        {
		          if( this._x[i] <= graphRight )
			        {
			          index = i;
			          break;
		          }
		        }
          }
		      else
		      {
		        for( i=this._xRight; i>=0; i-- )
		        {
		          if( this._x[i] <= graphRight )
			        {
			          index = i;
			          break;
              }
		        }
		      }
	      }
	  
        this._xRight = index;
	    }
    }
  }
  
  return returnedModule;
});