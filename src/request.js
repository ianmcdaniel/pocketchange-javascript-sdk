
//  PocketChange JavaScript SDK
//  Copyright 2013, Ian McDaniel, PocketChange Inc.
//  For all api documentation:
//  http://pocketchange.com/documentation

(function(PocketChange){

  var 
    util        = PocketChange.Util,
    extend      = util.extend,
    bind        = util.bind,
    serialize   = util.serialize,
    deserialize = util.deserialize,
    uuid        = util.uuid;
  
  // Methods for making requests against PocketChange's Server.
  // All request types take the same arguments; url, parameters and a callback.
  PocketChange.Request = {

    // Request callback methods are defined in this namespace
    callbacks : {},
    
    // Opens a popup window with the given url and places it at the
    // center of the current window. Used for app authentication. Should only 
    // be called on a user event like a click as many browsers block popups 
    // if not initiated by a user.
    popup: function(options, success, error) {
      this.registerXDHandler();
      // find the center
      var
        opts        = options || {},
        screenX     = window.screenX      || window.screenLeft,
        screenY     = window.screenY      || window.screenTop,
        outerWidth  = window.outerWidth   || document.documentElement.clientWidth,
        outerHeight = window.outerHeight  || (document.documentElement.clientHeight - 22),
        width       = opts.width          || 600,
        height      = opts.height         || 400,
        left        = parseInt(screenX + ((outerWidth - width) / 2), 10),
        top         = parseInt(screenY + ((outerHeight - height) / 2.5), 10),
        features    = (
          'width='    + width +
          ',height='  + height +
          ',left='    + left +
          ',top='     + top
        ),
        
        cbid         = this.getCallbackId(),
        win_params  = extend((opts.data||{}),{
          callback  : cbid,
          origin    : this.getOrigin()
        }),
        win_url     = opts.url + (opts.url.indexOf('?')>-1 ? '&' : '?') + serialize(win_params),
        win         = window.open(win_url, opts.name || cbid, features);
        
      this.callbacks[cbid] = function(message, data) {
        if(data.error && error) {
          error(data);
        }
        if(success) success(message, data ,win);
        delete PocketChange.Request.callbacks[cbid];
      };
      return win;
    },


    iframe: function(options, success, error) {
      this.registerXDHandler();
      var 
        opts          = options || {},
        iframe        = document.createElement('iframe'),
        cbid           = this.getCallbackId(),
        ifrm_params   = extend((opts.data||{}),{callback: cbid, origin: this.getOrigin()}),
        ifrm_url      = opts.url + (opts.url.indexOf('?')>-1 ? '&' : '?') + serialize(ifrm_params);

      this.callbacks[cbid] = function(message, data) {
        if(data.error && error) {
          error(data);
        }        
        if(success) success(message, data);
        delete PocketChange.Request.callbacks[cbid];
      };
      
      iframe.setAttribute('frameBorder', '0');
      iframe.setAttribute('allowtransparency', 'true');
      document.body.appendChild(iframe);
      iframe.contentWindow.name = cbid;


      if(opts.method && opts.method.match(/post/i)){
        var frm;
        frm = document.createElement('form');
        frm.setAttribute('action', ifrm_url);
        frm.setAttribute('method', 'post');
        frm.setAttribute('target', cbid);
        document.body.appendChild(frm);
        frm.submit();
        frm.parentNode.removeChild(frm);  
      } else {
        iframe.setAttribute('src', ifrm_url);        
      }

      for(var prop in opts.style) {
        iframe.style[prop] = opts.style[prop];
      }

      return iframe;
    },

    proxy: function(options, success, error) {
      var 
        opts = options || {},
        cbid = this.getCallbackId(),
        params = extend((opts.data||{}),{callback: cbid, origin: this.getOrigin()}),
        url = opts.url + (opts.url.indexOf('?')>-1 ? '&' : '?') + serialize(params);

      // callback after redirect
      this.callbacks[cbid] = function(message, data) {
        if(data.error && error) {error(data);}        
        if(success) success(message, data);
        delete PocketChange.Request.callbacks[cbid];
      };

      this.hidden({
        url   : opts.proxy_url,
        data  : extend({url: url, method: opts.method}, (opts.proxy_data || {}))
      });
    },

    // Creates and inserts a hidden iframe with the given url then removes 
    // the iframe from the DOM
    hidden:function(options, success, error) {
      var 
        iframe,
        opts = options || {},

        cb = function(message, data) {
          if(success) success(message, data);
          iframe.parentNode.removeChild(iframe);        
        };

      opts.style = opts.style || {};
      opts.style = extend(opts.style, {display:'none', height:0, width:0});

      iframe = this.iframe(opts, cb, error);
    },
    
    // Make sure we're listening to the onMessage event
    registerXDHandler:function() {
      if(this._xdregistered) return;
      if(window.addEventListener) {
        window.addEventListener('message', bind(this.onMessage,this), false);
      } else {
        window.attachEvent('onmessage', bind(this.onMessage,this));
      }
      this._xdregistered = true;
    },
    
    // Handles message events sent via postMessage, and fires the 
    // appropriate callback 
    onMessage:function(e) {
      var data = {};
      if (e.data && typeof e.data === 'string') {
        data = deserialize(e.data);
      }

      if(data.callback) {
        var cb = this.callbacks[data.callback];
        if(cb) {
          var message = (data.message && data.message.match(/\=/g)) ? deserialize(data.message) : data.message;
          cb(message, data);
          delete this.callbacks[data.callback];
        }
      }
    },

    getCallbackId: function(){
      return 'pc' + uuid();
    },

    // Get the origin of the page
    getOrigin: function() {
      return (window.location.protocol + '//' + window.location.host);
    }

  };



}).call(this, PocketChange);