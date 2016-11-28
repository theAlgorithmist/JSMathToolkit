/*
 * Supporting script for testing quartile and quantile computations. Copyright (c) 2014, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */
require(['jquery', 
         'bootstrap', 
         '../../statistics/DataStats'], 
         function($,                       // jQuery
                  bootstrapRef,            // Bootstrap
                  StatsModule              // Basic data stats
                  )
{
  $( document ).ready( onPageLoaded );
  
  function onPageLoaded()
  {
    var StatsRef   = new StatsModule();
    var __stats    = new StatsRef.DataStats();
    
    // odd number of samples
    var data = [6, 7, 15, 36, 39, 40, 41, 42, 43, 47, 49];
    __stats.set_data(data);
    
    var numbers = __stats.get_fiveNumbers();
    console.log( "5-numbers: [6, 25.5, 40, 42.5, 49]", numbers );
    
    // even number of samples
    data = [15, 7, 40, 41, 39, 36];
    __stats.set_data(data);
    numbers = __stats.get_fiveNumbers();
    
    console.log( "5-numbers: [7, 15, 37.5, 40, 41]", numbers );
    
    // quantiles
    data = [3.7, 2.7, 3.3, 1.3, 2.2, 3.1];
    __stats.set_data(data);
    
    // this quartile may be different from the five-number summary since quantiles are computed with straight linear interpolation
    var q = __stats.get_quantile(0.25);
    console.log( "quartile (with min/max) is 1.3, 2.325, 2.9, 3.25, 3.7 ", q );
    
    q = __stats.get_quantile(0.2);
    console.log( "quintile: 1.3, 2.2, 2.7, 3.1, 3.3, 3.7", q );
    
    data = [3.7, 2.7, 3.3, 1.3, 2.2, 3.1];
    __stats.set_data(data);
    
    q = __stats.get_quantile(0.1);
    console.log( "decile: 1.3, 1.75, 2.2, 2.45, 2.7, 2.9, 3.1, 3.2, 3.3, 3.5, 3.7", q );
  };
  
});