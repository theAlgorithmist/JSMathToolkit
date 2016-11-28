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

define(['../graphing/GraphAxis', 
        '../utils/NumberFormatter', 
        '../core/GraphDataMarker',
        '../core/GraphSlice'
        ], 
    function (AxisModule, 
              NumberFormatterModule, 
              MarkerModule,
              SliceModule
             ) 
{
  var returnedModule = function () 
  {
    var axisRef      = new AxisModule();
    var formatterRef = new NumberFormatterModule();
    var markerRef    = new MarkerModule();
    var sliceRef     = new SliceModule();
    
    var __formatter  = new formatterRef.NumberFormatter();
    
   /**
    * A general-purpose Canvas function-graphing engine for functions of a single, independent variable.  A graph consists of various layers, the lowest of which is the axis layer.  
    * The axis layer consists of multiple Shapes and contains the x and y axes, tic and grid marks, and axis tic labels.  Individual functions are plotted on successively higher 
    * layers using a line decorator from the core/decorators folder.  The highest levels of the graph are reserved for helpers such as markers and slice tools (from the core
    * package).
    * 
    * In general, functions are evaluated with a user-supplied function that takes a single argument, x, and returns f(x).  It is allowable to use the FunctionParser
    * to pre-parse, and then evaluate a function.  This special process is indicated during the GraphLayer definition process.
    * 
    * Note that this engine is built on top of the EaselJS Canvas graphing library, which must be loaded in order to use the function graphing engine.
    * 
    * @author Jim Armstrong (www.algorithmist.net)
    * 
    * @version 1.0
    */
    this.FcnGraphEngine = function(stage)
    {
      // internal reference to the EaselJS Stage
      this._stage = stage;
      
      // function layer stack
      this._layers = [];
      
      // collection of markers
      this._markers = {};
      
      // collection of slice tools
      this._sliceTools = {};
      
      // allow this graph to be offset from the canvas origin (V1.1 or later)
      this._xOffset = 0;
      this._yOffset = 0;
      
      // x and y axes
      this._xAxis = new axisRef.GraphAxis();
      this._yAxis = new axisRef.GraphAxis();
      this._xAxis.setOrientation( this._xAxis.HORIZONTAL );
      this._yAxis.setOrientation( this._yAxis.VERTICAL );
      
      this._xAxisLength = 100;
      this._yAxisLength = 100;
      this._pxPerUnitX  = 0;
      this._pxPerUnitY  = 0;
      
      // graph limits in coordinate values
      this._left   = 0;
      this._top    = 0;
      this._right  = 0;
      this._bottom = 0;
      
      // reference to grid/axis layers that are automatically created by the engine 
      this._gridShape         = new createjs.Shape();
      this._xAxisShape        = new createjs.Shape();
      this._xAxisTicMarks     = new createjs.Shape();
      this._xAxisArrowsShape  = new createjs.Shape();
      this._xAxisTicLabels    = new createjs.Container();
      this._yAxisShape        = new createjs.Shape();
      this._yAxisTicMarks     = new createjs.Shape();
      this._yAxisArrowsShape  = new createjs.Shape();
      this._yAxisTicLabels    = new createjs.Container();
      this._functionLayer     = new createjs.Container();
      this._overlayLayer      = new createjs.Container();
      
      // line thickness and color properties of various axis elements
      this._showGrid           = true;
      this._gridRendered       = false;
      this._gridThickness      = 1;
      this._gridColor          = '#ebebeb';
      this._gridAlpha          = 0.5;
      this._xAxisThickness     = 3;
      this._xAxisColor         = '#cccccc';
      this._xAxisAlpha         = 1.0;
      this._xAxisTriangles     = true;
      this._yAxisThickness     = 3;
      this._yAxisColor         = '#cccccc';
      this._yAxisAlpha         = 1.0;
      this._yAxisTriangles     = true;
      
      // manage tic-mark and tic-label display objects and parameters
      this._xAxisTicDisplayObjects = [];
      this._xAxisTicTextObjects    = [];
      this._yAxisTicDisplayObjects = [];
      this._yAxisTicTextObjects    = [];
      this._ticLabelFont           = 'Bold 15px Arial';
      this._ticLableColor          = '#ffffff'
      
      // major/minor tic increments
      this._majorInc = 0;
      this._minorInc = 0;
      
      // number of decimals to display and whether or not to use exp. notation in tic labels i.e. 1.007 * x=10^3 (not yet supported)
      this._decimals = 0;
      this._useExp   = false;
      
      // add 'axis' layers to the stage
      this._stage.addChild(this._gridShape);
      this._stage.addChild(this._xAxisShape);
      this._stage.addChild(this._xAxisTicMarks);
      this._stage.addChild(this._xAxisArrowsShape);
      this._stage.addChild(this._xAxisTicLabels);  
      this._stage.addChild(this._yAxisShape); 
      this._stage.addChild(this._yAxisTicMarks);
      this._stage.addChild(this._yAxisArrowsShape); 
      this._stage.addChild(this._yAxisTicLabels);
      this._stage.addChild(this._functionLayer);
      this._stage.addChild(this._overlayLayer);
      
      // invalidation
      this._gridInvalidated      = false;
      this._labelsInvalidated    = false;
      this._functionsInvalidated = false;
    }
    
    this.FcnGraphEngine.__name__ = true;
    this.FcnGraphEngine.prototype = 
    {
     /**
      * Access x-coordinate of upper, left-hand corner of the graph
      * 
      * @return Float - x-coordinate of top-left corner of graph
      */
      get_left: function()
      {
        return this._left;    
      }
    
     /**
      * Access y-coordinate of upper, left-hand corner of the graph
      * 
      * @return Float - y-coordinate of top-left corner of graph
      */
      , get_top: function()
      {
        return this._top;    
      }
      
     /**
      * Access x-coordinate of lower, right-hand corner of the graph
      * 
      * @return Float - x-coordinate of botom-right corner of graph
      */
      , get_right: function()
      {
        return this._right;    
      }
       
     /**
      * Access y-coordinate of lower, right-hand corner of the graph
      * 
      * @return Float - y-coordinate of bottom-right corner of graph
      */
      , get_bottom: function()
      {
        return this._bottom;    
      }
    
     /**
      * Assign graph bounds - coordinate limits and axis lengths
      * 
      * @param left : Number - x-coordinate of top-left corner of graph area
      * 
      * @param top : Number - y-coordinate of top-left corner of graph area
      * 
      * @param right : Number - x-coordinate of bottom-right corner of graph area
      * 
      * @param bottom : Number - y-coordinate of bottom-right corner of graph area
      * 
      * @param xAxisLength : Int - x-axis length in pixels
      * 
      * @param yAxisLength : Int - y-axis length in pixels
      * 
      * @return Nothing
      */
      , set_graphBounds: function( left, top, right, bottom, xAxisLength, yAxisLength )
      {
        var l = isNaN(left) ? this._left : left;
        var t = isNaN(top) ? this._top : top;
        var r = isNaN(right) ? this._right : right;
        var b = isNaN(bottom) ? this._bottom : bottom;

        if( r > l && t > b )
        {
          this._top    = t;
          this._left   = l;
          this._right  = r;
          this._bottom = b;
        }
        
        this._xAxisLength = isNaN(xAxisLength) ? this._xAxisLength : Math.max(1, xAxisLength);
        this._yAxisLength = isNaN(yAxisLength) ? this._yAxisLength : Math.max(1, yAxisLength);
        
        this._pxPerUnitX = this._xAxisLength/(this._right - this._left);
        this._pxPerUnitY = this._yAxisLength/(this._top - this._bottom);
        
        this._xAxis.setBounds(this._left, this._top, this._right, this._bottom, this._xAxisLength, this._yAxisLength);
        this._yAxis.setBounds(this._left, this._top, this._right, this._bottom, this._xAxisLength, this._yAxisLength);
        
        this._gridInvalidated   = true;
        this._labelsInvalidated = true;
      }
      
     /**
      * Assign the graph offsets relative to the Canvas origin
      * 
      * @param xOffset : Int - horizontal pixel offset for the upper, left-hand corner of the graph, relative to the Canvas (stage) origin
      * 
      * @param yOffset : Int - vertical pixel offset for the upper, left-hand corner of the graph, relative to the Canvas (stage) origin
      * 
      * @return Nothing - The offsets must be zero or greater (not currently supported, but will be necessary for stacked graphs)
      */
      , set_graphOffsets: function(xOffset, yOffset)
      {
        this._xOffset = isNaN(xOffset) ? this._xOffset : Math.max(0, Math.round(xOffset));
        this._yOffset = isNaN(yOffset) ? this._yOffset : Math.max(0, Math.round(yOffset));
      }
    
     /**
      * Assign axis render properties
      * 
      * @param xAxisThickness : Int - x-axis line thickness; at least 3 is recommended (major ticks are 1px less than axis thickness and minor tics are 2px less, if possible)
      * @param xAxisColor : String - x-axis color value i.e. #xxyyzz
      * @param xAxisAlpha : Number - x-axis alpha value in [0,1]
      *                                  
      * @param yAxisThickness : Int - y-axis line thickness; at least 3 is recommended (major ticks are 1px less than axis thickness and minor tics are 2px less, if possible)
      * @param yAxisColor : String - y-axis color value i.e. #xxyyzz
      * @param yAxisAlpha : Number - y-axis alpha value in [0,1]
      * 
      * @param showXAxisTriangles : Boolean - true if triangles are displayed at each end of the x-axis (otherwise, the axes are rendered short of the triangle length)
      * @param showYAxisTriangles : Boolean - true if triangles are displayed at each end of the y-axis (otherwise, the axes are rendered short of the triangle length)
      * 
      * @return Nothing
      */
      , set_axisParams: function( xAxisThickness, xAxisColor, xAxisAlpha, yAxisThickness, yAxisColor, yAxisAlpha, showXAxisTriangles, showYAxisTriangles )
      {
        this._xAxisThickness     = isNaN(xAxisThickness) ? this._xAxisThickness : Math.max(1,xAxisThickness);
        this._xAxisColor         = xAxisColor == undefined ? this._xAxisColor : xAxisColor;
        this._xAxisAlpha         = isNaN(xAxisAlpha) ? this._xAxisAlpha : Math.min(1, Math.max(0,xAxisAlpha));

        this._yAxisThickness     = isNaN(yAxisThickness) ? this._yAxisThickness : Math.max(1,yAxisThickness);
        this._yAxisColor         = yAxisColor == undefined ? this._yAxisColor : yAxisColor;
        this._yAxisAlpha         = isNaN(yAxisAlpha) ? this._yAxisAlpha : Math.min(1, Math.max(0,yAxisAlpha));
        
        this._xAxisTriangles = showXAxisTriangles == undefined ? this._xAxisTriangles : showXAxisTriangles;
        this._yAxisTriangles = showYAxisTriangles == undefined ? this._yAxisTriangles : showYAxisTriangles;
        
        this._gridInvalidated = true;
      }
    
     /**
      * Assign grid render properties (horizontal and vertical lines extending across the graph area and passing through major tic marks)
      * 
      * @param thickness : Int - grid thickness
      * 
      * @param color : String - Grid color code, i.e. '#ffffff'
      * 
      * @param alpha : Number - Alpha value in [0,1]
      * 
      * @param major : Int - Major tic increment (use zero if major tics are not to be shown)
      * 
      * @param minor : Int - Minor tic increment (use zero if minor tics are not to be shown)
      * 
      * @param ticLabelFont : String - tic label font for EaselJS Cavnas text, i.e. 'Bold 15px Arial' (use "" to leave value unchanged from default or previous setting)
      * 
      * @param ticLabelColor : String - color code for tic mark labels, i.e. '#ffffff' (use "" to leave value unchanged from default or previous setting)
      * 
      * @param decimals : Int - Number of decimal places to display on major and minor axis tic labels
      * 
      * @param show : Boolean - true if the grid is to be shown (this is the default on constructing a function graph engine)
      * 
      * @return Nothing
      */
      , set_gridParams: function( thickness, color, alpha, major, minor, ticLabelFont, ticLabelColor, decimals, show )
      {
        this._gridThickness = isNaN(thickness) ? this._gridThickness : Math.max(1,thickness);
        this._gridColor     = color != undefined ? color : this._color;
        this._showGrid      = show != undefined ? show : this._showGrid;
        this._gridAlpha     = isNaN(alpha) ? this._gridAlpha : Math.min(1, Math.max(0,alpha));
        
        this._majorInc = isNaN(major) ? this._majorInc : Math.max(0,major);
        this._minorInc = isNaN(minor) ? this._minorInc : Math.max(0,minor);
        this._decimals = isNaN(decimals) ? this._decimals : Math.max(0,decimals);
        
        this._showGrid = show == undefined ? this._showGrid : show;
        
        if( ticLabelFont != undefined )
          this._ticLabelFont = ticLabelFont.length > 5 ? ticLabelFont : this._ticLabelFont;
          
        if( ticLabelColor != undefined )
          this._ticLabelColor = ticLabelColor.length == 7 ? ticLabelColor : this._ticLabelColor;
        
        if( this._majorInc > 0 )
        {
          this._xAxis.set_majorInc(this._majorInc);
          this._yAxis.set_majorInc(this._majorInc);
        }
        
        if( this._minorInc > 0 )
        {
          this._xAxis.set_minorInc(this._minorInc);
          this._yAxis.set_minorInc(this._minorInc);
        }
        
        this._gridInvalidated = true;
      }
      
     /**
      * Add a function layer to the graph
      * 
      * @param layerName : String - Name of this layer - Must be non-blank and cannot be the reserved name, 'ALL'.  This allows specified functions to be plotted
      * by name and displayed/hidden by name.
      * 
      * @param layer : GraphLayer - GraphLayer instance that completely defines the graph layer for the specific function to be plotted on that layer
      * 
      * @return Nothing - The layer is added to the graph and automatically plotted (stage will be updated) as long as all inputs are valid.  Otherwise,
      * no action is taken.
      */
      , addLayer: function(layerName, layer)
      {
        if( layerName != undefined && layerName != "" )
        {
          if( layer != undefined && layer != null )
          {
            // store the layer in the layer collection (by name) and add a Shape to contain the graph
            var shape = new createjs.Shape();
            this._functionLayer.addChild(shape);
            
            this._layers[layerName] = { layer:layer, shape:shape };
            
            // plot the graph layer
            layer.plot( shape.graphics, this._left, this._top, this._right, this._bottom, this._pxPerUnitX, this._pxPerUnitY );
            
            this._stage.update();
          }
        }
      }
      
     /**
      * Add a graph slice tool to the overlay layer (movement allows query of constant-x or constant-y coordinates)
      * 
      * @param name : String - Slice Tool name
      * 
      * @param direction : String - 'horizontal' or 'vertical' to indicate direction of the slice tool ('horizontal' for constant-x and 'vertical' for constant-y) - will default
      * invalid inputs to 'vertical'.
      * 
      * @param callback : Function - Function to be called whenever the slice tool is moved
      * 
      * @param markerWidth: Pixel width of the triangular marker at the top and bottom of the tool
      * 
      * @param markerHeight : Pixel height of the triangular marker at the top and bottom of the tool
      * 
      * @param markerColor : String - hex color code for the triangular marker, i.e. '#ff0000'
      * 
      * @param lineColor : String - hex color code for the slice tool vertical or horizontal line that extends across the graph
      * 
      * @param lineWidth : Pixel width of the slice tool line that extends across the graph 
      * 
      * @param atValue : Initial coordinate value (x or y, depending on vertical or horizontal direction) at which the slice tool is placed
      * 
      * @return Nothing - the slice tool is created and added to the overlay layer. 
      */
      , addSliceTool: function(name, direction, callback, markerWidth, markerHeight, markerColor, lineColor, lineWidth, atValue) 
      {
        if( direction != "horizontal" && direction != "vertical" )
          direction = "vertical";
        
        var width  = isNaN(markerWidth) ? 25 : Math.max(8,Math.round(markerWidth ) );
        var height = isNaN(markerHeight) ? 13 : Math.max(3,Math.round(markerHeight) );
        var lWidth = isNaN(lineWidth) ? 7 : Math.max(1,Math.round(lineWidth) );
        var value  = isNaN(atValue) ? 0.0 : atValue;
        
        if( markerColor == undefined )
          markerColor = "#0000ff";
        
        if( lineColor == undefined )
          linecolor = "#ffffff";
        
        var sliceTool = new sliceRef.GraphSlice();
        sliceTool.create( this._stage, this._overlayLayer, callback, direction, width, height, this._xAxis, this._xAxisLength, this._yAxis, this._yAxisLength, 
                          markerColor, lineColor, lineWidth );
        
        sliceTool.set_value(value);
        
        this._sliceTools[name] = sliceTool;
        this._stage.update();
      }
      
     /**
      * Add a graph marker to the overlay layer and optionally constrain it to an existing function in a named layer
      * 
      * @param name : String - Marker name
      * 
      * @param color : String - Marker color
      * 
      * @param onMouseOver : Function - Callback to be executed on mouse over
      * 
      * @param onMouseOut : Function - Callback to be executed on mouse out
      * 
      * @param onMouseMove : Function - Callback to be executed on press and mouse move
      * 
      * @param radius : Int - Circle radius of the marker
      * 
      * @param constrainTo : String - Name of function layer to which the marker must be constrained on movement
      * 
      * @param atX : Number - initial marker x-coordinate 
      * 
      * @param atY : Number - initial marker y-coordinate (ignored if constrainTo is set)
      * 
      * @return Nothing - the graph marker is created and added to the overlay layer.  Constraint is immediate; otherwise, set the marker coordinates manually.
      */
      , addMarker: function(name, color, onMouseOver, onMouseOut, onMouseMove, radius, constrainTo, atX, atY)
      {
        if( radius == undefined )
          radius = 4;
        else
          radius = Math.max( 2, Math.round(radius) );
        
        if( isNaN(atX) )
          atX = 0.0;
        
        var marker = new markerRef.GraphDataMarker();
        marker.create( this._stage, this._overlayLayer, onMouseOver, onMouseOut, onMouseMove, radius, 
                       this._xAxis, this._xAxisLength, this._yAxis, this._yAxisLength, color );

        if( constrainTo != "" && constrainTo != null)
        {
          var layer = this._layers[constrainTo];
          if( layer != null )
          {
            var graphLayer = layer.layer;
            var y = graphLayer.eval(atX);
            
            marker.set_x(atX);
            marker.set_y(y);
            marker.set_constraint(graphLayer);
          }
        }
        else
        {
          // unconstrained marker is placed at the specified coordinates
          marker.set_x(atX);
          marker.set_y(atY);
        }
        
        marker.name         = name;
        this._markers[name] = marker;
        
        this._stage.enableMouseOver();
        this._stage.update();
      }
      
     /**
      * Assign the number of decimal places used when displaying tic labels
      * 
      * @param decimals : Int - Number of decimal places to display - must be zero or greater - this may need to be reset frequently during zoom in/out operations
      */
      , set_decimals: function(decimals)
      {
        this._decimals = isNaN(decimals) ? this._decimals : Math.max(0,decimals);
        this._labelsInvalidated = true;
      }
      
     /**
      * Assign the major tic mark increment for the grid
      * 
      * @param major : Number - Major tic increment - must be greater than zero - this may need to be reset frequently during zoom in/out operations
      */
      , set_majorInc: function(major)
      {
        this._majorInc = isNaN(major) ? this._majorInc : Math.max(0,major);
        this._gridInvalidated = true;
      }
      
     /**
      * Assign the minor tic mark increment for the grid
      * 
      * @param minor : Number - Minor tic increment - must be greater than zero - this may need to be reset frequently during zoom in/out operations
      */
      , set_minorInc: function(minor)
      {
        this._minorInc = isNaN(minor) ? this._minorInc : Math.max(0,minor);
        this._gridInvalidated = true;
      }

     /**
      * Show (or hide) the graph's grid (axes, tic marks, tic labels, and grid lines)
      * 
      * @param show : Boolean - true if the axis layer is visible
      * 
      * @return Nothing - The graph's axis layer is rendered (or hidden) based on the 'show' parameter.  Typical usage is to render the grid once and then dynamically
      * render/alter the function layers and manipulate overlays such as graph tools (marker and graph slice).  Stage updates are done internally.
      */
      , showGrid: function(show)
      {
        if( this._gridInvalidated )
          this.__drawGrid();
        
        if( this._labelsInvalidated )
          this.__ticLabels(false);
        
        this._gridShape.visible        = show;
        this._xAxisShape.visible       = show;
        this._xAxisTicMarks.visible    = show;
        this._xAxisArrowsShape.visible = show;
        this._xAxisTicLabels.visible   = show;  
        this._yAxisShape.visible       = show;
        this._yAxisTicMarks.visible    = show;
        this._yAxisArrowsShape.visible = show; 
        this._yAxisTicLabels.visible   = show;
        
        this._gridRendered = true;
        
        this._stage.update();
      }
      
     /**
      * Zoom the graph in or out - note that the grid and axes must have already been rendered before zooming or panning
      *  
      * @param dir : String - Zoom direction, either 'in' or 'out'
      * 
      * @param factor : Int - Zoom factor, i.e. 2, 4, 10, etc.  Note that zoom factor is applied to the current axis bounds which are
      * modified by each successive zoom. Take this into account if adjusting the zoom factor in a loop since the zooming is exponential.
      * 
      * @return Nothing - If zoom direction is correct, the graph is zoomed about its current center and immediately updated.  Rounding in internal division and 
      * multiplication may affect axis bounds.
      */
      , zoom: function(dir, factor)
      {
        if( factor < 1 || !this._gridRendered )
          return;
       
        var zoomFactor = Math.round(factor);
        var zoomDir    = dir == undefined ? 'in' : dir;
        zoomDir        = zoomDir.toLowerCase();
         
        if( zoomDir.charAt(0) != 'i' && zoomDir.charAt(0) != 'o' )
          zoomDir = 'in';
         
        // zoom both axes
        this._xAxis.zoom(zoomDir, zoomFactor);
        this._yAxis.zoom(zoomDir, zoomFactor);
         
        // get the new graph bounds
        this._left  = this._xAxis.get_min();
        this._right = this._xAxis.get_max();
         
        this._bottom = this._yAxis.get_min();
        this._top    = this._yAxis.get_max();
         
        this._xAxis.setBounds(this._left, this._top, this._right, this._bottom, this._xAxisLength, this._yAxisLength);
        this._yAxis.setBounds(this._left, this._top, this._right, this._bottom, this._xAxisLength, this._yAxisLength);
        
        this._pxPerUnitX = this._xAxisLength/(this._right - this._left);
        this._pxPerUnitY = this._yAxisLength/(this._top - this._bottom);
        
        this.redraw();
      }
     
     /**
      * Pan the grid in the specified direction - note that the grid and axes must have already been rendered before zooming or panning
      *  
      * @param dir : String - Pan direction, either 'left', 'right', 'up', or 'down'
      * 
      * @param amount : Int - Pan amount in pixels
      * 
      * @return Nothing - The entire graph is panned by the specified amount in the specified direction (provided the direction is properly specified) - this results 
      * in a complete redraw of the grid and tic labels
      */
      , pan: function(dir, amount)
      {
        if( amount < 1 || !this._gridRendered )
          return;
        
        var theAmount = Math.round(amount);
        var direction = dir.toLowerCase();
        direction     = direction.charAt(0);
        
        if( direction != 'l' && direction != 'r' && direction != 'u' && direction != 'd' )
          return;
        
        // for each direction, convert the pixel distance into a corresponding offset in graph units - adjust the internal graph bounds and then redraw
        var dx = 0;
        var dy = 0;
        switch( direction )
        {
          case "l":
            dx = amount/this._pxPerUnitX;
          break;
          
          case "r":
            dx = -amount/this._pxPerUnitX;
          break;
          
          case "u":
            dy = -amount/this._pxPerUnitY;
          break;
          
          case "d":
            dy = amount/this._pxPerUnitY;
          break;
        }
        
        this._left   += dx;
        this._right  += dx;
        this._top    += dy;
        this._bottom += dy;
        
        this._xAxis.setBounds(this._left, this._top, this._right, this._bottom, this._xAxisLength, this._yAxisLength);
        this._yAxis.setBounds(this._left, this._top, this._right, this._bottom, this._xAxisLength, this._yAxisLength);
        
        this.redraw();
      }
      
     /**
      * Shift the graph in both x- and y-directions, simultaneously
      *  
      * @param dx: Int - Horizontal pixel shift
      * 
      * @param dy: Int - Vertical pixel shift
      * 
      * @return Nothing - The entire graph is the specified directions - this results  in a complete redraw of the grid and tic labels
      */
      , shift2D: function(dx, dy)
      {
        if( isNaN(dx) || isNaN(dy) || !this._gridRendered )
          return;
         
        dx /= this._pxPerUnitX;
        dy /= this._pxPerUnitY;
         
        this._left   += dx;
        this._right  += dx;
        this._top    += dy;
        this._bottom += dy;
         
        this._xAxis.setBounds(this._left, this._top, this._right, this._bottom, this._xAxisLength, this._yAxisLength);
        this._yAxis.setBounds(this._left, this._top, this._right, this._bottom, this._xAxisLength, this._yAxisLength);
         
        this.redraw();
      }
      
     /**
      * Redraw the entire graph after a series of external changes
      * 
      * @return Nothing - every element of the graph is redrawn
      */
      , redraw: function()
      {
        this.__drawGrid();
        this.__ticLabels(true);
        
        this.__graphFunctionLayers();
        
        // overlays
        var marker;
        var x,y;
        for( var markerName in this._markers )
        {
          marker = this._markers[markerName];
          marker.redraw();                    // tbd - add obervables list to the Axis class?
        }
        
        this._stage.update();
      }
      
      // internal method - draw all function layers
      , __graphFunctionLayers: function()
      {
        var layer, graphLayer, shape;
        for( var layerName in this._layers ) 
        {
          if( this._layers.hasOwnProperty(layerName) ) 
          {
            layer      = this._layers[layerName];
            graphLayer = layer.layer;
            
            // tbd - check layer visibility
            graphLayer.plot( layer.shape.graphics, this._left, this._top, this._right, this._bottom, this._pxPerUnitX, this._pxPerUnitY );
          }
        }
      }
      
      // internal method - draw Axes and grid from scratch
      , __drawGrid: function()
      {
        if( !this._showGrid )
          return;
        
        var g = this._gridShape.graphics;
          
        g.clear();
        g.setStrokeStyle(this._gridThickness);
        g.beginStroke( this._gridColor, this._gridAlpha );
         
        this._xAxis.drawGrid(g);
        this._yAxis.drawGrid(g);
          
        g.endStroke();
        
        var txWidth  = 3*this._xAxisThickness+1;
        var txHeight = 2*this._xAxisThickness+2;
        
        g = this._xAxisShape.graphics;
        g.clear();
        g.setStrokeStyle(this._xAxisThickness);
        
        g.beginStroke( this._xAxisColor, this._xAxisAlpha );
        this._xAxis.drawAxis(g, txWidth, txHeight);
        g.endStroke();
        
        var tyWidth  = 3*this._yAxisThickness+1;
        var tyHeight = 2*this._yAxisThickness+2;
        
        g = this._yAxisShape.graphics;
        g.clear();
        g.setStrokeStyle(this._yAxisThickness);
        g.beginStroke( this._yAxisColor, this._yAxisAlpha );
        this._yAxis.drawAxis(g, tyWidth, tyHeight);
        g.endStroke();
        
        if( this._xAxisTriangles )
        {
          g = this._xAxisArrowsShape.graphics;
          g.clear();
          g.beginFill( this._xAxisColor, this._xAxisAlpha );
          this._xAxis.drawArrows(g, txWidth, txHeight);
          g.endFill();
        }
        
        if( this._yAxisTriangles )
        {
          g = this._yAxisArrowsShape.graphics;
          g.clear();
          g.beginFill( this._yAxisColor, this._yAxisAlpha );
          this._yAxis.drawArrows(g, tyWidth, tyHeight);
          g.endFill();
        }
        
        // major and minor tic marks for each axis
        var majorThickness, minorThickness, majorHeight, minorHeight;
        if( this._majorInc > 0 )
        {
          majorThickness = Math.max(1, this._xAxisThickness-1);
          minorThickness = Math.max(1, this._xAxisThickness-2);
          majorHeight    = 6*this._xAxisThickness;
          
          g = this._xAxisTicMarks.graphics;
          g.clear();
          g.setStrokeStyle(majorThickness);
          g.beginStroke( this._xAxisColor, this._xAxisAlpha );
          this._xAxis.drawMajorTicMarks(g, majorHeight);
          g.endStroke();
          
          g = this._yAxisTicMarks.graphics;
          g.clear();
          g.setStrokeStyle(majorThickness);
          g.beginStroke( this._yAxisColor, this._yAxisAlpha );
          this._yAxis.drawMajorTicMarks(g, majorHeight);
          g.endStroke();
        }
        
        if( this._minorInc > 0 )
        {
          majorThickness = Math.max(1, this._yAxisThickness-1);
          minorThickness = Math.max(1, this._yAxisThickness-2);
          majorHeight    = 6*this._yAxisThickness;
          minorHeight    = Math.max(2, 0.5*majorHeight);
          
          g = this._xAxisTicMarks.graphics;
          g.setStrokeStyle(minorThickness);
          g.beginStroke( this._xAxisColor, this._xAxisAlpha );
          this._xAxis.drawMinorTicMarks(g, minorHeight);
          g.endStroke();
          
          g = this._yAxisTicMarks.graphics;
          g.setStrokeStyle(minorThickness);
          g.beginStroke( this._yAxisColor, this._yAxisAlpha );
          this._yAxis.drawMinorTicMarks(g, minorHeight);
          g.endStroke();
        }
        
        this._gridInvalidated = false;
      }
      
      // internal method - render tic labels
      , __ticLabels: function(redraw)
      {
        if( !redraw )
        {
          this._xAxisTicTextObjects.length    = 0;
          this._xAxisTicDisplayObjects.length = 0;
          this._yAxisTicTextObjects.length    = 0;
          this._yAxisTicDisplayObjects.length = 0;
        }
        
        // get the pixel locations of the major tic marks
        var majorTics    = this._xAxis.getTicCoordinates("major");
        var numMajorTics = majorTics.length;
        var numLabels    = this._xAxisTicDisplayObjects.length;
        var lbl;
        var dispObj;
        var i;
        var ticX;
        
        if( numLabels < numMajorTics )
        {
          // create labels JIT and then re-use the pool every redraw
          for( i=numLabels; i<numMajorTics; ++i)
          {
            lbl     = new createjs.Text( " ", this._ticLabelFont, this._ticLabelColor );
            dispObj = this._xAxisTicLabels.addChild(lbl);
            
            this._xAxisTicTextObjects.push( lbl );
            this._xAxisTicDisplayObjects.push( dispObj );
          }
        }
        
        // use however many tic labels are necessary and hide the remaining ones
        var labelText = this._xAxis.getTicMarkLabels("major");

        // make all tic labels invisible by default
        for( i=0; i<numLabels; ++i )
          this._xAxisTicDisplayObjects[i].visible = false;
        
        if( this._xAxis.isVisible() )
        {
          // position the labels - it's a matter of style, but for this demo, the endpoint labels are not displayed if they are near the Canvas edge
          var axisY    = this._xAxis.get_axisOffset();
          var baseline = axisY + 10;
        
          for( i=0; i<numMajorTics; ++i )
          {
            lbl             = this._xAxisTicTextObjects[i];
            dispObj         = this._xAxisTicDisplayObjects[i];
            if( labelText[i] != "0" )
            {
              lbl.text        = __formatter.toFixed(labelText[i], this._decimals); 
              ticX            = majorTics[i];
              dispObj.x       = Math.round( ticX - 0.5*lbl.getMeasuredWidth() );
              dispObj.y       = baseline;
              dispObj.visible = ticX > 10 && ticX < axisLength-10;
            }
          }
        }
        
        majorTics    = this._yAxis.getTicCoordinates("major");
        numMajorTics = majorTics.length;
        numLabels    = this._yAxisTicDisplayObjects.length;
        var ticY;
        
        if( numLabels < numMajorTics )
        {
          // create labels JIT and then re-use the pool every number line redraw
          for( i=numLabels; i<numMajorTics; ++i)
          {
            lbl     = new createjs.Text(" ", this._ticLabelFont, this._ticLabelColor );
            dispObj = this._yAxisTicLabels.addChild(lbl);
            
            this._yAxisTicTextObjects.push( lbl );
            this._yAxisTicDisplayObjects.push( dispObj );
          }
        }
        
        // use required tic labels & hide the remaining ones
        var labelText = this._yAxis.getTicMarkLabels("major");

        // make all tic labels invisible by default
        for( i=0; i<numLabels; ++i )
          this._yAxisTicDisplayObjects[i].visible = false;
        
        if( this._yAxis.isVisible() )
        {
          var axisX    = this._yAxis.get_axisOffset();
          var baseline = axisX + 8;
        
          for( i=0; i<numMajorTics; ++i )
          {
            lbl             = this._yAxisTicTextObjects[i];
            dispObj         = this._yAxisTicDisplayObjects[i];
            if( labelText[i] != "0" )
            {
              lbl.text        = __formatter.toFixed(labelText[i], this._decimals); 
              ticY            = axisHeight - majorTics[i];
              dispObj.x       = baseline;
              dispObj.y       =  Math.round( ticY - 0.5*lbl.getMeasuredHeight() ) - 1;
              dispObj.visible = ticY > 10 && ticY < axisHeight-10;
            }
          }
        }
        
        this._labelsInvalidated = false;
      }
    }
  }
  
  return returnedModule;
});