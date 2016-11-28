/*
 * Supporting script for very basic testing of Heap class. Copyright (c) 2014, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */
require(['jquery', 
         'bootstrap', 
         '../../core/datastructures/GraphNode',
         '../../core/datastructures/Heap'], 
         function($,                  // jQuery
                  bootstrapRef,       // Bootstrap
                  GraphNodeModule,    // GraphNode
                  HeapModule          // Heap
                  )
{
  var DEFAULT_SIZE = 100;
  var _size = DEFAULT_SIZE;
  
  var heapRef = new HeapModule();
  
  $( document ).ready( onPageLoaded );
  
  function onPageLoaded()
  {
    // output is a bit verbose, so test one of these categories at a time
    // testChange();
    // testReplace();
    // testSort();
    testPack();
  }
  
  function createHeap()
  {
    return new heapRef.Heap();
  }
  
  function E1(theID)
  {
    this.position = 0;
    this.ID      = theID;
  
    this.compare = function(other)
    {
      return other.ID - this.ID;
    }
    
    this.toString = function()
    {
      return '' + this.ID + " , " + this.position;
    }
    
    this.equals = function(other)
    {
      return this.position == other.position && this.ID == other.ID;
    }
  }

  function E2(val)
  {
    this.y = val;
    this.position = 0;
 
    this.toString = function()
    {
      return '' + this.y + ' , ' + this.position;
    }
    
    this.compare = function(other)
    {
      var dt = other.y - this.y;
        if (dt > 0) return -1;
      else
        if (dt < 0) return 1;
      return 0;
    }
    
    this.equals = function(other)
    {
      return this.y == other.y && this.position == other.position;
    }
  }

  function testChange()
  {
    var heap = createHeap();
        
    //descending order, root = largest item
    var values = [46, 8, 19, 5, 40, 14, 74, 66];
        
    var items = [];
    var i;
    for (i=0; i<values.length; ++i)
    {
      var item = new E2(values[i]);
      
      items.push(item);
    }
    
    for (i=0; i<items.length; ++i)
      heap.add(items[i]);
        
    items[0].y = 100; //46=> 100
    heap.change(items[0], 1);
    
    var v = heap.pop().y;
    
    console.log("#1");
    console.log(" ");
    
    while (!heap.isEmpty())
    {
      var w = heap.pop().y;
      console.log(">", v, w, v>w);
      v = w;
    }
        
    //descending order 9, 5, 2
    heap = createHeap();
    
    var item2 = new E2(2);
    
    var item5 = new E2(5);
    
    var item9 = new E2(9);
    
    heap.add(item2);
    heap.add(item5);
    heap.add(item9);
    item9.y -= 6;
    
    heap.change(item9, -1);
    console.log("");
    console.log( "#2");
    console.log("  - should equal -");
    console.log( item5.equals( heap.pop() ) );
    console.log( item9.equals( heap.pop() ) );
    console.log( item2.equals( heap.pop() ) );
        
    heap = createHeap();
    
    var values = [0, 1, 2, 3, 4];
        
    items = [];
    var item;
    for (i=0; i<values.length; ++i)
    {
      item = new E2(values[i]);
      
      items.push(item);
    }
        
    for (i=0; i<items.length; ++i)
    {
      heap.add(items[i]);
      items[i].y += 10;
      heap.change(items[i], 1);
    }
        
    console.log("");
    console.log( "#3");
    console.log("  - should equal -");
    console.log(14, heap.pop().y);
    console.log(13, heap.pop().y);
    console.log(12, heap.pop().y);
    console.log(11, heap.pop().y);
    console.log(10, heap.pop().y);
  }
      
  function testReplace()
  {
    var heap = createHeap();
        
    var values = [46, 8, 19, 5, 40, 14, 74, 66];
        
    var items = [];
    for (i=0; i<values.length; ++i)
    {
      item = new E2( values[i] );
      
      items.push(item);
    }
        
    for (i=0; i<items.length; ++i)
      heap.add(items[i]);
        
    var item = new E2(200);
    
    heap.replace(item);
        
    var v = heap.pop().y;
        
    console.log("");
    console.log( "replace");
    console.log("  - should be > -");
    while (!heap.isEmpty())
    {
      var w = heap.pop().y;
      console.log(v, w, v > w);
      v = w;
    }
  }
      
  function testSort()
  {
    var values = [46, 8, 19, 5, 40, 14, 74, 66];
    var items = [];
    var i;
    var item;
    
    for (i=0; i<values.length; ++i)
    {
      item = new E2( values[i] );
      
      items.push(item);
    }
        
    var heap = createHeap();
    
    for (i=0; i<items.length; ++i) 
      heap.add(items[i]);
        
    var a = heap.sort();
        
    var v = a.shift();
    console.log("");
    console.log( "sort");
    console.log("  - should be < -");
    while (a.length > 0)
    {
      var w = a.shift();
      console.log(w.y, v.y, w.y < v.y);
      v = w;
    }
  }
      
  function testPack()
  {
    var l = createHeap();
    
    l.add(new E1(0));
    l.add(new E1(1));
    l.add(new E1(2));
        
    l.clear();
        
    var a = l._a;
        
    console.log("");
    console.log( "#5");
    console.log("  - should be = -");
    console.log(null, a[0]);
    console.log(0, a[1].ID);
    console.log(1, a[2].ID);
    console.log(2, a[3].ID);
        
    l.pack();
        
    a = l._a;
    console.log(1, a.length);
    console.log(null, a[0]);
  }
      
  function testFront()
  {
    var h = createHeap();
    
    h.add(new E1(99));
    h.add(new E1(77));
    
    console.log("");
    console.log( "#6");
    console.log("  - should be = -");
    console.log(77, h.top().ID);
  }
      
  function testDynamic()
  {
    var h = createHeap();
    
    console.log("");
    console.log( "#7");
    console.log("  - should be true/= -");
    
    console.log(h.isEmpty());
    assertEquals(0, h.size());
    
    h.add(new E1(99));
    h.add(new E1(77));
    
    console.log(2, h.size());
    console.log(77, h.top().ID);
  }
      
  function testRemove()
  {
    var h = createHeap();
        
    var a = new E1(99);
    var b = new E1(77);
        
    console.log("");
    console.log( "8");
    console.log("  - should be true/= -");
    
    h.add(a);
    h.add(b);
    console.log(77, h.top().ID);
    h.remove(a);
    console.log(77, h.top().ID);
    h.remove(b);
    console.log(h.isEmpty());
        
    var h = createHeap();
        
    var a = new E1(99);
    var b = new E1(77);
        
    h.add(a);
    h.add(b);
    console.log(77, h.top().ID);
    h.remove(b);
    console.log(99, h.top().ID);
    h.remove(a);
    console.log(h.isEmpty());
  }
      
});