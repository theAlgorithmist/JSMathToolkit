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
    * A set of utilities for formatting and displaying floating-piont values
    * 
    * @author: Jim Armstrong (www.algorithmist.net)
    * 
    * @version 1.0
    * 
    */
    this.NumberFormatter = function()
    {
      this.LOG_INVERSE = 1/2.30258509299; // 1/LN(10);
    }
  
    this.NumberFormatter.__name__ = true;
    this.NumberFormatter.prototype = 
    {
     /**
      * Round a floating-point number to a specified number of digits
      * 
      * @param : Number - Number to be rounded
      * 
      * @param : Number - Round to nearest multiple of this value, i.e. nearest tenth is 0.1, nearest fifth is 0.2, and nearest half is 0.5.  Use 10 to round to nearest 10, for example.
      * 
      * @return Number - Rounded input number to the specified number of digits unless the input Number is undefined or the digits value is less than zero.  
      * If the digits value is zero, the input number is returned.
      */
      roundTo: function(__value, __round)
      {
        // error-checking
        if( isNaN(__value) || __round < 0 )
          return 0;
      
        // trivial cases
        if( __round == 0 )
          return __value;
      
        if( __round == 1.0 )
          return Math.round(__value);
      
        var r = Math.floor(1/__round);
        r     = r == 0 ? 1.0/__round : r;
      
        return Math.round(__value*r)/r;
      }

     /**
      * Return a String representation of an input number that is converted to fixed-point notation
      * 
      * @param value : Number - Input floating-point number
      * 
      * @param decimal : Integer - Number of decimal places
      * 
      * @return String - A String representation of the fixed-point number, i.e. 5.14162 is returned as "5.14" to two decimal places or
      * "NaN" if the input is not a number.  If the number of decimal places is zero, the number is truncated, i.e. 5.14162 as an input
      * results in the String output, "5".
      */
	    , toFixed: function(__value, __decimal)
	    {
        // outliers
        if( isNaN(__value) )
          return "NaN";
        else if( __decimal < 0 )
	        return __value.toString();
        else
        {
		      if( __decimal == 0 )
		        return Math.floor(__value).toString();
		      else
		      {
            // there's really nothing new under the sun ...
            var power   = Math.pow(10, __decimal);
		        power       = 1/power;
            var temp    = this.roundTo(__value, power);
            var toPower = Math.pow(10, __decimal);
            var str     = ((temp * toPower | 0) / toPower).toString();
            var i       = str.indexOf(".");
            if( i != -1 )
            {
              for( i=str.substr(i+1).length; i<__decimal; ++i )
                str += "0";
            }
            else
            {
              str += ".";
              for( i=0; i<__decimal; ++i )
                str += "0";
            }
			
            return str;
		      }
        }
	    }
  
     /**
      * Return the number of digits past the decimal point of a floating-point number
      * 
      * @return Int - Number of decimal places, i.e. 0 if the input is actually an integer or 2 in the case of 4.15 and 1 in the case of 3.5.
      */
      , getDigits: function(__value)
      {
        if( isNaN(__value) )
          return 0;
      
        var value = __value.toString();
        var index = value.indexOf(".");
        if( index == -1 )
          return 0;
      
        return value.length-index-1;
      }
  
     /**
      * Return the order magnitude of a floating-point number
      * 
      * @param : Number - Input, floating-point number
      * 
      * @return Int - A value, say k, such that the input number can be expressed as C*10^k, where C is a constant.
      */
      , orderOfMagnitude: function(__value)
	    {
        // outliers
        if( isNaN(__value) )
	        return 0;
		
        if( __value == 0 )
	        return 0;
		
        // a bit silly, but should export okay to a wide variety of target environments
        var exponent     = Math.floor( Math.log(Math.abs(__value) ) * this.LOG_INVERSE ); 
        var powerOfTen = Math.pow(10, exponent);
        var mantissa   = __value / powerOfTen;
	  
        exponent = mantissa == 10 ? exponent+1 : exponent;

        return exponent;
	    }
  
     /**
      * Return a rich-text formatted String that contains the input floating-point number converted to scientific notation
      * 
      * @param value : Number - Input, floating-point number
      * 
      * @param significantDigits : Integer - Number of significant digits, must be at least 1
      * 
      * @return String - The number, 512.127, for example, is returned as "5.121 x 10<sup>2</sup>" with three significant digits.  This string may be used
      * to format UI items that accept rich-text input and properly format superscript tags.  Returns "NaN" if the input is not a number.
      */
      , toScientific(__value, __significantDigits)
      {
        // outliers
        if( Math.isNaN(__value) )
          return "NaN";
		
        if( __value == 0 )
          return "0";
		
        // this is clumsy but should work across all target environments
        var exponent = Math.floor( Math.log(Math.abs(__value) ) * this.LOG_INVERSE ); 
        exponent     = __value == 0 ? 0 : exponent;

        var powerOfTen = Math.pow(10, exponent);
        var mantissa   = __value / powerOfTen;
	  
        if( mantissa == 10 )
        { 
          mantissa  = 1;
          exponent += 1;
        }
	  
        var significand = toFixed(mantissa, __significantDigits); 
   
        return significand + " x 10 <sup>" + expontent.toString() + "</sup>";
      }
      
      /**
       * Return the exponent of a floating-point number
       * 
       * @param value : Number - Input, floating-point number
       * 
       * @return Int - Exponent if the number were expressed in scientific notation
       * 
       */
      , getExponent(value)
      {
        var exponent   = Math.floor( Math.log(Math.abs(value) ) * this.LOG_INVERSE ); 
        var powerOfTen = Math.pow(10, exponent);
        var mantissa   = value / powerOfTen;
        
        exponent = mantissa == 10 ? exponent+1 : exponent;

        return value == 0 ? 0 : exponent;
      }
  
     /**
      * Format a floating-point number into a String representation
      * 
      * @param value : Number - Input, floating-point number
      * 
      * @param useSeparator : Boolean - True if a comma is used to separate groups of three digits (defaults to false)
      * 
      * @param scientificNotation : Boolean -  True if scientific notation is to be used (this argument is only processed if useSeparator is false) - defaults to false.
      *
      * @param significantDigits : Integer - Number of significant digits after the decimal place (defaults to 1)
      * 
      * @return String - Formatted number with the requested number of significant digits.  If useSparator is true, then groups of three digits are separated by commas.  
      * If useSeparator is false and scientificNotation is used, then the result is returned in rich-formatted text in scientific notation.  Returns "NaN" if the input 
      * is not a number.
      * 
      * @see toScientific() 
      */
      , formatNumber: function(__value, __useSeparator, __scientificNotation, __significantDigits)
      {
        if( isNaN(__value) )
          return "NaN";
		
        var digits = __significantDigits < 0 ? 0 : __significantDigits;
        if( __useSeparator )
          return this.insertCommas(__value);
        else
        {
          // use scientific notation?
          return  __scientificNotation ? this.toScientific(__value, digits) : this.toFixed(__value, digits);
        }
      }
  
      // insert commas between groups of three digits, i.e. 1234567 is formatted as 1,234,567
      , insertCommas: function(__value) 
      {
        var number = __value.toString();
	
        if( __value < 1000 )
	        return number;
		
        var decimalPart = "";
        var decimal     = number.indexOf(".");
        if( decimal != -1 )
        {
          decimalPart = number.substring(decimal, number.length);
          number      = number.substring(0,decimal);
        }
	  
        var withCommas = "";
        var len        = number.length;
        var i          = 1;
	
        withCommas += number.charAt(0);
	
        while( i < len )
        {
          if( (len-i)%3 == 0 ) 
            withCommas += ",";
      
          withCommas += number.charAt(i);
          i++;
        }

        withCommas = decimal == -1 ? withCommas : withCommas + decimalPart;
	
        return withCommas;
      }
    }
  }
  return returnedModule;
});
