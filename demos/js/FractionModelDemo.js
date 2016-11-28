/*
 * Supporting script for clock time. Copyright (c) 2014, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */
require(['jquery', 
         'bootstrap', 
         '../../utils/MathUtils',
         '../../abstractModels/FractionModel'], 
         function($,                       // jQuery
                  bootstrapRef,            // Bootstrap
                  MathUtilsModule,         // MathUtils
                  FractionModelModule      // FractionModel
                  )
{
  $( document ).ready( onPageLoaded );
  
  function onPageLoaded()
  {
    var mathUtilsRef = new MathUtilsModule();
    var fractionRef  = new FractionModelModule();
    var __mathUtils  = new mathUtilsRef.MathUtils();
  
    __myModel = new fractionRef.FractionModel();
    console.log( "default test (should be 0/1), returned: ", __myModel.toString() );
    
    __myModel.set_numerator(0);
    __myModel.set_denominator(0);
    console.log( "zero denom test (should be 0/1), returned: ", __myModel.toString() );
    
    __myModel.set_numerator(1);
    __myModel.set_denominator(4);
    console.log( "value test (1/4 = 0.25), returned: ", __myModel.get_value() );
    
    __myModel.update(0, 2, 3);
    console.log( "update (value = 2/3), returned: ", __myModel.get_value() );
    
    __myModel.update(0, 2, 4);
    __myModel.set_isReduced(true);
    console.log( "switching to reduced form, update(0, 2, 4)", __myModel.toString() );
    
    __myModel.update(1, 2, 4);
    __myModel.set_isMixed(true);
    console.log( "mixed and reduced, update(1, 2, 4), returned: ", __myModel.toString() );
    
    __myModel.set_isMixed(false);
    console.log( "not mixed and reduced(1, 2, 4), returned: ", __myModel.toString() );
    
    __myModel.set_isReduced(false);
    console.log( "isReduced = false, returned: ", __myModel.toString() );
    
    __myModel.update(0, 3, 9);
    console.log( "after update(0, 3, 9) = 3/9, returned: ", __myModel.toString() );
    
    __myModel.set_isReduced(true);
    console.log( "(0, 3, 9) = 1/3 reduced, returned: ", __myModel.toString() );
    
    __myModel.set_isMixed(true);
    console.log( "is mixed & reduced (0, 3, 9), whole:", __myModel.get_whole(), "numerator:", __myModel.get_numerator(), "denominator:", __myModel.get_denominator() );
    
    __myModel.update(0, 11, 9);
    console.log( "update to (0, 11, 9) = 1 2/9, whole:", __myModel.get_whole(), "numerator:", __myModel.get_numerator(), "denominator:", __myModel.get_denominator() );
    
    __myModel.update(11/9);
    console.log( "testing typo - update(11/9) = w(1), n(0), d(1), whole:", __myModel.get_whole(), "numerator:", __myModel.get_numerator(), "denominator:", __myModel.get_denominator() );
    
    __myModel.set_isMixed(false);
    __myModel.update(29/9, 4);
    console.log( "mixed false, testing typo - update(29/9, 4) = w(0), n(7), d(1), whole:", __myModel.get_whole(), "numerator:", __myModel.get_numerator(), "denominator:", __myModel.get_denominator() );
    
    console.log( "gcd(42,56) = 14, result:", __mathUtils.gcd(42,56) );
    console.log( "gcd(-42,56) = ", __mathUtils.gcd(-42,56) ); 
    console.log( "gcd(0,1) = ", __mathUtils.gcd(0,1) ); 
    console.log( "gcd(0,0) = ", __mathUtils.gcd(0,0) ); 
    
    console.log( "lcm(3,9) = 9, result:", __mathUtils.lcm(3,9) ); 
    console.log( "lcm(9,21) = 63, result:", __mathUtils.lcm(9,21) ); 
    console.log( "lcm(5,8) = 40, result:", __mathUtils.lcm(5,8) ); 
    console.log( "lcm(4,-2) = ", __mathUtils.lcm(4,-2) );
    console.log( "lcm(0, 0) = ", __mathUtils.lcm(0, 0) );
    
    // current model is 1/5
    __myModel.set_isReduced(false);
    __myModel.update(0, 1, 5);
    
    // new fraction is 1/6
    var frac = new fractionRef.FractionModel();
    frac.create(0, 1, 6);
    console.log( "LCD of 1/5 and 1/6 is 30, returned", __myModel.leastCommonDenominator(frac) );
    
    // change internal model to 3/8 and frac to 5/12
    __myModel.update(0, 3, 8);
    frac.update(0, 5, 12);
    console.log( "LCD of 3/8 and 5/12 is 24, returned", __myModel.leastCommonDenominator(frac) );
    
    // test typos/defaults
    __myModel.update(0, 0, 0);
    frac.update(0, 0, 0);
    console.log( "LCD (all update args. are zero), should be 1:", __myModel.leastCommonDenominator(frac) );
    
     // modest primes
    __myModel.update( 0, 1, 3 );
    frac.update( 0, 4, 9 );
    console.log( "LCD of 1/3 & 4/9 is 9, returned:", __myModel.leastCommonDenominator(frac) );
    
    // modest primes
    __myModel.update( 0, 100, 5741 );
    frac.update( 2, 5, 7907 );
    console.log( "lcm 100/5741 & 2 5/7907 is 45394087, returned:", __myModel.leastCommonDenominator(frac) );
    
    // reset to default state
    __myModel.set_isMixed(false);
    __myModel.set_isReduced(false);
    console.log( " " );
    console.log( "reduced and mixed now false, fraction updated to 1 1/2" );
    console.log( " " );
    
    // reset current model to 7/4, add 1/4 and reduce
    __myModel.update(0, 7, 4);
    console.log( "isMixed true, new model is 7/4" );
    console.log( " " );
    
    frac.update(0, 1, 4);
    var result = __myModel.add(frac);
    console.log( "7/4 + 1/4 = 8/4, returned ", result.toString() );
    
    result.set_isMixed(true);
    console.log( "result, isMixed = true returned: ", result.toString() );
    
    __myModel.set_isMixed(false);
    frac.set_isMixed(false);
    __myModel.update(0, 1, 2);
    
    frac.update(0, 3, 8 );
    result = __myModel.add(frac);
    console.log( "1/2 + 3/8 = 7/8, returned", result.toString() ); 
    
    __myModel.update(0, 5, 12);
    frac.update(0, 1, 2 );
    result = __myModel.add(frac);
    console.log( "5/12 + 1/2 = 11/12, returned", result.toString() ); 
    
    __myModel.update(0, 5, 6);
    frac.update(0, 8, 9 );
    result = __myModel.add(frac);
    console.log( "5/6 + 8/9 = 31/18, returned", result.toString() ); 
    
    result.set_isMixed(true);
    console.log( "as mixed, 1 13/18, returned", result.toString() );
    
    __myModel.update( 2, 2, 3 );
    frac.update( 3, 1, 9 );
    result = __myModel.add(frac);
    console.log( "2 2/3 + 3 1/9 = 5 7/9, (isMixed false by default), returned", result.toString() ); 
    
    result.set_isMixed(true);
    console.log( "isMixed = true returned", result.toString() );
    
    __myModel.update( 0, 3, 4 );
    frac.update( 0, 1, 4 );
    result = __myModel.subtract(frac);
    console.log( "3/4 - 1/4 = 1/2, (reduced state false by default), returned", result.toString(), "state", result.get_isReduced() ); 
    
    // clone back to __myModel
    __myModel = null;
    __myModel = result.clone();
    console.log( "cloned", __myModel.toString(), "state", __myModel.get_isReduced() );
    
    console.log( " " );
    console.log( "setting mixed and reduced properties to true on both fractions" );
    console.log( " " );
    
    __myModel.set_isMixed(true);
    __myModel.set_isReduced(true);
    
    frac.set_isMixed(true);
    frac.set_isReduced(true);
    
    __myModel.update( 2, 2, 3 );
    frac.update( 3, 1, 9 );
    result = __myModel.add(frac);
    console.log( "2 2/3 + 3 1/9 = 5 7/9 (52/9), returned", result.toString() ); 
    
    __myModel.update(0, 1, 2);
    frac.update( 0, 11, 7 );
    result = __myModel.add(frac);
    console.log( "0 1/2 + 0 11/7 = 29/14 = 2 1/14 reduced, returned", result.toString() ); 
    
    console.log( " " );
    console.log( "setting mixed and reduced properties to false on both fractions" );
    console.log( " " );
    
    __myModel.set_isMixed(false);
    __myModel.set_isReduced(false);
    frac.set_isMixed(false);
    frac.set_isReduced(false);
    
    __myModel.update( 3, 1, 9 );
    frac.update( 2, 2, 3 );
    result = __myModel.subtract(frac);
    console.log( "3 1/9 - 2 2/3 = 4/9, returned", result.toString() ); 
    
    console.log( " " );
    console.log( "setting mixed and reduced properties to true on both fractions" );
    console.log( " " );
    
    __myModel.set_isMixed(true);
    __myModel.set_isReduced(true);
    frac.set_isMixed(true);
    frac.set_isReduced(true);
    
    result = __myModel.subtract(frac);
    console.log( "3 1/9 - 2 2/3 = 4/9, returned", result.toString() ); 
    
    console.log( " " );
    console.log( "setting mixed and reduced properties to false on both fractions" );
    console.log( " " );
    
    __myModel.set_isMixed(false);
    __myModel.set_isReduced(false);
    frac.set_isMixed(false);
    frac.set_isReduced(false);
    
    __myModel.update(0, 1, 2);
    frac.update(0, 2, 5);
    result = __myModel.multiply(frac);
    console.log( "1/2 * 2/5 = 2/10, returned", result.toString() ); 
    
    __myModel.update(0, 0, 2);
    frac.update(0, 3, 7);
    result = __myModel.multiply(frac);
    console.log( "0/2 * 3/7 = 0/14, returned", result.toString() ); 
    
    __myModel.update(0, 1, 2);
    frac.update(0, 1, 4);
    result = __myModel.divide(frac);
    console.log( "1/2  /  1/4 = 4/2, returned", result.toString() ); 
    
    result.set_isMixed(true);
    console.log( "1/2  /  1/4 = 2 (isMixed = true), returned", result.toString() ); 
    
    __myModel.update(3, 1, 2);
    frac.update(2, 1, 4);
    result = __myModel.divide(frac);
    console.log( "3 1/2  /  2 1/4 = 28/18, returned", result.toString() ); 
    
    console.log( "setting mixed and reduced properties to true for both fractions" );
    __myModel.set_isMixed(true);
    __myModel.set_isReduced(true);
    frac.set_isMixed(true);
    frac.set_isReduced(true);
    
    result = __myModel.divide(frac);
    result.__reduce();
    console.log( "3 1/2  /  2 1/4 = 14/9 (manually reduced), returned", result.toString() ); 
    
    console.log( "setting mixed and reduced properties to false for both fractions" );
    __myModel.set_isMixed(false);
    __myModel.set_isReduced(false);
    frac.set_isMixed(false);
    frac.set_isReduced(false);
    
    __myModel.update(2, 2, 3);
    frac.update(3, 1, 9);
    __myModel.addTo(frac);
    console.log( "(addTo) 2 2/3 + 3 1/9 = 52/9, returned", __myModel.toString() ); 
    
    __myModel.set_isMixed(true);
    __myModel.update(0, 1, 2);
    frac.update(0, 11, 7);
    __myModel.addTo(frac);
    console.log( "(addTo, isMixed) 0 1/2 + 0 11/7 = 2 1/14, returned", __myModel.toString() ); 
    
    frac.set_isMixed(true);
    __myModel.update(3, 1, 9);
    frac.update(2, 2, 3);
    __myModel.subtractFrom(frac);
    console.log( "(subtractFrom) 3 1/9 - 2 2/3 = 4/9, returned", __myModel.toString() ); 
    
    frac.set_isMixed(true);
    __myModel.update(0, 0, 2);
    frac.update(0, 3, 7);
    __myModel.multiplyBy(frac);
    console.log( "(multiplyBy) 0/2 * 3/7 = 0/14, returned", __myModel.toString() ); 
    
    __myModel.set_isMixed(false);
    __myModel.update(0, 1, 2);
    frac.update(0, 1, 4);
    __myModel.divideInto(frac);
    console.log( "(divideInto isMixed false) 1/2 <div> 1/4 = 4/2, returned", __myModel.toString() ); 
    
    __myModel.set_isMixed(true);
    console.log( "(divideInto isMixed = true) 1/2 <div> 1/4 = 2, returned", __myModel.toString() ); 
    
    // negative tests
    __myModel.set_isMixed(false);
    frac.set_isMixed(false);
    __myModel.update(2, 2, 3);
    frac.update(3, 1, 9);
    __myModel.subtractFrom(frac);
    console.log( "(subtractFrom) 2 2/3 - 3 1/9 = -4/9, returned", __myModel.toString() ); 
    
    __myModel.set_isMixed(false);
    frac.set_isMixed(false);
    __myModel.update(2, 1, 2);
    frac.update(4, 2, 3);
    __myModel.subtractFrom(frac);
    console.log( "(subtractFrom) 2 1/2 - 4 2/3 = -13/6, returned", __myModel.toString() ); 
    
    __myModel.set_isMixed(true);
    __myModel.update(2, 1, 2);
    frac.update(4, 2, 3);
    __myModel.subtractFrom(frac);
    console.log( "(subtractFrom - isMixed true) 2 1/2 - 4 2/3 = -2 1/6, returned", __myModel.toString() ); 
    
    frac.set_isMixed(true);
    frac.update(5, 0, 0);
    __myModel.addTo(frac);
    console.log( "(addTo - both mixed) -2 1/6 + 5 = 2 5/6, returned", __myModel.toString() );  
    
    // standard negative display
    __myModel.set_isReduced(false);
    __myModel.update(-1, 2, 3)
    console.log( "-1 2/3 (isMixed true) shows", __myModel.toString() );
    
    __myModel.set_isMixed(false);
    console.log( "-1 2/3 (isMixed false) should be -5/3, returned", __myModel.toString() );
    
    __myModel.set_numerator(11);
    console.log( "set numerator to 11, should get 11/3, returned", __myModel.toString() );
    
    __myModel.set_whole(-2);
    console.log( "set whole to -2 (-6/3), should get 5/3, returned", __myModel.toString() );
    
    frac.set_isMixed(false);
    frac.update(0, -8, 3);
    result = __myModel.add(frac);
    console.log( "5/3 - 8/3, returned (isMixed false, -3/3), returned:", result.toString() );
    
    result.set_isMixed(true);
    console.log( "in mixed form [-1 0/3], returned:", result.toString() );
  };
  
});