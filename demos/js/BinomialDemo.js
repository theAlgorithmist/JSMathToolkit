/*
 * Supporting script for testing binomial coefficient generation. Copyright (c) 2014, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */
require(['jquery', 
         'bootstrap', 
         '../../statistics/Binomial'], 
         function($,                       // jQuery
                  bootstrapRef,            // Bootstrap
                  BinomialModule           // Binomial
                  )
{
  $( document ).ready( onPageLoaded );
  
  function onPageLoaded()
  {
    var binomialRef = new BinomialModule();
    var __binomial  = new binomialRef.Binomial();

    // start with any row
    var myRow = __binomial.getRow(9);
    console.log( "row 9: " + myRow );

    //move this row up and down to test forward/backward recurse
    myRow = __binomial.getRow(4);
    console.log( "row 4: " + myRow );

    myRow = __binomial.getRow(2);
    console.log( "row 2: " + myRow );
    
    myRow = __binomial.getRow(10);
    console.log( "row 10: " + myRow );
    
    var n = 5;
    var k = 3;
    console.log( "coef("+n+" "+k+"): " + __binomial.coef(n,k) );
    
    var n = 9;
    var k = 4;
    console.log( "coef("+n+" "+k+"): " + __binomial.coef(n,k) );
    
    var n = 2;
    var k = 2;
    console.log( "coef("+n+" "+k+"): " + __binomial.coef(n,k) );
  };
  
});