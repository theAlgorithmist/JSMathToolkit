/*
 * Supporting script for testing binomial coefficient generation. Copyright (c) 2014, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */
require(['jquery', 
         'bootstrap', 
         '../../math/PrimeFactorization'], 
         function($,                       // jQuery
                  bootstrapRef,            // Bootstrap
                  PrimeModule              // PrimeFactorization
                  )
{
  $( document ).ready( onPageLoaded );
  
  function onPageLoaded()
  {
    var primeRef = new PrimeModule();
    var __prime  = new primeRef.PrimeFactorization();

    var factors = __prime.factorize(12);
    console.log( "PF of 120 is 2, 2, 3 - returned: ", factors );
    
    factors = __prime.factorize(120);
    console.log( "PF of 120 is 2, 2, 2, 3, 5 - returned: ", factors );
    
    factors = __prime.factorize(330);
    console.log( "PF of 330 is 2, 3, 5, 11 - returned: ", factors );
    
    factors = __prime.factorize(1017);
    console.log( "PF of 1017 is 3, 3, 113 - returned: ", factors );
    
    factors = __prime.factorize(4000);
    console.log( "PF of 120 is 2, 2, 2, 2, 2, 5, 5, 5 - returned: ", factors );
    
    factors = __prime.factorize(-1);
    console.log( "Test PF -1, returned: ", factors );
    
    factors = __prime.factorize(0);
    console.log( "Test PF 0 - returned: ", factors );
  };
  
});