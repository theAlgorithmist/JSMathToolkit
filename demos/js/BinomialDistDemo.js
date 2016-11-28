/*
 * Supporting script for testing binomial distribution. Copyright (c) 2014, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */
require(['jquery', 
         'bootstrap', 
         '../../statistics/Binomial'], 
         function($,                       // jQuery
                  bootstrapRef,            // Bootstrap
                  BiomialModule            // Binomial
                  )
{
  $( document ).ready( onPageLoaded );
  
  function onPageLoaded()
  {
    var binomialRef = new BiomialModule();
    var __binomial  = new binomialRef.Binomial();

    // start with a modest number of samples and set the probability to 0.5
    __binomial.set_n(10);
    __binomial.set_p(0.5)
    console.log( "current n & p: ", __binomial.get_n(), __binomial.get_p() );
    
    console.log( "P(X = 3) ~ 0.1171875:", __binomial.prob(3) );
    
    // outlier tests
    console.log( "" );
    console.log( "testing outliers" );
    console.log( "" );
    
    __binomial.set_n(-1);
    console.log( "attempt to set negative sample, should remain at 10: ", __binomial.get_n() );
    
    __binomial.set_p(0);
    console.log( "set p to zero (allowed): ", __binomial.get_p() );
    
    console.log( "P(X = 0) = 1: ", __binomial.prob(0) );
    console.log( "P(X = 1) = 0: ", __binomial.prob(1) );
    
    console.log( "" );
    console.log( "Set p = 1" );
    console.log( "" );
    
    __binomial.set_p(1.0);
    console.log( "P(X = 10) = 1: ", __binomial.prob(10) );
    console.log( "P(X = 1)  = 0: ", __binomial.prob(1) );
    
    console.log( "" );
    console.log( "n = 100, p=0.25" );
    console.log( "" );
    
    __binomial.set_n(100);
    __binomial.set_p(.25);
    
    console.log( "P(X = 20) ~ 0.04930064:", __binomial.prob(20) );
    
    console.log( "" );
    console.log( "n=10, p=0.2" );
    console.log( "" );
    
    __binomial.set_n(10);
    __binomial.set_p(0.2);
    
    console.log( "CDF, P(X<2) ~ 0.3758096: ", __binomial.cdf(2) );
  };
  
});