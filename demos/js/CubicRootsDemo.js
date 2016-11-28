/*
 * Supporting script for testing cubic (polynomial) root finder. Copyright (c) 2014, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */
require(['jquery', 
         'bootstrap', 
         '../../math/CubicRoots'], 
         function($,                       // jQuery
                  bootstrapRef,            // Bootstrap
                  CubicRootModule          // CubicRoots
                  )
{
  $( document ).ready( onPageLoaded );
  
  function onPageLoaded()
  {
    var cubicRef = new CubicRootModule();
    var __cubic  = new cubicRef.CubicRoots();

    // basic tests where roots are known and all coefficients well-defined
    __cubic.set_x0(-10);
    __cubic.set_x1(10);
    
    var roots = __cubic.getRoots(-6, -25, -3, 4);
    console.log( "roots should be 3, -0.25, and -2, returned: ", roots );
    
    roots = __cubic.getRoots(-6, -5, 2, 1);
    console.log( "roots should be 2, -1, -3, returned: ", roots );
    
    roots = __cubic.getRoots(4, -1, -1, 3);
    console.log( "one real root at approximately -1, returned: ", roots );
    
    roots = __cubic.getRoots(2, -7, -1, 2);
    console.log( "roots should be 2, -1.78, 0.28, returned: ", roots );
    
    // now for some outlier tests
    roots = __cubic.getRoots(0);   // forgot to add arguments
    console.log( "outlier test 1 should return 0, returned: ", roots );
    
    // no solution, y = x^2 + 2
    roots = __cubic.getRoots(2, 0, 1, 0);
    console.log( "no solution test (empty return), returned: ", roots );
  };
  
});