/*
 * Supporting script for testing t-distribution. Copyright (c) 2014, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */
require(['jquery', 
         'bootstrap', 
         '../../statistics/TDist'], 
         function($,                       // jQuery
                  bootstrapRef,            // Bootstrap
                  TDistModule              // TDist
                  )
{
  $( document ).ready( onPageLoaded );
  
  function onPageLoaded()
  {
    var tdistRef = new TDistModule();
    var __tdist  = new tdistRef.TDist();

    // sample count 100, u = 50, s = 0.5
    __tdist.set_n(100);
    __tdist.set_population_mean(50);
    __tdist.set_sigma(0.5);
    
    console.log( "P(x <= 50) = 0.5:", __tdist.cdf(50) );
    
    __tdist.set_n(8);
    __tdist.set_population_mean(2);
    __tdist.set_sigma(0.2);
    
    console.log( "P(x <= 2.5) ~ 0.98:", __tdist.cdf(2.5) );
  };
  
});