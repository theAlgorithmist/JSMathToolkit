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

define(['../core/Point', '../utils/GeomUtils'], function (PointModule, GeomUtilsModule) 
{
  var returnedModule = function () 
  {
    var utilsRef  = new GeomUtilsModule();
    var GeomUtils = new utilsRef.GeomUtils();
    var PointRef  = new PointModule();
    
   /**
    * Polygon defines a 2D, closed, polygonal shape as collection of (x,y) vertices in clockwise order
    * 
    * @author Jim Armstrong (www.algorithmist.net)
    * 
    * @version 1.0
    */
    this.Polygon = function()
    {
      this.DEG_TO_RAD = 3.14159265359/180;                // convert degrees to radians
	  
      this._xcoord = [];                                  // x-coordinates of each point
      this._ycoord = [];                                  // y-coordinates of each point
      this._area               = 0;                       // area of the polygon
      this._isConvex           = false;                   // is the polygon convex?
      this._invalidateBound    = false;                   // true if assigning a new point(s) invalidates previously computed bounding box
      this._invalidateArea     = false;                   // true if assigning a new point(s) invalidates previously computed area
      this._invalidateCentroid = false;                   // true if assigning a new point(s) invalidates previously computed centroid
      this._aabb               = {};                      // Axis-aligned bounding-box
      this._centroid           = new PointRef.Point(0,0); // centroid of polygon
    }
    
    this.Polygon.__name__ = true;
    this.Polygon.prototype = 
    {
     /**
      * Access the current point count
      * 
      * @return Integer The total number of points in the Polygon 
      */
      get_numPoints: function()
      {
	      return this._xcoord.length;
      }

     /**
      * Access the vertex x-coordinates
      * 
      * @return Array - x-coordinates of each vertex
      */
      , get_xcoordinates: function()
      {
	      return this._xcoord.slice(0);
      }
  
     /**
      * Access the vertex y-coordinates
      * 
      * @return Array - y-coordinates of each vertex
      */
      , get_ycoordinates: function()
      {
        return this._ycoord.slice(0);
      }
  
     /**
      * Access the area of the >Polygon 
      * 
      * @return Float - Area of the polygon or zero if less than three vertices are defined
      */
      , get_area: function()
      {
	      if( this._invalidateArea )
	      {
          var n = this._xcoord.length;
	        var i;
          if( n < 3 )
            return 0.0;
            
          this._area = 0.0;
          i = 0;
	        while( i < n-1 )
	        {
            this._area += this._xcoord[i] * this._ycoord[i+1];
            i++;
	        }
	       
          this._area += this._xcoord[n-1] * this._ycoord[0];
            
          i = 0;
	        while( i < n-1 )
	        {
            this._area -= this._ycoord[i] * this._xcoord[i+1];
            i++;
	        }
	       
          this._area -= this._ycoord[n-1] * this._xcoord[0];
      
	        // computed area may be positive or negative depending on vertex order (CCW -> positive, CW -> negative)      
          this._area           = Math.abs( 0.5*this._area );
	        this._invalidateArea = false;
	      }
	
	      return this._area;
      }
  
     /**
      * Access the centroid of the >Polygon 
      * 
      * @return Point - Centroid of the >Polygon or the origin if no points are defined
      */
      , get_centroid: function()
      {
	      if( this._invalidateCentroid )
	      {
          var numPoints = this._xcoord.length;
	
	        if( numPoints == 0 )
	        {
	          this._centroid = new PointRef.Point(0,0);
	        }
	        else
	        {
            var n  = 1/numPoints;
            var cx = this._xcoord[0];
            var cy = this._ycoord[0];
            var i  = 1;
          
            while( i < numPoints )
            {
              cx += this._xcoord[i];
              cy += this._ycoord[i];
              i++;
            }
    
	          cx *= n;
            cy *= n;
	  
	          this._centroid           = new PointRef.Point(cx,cy);
	          this._invalidateCentroid = false;
	        }
	      }
	      
	      return this._centroid.clone();      
      }
  
     /**
      * Access the axis-aligned bounding box of the >Polygon
      * 
      * @param yDown : Boolean True if the coordinate system is y-down, which is the case in many browser-based drawing environments (defaults to true)
      * 
      * @return Object - An Object with 'left', 'top', 'right', and 'bottom' properties such that (left, top) are the coordinates of the bounding-box
      * upper, left-hand corner and (right, bottom) are the coordinates of the bounding-box lower, right-hand corner.
      */
      , getBoundingBox: function(__yDown)
      {
        var n = this._xcoord.length;
        if( n == 0 )
          return {left:0, top:0, right:0, bottom:0};
  
        if( this._invalidateBound )
        {
          var l = this._xcoord[0];
          var t = this._ycoord[0];
          var r = this._xcoord[0];
          var b = this._ycoord[0];
          
          var i = 1;
          if( __yDown )
          {
            while( i < n )
            {
              l = Math.min(l, this._xcoord[i]);
              t = Math.min(t, this._ycoord[i]);
              r = Math.max(r, this._xcoord[i]);
              b = Math.max(b, this._ycoord[i]);
              i++;
            }
          }
          else
          {
            while( i < n )
            {
              l = Math.min(l, this._xcoord[i]);
              t = Math.max(t, this._ycoord[i]);
              r = Math.max(r, this._xcoord[i]);
              b = Math.min(b, this._ycoord[i]);
              i++;
            }
          }
  
          this._aabb            = {left:l, top:t, right:r, bottom:b};
          this._invalidateBound = false;
        }
  
        return this._aabb;
      }

     /**
      * Scale the Polygon about its geometric center
      * 
      * @param s : Number Scale factor - must be greater than zero
      * 
      * @return Nothing - Scales the Polygon about its geometric center by the specified scale factor or no
      * action is taken if the vertex count is less than three.
      */
      , scale: function(__s)
      {
	      if( __s > 0 )
	      {
          var numPoints = this._xcoord.length;
	        if( numPoints > 0 )
	        {
	          var c  = this.get_centroid();
	          var cx = c.get_x();
	          var cy = c.get_y();
	          var i  = 0;
	  
	          // translate centroid to origin and scale
            while( i < numPoints )
            {   
              this._xcoord[i] = __s*(this._xcoord[i] - cx);
              this._ycoord[i] = __s*(this._ycoord[i] - cy);
              i++;
            }
      
            // translate back
            i = 0;
            while( i<numPoints )
            {
              this._xcoord[i] += cx;
              this._ycoord[i] += cy;
              i++;
            }
	        }
	  
	        this._invalidateBound = true;
          this._invalidateArea  = true;
	      }
      }
  
     /**
      * Rotate the Polygon about its geometric center
      * 
      * @param a : Number - Rotation angle in degrees
      * 
      * @return Nothing - Rotates the Polygon about its geometric center by the specified rotation angle or no action is taken if the vertex count is less than three.
      */
      , rotate: function(__a)
      {
	      if( __a != 0 )
	      {
          var numPoints = this._xcoord.length;
          if( numPoints > 0 )
          {
            var c  = this.get_centroid();
            var cx = c.get_x();
            var cy = c.get_y();
            var i  = 0;
	  
	          // translate centroid to origin
            while( i < numPoints )
            {
              this._xcoord[i] = this._xcoord[i] - cx;
              this._ycoord[i] = this._ycoord[i] - cy;
		          i++;
            }
      
            // rotate and translate back
            var angle = __a*this.DEG_TO_RAD;
            var s     = Math.sin(angle);
            var c     = Math.cos(angle);
            var x     = 0;
            var y     = 0;
        
		        i = 0;
            while( i < numPoints )
            {
              x = this._xcoord[i];
              y = this._ycoord[i];
        
              this._xcoord[i] = c*x - s*y + cx;
              this._ycoord[i] = s*x + c*y + cy;
		          i++;
            }
	        }
	  
	        this._invalidateBound = true;
	      }
      }
  
     /**
      * Is the specified point strictly inside the Polygon?
      * 
      * @param x : Number x-coordinate of the test point
      * 
      * @param y : Number y-coordinate of the test point
      * 
      * @return  Boolean True if the test point is strictly inside the >Polygon; a point that lies on an edge is 
      * considered outside the >Polygon.
      */
      , isInside: function(__x, __y)
      {
	      var n = this._xcoord.length;
	      if( n < 3 )
	        return false;
	  
	      // check vs. bounding-box
	      var bound   = this.getBoundingBox();
	      var inBound = GeomUtils.insideBox(__x, __y, bound.left, bound.top, bound.right, bound.bottom);
	
	      if( !inBound )
	        return false;
	  
	      // winding number algorithm
	      var wind = 0;
	      var i    = 0;
	      var dir;
	      n -= 1;
	
	      while( i < n )
	      {
	        if( this._ycoord[i] <= __y )
	        {
		        if( this._ycoord[i+1] > __y )
		        {
		          dir = GeomUtils.pointOrientation(this._xcoord[i], this._ycoord[i], this._xcoord[i+1], this._ycoord[i+1], __x, __y);
		          if( dir == GeomUtils.LEFT )
		            wind++;
		        }
	        }
	        else 
	        {
            if( this._ycoord[i+1] <= __y)
		        {  
               dir = GeomUtils.pointOrientation(this._xcoord[i], this._ycoord[i], this._xcoord[i+1], this._ycoord[i+1], __x, __y);
		           if( dir == GeomUtils.RIGHT )
                 wind--;
            }
	        }
	  
          i++;
	      }
	
	      // process final edge from last vertex to first (the polygon is always closed)
	      if( this._ycoord[n] <= __y )
        {
          if( this._ycoord[0] > __y )
          {
            dir = GeomUtils.pointOrientation(_xcoord[n], _ycoord[n], _xcoord[0], _ycoord[0], __x, __y);
            if( dir == GeomUtils.LEFT )
              wind++;
          }
        } 
        else 
        {
          if( this._ycoord[0] <= __y)
          { 
            dir = GeomUtils.pointOrientation(this._xcoord[n], this._ycoord[n], this._xcoord[0], this._ycoord[0], __x, __y);
            if( dir == GeomUtils.RIGHT )
              wind--;
          }
        }
	
	      return wind != 0;
      }
  
     /**
      * Is the >Polygon convex?
      * 
      * @return  Boolean True if the >Polygon is convex and false if the vertex count is less than three.
      */
      , isConvex: function()
      {
        var n = this._xcoord.length;
	      if( n < 3 )
	        return false;
	
	      var i;
	      var j;
	      var k;
        var z;
	      var result = 0;

        i = 0;
        while( i < n ) 
	      {
          j  = (i + 1) % n;
          k  = (i + 2) % n;
          z  = (this._xcoord[j] - this._xcoord[i]) * (this._ycoord[k] - this._ycoord[j]);
          z -= (this._ycoord[j] - this._ycoord[i]) * (this._xcoord[k] - this._xcoord[j]);
	  
          if( z < 0 )
            result |= 1;
          else if( z > 0 )
            result |= 2;
		 
          if( result == 3 )
            return false;
		
          i++;
        }
	 
        if( result != 0 )
          return true;
        else
          return false;
      }
  
    /**
      * Add a vertex or point to the >Polygon
      * 
      * @param x : Number x-coordinate of new vertex
      * 
      * @param y : Number y-coordinate of new vertex
      * 
      * @return  Nothing - If both >x and >y are valid, floating-point numbers, the new
      * vertex is appended to the end of the >Polygon .  As always, the >Polygon is considered to be closed and does
      * not intersect itself.  No check is made for violation of the latter condition, in which case future calls to some methods may return unpredictable results.
      */
      , addPoint: function(__x, __y)
      {
	      if( !isNaN(__x) && !isNaN(__y) )
	      {
          this._xcoord.push(__x);
	        this._ycoord.push(__y);
	   
	        this._invalidateBound    = true;
          this._invalidateArea     = true;
          this._invalidateCentroid = true;
	      }
      }
  
     /**
      * Assign a sequence of x-coordinates to the Polygon
      * 
      * @param x : Array - An array of floating-point numbers containing the x-coordinates of a vertex set to add to the Polygon
      * 
      * @return  Nothing - The internal array of x-coordinates is re-assigned to the input array.  It is common to use this method in tandem with
      * setYCoordinates() and it is the user's responsibility to ensure that each array is of the same length.
      */
      , setXCoordinates: function(__x)
      {
        this._xcoord             = __x.slice(0, __x.length);
	      this._invalidateBound    = true;
        this._invalidateArea     = true;
        this._invalidateCentroid = true;
      }
  
     /**
      * Assign a sequence of y-coordinates to the >Polygon
      * 
      * @param y : Array - An array of floating-point numbers containing the y-coordinates of a vertex set to add to the Polygon
      * 
      * @return  Nothing - The internal array of y-coordinates is re-assigned to the input array.  It is common to use this method in tandem with
      * setXCoordinates() and it is the user's responsibility to ensure that each array is of the same length.
      */
      , setYCoordinates: function(__y)
      {
	      this._ycoord      = __y.slice(0, __y.length);
        this._invalidateBound    = true;
        this._invalidateArea     = true;
        this._invalidateCentroid = true;
      }
  
     /**
      * Clear the current vertex collection for this Polygon
      * 
      * @return  Nothing - The internal vertex set is cleared
      */
      , clear: function()
      {
	      this._xcoord = [];
	      this._ycoord = [];
	
	      this._invalidateBound    = true;
        this._invalidateArea     = true;
        this._invalidateCentroid = true;
      }
  
     /**
      * Clone the current Polygon
      * 
      * @return  Polygon - A reference to a new Polygon with the same vertex collection as the current Polygon.
      */
      , clone: function()
      {
        var that = this;
        var temp = function temporary() { return that.apply(this, arguments); };
        for( key in this ) 
        {
          temp[key] = this[key];
        }
        
        return temp;
      }
    }
  }
  
  return returnedModule;
});