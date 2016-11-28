/*
 * Supporting script for testing basic bootstrap aggregation of numerical samples. Copyright (c) 2014, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */
require(['jquery', 
         'bootstrap', 
         '../../statistics/DataStats',
         '../../statistics/dataanalysis/Bagging'], 
         function($,                       // jQuery
                  bootstrapRef,            // Bootstrap
                  StatsModule,             // Basic data statistics
                  BaggingModule            // Bagging
                  )
{
  $( document ).ready( onPageLoaded );
  
  function onPageLoaded()
  {
    var StatsRef   = new StatsModule();
    var __stats    = new StatsRef.DataStats();
    
    var BaggingRef = new BaggingModule();
    var __bagging  = new BaggingRef.Bagging();
    
    // two obvious outliers
    var data = [3.2, 0.0, 1.57, 12.62, 0.25, 2.157, 3.1, 6.5, 4.125, 3.0, 3.5, 10.67 ];
    
    // some basic stats on the original sample set
    __stats.set_data(data);
    var mean = __stats.get_mean();
    var std  = __stats.get_std();
    var sets = 5;
    var bags = __bagging.get1DSamplesWithReplacement( data, sets );
    
    console.log( "Original data set, mean, std: ", mean, std );
    
    var i;
    var sum = 0.0
    for( i=0; i<sets; ++i )
    {
      console.log( "Sample: ", i, " - ", bags[i] );
      __stats.set_data( bags[i] );
      
      mean = __stats.get_mean();
      std  = __stats.get_std();
      sum += mean
      
      console.log( "  mean, std: ", mean, std );
      console.log( "  corr. w/original data", __bagging.correlate(data, bags[i]) );
    }
    
    sum /= sets;
    
    // if you believe that one or two of those larger values are true outliers, then we would expect the mean of the reliable data to be lower
    // than the original sample and a smaller variance from many of the bags.
    console.log( "average of means: ", sum );
    console.log( " " );
    console.log( "sub-bagging" );
    
    // sub-bag at a reduced number of samples, say 8 - faster, but can produce worse results on small sample sizes, especially with m close to n as in this case.
    sets       = 4;
    var subSet = 8;
    bags       = __bagging.get1DSamplesWithoutReplacement( data, subSet, sets );
    
    sum = 0.0
    for( i=0; i<sets; ++i )
    {
      console.log( "Sample: ", i, " - ", bags[i] );
      __stats.set_data( bags[i] );
      
      mean = __stats.get_mean();
      std  = __stats.get_std();
      sum += mean
      
      console.log( "  mean, std: ", mean, std );
    }
    
    sum /= sets;
    
    console.log( "average of means: ", sum );
    
    // 2D example
    var x = [ -6.5 , -6.1, -5.5, -5.0, -4.5, -4.1, -3.0, -2.4, -1.1, -0.5,  0.0, 1.2, 2.1, 2.3, 3.0, 3.8, 4.7, 5.9, 6.1, 6.4, 7.0, 7.5, 8.0, 8.2, 8.5, 9.7 ];
    var y = [ -0.25, -3.3, -5.7,  0.1, -1.0, -2.7,  0.1,  0.5, -2.7,  1.0, -0.5, 1.1, 1.8, 2.1, 3.1, 4.0, 4.9, 5.7, 8.5, 5.9, 8.1, 8.9, 7.5, 7.7, 5.1, 4.25];
    
    console.log( "" );
    console.log( "2D Bagging" );
    console.log( "" );
    
    bags = __bagging.get2DSamplesWithReplacement( x, y, 5 );
    
    console.log( bags );
    
    console.log( "" );
    console.log( "sub-bag with m = n/2" );
    
    bags = __bagging.get2DSamplesWithoutReplacement( x, y, 13, 5 );
    
    console.log( bags );
  };
  
});