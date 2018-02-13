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


