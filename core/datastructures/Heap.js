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
 * 
 * This software is derived from software containing the following copyright notice
 * 
 * THIS SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * 
 * This software is derived from software bearing the following notice   
 *                                                                                       
 * POLYGONAL - A HAXE LIBRARY FOR GAME DEVELOPERS
 * Copyright (c) 2009-2010 Michael Baczynski, http://www.polygonal.de
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

define([], function () 
{
  var returnedModule = function () 
  {
   /**
    * 
    * JS implementation of heap.
    * 
    * @author Jim Armstrong, www.algorithmist.net
    * 
    * @version 1.0
    * 
    * Credit:  Michael Baczynski, polygonal ds
    */
    this.Heap = function()
    {
      this._a = new Array();
      
      this._a.push(null);
      this._size = 0;
      this._iterator = null;

      this.reuseIterator = false;
    }

    this.Heap.__name__ = true;
    this.Heap.prototype = 
    {
      pack: function()
      {
        if( this._a.length - 1 == this.size() ) 
          return;
    
        var tmp = this._a;
        this._a      = []
        this._a[0]   = null;
        var len = this.size()+1;
    
        for( i=1; i<len; ++i)
          this._a[i] = tmp;

        for( i=len; i<tmp.length; ++i ) 
          tmp[i] = null;
      }

      , top: function()
      {
        return _a[1];
      }

      , bottom: function()
      {
        if (_size == 1) 
          return this._a[1];
    
        var a = this._a[1];
        var b;
    
        for( i=2; i<_size+1; ++i )
        {
          b = this._a[i];
          if( a.compare(b) > 0 ) 
            a = b;
        }
    
        return a;
      }

      , add: function(x)
      {
        this._a[++this._size] = x;
    
        x.position = this._size;
        this._upheap(this._size);
      }

      , pop: function()
      {
        var x = this._a[1];
    
        this._a[1] = this._a[this._size];
        this._downheap(1);
        this._size--;
    
        return x;
      }

      , replace: function(x)
      {
        this._a[1] = x;
    
        this._downheap(1);
      }

      , change: function(x, hint)
      {
        if( hint >= 0 )
          this._upheap(x.position);
        else
        {
          this._downheap(x.position);
          this._upheap(this._size);
        }
      }

      , sort: function()
      {
        if( this.isEmpty() ) 
          return new Array();
    
        var a = [];
        var h = this._a.slice();
    
        var k = this._size;
        var j = 0;
        while (k > 0)
        {
          a[j++] = h[1];
          h[1] = h[k];
      
          var i = 1;
          var c = i << 1;
          var v = h[i];
          var s = k - 1;
      
          while (c < k)
          {
            if (c < s)
              if (h[c].compare(h[c + 1]) < 0)
                c++;
        
            var u = h[c];
            if (v.compare(u) < 0)
            {
              h[i] = u;
              i = c;
              c <<= 1;
            }
            else break;
          }
          h[i] = v;
          k--;
        }
    
        return a;
      }

      , repair: function()
      {
        var i = this._size >> 1;
        while (i >= 1)
        {
          this._heapify(i, _size);
          i--;
        }
      }

      , free: function()
      {
        var len = this._a.length;
        for( i=0; i<len; ++i ) 
          this._a[i] = null;
    
        this._a = null;
    
        if( this._iterator != null )
        {
          this._iterator.free();
          this._iterator = null;
        }
      }

      , contains: function(x)
      {
        var position = x.position;
        return (position > 0 && position <= this._size) && (_a[position] == x);
      }

      , remove: function(x)
      {
        if( this.isEmpty() )
          return false;
        else
        {
          if (x.position == 1)
            pop();
          else
          {
            var p = x.position;
            this._a[p] = _a[this._size];
            this._downheap(p);
            this._upheap(p);
            this._size--;
          }
      
          return true;
        }
      }

      , clear: function(purge)
      {
        if( purge )
        {
          var len = this._a.length;
          for( i=1; i<len; ++i )
            this._a[i] = null;
        }
    
        this._size = 0;
      }

      , iterator: function()
      {
        if( this.reuseIterator )
        {
          if( this._iterator == null )
          {
            this._iterator = new HeapIterator();
            this._iterator.create(this);
          }
          else
            this._iterator.reset();
      
          return this._iterator;
        }
        else
        {
          this._iterator = new HeapIterator();
          this._iterator.create(this);
      
          return _iterator;
        }
      }

      , size: function()
      {
        return this._size;
      }

      , isEmpty: function()
      {
        return this._size == 0;
      }

      , toArray: function()
      {
        var a = [];
        var len = this._size+1;
    
        for( i=1; i<len; ++i) 
          a[i - 1] = this._a[i];
    
        return a;
      }

      , _upheap: function(i)
      {
        var p = i >> 1;
        var a = this._a[i];
        var b;
        while (p > 0)
        {
          b = this._a[p];
          if( a.compare(b) > 0 )
          {
            this._a[i] = b;
            b.position = i;
            i = p;
            p >>= 1;
          }
          else 
            break;
        }
    
        a.position = i;
        this._a[i] = a;
      }

      , _downheap: function(i)
      {
        var c = i << 1;
        var a = this._a[i];
        var s = this._size - 1;
    
        while (c < this._size)
        {
          if (c < s)
            if ( this._a[c].compare( this._a[c + 1]) < 0)
              c++;
      
          var b = this._a[c];
          if (a.compare(b) < 0)
          {
            this._a[i] = b;
            b.position = i;
            a.position = c;
            i = c;
            c <<= 1;
          }
          else 
            break;
        }
    
        a.position = i;
        this._a[i] = a;
      }

      , _heapify: function(p, s)
      {
        var l = p << 1;
        var r = l + 1;
    
        var max = p;
    
        if (l <= s && this._a[l].compare(this._a[max]) > 0) 
          max = l;
    
        if (l + 1 <= s && this._a[l + 1].compare(this._a[max]) > 0) 
          max = r;
    
        if (max != p)
        {
          var a = this._a[max];
          var b = this._a[p];
      
          this._a[max] = b;
          this._a[p]   = a;
      
          var tmp = a.position;
          a.position = b.position;
          b.position = tmp;
      
          this._heapify(max, s);
        }
      }
    }
  }
  
  return returnedModule;
});