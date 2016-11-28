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
	  * A relatively simple priority queue that can be sorted by a modest number of fields.  The most common field is 'priority' which is a simple
	  * numerical measure in [1,Number.MAX_VALUE].  The second is 'time' which can be a timestamp such as number of msec since beginning of a process.
	  * This allows equal-priority items in terms of application importance to be differentiated on a first-created, first-serviced basis.
	  *  
	  * @author Jim Armstrong
	  * 
	  * @version 1.0
	  * 
	  */	
	  this.PriorityQueue = function()
	  {
		  this._queue = [];                             // The actual priority queue
      this._defaultCriteria = ['priority'];         // so we always have something to sort by
      this._sortCriteria = [];                      // actual, user-supplied sort criteria
      this._delay = true;                           // true if sorting is delay while adding items to the queue
      this._invalidated = true;                     // true if additions to the queue have invalidated the sorting order (relevant for queries only)
	  }
	  
	  this.PriorityQueue.__name__ = true;
    this.PriorityQueue.prototype = 
    {
	   /**
	    * Access the length of the queue
	    * 
	    * @return Int - length of the queue
	    */
	    get_length: function()
	    {
	      return this._queue.length;
	    }
	  
	   /**
	    * Assign data to the queue
	    * 
	    * @param data : Array - Array of objects with name field being the criteria for sorting (i.e. 'priority', 'time')
	    * 
	    * @return Nothing
	    */
	    , set_data: function(data)
	    {
	      if( data )
	        this._queue = data.slice()
	    }
	  
	   /**
	    * Access the current delay parameter
	    * 
	    * @return Boolean - Value of sort-delay parameter
	    */
	    , get_delay: function()
	    {
	      return this._delay;
	    }
	    
	   /**
	    * Assign the sort-delay parameter
	    * 
	    * @param value : Boolean - true if sorting is delayed while adding items to the priority queue (for performance reasons)
	    * 
	    * @return Nothing
	    */
	    , set_delay: function(value)
	    {
	      if( value == undefined )
	        value = true;
	      
	      this._delay = value;
	    }
	    
	   /**
	    * Access the current sort criteria
	    * 
	    */
		  , get_sortCriteria: function()
		  {
        return this._sortCriteria;
		  }
		
	   /**
	    * Assign the sort criteria for this priority queue
	    * 
	    * @param crietria : Array - Each element of the array must correspond to a name property in the each Object that is a data element in the priority queue
	    * 
	    * @return Nothing - Assign the sort criteria.  Example.  If the sort criteria is [ 'p', 't' ], then each data element should be an Object with a 'p' and 't'
	    * property.
	    */
      , set_sortCriteria: function(criteria)
		  {
        if( criteria )
			    this._sortCriteria = criteria.slice()
		  }

	   /**
	    * Add an item to the priority queue
	    * 
	    * @param item : Object - Item to add to the priority queue
	    * 
	    * @return Nothing - The item is added to the end of queue and the queue is automatically re-sorted if the sort-delay is false.  Otherwise
	    */
		  , addItem: function(item)
		  {
			  if( item )
			  {
			    this._queue.push(item);
			    
			    if( !this._delay )
			      this.__sort();
			    else
			      this._invalidated = true;
			  }
		  }
	 
		 /**
		  * Return the first and highest priority item 
		  *  
		  * @return Object - Highest priority (topmost) queue item.  The item is permanently removed from the priority queue
		  * 
		  */		
		  , removeFirstItem: function()
		  {
        if( this._invalidated )
          this.__sort();
        
			  return this._queue.shift();
		  }
		  
		/**
	    * Return the last and lowest priority item 
	    *  
	    * @return Object - Lowest priority (bottommost) queue item.  The item is permanently removed from the priority queue
	    * 
	    */    
	    , removeLastItem: function()
	    {
	      if( this._invalidated )
	        this.__sort();
	        
	      return this._queue.pop();
	    }
		
	   /**
	    * Remove the specified item from the priority queue or take no action if the item does not exist
	    * 
	    * @param item : Object - Item to be removed
	    * 
	    * @return Boolean - true if the item was found and removed from the queue.  The queue is resorted unless the delay parameter is false.  This allows multiple
	    * removals to be processed faster and only perform a single sort, JIT.
	    */
		  , removeItem: function(item)
		  {
        if( item == undefined )
          return false;
        
        if( item !== 'object' )
          return false;
        
        var index = this.__getItemIndex(item);
			
        if( index != -1 )
		  	{
          this._queue.splice(index, 1);
				  return true;
        }
			  
			  return false;
		  }
		
	   /**
	    * Clear the priority queue and prepare for new data
	    * 
	    * @return Nothing - The queue is prepared for new data, although the delay property remains unchanged from its prior setting
	    */
		  , clear: function()
		  {
		    this._queue.length = 0;
		    this._sortCriteria.length = 0;
	      this._invalidated = true;  
		  }
		
		  // internal method - get the index corresponding to the input item
		  , __getItemIndex(item)
		  {
        var len = this._queue.length;
        var i;
        for( i = 0; i<len; ++i)
			  {
				  if( this._queue[i] == item )
					return i;
        }
        
        return -1;
      }
		
		  // internal method - sort on the supplied criteria
      , __sort: function()
		  {
        if( this._sortCriteria.length == 0 )
          this._sortCriteria = this._defaultCriteria.slice();
        
			  // inline a sort-on
        if( this._sortCriteria.length == 0 )
          this._queue.sort();
        
        var args = this._sortCriteria.slice();
        this._queue.sort
        (
          function(a,b)
          {
            var props = args.slice();
            var prop  = props.shift();
            while( a[prop] == b[prop] && props.length ) 
              prop = props.shift();
              
            return a[prop] == b[prop] ? 0 : a[prop] > b[prop] ? 1 : -1;
           }
        );

			  this._invalidated = false;
		  }
		}
	}
  
  return returnedModule;
});