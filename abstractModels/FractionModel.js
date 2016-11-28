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
define(['../utils/MathUtils'], function (MathUtilsModule) 
{
  var returnedModule = function () 
  {
    var mathUtilsRef = new MathUtilsModule();
    var __mathUtils  = new mathUtilsRef.MathUtils();
    
   /**
    * 
    * Numerical model of a fraction as whole part, numerator, and denominator.  Internally, the whole part is implicitly contained in the numerator.  A fraction may 
    * be represented in a reduced or non-reduced state and in mixed (whole, plus numerator and denominator) or standard (numerator and denominator only) form.
    * 
    * @author Jim Armstrong
    * 
    * @version 1.0 
    */
    this.FractionModel = function()
	  {	
		  this._numerator   = 0;			
		  this._denominator = 1;		
	
		  this._isReduced = false;
		  this._isMixed   = false;
	
		  this._suspendUpdates = false;
	  }
    
    this.FractionModel.__name__ = true;
    this.FractionModel.prototype = 
    {
		/**
		  * Create a new FractionModel
		  *
		  * @param whole : Int - Whole part of the FractionModel
		  * @default 0
		  *
		  * @param numerator : Int - Numerator of the FractionModel
		  * @default 0
		  *
		  * @param denominator : Int - Denominator of the FractionModel - can not be zero
		  * @default 1
		  *
		  * @param reduced : Boolean - True if the FractionModel is maintained in reduced form
		  * @default false
		  * 
		  * @param mixed : Boolean - True if the FractionModel is maintained in mixed form
		  * @default false
	    *
		  * @return Nothing
		  */		
      create: function(whole, numerator, denominator, reduced, mixed)
		  {
        if( whole == undefined )
          whole = 0;
        
        if( numerator == undefined )
          numerator = 0;
        
        if( denominator == undefined )
          denominator = 1;
        
        if( reduced == undefined )
          reduced = false;
        
        if( mixed == undefined )
          mixed = false;
        
        whole       = Math.floor(whole);
        numerator   = Math.floor(numerator);
        denominator = Math.floor(denominator);
        
        if( denominator == 0 )
          denominator = 1;
		    
			  this._isMixed   = mixed;
			  this._isReduced = reduced;
			
			  this.update(whole, numerator, denominator);
		  }
		
		 /**
		  * Clone the current FractionModel
		  *
		  * @return FractionModel - Reference to clone of the current FractionModel
		  * 
		  */		
		  , clone: function()
		  {
		    var that = this;
        var temp = function temporary() { return that.apply(this, arguments); };
        for( key in this ) 
        {
          temp[key] = this[key];
        }
        
        return temp;
		  }
	  
	   /**
	    * Is the current model in reduced form?
	    *
	    * @return Boolean - true if the model is currently in reduced form, not whether the model is to be maintained in reduced form
	    * 
	    * @since 1.0
	    *
	    */      
	    , inReducedFrom: function()
	    {
	      //trace("[" + getQualifiedClassName(this) + "]::get isReduced(" + arguments + "): Boolean");
	    
	      if( this._isReduced )
          return true;
	      
	      return (__mathUtils.gcd(this._numerator, this._denominator) == 1);
	    }

	   /**
	    * Access the internal reduced-state indication 
	    *
	    * @return Boolean - Value of the internal reduced-state indicator
	    * 
	    */          
	    , get_isReduced: function() 
	    { 
	      return this._isReduced; 
	    }
	      
	   /**
	    * Assign the internal reduced-state indicator
	    *
	    * @param value : Boolean - Value to set the reduced-state indicator (true or false)
	    * 
	    * @return Nothing
	    */        
	    , set_isReduced: function(value) 
	    { 
	      this._isReduced = value;
	      if( this._isReduced )
	        this.__reduce();
	    }
	    
	   /**
	    * Is the FractionModel to be maintained in mixed form?
	    *
	    * @return Boolean - True if the FractionModel is to be maintained in mixed form.
	    */      
	    , get_isMixed: function()
	    {
	      return this._isMixed;
	    }
	    
	   /**
	    * Assign whether or not the FractionModel is to be maintained in mixed form
	    *
	    * @value : Boolean : Value to set the mixed form indicator (true or false)
	    * 
	    * @return Nothing
	    */      
	    , set_isMixed(value)
	    {
	      this._isMixed = value;
	    } 
	    
	   /**
	    * Return the whole part of the FractionModel
	    *
	    * @return Int - Zero if the model is not maintained in mixed form or the whole part of the current model in mixed form.
	    * 
	    */  
	    , get_whole: function()
	    {
	      var value = Math.floor(Math.abs(this._numerator/this._denominator));
	      value     = this._numerator > 0 ? value : -value;
	      
	      return this._isMixed ? Math.floor(value) : 0;
	    }
	    
	   /**
	    * Assign the whole part of the current FractionModel
	    * 
	    * @param whole : Int - Whole part of the FractionModel
	    *
	    * @return Nothing.  Update is the preferred method to set a completely new set of whole part, numerator, and denominator.  This method is best used to change
	    * only one value while leaving the others unchanged.
	    */  
	    , set_whole: function(whole)
	    {
	      this._numerator += (whole * this._denominator);
	          
	      if( !this._suspendUpdates && this._isReduced )
	        this.__reduce();
	    }
	    
	   /**
	    * Return the numerator of the FractionModel
	    *
	    * @return Int - Numerator value
	    */  
	    , get_numerator: function()
	    {
	      var wholePart = this.get_whole();
	      
	      var val = this._isMixed ? this._numerator - (wholePart * this._denominator) : this._numerator;
	      
	      return (this._isMixed && wholePart != 0 && val) < 0 ? -val : val;
	    }
	  
	   /**
	    * Assign a new numerator to the FractionModel
	    *
	    * @param numerator : Int - Numerator assigned to the FractionModel
	    * 
	    * @return Nothing.  Update is the preferred method to set a completely new set of whole part, numerator, and denominator.  This method is best used to change
      * only one value while leaving the others unchanged.
	    */    
	    , set_numerator(numerator)
	    {
	      this._numerator = !this._isMixed ? numerator : numerator + (this.get_whole() * this._denominator);
	      
	      if( !this._suspendUpdates && this._isReduced )
	        this.__reduce();
	    }
	    
	   /**
	    * Return the denominator of the FractionModel
	    *
	    * @return Int - Denominator value of the FractionModel.
	    */  
	    , get_denominator()
	    {
	      return this._denominator;
	    }
	    
	   /**
	    * Assign a denominator to the FractionModel
	    *
	    * @param denominator : Int - New denominator value (must be greater than zero as the negative 'value' of a fraction is associated with the whole part or numerator)
	    * 
	    * @return Nothing.  Update is the preferred method to set a completely new set of whole part, numerator, and denominator.  This method is best used to change
      * only one value while leaving the others unchanged.
	    */  
	    , set_denominator: function(denominator)
	    {
	      denominator = Math.floor(denominator)
	      if( denominator > 0 )
	      {
	        this._denominator = denominator;
	    
	        if( !this._suspendUpdates && this._isReduced )
	          this.__reduce();
	      }
	    }
	    
	   /**
	    * Return the numerical value of the FractionModel
	    *
	    * @return Number : Numerical value of the fraction model, i.e. a model of 1 1/4 has a value of 1.25.
	    */  
	    , get_value: function()
	    {
	      return this._numerator/this._denominator;
	    }

		 /**
		  * Update current model with separate whole, numerator, and denominator.
		  *
		  * @param whole : Int - New whole part
		  * 
		  * @param numerator : Int - New numerator
		  * 
		  * @param denominator : Int - New denominator (must be greater than zero)
		  * 
		  * @return Nothing - The internal model is modified based on current settings for mixed-form and reduced model
		  */		
      , update: function(whole, numerator, denominator)
		  {
		    if( whole == undefined )
          whole = 0;
       
        if( numerator == undefined )
          numerator = 0;
       
        if( denominator == undefined )
          denominator = 1;
        
        whole       = Math.floor(whole);
        numerator   = Math.floor(numerator);
        denominator = Math.floor(denominator);

			  this._numerator   = 0;
			  this._denominator = 1;
			  
			  this._suspendUpdates = true;
			  this.set_denominator(denominator);	
			  this._suspendUpdates = false;
			
			  this.set_numerator( Math.abs(numerator) + Math.abs(whole)*this._denominator );
			  if( whole < 0 || numerator < 0 )
				  this._numerator = -this._numerator;
      }
		
	   /**
		  * Return the least common denominator of the current and another FractionModel.
	 	  *
		  * @param fractio : FractionModel - Reference to a FractionModel
	 	  *
		  * @return int LCD of the current and input FractionModel
		  */	
      , leastCommonDenominator: function(fraction)
		  {
			  var d	     = fraction.get_denominator();
			  var theGcd = __mathUtils.gcd(this._denominator, d);
			  
			  return Math.floor( (this._denominator * d) / theGcd );			
		  }
		
	   /**
		  * Return the greatest common divisor of the current and another FractionModel
		  *
		  * @param fraction : FractionModel - Reference to a FractionModel
		  *
		  * @return Int - GCD of the current and input FractionModel
		  */
		  , greatestCommonDivisor(fraction)
		  {
		    // inline the GCD algorithm
			  var d = fraction.get_denominator();
		
			  var a = Math.max(this._denominator, d);
			  var b = Math.min(this._denominator, d);
			  var r = 0;			
		
			  while (b > 0)
			  {
				  r = a % b;
				  a = b;
				  b = r;
			  }
			
			  return Math.floor(a);
		  }	
		  
		  // internal method - access internal numerator value
		  , __internal__get_numerator()
		  {
		    return this._numerator;
		  }
		
		  // internal method - convert to reduced form
		  , __reduce: function()
		  {
			  var divisor = __mathUtils.gcd(this._numerator, this._denominator);
			  if( divisor == 1 )
				  return;
				
			  this._numerator	  = Math.floor(this._numerator / divisor);
			  this._denominator = Math.floor(this._denominator / divisor);
		  }
		
		/**
		  * Add the current FractionModel to another model
		  *
		  * @param fraction : FractionModel - Model to be added to the current fraction
		  *
		  * @return FractionModel - Reference to a FractionModel> containing the result of adding the current fraction to the input fraction.	The
		  * result is in the same state as the current model.
		  * 
		  */
		  , add: function(fraction)
		  {
		    var f  = fraction.clone();	    
			  var cd = this.leastCommonDenominator(fraction); 
			  var n1 = this.__internal__get_numerator() * (cd/this.get_denominator());
			  var n2 = fraction.__internal__get_numerator() * (cd/fraction.get_denominator());
			
			  f.update(0, n1 + n2, cd);
			  
			  return f;
		  }
		
		 /**
		  * Subtract a FractionModel from the current model
		  *
		  * @param fraction : FractionModel - FractionModel to be subtracted from the current model
		  *
		  * @return FractionModel - Reference to a FractionModel containing the result of subtracting the input fraction from the current fraction.	The
		  * result is in the same state as the input model.
		  * 
		  */
		  , subtract: function(fraction)
		  {
        var f  = fraction.clone();				
			  var cd = this.leastCommonDenominator(fraction);
			  var n1 = this.__internal__get_numerator() * (cd/this.get_denominator());
			  var n2 = fraction.__internal__get_numerator() * (cd/fraction.get_denominator());
					
			  f.update(0, n1 - n2, cd);
			  
			  return f;
		  }
		
		 /**
		  * Multiply a FractionModel by the current model
		  *
		  * @param fraction : FractionModel - FractionModel to be multiplied by the current model
		  *
		  * @return FractionModel - Reference to a FractionModel containing the result multiplying the current fraction by the input fraction.	The
		  * result is in the same state as the input model
		  * 
		  */
		  , multiply: function(fraction)
		  {
			  var f  = fraction.clone();
		    var n1 = this.__internal__get_numerator();
			  var d1 = this.get_denominator();
		
			  var n2 = fraction.__internal__get_numerator();
			  var d2 = fraction.get_denominator();
		
			  /* to return reduced form
			    var cd1 = FractionModel.gcd(n1, d2);
			    var cd2 = FractionModel.gcd(n2, d1);	
		
			    n1 = n1/cd1;
			    n2 = n2/cd2;
			    d1 = d1/cd2;
			    d2 = d2/cd1;
			  */
			  
			  f.update( 0, n1*n2, d1*d2 );
			  return f;
		  }
		
		 /**
		  * Divide the current model by another FractionModel
		  *
		  * @param fraction : FractionModel - Model to divide into the current model.
		  *
		  * @return FractionModel - Reference to a FractionModel containing the result of dividing the input fraction by current fraction.	The
		  * result is in the same state as the input model.
		  */
		  , divide: function(fraction)
		  {
		    var f  = fraction.clone();
        var n1 = this.__internal__get_numerator();
        var d1 = this.get_denominator();
    
        var n2 = fraction.__internal__get_numerator();
        var d2 = fraction.get_denominator();
		
			  /* to returns division in reduced form - reciprocate & multiply
			    var cd1 = FractionModel.gcd(n1, n2);
			    var cd2 = FractionModel.gcd(d1, d2);	
		
			    n1 = n1/cd1;
			    n2 = n2/cd1;
		
			    d1 = d1/cd2;
			    d2 = d2/cd2;
			  */
					
			  f.update(0, n1*d2, d1*n2);
			  
			  return f;
		  }
		
		 /**
		  * Adds the current model to another and store the result in the current FractionModel
		  *
		  * @param fraction : FractionModel - Model to add to the current fraction
		  *
		  * @return Nothing 
		  */
		  , addTo: function(fraction)
		  {
        var cd = this.leastCommonDenominator(fraction); 
        var n1 = this.__internal__get_numerator() * (cd/this.get_denominator());
        var n2 = fraction.__internal__get_numerator() * (cd/fraction.get_denominator());
	
			  this._numerator = n1+n2;
			  
			  this.set_denominator(cd);
		  }
		
		 /**
		  * Subtract an input fraction from the current model and store the result in the current FractionModel
		  *
		  * @param fraction : FractionModel - Model to subtract from the current fraction
		  *
		  * @return Nothing
		  */
		  , subtractFrom: function(fraction)
		  {
		    var cd = this.leastCommonDenominator(fraction); 
        var n1 = this.__internal__get_numerator() * (cd/this.get_denominator());
        var n2 = fraction.__internal__get_numerator() * (cd/fraction.get_denominator());
			
			  this._numerator = n1-n2;
			  this.set_denominator(cd); 
		  }
			
		 /**
		  * Multiply by an input fraction and store the result in the current FractionModel
		  *
		  * @param fraction : FractionModel - Model to multiply by the current fraction
		  *
		  * @return Nothing 
		  */
		  , multiplyBy: function(fraction)
		  {
			   var n1 = this.__internal__get_numerator();
         var d1 = this.get_denominator();
   
         var n2 = fraction.__internal__get_numerator();
         var d2 = fraction.get_denominator();
			
			  this._numerator = n1*n2;
			  this.set_denominator(d1*d2); 			
		  }
			
		 /**
		  * Divide the current fraction by another fraction and store the result in the current FractionModel
		  *
		  * @param fraction : FractionModel - Model to divide into the current FractionModel
		  *
		  * @return Nothing 
		  */
		  , divideInto: function(fraction)
		  { 
									
		    var n1 = this.__internal__get_numerator();
        var d1 = this.get_denominator();
  
        var n2 = fraction.__internal__get_numerator();
        var d2 = fraction.get_denominator();
												
			  this._numerator = n1*d2;
			  this.set_denominator(d1*n2);
		  }
			
		 /**
		  * Return a String representation of the FractionModel
		  *
		  * @return String - Formatted String of the current model based on whether it is maintained in mixed or regular form.
		  */
		  , toString: function()
		  {
			  if( this._isMixed )
			  {
				  var wholePart = this.get_whole();
				  
				  if( wholePart != 0 )
					  return (wholePart + " " + this.get_numerator() + "/" + this._denominator);
			  }
			
			  return (this._numerator + "/" + this._denominator);
		  }
			
		 /**
		  * Return a String representation of the FractionModel in reduced form, even if the model is not currently maintained in reduced form
		  *
		  * @return String - Formatted representation of the current model in reduced form; the internal representation remains unchanged
		  */
		  , toReducedString: function()
		  {
			  var num = this._numerator;
			  var den = this._denominator;
			
			  var divisor = __mathUtils.gcd(num, den);
			  if( divisor != 1 )
			  {
				  num	= Math.floor(num / divisor);
				  den = Math.floor(den / divisor);
			  }			
		
			  if( this._isMixed )
			  {
				  var wholePart = whole;
				
				  if( wholePart != 0 )
					  return (wholePart + " " + num + "/" + den);
			  }
			
			  return (num + "/" + den);
		  }
    }
	}
  
  return returnedModule;
});