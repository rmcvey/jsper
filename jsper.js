/**
*	Global db object wraps localStorage
*
*	Check for support: returns true of false
*		jsper.supported()
*	Set the value for a key in local storage: no return value
*		jsper.set(key [string], value [any data type])
*			- jsper.set('foo', {a:'bar',b:{c:'baz'}});
*			- jsper.set('foo', 'bar');
*			- jsper.set('foo', ['a','b','c']);
*
*	Retrieve data stored in a key: returns stored item in original state, null if not found
*		jsper.get(key [string])
*			- jsper.get('foo');
*
*	Remove an entire key: no return value
*		jsper.remove(key [string]);
*
*	Remove an item from a stored array or object: no return value
*		jsper.remove_item(key [string], index [integer|string]);
*			- jsper.set('foo', ['a','b','c']);
*   		  jsper.remove_item('foo', 1);
*   		  jsper.get('foo');
*   		  //returns ['a','c']
*
*			- jsper.set('foo', {a:'bar',b:{c:'baz'}});
*   		  jsper.remove_item('foo', 'a');
*   		  jsper.get('foo');
*   		  //returns {b:{c:'baz'}}
*
*	Remove entire contents of storage: no return value
*		jsper.clear()
*/
var jsper = (function(){
	if(typeof JSON === "undefined"){
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
        }

        /**
         *  Internal cookie storage engine
         */
	var cookieStorage = (function(){
		var Cookie = (function(){
                        var _c_separator = "::", _prefix = "cookieStorage_";
			return {
                                index:0,
                                length_cookie:"length_cookieStorage",
                                load_all:function(){

                                },
				set:function(name,value,session_only) {
					var expires;
                                        var date = new Date();
					if (session_only === true) {
						expires = "";
					} else if(session_only === 'remove') {
						date.setTime(date.getTime()+(-1*24*60*60*1000));
						expires = "; expires="+date.toGMTString();
					} else {
						date.setDate( date.getYear()+8, date.getMonth(), date.getDate() );
						expires = "; expires="+date.toGMTString();
					}
					document.cookie = name+"="+value+expires+"; path=/;";
                                        if(value !== ""){
                                            ++this.index;
                                        } else {
                                            var index = name.match(/cookieStorage_([0-9]*)/)[1];
                                            --this.index;
                                            this._reset_keys(index);
                                        }
                                        document.cookie = this.length_cookie+'='+this.index+expires+"; path=/;";
				},
                                _by_numeric_key:function(index){

                                },
                                _reset_keys:function(index){
                                        var length = this.get( this.length_cookie );
                                        for( i = index; i < length; i++ ) {
                                            if( this.get(_prefix+i) === "" ) {
                                                if(i != length-1 && this.get(_prefix+(i+1))){
                                                    this.set(_prefix+i, this.get(_prefix+(i+1)));
                                                    this.set(_prefix+(i+1), "", -1);
                                                }
                                            }
                                        }
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
					this.set(name,"");
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
				return (Cookie.get( key ) !== "") ? Cookie.get( key ) : null;
			},
			removeItem:function( key ) {
				return Cookie.remove( key );
			},
			clear:function() {
				return Cookie.clear();
			},
                        key:function(index){
                                return Cookie.get("cookieStorage_"+index) || null;
                        },
			length:document.cookie.split(';').length
		};
	})();

        /**
         *  Helper methods
         */
        var _is_object = function( o ){
            return (o !== null && typeof o === "object" && typeof o.splice !== "function");
        };

        var _is_array = function( o ){
            return typeof o === "object" && typeof o.splice === "function";
        };

        var _is_callable = function( fn ){
            return typeof fn !== "undefined" && typeof fn === "function";
        };

        var supports = {
            html5_storage:function(){
                try {
                    return 'localStorage' in window && window['localStorage'] !== null;
                } catch (e) {
                    return false;
                }
            },
            html5_sessionStorage:function(){
                try {
                    return 'sessionStorage' in window && window['sessionStorage'] !== null;
                } catch (e) {
                    return false;
                }
            },
            cookies:function(){
                try{
                    return navigator.cookieEnabled;
                } catch (e) {
                    return false;
                }
            }
        };

        return {
		// setup defaults
		engines:['localStorage', 'cookie', 'sessionStorage'],
		storage:(supports.html5_storage()) ? localStorage : cookieStorage,
		storage_engine:'localStorage',
		support:false,
		init:function(){
			this.supported();
		},
		force_engine:function(eng){
			switch(eng){
				case "localStorage":
                                    if(supports.html5_storage()){
					this.storage_engine = "localStorage";
					this.storage = localStorage;
					break;
                                    }
				case "sessionStorage":
                                    if(supports.html5_sessionStorage()){
					this.storage_engine = "sessionStorage";
					this.storage = sessionStorage;
					break;
                                    }
				case 'cookie':
					this.storage_engine = "cookie";
					this.storage = cookieStorage;
					break;
				default:
					this.storage_engine = "cookie";
					this.storage = cookieStorage;
					break;
			}
			// call this to fallback if new engine is not supported
			this.supported();
			return this;
		},
		supported:function() {
			this.support = supports.html5_storage();
			if(!this.support){
                                if(supports.cookies){
                                    this.storage_engine = "cookie";
                                    this.storage = cookieStorage;
                                    this.support = true;
                                }
			}
			return this.support;
		},
		set:function( key, val, session_lifetime ) {
                        if( _is_object( key ) ) {
                            for( var item in key ) {
                                this.set(item, key[item]);
                            }
                        } else {
                            session_lifetime = (typeof session_lifetime !== "undefined");
                            var stringified = JSON.stringify( val );
                            if(session_lifetime && this.storage_engine !== "sessionStorage"){
                                    var previous = this.storage_engine;
                                    this.force_engine( 'sessionStorage' );
                                    this.storage.setItem( key, stringified, session_lifetime );
                                    this.force_engine( previous );
                            } else {
                                    this.storage.setItem( key, stringified );
                            }
                        }
			return this;
		},
                each:function( key, callback ) {
                        if( _is_array( key ) ){
                            for( var i = 0; i < key.length; i++ ) {
                                this.each( key[i], callback );
                            }
                        } else {
                            var that = this;
                            var items = this.get( key );
                            if(_is_callable( callback ) && items !== null) {
                                if(_is_array(items)){
                                    for(var i = 0; i < items.length; i++){
                                        items[i] = callback.call(that, items[i], i);
                                    }
                                } else if (_is_object(items) && items !== null) {
                                    for(var i in items){
                                        items[i] = callback.call(that, items[i], i);
                                    }
                                }
                            }
                        }
                        return this;
                },
		raw_value:function( key ) {
			return this.storage.getItem( key );
		},
		get:function( key , callback, context ) {
                        if( _is_array( key ) ) {
                            var collection = [];
                            for( var i = 0; i < key.length; i++ ){
                                collection[i] = this.get( key[i] );
                            }
                            return collection;
                        } else {
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
                            if( _is_callable( callback ) ) {
                                    context = context || this;
                                    return callback.call( context, parsed_data );
                            } else {
                                    return parsed_data;
                            }
                        }
		},
		all:function() {
			var collection = [];
			for( var i = 0; i < this.storage.length; i++ ){
                            var tmp_o = {};
                            tmp_o[this.storage.key(i)] = this.get( this.storage[i] );
                            collection[i] = tmp_o;
			}
			return collection;
		},
		error:function( msg ) {},
		remove:function( key ) {
			this.storage.removeItem( key );
			return this;
		},
		remove_item:function( key, ind, callback, context ) {
			var temp_o = this.get( key );
                        var deleted_val = temp_o[ ind ];
			if ( _is_array( temp_o ) ) {
				temp_o.splice( ind, 1 );
			} else if ( _is_object( temp_o ) ) {
				delete temp_o[ ind ];
			} else {
				this.remove( key )
			}
			//reset the new object to the db key
			this.set( key, temp_o );

                        if( _is_callable( callback ) ){
                            context = context || this;
                            callback.call( context, deleted_val );
                        }
			return this;
		},
		clear:function() {
			this.storage.clear();
			if(typeof this.storage.length === "function" && this.storage.length === 0) {
				return true;
			} else {
				return false;
			}
		},
		size:function() {
			return this.storage.length;
		}
	};
})();
if(typeof window.jQuery !== "undefined"){
    jQuery.jsper = jsper;
}