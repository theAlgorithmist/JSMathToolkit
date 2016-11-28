// Copyright (c) 2014, The Algorithmist.  All Rights Reserved.
// A simple Tooltip class for canvas elements, written on top of EaselJS - note: update the easel js stage after render or show/hide.  this task is left to the caller in the event that more than
// tooltip rendering is performed before an update is required.
var CanvasTooltip = function()
{
  this._name  = "";
  this._value = "";
  this._link  = "";
  this._label = null;
  this._img   = null;
  this._stage = null;
}

CanvasTooltip.__name__ = true;
CanvasTooltip.prototype =
{
  init:function(stage, container, id, font, options)
  {
    if( options == null )
      options = {};
    
    this._availWidth      = stage.canvas.width;
    this._availHeight     = stage.canvas.width;
    this._parent          = container;
    this._contents        = new createjs.Container();
    this._id              = id;
    this._tipText         = "";
    this._textColor       = options.hasOwnProperty("textColor") ? options.textColor : "#000000";
    this._backgroundColor = options.hasOwnProperty("backgroundColor") ? options.backgroundColor : "#ffffff";  
    this._width           = options.hasOwnProperty("width") ? parseInt(options.width) : 0;      
    this._textBuffer      = options.hasOwnProperty("textBuffer") ? Math.abs(parseInt(options.textBuffer)) : 4;
    this._borderThickness = options.hasOwnProperty("borderThickness") ? options.borderThickness : 3;
    this._borderColor     = options.hasOwnProperty("borderColor") ? options.borderColor : "#ebebff";
    this._img             = options.hasOwnProperty("image") ? options.image : "";
    
    this._bitmap   = null;
    this._triShape = new createjs.Shape();
    this._tipShape = new createjs.Shape();
    this._label    = new createjs.Text(this._tipText, font, this._textColor);
   
    if( this._width > 0 )
      this._label.lineWidth = this._width;
    
    this._contents .addChild(this._triShape);
    this._contents .addChild(this._tipShape);
    this._contents .addChild(this._label);
    
    this._parent.addChild(this._contents);
  }
  
  ,getID:function()
  {
    return this._id;
  }
  
  ,getText:function()
  {
    return this._tipText;
  }
  
  ,show:function()
  {
    this._triShape.visible = true;
    this._tipShape.visible = true;
    this._label.visible    = true;
  }
  
  ,hide:function()
  {
    this._triShape.visible = false;
    this._tipShape.visible = false;
    this._label.visible    = false;
  }
  
  ,render:function(tipType, tipTxt, mouseX, mouseY, renderOptions)
  {
    if( renderOptions == null )
      renderOptions = {};
    
    var alpha        = renderOptions.hasOwnProperty("alpha") ? parseFloat(renderOptions.alpha) : 1;
    var offsetX      = renderOptions.hasOwnProperty("offsetX") ? parseInt(renderOptions.offsetX) : 0;
    var offsetY      = renderOptions.hasOwnProperty("offsetY") ? parseInt(renderOptions.offsetY) : 0;
    var cornerRadius = renderOptions.hasOwnProperty("cornerRadius") ? parseInt(renderOptions.cornerRadius) : 10;
    var th           = renderOptions.hasOwnProperty("triangleHeight") ? parseInt(renderOptions.triangleHeight) : 6;
    var showTriangle = renderOptions.hasOwnProperty("showTriangle") ? renderOptions.showTriangle : true;
    var textBuffer   = renderOptions.hasOwnProperty("textBuffer") ? renderOptions.textBuffer : 2;
    
    if( alpha == 0 )
    {
      this._triShape.visible = false;
      this._tipShape.visible = false;
      this._label.visible    = false;
      return;
    }
    else
    {
      if( tipType != "image" )
        this._label.visible = true;
    }
    
    if( tipType == "image" )
    {
      this._label.visible = false;
     
      if( this._bitmap == null )
      {
        this._bitmap = new createjs.Bitmap(this._img);
        if( this._bitmap != null )
        {
          if( !container.contains(this._bitmap) )
            container.addChild(this._bitmap);
        }
      }
      
      if( this._bWidth == 0 )
        this._bWidth  = 0.5*this._bitmap.image.width; 
        
      if( this._bHeight == 0 )
        this._bHeight = 0.5*this._bitmap.image.height;
          
      this._bitmap.x = mouseX - this._bWidth;
      this._bitmap.y = mouseY - this._bHeight;
    }
    else
    {   
      this.tipText     = tipTxt;
      this._label.text = tipTxt;
      
      var w  = this._width > 0 ? this._width : this._label.getMeasuredWidth();
      w     += 2*textBuffer;
      var h  = this._label.getMeasuredHeight() + 2*textBuffer;
      var w2 = w*0.5;
      var h2 = h*0.5;
      var g  = this._tipShape.graphics;
     
      g.clear();
      g.setStrokeStyle( this._borderThickness );
      g.beginStroke( this._borderColor );
      g.beginFill( this._backgroundColor );
            
      this._label.x = -w2 + textBuffer;
      this._label.y = -h2 + textBuffer;
      
      switch( tipType )
      {
        case "circle":
          var r = Math.max(w2, h2) + textBuffer;
          g.drawCircle(r);
        break;
        
        case "oval":
          w += 8;
          h += 8;
          g.drawEllipse(-w2-4, -h2-4, w, h);
        break;
      
        case "rect":
          g.rect(-w2, -h2, w, h);
        break;
      
        case "roundRect":
          w += 6;
          h += 6;
          g.drawRoundRectComplex(-w2-3, -h2-3, w, h, 0, 10, 0, 10);
        break;
        
        case "complexRect":
          w += 6;
          h += 6;
          g.drawRoundRectComplex(-w2-3, -h2-3, w, h, 0, 10, 0, 10);
        break;
      }
      
      g.endStroke();
      g.endFill();
    }
    
    w += 2;
    h += 2;

    var w2 = 0.5*w;
    var h2 = 0.5*h;
    
    g = this._triShape.graphics;
    g.clear();
    
    if( showTriangle )
    {

    }
    
    if( mouseX + w < this._availWidth )
    {
      this._contents.x = mouseX + w2 + offsetX;
      this._contents.y = mouseY + h2 + offsetY;
    }
    else if( mouseX - w > 0 )
    {
      this._contents.x = mouseX - w2 - offsetX;
      this._contents.y = mouseY - h2 - offsetY;
    }
    else if( mouseY - h > 0 )
    {
      this._contents.x = mouseX + offsetX;
      this._contents.y = mouseY - h - offsetY;
    }
    else
    {
      this._contents.x = mouseX + offsetX;
      this._contents.y = mouseY + h + offsetY;
    }
  }
}
