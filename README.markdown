## About
This object wraps the HTML 5 localStorage engine to provide a simple, yet powerful and versatile interface to client-side persistent storage using get and set methods. It also provides a native fallback storage engine to cookies if localStorage has not been implemented in the end-user's browser.

In addition to providing the simple string storage and retrieval built into localStorage, it extends this (with the help of JSON2.js from Douglas Crockford) by allowing:
* Automatic serialization/deserialization of objects and arrays
* Setup is automatic, it uses what the browser is capable of (though you can force it to use an engine)
* Checks for support with the jsper.supported() method
* Removal of an individual array element or object attribute
* Iterators
* Overloaded methods
	
localStorage has pretty wide support from modern browsers, but will fallback to cookies in older browsers.

### Browser Support
jsper has been unit tested in IE6,7,8/Firefox 2,3,4/Chrome/Safari

## Examples
More available at the wiki: http://github.com/rmcvey/jsper/wiki/

### Getting and Setting
```js
jsper.set('foo', {bar:'baz',boz:{bez:'biz'}});
//jsper.get returns the type of object you gave it; in this case, an object
var my_object = jsper.get('foo');

jsper.set('arr', ['a', 'b', 'c', 'd']);
// returns an array
var my_array = jsper.get('arr');
```

### Iterating
```js
// set an array in storage
jsper.set('an_array', ['This', 'is', 'pretty', 'cool']);

var message = "";

// perform iteration, data is the stored value and index is numerical index
jsper.each('an_array', function(data, index){
   message += " "+data;
});

console.log(message);//outputs: "This is pretty cool"
```

### Overloaded Methods
```js
var multiple_keys = {
   first:['a', 'b', 'c'],
   second:['d','e','f']
};

//set multiple keys at the same time
jsper.set(multiple_keys);

console.log(jsper.get('first'));//returns: array [a, b, c]

var first_and_second = jsper.get(['first','second']);
// or 
jsper.each(['first'. 'second'], function(data, index){
   console.log(" %s", data);//output: a b c d e f
});
```