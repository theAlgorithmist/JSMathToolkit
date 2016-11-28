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
    var shapeRef       = new shapeConstModule();
    var shapeConstants = new shapeRef.ShapeConstants();
    var PolygonRef     = new PolygonModule();
    
    function ExtendFrom(from, fields) 
    {
      function inherit() {}; inherit.prototype = from; var proto = new inherit();
      for (var name in fields) 
        proto[name] = fields[name];
      
      if( fields.toString !== Object.prototype.toString ) proto.toString = fields.toString;
      return proto;
    }
    
   /**
    * Star shape with an adjustable thickness parameter that can be used to create various types of stars, ranging from
    * nearly straight-line spokes to nearly n-gons in shape.
    * 
    * @author Jim Armstrong
    * 
    * @version 1.0
    */
    this.Star = function()
    {
      PolygonRef.Polygon.call(this);
    }
    
   /**
    * Create a new Star shape
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
    * @param params : Object The following named parameters control the Star geometry
    * 
    * "points" - Number of points in the Star (should be greater than 2).
    * 
    * "thickness - Parameter that controls the thickness and bound of the Star-points.  Values less than one keep the Star shape inside a bounding
    * circle.  Values greater than 1 extend the star's inner angles outward so that the bounding circle becomes a bound for the interior only.  A value 
    * of zero produces a series of spokes extending from the centroid of the bounding rectangle.  This parameter is currently clamped to [0.1, 1.5] 
    * and this will likely be modified in a future release.
    * 
    * @return  Polygon vertices may be queried to draw or otherwise manipulate the Star.  All 
    * generated coordinates take the bounding box into account so that the shape may be draw in the same coordinate space as the bounding rectangle without having to offset the vertex coordinates.
    * 
    */
    
    this.Star.__name__  = true;
    this.Star.__super__ = PolygonRef.Polygon;
    this.Star.prototype = ExtendFrom( PolygonRef.Polygon.prototype,
    {
      create: function(__left, __top, __right, __bottom, __params, __yDown)
      { 
	      // number of points in the star
        var n = 3;
	      if( __params.hasOwnProperty("points") )
	        n = __params.points;
	  
        // thickness defaults to 0.3 - this is a measure of the length and thickness of the spokes.  A value of 0 would degenerate to spokes that are straight lines.
        // A value of 1 creates an outward-bulging ninja-star and values out to 1.5 are currently allowed.
        var s = 0.3;
	      if( __params.hasOwnProperty("thickness") )
          s = __params.thickness;
	  
	      // clear out any existing Star data
        this.clear();
	  
	      // provide some clamping
	      s = Math.max(0.1, s);
	      s = Math.min(1.5, s);
	  
	      // radius of bounding circle
        var d1 = __right - __left;
        var d2 = __yDown ? (__bottom - __top) : (__top - __bottom);
        var d  = d1 < d2 ? d1 : d2;  // dimension of inscribed square
        var r  = 0.5*d;              // radius of bounding circle
    
        // midpoints along horizontal (x) and vertical (y) directions that correspond to the center of the n-gon
        var cx = 0.5*(__left + __right);
        var cy = 0.5*(__top + __bottom);
	
	      // angle based on number of points
        var angle     = 2*Math.PI/n;
	      var halfAngle = angle*0.5;
        var i           = 1;
        var t         = 1.5*Math.PI;  // always start at 3pi/2, i.e. first vertex straight-up since we're doing y-down only in the beta release.
        var theta     = t+halfAngle;
	
	      // first out-stroke primes the algorithm
        this._xcoord.push(cx);
        if( __yDown )
          this._ycoord.push(cy - r);
        else
          this._ycoord.push(cy + r);
	  
	      d = s*r;
    
        this._xcoord.push( d*Math.cos(theta) + cx );
        this._ycoord.push( d*Math.sin(theta) + cy );
      
	      // loop over in/out
        while( i < n )
        {
          t    += angle;
	        theta = t + halfAngle;
      
	        // in-stroke is similar to regular n-gon 
          this._xcoord.push( r*Math.cos(t) + cx );
          this._ycoord.push( r*Math.sin(t) + cy );
	  
	        // out-stroke
	        this._xcoord.push( d*Math.cos(theta) + cx );
	        this._ycoord.push( d*Math.sin(theta) + cy );
      
          i++;
        }
      }
    });
  }
  
  return returnedModule;
});
