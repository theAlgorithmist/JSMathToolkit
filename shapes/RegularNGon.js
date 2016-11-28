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
    * RegularNGon is a closed polygonal shape that represents a regular n-gon (n >= 4) .  The minimal dimension of the bounding rectangle is used to
    * define the radius of the bounding circle for the n-gon.  The n-gon is centered at the geometric center of the bounding rectangle.
    * 
    * @author Jim Armstrong (www.algorithmist.net)
    * 
    * @version 1.0
    * 
    */
    this.RegularNGon = function()
    {
      PolygonRef.Polygon.call(this);
    }
     
    this.RegularNGon.__name__  = true;
    this.RegularNGon.__super__ = PolygonRef.Polygon;
    this.RegularNGon.prototype = ExtendFrom( PolygonRef.Polygon.prototype,
    {
     /**
      * Create a regular N-Gon
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
      * @param params : Object The following named parameters control the N-Gon geometry
      * 
      * "sides" - Number of sides of the n-gon (should be greater than 3).  A value of 4 produces a diamond shape.
      * 
      * @return  Polygon - vertices may be queried to draw or otherwise manipulate the RegularNGon.  All generated coordinates take the bounding box into account 
      * so that the n-gon may be draw in the same coordinate space as the bounding rectangle without having to offset the vertex coordinates.
      * 
      * @author Jim Armstrong (www.algorithmist.net)
      * 
      * @version 1.0
      * 
      */
      create: function( __left, __top, __right, __bottom, __params, __yDown)
      {
        this.SQRT_2  = 1.41421356237;
  
        if( __right <= __left )
	        return;
	  
	      if( __yDown && (__top >= __bottom) )
	        return;
	  
	      if( !__yDown && (__top <= __bottom) )
	        return;
	  
	      var n = 4;
	      if( __params.hasOwnProperty("sides") )
	        n = __params.sides;
	  
	      n = n < 4 ? 4 : n;
	  
	      // clear out any existing triangle data
        this.clear();
	
	      // radius of bounding circle
	      var d1 = __right - __left;
        var d2 = __yDown ? (__bottom - __top) : (__top - __bottom);
	      var d  = d1 < d2 ? d1 : d2;  // dimension of inscribed square
	      var r  = 0.5*d;              // radius of bounding circle
	
	      // midpoints along horizontal (x) and vertical (y) directions that correspond to the center of the n-gon
	      var cx = 0.5*(__left + __right);
	      var cy = 0.5*(__top + __bottom);
	
	      // angle based on number of sides
	      var angle = 2*Math.PI/n;
	      var i     = 1;
	      var t     = 1.5*Math.PI;  // always start at 3pi/2, i.e. first vertex straight-up.
	
	      this._xcoord.push(cx);
	      if( __yDown )
	        this._ycoord.push(cy - r);
	      else
	        this._ycoord.push(cy + r);
	  
	      while( i < n )
	      {
          t += angle;
	  
          this._xcoord.push( r*Math.cos(t) + cx );
	        this._ycoord.push( r*Math.sin(t) + cy );
	  
          i++;
	      }
      }
    });
  }
  
  return returnedModule;
});
