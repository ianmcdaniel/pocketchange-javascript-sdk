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