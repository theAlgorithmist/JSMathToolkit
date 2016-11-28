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
    * An interactive 2D graph slicer that cuts a graph into two planes or identifies lines of constant-x or constant-y.  This tool written on top of EaselJS and is 
    * intended for use in selecting constant-x or constant-y values on a 2D graph.
    * 
    * @author Jim Armstrong (www.algorithmist.net)
    * 
    * @version 1.0
    */
    this.GraphSlice = function()
    {
      this._callbackFcn  = function(){};
      this._sliceShape   = null;
      this._stage        = null;
      this._direction    = "vertical";
      this._markerWidth  = 0;
      this._markerHeight = 0;
      
      this._xAxis       = null;
      this._xAxisLength = 0;
      this._yAxis       = null;
      this._yAxisLength = 0;
    };

    this.GraphSlice.__name__ = true;
    this.GraphSlice.prototype = 
    {
     /**
      * Create a new GraphSlice tool
      * 
      * @param stage : Stage - Reference to user-created EaselJS Stage
      * 
      * @param container : Container - Parent EaselJS container
      * 
      * @param callback : Function - Function to be called whenever the marker is moved
      * 
      * @param direction : String - "horizontal" or "vertical" to indicate orientation and dragging direction for the tool
      * 
      * @param markerWidth: Int - pixel width of the triangular marker at each end of the tool
      * 
      * @param markerHeight: Int - pixel height of the triangular marker at each end of the tool
      * 
      * @param _xAxis: GraphAxis - Reference to the x-axis
      * 
      * @param _xAxisLength: Int - Length of the x-axis in pixels
      * 
      * @param _yAxis: GraphAxis - Reference to the y-axis
      * 
      * @param _yAxisLength: Int - Length of the y-axis in pixels
      * 
      * @param _markerColor: String - Hex color code for marker color, i.e. #0000ff
      * 
      * @param _lineColor: String - Hex color code for line color, i.e. #00ff00
      * 
      * @param _lineWidth: Int - Slice tool line width in pixels (must be greater than zero)
      * 
      * @return Nothing - The GraphSlice is interactive.  Place the tool using the set_value() method and then move the tool across the graph area
      * to send the coordinate value to the callback function
      */
      create: function(stage, container, callback, direction, markerWidth, markerHeight, xAxis, xAxisLength, yAxis, yAxisLength, markerColor, lineColor, lineWidth) 
      {
        if( stage == null )
          return;
    
        var mColor  = markerColor;
        var lColor  = lineColor;
        var lWidth  = lineWidth;
        var mWidth  = markerWidth;
        var mHeight = markerHeight;
    
        if( mColor == undefined )
          mColor = "#7F00FF";
    
        if( lColor == undefined )
          lColor = "#FFC125";
    
        if( lWidth == undefined )
          lWidth = 2;
    
        lWidth  = Math.max(1, lWidth);
        mWidth  = Math.max(8, mWidth);
        mHeight = Math.max(5, mHeight);
    
        this._markerWidth  = mWidth;
        this._markerHeight = mHeight;
   
        if( callback != null )
          this._callbackFcn = callback;
    
        this._sliceShape        = new createjs.Shape();
        this._sliceShape.cursor = 'pointer';
    
        container.addChild(this._sliceShape);
        stage.enableMouseOver(10);
        
        this._xAxis       = xAxis;
        this._xAxisLength = xAxisLength;
        this._yAxis       = yAxis;
        this._yAxisLength = yAxisLength;
       
        var g = this._sliceShape.graphics;
        g.clear();
        g.beginStroke( lColor );
    
        // render the line and triangular markers (initial position is either flush left or flush top, depending on orientation)
        var m2 = 0.5*mWidth;
        if( direction.toLowerCase() == "horizontal")
        {
          g.moveTo(0, 0);
          g.lineTo(xAxisLength, 0);
          g.endStroke();
      
          if( mWidth > 0 && mHeight > 0 )
          {
            // left triangle marker
            g.beginFill( mColor );
            g.moveTo(0,-m2);
            g.lineTo(mHeight,0);
            g.lineTo(0,m2);
            g.lineTo(0,-m2);
            g.endFill();
            
            // right triangle marker
            g.beginFIll( mColor );
            g.moveTo(this._xAxisLength-m2,m2);
            g.lineTo(this._xAxisLength,0);
            g.lineTo(this._xAxisLength,mHeight);
            g.lineTo(this._xAxisLength-m2,m2);
            g.endFill();
          }
        }
        else
        {
          g.moveTo(0, 0);
          g.lineTo(0, yAxisLength);
          g.endStroke();
      
          if( mWidth > 0 && mHeight > 0 )
          {
            // top triangle marker
            g.beginFill( mColor );
            g.moveTo(-m2,0);
            g.lineTo(0, mHeight);
            g.lineTo(m2,0);
            g.lineTo(-m2,0);
            g.endFill();
        
            // bottom triangle marker
            g.beginFill( mColor );
            g.moveTo(-m2,yAxisLength);
            g.lineTo(0, yAxisLength-mHeight);
            g.lineTo(m2,yAxisLength);
            g.lineTo(-m2,yAxisLength);
            g.endFill();
          }
        }

        stage.update();
    
        this._stage        = stage;
        this._direction    = direction;
        var localStage     = stage;
        var localShape     = this._sliceShape;
        var localCallback  = this._callbackFcn;
        var xAxis          = xAxis;
        var yAxis          = yAxis;
        var xLength        = xAxisLength;
        var yLength        = yAxisLength;
        var localDirection = direction;
        var lWidth         = markerWidth;
        var lHeight        = markerHeight;
    
        var onPressMove = function(evt)
        {   
          localShape.cursor = 'pointer';
          if( localCallback != null )
          {
            // pass new x- or y-coordinate to the callback function.  the graphic was designed to place the origin at one point of the line segment 
            var value = 0;
            if( localDirection.toLowerCase() == "horizontal" )
            {
              var top = yAxis.get_max();
              var px  = yLength/(top - yAxis.get_min());
              value   = top - localShape.y/px;
          
              // x is constant
              localShape.y = evt.stageY;
            }
            else
            {
              var left = xAxis.get_min();
              var px   = xLength/(xAxis.get_max() - left);
              value    = localShape.x/px + left;
          
              // y is constant
              localShape.x = evt.stageX;
            }
        
            localCallback(value);
          }
      
          localStage.update();
        };
        onPressMove.bind(this);
    
        this._sliceShape.on("pressmove", onPressMove);
      }
  
     /**
      * Access the direction of this GraphSlice tool
      * 
      * @return String - "horizontal" for a tool that slices the y-axis and vertical for a tool that slices the x-axis.
      */
      ,get_direction: function()
      {
        return this._direction;
      }
  
     /**
      * Assign the x-or y-coordinate for the GraphSlice tool
      * 
      * @param _v : Float - Value in graph unit along the axis at which the GraphSlice tool is rendered.
      */
      ,set_value: function(_v)
      {
        if( this._direction == "horizontal" )
        {
          var top = this._yAxis.get_max();
          var px  = this._yAxisLength/(top - this._yAxis.get_min());
      
          this._sliceShape.y = (top-_v)*px;
        }
        else
        {
          var left = this._xAxis.get_min();
          var px   = this._xAxisLength/(this._xAxis.get_max() - left);
    
          console.log( (_v-left)*px );
          this._sliceShape.x = (_v-left)*px;
        }
      }

     /**
      * Destroy this GraphSlice tool
      * 
      * @return Nothing - The GraphSlice tool is removed from the EaselJS display list
      */
      ,destroy: function()
      {
        if( this._sliceShape )
          this._stage.removeChild(this._sliceShape);  
      }
    };
  }
  
  return returnedModule;
});