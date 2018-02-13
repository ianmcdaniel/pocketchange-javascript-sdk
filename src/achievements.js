
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
