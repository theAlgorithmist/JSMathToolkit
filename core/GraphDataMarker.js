define([], function () 
{
  var returnedModule = function () 
  {
   /**
    * An interactive (circular) marker, written on top of EaselJS, intended for use in marking points on a 2D graph.  Allows arbitrary object data to be associated with the marker and adds
    * mouseover/out callback functionality .
    * 
    * Add name/value pairs to the marker data as needed.
    * 
    * @author Jim Armstrrong (www.algorithmist.net)
    * 
    * @version 1.0
    */
    this.GraphDataMarker = function()
    {
      // marker name or identifier - treated a public property; you break it, you buy it
      this.name = "Marker";
      
      this._callbackFcn = function(){};
      this._onMouseOver = function(){};
      this._onMouseOut  = function(){};
      this._markerShape = null;
      this._stage       = null;
      this._markerColor = '#ff0000';
      this._data        = {};
      this._x           = 0;
      this._y           = 0;
      
      this._xAxis       = null
      this._xAxisLength = 0;
      this._yAxis       = null;
      this._yAxisLength = 0;
      
      this._contrainTo = null;
    };

    this.GraphDataMarker.__name__ = true;
    this.GraphDataMarker.prototype = 
    {
      create: function(stage, parentContainer, onMouseOver, onMouseOut, onMouseMove, radius, _xAxis, _xAxisLength, _yAxis, _yAxisLength, markerColor) 
      {
        if( stage == null )
          return;
    
        if( markerColor != null )
          this._markerColor = markerColor;
    
        if( radius == null )
          radius = 10;
    
        if( onMouseMove != null )
          this._callbackFcn = onMouseMove;
    
        if( onMouseOver != null )
          this._onMouseOver = onMouseOver;
    
        if( onMouseOut != null )
          this._onMouseOut = onMouseOut;
    
        this._xAxis       = _xAxis;
        this._xAxisLength = _xAxisLength;
        this._yAxis       = _yAxis;
        this._yAxisLength = _yAxisLength;
        
        this._markerShape        = new createjs.Shape();
        this._markerShape.cursor = 'pointer';
    
        var g = this._markerShape.graphics;
    
        g.clear();
        g.beginFill( this._markerColor );
        g.drawCircle(0,0,radius);
        g.endFill();
    
        parentContainer.addChild(this._markerShape);
    
        this._stage       = stage;
        var localStage    = stage;
        var parent        = this;
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
            // compute the new x- and y-coordinates in user space and use them as arguments to the callback function, or deal with a function-constrained marker
            var left = xAxis.get_min();
            var px   = xLength/(xAxis.get_max() - left);
            var newX = localShape.x/px + left;
        
            var top  = yAxis.get_max();
            var px   = yLength/(top - yAxis.get_min());
            var newY;
            
            if( parent._constrainTo != null )
            {
              newY         = parent._constrainTo.eval(newX);   // graph coordinate
              localShape.y = (top-newY)*px;                    // constrain graphic location y-coordinate
            }
            else
              newY = top - localShape.y/px;
        
            parent._x = newX;
            parent._y = newY;
            
            localCallback(newX, newY, parent);
          }
      
          localStage.update();
        };
        onPressMove.bind(this);
    
        this._markerShape.on("pressmove", onPressMove);
        this._markerShape.on("mouseover", function(){parent._onMouseOver(parent)});
        this._markerShape.on("mouseout", function(){parent._onMouseOut(parent)});
      }

      , setData: function(_name, _value)
      {
        this._data[_name] = _value;
      }
  
      , set_constraint: function(_graphLayer)
      {
        this._constrainTo = _graphLayer;
      }
      
      , getData: function(_name)
      {
        return this._data[_name];
      }
  
      , get_x: function()
      {
        return this._x;
      }
      
      , get_y: function()
      {
        return this._y;
      }
      
      , redraw: function()
      {
        // force a reposition of the marker shape based on axis changes 
        this.set_x(this._x);
        this.set_y(this._y);
      }
      
      // assign the x-coordinate in graph units
      , set_x: function(_x)
      {
        // compute the pixel coordinate based on the user coordinate
        var left = this._xAxis.get_min();
        var px   = this._xAxisLength/(this._xAxis.get_max() - left);
    
        this._x = _x;
        this._markerShape.x = (_x-left)*px;
      }
  
      // assign the y-coordinate in graph units
      , set_y: function(_y)
      {
        // compute the pixel coordinate based on the user coordinate
        var top = this._yAxis.get_max();
        var px  = this._yAxisLength/(top - this._yAxis.get_min());
    
        this._y = _y;
        this._markerShape.y = (top-_y)*px;
      }

      , destroy: function()
      {
        if( this._markerShape )
          this._stage.removeChild(this._markerShape);  
      }
    }
  }
    
  return returnedModule;
});