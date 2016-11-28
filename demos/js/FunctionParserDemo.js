/*
 * Supporting script for testing binomial distribution. Copyright (c) 2014, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */
require(['jquery', 
         'bootstrap', 
         '../../functionGraphing/FunctionParser'], 
         function($,                       // jQuery
                  bootstrapRef,            // Bootstrap
                  FunctionParserModule     // FunctionParser
                  )
{
  $( document ).ready( onPageLoaded );
  
  function onPageLoaded()
  {
    var fpRef = new FunctionParserModule();
    
    // start with a single, independent variable, 'x'
    var __parser  = new fpRef.FunctionParser("x");
    
    // test something simple, like x+1
    var success = __parser.parse( "x+1" );
    var eval = __parser.evaluate( [1.0] );
    
    console.log( "x + 1 (x=1) should be 2.0, returned: ", eval );

    // try a simple polynomial, but first illustrate that you can not have implicit multiplies
    success = __parser.parse( "x^2 + 2x - 3" );
    console.log( "implicit multiply should parse false: ", success );
    
    // now, the way it should be written
    success = __parser.parse( "x^2 + 2*x - 3" );
   
    var f = function(x) { return x*x + 2*x - 3; }
    
    console.log( "" );
    console.log( "  f(x) = x^2 + 2*x - 3" );
    console.log( "compare f(0): ", f(0.0), __parser.evaluate([0.0]) );
    console.log( "compare f(-1): ", f(-1.0), __parser.evaluate([-1.0]) );
    console.log( "compare f(1): ", f(1.0), __parser.evaluate([1.0]) );
    console.log( "compare f(-2): ", f(-2.0), __parser.evaluate([-2.0]) );
    console.log( "compare f(2): ", f(2.0), __parser.evaluate([2.0]) );
    
    // clear the parser and add a new function
    __parser.clear();
    __parser.set_variables( ["x"] );
   
    success = __parser.parse( "2*e^(x/2)" );
    f = function(x) { return 2*Math.exp(0.5*x); }
    
    console.log( "" );
    console.log( "  f(x) = 2*e^(x/2)" );
    console.log( "compare f(0): ", f(0.0), __parser.evaluate([0.0]) );
    console.log( "compare f(1): ", f(1.0), __parser.evaluate([1.0]) );
    console.log( "compare f(2): ", f(2.0), __parser.evaluate([2.0]) );
    console.log( "compare f(3): ", f(3.0), __parser.evaluate([3.0]) );
    console.log( "compare f(4): ", f(4.0), __parser.evaluate([4.0]) );
    
    // clear again and do a function of two variables
    __parser.clear();
    __parser.set_variables( ["x", "y"] );

    success = __parser.parse( "-3*sin(x/3) + 2*cos(y) + x^2 + 3*y" );
  
    f = function(x, y) { return -3*Math.sin(x/3) + 2*Math.cos(y) + x*x + 3.0*y; }

    console.log( " - parse: ", success );
    console.log( "  f(x) = -3*sin(x/3) + 2*cos(y) + x^2 + 3*y" );
    console.log( "compare f(0, 1): ", f(0.0, 1.0), __parser.evaluate([0.0, 1.0]) );
    console.log( "compare f(1, 1): ", f(1.0, 1.0), __parser.evaluate([1.0, 1.0]) );
    console.log( "compare f(2, 1): ", f(2.0, 1.0), __parser.evaluate([2.0, 1.0]) );
    console.log( "compare f(3, 2): ", f(3.0, 2.0), __parser.evaluate([3.0, 2.0]) );
    console.log( "compare f(4, 0.5): ", f(4.0, 0.5), __parser.evaluate([4.0, 0.5]) );
    
    __parser.clear();
    __parser.set_variables(["x"]);
    var success = __parser.parse("2.5*sin(1/x) + 3.025*x^2 - e^(-1/x) - 2.75/x");
    
    f = function(x) { return 2.5*Math.sin(1/x) + 3.025*x*x - Math.exp(-1/x) - 2.75/x; }
    
    console.log( "" )
    console.log( "  f(x) = 2.5*sin(1/x) + 3.025*x^2 - e^(-1/x) - 2.75/x" );
    console.log( "compare f(2.5): ", f(2.5), __parser.evaluate([2.5]) );
    console.log(  );
  };
  
});