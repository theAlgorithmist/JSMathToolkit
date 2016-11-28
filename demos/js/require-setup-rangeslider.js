/*
 * Setup for jQuery, boostrap, blah, blah - credit to multiple folks including Dan Cruickshank @ FishTank
 */
var require = 
{
  shim : 
  {
    "bootstrap" : { "deps" :['jquery'] },
    "easeljs"   : {},
    "bootstrapslider" : {"deps" :['jquery'] }
  },
  paths: 
  {
    "jquery"    : "jquery-1.10.2-min",
    "bootstrap" : "bootstrap.min",
    "easeljs"   : "EaselJS",
    "bootstrapslider" : "bootstrap-slider"
  }
};