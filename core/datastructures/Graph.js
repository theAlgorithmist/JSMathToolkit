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

define(['../Limits', './GraphNode', './GraphIterator', './GraphArcIterator'], function (LimitsModule, GraphNodeModule, GraphIteratorModule, GraphArcIteratorModule) 
{
  var returnedModule = function () 
  {
    var limitsRef       = new LimitsModule();
    var graphNodeRef    = new GraphNodeModule();
    var graphIterRef    = new GraphIteratorModule();
    var graphArcIterRef = new GraphArcIteratorModule();
    
   /**
    * 
    * JS implementation of a Graph
    * 
    * @author Jim Armstrong, www.algorithmist.net
    * 
    * @version 1.0
    * 
    * Credit:  Michael Baczynski, polygonal ds
    */
 
    this.Graph = function(size)
    {
      this.maxSize = -1;
      if( !size )
        this.maxSize = limitsRef.LIMITS.INT32_MAX;
      else
        this.maxSize = size;
    
      this._size = 0;
      
      this.autoClearMarks = false;
      this.reuseIterator  = false;

      this._nodeList = null;
      this._size     = null;

      this._stack    = [];
      this._que      = [];
      this._iterator = null;

      this._busy    = false;
      this._nodeSet = null;
    }

    this.Graph.__name__ = true;
    this.Graph.prototype = 
    {
      getNodeList: function()
      {
        return this._nodeList;
      }

      , findNode: function(x)
      {
        var found = false;
        var n = this._nodeList;
        while (n != null)
        {
          if( n.val == x )
          {
            found = true;
            break;
          }
          
          n = n.next;
        }
        return found ? n : null;
      }

      , createNode: function(x)
      {
        var node = new graphNodeRef.GraphNode(x);
      
        return node;
      }

      , addNode: function(x)
      {
        this._size++;
    
        x.next = this._nodeList;
        if( x.next != null ) 
          x.next.prev = x;
      
        this._nodeList = x;
    
        return x;
      }

      , removeNode: function(x)
      {
        this.unlink(x);
    
        if( x.prev != null ) 
          x.prev.next = x.next;
      
        if( x.next != null ) 
          x.next.prev = x.prev;
      
        if( this._nodeList == x ) 
          this._nodeList = x.next;
      
        this._size--;
      }

      , addSingleArc: function(source, target, cost)
      {
        if( !cost )
          cost = 1.0;
    
        var walker = this._nodeList;
        while( walker != null )
        {
          if( walker == source )
          {
            var sourceNode = walker;
            walker = this._nodeList;
            while( walker != null )
            {
              if( walker == target )
              {
                sourceNode.addArc(walker, cost);
                break;
              }
              walker = walker.next;
            }
            break;
         }
          walker = walker.next;
        }
      }

      , addMutualArc: function(source, target, cost)
      {
        if( !cost )
          cost = 1.0;
    
        var walker = this._nodeList;
        while (walker != null)
        {
          if (walker == source)
          {
            var sourceNode = walker;
            walker = this._nodeList;
            while (walker != null)
            {
              if (walker == target)
              {
                sourceNode.addArc(walker, cost);
                walker.addArc(sourceNode, cost);
                break;
              }
          
              walker = walker.next;
            }
            break;
          }
          walker = walker.next;
        }
      }

      , unlink: function(node)
      {
        var arc0 = node.arcList;
        while (arc0 != null)
        {
          var node1 = arc0.node;
          var arc1 = node1.arcList;
          while (arc1 != null)
          {
            var hook = arc1.next;
        
            if (arc1.node == node)
            {
              if (arc1.prev != null) 
                arc1.prev.next = hook;
            
              if (hook != null) 
                hook.prev = arc1.prev;
            
              if (node1.arcList == arc1) 
                node1.arcList = hook;
            
              arc1.free();
            }
        
            arc1 = hook;
          }
      
          var hook = arc0.next;
      
          if (arc0.prev != null) 
            arc0.prev.next = hook;
        
          if (hook != null) 
            hook.prev = arc0.prev;
        
          if (node.arcList == arc0) 
            node.arcList = hook;
        
          arc0.free();
      
          arc0 = hook;
        }
    
        node.arcList = null;
    
        return node;
      }

      , clearMarks: function()
      {
        var node = this._nodeList;
        while (node != null)
        {
          node.marked = false;
          node = node.next;
        }
      }

      , clearParent: function()
      {
        var node = this._nodeList;
        while (node != null)
        {
          node.parent = null;
         node = node.next;
        }  
      }

      , DFS: function(preflight, seed, process, userData, recursive)
      {
        if (this._size == 0) return;
    
        if (this.autoClearMarks) 
          clearMarks();
    
        var c = 1;
    
        if (seed == null) 
          seed = this._nodeList;
    
        this._stack[0] = seed;
        seed.parent = seed;
        seed.depth = 0;
    
        if (preflight)
        {
          if (process == null)
          {
            var v = null;
            var n = _stack[0];
            v = n.val;
            if (!v.visit(true, userData))
            {
              _busy = false
              return;
            }
          
            while( c > 0 )
            {
              var n = this._stack[--c];
              if( n.marked ) continue;
              n.marked = true;
            
              v = n.val;
              if( !v.visit(false, userData) ) 
                break;
            
              var a = n.arcList;
              while( a != null )
              {
                v = n.val;
              
                a.node.parent = n;
                a.node.depth = n.depth + 1;
              
                if( v.visit(true, userData) )
                  _stack[c++] = a.node;
              
                a = a.next;
              }
            }
          }
          else
          {
            var n = this._stack[0];
            if( !process(n, true, userData) )
            {
              _busy = false;
              return;
            }
          
            while( c > 0 )
            {
              var n = thsi._stack[--c];
            
              if( n.marked ) continue;
                n.marked = true;
            
              if( !process(n, false, userData) ) break;
            
              var a = n.arcList;
              while( a != null )
              {
                a.node.parent = n;
                a.node.depth = n.depth + 1;
              
                if( process(a.node, true, userData) )
                  _stack[c++] = a.node;
              
                a = a.next;
              }
            }
          }
        }
        else
        {
          if( process == null )
          {
            var v = null;
            while (c > 0)
            {
              var n = this._stack[--c];
              if (n.marked) continue;
              n.marked = true;
            
              v = n.val;
              if( !v.visit(false, userData) ) 
                break;
            
              var a = n.arcList;
              while (a != null)
              {
                this._stack[c++] = a.node;
                a.node.parent = n;
                a.node.depth = n.depth + 1;
                a = a.next;
              }
            }
          }
          else
          {
            while (c > 0)
            {
              var n = _stack[--c];
              if (n.marked) continue;
              n.marked = true;
            
              if( !process(n, false, userData) ) 
                break;
            
              var a = n.arcList;
              while (a != null)
              {
                _stack[c++] = a.node;
                a.node.parent = n;
                a.node.depth = n.depth + 1;
                a = a.next;
              }
            }
          }
        }
    
        _busy = false;
      }

      , BFS: function(preflight, seed, process, userData)
      {
        if (_size == 0) return;
    
        _busy = true;
    
        if( this.autoClearMarks ) 
          clearMarks();
    
        var front = 0;
        var c = 1;
    
        if( seed == null ) 
          seed = this._nodeList;
    
        this._que[0] = seed;
    
        seed.marked = true;
        seed.parent = seed;
        seed.depth = 0;
    
        if( preflight )
        {
          if( process == null )
          {
            var v = null;
        
            var n = this._que[front];
            v = n.val;
            if( !v.visit(true, userData) )
            {
              _busy = false;
              return;
            }
        
            while( c > 0 )
            {
              n = this._que[front];
              v = n.val;
              if( !v.visit(false, userData) )
              {
                _busy = false;
                return;
              }
          
              var a = n.arcList;
              while( a != null )
              {
                var m = a.node;
                if( m.marked )
                {
                  a = a.next;
                  continue;
                }
            
                m.marked = true;
                m.parent = n;
                m.depth = n.depth + 1;
            
                v = m.val;
                if( v.visit(true, userData) )
                  _que[c++ + front] = m;
            
                a = a.next;
              }
          
              front++;
              c--;
            }
          }
          else
          {
            var n = this._que[front];
            if( !process(n, true, userData) )
            {
              _busy = false;
              return;
            }
        
            while( c > 0 )
            {
              n = this._que[front];
              if( !process(n, false, userData) )
              {
                _busy = false;
                return;
              }
          
              var a = n.arcList;
              while (a != null)
              {
                var m = a.node;
                if (m.marked)
                {
                  a = a.next;
                  continue;
                }
            
                m.marked = true;
                m.parent = n;
                m.depth = n.depth + 1;
            
                if (process(m, true, userData))
                _que[c++ + front] = m;
                a = a.next;
              }
          
              front++;
              c--;
            }
          }
        }
        else
        {
          if( process == null )
          {
            var v = null;
            while( c > 0 )
            {
              var n = this._que[front];
              v = n.val;
              if( !v.visit(false, userData) )
              {
                this._busy = false;
                return;
              }
              var a = n.arcList;
              while (a != null)
              {
                var m = a.node;
                if (m.marked)
                {
                  a = a.next;
                  continue;
                }
                m.marked = true;
                m.parent = n;
                m.depth = n.depth + 1;
            
                this._que[c++ + front] = m;
                a = a.next;
              }
          
              front++;
              c--;
            }
          }
          else
          {
            while( c > 0 )
            {
              var n = this._que[front];
              if( !process(n, false, userData) )
              {
                this._busy = false;
                return;
              }
          
              var a = n.arcList;
              while( a != null )
              {
                var m = a.node;
                if (m.marked)
                {
                  a = a.next;
                  continue;
                }
            
                m.marked = true;
                m.parent = n;
                m.depth = n.depth + 1;
            
                this._que[c++ + front] = m;
                a = a.next;
              }
          
              front++;
              c--;
            }
          }
        }
    
        this._busy = false;
      }

      , DLBFS: function(maxDepth, preflight, seed, process, userData)
      {
        if( _size == 0 ) 
          return;
    
        if( this.autoClearMarks ) 
          this.clearMarks();
    
        var front = 0;
        var c = 1;
    
        var node = this._nodeList;
        while (node != null)
        {
          node.depth = 0;
          node = node.next;
        }
    
        if( seed == null ) 
          seed = this._nodeList;
    
        this._que[0] = seed;
    
        seed.marked = true;
        seed.parent = seed;
    
        if( preflight )
        {
          if( process == null )
          {
            var v = null;
        
            var n = this._que[front];
            v = n.val;
            if( !v.visit(true, userData) )
            {
              this._busy = false;
              return;
            }
        
            while( c > 0 )
            {
              n = this._que[front];
              v = n.val;
              if( !v.visit(false, userData) )
              {
                this._busy = false;
                return;
              }
          
              var a = n.arcList;
              while( a != null )
              {
                var m = a.node;
                if( m.marked )
                {
                  a = a.next;
                  continue;
                }
            
                m.marked = true;
                m.parent = n;
                m.depth = n.depth + 1;
                if( m.depth <= maxDepth )
                {
                  v = m.val;
                  if( v.visit(true, userData) )
                    this._que[c++ + front] = m;
                }
                a = a.next;
              }
          
              front++;
              c--;
            }
          }
          else
          {
            var n = this._que[front];
            if( !process(n, true, userData) )
            {
              this._busy = false;
              return;
            }
        
            while( c > 0 )
            {
              n = this._que[front];
              if( !process(n, false, userData) )
              {
                this._busy = false;
                return;
              }
          
              var a = n.arcList;
              while( a != null )
              {
                var m = a.node;
                if( m.marked )
                {
                  a = a.next;
                 continue;
                }
            
                m.marked = true;
                m.parent = n;
                m.depth  = n.depth + 1;
                if( m.depth <= maxDepth )
                {
                  if( process(m, true, userData) )
                    this._que[c++ + front] = m;
                }
            
                a = a.next;
              }
          
              front++;
              c--;
            }
          }
        }
        else
        {
          if( process == null )
          {
            var v = null;
            while( c > 0 )
            {
              var n = this._que[front];
          
              v = n.val;
              if( !v.visit(false, userData) )
              {
                _busy = false;
                return;
              }
          
              var a = n.arcList;
              while( a != null )
              {
                var m = a.node;
                if( m.marked )
                {
                  a = a.next;
                  continue;
                }
            
                m.marked = true;
                m.depth = n.depth + 1;
                m.parent = n.parent;
            
                if( m.depth <= maxDepth )
                  this._que[c++ + front] = m;
            
                a = a.next;
              }
          
              front++;
              c--;
            }
          }
          else
          {
            while( c > 0 )
            {
              var n = this._que[front];
          
              if( n.depth > maxDepth ) continue;
          
              if( !process(n, false, userData) )
              {
                this._busy = false;
                return;
              }
          
              var a = n.arcList;
              while( a != null )
              {
                var m = a.node;
                if( m.marked )
                {
                  a = a.next;
                  continue;
                }
            
                m.marked = true;
                m.depth = n.depth + 1;
                m.parent = n.parent;
                if (m.depth <= maxDepth)
                  this._que[c++ + front] = m;
            
                a = a.next;
              }
          
              front++;
              c--;
            }
          }
        }
    
        this._busy = false;
      }

      , free: function()
      {
        var node = this._nodeList;
        while( node != null )
        {
          var nextNode = node.next;
      
          var arc = node.arcList;
          while( arc != null )
          {
            var nextArc = arc.next;
            arc.next = arc.prev = null;
            arc.node = null;
            arc = nextArc;
          }
      
          node.val = null;
          node.next = node.prev = null;
          node.arcList = null;
          node = nextNode;
        }
    
        this._nodeList = [];
    
        var len = this._stack.length;
        for( i=0; i<len; ++i) 
          _stack[i] = null; 
    
        this._stack = [];
      
        len = this._que.length;
        for( i=0; i<len; ++i) 
          _que[i] = null; 
    
        this._que = [];
    
        this._iterator = null;
    
        this._nodeSet.free();
        this._nodeSet = null;
      }

      , contains: function(x)
      {
        var found = false;
        var node = this._nodeList;
        while( node != null )
        {
          if (node.val == x)
            return true;
      
          node = node.next;
        }
    
        return false;
      }

      , remove: function(x)
      {
        var found = false;
        var node = this._nodeList;
        while( node != null )
        {
          var nextNode = node.next;
      
          if( node.val == x )
          {
            unlink(node);
            node.val = null;
            node.next = null;
            node.prev = null;
            node.arcList = null;
            found = true;
        
            _size--;
          }
      
          node = nextNode;
        }
    
        return found;
      }

      , clear: function(purge)
      {
        if( purge )
        {
          var node = this._nodeList;
          while( node != null )
          {
            var hook = node.next;
            var arc = node.arcList;
            while( arc != null )
            {
              var hook = arc.next;
              arc.free();
              arc = hook;
            }
        
            node.free();
            node = hook;
          }
        }
    
        this._nodeList = null;
        this._size = 0;
    
        this._stack = [];
        this._que = [];
      }

      , iterator: function()
      {
        if( this.reuseIterator )
        {
          if( _iterator == null )
            _iterator = new graphIterRef.GraphIterator(this);
          else
            _iterator.reset();
      
          return _iterator;
        }
        else
          return new graphIterRef.GraphIterator(this);
      }

//      , nodeIterator: function()
//      {
//        var itr = new GraphNodeIterator(this);
//      }

      , arcIterator: function()
      {
        var itr = new graphArcIterRef.GraphArcIterator(this);
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
        var node = this._nodeList;
        while( node != null )
        {
          a.push(node.val);
          node = node.next;
        }
    
        return a;
      }

      , toDA: function()
      {
        var a = [];
        var node = this._nodeList;
        while( node != null )
        {
          a.pushBack(node.val);
          node = node.next;
        }
    
        return a;
      }

      , _DFSRecursiveVisit: function(node, preflight, userData)
      {
        node.marked = true;
    
        var v = node.val;
        if( !v.visit(false, userData) ) 
          return false;
    
        var a = node.arcList;
        while( a != null )
        {
          var m = a.node;
      
          if( m.marked )
          {
            a = a.next;
            continue;
          }
      
          a.node.parent = node;
          a.node.depth = node.depth + 1;
      
          if( preflight )
          {
            v = m.val;
            if( v.visit(true, userData) )
              if( !_DFSRecursiveVisit(m, true, userData) )
                return false;
          }
          else
          {
            if( !_DFSRecursiveVisit(m, false, userData) )
              return false;
          }
      
          a = a.next;
        }
    
        return true;
      }

      , _DFSRecursiveProcess: function(node, process, preflight, userData)
      {
        node.marked = true;
        if( !process(node, false, userData) ) 
          return false;
    
        var a = node.arcList;
        while( a != null )
        {
          var m = a.node;
          if (m.marked)
          {
            a = a.next;
            continue;
          }
      
          a.node.parent = node;
          a.node.depth = node.depth + 1;
      
          if (preflight)
          {
            if (process(m, true, userData))
              if (!_DFSRecursiveProcess(m, process, true, userData))
                return false;
          }
          else
          {
            if (!_DFSRecursiveProcess(m, process, false, userData))
                return false;
          }
      
          a = a.next;
        }
    
        return true;
      }
    }
  }
  
  return returnedModule;
});