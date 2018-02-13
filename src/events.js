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