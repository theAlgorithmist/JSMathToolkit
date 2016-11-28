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
    * Deviates from various popular distributions
    * 
    * @author Jim Armstrong
    * 
    * @version 1.0
    */
    this.Deviates = function(seed)
		{
      this.IA   = 16807;
      this.IM   = 2147483647;
      this.AM   = 1.0/this.IM;
      this.IQ   = 127773;
      this.IR   = 2836;
      this.NTAB = 32;
      this.NDIV = (1+(this.IM-1)/this.NTAB);
      this.EPS  = 1.2e-7;
      this.RNMX = 1.0-this.EPS;
      
      this.idum    = 0;
      this.iv      = [];
      this.normVal = 0;
      this.u       = 0;
      this.s       = 1;
      this.a       = 1.0;
      this.b       = 1.0;
      this.a1      = 0.0;
      this.a2      = 0.0;
		}
    
    this.Deviates.__name__ = true;
    this.Deviates.prototype = 
    {
     /**
	    * Return a Uniform deviate
	    * 
	    * @param start : Int - A starting value for the sequence.
	    * 
	    * @param init : Boolean - true if the sequence is to be re-initialized; call with true, then pass false for successive calls
	    * 
	    * @return Number - Uniform deviate in (0,1)
	    * 
	    * Reference:  NRC (aka ran1 - portable and only suffers from period exhaustion)
	    *
	    */	
      uniform: function(start, init)
		  {
			  var i, k, temp;
			  var iy  = 0;
			  var len = this.NTAB+7;
			  
			  if( init )
			  {
			    this.iv.length = 0;
			    
		      this.idum = isNaN(start) && start < 1 ? 1 : start;
		      
			    for( j=len; j>=0; j--) 
			    {
			      k         = Math.floor( this.idum/this.IQ );
			      this.idum = this.IA*(this.idum - k*this.IQ) - this.IR*k;
			      
			      if( this.idum < 0 )
			        this.idum += this.IM;
			      
			       if( j < this.NTAB) 
			         this.iv[j] = this.idum;
			    }
			    
			    iy = this.iv[0];
			  }
    
        k = Math.floor( this.idum / this.IQ );
        this.idum = this.IA*(this.idum - k*this.IQ) - this.IR*k;
        if( this.idum < 0 )
          this.idum += this.IM;
        
        j          = Math.floor(iy/this.NDIV);
        iy         = this.iv[j];
        this.iv[j] = this.idum;
        
        temp = this.AM*iy;
        return (temp > this.RNMX) ? this.RNMX : temp;
		  }
    
     /**
      * Return an Exponential deviate
      * 
      * @param start : Int - A starting value for the sequence.
      * 
      * @param init : Boolean - true if the sequence is to be re-initialized; call with true, then pass false for successive calls
      * 
      * @return Number - Exponential deviate (positive, unit mean)
      * 
      * Reference:  NRC
      *
      */  
      , exponential: function(start, init)
      {
        var tmp = 0.0;
        
        while( tmp == 0.0 )
          tmp = this.uniform(start, init);
        
        return -Math.log(tmp);
      }
      
     /**
      * Return a Normal deviate
      * 
      * @param start : Int - A starting value for the sequence.
      * 
      * @param mu: Float - Desired mean
      * 
      * @param sig : Float - Desired std. deviation
      * 
      * @param init : Boolean - true if the sequence is to be re-initialized; call with true, then pass false for successive calls
      * 
      * @return Number - Normal deviate with supplied mean and variance
      * 
      * Reference:  NRC
      *
      */  
      , normal: function(start, mu, sig, init)
      {
        var fac, v1, v2;
        var rsq = 0.0;
        
        if( init )
        {
          this.u = isNaN(mu) || mu < 0 ? 0.0 : mu;
          this.s = isNaN(sig) || sig < 1.0 ? 1.0 : sig;
        }
        
        if( this.normVal == 0.0 ) 
        {
          while( rsq >= 1.0 || rsq == 0.0 )
          {
            v1  = 2.0*this.uniform(start, init) - 1.0;
            v2  = 2.0*this.uniform(start, init) - 1.0;
            rsq = v1*v1 + v2*v2;
          }
          
          fac = Math.sqrt(-2.0*Math.log(rsq)/rsq);
          
          this.normVal = v1*fac;
          return this.u + this.s*v2*fac;
        } 
        else 
        {
          fac = this.normVal;
          this.normVal = 0.0;
          
          return this.u + this.s*fac;
        }
      }
      
     /**
      * Return a Gamma deviate
      * 
      * @param start : Int - A starting value for the sequence.
      * 
      * @param alpha: Float - Alpha - shape parameter (sometimes denoted as k)
      * 
      * @param beta : Float - Beta - Inverse scale parameter (1/theta)
      * 
      * @param init : Boolean - true if the sequence is to be re-initialized; call with true, then pass false for successive calls
      * 
      * @return Number - Gamma deviate with zero mean and unit variance
      * 
      * Reference:  NRC
      *
      */
      , gamma: function(start, alpha, beta, init)
      {
        if( start )
        {
          this.a  = isNaN(alpha) || (alpha <= 0.0) ? 1.0 : alpha;
          
          if( this.a < 1.0 ) 
            this.a += 1.0;
          
          this.b  = isNaN(beta) || beta < 0.0001 ? 0.5 : beta;
          this.a1 = this.a - 1.0/3.0;
          this.a2 = 1.0/Math.sqrt(9.0*this.a1);
        }
        
        var u   = 10.0
        var v   = 0.0;
        var x   = 0.0;
        var xSQ = 0.0;
        
        while( u > 1.0 - xSQ*xSQ && Math.log(u) > 0.5*xSQ + this.a1*(1.0 - v + Math.log(v)) )
        {
          while( v <= 0.0 )
          {
            x = this.uniform(start, init);
            v = 1.0 + this.a2*x;
          }
          
          v   = v*v*v;
          u   = this.uniform(start, init);
          xSQ = x*x;
        } 
        
        return this.a1*v/this.b;
      }
      
     /**
      * Return a Logistic deviate
      * 
      * @param start : Int - A starting value for the sequence.
      * 
      * @param mu: Float - Desired mean
      * 
      * @param sig : Float - Desired std. deviation
      * 
      * @param init : Boolean - true if the sequence is to be re-initialized; call with true, then pass false for successive calls
      * 
      * @return Number - Logistic deviate with supplied mean and variance
      * 
      * Reference:  NRC
      *
      */
      , logistic: function(start, mu, sig, init)
      {
        if( init )
        {
          this.u = isNaN(mu) || mu < 0 ? 0.0 : mu;
          this.s = isNaN(sig) || sig < 1.0 ? 1.0 : sig;
        }
        
        var v = 0.0;
        while( v*(1.0-v) == 0.0 )
        {
          v = this.uniform(start, init);
        }
        
        return this.u + 0.551328895421792050*this.s*Math.log(v/(1.0-v));
      }
    }
  }
  
  return returnedModule;
});