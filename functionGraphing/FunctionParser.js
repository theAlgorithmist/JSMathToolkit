/* copyright (c) 2012, Jim Armstrong.  All Rights Reserved.
 * 
 * THIS SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * 
 * This software may be modified for commercial use as long as the above copyright notice remains intact.
 */

define([], function () 
{
  var returnedModule = function () 
  {
   /**
    * Parse and numerically evaluates functions expressed in a calculator-type syntax, sometimes known as infix notation.  Example: x^3 - x^2 + sin(x) + e^-cos(pi*x)/2
    *
    * The two symbols 'pi' and 'e' are automatically recognized and the following list of 'math' functions are supported: abs, acos, asin, atan, ceil, cos, floor, ln, max,
    * min, round, sin, sqrt, and tan.
    * 
    * The parser supports addition (+), subtraction (-), multiplication (*), division (/) and exponentiation (^) operators.  Operator precedence is ^, /, *, -, + .  Also,
    * note that implicit multiplication is not supported, i.e. x^2 + 2x - 3 needs to be written as x^2 + 2*x - 3.
    * 
    * By default, the function is evaluated presuming an independent variable, 'x' whose numerical value is provided.  An array of independent variables (String names)
    * may be supplied to the parser.
    * 
    * Create a list of independent variables at construction.  Define a function using the parse() method.  Evaluate the function for specific values of the independent
    * variables as many times as desired with the evaluate() method.
    * 
    * @param variables : Array - List of independent varible names (Strings)
    * 
    * Note:  Always use parentheses to make expressions unambiguous.
    * 
    * @author Jim Armstrong (www.algorithmist.net)
    * 
    * @version 1.0
    */

    this.FunctionParser = function(variables)
    {
      // symbolic names for operators converted to stack functions
      this.ADD      = "add";
      this.DIVIDE   = "div";
      this.MAX      = "max";
      this.MIN      = "min";
      this.MULTIPLY = "mul";
      this.POWER    = "pow";
      this.SUBTRACT = "sub";
      
      // sort of a grammar
      this.LETTERS         = "abcdefghijklmnopqrstuwvxzy";
      this.NUMBERS         = "0123456789.";
      this.MATH_OPERATORS  = "+-/^*";
      this.OPERATORS       = this.MATH_OPERATORS + "(),";
      this.UNARY           = "+-*/^,(";
      this.OP_LIST_1       = "^*+,/)";
      this.OP_LIST_2       = "^*+-,/)";
      this.OP_LIST_3       = "^*+-,/(";
      this.OP_LIST_4       = "^*+,/(";
      
      // single- and two-argument functions
      this.ONE_ARG_FUNCTIONS      = [ "abs", "acos", "asin", "atan", "ceil", "cos", "floor", "ln", "round", "sin", "sqrt", "tan" ];
      this.TWO_ARG_FUNCTIONS      = [ this.ADD, this.DIVIDE, this.MAX, this.MIN, this.MULTIPLY, this.POWER, this.SUBTRACT ];
      
      // token types
      this.NONE                = "";
      this.IS_ONE_ARG_FUNCTION = "fun1";
      this.IS_TWO_ARG_FUNCTION = "fun2";
      this.IS_LETTER           = "let";
      this.IS_NUMBER           = "num";
      this.IS_VARIABLE         = "var";
      this.IS_OPERATOR         = "op";
      this.IS_CONSTANT         = "c";
      this.IS_NONE             = "n";
    
      // for parsing
      this.PI             = "pi";
      this.E              = "e";
      this.LEFT_PAREN     = "(";
      this.RIGHT_PAREN    = ")";
      this.COMMA          = ",";
      this.MINUS          = "-";
      this.PLUS           = "+";
      this.MULTIPLICATION = "*";
      this.DIVISION       = "/";
      this.EXPONENT       = "^";
  
      // list independent variables
      this._variables = variables == null || variables.length == 0 ? ["x"] : variables.slice();
      
      // processing tokens
      this._tokenValue = this.NONE;
      this._tokenType  = this.NONE;
      this._tokenLength = 0;
    
      // RPN function stack
      this._functionStack = [];
    }
    
    this.FunctionParser.__name__ = true;
    this.FunctionParser.prototype = 
    {
      // stack functions - put them up here so the list is easy to find and add to
      abs: function(x)      { return Math.abs(x);   }
      , acos: function(x)   { return Math.acos(x);  }
      , add: function(x, y) { return x + y;         }
      , asin: function(x)   { return Math.asin(x);  }
      , atan: function(x)   { return Math.atan(x);  }
      , ceil: function(x)   { return Math.ceil(x);  }
      , cos: function(x)    { return Math.cos(x);   }
      , div: function(x ,y) { return x / y;         }
      , floor: function(x)  { return Math.floor(x); }
      , ln: function(x)     { return Math.log(x);   }
      , max: function(x, y) { return Math.max(x,y); }
      , min: function(x, y) { return Math.min(x,y); }
      , mul: function(x ,y) { return x * y;         }
      , pow: function(x, y) { return Math.pow(x,y); }
      , round: function(x)  { return Math.round(x); }
      , sin: function(x)    { return Math.sin(x);   }
      , sub: function(x ,y) { return x - y;         }
      , sqrt: function(x)   { return Math.sqrt(x);  }
      , tan: function(x)    { return Math.tan(x);   }
   
     /**
      * Assign independent variables
      * 
      * @param vars Array of new (String) variables names
      *
      * @return Nothing.  This should be a straightforward process.  Use single names with no spaces.  Otherwise, will have to add additional error-checking.
      */
      , set_variables: function(vars)
      {
        this._variables = vars == null || vars.length == 0 ? ["x"] : vars.slice();
      }
      
     /**
      * Clear the parser and prepare for new data
      *
      * @return Nothing.  Call parse() to parse a new function followed by evaluate() for one or more function evaluations.  This is only truly necessary if making
      * a change in the function's independent variable list before a parse.
      */
      , clear: function(vars)
      {
        this._variables.length = 0;
        this._functionStack.length = 0;
      }

     /**
      * Parse a function and prepare it for evaluation
      * 
      * @param str : String - Representation of function such as "x^3 - 2*cost(x) + e^-tan(pi*x)/2".  
      *
      * @return Boolean - True if parsing was successful.  The function must be parsed before evaluation.  Input errors result in no parsed result and the 
      * function may not be evaluated.  In the future, this may return an object that contains both the Boolean value and an indication of what step the parsing
      * failed, which can be used as a debugging aid.
      * 
      * Note:  Any prior function stack is overwriteen
      */
      , parse: function(str)
      {
        var trimStr = this.__trim(str);
	      
        // check basic errors
        if( trimStr == "" )
          return false; 
     
        if( !this.__validateChars(trimStr) )
          return false;
        
        if( !this.__validateParentheses(trimStr) )
          return false;
        
        if( !this.__validateTokens(trimStr) )
          return false;
        
        var processed = this.__processTokens(trimStr);
        if( processed == "" )
          return false;
      
        this._functionStack.splice(0);
      
        // cache function stack for future evaluations
        this.__createFunctionStack(processed);
        
        return true;
  	  }
  	 
     /**
      * Evaluate parsed function using numerical values for all independent variables.
      * 
      * @param variables : Array Independent variable numeric values. Example: Independent variables are 's' and 't'.  evaluate( [1.7, 2.5] ) evaluates the function 
      * at s = 1.7 and t = 2.5.
      *
      * @return Number - Numerical value of the function or NaN if there is an error during function evaluation.  Most common errors are not parsing a function
      * before evaluation and mismatch between constructor-defined variable list and numerical values.
      */
  	  , evaluate: function(variables) 
      { 
        if( this._functionStack.length == 0 )
		      return NaN; 
        
        if( variables.length != this._variables.length )
          return NaN; 
        
        var len = variables.length;
        for( var j=0; j<len; j++ )
        {
          if( isNaN(variables[j]) )
              return NaN;
        }
      
        var token     = "";
	      var tokenType = "";
	      var opStack   = [];
        var arg1      = 0;
        var arg2      = 0;

        var i = 0;
        var j, f;
        
        while( i < this._functionStack.length )
        {
          // in reverse order, type is before value
		      tokenType = this._functionStack[i];
		      token     = this._functionStack[i+1];
		     
		      switch( tokenType )
		      {
		        case this.IS_CONSTANT:
              if( token == this.E )
                opStack.push(Math.E);
              else if( token == this.PI )
                opStack.push(Math.PI);
            break;
          
            case this.IS_NUMBER: 
              opStack.push( parseFloat(token) );
            break;
		        
            case this.IS_ONE_ARG_FUNCTION:
              arg1 = opStack.pop();
                 
              f = this[token];
              if( f == null )
                return NaN;     // user entered an unsupported function or mis-typed coss instead of cos
              
              opStack.push( f(arg1) );
            break;
               
            case this.IS_TWO_ARG_FUNCTION:
              arg1 = opStack.pop(); 
              arg2 = opStack.pop();
                 
              f = this[token];
              if( f == null )
                return NaN;

              opStack.push( f(arg1,arg2) ); 
            break;
           
            case this.IS_VARIABLE:
              for( j=0; j<len; j++ )
              {
                if( token == this._variables[j] )
                  opStack.push( variables[j] );
              }
            break;
	     	   
            default:
              return NaN;  // invalid token made its way into the function stack
            break;
          }
		      
		      i += 2;
        }
	 
	      return opStack[0];
      }

  	  // RPN function stack in RPN
      , __createFunctionStack: function(str)
  	  {
  	    // easier to process LTR and then reverse than process RTL
  	    var len      = str.length;
  	    var position = 0;
  	    var token, tokenType, tokenLength;
  	    
  	    this._functionStack.length = 0;
  	   
  	    while( position < len )
        {
          token       = this.__nextToken(str, position);
          tokenType   = this.__getTokenType(token);
          tokenLength = token.length;
	       
	        if( !(tokenType == this.IS_NONE) )
	        {
	          if( tokenType == this.IS_CONSTANT || 
	              tokenType == this.IS_NUMBER   || 
	              tokenType == this.IS_VARIABLE || 
	              tokenType == this.IS_ONE_ARG_FUNCTION || 
	              tokenType == this.IS_TWO_ARG_FUNCTION )
            {
              this._functionStack.push( token     );
              this._functionStack.push( tokenType );
            }
          }
	        else
	          return;  
	       
	        position += tokenLength;
	      }
	     
	      // get RPN
	      this._functionStack = this._functionStack.reverse();
  	  }
  	 
      // internal method - process all tokens; errors cause blank string to be returned
  	  , __processTokens: function(str)
  	  {
  	    // adding a negative is the same as subtracting, so +- is replaced with -
  	    var myStr = str;
  	    myStr    = myStr.replace("/\+-/g", this.MINUS);
  	   
  	    // exponentiation becomes POWER(base,exponent)
  	    if( myStr.indexOf("^") != -1 )
  	      myStr = this.__processExponentiation(myStr);
  	   
  	    // unary minus becomes SUBTRACT(0,argument)
  	    myStr = this.__processUnaryMinus(myStr);
  	   
  	    // remaining operators
        myStr = this.__processOperator(myStr, this.DIVISION      );
        myStr = this.__processOperator(myStr, this.MULTIPLICATION);
  	    myStr = this.__processOperator(myStr, this.MINUS         );
        myStr = this.__processOperator(myStr, this.PLUS          );
  	   
        if( !this.__validateParentheses(myStr) )
          return "";
  	   
  	    return myStr;
  	  }
  	 
      // internal method - process into a function pow(base,exponent) 
  	  , __processExponentiation: function(str)
  	  { 
  	    // process from last exponent, back to beginning of string
  	    //
  	    // check there there is no exponentiation at the beginning or end of expression
  	    if( str.indexOf(this.EXPONENT) == 0 )
          return "";
        else if( str.charAt(str.length-1) == this.EXPONENT )
         return "";
      		
        // process until no more exponentiation symbols found
        var myStr       = str;
        var expIndex    = 0;
        var theBase     = "";
        var theExponent = "";
       
        var leftMarker, rightMarker;
       
        while( myStr.indexOf(this.EXPONENT) != -1 )
        { 
          expIndex    = myStr.lastIndexOf(this.EXPONENT);
          theBase     = "";
          theExponent = "";
        
          // process backwards (or to the left) to get the base of the exponent
          var leftMarker = this.__getBackwardArgument(str, expIndex);
          if( leftMarker == -1 )
            return "";
          else
            theBase = str.substring(leftMarker, expIndex); 
        
          // process forward of current position to get the exponent
          rightMarker = this.__getForwardArgument(str, expIndex);
          if( rightMarker == -1 )
            return "";
          else
            theExponent = str.substring(expIndex+1, rightMarker); 
        
          // in case the argument to the exponent is placed in parens
          theExponent = this.__stripParens(theExponent);
          
          // base^exponent replaced with pow(base,exponent)
          myStr = myStr.substring(0,leftMarker) + this.POWER + this.LEFT_PAREN + theBase + "," + theExponent + this.RIGHT_PAREN + myStr.substring(rightMarker,myStr.length+1);
        }
      
  	    return myStr;
  	  }
  	  
  	  // internal method - strip all left/right parens - expecting only one occurence of each
  	  , __stripParens: function(str)
  	  {
  	    var tmp = str.replace(this.LEFT_PAREN, "");
  	    return tmp.replace(this.RIGHT_PAREN, "");
  	  }
  	 
      // internal method - process unary minus operator - same as a SUBTRACT operation with zero as the first argument
      , __processUnaryMinus: function(str) 
      { 
        var myStr = str;
     
        // can't have no minus sign :
        if( myStr.indexOf(this.MINUS) == -1 )
          return myStr;
  
        // can't have it the very end, either
        if( myStr.charAt(str.length-1) == this.MINUS )
          return "";

        var i, j;
        var len = myStr.length;
       
        for( i=0; i<len; ++i )
        {
	        if( myStr.charAt(i) == this.MINUS && this.__isUnary(myStr.charAt(i-1)) )
	        {    
            j = this.__getForwardArgument(myStr, i);
            if( j == -1 )
              return ""; 
		   
            myStr = myStr.substring(0,i) + this.SUBTRACT + "(0," + myStr.substring(i+1,j) + this.RIGHT_PAREN + myStr.substring(j,myStr.length);
          }
        }

        return myStr;
      }
    
      // internal method, process operators with common logic
      , __processOperator: function(str, operator) 
      { 
        var myStr = str;
        var position, leftMarker, leftOperand;
        var rightMarker, rightOperand;
        
        if( myStr.indexOf(operator) == -1 )
          return myStr;
        else if( myStr.indexOf(operator) == 0 && operator != this.MINUS )
          return "";
        else if( myStr.charAt(myStr.length-1) == operator )
          return "";
        else
        { 
          while( myStr.indexOf(operator) != -1 )
          {
            position   = myStr.indexOf(operator);
	          leftMarker = this.__getBackwardArgument(myStr, position);
	          
	          if( leftMarker == -1 )
              return ""; 
            else
              leftOperand = myStr.substring(leftMarker,position); 
		
            rightMarker = this.__getForwardArgument(myStr, position);
	   
            if( rightMarker == -1 )
	            return ""; 
            else
              rightOperand = myStr.substring(position+1, rightMarker);
		
            // process +, -, *, and /
            switch( operator )
            {
              case this.PLUS:
                myStr = myStr.substring(0,leftMarker) + this.ADD + this.LEFT_PAREN + leftOperand + "," + rightOperand + 
                        this.RIGHT_PAREN + myStr.substring(rightMarker,myStr.length+1);
              break;
            
              case this.MINUS:
                myStr = myStr.substring(0,leftMarker) + this.SUBTRACT + this.LEFT_PAREN + leftOperand + "," + rightOperand + 
                        this.RIGHT_PAREN + myStr.substring(rightMarker,myStr.length+1);
              break;
            
              case this.MULTIPLICATION: 
	              myStr = myStr.substring(0,leftMarker) + this.MULTIPLY + this.LEFT_PAREN + leftOperand + "," + rightOperand + 
	                      this.RIGHT_PAREN + myStr.substring(rightMarker,myStr.length+1);
		          break;
		
		          case this.DIVISION:
	              myStr = myStr.substring(0,leftMarker) + this.DIVIDE + this.LEFT_PAREN + leftOperand + "," + rightOperand + 
	                      this.RIGHT_PAREN + myStr.substring(rightMarker,myStr.length+1);
		          break;
            } 
          }
		
          return myStr;
        }
      }
  	 
      // internal method - get argument of something to the right of marked position
  	  , __getForwardArgument: function(str, position)
  	  {
  	    var toRight = position+1;
        var len     = str.length;
        
        // character to immediate right of position marker
        var charToRight = str.charAt(position+1);
        
        // compensate for leading minus
        if( charToRight == this.MINUS )
        {  
          toRight++;
          
          if( toRight >= len )
            return -1;
          else
            charToRight = str.charAt(toRight);
        }
  
        // number?  If so, get next non-number
        if( this.__isNumber(charToRight) )
          return this.__getNextNonNumber(str, toRight+1);
        else if( this.__isLetter(charToRight) )
        { 
          toRight = this.__getNextNonChar(str, toRight+1);
          if( toRight == len-1 )
            return toRight;
        
          if( this.__isMathOperator( str.charAt(toRight) ) )
            return toRight;
        
          // open parent next?
          if( str.charAt(toRight) == this.LEFT_PAREN )
          {			
            // find matching right paren
            toRight = this.__matchLeftParen(str, toRight);
          }
        }
        else if( charToRight == this.LEFT_PAREN )
        {	
          // match the left paren
	        toRight = this.__matchLeftParen(str, toRight);
        }  
        else 
          return -1;
			  
        return toRight+1;
  	  }
  	 
  	  // internal method - get the argument of something left of parens
  	  , __getBackwardArgument: function(str, position) 
      {
        var charAtLeft = str.charAt(position-1);
	      var toLeft     = position-1;
	     
        if( this.__isNumber(charAtLeft) )
        {   
          while( (this.__isNumber(str.charAt(toLeft)) || str.charAt(toLeft) == ".") && toLeft >= 0 )
            toLeft--; 
	      }  
        else if( this.__isLetter(charAtLeft) )
        {   
          while( this.__isLetter(str.charAt(toLeft)) && toLeft >= 0 )
            toLeft--; 
	      }
        else if( charAtLeft == this.RIGHT_PAREN )
        { 
	        toLeft = this.__matchRightParen(str, toLeft);
		   
          if( toLeft >= 0 && this.__isNumber(str.charAt(toLeft)) )
            return -1;
						 
          if( toLeft == 0 && str.charAt(toLeft) !=  this.MINUS && str.charAt(toLeft) != this.LEFT_PAREN )
	          return -1;
	
          if( toLeft > 0 && this.__isLetter(str.charAt(toLeft-1)) )
          {
            toLeft--;
            while( this.__isLetter(str.charAt(toLeft)) && toLeft >= 0 )
              toLeft--; 		   
          }			
	      }
        else 
          return -1;

        return toLeft+1;	
      }

  	  // internal method - validate all tokens in a string
      , __validateTokens: function(str)
  	  {
        var curPosition = 0;
        var count       = 0;
        
        var len = str.length;
	     
	      // can't begin an expression with an operator, although a leading minus is okay
        var first = str.charAt(0);
        var last  = str.charAt(str.length-1);
        
        if( first != this.MINUS )
        {
          if( this.__isOperator(first) )
            return false;
        }
        
        var token, tokenType, tokenLength;
        var cp1, prevChar, firstAfterToken, firstCharAfterToken;
        
        while( curPosition < len )
        {
          token       = this.__nextToken(str,curPosition);
          tokenType   = this.__getTokenType(token);
          tokenLength = token.length;
          
          if( tokenType != this.NONE )
          {
            cp1                 = curPosition - 1;
            prevChar            = curPosition == 0 ? "" : str.charAt(cp1);
            firstAfterToken     = curPosition + tokenLength;
            firstCharAfterToken = str.charAt(firstAfterToken);
			       
            if( tokenType == this.IS_ONE_ARG_FUNCTION )
            {
              if( !(firstCharAfterToken == this.LEFT_PAREN) )
                return false;						   
				
              if( curPosition > 0 && !(this.__isOperator(prevChar)) )
                return false;
					
              if( curPosition > 0 && prevChar == ")" )
                return false;
            }
		   
            if( tokenType == this.IS_VARIABLE )
            {
              if( token == this.PI || token == this.E )
                return false;
			
              if( curPosition > 0 && !(this.__isOperator(prevChar)) )
                return false;
					
              if( curPosition > 0 && prevChar == ")" )
                return false;
					
              if( firstAfterToken < len && !(this.__isOperator(firstCharAfterToken)) )
                return false;
					
              if( firstAfterToken < len && firstCharAfterToken == "(" )
                return false;
            }
          
            if( tokenType == this.IS_NUMBER )
            {
              if( curPosition > 0 && !(this.__isOperator(prevChar)) )
                return false;
					
              if( curPosition > 0 && prevChar == ")" ) 
                return false;
					
              if( firstAfterToken < len && !(this.__isOperator(firstCharAfterToken)) )
                return false;
            
              if( firstAfterToken < len && firstCharAfterToken == this.LEFT_PAREN )
                return false;
            }
			  
            if( token == this.LEFT_PAREN )
            { 
              if( firstAfterToken < len && this.OP_LIST_1.indexOf(firstCharAfterToken) != -1 )
                return false;
            }
				
            if( token == this.RIGHT_PAREN )
            {
              if( firstAfterToken < len && this.OP_LIST_2.indexOf(firstCharAfterToken) == -1 )
                return false;
					
              if( cp1 >= 0 && this.OP_LIST_3.indexOf(prevChar) != -1 )
                return false;
            }
				 
            if( token == this.COMMA )
            {
              if( curPosition==0 || curPosition==len-1 )
                return false;
				  
              if( firstAfterToken < len && this.OP_LIST_2.indexOf(firstCharAfterToken) >= 0 )
                return false;
					
              if( cp1 >=0 && this.OP_LIST_3.indexOf(prevChar) >= 0 )
                return false;
            }
				 
            if( this.MATH_OPERATORS.indexOf(token) != -1 )
            {
              if( this.OP_LIST_1.indexOf(firstCharAfterToken) != -1 )
                return false;
			 
              if( this.OP_LIST_4.indexOf(prevChar) >= 0 && token != "-" )
                return false;
            }
          }
          else 
            return false;
	
          curPosition += tokenLength;
	        count       += 1;
        }
	     
	      return true;
      }
  	 
      // internal method - get the token type
      , __getTokenType: function(token)
      {
  	    if( token == this.PI || token == this.E )
          return this.IS_CONSTANT;
		      
  	    if( this.__isOneArgFunction(token) )
  	      return this.IS_ONE_ARG_FUNCTION;
  	   
  	    if( this.__isOperator(token) )
  	      return this.IS_OPERATOR;
  	   
        if( this.__isVariable(token) )
  	      return this.IS_VARIABLE;
  	   
  	    if( this.__isNumber(token) )
  	      return this.IS_NUMBER;
  	   
  	    if( this.__isTwoArgFunction(token) )
          return this.IS_TWO_ARG_FUNCTION;
  	   
  	     return this.NONE;
      }
	
      // internal method - validate characters as expected by the parser
      , __validateChars: function(str)
      {
        var i, myChar, legalCount;
        var l = str.length;
        
        for( i; i<l; ++i)
        {
          myChar = str.charAt(i);
	
         // string must contain number, letter, or operator
	       legalCount  = this.NUMBERS.indexOf(myChar);
	       legalCount += this.LETTERS.indexOf(myChar);
	       legalCount += this.OPERATORS.indexOf(myChar);
	       
	       if( legalCount == -3 )
           return false;
	      }
	     
	      return true;
      }
    
      // internal method - validate parentheses for balance
      , __validateParentheses: function(str)
      {
        var i, char;
	      var leftCount  = 0;
	      var rightCount = 0;
	      var l           = str.length;
	      
	      for( i=0; i<l; ++i )
	      {
	        char = str.charAt(i);
          if( char == this.LEFT_PAREN )
            leftCount++;
          else if( char == this.RIGHT_PAREN )
            rightCount++;
        }
		
        return leftCount == rightCount;
      }
    
      // internal method - get next token in sequence
      , __nextToken: function(str, position) 
      {
        var position = position;
        var len       = str.length;
        var char, end;
        
        if( position >= len )
          return this. NONE; 
        else 
        {
          var char = str.charAt(position);
          if( this.__isLetter(char) )
          {
            end = this.__getNextNonChar(str, position+1);
	
            return str.substring(position, end);
          }
					  
          if( this.__isNumber(char) )
          {
            end = this.__getNextNonNumber(str, position+1);
		 
	          return str.substring(position, end);
          }
			 		  
          if( this.__isOperator(char) )
            return char;
		  
          return this.NONE;
        }
      }

      // internal method - is the supplied string a one-argument function?
      , __isOneArgFunction: function(str)
      {
        var i;
        var len = this.ONE_ARG_FUNCTIONS.length;
        for( i=0; i<len; ++i )
        {	
          if( str == this.ONE_ARG_FUNCTIONS[i] )
          return true;
        }
      	
        return false;
      }
    
      // internal method - is the supplied string a two-argument function?
      , __isTwoArgFunction(str)
      {
        var i;
        var len = this.TWO_ARG_FUNCTIONS.length;
        
        for( i=0; i<len; ++i )
	      {	
	        if( str == this.TWO_ARG_FUNCTIONS[i] )
	          return true;
        }
      	
	      return false;
      }
    
      // internal method - is the supplied string a variable?
      , __isVariable: function(str)
      {
        var i;
        var len = this._variables.length;
        
	      for( i=0; i<len; ++i )
        {
          if( str == this._variables[i] )
            return true;
        }
	
        return false;
      }
    
      // internal method - is the supplied string a valid letter
      , __isLetter: function(str) 
      { 
        return this.LETTERS.indexOf(str) != -1;
      }
    
      // internal method - is the supplied string a numbber
      , __isNumber: function(str) 
      { 
        return !isNaN(str);
      }
    
      // internal method - is the supplied string an operator?
      , __isOperator: function(str) 
      { 
        return this.OPERATORS.indexOf(str) != -1;
      }
    
      // internal method - is the supplied string a math operator?
      , __isMathOperator: function(str) 
      { 
        return this.MATH_OPERATORS.indexOf(str) != -1;
      }
    
      // internal method - trim the input string for specific purposes of the function parser
      , __trim: function(str)
      {
        var myStr = "";
        var len      = str.length;
        var l1       = str.length - 1;
        
        var i;
        for( i=0; i<len; ++i ) 
        {
          if( str.charCodeAt(i) > 32 ) 
            myStr += str.charAt(i);
        } 
      
        return myStr;
      }
    
      // internal method - get the next non-character in a string, starting at the supplied position
      , __getNextNonChar: function(str, position)
      {
        var c = str.charAt(position);
        var i    = position;
        var l    = str.length;
      
        while( this.LETTERS.indexOf(c) != -1 && i < l )
        {
          i++;
          c = str.charAt(i);
        }
      
        return i;
      }
    
      // internal method - get the next non-number, starting at the supplied position, and going in the specified direction - note that 2.5, for example, is a number
      , __getNextNonNumber: function(str, position, dir)
      {
        if( dir == undefined )
          dir = 1;
        
        var c = str.charAt(position);
        var i = position;
        var l = str.length;
      
        if( dir == 1 )
        {
          while( this.NUMBERS.indexOf(c) != -1 && i < l )
          {
            i++;
            c = str.charAt(i);
          }
        }
        else
        {
          while( this.NUMBERS.indexOf(c) != -1 && i >= 0 )
          {
            i--;
            c = str.charAt(i);
          }
        }
      
        return i;
      }
    
      // internal method - get the next non-operator, starting at the supplied position
      , __getNextNonOperator: function(str, position)
      { 
        var c = str.charAt(position);
        var i    = position;
        var l    = str.length;
      
        while( this.OPERATORS.indexOf(c) != -1 && i < l )
        {
          i++;
          c = str.charAt(i);
        }
      
        return i;
      }
    
      // internal method - is the character unary?
      , __isUnary: function(char)
      {
        return this.UNARY.indexOf(char) != -1;
      }
    
      // internal method - from starting position of a left paren, find the matching right paren taking nested parens into account
      , __matchLeftParen: function(str, start)
      {
        // str.charAt(start) should be "("
        var leftCount  = 1;
        var rightCount = 0;
        var len         = str.length;
        var index       = -1;
        var i, char;
        
        for( i=start+1; i<len; ++i )
        {
          char = str.charAt(i);
          if( char == this.LEFT_PAREN )
            leftCount++;
        
          if( char == this.RIGHT_PAREN )
          {
            rightCount ++;
            if( rightCount == leftCount )
            {
              index = i;
              break;
            }
          }
        }
      
        return index;
      }
    
      // internal method, from the starting position of a right paren, find the matching left paren taking nested paren into account. 
      , __matchRightParen: function(str, start)
      {
        // str.charAt(start) should be ")"
        var leftCount  = 0;
        var rightCount = 1;
        var len        = str.length;
        var index      = -1;
        var i, char;

        for( i=start-1; i>=0; i-- )
        {
          char = str.charAt(i);
          if( char == this.RIGHT_PAREN )
            rightCount++;
        
          if( char == this.LEFT_PAREN )
          {
            leftCount ++;
            if( rightCount == leftCount )
            {
              index = i;
              break;
            }
          }
        }
      
        return index;
      }
    }
  }
  
  return returnedModule;
});