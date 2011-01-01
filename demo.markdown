jsper is a native implementation of HTML5 storage (localStorage and sessionStorage) that degrades quite gracefully all the way back to IE6 by using cookies. This is not a milestone, others have done this. What I've done differently is:

* created a better api to access localStorage using simple get, set methods 
* provide automatic serialization/deserialization of storage items, i.e. what you put in is what you get back
* provide iterators
* all non-getter methods are chainable, and most methods are overloaded and accept callbacks
* i allow you to manually switch storage engines (if supported by the browser) and retrieve info about what engine is currently in use 

### Browser Support
jsper has been unit tested in IE6,7,8/Firefox 2,3,4/Chrome/Safari

### Getting started and Notes
This is the entirety of the setup process:
```html
<script type="text/javascript" src="/path/to/jsper.js"></script>
<!-- alternatively, you can use the query plugin version -->
```
Note: if you are using the jquery plugin version, replace jsper.*method* with $.jsper.*method* (or jQuery.jsper.*method* if you prefer)

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