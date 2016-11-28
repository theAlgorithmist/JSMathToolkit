/*
 * Supporting script for testing binomial coefficient generation. Copyright (c) 2014, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */
require(['jquery', 
         'bootstrap', 
         '../../core/datastructures/PriorityQueue'], 
         function($,                       // jQuery
                  bootstrapRef,            // Bootstrap
                  QueueModule              // Priority Queue
                  )
{
  $( document ).ready( onPageLoaded );
  
  function onPageLoaded()
  {
    var queueRef = new QueueModule();
    var __queue  = new queueRef.PriorityQueue();

    // create some data organized only by priority - note that lower numerical value indicates higher priority
    var __data = [];
    __data.push( {priority:3, value:100} );
    __data.push( {priority:1, value:50} );
    __data.push( {priority:20, value:0} );
    __data.push( {priority:18, value:1} );
    __data.push( {priority:2, value:75} );
    __data.push( {priority:1, value:75} );
    __data.push( {priority:1, value:100} );
    __data.push( {priority:7, value:30} );
    __data.push( {priority:10, value:35} );
    __data.push( {priority:11, value:35} );
    __data.push( {priority:5, value:100} );
    __data.push( {priority:4, value:75} );
    __data.push( {priority:3, value:50} );
    
    __queue.set_data(__data);
    
    // remove the first few highest-priority items; note that there is currently no way to differentiate between items of the same priority
    var item = __queue.removeFirstItem();
    console.log( "item: ", item);
    
    item = __queue.removeFirstItem();
    console.log( "item: ", item);
    
    item = __queue.removeFirstItem();
    console.log( "item: ", item);
    
    item = __queue.removeFirstItem();
    console.log( "item: ", item);
    
    item = __queue.removeFirstItem();
    console.log( "item: ", item);
    
    // remove the last couple of items - lowest priority 
    item = __queue.removeLastItem();
    console.log( "item: ", item);
    
    item = __queue.removeLastItem();
    console.log( "item: ", item);
    
    // now, clear the queue
    __queue.clear();
    console.log( "# items in the queue: ", __queue.get_length() );
    
    // insert the same data one at a time but with timestamp criteria
    __queue.addItem( {priority:3, timestamp:1000, value:100} );
    __queue.addItem( {priority:1, timestamp:1010, value:50} );
    __queue.addItem( {priority:20, timestamp:1020, value:0} );
    __queue.addItem( {priority:18, timestamp:1030, value:1} );
    __queue.addItem( {priority:2, timestamp:1040, value:75} );
    __queue.addItem( {priority:1, timestamp:1050, value:75} );
    __queue.addItem( {priority:1, timestamp:1060, value:100} );
    __queue.addItem( {priority:7, timestamp:1070, value:30} );
    __queue.addItem( {priority:10, timestamp:1080, value:35} );
    __queue.addItem( {priority:11, timestamp:1090, value:35} );
    __queue.addItem( {priority:5, timestamp:1100, value:100} );
    __queue.addItem( {priority:4, timestamp:1110, value:75} );
    __queue.addItem( {priority:3, timestamp:1120, value:50} );
    
    // indicate that the priority queue is to be ordered by priority and timestamp
    __queue.set_sortCriteria( ["priority", "timestamp"] );
    
    // now, there is a way to differentitate between equal-priority items in the queue
    item = __queue.removeFirstItem();
    console.log( "item: ", item);
    
    item = __queue.removeFirstItem();
    console.log( "item: ", item);
    
    item = __queue.removeFirstItem();
    console.log( "item: ", item);
    
    item = __queue.removeFirstItem();
    console.log( "item: ", item);
  };
  
});