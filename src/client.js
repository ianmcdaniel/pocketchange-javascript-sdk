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