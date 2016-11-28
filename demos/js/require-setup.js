/*
 * Setup for jQuery, boostrap, blah, blah - credit to multiple folks including Dan Cruickshank @ FishTank
 */
var require = 
{
  shim : 
  {
    "bootstrap" : { "deps" :['jquery'] },
    "easeljs"   : {},
    "canvastooltip" : {}
  },
  paths: 
  {
    "jquery"        : "jquery-1.10.2-min",
    "bootstrap"     : "bootstrap.min",
    "easeljs"       : "EaselJS",
    "canvastooltip" : "CanvasTooltip"
  }
};