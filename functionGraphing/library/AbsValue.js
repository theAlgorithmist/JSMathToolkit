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
    * Absolute value function, a|x| + b - defaults to |x| on construction
    * 
    * @return Nothing - use the params() method to set function parameters
    */
    this.AbsValue = function()
    {
       // always expose this property to indicate to the GraphLayer that this is a self-plotting function
       this.selfPlot = true;
       
       // parameters
	     this._a = 1;
	     this._b = 0;
	     
	     // plot derivative?
	     this._deriv = false;
	     
	     // line decorator applied to plotting this function
	     this._decorator = null;
    }
    
    this.AbsValue.__name__ = true;
    this.AbsValue.prototype = 
    {
     /**
      * Assign function parameters
      * 
      * @param params : Object - The AbsValue function takes parameters 'a' and 'b'. 
      * 
      * @return Nothing - Assign function params before plotting
      */
      set_params: function(fcnParams)
      { 
        if( fcnParams == null )
          return;
      
        var a = fcnParams.hasOwnProperty("a") ? parseFloat(fcnParams.a) : this._a;
        var b = fcnParams.hasOwnProperty("b") ? parseFloat(fcnParams.b) : this._b;
        
        this._a = !isNaN(a) ? a : this._a;
        this._b = !isNaN(b) ? b : this._b;
      }
    
     /**
      * Indicate whether or not to plot the function or its derivative
      * 
      * @param derivative : Boolean - true if the function's derivative is to be plotted
      * 
      * @return Nothing
      */
      , set_derivative: function(derivative)
      {
        if( derivative == undefined )
          derivative = false;
        
        this._deriv = derivative
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
      * Evaluate the function associated with this layer
      * 
      * @param x : Number - x-coordinate
      * 
      * @return Number - f(x)
      */
      , eval: function(x)
      {
        return this._a*Math.abs(x) + this._b;
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
        var left          = graphLeft;
        var right         = 0;
        var leftIntercept = -this._a*left + this._b;
        
        // anything to display?
        if( this._b > graphTop )
          return;
        
        // plot for x < 0
        if( leftIntercept > graphTop )
        {
          left          = (graphTop - this._b)/-this._a;
          leftIntercept = graphTop;
        }
        else if( leftIntercept < graphBottom )
        {
          left          = (graphBottom - this._b)/-this._a;
          leftIntercept = graphBottom;
        }
        
        this._decorator.moveTo( g, (left-graphLeft)*pxPerUnitX, (graphTop-leftIntercept)*pxPerUnitY );
        this._decorator.lineTo( g, -graphLeft*pxPerUnitX, (graphTop-this._b)*pxPerUnitY);
        
        // plot for x >= 0
        left               = 0;
        right              = graphRight;
        var rightIntercept = this._a*graphRight + this._b;
            
        if( rightIntercept > graphTop )
        {
          right          = (graphTop - this._b)/this._a;
          rightIntercept = graphTop;
        }
        else if( rightIntercept < graphBottom )
        {
          right          = (graphBottom - this._b)/this._a;
          rightIntercept = graphBottom;
        }
               
        this._decorator.lineTo( g, (right-graphLeft)*pxPerUnitX, (graphTop-rightIntercept)*pxPerUnitY );
      }
      
      // internal method - plot derivative
      , __plotDerivative( g, left, top, right, bottom, pxPerUnitX, pxPerUnitY )
      {
        if( -this._a >= bottom && -this._a <= top )
        {
          this._decorator.moveTo( g, (left-graphLeft)*pxPerUnitX, (graphTop+this._a)*pxPerUnitY );
          this._decorator.lineTo( g, (left-graphLeft)*pxPerUnitX, (graphTop+this._a)*pxPerUnitY );
        }
        
        if( this._a >= bottom && this._a <= top )
        {
          this._decorator.moveTo( g, (right-graphLeft)*pxPerUnitX, (graphTop-this._a)*pxPerUnitY );
          this._decorator.lineTo( g, (right-graphLeft)*pxPerUnitX, (graphTop-this._a)*pxPerUnitY );
        }
      }
    }
	}
  
  return returnedModule;
});