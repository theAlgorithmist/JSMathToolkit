/*
 * Supporting script for DataStats test cases. Copyright (c) 2014, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */
require(['jquery', 
         'bootstrap', 
         '../../statistics/DataStats'], 
         function($,                       // jQuery
                  bootstrapRef,            // Bootstrap
                  DataStatsModule          // DataStats
                  )
{
  $( document ).ready( onPageLoaded );
  
  function onPageLoaded()
  {
    var dataStatsRef = new DataStatsModule();
    var __stats      = new dataStatsRef.DataStats();
    
    // test mean, median, mode with simple data such as test scores
    var __data = [60, 64, 70, 70, 70, 75, 80, 90, 95, 95, 100];
    __stats.set_data(__data);
    
    var mean = __stats.get_mean();
    console.log( "mean test 1, should be 79: ", mean );
    
    var median = __stats.get_median();
    console.log( "median should be 75: ", median );
    
    var mode = __stats.get_mode();
    console.log( "mode should be 70: ", mode );
    
    // a little more data
    __data = [17, 12, 14, 17, 13, 16, 18, 20, 13, 12,
              12, 17, 16, 15, 14, 12, 12, 13, 17, 14,
              15, 12, 15, 16, 12, 18, 20, 19, 12, 15,
              18, 14, 16, 17, 15, 19, 12, 13, 12, 15
             ];
    __stats.set_data(__data);
    
    mean = __stats.get_mean();
    console.log( "mean test 2, should be 14.975: ", mean );
    
    median = __stats.get_median();
    console.log( "median should be 15: ", median );
    
    mode = __stats.get_mode();
    console.log( "mode should be 12: ", mode );
    
    console.log( "range is 12 to 20: ", __stats.get_min(), __stats.get_max() );
    
    var std = __stats.get_std(); 
    console.log( "std. dev should be: 2.496", std );
    
    // and now, for something a bit more interesting
    __data = 
    [
-0.17153201811526,
-0.24688253248949,
0.11338441630439,
0.21688342552633,
-0.011673274048979,
-0.02003736435437,
-0.34336588850306,
0.078405646177621,
-0.065555801648822,
0.028825789263126,
0.042177644981986,
-0.50528595024946,
-0.4273793332064,
0.3017619807293,
0.040940131180399,
0.12162445946489,
0.046924000912204,
-0.31441861873484,
-0.24797010811493,
-0.31245115727514,
0.36179798762062,
-0.46964621705612,
0.1159236116096,
0.44229719468743,
0.17553670198059,
-0.049653531282555,
0.035737645461893,
-0.52367570682749,
0.12014526093805,
-0.2060419038672,
-0.12789255250514,
-0.19007839020849,
-0.17402649310177,
0.12573206620924,
0.2646133618755,
0.41670972482352,
0.030866480670971,
0.07031579787869,
-0.085545940939841,
0.34396444357458,
-0.34488388941556,
0.15597328456662,
-0.39937390581988,
0.12960169981417,
0.26218698256904,
-0.1620734969907,
-0.028376561029554,
-0.080399756342166,
0.14758867251726,
-0.23720637932878,
-0.27695138789864,
0.05257578120839,
0.21722344584028,
0.19122661193002,
-0.20626312001628,
-0.059435335753833,
-0.1995971405858,
-0.23267982758906,
0.33527000452094,
0.043882296754041,
-0.07738562758975,
0.5515265183042,
0.34121467746293,
0.011521247389367,
0.17429773253761,
-0.22635967501679,
0.15713909187964,
-0.1787810576828,
-0.34801215785823,
-0.082164064211855,
0.64074819328462,
-0.044302007836004,
-0.38284231659945,
-0.41366498500892,
-0.15964965729918,
0.39248247734553,
-0.12031750238867,
-0.16930717524153,
-0.40060591948563,
0.0068312326939647,
-0.1898421274294,
0.44393250846458,
0.029613400394471,
-0.22581182588274,
0.02045533910155,
0.11398918107627,
-0.20562256981737,
0.11476536764274,
-0.32378382765313,
-0.09196424943184,
0.17281588794572,
-0.35251113939319,
0.073961983637722,
0.11265707197549,
-0.317176214879,
0.091016285581571,
-0.14930773416087,
0.047940214497312,
-0.13754460419439,
-0.078689419991652
    ]
    
    __stats.set_data(__data);
    mean = __stats.get_mean();
    std  = __stats.get_std(); 
    console.log( "mean and std. dev should be approx -0.0287, 0.2447: ", mean, std );
    
    __data.length = 0;
    __stats.set_data(__data);
    
    console.log( "basic stats for zero-length data - should remain unchanged: ", __stats.get_min(), __stats.get_max(), __stats.get_mean(), __stats.get_median(), __stats.get_mode() );
    
    // geometric mean test
    __data = [10, 51.2, 8];
    __stats.set_data(__data);
    
    mean = __stats.get_geo_mean();
    console.log( "Geometric mean should be: 16", mean );
    
    __data = [1, 3, 9, 27, 81];
    __stats.set_data(__data);
    
    mean = __stats.get_geo_mean();
    console.log( "Geometric mean should be: 9", mean );
    
    __data = [100, 110, 90, 120];
    __stats.set_data(__data);
    
    mean = __stats.get_harmonic_mean();
    console.log( "Harmonic mean should be: 103.8", mean );
    
    __data = [13.2, 14.2, 14.8, 15.2, 16.1];
    __stats.set_data(__data);
    
    mean = __stats.get_harmonic_mean();
    console.log( "Harmonic mean should be: 14.63", mean );
    
    // skewness and kurtosis basic tests
    __data = 
    [ 61, 61, 61, 61, 61, 
      64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64,
      67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67,   
      70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70,  
      73, 73, 73, 73, 73, 73, 73, 73
    ];
    __stats.set_data(__data);
    
    var skew = __stats.get_skewness();
    console.log( "Skewness is approx -.108: ", skew );
    
    __data = [2, 5, -1, 3, 4, 5, 0, 2];
    __stats.set_data(__data);
    
    skew = __stats.get_skewness();
    console.log( "Skewness is approx -.35: ", skew );
    
    var kurt = __stats.get_kurtosis();
    console.log( "Kurtosis is approx -0.94: ", kurt );
  };
  
});