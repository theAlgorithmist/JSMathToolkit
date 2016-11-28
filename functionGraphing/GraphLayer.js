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

define(['../core/decorators/SolidLineDecorator', 
        '../core/decorators/DashedLineDecorator', 
        '../core/decorators/DottedLineDecorator'
        ], 
        function (SolidLineModule, DashedLineModule, DottedLineModule) 
{
  var returnedModule = function () 
  {
    var solidLine  = new SolidLineModule();
    var dashedLine = new DashedLineModule();
    var dottedLine = new DottedLineModule();
    
   /**
    * A single graph layer for a single function in the Function Graphing engine
    * 
    * @author Jim Armstrong (www.algorithmist.net)
    * 
    * @version 1.0
    */
    this.GraphLayer = function(shape)
    {
      this.SOLID  = 0;
      this.DASHED = 1;
      this.DOTTED = 2;
      
      // true if current point was clipped (y-coordinate out of bounds)
      this._clipped = false;
      
      // true if auto-estimate and plot derivative
      this._deriv = false;
      
      // color and line thickness
      this._color     = "#0000ff";
      this._thickness = 2;
      
      // decorator pool - only create decorators once in case the user switches back and forth between line decorators a lot for the same plot
      this._decoratorPool = {};
      
      // line decorator for this layer - a SolidLine decorator is applied by default
      this._decorator  = new solidLine.SolidLineDecorator(); 
      
      this._isFreeform = false;   // true if the function is defined freeform, in which case evaluations are performed via the FunctionParser's evaluate method
      this._f          = null;    // reference to a function with a single argument, x, or a reference to a FunctionParser instance
    }
    
    this.GraphLayer.__name__ = true;
    this.GraphLayer.prototype = 
    {
     /**
      * Assign line properties
      * 
      * @param color : String - Color used to plot this function, i.e. #XXYYZZ
      * 
      * @param thickness : Int - Line thickness for the plot - must be greater than zero
      */
      set_lineProperties: function(color, thickness)
      {
        if( color != undefined )
          this._color = color;
        
        this._thickness = isNaN(thickness) ? this._thickness : Math.max(1,thickness);
      }
    
     /**
      * Indicate that a numerical approximation to the function's derivative is to be plotted instead of the function
      * 
      * @param derivative : Boolean - true if the function's derivative is to be estimated and plotted instead of the actual function
      * 
      * @return Nothing 
      */
      , set_derivative: function(derivative)
      {
        this._deriv = derivative != undefined ? derivative : false;
      }
      
     /**
      * Assign a new line decorator for this layer
      * 
      * @param decorator : Function - Reference to one of the decorator codes, SOLID, DASHED or DOTTED
      * 
      * @return Nothing - Assigns a new line decorator 
      */
      , set_decorator: function(decorator)
      {
        switch( decorator )
        {
          case this.SOLID:
            if( this._decoratorPool.hasOwnProperty(this.SOLID) )
              this._decorator = this._decoratorPool[this.SOLID];
            else
            {
              this._decorator = new solidLine.SolidLineDecorator(); 
              this._decoratorPool[this.SOLID] = this._decorator;
            }
          break;
          
          case this.DASHED:
            if( this._decoratorPool.hasOwnProperty(this.DASHED) )
              this._decorator = this._decoratorPool[this.DASHED];
            else
            {
              this._decorator = new dashedLine.DashedLineDecorator(); 
              this._decoratorPool[this.DASHED] = this._decorator;
            }
          break;
          
          case this.DOTTED:
            if( this._decoratorPool.hasOwnProperty(this.DOTTED) )
              this._decorator = this._decoratorPool[this.DOTTED];
            else
            {
              this._decorator = new dottedLine.DottedLineDecorator(); 
              this._decoratorPool[this.DOTTED] = this._decorator;
            }
          break;
        }
      }
     
     /**
      * Set the function used to plot or graph this layer
      * 
      * @param f : Function - Reference to a FunctionParser instance or a function that takes a single argument and returns f(x).  The function may be self-plotting in
      * which case it must expose a 'plot' method that takes a reference to a graphic context as well as the arguments exposed in the plot() method, below.
      * 
      * @param freeform : Boolean - True if the function reference is to a FunctionParser instance, in which case the function is freeform - entered by hand
      * 
      * @return Nothing
      */
      , set_function: function( f, freeform )
      {
        if( freeform == undefined )
          freeform = false;
        
        this._f          = (f == null) ? this._f : f;
        this._isFreeform = freeform;
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
        if( this._isFreeform )
          return this_f.eval([x]);
        
        if( this._f.hasOwnProperty('selfPlot') )
          return this._f.eval(x);
        else
          return this._f(x);
      }
      
     /**
      * Plot the function over the specified range
      * 
      * @param g : Graphics - Graphics context for the plot
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
      * @return Nothing - The function is plotted over the supplied interval using the graphic context supplied at construction as well as the 
      * current line decorator and function evaluator.  The graphic context will be cleared before plotting and it is the caller's responsibility
      * to update the stage after the plot returns.
      */
      , plot: function( g, left, top, right, bottom, pxPerUnitX, pxPerUnitY )
      {
        if( g == null || this._f == null )
          return;
        
        this._decorator.clear(g);
        
        // set the graphic properties for this layer
        g.setStrokeStyle( this._thickness );
        g.beginStroke( this._color, 1 );
        
        // is the function self-plotting?  yeah, we like that :)
        if( this._f.hasOwnProperty("selfPlot") )
        {
          this._f.set_derivative(this._deriv);
          this._f.set_decorator(this._decorator);
          this._f.plot( g, left, top, right, bottom, pxPerUnitX, pxPerUnitY );
          
          g.endStroke();
          
          return;
        }
        
        if( this._deriv )
        {
          this.__plotDerivative( g, left, top, right, bottom, pxPerUnitX, pxPerUnitY );
          g.endStroke();
          
          return;
        }
        
        // set the sampling granularity from the the pxPerUnitX.
        var delta = 3/pxPerUnitX;
        
        if( delta >= 10 )
          delta = Math.round(delta);
        
        if( delta >= 0.1 )
          delta = Math.round(delta/0.1)*0.1;
        else if( delta >= 0.01 )
          delta = Math.round(delta/0.01)*0.01;
        else if( delta >= 0.001 )
          delta = Math.round(delta/0.001)*0.001;
        
        var x = left;
        var y = this._isFreeform ? this._f.evaluate( [left] ) : this._f(left);
        y     = this.__clip(y, bottom, top);
       
        this._decorator.moveTo( g, (x-left)*pxPerUnitX, (top-y)*pxPerUnitY );
        
        var v = [];
        var wasClipped = this._clipped;  // true only if the previous point was clipped
        if( x+delta < right )
        {
          for( x=left+delta; x<right; x+=delta )
          {
            if( wasClipped )
              this._decorator.moveTo( g, (x-left)*pxPerUnitX, (top-y)*pxPerUnitY );
            
            if( this._isFreeform )
            {
              v[0] = x;
              y    = this._f.evaluate(v);
            }
            else 
              y = this._f(x);
            
            y = this.__clip(y, bottom, top);
            
            if( !this._clipped )
              this._decorator.lineTo(g, (x-left)*pxPerUnitX, (top-y)*pxPerUnitY );
            else
            {
              if( !wasClipped )
                this._decorator.lineTo(g, (x-left)*pxPerUnitX, (top-y)*pxPerUnitY );
            }

            wasClipped = this._clipped;
          }
        }
        
        y = this._isFreeform ? this._f.evaluate([right]) : this._f(right);
        y = this.__clip(y, bottom, top);
        
        if( !this._clipped )
          this._decorator.lineTo( g, (right-left)*pxPerUnitX, (top-y)*pxPerUnitY );
        else
        {
          if( !wasClipped )
            this._decorator.lineTo(g, (x-left)*pxPerUnitX, (top-y)*pxPerUnitY );
        }
        
        g.endStroke();
      }
      
      // internal method - handle clipping (placing in a method makes it easier to follow the plotting code and isolate changes into one place)
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

      // internal method - plot approximation to the function's derivative over the range - this presumes the derivative is continuous over the range
      , __plotDerivative: function( g, left, top, right, bottom, pxPerUnitX, pxPerUnitY )
      {
        // for now, use the same sample granularity, but leave the code separate since it is likely to change
        var delta = 3/pxPerUnitX;
        
        if( delta >= 10 )
          delta = Math.round(delta);
        
        if( delta >= 0.1 )
          delta = Math.round(delta/0.1)*0.1;
        else if( delta >= 0.01 )
          delta = Math.round(delta/0.01)*0.01;
        else if( delta >= 0.001 )
          delta = Math.round(delta/0.001)*0.001;
        
        // derivative evaluations use a high-order central-difference method (may allow some flexibility in future choice)- the subtle issue here is to get freeform 
        // function evaluations and standard functions of a single variable to play nicely together.
        
        // in-line the high-order central-difference formula
        // var h2 = h+h;
        // return ( -f(x+h2) + 8.0*f(x+h) -8.0*f(x-h) + f(x-h2) ) / (12.0*h);
        var h  = 2.0*delta;
        var h2 = h+h;
        
        var x = left;
        var y;
        
        if( this._isFreeform )
          y = ( -this._f.evaliate([left+h2]) + 8.0*this._f.evaluate([left+h]) -8.0*this._f.evaluate([left-h]) + this._f.evaluate([left-h2]) ) / (12.0*h);
        else
          y = ( -this._f(left+h2) + 8.0*this._f(left+h) -8.0*this._f(left-h) + this._f(left-h2) ) / (12.0*h);
        
        y = this.__clip(y, bottom, top);
       
        this._decorator.moveTo( g, (x-left)*pxPerUnitX, (top-y)*pxPerUnitY );
        
        var wasClipped = this._clipped;  // true only if the previous point was clipped
        if( x+delta < right )
        {
          for( x=left+delta; x<right; x+=delta )
          {
            if( wasClipped )
              this._decorator.moveTo( g, (x-left)*pxPerUnitX, (top-y)*pxPerUnitY );
            
            if( this._isFreeform )
              y = ( -this._f.evaliate([x+h2]) + 8.0*this._f.evaluate([x+h]) -8.0*this._f.evaluate([x-h]) + this._f.evaluate([x-h2]) ) / (12.0*h);
            else
              y = ( -this._f(x+h2) + 8.0*this._f(x+h) -8.0*this._f(x-h) + this._f(x-h2) ) / (12.0*h);
            
            y = this.__clip(y, bottom, top);
            
            if( !this._clipped )
              this._decorator.lineTo(g, (x-left)*pxPerUnitX, (top-y)*pxPerUnitY );
            else
            {
              if( !wasClipped )
                this._decorator.lineTo(g, (x-left)*pxPerUnitX, 0 );
            }

            wasClipped = this._clipped;
          }
        }
        
        if( this._isFreeform )
          y = ( -this._f.evaliate([right+h2]) + 8.0*this._f.evaluate([right+h]) -8.0*this._f.evaluate([right]) + this._f.evaluate([right-h2]) ) / (12.0*h);
        else
          y = ( -this._f(right+h2) + 8.0*this._f(right+h) -8.0*this._f(right-h) + this._f(right-h2) ) / (12.0*h);
        
        y = this.__clip(y, bottom, top);
        
        if( !this._clipped )
          this._decorator.lineTo( g, (right-left)*pxPerUnitX, (top-y)*pxPerUnitY );
        else
        {
          if( !wasClipped )
            this._decorator.lineTo(g, (x-left)*pxPerUnitX, 0 );
        }
      }
    }
  }
  
  return returnedModule;
});