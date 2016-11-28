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

define(['./GraphArc', './NodeValIterator'], function (GraphArcModule, NodeValIterModule) 
{
  var returnedModule = function () 
  {
    var graphArcRef   = new GraphArcModule();
    var nodeValItrRef = new NodeValIterModule();
    
   /**
    * 
    * JS implementation of graph node.
    * 
    * @author Jim Armstrong, www.algorithmist.net
    * 
    * @version 1.0
    * 
    * Credit:  Michael Baczynski, polygonal ds
    */
    this.GraphNode = function(x)
    {
      this.id;
      this.val     = x;
      this.prev    = null;
      this.next    = null;
      this.arcList = null;
      this.marked  = false;
      this.parent  = null;
      this.depth   = 0;
    }

    this.GraphNode.__name__ = true;
    this.GraphNode.prototype = 
    {
      free: function()
      {
        this.val     = null;
        this.next    = null;
        this.prev    = null;
        this.arcList = null;
      }
    
      , iterator: function()
      {
        var itr = new nodeValItrRef.NodeValIterator(this);
      
        return itr;
      }
    
      , isConnected: function(target)
      {
        return target ? this.getArc(target) != null : false;
      }
    
      , isMutuallyConnected: function(target)
      {
        if( target )
          return this.getArc(target) != null && target.getArc(this) != null;
        else
          return false;
      }
    
      , getArc: function(target)
      {
        if( !target )
          return null;
      
        if( target == this )
          return this;
      
        var found = false;
        var a = this.arcList;
        while (a != null)
        {
          if (a.node == target)
          {
            found = true;
            break;
          }
          a = a.next;
        }
      
        if (found)
          return a;
        else
          return null;
      }
    
      , addArc: function(target, cost)
      {
        if( target )
        {
          var arc = new graphArcRef.GraphArc(target, cost);
        
          arc.next = this.arcList;
          if (this.arcList != null) 
            this.arcList.prev = arc;
        
          this.arcList = arc;
        }
      }

      , removeArc: function(target)
      {
        if( target )
        {
          var arc = this.getArc(target);
          if (arc != null)
          {
            if (arc.prev != null) 
              arc.prev.next = arc.next;
          
            if (arc.next != null) 
              arc.next.prev = arc.prev;
          
            if (this.arcList == arc) 
              this. arcList = arc.next;
          
            return true;
          }
          return false;
        }
        else
          return false
      }
    
      , removeSingleArcs: function()
      {
        var arc = this.arcList;
        while (arc != null)
        {
          this.removeArc(arc.node);
          arc = arc.next;
        }
      }
    
      , removeMutualArcs: function()
      {
        var arc = this.arcList;
        while (arc != null)
        {
          arc.node.removeArc(this);
          this.removeArc(arc.node);
          arc = arc.next;
        }
      
        this.arcList = null;
      }
    
      , getArcCount: function()
      {
        var c = 0;
        var arc = this.arcList;
        while (arc != null)
        {
          c++;
          arc = arc.next;
        }
        
        return c;
      }
    }
  }
  
  return returnedModule;
});