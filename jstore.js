/**
*	Global db object wraps localStorage
*
*	Check for support: returns true of false
*		jstore.supported()
*	Set the value for a key in local storage: no return value
*		jstore.set(key [string], value [any data type])
*			- jstore.set('foo', {a:'bar',b:{c:'baz'}});
*			- jstore.set('foo', 'bar');
*			- jstore.set('foo', ['a','b','c']);
*
*	Retrieve data stored in a key: returns stored item in original state, null if not found
*		jstore.get(key [string])
*			- jstore.get('foo');
*
*	Remove an entire key: no return value
*		jstore.remove(key [string]);
*
*	Remove an item from a stored array or object: no return value
*		jstore.remove_item(key [string], index [integer|string]);
*			- jstore.set('foo', ['a','b','c']);
*   		  jstore.remove_item('foo', 1);
*   		  jstore.get('foo');
*   		  //returns ['a','c']
*
*			- jstore.set('foo', {a:'bar',b:{c:'baz'}});
*   		  jstore.remove_item('foo', 'a');
*   		  jstore.get('foo');
*   		  //returns {b:{c:'baz'}}
*
*	Remove entire contents of storage: no return value
*		jstore.clear()
*/
var jstore = (function(){
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
				set:function(name,value,session_only) {
					var expires;
					if (session_only === true) {
						expires = "";
					} else if(session_only === 'remove') {
						var date = new Date();
						date.setTime(date.getTime()+(-1*24*60*60*1000));
						expires = "; expires="+date.toGMTString();
					} else {
						var date = new Date();
						date.setDate( date.getYear()+8, date.getMonth(), date.getDate() );
						expires = "; expires="+date.toGMTString();
					}
					document.cookie = name+"="+value+expires+"; path=/";
				},
				destroy:function(name){
					var date = new Date();
					date.setTime(date.getTime()+(-1*24*60*60*1000));
					expires = "; expires="+date.toGMTString();
					document.cookie = name+"="+""+expires+"; path=/";
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
					set(name,"");
				},
				clear:function() {
					var all = document.cookie.split('; ');
					var len = all.length;
					for( var i = 0 ; i < len; i++) {
						destroy(
							all[i].split('=')[0].replace(/[\s]*/g,'')
						);
					}
				}
			};
		})();
		return {
			setItem:function( key, val, session_lifetime ) {
				return Cookie.set( key, val, session_lifetime );
			},
			getItem:function( key ) {
				return Cookie.get( key );
			},
			removeItem:function( key ) {
				return Cookie.remove( key );
			},
			clear:function() {
				return Cookie.clear();
			},
			length:document.cookie.split(';').length
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

        var _is_object = function( o ){
            return typeof o === "object" && typeof o.splice !== "function";
        };

        var _is_array = function( o ){
            return typeof o === "object" && typeof o.splice === "function";
        };

        var callable = function( fn ){
            return typeof fn === "function";
        };
        
	return {
		// setup defaults
		engines:['localStorage', 'cookie', 'sessionStorage'],
		storage:localStorage,
		storage_engine:'localStorage',
		support:false,
		init:function(){
			this.supported();
		},
		force_engine:function(eng){
			switch(eng){
				case "localStorage":
					this.storage_engine = "localStorage";
					this.storage = localStorage;
					break;
				case "sessionStorage":
					this.storage_engine = "sessionStorage";
					this.storage = sessionStorage;
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
			// call this to fallback if new engine is not supported
			this.supported();
			return this;
		},
		supported:function() {
			this.support = ( this.storage !== "undefined" );
			if(!this.support){
				this.storage_engine = "cookie";
				this.storage = _cookieStorage;
			}
			return this.support;
		},
		set:function( key, val, session_lifetime ) {
			session_lifetime = (typeof session_lifetime === "undefined") ? false : true;
			var stringified = JSON.stringify( val );
			if(session_lifetime && this.storage_engine !== "sessionStorage"){
				var previous = this.storage_engine;
				this.force_engine( 'sessionStorage' );
				this.storage.setItem( key, stringified, session_lifetime );
				this.force_engine( previous );
			} else {
				this.storage.setItem( key, stringified );
			}
			return this;
		},
                each:function( key, fn ){
                        var that = this;
                        var items = this.get( key );
                        if(callable(fn)) {
                            if(_is_array(items)){
                                for(var i = 0; i < items.length; i++){
                                    items[i] = fn.call(that, items[i], i);
                                }
                            } else if (_is_object(items)) {
                                for(var i in items){
                                    items[i] = fn.call(that, items[i], i);
                                }
                            }
                        }
                        return this;
                },
		raw_value:function( key ) {
			return this.storage.getItem( key );
		},
		get:function( key , callback, context ) {
			var parsed_data = JSON.parse(
				this.raw_value( key )
			);
			if( parsed_data === null ) {
				var x = 0, original_engine = this.storage_engine;
				while( parsed_data === null && x < this.engines.length ) {
					this.force_engine( this.engines[x] );
					parsed_data = JSON.parse(
						this.raw_value( key )
					);
					x++;
				}
				this.force_engine( original_engine );
			}
			if( !parsed_data ) {
				this.error( "No value found for key: " + key );
				return null;
			}
			if( callable( callback ) ) {
				return callback.call( this, parsed_data );
			} else {
				return parsed_data;
			}
		},
		get_all:function(){
			var collection = [];
			for( var i = 0; i < this.storage.length; i++ ){
				collection[i] = this.storage[i];
			}
			return collection;
		},
		error:function( msg ) {},
		remove:function( key ) {
			this.storage.removeItem( key );
			return this;
		},
		remove_item:function( key, ind, fn, context ) {
			var temp_o = this.get( key );

			if ( _is_array( temp_o ) ) {
				temp_o.splice( ind, 1 );
			} else if ( _is_object( temp_o ) ) {
				delete temp_o[ ind ];
			} else {
				this.remove( key )
			}
			//reset the new object to the db key
			this.set( key, temp_o );

                        if( callable( fn ) ){
                            context = context || this;
                            fn.call(context);
                        }
			return this;
		},
		clear:function(){
			this.storage.clear();
			if(typeof this.storage.length === "function" && this.storage.length === 0) {
				return true;
			} else {
				return false;
			}
		},
		size:function(){
			return this.storage.length;
		}
	};
})();