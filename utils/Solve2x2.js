
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

define(['../core/Point'], function (PointModule) 
{
  var returnedModule = function () 
  {
    var pointRef = new PointModule();
  
   /**
    * A simple solver for two equations and two unknowns using Cramer's rule.  If the determinant is close to zero, a zero vector is returned as the solution.
    * 
    * @author Jim Armstrong (www.algorithmist.net)
    * 
    * @version 1.0
    */
    this.Solve2x2 = function()
    {
  	  this.__determinant = 0;                // value of determinant
    }	
   
    this.Solve2x2.__name__ = true;
    this.Solve2x2.prototype = 
    {
     /**
      * Return the determinant value
      * 
      * @return Float : Value of determinant, after a call to solve()
      */
      determinant: function()
      { 
        return this.__determinant;
      }
   
     /**
      * Solve a 2x2 system of equations
      * 
      * @param _a11 coefficient of x in first equation
      * @param _a12 coefficient of y in first equation
      * @param _a21 coefficient of x in second equation
      * @param _a22 coefficient of y in second equation
      * @param _b1 right-hand side value in first equation
      * @param _b2 right-hand side value in second equation
      * @param _zeroTol optional zero-tolerance for determinant
      * @default 0.00001
      * @param _resolve:Boolean true if resolving a new system of equations with same coefficients, but different RHS
      * @default false
      *
      * @return Point contains solution values or zero-vector if determinant is less than or equal to zero tolerance
      *
      */
      , solve: function( _a11, _a12, _a21, _a22, _b1, _b2, _zeroTol, _resolve)
      {
        if( _resolve == null )
          _resolve = false;
      
        if( _zeroTol == null )
          _zeroTol = 0.00001;
      
        if( !_resolve )
        {
          __determinant = _a11*_a22 - _a12*_a21;
        }
      
        if( Math.abs(__determinant) > _zeroTol )
        {
          var x = (_a22*_b1 - _a12*_b2)/__determinant;
          var y = (_a11*_b2 - _a21*_b1)/__determinant;
        
          return new pointRef.Point(x,y);          
        }
      
        return new pointRef.Point(0,0);
      }
    }
  }
    
  return returnedModule;
});