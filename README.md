# Pocket Change Web SDK

To get started with the Pocket Change Web SDK, you'll need to first, add the library to your page.

```html
  <script src="https://d3gdixhk6awtg9.cloudfront.net/pocketchange-js-sdk.js"></script>
```

The best place to put this is at the bottom of your page, before the closing ```</body>``` tag to prohibit blocking parallel downloads.


## Initialize the SDK
Once Pocket Change is loaded, call ```PocketChange.initialize``` to initialize the SDK with your API Key. If you don't already have an API Key, you can get one from your account manager. 
This will allow you to start granting rewards to your users.

```html
  <script src="https://d3gdixhk6awtg9.cloudfront.net/pocketchange-js-sdk.js"></script>
  <script>
    PocketChange.initialize("YOUR_API_KEY");
  </script>
```

#### Optional Parameters
In addition to the api key, ```PocketChange.initialize()``` has a few optional parameters.

```html
  <script src="https://d3gdixhk6awtg9.cloudfront.net/pocketchange-js-sdk.js"></script>
  <script>
    PocketChange.initialize("YOUR_API_KEY", {
      testMode: false,         
      achievements: ["facebook:like", "twitter:follow"]
    });
  </script>
```

| Option        | Type          | Description  | Default |
| ------------- |:------------- |:------------ |:------- |
| ```testMode``` | Boolean | Specifies whether or not to send requests to our testing environment | ```false``` |
| ```achievements``` | Array | A list of social achievements users can be eligible for *(see below)* | ```null``` |



## Achievements

Achievements are rewards you can grant your users for doing certain actions on your site like following you on twitter or liking you on facebook. 
**Each achievement must be explicitly set.** 

```html
  <script src="https://d3gdixhk6awtg9.cloudfront.net/pocketchange-js-sdk.js"></script>
  <script>
    PocketChange.initialize("YOUR_API_KEY", {    
      achievements: [
        "facebook:like",     // grants reward when user presses a fb like button
        "facebook:comment",  // grants reward when user posts a facebook comment
        "twitter:follow"     // grants reward when user presses twitter follow button
      ]
    });
  </script>
```

Currently there are **4** achievments you can grant rewards for:

| Achevement Name | Description |
| ------------- |:------------- |
| ```facebook:like``` | grants reward when user clicks a facebook "Like" button |
| ```facebook:comment``` | grants reward when user makes a comment in a facebook comments widget |
| ```twitter:follow``` | grants reward when user clicks a twitter "Follow" button |
| ```twitter:post``` | grants reward when user posts a tweet using a "Tweet" button |


## Granting Custom Rewards

In order to reward users based on events specific to your application, you must provide your sales representative with a listing of events. 
Once your representative has configured the events, you can start testing the related functionality in your application.

As soon as an event occurs, call the following method:

```javascript
  PocketChange.grantReward("YOUR_EVENT_ID");
```
This informs the SDK that the event occurred and the appropriate reward will be granted. 
**Until your application goes live with events, this method will only have an effect in test mode.**




## Opening the store

Some apps may want to give users the ability to open the shop at any time without having to wait for a reward to display. ```PocketChange.openShop()``` will open a popup window to the store.

**Note:** *Because calling this method opens a popup window, it should only be called on a user action like a click on a button or link, 
as most browsers will block the popup unless they are the result of a user initiated event.*

```html
<button onclick="PocketChange.openShop()">
  Open the Pocket Change Store
</button>
```

There is artwork available for buttons to open the Pocket Change Store [here](https://raw.github.com/pocketchange/pocketchange-ios-sdk/master/docs/images/button_artwork.png).





