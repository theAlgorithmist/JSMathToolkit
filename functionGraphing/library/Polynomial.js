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
    * Graph a simple polynomial function, c0 + c1*x + c2*x^2 + c3*x^3 + ...
    * 
    * @author Jim Armstrong (www.algorithmist.net)
    * 
    * @version 1.0
    */
    this.Polynomial = function()
    {
      // always expose this property to indicate to the GraphLayer that this is a self-plotting function
      this.selfPlot = true;
      
      // plot derivative (this will always be ignored, but is maintained for consistency with other library classes)
      this._deriv = false;
      
      this._clipped = false;
      
      // coefficients
      this._coef = [];
    }
    
    this.Polynomial.__name__ = true;
    this.Polynomial.prototype = 
    {
     /**
      * Assign function parameters
      * 
      * @param params : Object - The Polynomial function takes a single parameter, coef, which is an array of coefficients, starting with the constant term.  The degree of 
      * the polynomial is determined by the length of this array. 
      * 
      * @return Nothing - Assign function params before plotting
      */
      set_params: function(fcnParams)
      { 
        if( fcnParams.hasOwnProperty('coef') )
          this._coef = fcnParams.coef.slice();
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
	      var i;
	      var len = this._coef.length
	      
	      if( len == 0 )
	        return;  
	      
        var delta = 3/pxPerUnitX;
        
        if( delta >= 10 )
          delta = Math.round(delta);
        
        if( delta >= 0.1 )
          delta = Math.round(delta/0.1)*0.1;
        else if( delta >= 0.01 )
          delta = Math.round(delta/0.01)*0.01;
        else if( delta >= 0.001 )
          delta = Math.round(delta/0.001)*0.001;
        
        var x = graphLeft;
        var y = this._deriv ? this.eval_derivative(x) : this.eval(x);
        y     = this.__clip(y, graphBottom, graphTop);
       
        this._decorator.moveTo( g, (x-graphLeft)*pxPerUnitX, (graphTop-y)*pxPerUnitY );
        
        var wasClipped = this._clipped;  // true only if the previous point was clipped
        if( x+delta < graphRight )
        {
          for( x=graphLeft+delta; x<graphRight; x+=delta )
          {
            if( wasClipped )
              this._decorator.moveTo( g, (x-graphLeft)*pxPerUnitX, (graphTop-y)*pxPerUnitY );
            
            y = this._deriv ? this.eval_derivative(x) : this.eval(x);
            y = this.__clip(y, graphBottom, graphTop);
            
            if( !this._clipped )
              this._decorator.lineTo(g, (x-graphLeft)*pxPerUnitX, (graphTop-y)*pxPerUnitY );
            else
            {
              if( !wasClipped )
                this._decorator.lineTo(g, (x-graphLeft)*pxPerUnitX, (graphTop-y)*pxPerUnitY );
            }
            
            wasClipped = this._clipped;
          }
        }
        
        y = this._deriv ? this.eval_derivative(x) : this.eval(x);
        y = this.__clip(y, graphBottom, graphTop);
        
        if( !this._clipped )
          this._decorator.lineTo( g, (graphRight-graphLeft)*pxPerUnitX, (graphTop-y)*pxPerUnitY );
        else
        {
          if( !wasClipped )
            this._decorator.lineTo(g, (x-graphLeft)*pxPerUnitX, (graphTop-y)*pxPerUnitY );
        }
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
        var i;
        var len = this._coef.length;
        if( len > 1 )
        {
          var y = this._coef[len-1];
          for( i=len-2; i>=0; i-- )
            y = x*y + this._coef[i];

          return y;
        }
        else
          return this._coef[0];
      }
      
      // internal method - evaluate the first derivative of the polynomial at a specific x-coordinate
      , __eval_derivative: function(x)
      {
        var i;
        var len = this._c.length;
        if( len > 1 )
        {
          var y = (len-1)*this._coef[len-1];
          for( i=len-2; i>=1; i-- )
            y = x*y + i*this._coef[i];

          return y;
        }
        else
          return 0;
      }
      
      // internal function - manual clipping
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
    }
  }
  
  return returnedModule;
});