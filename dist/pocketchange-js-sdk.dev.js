//  PocketChange JavaScript SDK
//  Copyright 2013, Ian McDaniel, PocketChange Inc.
//  For all api documentation:
//  http://pocketchange.com/documentation

(function(){

  "use strict";

  // Main object for interacting with the Pocket Change SDK.
  this.PocketChange = function(){

    function PocketChange() {
      return PocketChange;
    }

    PocketChange.version = '0.1.5';

    // Initializes the Pocket Change SDK. 
    // @param apiKey a Pocket Change API Key
    // @param testMode if true, points the SDK to the Pocket Change sandbox
    // server and enables debugging output.
    PocketChange.initialize = function(apiKey, options){
      if(!apiKey) throw new Error('Pocket Change Javascript SDK requires an API Key');

      this.client = new PocketChange.Client(apiKey, options);
      return this;
    };

    // Returns the SDK's initialization state
    // @return true if the SDK has been initialized, false otherwise
    PocketChange.isInitialized = function() {
      return !!this.client;
    };
    
    // Grant the user a reward
    // @param rewardId the ID for the reward type granted
    // @param amount number of rewards granted
    PocketChange.grantReward = function(rewardId, amount) {
      this.client.grantReward(rewardId, amount);
    };

    // Launches the Pocket Change shop in a new window.
    PocketChange.openShop = function() {
      this.client.openShop();
    };
    

    return PocketChange;

  }.call(this);

}).call(this);
//  PocketChange JavaScript SDK
//  Copyright 2012, Ian McDaniel, PocketChange Inc.
//  For all api documentation:
//  http://pocketchange.com/documentation

(function(PocketChange){

  PocketChange.Util = {

    // Extend an object with all the properties of another object
    extend: function(destination, source) {
      for (var property in source) {
        destination[property] = source[property];
      }
      return destination;
    },

    bind: function(fn, context){ 
      return function(){ 
        return fn.apply(context, arguments); 
      }; 
    },

    // object to query string
    serialize:function(obj){
      var str = [];
      for(var p in obj) str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
      return str.join("&");
    },

    // query string to object
    deserialize:function(qs){
      var
        obj = {},
        segments = qs.split('&'),
        kv;
      for (var i=0; i<segments.length; i++) {
        kv = segments[i].split('=', 2);
        if (kv && kv[0]) {
          obj[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1]);
        }
      }
      return obj;
    },

    // unique id
    uuid: function() {
      return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    },

    // ie doesnt support Array.indexOf :(
    indexOf: function(arr, subject) {
      for(var i=0; i<arr.length; i++) {
        if(arr[i] === subject) {
          return i;
        } else {
          return -1;
        }
      }                       
    },

    storage: function(key, value) {
      try {
        if(value) {
          localStorage.setItem(key, value);  
          return true;
        }
        return localStorage.getItem(key);
      } catch(e) {
        return false;
      }
    }
  
  };


}).call(this, PocketChange);
//  PocketChange JavaScript SDK
//  Copyright 2013, Ian McDaniel, PocketChange Inc.
//  For all api documentation:
//  http://pocketchange.com/documentation

(function(PocketChange){

  var 
    extend = PocketChange.Util.extend,
    indexOf = PocketChange.Util.indexOf;

  PocketChange.Events = {

    // Bind an event, specified by a string name, to a 'callback' function
    on: function(event, handler){
      this.events = this.events || {};
      this.events[event] = this.events[event] || [];
      this.events[event].push(handler);
    },

    // Remove an event handler that was attached with 'on'
    // If a handler is not specified, all handlers will be removed
    off: function(event, handler){
      this.events = this.events || {};
      if(event in this.events === false)  return;
      if(handler) {
        this.events[event].splice(indexOf(this.events[event], handler), 1);
      } else {
        this.events[event] = [];
      }
    },
    
    // Trigger the event. The first argument is the name of the event,
    // other arguments will be passed to the handler\
    trigger: function(event){
      this.events = this.events || {};
      if(event in this.events === false)  return;
      for(var i = 0; i < this.events[event].length; i++){
        this.events[event][i].apply(this, Array.prototype.slice.call(arguments, 1));
      }
    }
  
  };

  // Add to PocketChange namespace
  extend(PocketChange, PocketChange.Events);


}).call(this, PocketChange);

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

//  PocketChange JavaScript SDK
//  Copyright 2013, Ian McDaniel, PocketChange Inc.
//  For all api documentation:
//  http://pocketchange.com/documentation

(function(PocketChange){

  var
    extend  = PocketChange.Util.extend,
    bind    = PocketChange.Util.bind,
    indexOf = PocketChange.Util.indexOf;

  // Achievements base class
  PocketChange.Achievements = function(reward_types) {    
    this.rewardTypes = reward_types || [];
  };

  PocketChange.Achievements.prototype = {
    ready: false,
    timeout: 20, //seconds

    initialize: function() {
      // should be overwritten
    },

    doReadyCheck: function(){
      var 
        time = 0,
        frequency = 100;

      var check = bind(function() {
          time = time+frequency;
          if(this.ready) {
            return;
          } else if(this.isReady()) {
            this.onReady();
            this.ready = true;
          } else if (time < this.timeout * 1000){
            setTimeout(check, frequency);
            return;
          }
        }, this);

      check();
    },

    isReady: function() {
      // should be overwritten
    },

    onReady: function(){
      // should be overwritten
    },

    listeningFor: function(evt) {
      return (indexOf(this.rewardTypes, evt) != -1 || indexOf(this.rewardTypes, '*') != -1);
    },

    triggerAchievement: function(name){
      PocketChange.Achievements.trigger('achievement',name);
    }

  };

  PocketChange.Achievements.platforms = {};

  // defines listeners on achievements for a specific platform
  PocketChange.Achievements.define = function(name, methods){
    methods = methods || {};

    // constructor
    this.platforms[name] = function(){
      PocketChange.Achievements.apply(this, arguments);
      this.initialize.apply(this, arguments);
    };
    // protoype inheritance
    this.platforms[name].prototype = new PocketChange.Achievements();
    this.platforms[name].prototype.constructor = this.platforms[name];

    // new prototype methods
    extend(this.platforms[name].prototype, methods);      
  };


  PocketChange.Achievements.register = function(rewards) {
    
    if(!rewards) return;
    var 
      i,
      l = rewards.length,
      pltfrms = {};
      
    for(i=0;i<l;i++) {
      var kv = rewards[i].split(':');
      pltfrms[kv[0]] = pltfrms[kv[0]] || [];
      pltfrms[kv[0]].push(kv[1] || "*");
    }

    for(var p in pltfrms) {
      if(this.platforms[p]) new this.platforms[p](pltfrms[p]);
    }
  };


  extend(PocketChange.Achievements, PocketChange.Events);

}).call(this, PocketChange);

//  PocketChange JavaScript SDK
//  Copyright 2013, Ian McDaniel, PocketChange Inc.
//  For all api documentation:
//  http://pocketchange.com/documentation

(function(PocketChange){

  var
    util        = PocketChange.Util,
    extend      = util.extend,
    bind        = util.bind,
    storage     = util.storage,
    request     = PocketChange.Request,

    STORE_WIDTH   = 500,
    STORE_HEIGHT  = 700;

  PocketChange.Client = function(apiKey, options) {

    // There can be only one
    if (arguments.callee._instance) {
      return arguments.callee._instance;
    }
    arguments.callee._instance = this;

    this.options  = options || {};
    this.apiKey   = apiKey;

    // check for device key
    this.device_user_key = storage('pc_dk');

    // listen for achievements
    this.achievements = PocketChange.Achievements;
    this.achievements.on('achievement', bind(this.grantReward, this));
    if(this.options.achievements) {
      this.achievements.register(this.options.achievements);
    }
    
    // grant daily reward
    this.grantDaily();    
  };

  PocketChange.Client.prototype = {

    apiVersion: 2,
    
    serverURL: {
      production  :'http://pocketchange.com',
      sandbox     :'http://sandbox.pocketchange.com'
    },

    grantReward: function(name, amount, callback) {
      var params = this.getApiParameters();
      params.rewards = '{"'+name+'":'+(amount || 1).toString()+'}';

      var pdata = this.device_user_key ? {'device_user_key': this.device_user_key} : {};
      
      request.proxy({
        proxy_url: this.getPath('/api_proxy'),
        proxy_data: pdata,
        method  : 'post',
        url     : this.getApiPath('/rewards'),
        data    : params
      }, 

      // on success
      bind(function(message, data){
        this.setDeviceUserKey(data.deviceUserKey);
        this.displayReward(message);
        if(callback) callback(message);
      }, this),
      
      // on error
      function(){
        // something went wrong
      });
    },

    setDeviceUserKey: function(key) {
      if(!key) return;
      this.device_user_key = key || null;
      storage('pc_dk', this.device_user_key);
    },

    grantDaily: function() {
      var 
        last_attempt = storage('pc_la') || 0,
        now          = (new Date()).getTime(),
        expires_in   = (1000 * 60 * 60 * 24); // 24 hours
      
      if(now > (parseInt(last_attempt, 10) + expires_in)) {
        this.grantReward('daily');
      }
    },

    displayReward: function(data){
      var has_reward = (data && data.dialog_url);
      if(has_reward) {
        
        // set last attempt if daily reward or opt in dialog
        if(data["rewards[daily]"] == "ok" || data.optIn == 1) {
          storage('pc_la', (new Date()).getTime());
        }

        if(this.rewardView) {
          this.rewardView.close();
          this.rewardView = null;
        }
        this.rewardView = new PocketChange.RewardView(data);
        this.rewardView.open();
      }
    },

    openShop: function(){
      var env = (this.options.testMode) ? 'sandbox' : 'production';
      request.popup({
        name    : 'store_window',
        data    : this.getApiParameters(),
        url     : this.getPath('/store'),
        width   : STORE_WIDTH,
        height  : STORE_HEIGHT
      });
    },

    getPath: function(path) {
      var
        env = (this.options.testMode) ? 'sandbox' : 'production',
        url = this.options.host || this.serverURL[env];

      return url + "/" + path.replace(/^\//,'');
    },

    getApiPath: function(path) {
      return this.getPath("/v" + this.apiVersion + "/" + path.replace(/^\//,''));
    },

    getApiParameters: function() {
      var params = {
        'api_key' : this.apiKey,
        'type'    : 'pc'
      };
      return params;
    }
  
  };

  extend(PocketChange.Client.prototype, PocketChange.Events);


}).call(this, PocketChange);
//  PocketChange JavaScript SDK
//  Copyright 2013, Ian McDaniel, PocketChange Inc.
//  For all api documentation:
//  http://pocketchange.com/documentation

(function(PocketChange){

  var bind = PocketChange.Util.bind;

  PocketChange.Achievements.define('facebook', {

    initialize: function() {
      this.doReadyCheck();
    },

    isReady: function() {
      return !!(window.FB && FB.Event && FB.Event.subscribe);
    },

    onReady: function(){
      this.captureLikes();
      this.captureComments();
    },

    captureLikes: function(){
      if(!this.listeningFor('like')) return;
      FB.Event.subscribe('edge.create', bind(function(href, widget) {
        this.triggerAchievement('facebook-like');
      },this));
    },

    captureComments: function(){
      if(!this.listeningFor('comment')) return;
      FB.Event.subscribe('comment.create', bind(function(href, widget) {
        this.triggerAchievement('facebook-comment');
      }, this));
    }

  });

}).call(this, PocketChange);
//  PocketChange JavaScript SDK
//  Copyright 2013, Ian McDaniel, PocketChange Inc.
//  For all api documentation:
//  http://pocketchange.com/documentation

(function(PocketChange){

  var bind = PocketChange.Util.bind;

  PocketChange.Achievements.define('twitter', {

    initialize: function() {
      this.doReadyCheck();
    },

    isReady: function() {
      return !!(window.twttr && twttr.ready && twttr.events && twttr.events.bind);
    },

    onReady: function(){
      this.captureTweets();
      this.captureFollows();
    },

    captureTweets: function() {
      if(!this.listeningFor('post')) return;
      twttr.ready(bind(function (twttr) {
        twttr.events.bind('tweet', bind(function (e) {
          this.triggerAchievement('twitter-post');
        }, this));
      }, this));
    },

    captureFollows: function() {
      if(!this.listeningFor('follow')) return;
      twttr.ready(bind(function (twttr) {
        twttr.events.bind('follow', bind(function (e) {
          this.triggerAchievement('twitter-follow');
        }, this));
      }, this));
    }

  });

}).call(this, PocketChange);


