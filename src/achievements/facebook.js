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