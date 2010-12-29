/**
*	Global db object wraps localStorage
*
*	Check for support: returns true of false
*		jsdb.supported()
*	Set the value for a key in local storage: no return value
*		jsdb.set(key [string], value [any data type])
*			- jsdb.set('foo', {a:'bar',b:{c:'baz'}});
*			- jsdb.set('foo', 'bar');
*			- jsdb.set('foo', ['a','b','c']);
*	
*	Retrieve data stored in a key: returns stored item in original state, null if not found
*		jsdb.get(key [string])
*			- jsdb.get('foo');
*
*	Remove an entire key: no return value
*		jsdb.remove(key [string]);
*
*	Remove an item from a stored array or object: no return value
*		jsdb.remove_item(key [string], index [integer|string]);
*			- jsdb.set('foo', ['a','b','c']);
*   		  jsdb.remove_item('foo', 1);
*   		  jsdb.get('foo');
*   		  //returns ['a','c']
*   		
*			- jsdb.set('foo', {a:'bar',b:{c:'baz'}});
*   		  jsdb.remove_item('foo', 'a');
*   		  jsdb.get('foo');
*   		  //returns {b:{c:'baz'}}
*
*	Remove entire contents of storage: no return value
*		jsdb.clear()
*/
var jsdb = (function(){
	var JSON = {};
	(function () {
	    "use strict";

	    function f(n) {
	        return n < 10 ? '0' + n : n;
	    }

	    if (typeof Date.prototype.toJSON !== 'function') {

	        Date.prototype.toJSON = function (key) {

	            return isFinite(this.valueOf()) ?
	                   this.getUTCFullYear()   + '-' +
	                 f(this.getUTCMonth() + 1) + '-' +
	                 f(this.getUTCDate())      + 'T' +
	                 f(this.getUTCHours())     + ':' +
	                 f(this.getUTCMinutes())   + ':' +
	                 f(this.getUTCSeconds())   + 'Z' : null;
	        };

	        String.prototype.toJSON =
	        Number.prototype.toJSON =
	        Boolean.prototype.toJSON = function (key) {
	            return this.valueOf();
	        };
	    }

	    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
	        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
	        gap,
	        indent,
	        meta = {    
	            '\b': '\\b',
	            '\t': '\\t',
	            '\n': '\\n',
	            '\f': '\\f',
	            '\r': '\\r',
	            '"' : '\\"',
	            '\\': '\\\\'
	        },
	        rep;

	    function quote(string) {
	        escapable.lastIndex = 0;
	        return escapable.test(string) ?
	            '"' + string.replace(escapable, function (a) {
	                var c = meta[a];
	                return typeof c === 'string' ? c :
	                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
	            }) + '"' :
	            '"' + string + '"';
	    }

	    function str(key, holder) {
	        var i,          
	            k,          
	            v,          
	            length,
	            mind = gap,
	            partial,
	            value = holder[key];

	        if (value && typeof value === 'object' &&
	                typeof value.toJSON === 'function') {
	            value = value.toJSON(key);
	        }

	        if (typeof rep === 'function') {
	            value = rep.call(holder, key, value);
	        }

	        switch (typeof value) {
	        case 'string':
	            return quote(value);

	        case 'number':
	            return isFinite(value) ? String(value) : 'null';

	        case 'boolean':
	        case 'null':
	            return String(value);

	        case 'object':

	            if (!value) {
	                return 'null';
	            }
	            gap += indent;
	            partial = [];

	            if (Object.prototype.toString.apply(value) === '[object Array]') {
	                length = value.length;
	                for (i = 0; i < length; i += 1) {
	                    partial[i] = str(i, value) || 'null';
	                }

	                v = partial.length === 0 ? '[]' :
	                    gap ? '[\n' + gap +
	                            partial.join(',\n' + gap) + '\n' +
	                                mind + ']' :
	                          '[' + partial.join(',') + ']';
	                gap = mind;
	                return v;
	            }
	            if (rep && typeof rep === 'object') {
	                length = rep.length;
	                for (i = 0; i < length; i += 1) {
	                    k = rep[i];
	                    if (typeof k === 'string') {
	                        v = str(k, value);
	                        if (v) {
	                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
	                        }
	                    }
	                }
	            } else {
	                for (k in value) {
	                    if (Object.hasOwnProperty.call(value, k)) {
	                        v = str(k, value);
	                        if (v) {
	                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
	                        }
	                    }
	                }
	            }

	            v = partial.length === 0 ? '{}' :
	                gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
	                        mind + '}' : '{' + partial.join(',') + '}';
	            gap = mind;
	            return v;
	        }
	    }

	    if (typeof JSON.stringify !== 'function') {
	        JSON.stringify = function (value, replacer, space) {

	            var i;
	            gap = '';
	            indent = '';

	            if (typeof space === 'number') {
	                for (i = 0; i < space; i += 1) {
	                    indent += ' ';
	                }

	            } else if (typeof space === 'string') {
	                indent = space;
	            }

	            rep = replacer;
	            if (replacer && typeof replacer !== 'function' &&
	                    (typeof replacer !== 'object' ||
	                     typeof replacer.length !== 'number')) {
	                throw new Error('JSON.stringify');
	            }

	            return str('', {'': value});
	        };
	    }

	    if (typeof JSON.parse !== 'function') {
	        JSON.parse = function (text, reviver) {
	            var j;

	            function walk(holder, key) {

	                var k, v, value = holder[key];
	                if (value && typeof value === 'object') {
	                    for (k in value) {
	                        if (Object.hasOwnProperty.call(value, k)) {
	                            v = walk(value, k);
	                            if (v !== undefined) {
	                                value[k] = v;
	                            } else {
	                                delete value[k];
	                            }
	                        }
	                    }
	                }
	                return reviver.call(holder, key, value);
	            }

	            text = String(text);
	            cx.lastIndex = 0;
	            if (cx.test(text)) {
	                text = text.replace(cx, function (a) {
	                    return '\\u' +
	                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
	                });
	            }

	            if (/^[\],:{}\s]*$/
	.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
	.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
	.replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
	                j = eval('(' + text + ')');
	                return typeof reviver === 'function' ?
	                    walk({'': j}, '') : j;
	            }
	            throw new SyntaxError('JSON.parse');
	        };
	    }
	}());
	
	var _cookieStorage = (function(){
		var Cookie = (function(){
			return {
				set:function(name,value) {
					var expires = "";
					document.cookie = name+"="+value+expires+"; path=/";
				},

			  	get:function(name) {
					var nameEQ = name + "=";
					var ca = document.cookie.split(';');
					for(var i=0;i < ca.length;i++) {
						var c = ca[i];
						while (c.charAt(0)==' ') {
							c = c.substring(1, c.length);
						} 
						if (c.indexOf(nameEQ) == 0) {
							return c.substring(nameEQ.length,c.length);
						}
					}
					return null;
				},
				remove:function(name) {
					set(name,"",-1);
				}
			};
		})();
		return {
			setItem:function( key, val ) {
				return Cookie.set( key, val );
			},
			getItem:function( key ) {
				return Cookie.get( key );
			},
			removeItem:function( key ) {
				return Cookie.remove( key );
			}
		};
	})();

	/**
	*	@todo According to some, I should explore the ie userdata model to add another fallback layer for persistent storage,
	*		I don't feel like messing with IE today...
	*/
	var _userdataStorage = (function(){
		var UserData = (function(){
			// private getters and setters for userdata
		})();
		return {
			// return unified API to userdata getItem, setItem, removeItem
		};
	})();
	
	return {
		storage:localStorage,
		storage_engine:'localStorage',
		support:false,
		force_engine:function(eng){
			switch(eng){
				case "localStorage":
					this.storage_engine = "localStorage";
					this.storage = localStorage;
					break;
				case 'cookie':
					this.storage_engine = "cookie";
					this.storage = _cookieStorage;
					break;
				default:
					this.storage_engine = "cookie";
					this.storage = _cookieStorage;
					break;
			}
			return this.storage_engine;
		},
		supported:function() {
			this.support = ( localStorage !== "undefined" );
			if(!this.support){
				this.storage_engine = "cookie";
				this.storage = _cookieStorage;
			}
			console.log(this.storage);
			return this.support;
		},
		set:function( key, val ) {
			var stringified = JSON.stringify( val );
			this.storage.setItem( key, stringified );
		},
		raw_value:function( key ) {
			return this.storage.getItem( key );
		},
		get:function( key ) {
			return JSON.parse(
				this.raw_value( key )
			);
		},
		remove:function( key ) {
			this.storage.removeItem( key );
		},
		remove_item:function( key, ind ) {
			var temp_o = this.get( key );
			var is_object = false;
			if (( typeof temp_o === "object" ) && ( typeof temp_o.splice !== "function" )) {
				is_object = true;
			}	
			if ( typeof temp_o.splice === "function" ) {
				temp_o.splice( ind, 1 );
			} else if ( is_object ) {
				delete temp_o[ ind ];
			} else {
				this.remove( key )
			}
			//reset the new object to the db key
			this.set( key, temp_o );
		},
		clear:function(){
			this.storage.clear();
		}
	};
})();


