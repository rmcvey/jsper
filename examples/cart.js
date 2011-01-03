var jsper_cart = (function(){
	var Cart = [];
	var key = 'cart';
	var populate_cart = function() {
		if( jsper.get( key ) ) {
			Cart = jsper.get( key );
		} else {
			Cart = [];
		}
	};
	var _is_item = function( item ) {
		return !_is_null(item) && typeof item === "object" && item.id !== undefined;
	};
	var _is_null = function( item ) {
		return item === null;
	};
	var _is_callable = function( fn ) {
		return typeof fn === "function";
	};
	var _is_undefined = function( o ) {
		return typeof o === "undefined" || o === "";
	};

	return {
		init:function() {
			populate_cart();
			return this;
		},
		next:function() {
			return (typeof Cart.length === "undefined") ? 0 : (Cart.length);
		},
		contents:function( item ) {
			return jsper.get( key );
		},
		in_cart:function( item ) {
			for(var i = 0; i < Cart.length; i++) {
				if( _is_item( Cart[i] ) && Cart[i].id === item.id){
					return i;
				}
			}
			return null;
		},
		remove_item:function( item, callback, context ) {
			var index = this.in_cart( item );
			var context = context || this;
			if(index !== null) {
				var tmp = Cart[ index ];
				Cart.splice(index, 1);
				jsper.set(key, Cart);
				
				if( _is_callable( callback ) ) {
					callback.call(context, tmp);
				}
			}
		},
		add:function( item, cb ) {
			var that = this;
			if( _is_item( item ) ) {
				if(_is_null(item.qty) || _is_undefined(item.qty)){
					item.qty = 1;
				}
				var index = this.in_cart( item );
				if( !_is_null( index ) ) {
					if( item.qty === 1 || _is_null( item.qty ) || isNaN( item.qty )) {
						Cart[ index ].qty++;
					} else if(_is_null(item.qty) && isNaN(Cart[ index ].qty)) {
						Cart[ index ].qty = 1;
					} else {
						var prev_qty = parseInt(Cart[ index ].qty);
						var new_qty =  parseInt(prev_qty + parseInt(item.qty));
						Cart[ index ].qty = new_qty;
					}
				} else {
					Cart[ this.next() ] = item;
				}
				
				jsper.set( key, Cart );
				
				if( _is_callable( cb ) ) {
					cb.call(that, item);
				}
			} else {
				return false;
			}
			return this;
		},
		update:function( item ) {
			if( _is_item( item ) && !_in_cart( item ) ) {
				this.add( item );
			} else {
				Cart[item.id] = item;
			}
		},
		each:function(cb){
			if( _is_callable( cb )){
				for(var i = 0; i < Cart.length; i++){
					cb.call(this, Cart[i]);
				}
			}
		},
		remove:function( item ) {
			if( _is_item( item ) && _in_cart( item )){
				delete Cart[item.id];
			}
			return this;
		},
		empty:function() {
			jsper.remove('cart');
			Cart = [];
		},
		total:function(){
			var total = 0;
			this.each(function(product){
				var sub_total = parseFloat(product.price) * product.qty;
				total += sub_total;
			});
			return (Math.round(total * Math.pow(10, 2) ) / Math.pow(10, 2)).toFixed(2);
		}
	}.init();
})();