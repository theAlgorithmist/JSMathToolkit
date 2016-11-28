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
    * An interactive (circular) marker, written on top of EaselJS, intended for use in marking points on a 2D graph.
    * 
    * @author by:  Jim Armstrong (www.algorithmist.net)
    * 
    * @version 1.0
    */
    this.GraphMarker = function()
    {
      this._callbackFcn = function(){};
      this._markerShape = null;
      this._stage       = null;
      this._markerRed   = 255;
      this._markerGreen = 0;
      this._markerBlue  = 0;
    };

    this.GraphMarker.__name__ = true;
    this.GraphMarker.prototype = 
    {
     /**
      * Create a new GraphMarker
      * 
      * @param stage : Stage - Reference to user-created EaselJS Stage
      * 
      * @param callback : Function - Function to be called whenever the marker is moved
      * 
      * @param radius : Int - Radius of the graph marker in pixels
      * 
      * @param _xAxis: GraphAxis - Reference to the x-axis
      * 
      * @param _yAxis: GraphAxis - Reference to the y-axis
      * 
      * @param _xAxisLength: Int - Length of the x-axis in pixels
      * 
      * @param _yAxisLength: Int - Length of the y-axis in pixels
      * 
      * @param _markerRed: Int - Red component of marker color
      * 
      * @param _markerGreen: Int - Green component of marker color
      * 
      * @param _markerBlue: Int - Blue component of marker color
      * 
      * @return Nothing - The GraphMarker is interactive.  Place the marker using the set_x() and set_y() methods and then move the marker across the graph area
      * to send the x- and y-coordinates to the callback function.
      */
      create: function(stage, callback, radius, _xAxis, _xAxisLength, _yAxis, _yAxisLength, markerRed, markerGreen, markerBlue) 
      {
        if( stage == null )
          return;
    
        if( markerRed != null )
          this._markerRed = markerRed;
    
        if( markerGreen != null )
          this._markerGreen = markerGreen;
    
        if( markerBlue != null )
          this._markerBlue = markerBlue;
    
        if( radius == null )
          radius = 10;
    
        if( callback != null )
          this._callbackFcn = callback;
    
        stage.enableMouseOver(10);
    
        this._markerShape        = new createjs.Shape();
        this._markerShape.cursor = 'pointer';
        var g                    = this._markerShape.graphics;
        g.clear();
        g.beginFill( createjs.Graphics.getRGB(this._markerRed, this._markerGreen, this._markerBlue,1) );
        g.drawCircle(0,0,radius);
        g.endFill();
    
        stage.addChild(this._markerShape);
        stage.update();
    
        this._stage       = stage;
        var localStage    = stage;
        var localShape    = this._markerShape;
        var localCallback = this._callbackFcn;
        var xAxis         = _xAxis;
        var yAxis         = _yAxis;
        var xLength       = _xAxisLength;
        var yLength       = _yAxisLength;
    
        var onPressMove = function(evt)
        {
          localShape.cursor = 'pointer';
          localShape.x      = evt.stageX;
          localShape.y      = evt.stageY;
      
          if( localCallback != null )
          {
            // compute the new x- and y-coordinates in user space and use them as arguments to the callback function
            var left = xAxis.get_min();
            var px   = xLength/(xAxis.get_max() - left);
            var newX = localShape.x/px + left;
        
            var top  = yAxis.get_max();
            var px   = yLength/(top - yAxis.get_min());
            var newY = top - localShape.y/px;
        
            localCallback(newX, newY);
          }
      
          localStage.update();
        };
        onPressMove.bind(this);
    
        this._markerShape.on("pressmove", onPressMove);
      }
  
     /**
      * Assign the x-coordinate of the marker 
      * 
      * @param _xAxis : GraphAxis - reference to the x-axis
      * 
      * @param _length: Int - Length of the x-axis in pixels
      * 
      * @param _x: Float - x-coordinate (in graph units) to place the marker.  For example, if the x-axis goes from 1.0 to 9.5, place the graph marker at x = 2.75.
      * 
      * @return Nothing - the GraphMarker is placed at the specified x-coordinate and the most recently assigned y-coordinate.
      */
      ,set_x: function(_xAxis, _length, _x)
      {
        // compute the pixel coordinate based on the user coordinate
        var left = _xAxis.get_min();
        var px   = _length/(_xAxis.get_max() - left);
    
        this._markerShape.x = (_x-left)*px;
      }
  
     /**
      * Assign the y-coordinate of the marker 
      * 
      * @param _yAxis : GraphAxis - reference to the y-axis
      * 
      * @param _length: Int - Length of the y-axis in pixels
      * 
      * @param _y: Float - y-coordinate (in graph units) to place the marker.  For example, if the y-axis goes from 0 to 10, place the marker at y = 5.25.
      * 
      * @return Nothing - The GraphMarker is placed at the specified y-coordinate and the most recently assigned x-coordinate.
      */
      ,set_y: function(_yAxis, _length, _y)
      {
        // compute the pixel coordinate based on the user coordinate
        var top = _yAxis.get_max();
        var px  = _length/(top - _yAxis.get_min());
    
        this._markerShape.y = (top-_y)*px;
      }

     /**
      * Destroy this GraphMarker
      * 
      * @return Nothing - The GraphMarker is removed from the EaselJS Stage display list.
      */
      ,destroy: function()
      {
        if( this._markerShape )
          this._stage.removeChild(this._markerShape);  
      }
    };
  }
  
  return returnedModule;
});