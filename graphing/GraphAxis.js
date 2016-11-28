//
// copyright (c) 2013, Jim Armstrong.  All Rights Reserved.
// 
// This software program is supplied 'as is' without any warranty, express, implied, 
// or otherwise, including without limitation all warranties of merchantability or fitness
// for a particular purpose.  Jim Armstrong shall not be liable for any special incidental, 
// or consequential damages, including, without limitation, lost revenues, lost profits, 
// or loss of prospective economic advantage, resulting from the use or misuse of this 
// software program.
//
// This software may be modified for commercial use as long as the above copyright notice remains intact.
//
define(['./Axis', '../shapes/Triangle'], function (AxisModule, TriangleModule) 
{
  var returnedModule = function () 
  {
    var AxisRef     = new AxisModule();
    var TriangleRef = new TriangleModule();
    
   /**
    * Create a 2D graph axis by composing a computational module (Axis) with a triangular polygonal shape (arrow).  A graphing environment
    * is provided by the caller that supports a primitive API (clear, moveTo, lineTo, curveTo) so that the axis may be quickly updated based on property updates, 
    * but not rely on any specific graphic environment.  This allows a GraphAxis to be drawn to most any graphic environment without direct user manipulation of
    * that environment other than setup, line properties, and cleanup.
    * 
    * A GraphAxis may be oriented (and thus rendered) horizontally or vertically and have major/minor tic marks rendered along with the axis.  The current drawing 
    * convention is y-down, which is in line with many online drawing environments.
    *   
    * @author Jim Armstrong (www.algorithmist.net)
    * 
    * @version 1.0
    * 
    */
    this.GraphAxis = function() 
    {
      this.HORIZONTAL      = "H";
      this.VERTICAL        = "V";
      this._orientation    = this.HORIZONTAL;             // graph axis orientation defaults to horizontal
      this._showLeftArrow  = true;                        // Render the triangular arrow at the minimum end of the axis (left for horizontal or down for vertical) - defaults to true
      this._showRightArrow = true;                        // Render the triangular arrow at the maximum end of the axis (right for horizontal or up for vertical) - defaults to true;
      this._axis           = new AxisRef.Axis();          // reference to internal axis instance
      
      // the use of a triangle polygon is kind of overkill, but keeps some structure in place to support more complex arrows in the future
      this._rightArrow = new TriangleRef.Triangle();  // right-arrow shape (Triangle)
      this._leftArrow  = new TriangleRef.Triangle();  // left-arrow shape (Triangle)
  
      // 2D graph bounds are used to properly position axes
      this._left   = 0;
      this._top    = 0;
      this._right  = 0;
      this._bottom = 0;
      this._length = 10;
      this._height = 10;
    }
  
    this.GraphAxis.__name__ = true;
    this.GraphAxis.prototype = 
    {
     /**
      * Assign the bounds of the drawing area in graph units and pixels
      * 
      * @param : Number - x-coordinate of the top-left corner
      * 
      * @param : Number - y-coordinate of the top-left corner
      * 
      * @param : Number - x-coordinate of the bottom-right corner
      * 
      * @param : Number - y-coordinate of the bottom-right corner
      * 
      * @param : Int - Length of the drawing area in pixels
      * 
      * @param : Int - Height of the drawing area in pixels
      * 
      * @Return Nothing - Assigns bounds for the extents of the drawing area in actual graph units.  Vertical bounds are required, for example, to position
      * a horizontal graph axis or determine that it has been shifted out of the display area.  Likewise, horizontal bounds are required to properly display 
      * a vertical axis.  The graph axis orientation must be set in advance of assigning bounds.
      */
      setBounds: function(__left, __top, __right, __bottom, __length, __height)
      {
	      if( __right > __left )
	      {
          this._left  = __left;
	        this._right = __right;
	      }
	
	      if( __top > __bottom )
	      {
          this._bottom = __bottom;
	        this._top    = __top;
	      }
	
	      this._length = __length > 0 ? __length : this._length;
	      this._height = __height > 0 ? __height : this._height;
	
	      if( this._orientation == this.HORIZONTAL )
	      {
          this._axis.set_min(this._left);
	        this._axis.set_max(this._right);
	        this._axis.set_length(this._length);
	      }
	      else
	      {
          this._axis.set_min(this._bottom);
          this._axis.set_max(this._top);
          this._axis.set_length(this._height);
	      }
      }
  
     /**
      * Access the current minimum GraphAxis value
      * 
      * @Return Number - The current GraphAxis minimum value
      */
      , get_min: function()
      {
        return this._axis.get_min();
      }
   
     /**
      * Access the current maximum GraphAxis value
      * 
      * <span class='returns'>Returns</span> Number - The current <span class='code'>GraphAxis</span> maximum value
      */
      , get_max: function()
      {
        return this._axis.get_max();
      }
   
     /**
      * Access the GraphAxis location in display space in pixel coordinates
      * 
      * @return Number - Pixel offset from the origin of the display area (y-down) based on the bound settings in real coordinates and 
      * the boundary of the display vertically and horizontally in pixels.  Set all relevant bounds AND the axis orientation before accessing this method.  This allows 
      * the horizontal or vertical axis offset to be computed so that other items may be positioned relative to the axis.  The offset may be negative or exceed the 
      * dimensions of the display area if the axis is not currently in view.
      */
      , get_axisOffset: function()
      {
	      var px;
	
	      if( this._orientation == this.HORIZONTAL )
        { 
          px = this._height/(this._top-this._bottom);  // px per unit Y value
          return px*Math.abs(this._top);
        }
        else
        {
          px = this._length/(this._right-this._left);  // px per unit X value
          return px*Math.abs(this._left);
	      }
      }
      
     /**
      * Assign the axis orientation
      * 
      * @param orient : String - Axis orientation (must be HORIZONTAL or VERTICAL)
      * 
      * @return Nothing
      */
      , setOrientation: function(orient) 
      {
        if( orient == this.HORIZONTAL || orient == this.VERTICAL )
          this._orientation = orient;
      }
  
     /**
      * Assign the major tic increment in current units
      * 
      * @param inc</span> : Number - Major tic increment, i.e. major tics every 0.5 units
      * 
      * @return Nothing
      */
      , set_majorInc: function(__inc)
      {
        if( __inc > 0 )
          this._axis.set_majorInc(__inc);
      }
  
     /**
      * Assign the minor tic increment in current units
      * 
      * @param inc : Number - Minor tic increment, i.e. minor tics every 0.5 units
      * 
      * @return Nothing
      */
      , set_minorInc: function(__inc)
      {
        if( __inc > 0 )
          this._axis.set_minorInc(__inc);
      }
      
     /**
      * Show or hide the left (top) arrow when the graph axis is redrawn
      * 
      * @param show : Boolean - True if the left (for horizontal) or top (for vertical) arrow is rendered when the graph axis is drawn
      */
      , showLeftArrow: function(show)
      {
        if( show == undefined )
          this._showLeftArrow  = true;
        else
          this._showLeftArrow = show;         
      }
      
     /**
      * Show or hide the right (bottom) arrow when the graph axis is redrawn
      * 
      * @param show : Boolean - True if the right (for horizontal) or bottom (for vertical) arrow is rendered when the graph axis is drawn
      */
      , showRightArrow: function(show)
      {
        if( show == undefined )
          this._showRightArrow  = true;
        else
          this._showRightArrow = show;         
      }
  
     /**
      * Is the graph axis visible based on current drawing area bounds?
      * 
      * @return Boolean - True if the graph axis is visible based on the current drawing area bounds in user coordinates
      */
      , isVisible: function()
      {
	      // must set orientation and bounds before testing for axis visibility
	      if( this._orientation == this.HORIZONTAL )
          return !( this._top < 0 || this._bottom > 0 );
        else
          return !( this._left > 0 || this._right < 0 );
      }
  
     /**
      * Zoom the graph axis in or out
      * 
      * @param : String - Zoom direction; should be either Axis.IN or Axis.OUT
      * 
      * @param factor : Integer - Zoom factor, i.e. 2, 4, 10, etc.  Note that zoom factor is applied to the current axis bonds which are
      * modified by each successive zoom. Take this into account if adjusting the zoom factor in a loop as zoom is exponential.
      * 
      * @Return Nothing - If zoom direction is correct, the graph axis is zoomed about its current midpoint.  Rounding in internal division and 
      * multiplication may affect axis bounds.  The graph axis is NOT redrawn.  Graph axis orientation and drawing area bounds must be set before calling this method.
      */
      , zoom: function(__dir, __factor)
      {
	      this._axis.zoom(__dir, __factor);
	
	      // update the bounds - apply the zoom to the orthogonal dimension
	      if( this._orientation == this.HORIZONTAL )
        {
          this._left  = this._axis.get_min();
	        this._right = this._axis.get_max();
	  
	        var factor = __factor < 0 ? -__factor : __factor;
          factor = Math.round(__factor);
          if( factor == 0 )
            return;
    
          var midpoint = 0.5*(this._top+this._bottom);
          var d        = this._top - midpoint;
    
          if( __dir == "in" )
          {
            d = d/__factor;
          }
          else if( __dir == "out" )
          {
            d = d*__factor;
          }
    
          _top    = midpoint - d;
          _bottom = midpoint + d;
	      }
	      else
	      {
          this._bottom = this._axis.get_min();
	        this._top    = this._axis.get_max();
	  
	        var factor = __factor < 0 ? -__factor : __factor;
          factor = Math.round(__factor);
          if( factor == 0 )
            return;
    
          var midpoint = 0.5*(this._right+this._left);
          var d        = this._right - midpoint;
    
          if( __dir == "in" )
          {
            d = d/__factor;
          }
          else if( __dir == "out" )
          {
            d = d*__factor;
          }
    
          this._left  = midpoint - d;
          this._right = midpoint + d;
	      }
      }
  
     /**
      * Shift the graph axis by a specified pixel amount
      * 
      * @param dx : Integer - Number of pixels moved in the horizontal direction.
      * 
      * @param dy : Integer - Number of pixels moved in the vertical direction.
      * 
      * @Return Nothing - The internal minimum and maximum axis values in actual coordinates are adjusted based on the specified pixel
      * shift.  The axis minimum, maximum, and pixels per unit must be set in advance of calling this method and the graph axis is NOT 
      * redrawn.  Graph axis orientation and drawing area bounds must be set before calling this method.
      */
      , shift: function(__dx, __dy)
      {
	      var isHorizontal = _orientation == this.HORIZONTAL;
	
	      if( isHorizontal )
	        this._axis.shift(__dx);
	      else
	        this._axis.shift(__dy);
	  
	      var px = this._axis.get_pxPerUnit();
        if( px == 0 )
          return;
	  
        if( this._length == 0 || this._height == 0 )
	        return;
	
	      // update the bounds and apply the shift to thh orthogonal dimension (implementing only y-down for the present)
        if( this._orientation == this._HORIZONTAL )
        {
          this._left  = this._axis.get_min();
	        this._right = this._axis.get_max();
	 
	        px            = (this._bottom-this._top)/this._height;
	        this._top    -= __dy*px;
          this._bottom -= __dy*px;
        }
        else
        {
          this._bottom = this._axis.get_min();
          this._top    = this._axis.get_max();
      
	        px      = (this._right-this._left)/this._length;
          this._left  -= __dx*px;
          this._right -= __dx*px;
        }
      }
  
     /**
      * Draw the graph axis line using the supplied graphic context
      * 
      * @param g : Dynamic - A graphic context that supports clear(), moveTo(), lineTo(), and curveTo()
      * 
      * @param arrowWidth : Int - Arrow width in pixels (height for a vertical axis)
      * 
      * @param arrowHeight : Int - Arrow height in pixels (width for a vertical axis)
      * 
      * @return Nothing - Line properties such as width and color should be assigned in advance.  Graph axis orientation 
      * and drawing area bounds must be set before calling this method. 
      * 
      */
      , drawAxis: function(__g, __arrowWidth, __arrowHeight)
      {
	      var px          = 0;
	      var arrowWidth  = !__arrowWidth || __arrowWidth <= 0 ? 8 : __arrowWidth;
	      var arrowHeight = !__arrowHeight || __arrowHeight <= 0 ? 5 : __arrowHeight;
	
	      if( this._orientation == this.HORIZONTAL )
	      {
          // compute y-coordinate of axis location (zero-value in graph units)
          if( this._top < 0 || this._bottom > 0 )
	          return;                     // horizontal axis does not appear in drawing area
	    
          px = this._height/(this._top-this._bottom);  // px per unit Y value
      
	        // zero-y is somewhere between top and bottom of drawing area
	        var axisY = px*Math.abs(this._top);
	  
	        // left- and right-axis coordinates depend on arrows
	        __g.moveTo(__arrowWidth,axisY);
	        __g.lineTo(this._length-__arrowWidth, axisY);
	      }
	      else
        {
          // compute x-coordinate of axis location (zero-value in graph units)
          if( this._left > 0 || this._right < 0 )
            return;                     // vertical axis does not appear in drawing area
        
          px = this._length/(this._right-this._left);  // px per unit X value
      
          // zero-x is somewhere between top and bottom of drawing area
          var axisX = px*Math.abs(this._left);
      
          // top- and bottom-axis coordinates depend on arrows
          __g.moveTo(axisX, __arrowHeight);
          __g.lineTo(axisX, this._height-__arrowHeight);
	      }
      }
  
     /**
      * Draw the arrows for a graph axis
      * 
      * @param __g : Dynamic - A graphic context that supports clear(), moveTo(), lineTo(), and curveTo()
      * 
      * @param arrowWidth : Int - Arrow width in pixels (height for a vertical axis)
      * 
      * @param arrowHeight : Int - Arrow height in pixels (width for a vertical axis)
      * 
      * @return Nothing - Set the showLeftArrow and showRightArrow properties to determine which of the two arrows is rendered (left and right correspond 
      * to down and up for a vertical axis).  The graphic context should be cleared and all line/fill properties set on that context before calling this method.
      * 
      */
      , drawArrows: function(__g, __arrowWidth, __arrowHeight)
      {
	      var px           = 0;
        var arrowWidth   = __arrowWidth <= 0 ? 10 : __arrowWidth;
        var arrowHeight  = __arrowHeight <= 0 ? 5 : __arrowHeight;
	      var halfHeight = 0.5*arrowHeight;
	      var halfWidth  = 0.5*arrowWidth;
	
        if( this._showLeftArrow )
	      {
          this._leftArrow.clear();
	        if( this._orientation == this.HORIZONTAL )
	        {
            // compute y-coordinate of axis location (zero-value in graph units)
            if( this._top < 0 || this._bottom > 0)
              return;                     // horizontal axis does not appear in drawing area
        
            px = this._height/(this._top-this._bottom);  // px per unit Y value
      
            // zero-y is somewhere between top and bottom of drawing area
            var axisY = px*Math.abs(this._top);
		
		        // create the arrow with a bounding box of arrowWidth and arrowHeight - it is isoceles and left-oriented
            var p = {"orient":"left", "type":"isoceles"};
		
            // triangle computed with y-down, Canvas coordinates
		        this._leftArrow.create(0, axisY-halfHeight, arrowWidth, axisY+halfHeight, p, true);
		        this.__renderArrow(__g, this._leftArrow);
	        }
	        else
	        {
		        // compute x-coordinate of axis location
		        if( this._left > 0 || this._right < 0)
              return;                     // vertical axis does not appear in drawing area
          
            px = this._length/(this._right-this._left);  // px per unit X value
      
            // zero-x is somewhere between top and bottom of drawing area
            var axisX = px*Math.abs(this._left);
		
		        // create the arrow with a bounding box of arrowHeight and arrowWidth - it is isoceles and left-oriented
            var p = {"orient":"down", "type":"isoceles"};
        
            this._leftArrow.create(axisX-halfHeight, this._height-arrowWidth, axisX+halfHeight, this._height, p, true);
            this.__renderArrow(__g, this._leftArrow);
	        }
	      }
	
	      if( this._showRightArrow )
	      {
	        this._rightArrow.clear();
          if( this._orientation == this.HORIZONTAL )
	        {
		        if( this._top < 0 || this._bottom > 0)
              return;                     // horizontal axis does not appear in drawing area
        
            px = this._height/(this._top-this._bottom);  // px per unit Y value
      
            // zero-y is somewhere between top and bottom of drawing area
            var axisY = px*Math.abs(this._top);
		
		        // create the arrow with a bounding box of arrowWidth and arrowHeight - it is isoceles and right-oriented
            var p = {"orient":"right", "type":"isoceles"};
        
            this._rightArrow.create(this._length-arrowWidth, axisY-halfHeight, this._length, axisY+halfHeight, p, true);
		        this.__renderArrow(__g, this._rightArrow);
	        }
	        else
	        {
		        // compute x-coordinate of axis location
            if( this._left > 0 || this._right < 0)
              return;                     // vertical axis does not appear in drawing area
          
            px = this._length/(this._right-this._left);  // px per unit X value
      
            // zero-x is somewhere between top and bottom of drawing area
            var axisX = px*Math.abs(this._left);
        
            // create the arrow with a bounding box of arrowHeight and arrowWidth - it is isoceles and left-oriented
            var p = {"orient":"up", "type":"isoceles"};
        
            this._rightArrow.create(axisX-halfHeight, 0, axisX+halfHeight, arrowWidth, p, true);
            this.__renderArrow(__g, this._rightArrow);
	        }
        }
      }
  
     /**
      * Draw the major tic marks for this graph axis
      * 
      * @param g : Dynamic - A graphic context that supports clear(), moveTo(), lineTo(), and curveTo()
      * 
      * @param ticLength - : Int Tic length in px for this graph axis
      * 
      * @return Nothing - Major tic marks are rendered into the supplied graphic context as long as the axis is currently visibile in the graph area.  
      * The graphic context should be cleared and all line/fill properties set on that context before calling this method.
      *  
      */
      , drawMajorTicMarks: function(__g, __ticLength)
      {
        var px           = 0;
        var majorTics    = this._axis.getTicCoordinates("major");
        var numMajorTics = majorTics.length;
        var halfLen      = 0.5*__ticLength;
        var i            = 0;
	      var ticX;
	      var ticY;
		  
        if( this._orientation == this.HORIZONTAL )
        { 
          if( this._top < 0 || this._bottom > 0)
            return;   // axis does not appear in the drawing area, so no tic marks to be drawn
		  
	        px        = this._height/(this._top-this._bottom);  // px per unit Y value
          var axisY = px*Math.abs(this._top);
		
          while( i < numMajorTics )
          {
            ticX = majorTics[i];
            __g.moveTo(ticX, axisY-halfLen);
            __g.lineTo(ticX, axisY+halfLen);
		
		        i++;
          }
	      }
	      else
	      {
          if( this._left > 0 || this._right < 0 )
            return;      // vertical axis does not appear in drawing area
          
	        px        = this._length/(this._right-this._left);  // px per unit X value
          var axisX = px*Math.abs(this._left);
	  
	        while( i < numMajorTics )
          {
            ticY = majorTics[i];
            __g.moveTo(axisX-halfLen, ticY);
            __g.lineTo(axisX+halfLen, ticY);
        
            i++;
          }
	      }
      }
  
     /**
      * Draw the minor tic marks for this graph axis
      * 
      * @param g : Dynamic - A graphic context that supports clear(), moveTo(), lineTo(), and curveTo()
      * 
      * @param ticLength : Int - Tic length in px for this graph axis
      * 
      * @return Nothing - Minor tic marks are rendered into the supplied graphic context as long as the axis is currently visibile in the graph area.  The graphic 
      * context should be cleared and all line/fill properties set on that context before calling this method.
      */
      , drawMinorTicMarks: function(__g, __ticLength)
      {
        var px           = 0;
	      var minorTics    = this._axis.getTicCoordinates("minor");
        var numMinorTics = minorTics.length;
        var halfLen      = __ticLength/2;
        var i            = 0;
        var ticX;
	      var ticY;
	  
        if( this._orientation == this.HORIZONTAL )
        {
          if( this._top < 0 || this._bottom > 0)
            return;   // axis does not appear in the drawing area, so no tic marks to be drawn
        
          px        = this._height/(this._top-this._bottom);  // px per unit Y value
          var axisY = px*Math.abs(this._top);
        
          while( i < numMinorTics )
          {
            ticX = minorTics[i];
            __g.moveTo(ticX, axisY-halfLen);
            __g.lineTo(ticX, axisY+halfLen);
        
            i++;
          }
        }
        else
        {
          if( this._left > 0 || this._right < 0 )
            return;      // vertical axis does not appear in drawing area
        
          px        = this._length/(this._right-this._left);  // px per unit X value
          var axisX = px*Math.abs(this._left);
      
          while( i < numMinorTics )
          {
            ticY = minorTics[i];
            __g.moveTo(axisX-halfLen, ticY);
            __g.lineTo(axisX+halfLen, ticY);
        
            i++;
          }
        }
      }
  
     /**
      * Draw grid lines at the major tic marks for  this axis
      * 
      * @param g : Dynamic - A graphic context that supports clear(), moveTo(), lineTo(), and curveTo()
      * 
      * @return Nothing - Grid lines are drawn into the supplied context based on the current drawing area in user cooordinates. The graphic 
      * context should be cleared and all line/fill properties set on that context before calling this method.  Grid lines are drawn regardless 
      * of axis visiblity in the drawing area.  Grid lines are drawn vertically for a horizontal axis and horizontally for a vertical axis.
      */
      , drawGrid: function(__g)
      {
	      // draw grid lines at the major tics to the extends of the drawing area - grid lines are drawn whether the axis is visible or not
        var majorTics    = this._axis.getTicCoordinates("major");
        var numMajorTics = majorTics.length;
        var i            = 0;
        var ticX;
        var ticY;
          
        if( this._orientation == this.HORIZONTAL )
        { 
          while( i < numMajorTics )
          {
            ticX = majorTics[i];
            __g.moveTo(ticX, 0);
            __g.lineTo(ticX, this._height);
        
            i++;
          }
        }
        else
        {
          while( i < numMajorTics )
          {
            ticY = majorTics[i];
            __g.moveTo(0, ticY);
            __g.lineTo(this._length, ticY);
        
            i++;
          }
        }
      }
  
     /**
      * Return a collection of tic mark labels for this graph axis
      * 
      * @param type : String - Use the symbolic code Axis.MAJOR to set query tic increments and Axis.MINOR to query minor tic increments
      * 
      * @return Array - Computed tic mark labels.  If axis bounds and length have not been set or the major/minor tic increment is zero, 
      * then this method returns an empty array. An empty array is also returned for an invalid type parameter.
      */
      , getTicMarkLabels: function(__type)
      {
        return this._axis.getTicMarks(__type);
      }
  
     /**
      * Return a collection of integer tic mark locations based on a graphic container with a presumed start index of zero
      * 
      * @param type : String - Use the symbolic code Axis.MAJOR to set query tic locations and Axis.MINOR to query minor tic locations
      * 
      * @Return Array - Coordinates for tic marks with the understanding that the axis begins at a zero coordinate inside a graphic container
      * in some production rendering environment.  The caller may loop over this array to draw tic marks at the correct position based on 
      * current axis settings.
      */
      , getTicCoordinates: function(__type)
      {
	      return this._axis.getTicCoordinates(__type);
      }
  
      // internal method (render arrow into supplied graphic context)
      , __renderArrow: function(__context, __arrow)
      {
	      // there are three points in the arrow shape
	      var xCoord = __arrow.get_xcoordinates();
	      var yCoord = __arrow.get_ycoordinates();
	
	      __context.moveTo(xCoord[0], yCoord[0]);
	      __context.lineTo(xCoord[1], yCoord[1]);
	      __context.lineTo(xCoord[2], yCoord[2]);
      }
    }
  }
  
  return returnedModule;
});
