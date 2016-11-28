define([], function () 
{
  var returnedModule = function () 
  {
    this.ShapeConstants = function() 
    {
      this.NONE        = "none";        // no type or null parameter
      this.ORIENT      = "orient";      // define orientation of polygonal shape
      this.TYPE        = "type";        // define type of a specific polygonal shape that has multiple types or options
      this.UP          = "up";          // upward orientation of poygonal shape
      this.DOWN        = "down";        // downward orientation of polygonal shape
      this.LEFT        = "left";        // leftward orientation of polygonal shape
      this.RIGHT       = "right";       // rightward orientation of polygonal shape
      this.MAJOR       = "major";       // major axis or dimensional parameter
      this.MINOR       = "minor";       // minor axis or dimensional parameter
      this.ISOCELES    = "isoceles";    // define an isoceles triangle
      this.EQUILATERAL = "equilateral"; // define an equilateral triangle
      this.SECONDARY   = "secondary";   // a secondary parameter
    }
  }
  
  return returnedModule;
});