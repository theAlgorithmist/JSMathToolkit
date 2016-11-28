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

define(['../Limits'], function (LimitsModule) 
{
  var returnedModule = function () 
  {
    var LIMITS = new LimitsModule();
    
   /**
    * 
    * Dense Array structure (built on top of Array)
    * 
    * @author Jim Armstrong, www.algorithmist.net
    * 
    * @version 1.0
    * 
    * Credit:  Michael Baczynski, polygonal ds
    */
 
    this.DenseArray = function(reservedSize, maxSize)
    {
      // for backward compatibility with Haxe signature and usage - not applied in JS version
      if( !reservedSize )
        reservedSize = 0;
  
      this.maxSize = (maxSize == -1) ? LIMITS.INT32_MAX : maxSize;
  
      this._size = 0;
      this._iterator = null;
  
      this._a = [];
  
      this.key = 1;
      this.reuseIterator = false;
    }

    this.DenseArray.__name__ = true;
    this.DenseArray.prototype =
    {
      pack: function()
      {
        var s = this._a.length;
        var len = this.size();
    
        if (s == len) return;
        var tmp = this._a.slice();
    
        this._a = [];
        var i;
        for (i=0; i<len; ++i) 
          this._a[i] = tmp[i];
    
        tmp.length = 0;
      }

      , trim: function(x)
      { 
        this._size = x;
      }

      , get: function(i)
      {
        return _a[i];
      }

      , getNext: function(i)
      {
        var indx = i+1 == this._size ? 0 : i+1;
        return this._a[indx];
      }

      , getPrev: function(i)
      {
        var indx = i-1 < 0 ? this._size-1 : i-1;
        return this._a[indx];
      }

      , set: function(i)
      {
        if( i >= 0 )
          this._a[i] = x;
    
        if (i >= this._size) 
        this._size++;
      }

      , front: function()
      {
        return this._a[0];
      }

      , back: function()
      {
        return this._a[this._size - 1];
      }

      , popBack: function()
      {
        var x = this._a[this._size - 1];
        this._size--;
    
        return x;
      }

      , pushBack: function(x)
      {
        this._a.push(x);
        this._size++;
      }

      , pushFront: function(x)
      {
        var tmp = [x];
        this._a = concat(tmp, this._a);
    
        this._size++;
      }

      , inRange: function(i)
      {
        return i >= 0 && i < this._size;
      }

      , getArray: function()
      {
        return this._a.slice();
      }

      , free: function()
      {
        this._a.length = 0;
        _iterator = null;
      }

      , size: function()
      {
        return this._size;
      }

      , isEmpty: function()
      {
        return this.size() == 0;
      }

      // primitive
      , reverse: function()
      {
        this._a.reverse();
      }
    }
  }
  
  return returnedModule;
});