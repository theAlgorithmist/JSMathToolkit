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

define(['./ShapeConstants', './Polygon'], function (shapeConstModule, PolygonModule) 
{
  var returnedModule = function () 
  {
    var shapeConstantsRef = new shapeConstModule();
    var shapeConstants    = new shapeConstantsRef.ShapeConstants();
    var PolygonRef        = new PolygonModule();
    
    function ExtendFrom(from, fields) 
    {
      function inherit() {}; inherit.prototype = from; var proto = new inherit();
      for (var name in fields) 
        proto[name] = fields[name];
      
      if( fields.toString !== Object.prototype.toString ) proto.toString = fields.toString;
      return proto;
    }
    
   /**
    * Arrow is a closed polygonal shape that may be oriented upward, downward, left, or right and whose specific geometry is controlled by a bounding rectangle 
    * and a small set of parameters.
    * 
    * @author Jim Armstrong (www.algorithmist.net)
    * 
    * @version 1.0
    * 
    */
    this.Arrow = function()
    {
      PolygonRef.Polygon.call(this);
    }
  
    this.Arrow.__name__  = true;
    this.Arrow.__super__ = PolygonRef.Polygon;
    this.Arrow.prototype = ExtendFrom( PolygonRef.Polygon.prototype,
    {
     /**
      * Create a new arrow from a set of bounding and shape parameters - this action clears any previously-defined arrow data.
      * 
      * @param left : Float x-coordinate of top-left corner of bounding box
      * 
      * @param top : Float y-coordinate of top-left corner of bounding box
      * 
      * @param right : Float x-coordinate of bottom-right corner of bounding box
      * 
      * @param bottom : Float y-coordinate of bottom-right corner of bounding box
      * 
      * @param yDown : Boolean true of the rendering coordinate system is y-down, which is true for many browser-based environments (defaults to true)
      * 
      * @param params : Object The following named parameters control the arrow geometry
      * 
      * shapeConstants.ORIENT - Value should be one of shapeConstants.UP, shapeConstants.DOWN, shapeConstants.LEFT, shapeConstants.RIGHT (invalid entry defaults to shapeConstants.UP)
      * shapeConstants.MAJOR  - Number in (0,1) indicating fraction of major orientation length assigned to arrow bar (remainder to arrow head).
      * shapeConstants.MINOR  - Number in (0,1) indicating fraction of minor orientation length assigned to arrow bar (remainder to arrow head).
      * 
      * @return Polygon - Vertices may be queried to draw or otherwise manipulate the Arrow.  No action is taken if bounding box or parameters are invalid.  All generated 
      * coordinates take the bounding box into account so that the arrow may be draw in the same coordinate space as the bounding rectangle without having to offset the 
      * vertex coordinates.
      */
      create: function(__left, __top, __right, __bottom, __params, __yDown)
      {
        if( __right <= __left )
          return;
    
        if( __yDown && (__top >= __bottom) )
          return;
    
        if( !__yDown && (__top <= __bottom) )
          return;
  
        var orient = __params.orient;
        if( orient == null )
          orient = shapeConstants.UP;
    
        var major = __params.major;
        if( isNaN(major) )
          major = 0.7;
    
        var minor = __params.minor;
        if( isNaN(minor) )
          minor = 0.7;
    
        // clear out any existing arrow data
        this.clear();
  
        // clamp the major/minor params
        major = Math.max(0.05, major);
        major = Math.min(0.95, major);
        minor = Math.max(0.05, minor);
        minor = Math.min(0.95, minor);
  
        var horRatio  = major;
        var vertRatio = 1-minor;
  
        // these control the actual arrow geometry
        var h      = Math.abs(__bottom - __top);
        var hr     = 0.5*h*vertRatio;
        var middle = __yDown ? __top + 0.5*h : __bottom + 0.5*h;
        var w      = __right - __left;
        var wr     = w*horRatio;
  
        if( orient == shapeConstants.LEFT )
        {
          this._xcoord.push(__right);
          this._ycoord.push(__top+hr);
    
          this._xcoord.push(__right-wr);
          this._ycoord.push(__top+hr);
    
          this._xcoord.push(__right-wr);
          this._ycoord.push(__top);
    
          this._xcoord.push(__left);
          this._ycoord.push(middle);
      
          this._xcoord.push(__right-wr);
          this._ycoord.push(__bottom);
      
          this._xcoord.push(__right-wr);
          this._ycoord.push(__bottom-hr);
      
          this._xcoord.push(__right);
          this._ycoord.push(__bottom-hr);
        }
        else if( orient == shapeConstants.RIGHT )
        {
          this._xcoord.push(__left); 
          this._ycoord.push(__top+hr);
    
          this._xcoord.push(__left+wr); 
          this._ycoord.push(__top+hr);
    
          this._xcoord.push(__left+wr); 
          this._ycoord.push(__top);
    
          this._xcoord.push(__right); 
          this._ycoord.push(middle);
    
          this._xcoord.push(__left+wr); 
          this._ycoord.push(__bottom );
    
          this._xcoord.push(__left+wr); 
          this._ycoord.push(__bottom-hr);
    
          this._xcoord.push(__left); 
          this._ycoord.push(__bottom-hr);
        }
        else if( orient == shapeConstants.UP )
        {
          // rotate the horizontal bounding box pi/2 so that 'right' now faces down 
          w      = __right - __left;
          wr     = 0.5*w*vertRatio;
          middle = __left + 0.5*w;
          h      = __bottom - __top;
          hr     = h*horRatio;
    
          this._xcoord.push(__left+wr); 
          this._ycoord.push(__bottom);
    
          this._xcoord.push(__left+wr); 
          this._ycoord.push(__bottom-hr);
    
          this._xcoord.push(__left); 
          this._ycoord.push(__bottom-hr);
    
          this._xcoord.push(middle); 
          this._ycoord.push(__top);
    
          this._xcoord.push(__right); 
          this._ycoord.push(__bottom-hr);
    
          this._xcoord.push(__right-wr); 
          this._ycoord.push(__bottom-hr);
    
          this._xcoord.push(__right-wr); 
          this._ycoord.push(__bottom);
        }
        else if( orient == shapeConstants.DOWN )
        {
          // rotate the horizontal bounding box pi/2 so that 'right' now faces down 
          w      = __right - __left;
          wr     = 0.5*w*vertRatio;
          middle = __left + 0.5*w;
          h      = __bottom - __top;
          hr     = h*horRatio;
    
          this._xcoord.push(__left+wr);
          this._ycoord.push( __top);
    
          this._xcoord.push(__right-wr); 
          this._ycoord.push(__top);
    
          this._xcoord.push(__right-wr);
          this._ycoord.push(__top+hr);
    
          this._xcoord.push(__right); 
          this._ycoord.push(__top+hr);
    
          this._xcoord.push(middle);
          this._ycoord.push(__bottom);
    
          this._xcoord.push(__left); 
          this._ycoord.push(__top+hr);
    
          this._xcoord.push(__left+wr ); 
          this._ycoord.push(__top+hr);
        }
      }
    });
  }
  
  return returnedModule;
});
