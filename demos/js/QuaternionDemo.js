/*
 * Supporting script for testing quaternion class. Copyright (c) 2014, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */
require(['jquery', 
         'bootstrap', 
         '../../math/Quaternion'], 
         function($,                       // jQuery
                  bootstrapRef,            // Bootstrap
                  QuaternionModule         // Quaternion
                  )
{
  $( document ).ready( onPageLoaded );
  
  function onPageLoaded()
  {
    var quaternionRef = new QuaternionModule();
    var __quaternion  = new quaternionRef.Quaternion();

    // quaternions are always of the form [s,v] where s is the scalar part
    __quaternion.fromArray( [1, 2, -1, 0.5] );
    
    var q = __quaternion.clone();
    var v = __quaternion.get_values();
    
    console.log( "clone test [1, 2, -1, 0.5] : ", v );
    
    __quaternion.normalize() 
    v = __quaternion.get_values();
    
    console.log( "normalize: [0.4, 0.8, -0.4, 0.2 ] : ", v );
    
    __quaternion.fromArray( [0.5, 2, 3.5, -1.25] );
    q.fromArray( [1.25, 1.0, 1.5, 1.75] )
    
    __quaternion.multiply(q);
    v = __quaternion.get_values();
    console.log( "mult. test [ -4.4375, 11, 0.375, -1.1875] : ", v );
    
    __quaternion.fromArray( [0, 2, -1, -3] );
    __quaternion.invert();
    console.log( "inverse test [ 0, -0.142857, 0.07142857, -0.21428571] : ", __quaternion.get_values() );
    
    __quaternion.fromArray( [0, 2, -1, -3] );
    var m = __quaternion.toRotationMatrix();
    
    console.log( "rotation matrix test" );
    console.log( "row 1: [ -0.4285714, -0.2857143, -0.857143 ] " );
    console.log( "row 2: [ -0.2857143, -0.857143, 0.4285714  ] " );
    console.log( "row 3: [ -0.857143, 0.42857143, 0.2857143  ] " );
    
    console.log( "result: ", m );

    __quaternion.fromArray( [1.5, -1, 2, 2.5] );
    q.fromArray( [3, 2, 5, -2] );
    
    __quaternion.slerp( q, 0.1 );
    console.log( "slerp test (0.1) [ 1.5, -1, 2, 2.5 ] : ", __quaternion.get_values() );
  }
});