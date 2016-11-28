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
	  * A model representing clock time (H:M:S) that performs various arithmetic operations common to working with clock dashboard components.  Also supports
	  * 24-hour time.  A ClockTimeModel never exceeds 24 hours.
	  * 
	  * @author Jim Armstrong
	  * 
	  * @version 1.0
	  */
	  this.ClockTimeModel = function()
	  {	
	    this.SECONDS_PER_DAY    = 86400;
	    this.SECONDS_AT_NOON    = 43200;
	    this.SECONDS_PER_HOUR   = 3600;
	    this.SECONDS_PER_MINUTE = 60;
	 
		  this._seconds  = 0;         // number of seconds since midnight
		  this._is24Hour = true;      // true if time reported in 24-hour format
	  }
	  
	  this.ClockTimeModel.__name__ = true;
    this.ClockTimeModel.prototype = 
    {
     /**
      * Create a new ClockTimeModel
		  *
		  * @param hours : Int - Number of hours in the current clock time
		  * @default 0
		  *
		  * @param minutes : Int - Number of minutes in the current clock time
		  * @default 0
		  *
		  * @param seconds : Int - Number of seconds in the current clock time
		  * @default 0
		  *
		  * @param is24Hour : Boolean - True if input time is in 24-hour format
		  * @default true
		  *
		  * @param issAM : Boolean - True if the input time is AM, false if PM - ignored if is24Hour is true.
		  * @default false
		  *
		  * @return nothing - internal hours are clipped to [0,23], minutes are clipped to [0,59], and seconds are clipped to [0,59].
		  * 
		  */		
      create: function(hours, minutes, seconds, is24Hour, isAM)
		  {
        if( hours == undefined )
          hours = 0;
        
        if( minutes == undefined )
          minutes = 0;
        
        if( seconds == undefined )
          seconds = 0;
        
        if( is24Hour == undefined )
          is24Hour = true;
        
        if( isAM == undefined )
          isAM = false
		
		    this._is24Hour = is24Hour;
			
			  this.update(hours, minutes, seconds, isAM);
		  }
		  
     /**
		  * Access whether or not output is supplied in 24-hour format and calls to the update() method use 24-hour format.
		  *
		  * @return Boolean - true if 24-hour format is used for accepting input and formatting output.
		  * 
		  */	
		  , get_is24Hour: function()
		  {
		    return this._is24Hour;
		  }
		  
		 /**
		  * Assign whether or not 24-hour format is used
		  * 
		  * @param is24Hour : Boolean - true if 24-hour format is to be used in this model
		  * 
		  * @return Nothing
		  */
	    , set_is24Hour: function(is24Hour)
	    { 
	      if( is24Hour == undefined )
	        is24Hour = true;
	      
	      this._is24Hour = is24Hour; 
	    }
		  
    /**
	    * Access whether or not the current time is AM or PM.
		  *
		  * @return Boolean - true if the current time is AM, although not meaningful if time is input and output in 24-hour format.
		  * 
		  * @since 1.0
	  	*
		  */	
		  , get_isAM : function()
		  { 
		    return this._seconds < 43200;
		  }
		  
     /**
      * Access the number of hours in the current time.
		  *
		  * @return Int - Number of hours in [0,12] if the current model is in period format or [0,23] if the model is in 24-hour format.
		  */	
		  , get_hours: function()
		  {
		    var h = Math.floor(this._seconds/this.SECONDS_PER_HOUR);
		    return this._is24Hour ? h : (h > 12 ? h-12 : h);
      }
    
     /**
		  * Access the number of minutes in the current time.
		  *
		  * @return Int - Number of minutes in [0,60].
 		  */	
		  , get_minutes: function()
		  { 
		    var h      = Math.floor(this._seconds/this.SECONDS_PER_HOUR);
			  var remain = this._seconds - h*this.SECONDS_PER_HOUR;
			   
			  return  Math.floor(remain/this.SECONDS_PER_MINUTE);
		  }
		  
     /**
	    * Access the number of seconds in the current time.
		  *
		  * @return Int - number of seconds in [0,60].
		  */	
		  , get_seconds: function()
		  {
		    var h        = Math.floor(this._seconds/this.SECONDS_PER_HOUR);
			  var remain = this._seconds - h*this.SECONDS_PER_HOUR;
			  var m      = Math.floor(remain/this.SECONDS_PER_MINUTE);
			  remain     = remain - m*this.SECONDS_PER_MINUTE;
			   
			  return Math.floor(remain);
		  }
		  
     /**
		  * Access the value of this model
		  *
		  * @return Int - Value of the clock model as current number of seconds
		  */	
  		, get_value: function()
		  {
			  return this._seconds;
		  }

  	 /**
  	  * Assign a value to this model
  	  * 
  	  * @param seconds : Int - Number of seconds
  	  * 
  	  * @return Nothing - The internal clock model is updated based on the supplied number of seconds, which is clipped to the number of seconds in a day
  	  */
		  , set_value: function(seconds)
		  {
		    var secs   = Math.min(seconds,this.SECONDS_PER_DAY);
		    var h      = Math.floor(secs/this.SECONDS_PER_HOUR);
		    var remain = seconds - h*this.SECONDS_PER_HOUR;
			  var m      = Math.floor(remain/this.SECONDS_PER_MINUTE);
			  var s      = Math.floor(remain - m*this.SECONDS_PER_MINUTE);
			   
			  this.update(h, m, s);  
		  }
		
     /**
		  * Create a copy of the current model and returns a reference to the copy
		  *
		  * @return ClockTimeModel - Reference to new ClockTimeModel containing a copy of the current model
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
		  * Update the current model with separate hour, minute, and seconds in 24-hour format if is24Hour is currently true or period format if is24Hour is false.
		  *
		  * @param hours : Int - Number of hours in the current clock time in [0,23]
		  * @default 0
		  *
		  * @param minutes : Int - Number of minutes in the current clock time
		  * @default 0
		  *
		  * @param seconds : Int - Number of seconds in the current clock time
		  * @default 0
	  	*
		  * @param issAM : Boolean - true if the input time is AM, false if PM - ignored if is24Hour is true.
		  * @default false
		  * 
		  * @return Nothing - Input hours are adjusted mod 24 and input hours/seconds are adjusted mod 60
		  *
		  */
		  , update: function(hours, minutes, seconds, isAM)
		  {
		    if( hours == undefined )
          hours = 0;
        
        if( minutes == undefined )
          minutes = 0;
        
        if( seconds == undefined )
          seconds = 0;
        
        if( isAM == undefined )
          isAM = false
          
        var h = hours   % 24;
        var m = minutes % 60;
        var s = seconds % 60;
      
        if( !this._is24Hour )
        {
          if( isAM )
            h = h % 12;  
          else
          {   
            h = h % 12;
            h = h < 12 ? h+12 : h;
          }
        }
      
        this._seconds = s + m*this.SECONDS_PER_MINUTE + h*this.SECONDS_PER_HOUR;
		  }
		  
     /**
		  * Return the magnitude of the difference in elapsed hours between the current model and an input ClockTimeModel
		  *
		  * @param clock : ClockTimeModel -  ClockTimeModel whose time is to be compared to the current time
		  * 
		  * @param forward : Boolean - True if elapsed time is based on clockwise motion, false if counter-clockwise
		  * @default true
		  *
		  * @return Int - Magnitude of elapsed hours between the time represented by the current and input models.  If the input time is less than the 
		  * current time, the forward parameter determines if the around-the-clock or the minimal (counter-clockwise) elapsed time is returned.
	  	*/
		  , get_elapsedHours: function(clock, forward)
		  {
		    if( forward == undefined )
		      forward = true;
		    
		    if( !clock )
		      return 0;
		    
		    var s     = clock.get_value();
		    var delta = s - this._seconds;
		    if( delta < 0 )
			     delta = forward ? this.SECONDS_PER_DAY - this._seconds + s : -delta;  
			   
		    return Math.floor(delta/this.SECONDS_PER_HOUR);
		  }
		  
     /**
		  * Return the magnitude of the difference in elapsed minutes between the current model and an input <code>ClockTimeModel
		  *
		  * @param clock : ClockTimeModel - ClockTimeModel whose time is to be compared to the current time
		  * 
		  * @param forward : Boolean - True if elapsed time is based on clockwise motion, false if counter-clockwise
		  * @default true
	    *
		  * @return Int - Magnitude of elapsed minutes between the time represented by the current and input models.  If the input time is less than the 
		  * current time, the forward parameter determines if the around-the-clock or the minimal (counter-clockwise) elapsed time is returned.
		  */
		  , get_elapsedMinutes(clock, forward)
		  {
		    if( forward == undefined )
          forward = true;
        
        if( !clock )
          return 0;
			   
			  var s     = clock.get_value();
		    var delta = s - this._seconds;
		    if( delta < 0 )
			    delta = forward ? this.SECONDS_PER_DAY - this._seconds + s : -delta;  
			   
			  var h      = Math.floor(delta/this.SECONDS_PER_HOUR);
		    var remain = delta - h*this.SECONDS_PER_HOUR;
			  
		    return Math.floor(remain/this.SECONDS_PER_MINUTE);
		  }
		  
     /**
		  * Return the magnitude of the difference in elapsed seconds between the current model and an input ClockTimeModel
		  *
		  * @param clock : ClockTimeModel - ClockTimeModel whose time is to be compared to the current time
		  * 
		  * @param forward : Boolean - True if elapsed time is based on clockwise motion, false if counter-clockwise
		  * @default true
	 	  *
		  * @return Int - Magnitude of elapsed seconds between the time represented by the current and input models. If the input time is less than the 
		  * current time, the forward parameter determines if the around-the-clock or the minimal (counter-clockwise) elapsed time is returned.
	  	*
		  */
		  , get_elapsedSeconds: function(clock, forward)
		  {
		    if( forward == undefined )
          forward = true;
        
        if( !clock )
          return 0;
		   
		    var s     = clock.get_value();
		    var delta = s - this._seconds;
		    if( delta < 0 )
          delta = forward ? this.SECONDS_PER_DAY - this._seconds + s : -delta;  
			   
		    var h      = Math.floor(delta/this.SECONDS_PER_HOUR);
		    var remain = delta - h*this.SECONDS_PER_HOUR;
			  var m      = Math.floor(remain/this.SECONDS_PER_MINUTE);
			   
			  return Math.floor(remain - m*this.SECONDS_PER_MINUTE);
		  }
	
     /**
		  * Add a number of seconds to the current time
		  *
		  * @param seconds : Int - Number of seconds to add to the current time
		  * 
		  * @return Nothing - The value of this clock time model is adjusted, based on the number of seconds added (see set_value())
		  */
      , addSeconds: function(seconds)
      {
        if( !isNaN(seconds) )
          this.set_value(this._seconds + seconds);
      }
		
    /**
		  * Add the time in the current model to the time in an input ClockTimeModel.  To add a raw number of hours, minutes, and seconds to the current time, 
		  * set is24Hour to true on the input ClockTimeModel.
		  *
		  * @param clock : ClockTimeModel - ClockTimeModel whose time is to be added to the current model
		  *
		  * @return ClockTimeModel - Reference to a ClockTimeModel containing the result of adding the current clock time to the input clock time.	 The returned 
		  * ClockTimeModel is in the default 24-hour state. 
		  */
		  , add: function(clock)
		  {
			  if( clock == undefined )
			    return this.clone();
			   
			  var model = this.clone();
			   
			  var s = clock.get_value();
			  model.set_value( (this._seconds+s) % this.SECONDS_PER_DAY );
			   
			  return model;
		  }
		
     /**
		  * Subtract time represented by a ClockTimeModel from the current clock time.  To subtract a raw number of hours, minutes, and seconds from the current time, 
		  * set is24Hour to true on the input ClockTimeModel.
		  *
		  * @param clock : ClockTimeModel - Reference to ClockTimeModel> whose hours, minutes, and seconds are subtracted from the current time.
		  *
		  * @return ClockTimeModel - Reference to a ClockTimeModel containing the result of adding the current clock time to the input clock time.	 The returned 
		  * ClockTimeModel is in the default 24-hour state.  
		  */
		  , subtract: function(clock)
		  {
			  if( clock == undefined )
			    return this.clone();
			   
			  var model = this.clone();
			   
			  var s    = clock.get_value();
			  var secs = this._seconds-s;
			  
			  model.set_value( secs < 0 ? secs + this.SECONDS_PER_DAY : secs );
			  
			  return model;
		  }
		
     /**
		  * Add the current time to an input time and store the result in the current ClockTimeModel.  To add a raw number of hours, minutes, and seconds to the current time, 
		  * set is24Hour to true on the input ClockTimeModel.
		  *
		  * @param clock : ClockTimeModel - Reference to ClockTimeModel whose time is added to the current model
		  *
		  * @return Nothing
		  */
		  , addTo: function(clock)
		  {
			  if( !clock )
			    return;
			   
			  var s = clock.get_value();
			  this.set_value( (this._seconds+s) % this.SECONDS_PER_DAY );
		  }
		
     /**
		  * Subtracts an input ClockTimeModel from the current model and store the result in the current model.  To subtract a raw number of  hours, minutes, and seconds 
		  * to the current time, set is24Hour to true on the input ClockTime.
	  	*
		  * @param clock : ClockTimeModel - Reference to ClockTimeModel whose hours, minutes, and seconds are subtracted from the current model
		  *
		  * @return Nothing
		  */
		  , subtractFrom: function(clock)
		  {
		    if( !clock )
          return;
			   
			  var s    = clock.value;
			  var secs = (this._seconds-s);
			  
			  this.set_value( secs < 0 ? secs + this.SECONDS_PER_DAY : secs );
	  	}
			
     /**
		  * Returns a String representation of the current ClockTimeModel
		  *
		  * @return String formatted representation of the current model based on whether the ClockTimeModel is currently maintained in 24-hour format or whether the 
		  * current time is AM or PM if in period time.
		  * 
		  */
		  , toString: function()
		  {
        var h    = this.get_hours();
			  h        = !this._is24Hour && h==0 ? 12 : h;
			  var m    = this.get_minutes();
			  var s    = this.get_seconds();
			  var hStr = (this._is24Hour && h < 10) ? "0"+h.toString() : h.toString();
			  var mStr = m < 10 ? "0"+m.toString() : m.toString();
			  var sStr = s < 10 ? "0"+s.toString() : s.toString();
			 
			  var timeStr = (!this._is24Hour && s == 0) ? hStr + ":" + mStr : hStr + ":" + mStr + ":" + sStr;  
			  var period  = this._is24Hour ? "" : (this.get_isAM() ? " AM" : " PM");
			   
			  return timeStr + period;
		  }
	  }
  }
  
  return returnedModule
});
