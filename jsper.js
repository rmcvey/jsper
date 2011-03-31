/**###########################################################################################################
   
   Version: 1.1.3

   * Fixed cookieStorage internal call to setKeysAndLength

   LICENSE INFO
        Copyright (c) 2010 Rob McVey
        GNU Lesser Public License http://rmcvey.github.com/jsper/license.txt
        Portions of this internal cookie class belong to The Wojo Group under MIT License
          Copyright (c) 2009 The Wojo Group

          Permission is hereby granted, free of charge, to any person obtaining a copy
          of this software and associated documentation files (the "Software"), to deal
          in the Software without restriction, including without limitation the rights
          to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
          copies of the Software, and to permit persons to whom the Software is
          furnished to do so, subject to the following conditions:

          The above copyright notice and this permission notice shall be included in
          all copies or substantial portions of the Software.

          THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
          IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
          FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
          AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
          LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
          OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
          THE SOFTWARE.

          The JSON engine belongs to Douglas Crockford's JSON2.js, the conents of which are included in class

*	Global db object wraps localStorage
*	full documentation available at http://rmcvey.github.com/jsper
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
(function() {
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
						case 'function':
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

						return str('', {
							'': value
						});
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
							walk({
								'': j
							}, '') : j;
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
			var window = this;
			var expiresAt = 30*24*60*60,
			max_cookie_size = 4000,
			prefix = "storageData_",
			name_value_delimiter = "::",
			item_delimiter = "++";

			var create_cookie = function(name,value,expire) {
				var date = new Date();
				date.setTime(date.getTime() + expire);
				var expires = "; expires=" + date.toGMTString();
				document.cookie = name+"="+value+expires+"; path=/";
			};
			var read_cookie = function(name) {
				var nameEQ = name + "=";
				var ca = document.cookie.split(';');
				if(ca.length > 0){
					for( var i = 0, iLen = ca.length; i < iLen; i++ ) {
						var c = ca[i];
						while (c.charAt(0) == ' ') {
							c = c.substring( 1, c.length );
						}
						if ( c.indexOf(nameEQ) === 0 ) {
							return c.substring( nameEQ.length, c.length );
						}
					}
				}
				return null;
			};
			var delete_cookie = function(name) {
				create_cookie(name,"",-1);
			};
			var init_cookies = function(){
				var data = "";
				var x = 0;
				if(document.cookie !== "" && document.cookie !== null){
					while( read_cookie( prefix + x ) !== null ){
						var name = prefix + (x++);
						data += read_cookie( name );
					}
				}else{
					return [];
				}
				return data == "" ? [] : data.split('++');
			};
			var data_string_to_cookies = function(data) {
				var cookies_used = Math.ceil( data.length / max_cookie_size );
				var index = 0;
				while(index < cookies_used || read_cookie( prefix + index ) !== null){
					var name = prefix + index;
					if( index < cookies_used ){
						var start = index * max_cookie_size;
						var length = ((index + 1) * max_cookie_size) > data.length ? data.length - index * max_cookie_size : max_cookie_size;
						var value = data.substr( start, length );
						create_cookie( name, value, expiresAt);
					} else {
						delete_cookie( name );
					}
					index++;
				}
			};

			return {
				length:0,
				setItem:function( key , value ){
					var data = init_cookies();
					var exists = false;
					var xlen = 0;
					if(data !== null && _is_array(data)){
						xlen = data.length;
					}
					for( var x=0; x < xlen; x++ ){
						var item = data[x].split( name_value_delimiter );
						if( item[0] == key ){
							item[1] = value;
							exists = true;
							data[x] = item.join( name_value_delimiter );
							x = xlen;
						}
					}
					if( !exists ){
						data.push(key + name_value_delimiter + value.replace(/::/g,": :").replace(/\+\+/g, "+ +") );
						this.keys.push(key);
						this.length++;
					}

					data_string_to_cookies( data.join( item_delimiter ) );
				},
				getItem:function( key ){
					var data=init_cookies(),x=0,exists=false,xlen=0;
					if(data !== null && _is_array(data)){
						xlen=data.length;
					}
					for(x=0;x<xlen;x++){
						var item = data[x].split(name_value_delimiter);
						if( item[0] == key && !!item[1])
							return item[1];
					}
					return null;
				},
				removeItem:function( key ){
					var data = init_cookies();
					var xlen = data.length;
					var exists = false;
					var temp = [];
					for( var x = 0; x < xlen; x++ ){
						var item = data[x].split( name_value_delimiter );
						if( item[0] != key ) {
							temp.push( data[x] );
						} else {
							exists = true;
						}
					}
					if( !exists ){
						return null;
					}
					data_string_to_cookies( temp.join( item_delimiter ) );
					return this.setKeysAndLength();
				},

				clear:function(){
					var x=0;
					while(read_cookie(prefix+x) !== null)
						var name = prefix + (x++);
						delete_cookie( name );
					this.keys = [];
					this.length = 0;
				},
				key:function( key ){
					return key < this.length ? this.keys[key] : null;
				},
				keys: [],
				setKeysAndLength:function(){
					if(document.cookie !== "" && document.cookie !== null){
						this.keys = init_cookies();
					}else{
						this.length = 0;
						return null;
					}
					var x=0;
					if(this.keys.length !== 0){
						while( this.keys[x] ){
							this.keys[x] = this.keys[x++].split("::")[0];
						}
					}
					this.length = this.keys.length;
					return null;
				},
				onstorage:function(e){
					if(!e){
						e = window.event;
					}

				}
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
			/**
			 * this should be used instead of force_engine or storage_engine
			 * if no parameter is passed, the engine is returned; if one is passed the engine is changed to that
			 */
			engine:function( eng ){
				if( eng !== undefined ){
					this.force_engine( eng );
					return this.storage_engine;
				}
				return this.storage_engine;
			},
			support:false,
			/**
			 * valid values to force_engine are: cookie, cookies, localStorage, local, localstorage, session, sessionstorage, sessionStorage
			 */
			force_engine:function(eng){
				switch(eng){
					case "local":
					case "localstorage":
					case "localStorage":
						if(supports.html5_storage()){
							this.storage_engine = "localStorage";
							this.storage = localStorage;
							break;
						}
					case "session":
					case "sessionstorage":
					case "sessionStorage":
						if(supports.html5_sessionStorage()){
							this.storage_engine = "sessionStorage";
							this.storage = sessionStorage;
							break;
						}
					case 'cookie':
					case 'cookieStorage':
					case 'cookies':
					default:
						this.storage_engine = "cookie";
						this.storage = cookieStorage;
						if(this.storage.length === null || this.storage.length === 0){
							this.storage.setKeysAndLength();
						}
						break;
				}
				// call this to fallback if new engine is not supported
				this.supported();
				return this;
			},
			supported:function( engine ) {
				if( engine !== undefined ) {
					this.force_engine( engine );
					return this.storage_engine === engine;
				}
				this.support = supports.html5_storage();
				if(!this.support){
					if(!supports.cookies){
						return false;
					} else if(this.storage_engine !== "cookie"){
						this.force_engine('cookie');
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
							for(var x = 0; x < items.length; x++){
								items[x] = callback.call(that, items[x], x);
							}
						} else if (_is_object(items) && items !== null) {
							for(var i in items){
								items[i] = callback.call(that, items[i], i);
							}
						} else {
							callback.call(that, items, null);
						}
					} else {
						return items;
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
					tmp_o[this.storage.key(i)] = this.get( this.storage.key(i) );
					collection[i] = tmp_o;
				}
				return (collection.length > 0) ? collection : null;
			},
			error:function( msg ) {},
			remove:function( key ) {
				this.storage.removeItem( key );
				if(this.get( key )){
					this.set(key, null);
				}
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
			},
			init:function(){
				//gets called initially to bootstrap the storage engine (if using cookies)
				this.supported();
				return this;
			}
		}.init();
	})();
	if(typeof window.jQuery !== "undefined"){
		jQuery.jsper = jsper;
	} else {
	   window.jsper = jsper;
	}
})()