/*
 * Supporting script for testing normal distribution. Copyright (c) 2014, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */
require(['jquery', 
         'bootstrap', 
         '../../statistics/Normal'], 
         function($,                       // jQuery
                  bootstrapRef,            // Bootstrap
                  NormalModule             // Normal
                  )
{
  $( document ).ready( onPageLoaded );
  
  function onPageLoaded()
  {
    var normalRef = new NormalModule();
    var __normal  = new normalRef.Normal();

    // start with the standard normal and N(0) = 0.5
    var prob = __normal.normaldist(0);
    console.log( "N(0) = 0.5 : " + prob );
    
    prob = __normal.normaldist(0.5);
    console.log( "N(0.5) = 0.69146 : " + prob );
    
    prob = __normal.normaldist(-0.5);
    console.log( "N(-0.5) = 0.30854 : " + prob );
    
    prob = __normal.normaldist(1.0);
    console.log( "N(1) = 0.84134 : " + prob );
    
    prob = __normal.normaldist(-1.0);
    console.log( "N(-1) = 0.15866 : " + prob );
    
    prob = __normal.normaldist(2.0);
    console.log( "N(2) = 0.97725 : " + prob );
    
    prob = __normal.normaldist(-2.0);
    console.log( "N(-2) = 0.02275 : " + prob );
    
    prob = __normal.normaldist(4.0);
    console.log( "N(4) = 0.99997: " + prob );
    
    prob = __normal.normaldist(-4.0);
    console.log( "N(-4) = 0.00003 : " + prob );
    
    console.log( "" );
    console.log( "set mean to 2.0 and std. dev. to 1.5" );
    console.log( "" );
    
    __normal.set_mean(2.0);
    __normal.set_std(1.5);
    prob = __normal.normaldist(0);
    console.log( "N(0) = 0.09121 : " + prob );
    
    console.log( "" );
    
    // inverse std. normal
    __normal.set_mean(0);
    __normal.set_std(1);
    
    console.log( "N^-1(0.5) should be 0: ", __normal.invnormaldist(0.5) );
    
    var inv = __normal.invnormaldist(0.99997);
    console.log( "N^1(0.99997) is approx 4: " + inv );
    
    inv = __normal.invnormaldist(0.8);
    console.log( "N^1(0.8) is approx 0.842: " + inv );
    
    inv = __normal.invnormaldist(0.84134);
    console.log( "N^1(0.84134) is approx 1: " + inv );
    
    inv = __normal.invnormaldist(0.02275);
    console.log( "N^1(0.02275) is approx -2: " + inv );
    
    inv = __normal.invnormaldist(0.975);
    console.log( "N^1(0.975) is approx 1.96: " + inv );
    
    
    console.log( "" );
    console.log( "prediction intervals (n=1,2,3), p = (.68, .95, .997)" );
    console.log( "" );
    
    console.log( "n = 0.5, p: ", __normal.predictionInterval(0.5) );
    console.log( "n = 1, p: ", __normal.predictionInterval(1) );
    console.log( "n = 2, p: ", __normal.predictionInterval(2) );
    console.log( "n = 3, p: ", __normal.predictionInterval(3) );
    
    console.log( "" ); 
    
    var n = __normal.inversePredictionInterval(0.6826895);
    console.log("Inv. PI(0.6826895) approx 1.0, i.e. 1-sigma: ", n );
    
    n = __normal.inversePredictionInterval(0.9544997);
    console.log("Inv. PI(0.9544997) approx 2-sigma: ", n );
    
    n = __normal.inversePredictionInterval(0.9973002);
    console.log("Inv. PI(0.9973002) approx 3-sigma: ", n );
    
    n = __normal.inversePredictionInterval(0.9999366);
    console.log("Inv. PI(0.9999366) approx 4-sigma: ", n );
    
    n = __normal.inversePredictionInterval(0.9999994);
    console.log("Inv. PI(0.9999994) approx 5-sigma: ", n );
  };
  
});