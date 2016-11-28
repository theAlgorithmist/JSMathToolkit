/*
 * Supporting script for testing random deviate generation. Copyright (c) 2014, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */
require(['jquery', 
         'bootstrap', 
         '../../math/Deviates'], 
         function($,                       // jQuery
                  bootstrapRef,            // Bootstrap
                  DeviatesModule           // Deviates
                  )
{
  $( document ).ready( onPageLoaded );
  
  function onPageLoaded()
  {
    var DeviatesRef = new DeviatesModule();
    var __deviates  = new DeviatesRef.Deviates();
    
// Uniform
    
//    var u1 = __deviates.uniform(1009, true);
//    
//    console.log( "u: ", u1)
//    var i, u;
//    var len = 50;
//    for( i=0; i<len; ++i )
//    {
//      u = __deviates.uniform(1009, false);
//      console.log( "u: ", u );
//    }
    
// Exponential
    
//    var u1 = __deviates.exponential(1009, true);
//    
//    console.log( "u: ", u1)
//    var i, u;
//    var len = 50;
//    for( i=0; i<len; ++i )
//    {
//      u = __deviates.exponential(1009, false);
//      console.log( "u: ", u );
//    }
    
// Normal    
    
//    var u1 = __deviates.normal(1009, 1.0, 0.5, true);
//    
//    console.log( "u: ", u1)
//    var i, u;
//    var len = 50;
//    for( i=0; i<len; ++i )
//    {
//      u = __deviates.normal(1009, 1.0, 0.5, false);
//      console.log( "u: ", u );
//    }
    
// Gamma
    
    var u1 = __deviates.gamma(1009, 1.0, 0.1, true);
    
    console.log( "u: ", u1)
    var i, u;
    var len = 50;
    for( i=0; i<len; ++i )
    {
      u = __deviates.gamma(1009, 1.0, 0.1, false);
      console.log( "u: ", u );
    }
  };
  
});