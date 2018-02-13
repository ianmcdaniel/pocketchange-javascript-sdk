
//  PocketChange JavaScript SDK
//  Copyright 2013, Ian McDaniel, PocketChange Inc.
//  For all api documentation:
//  http://pocketchange.com/documentation

(function(PocketChange){

  var 
    request = PocketChange.Request,
    bind    = PocketChange.Util.bind,
    extend  = PocketChange.Util.extend;

  PocketChange.RewardView = function(data){
    if(data && data.dialog_url) {
      this.url    = data.dialog_url;
      this.optIn  = data.optIn;
    }
  };

  PocketChange.RewardView.prototype = {

    frame: null,

    style: {
      'background-color'  : 'transparent',
      'border'            : '0px none transparent',
      'overflow'          : 'hidden',
      'visibility'        : 'visible',
      'margin'            : '0px',
      'padding'           : '0px',
      'position'          : 'fixed',
      'z-index'           : '9999',
      'display'           : 'none'
    },

    overlay_style: {
      'left'              : '0px',
      'top'               : '0px',
      'width'             : '100%',
      'height'            : '100%'
    },

    standard_style: {
      'right'             : '0px',
      'bottom'            : '0px',
      'width'             : '335px',
      'height'            : '165px'
    },

    open: function(){
      if(!this.url) return;
      var dialog_style = this.optIn ? this.overlay_style : this.standard_style;
      var frame = this.frame = request.iframe({
        url: this.url,
        style: extend(extend({}, this.style), dialog_style)
      }, 
      bind(this.handleNotificationResponse, this));
      frame.onload = function(){
        this.style.display = "block";
      };
    },

    close: function() {
      if(this.frame) {
        this.frame.parentNode.removeChild(this.frame);
        this.frame = null;
      }
    },

    handleNotificationResponse: function(message, data) {
      if(data.message == "close") this.close(); 
    }
    
  };



}).call(this, PocketChange);