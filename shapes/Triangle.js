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

define(['./ShapeConstants', './Polygon'], function (shapeConstModule, polyModule) 
{
  var returnedModule = function () 
  {
    var shapeRef       = new shapeConstModule();
    var shapeConstants = new shapeRef.ShapeConstants();
    var PolygonRef     = new polyModule();
    
    function ExtendFrom(from, fields) 
    {
      function inherit() {}; inherit.prototype = from; var proto = new inherit();
      for (var name in fields) 
        proto[name] = fields[name];
      
      if( fields.toString !== Object.prototype.toString ) proto.toString = fields.toString;
      return proto;
    }
    
   /**
    * Create a closed polygonal shape that represents an triangle that may be oriented upward, downward, left, or right and whose specific geometry
    * is controlled by a bounding rectangle and a small set of parameters.
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
    * @param params : Object The following named parameters control the triangle geometry
    * 
    * shapeConstants.ORIENT - Value should be one of shapeConstants.UP, shapeConstants.DOWN, shapeConstants.LEFT, shapeConstants.RIGHT (invalid entry defaults to shapeConstants.UP)
    * 
    * shapeConstants.TYPE - May be either shapeConstants.EQUILATERAL for an equilateral triangle or shapeConstants.ISOCELES for an isoceles triangle.
    * 
    * P1 and P2 which are two parameters in (0,0.5] indicating the fraction of length along minor dimension to use for a triangle with arbitrary sides - these parameters must 
    * be defined unless the triangle is a named type such as equiliateral, isoceles, or right.
    * 
    * shapeConstants.RIGHT indicates a right triangle whose side lengths are computed using the orientation and shapeConstants.SECONDARY parameter, the latter of which should 
    * be orthogonal to the primary dimension, i.e. 'up' or 'down' if the triangle is oriented 'left' or 'right'.
    * 
    * @return  <span class='code'>Polygon vertices may be queried to draw or otherwise manipulate the <span class='code'>Triangle.  No
    * action is taken if bounding box or parameters are invalid.  All generated coordinates take the bounding box into account so that the arrow may be draw in the same coordinate
    * space as the bounding rectangle without having to offset the vertex coordinates.
    * 
    * @author Jim Armstrong (www.algorithmist.net)
    * 
    * Version 1.0
    * 
    */
    this.Triangle = function()
    { 
      this.SQRT_3 = 1.73205080757;
      
      PolygonRef.Polygon.call(this);
    }
    
    this.Triangle.__name__  = true;
    this.Triangle.__super__ = PolygonRef.Polygon;
    this.Triangle.prototype = ExtendFrom( PolygonRef.Polygon.prototype,
    {
     /**
      * Create the triangle (resets any previous creation settings)
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
      * @param params : Object The following named parameters control the triangle geometry
      * 
      * shapeConstants.ORIENT - Value should be one of shapeConstants.UP, shapeConstants.DOWN, shapeConstants.LEFT, shapeConstants.RIGHT (invalid entry defaults to shapeConstants.UP)
      * 
      * shapeConstants.TYPE - May be either shapeConstants.EQUILATERAL for an equilateral triangle or shapeConstants.ISOCELES for an isoceles triangle.
      * 
      * P1 and P2 which are two parameters in (0,0.5] indicating the fraction of length along minor dimension to use for a triangle with arbitrary sides - these parameters must 
      * be defined unless the triangle is a named type such as equiliateral, isoceles, or right.
      * 
      * shapeConstants.RIGHT indicates a right triangle whose side lengths are computed using the orientation and shapeConstants.SECONDARY parameter, the latter of which should 
      * be orthogonal to the primary dimension, i.e. 'up' or 'down' if the triangle is oriented 'left' or 'right'.
      * 
      * @return  Polygon - Vertices may be queried to draw or otherwise manipulate the Triangle.  No action is taken if bounding box or parameters are invalid.  All generated 
      * coordinates take the bounding box into account so that the arrow may be draw in the same coordinate space as the bounding rectangle without having to offset the vertex 
      * coordinates.
      */
      create:function(__left, __top, __right, __bottom, __params, __yDown)
      {
        if( __right <= __left )
	        return;
	  
	      if( __yDown && (__top >= __bottom) )
	        return;
	  
	      if( !__yDown && (__top <= __bottom) )
	        return;
	
	      this.clear();
	      
	      var orient;
	      var type;
	      var secondary;
	      var minor;
	      
	      if( __params.hasOwnProperty("orient") )
	        orient = __params.orient;
	      else
	        orient = shapeConstants.UP;
	      
	      if( orient != shapeConstants.UP && orient != shapeConstants.DOWN && orient != shapeConstants.LEFT && orient != shapeConstants.RIGHT )
	        orient = shapeConstants.UP;
	  
	      if( __params.hasOwnProperty("type") )
          type = __params.type;
	      else 
	        type = shapeConstants.NONE;
	  
	      if( __params.hasOwnProperty("secondary") )
          secondary = __params.secondary;
	      else 
	        secondary = shapeConstants.NONE;
	  
	      if( __params.hasOwnProperty("minor") )
	        minor = __params.minor;
	      else
	        minor = shapeConstants.NONE;
	      
	      if( isNaN(minor) )
	        minor = 0.5;
	      
	      var p1 = 0;
	      var p2 = 0;
	      if( type == shapeConstants.NONE )
	      {
          p1 = __params.p1;
	        if( isNaN(p1) )
	          p1 = 0.25;
		
          p2 = __params.p2;
	        if( isNaN(p2) )
	          p2 = 0.35;
		
          p1 = Math.max(0.05, p1);
	        p1 = Math.min(0.5, p1);
	  
	        p2 = Math.max(0.05, p2);
          p2 = Math.min(0.5, p2);
	      }
	  
	      // midpoints along horizontal (x) and vertical (y) directions
	      var midX = 0.5*(__left + __right);
	      var midY = 0.5*(__top + __bottom);
	
	      // yDown only implemented in current release
	      if( orient == shapeConstants.LEFT )
	      {
          switch( type )
	        {
		        case shapeConstants.ISOCELES:
		          this._xcoord.push(__right);
		          this._ycoord.push(__top);
		  
		          this._xcoord.push(__left);
		          this._ycoord.push(midY);
		  
		          this._xcoord.push(__right);
		          this._ycoord.push(__bottom);
		        break;
		       
		        case shapeConstants.EQUILATERAL:
		          var d1 = __right-__left;
		          var d2 = __bottom-__top;
		          var d  = Math.min(d1,d2);  // minimum dimension determines length of sides
		  
		          // triangle height (height now oriented left) given side length
              var h = 0.5*this.SQRT_3*d;
           
              // side length if h = d
              var a = (h+h)/SQRT_3;
         
              // which of the two is maximally binding?
              if( a < d2 )
              {
                // we can fit triangle tightly inside bounding area
                h = d;
                d = a;
              }
		  
		          d2 = 0.5*d;
		  
		          this._xcoord.push(__right);
		          this._ycoord.push(midY-d2);
		  
		          this._xcoord.push(__right-h);
		          this._ycoord.push(midY);
		  
		          this._xcoord.push(__right);
		          this._ycoord.push(midY+d2);
		        break;
		  
		        case shapeConstants.RIGHT:
		          if( secondary == shapeConstants.UP )
		          {
			          this._xcoord.push(__right);
			          this._ycoord.push(midY);

                this._xcoord.push(__right);
                this._ycoord.push(__top);
			
			          this._xcoord.push(__left);
			          this._ycoord.push(midY);
		          }
		          else
		          {
			          // like it or not, you get a downward right triangle
			          this._xcoord.push(__right);
                this._ycoord.push(midY);

                this._xcoord.push(__right);
                this._ycoord.push(__bottom);
            
                this._xcoord.push(__left);
                this._ycoord.push(midY);
		          }
		        break;
		    
		        case shapeConstants.NONE:
		          // multipliers on minor dimension to get side lengths
		          p1 *= __bottom-__top;
		          p2 *= __bottom-__top;
		  
		          this._xcoord.push(__right);
		          this._ycoord.push(midY-p2);
		  
		          this._xcoord.push(__left);
		          this._ycoord.push(midY);
		  
		          this._xcoord.push(__right);
		          this._ycoord.push(midY+p1);
		        break;
	        }
	      }
	      else if( orient == shapeConstants.RIGHT )
	      {
          switch( type )
          {
            case shapeConstants.ISOCELES:
              this._xcoord.push(__left);
              this._ycoord.push(__top);
          
              this._xcoord.push(__right);
              this._ycoord.push(midY);
          
              this._xcoord.push(__left);
              this._ycoord.push(__bottom);
            break;
		  
            case shapeConstants.EQUILATERAL:
              var d1 = __right-__left;
              var d2 = __bottom-__top;
              var d  = Math.min(d1,d2);  // minimum dimension determines length of sides
          
		          // triangle height (height now oriented right) given side length
		          var h = 0.5*this.SQRT_3*d;
		   
		          // side length if h = d
		          var a = (h+h)/this.SQRT_3;
         
		          // which of the two is maximally binding?
		          if( a < d2 )
		          {
			          // we can fit entire triangle in bounding area
			          h = d;
			          d = a;
		          }
		  
		          d2 = 0.5*d;
          
              this._xcoord.push(__left);
              this._ycoord.push(midY-d2);
          
              this._xcoord.push(__left+h);
              this._ycoord.push(midY);
          
              this._xcoord.push(__left);
              this._ycoord.push(midY+d2);
		        break;
		      
            case shapeConstants.RIGHT:
		          if( secondary == shapeConstants.UP )
              {
                this._xcoord.push(__left);
                this._ycoord.push(midY);

                this._xcoord.push(__left);
                this._ycoord.push(__top);
            
                this._xcoord.push(__right);
                this._ycoord.push(midY);
              }
              else
              {
                // like it or not, you get a downward right triangle
                this._xcoord.push(__left);
                this._ycoord.push(midY);

                this._xcoord.push(__left);
                this._ycoord.push(__bottom);
            
                this._xcoord.push(__right);
                this._ycoord.push(midY);
              }
		        break;
        
            case shapeConstants.NONE:
		          // multipliers on minor dimension to get side lengths
              p1 *= __bottom-__top;
              p2 *= __bottom-__top;
          
              this._xcoord.push(__left);
              this._ycoord.push(midY+p2);
          
              this._xcoord.push(__right);
              this._ycoord.push(midY);
          
              this._xcoord.push(__left);
              this._ycoord.push(midY-p1);
            break;
          }
	      }
	      else if( orient == shapeConstants.UP )
	      {
          switch( type )
          {
            case shapeConstants.ISOCELES:
		          this._xcoord.push(__left);
              this._ycoord.push(__bottom);
          
              this._xcoord.push(midX);
              this._ycoord.push(__top);
          
              this._xcoord.push(__right);
              this._ycoord.push(__bottom);
            break;
        
            case shapeConstants.EQUILATERAL:
		          var d1 = __right-__left;
              var d2 = __bottom-__top;
              var d  = d1 < d2 ? d1 : d2;  // minimum dimension determines length of sides
              
		          // triangle height given side length
              var h = 0.5*this.SQRT_3*d;
           
              // side length if h = d
              var a = (h+h)/this.SQRT_3;
         
              // which of the two is maximally binding?
              if( a < d1 )
              {
                // we can fit triangle tightly inside bounding area
                h = d;
                d = a;
              }
		  
		          d2 = 0.5*d;
		          
              this._xcoord.push(midX);
              this._ycoord.push(__bottom-h);
          
              this._xcoord.push(midX+d2);
              this._ycoord.push(__bottom);
          
              this._xcoord.push(midX-d2);
              this._ycoord.push(__bottom);
            break;
        
            case shapeConstants.RIGHT:
		          if( secondary == shapeConstants.RIGHT )
		          {
			          this._xcoord.push(midX);
			          this._ycoord.push(__top);
			
			          this._xcoord.push(__right);
			          this._ycoord.push(__bottom);
			
		  	        this._xcoord.push(midX);
		  	        this._ycoord.push(__bottom);
		          }
		          else
		          {
			          this._xcoord.push(midX);
                this._ycoord.push(__top);
            
                this._xcoord.push(__left);
                this._ycoord.push(__bottom);
            
                this._xcoord.push(midX);
                this._ycoord.push(__bottom);
		          }
            break;
        
            case shapeConstants.NONE:
		          // multipliers on minor dimension to get side lengths
              p1 *= __right-__left;
              p2 *= __right-__left;
          
              this._xcoord.push(midX);
              this._ycoord.push(__top);
          
              this._xcoord.push(midX+p2);
              this._ycoord.push(__bottom);
          
              this._xcoord.push(midX-p1);
              this._ycoord.push(__bottom);
            break;
          }
	      }
	      else if( orient == shapeConstants.DOWN )
	      {
          switch( type )
          {
            case shapeConstants.ISOCELES:
              this._xcoord.push(__left);
              this._ycoord.push(__top);
          
              this._xcoord.push(midX);
              this._ycoord.push(__bottom);
          
              this._xcoord.push(__right);
              this._ycoord.push(__top);
		        break;
		    
            case shapeConstants.EQUILATERAL:
		          var d1 = __right-__left;
              var d2 = __bottom-__top;
              var d  = Math.min(d1,d2);  // mininum dimension determines length of sides
          
              // triangle height given side length
              var h = 0.5*this.SQRT_3*d;
           
              // side length if h = d
              var a = (h+h)/this.SQRT_3;
         
              // which of the two is maximally binding?
              if( a < d1 )
              {
                // we can fit triangle tightly inside bounding area
                h = d;
                d = a;
              }
		  
              d2 = 0.5*d;
          
              this._xcoord.push(midX);
              this._ycoord.push(__top+h);
          
              this._xcoord.push(midX+d2);
              this._ycoord.push(__top);
          
              this._xcoord.push(midX-d2);
              this._ycoord.push(__top);
		        break;
		    
            case shapeConstants.RIGHT:
              if( secondary == shapeConstants.RIGHT )
              {   
                this._xcoord.push(midX);
                this._ycoord.push(__bottom);
            
                this._xcoord.push(__right);
                this._ycoord.push(__top);
            
                this._xcoord.push(midX);
                this._ycoord.push(__top);
              }
              else
              {
                this._xcoord.push(midX);
                this._ycoord.push(__bottom);
            
                this._xcoord.push(__left);
                this._ycoord.push(__top);
            
                this._xcoord.push(midX);
                this._ycoord.push(__top);
              }
            break;
        
            case shapeConstants.NONE:
		          p1 *= __right-__left;
              p2 *= __right-__left;
          
              this._xcoord.push(midX);
              this._ycoord.push(__bottom);
          
              this._xcoord.push(midX+p2);
              this._ycoord.push(__top);
          
              this._xcoord.push(midX-p1);
              this._ycoord.push(__top);
            break;
          }
	      }
      }
	  });
  }
    
  return returnedModule;
});
