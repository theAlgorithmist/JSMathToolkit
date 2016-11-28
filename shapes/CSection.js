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
    * CSection is a closed polygonal C-section shape, often used in drafting.  The bounding rectangle completely defines the C-section along
    * with orientation (left/right/up/down) and thickness parameters.
    * 
    * @author Jim Armstrong (www.algorithmist.net)
    * 
    * @version 1.0
    */
    this.CSection = function(__left, __top, __right, __bottom, __params, __yDown)
    {
      PolygonRef.Polygon.call(this);
    }
    
    this.CSection.__name__  = true;
    this.CSection.__super__ = PolygonRef.Polygon;
    this.CSection.prototype = ExtendFrom( PolygonRef.Polygon.prototype,
    {
     /**
      * Create a new C-Section
      * 
      * @param left : Float x-coordinate of top-left corner of bounding box
      * 
      * @param top : Float y-coordinate of top-left corner of bounding box
      * 
      * @param right : Float x-coordinate of bottom-right corner of bounding box
      * 
      * @param bottom : Float y-coordinate of bottom-right corner of bounding box
      * 
      * @param yDown : Boolean true of the rendering coordinate system is y-down, which is true for many browser-based environments (defaults to true) - yDown = true is only option currently implemented
      * 
      * @param params : Object The following named parameters control the C-Section geometry
      * 
      * "thickness" - Pixel thickness of the C-section, which must be two or greater (some compensation will be applied if selected thickness causes the section to exceed the bounding 
      * rectangle, but a minimum of 2px is always enforced).
      * 
      * shapeConstants.ORIENT - Value should be one of shapeConstants.UP, shapeConstants.DOWN, shapeConstants.LEFT, shapeConstants.RIGHT (invalid entry defaults to shapeConstants.RIGHT)
      * 
      * @return Polygon - Vertices may be queried to draw or otherwise manipulate the CSection.  All generated coordinates take the bounding box into account so that the section
      * may be draw in the same coordinate space as the bounding rectangle without having to offset the vertex coordinates.
      * 
      */
      create: function(__left, __top, __right, __bottom, __params, __yDown)
      {
        if( __right <= __left )
	        return;
	  
	      if( __yDown && (__top >= __bottom) )
	        return;
	  
	      if( !__yDown && (__top <= __bottom) )
	        return;
	  
	      var orient = shapeConstants.RIGHT;
	      if( __params.hasOwnProperty(shapeConstants.ORIENT) )
          orient = __params.orient;
	  
	      if( orient != shapeConstants.UP && orient != shapeConstants.DOWN && orient != shapeConstants.RIGHT && orient != shapeConstants.LEFT )
	        orient = shapeConstants.RIGHT;
	  
	      var thickness = 10;
	      if( __params.hasOwnProperty("thickness") )
	        thickness = parseInt(__params.thickness);
	  
	      var width  = __right - __left;
	      var height = __yDown ? __bottom - __top : __top - __bottom;
	
	      // clear out any existing data
        this.clear();
	
	      // y-down only is implemented in this initial release - for each orientation, there is an attempt to correct thicnkness values that would cause the section to overlap
	      // itself or exceed the bounding-box dimensions.
	      switch( orient )
	      {
          case shapeConstants.RIGHT:
	          if( 2*thickness >= height )
		          thickness = Math.floor(0.5*height - 2);
		  
		        if( thickness >= width )
		          thickness--;
		  
		        thickness = thickness == 0 ? 2 : thickness;
		
		        // 1
		        this._xcoord.push(__left);
		        this._ycoord.push(__top);
		
		        // 2
		        this._xcoord.push(__right);
		        this._ycoord.push(__top);
	  
	          // 3
	          this._xcoord.push(__right);
		        this._ycoord.push(__top+thickness);
		
		        // 4
		        this._xcoord.push(__left+thickness);
		        this._ycoord.push(__top+thickness);
		
		        // 5
		        this._xcoord.push(__left+thickness);
		        this._ycoord.push(__bottom-thickness);
		
		        // 6
		        this._xcoord.push(__right);
		        this._ycoord.push(__bottom-thickness);
		
		        // 7
		        this._xcoord.push(__right);
		        this._ycoord.push(__bottom);
		
		        // 8
		        this._xcoord.push(__left);
		        this._ycoord.push(__bottom);
		      break;
		   
	        case shapeConstants.LEFT:
	          if( 2*thickness >= height )
              thickness = Math.floor(0.5*height - 2);
          
            if( thickness >= width )
              thickness--;
           
            thickness = thickness == 0 ? 2 : thickness;
		
		        // 1
		        this._xcoord.push(__left);
		        this._ycoord.push(__top);
		
		        // 2
		        this._xcoord.push(__left);
		        this._ycoord.push(__top+thickness);
		
		        // 3
		        this._xcoord.push(__right-thickness);
		        this._ycoord.push(__top+thickness);
		
		        // 4
		        this._xcoord.push(__right-thickness);
		        this._ycoord.push(__bottom-thickness);
		
		        // 5
		        this._xcoord.push(__left);
		        this._ycoord.push(__bottom-thickness);
		
		        // 6
		        this._xcoord.push(__left);
		        this._ycoord.push(__bottom);
		
		        // 7
		        this._xcoord.push(__right);
		        this._ycoord.push(__bottom);
		
		        // 8
		        this._xcoord.push(__right);
		        this._ycoord.push(__top);
	        break;
	    
	        case shapeConstants.UP:
	          if( 2*thickness >= width )
              thickness = Math.floor(0.5*width - 2);
          
            if( thickness >= height )
              thickness--;
          
            thickness = thickness == 0 ? 2 : thickness;
		
            // 1
            this._xcoord.push(__left);
		        this._ycoord.push(__top);
		
		        // 2
		        this._xcoord.push(__left);
		        this._ycoord.push(__bottom);
		
		        // 3
		        this._xcoord.push(__right);
		        this._ycoord.push(__bottom);
		
		        // 4
		        this._xcoord.push(__right);
		        this._ycoord.push(__top);
		
		        // 5
		        this._xcoord.push(__right-thickness);
		        this._ycoord.push(__top);
		
		        // 6
		        this._xcoord.push(__right-thickness);
		        this._ycoord.push(__bottom-thickness);
		
		        // 7
		        this._xcoord.push(__left+thickness);
		        this._ycoord.push(__bottom-thickness);
		
		        // 8
		        this._xcoord.push(__left+thickness);
		        this._ycoord.push(__top);
	        break;
	    
	        case shapeConstants.DOWN:
	          if( 2*thickness >= width )
              thickness = Math.floor(0.5*width - 2);
          
            if( thickness >= height )
              thickness--;
          
            thickness = thickness == 0 ? 2 : thickness;
        
            // 1
            this._xcoord.push(__left);
            this._ycoord.push(__bottom);
        
            // 2
            this._xcoord.push(__left);
            this._ycoord.push(__top);
        
            // 3
            this._xcoord.push(__right);
            this._ycoord.push(__top);
        
            // 4
            this._xcoord.push(__right);
            this._ycoord.push(__bottom);
        
            // 5
            this._xcoord.push(__right-thickness);
            this._ycoord.push(__bottom);
          
            // 6
            this._xcoord.push(__right-thickness);
            this._ycoord.push(__top+thickness);
        
            // 7
            this._xcoord.push(__left+thickness);
            this._ycoord.push(__top+thickness);
        
            // 8
            this._xcoord.push(__left+thickness);
            this._ycoord.push(__bottom);
          break;
        }
      }
    });
  }
  return returnedModule;
});