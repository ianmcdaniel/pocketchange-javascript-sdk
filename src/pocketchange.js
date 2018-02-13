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