
// documentation on writing tests here: http://docs.jquery.com/QUnit
// example tests: https://github.com/jquery/qunit/blob/master/test/same.js

// below are some general tests but feel free to delete them.

//module("PocketChange");

var 
  request       = PocketChange.Request, 
  last_request  = {},
  log_request   = function(type, options, success, error) {
    last_request = {
      type    : type,
      options : options,
      success : success,
      error   : error
    }
  };


QUnit.testStart(function() {

  // Capture all requests
  PocketChange.Request.popup = function(options, success, error) {
    log_request('popup', options, success, error)
  }       

  PocketChange.Request.iframe = function(options, success, error) {
    log_request('iframe', options, success, error)
  }
});

QUnit.testDone(function() {
  PocketChange.Request.popup = request.popup;
  PocketChange.Request.iframe = request.iframe;
});

module("Core");

test("sdk exists",function(){
  expect(1);
  ok(!!PocketChange);
})


test("initializes sdk",function(){
  expect(2);
  ok(!PocketChange.isInitialized());
  PocketChange.initialize('12345');
  ok(PocketChange.isInitialized());
})

test("grant a reward",function(){
  expect(6);
  PocketChange.grantReward("test");
  ok(last_request.type == 'iframe');
  ok(last_request.options.url == "http://pocketchange.com/api_proxy");
  ok(last_request.options.data.method == "post");
  ok(last_request.options.data.url.match("api_key=12345"));
  ok(last_request.options.data.url.match("type=pc"));
  ok(last_request.options.data.url.match("rewards="+encodeURIComponent("{\"test\":1}")));
});

test("grant rewards",function(){
  expect(6);
  PocketChange.grantReward('test', 5);
  ok(last_request.type == 'iframe');
  ok(last_request.options.url == "http://pocketchange.com/api_proxy");
  ok(last_request.options.data.method == "post");
  ok(last_request.options.data.url.match("api_key=12345"));
  ok(last_request.options.data.url.match("type=pc"));
  ok(last_request.options.data.url.match("rewards="+encodeURIComponent("{\"test\":5}")));
});

test("open shop", function(){
  expect(4);
  PocketChange.openShop();
  ok(last_request.type == 'popup');
  ok(last_request.options.url == "http://pocketchange.com/store");
  ok(last_request.options.height > 0);
  ok(last_request.options.width > 0);
});


module( "Achievements");

test("define platform achievements", function(){
  expect(1);
  PocketChange.Achievements.define('test', {});
  ok(!!PocketChange.Achievements.platforms['test']);
})

test("register platform achievements", function(){
  expect(3);
  PocketChange.Achievements.define('test2', {
    initialize: function() {
      ok(true,'initialized')
      this.doReadyCheck();
    },

    isReady: function() {
      ok(true, 'ready')
      return true;
    },

    onReady: function(){
      ok(true, 'onready fired')
    }
  });
  PocketChange.Achievements.register(['test2']);
})

test("trigger platform achievements event", function(){
  expect(1);
  PocketChange.Achievements.define('test3', {
    initialize: function() {
      this.onReady();
    },
    onReady: function(){
      if(this.listeningFor('one')) {
        this.triggerAchievement('test3-one');
      }
      if(this.listeningFor('two')) {
        this.triggerAchievement('test3-two');
      }
    }
  });
  PocketChange.Achievements.register(['test3:one']);
  ok(last_request.options.data.url.match("rewards="+encodeURIComponent("{\"test3-one\":1}")));
})


module( "Facebook");
  
window.FB = {
  Event: PocketChange.Events 
}
FB.Event.subscribe = FB.Event.on;
PocketChange.Achievements.register(['facebook:*']);


test("like", function(){
  expect(1);
  FB.Event.trigger('edge.create');
  ok(last_request.options.data.url.match("rewards="+encodeURIComponent("{\"facebook-like\":1}")));
});

test("comment", function(){
  expect(1);
  FB.Event.trigger('comment.create');
  ok(last_request.options.data.url.match("rewards="+encodeURIComponent("{\"facebook-comment\":1}")));
});



module( "Twitter");

window.twttr = {
  ready   : function(fn){fn(twttr)},
  events  : PocketChange.Events
};
twttr.events.bind = twttr.events.on;
PocketChange.Achievements.register(['twitter:*']);


test("tweet", function(){
  expect(1);
  twttr.events.trigger('tweet');
  ok(last_request.options.data.url.match("rewards="+encodeURIComponent("{\"twitter-post\":1}")));
})

test("follow", function(){
  expect(1);
  twttr.events.trigger('follow');
  ok(last_request.options.data.url.match("rewards="+encodeURIComponent("{\"twitter-follow\":1}")));
})



