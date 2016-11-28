/*
 * Supporting script for testing poisson distribution. Copyright (c) 2014, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */
require(['jquery', 
         'bootstrap', 
         '../../statistics/Poisson'], 
         function($,                       // jQuery
                  bootstrapRef,            // Bootstrap
                  PoissonModule            // Poisson
                  )
{
  $( document ).ready( onPageLoaded );
  
  function onPageLoaded()
  {
    var poissonRef = new PoissonModule();
    var __poisson  = new poissonRef.Poisson();

    // set lambda to zero - should remain at 1.0
    __poisson.set_lambda(0);
    console.log( "current l is 1, returned: ", __poisson.get_lambda() );
    
    // now, some simple stuff
    
    console.log( "P(X = 3) ~ 0.06131324:", __poisson.prob(3) );
    
    // run the event count up, p goes to zero
    console.log( "P(X = 5 ~ 0.003065662", __poisson.prob(5) );
    console.log( "P(X = 10 ~ 1.013777E-07", __poisson.prob(10) );
    
    // smaller lambda
    __poisson.set_lambda(0.2);
    
    console.log( "" );
    console.log( "lambda = 0.2" );
    console.log( "" );
    
    console.log( "P(X = 3) ~ 0.00109164:", __poisson.prob(3) );
  };
  
});