describe('jsper', function(){
	var object, array, str;
	
	beforeEach(function(){
		jsper.force_engine("localStorage");
		object = {a:'foo',b:{c:'bar',d:'baz'}};
		array = ['a','b','c','d'];
		str = "Hello World!";
	});
	
	it("should be able to save an object", function(){
		jsper.set('object', object);
		expect(typeof jsper.get('object')).toEqual('object');
		expect(jsper.get('object').b.c).toEqual('bar');
	});
	
	it("should be able to save an array", function(){
		jsper.set('array', array);
		expect(jsper.get('array').length).toEqual(4);
	});
	
	it("should be able to save a string", function(){
		jsper.set('string', str);
		expect(jsper.get('string')).toEqual('Hello World!');
	});
	
	it("should be able to switch storage engines to cookies", function(){
		jsper.force_engine('cookie');
		jsper.set('cookie_data', {sessionid:'AJ483923HBAJEA4RJ',referrer:'example.com'});
		expect(document.cookie.indexOf("{sessionid:'AJ483923HBAJEA4RJ',referrer:'example.com'}")).toBeTruthy();
	});
	
	it("should be able to read from all storage engines if key is not found in current engine", function(){
		jsper.force_engine('localStorage');
		expect(jsper.get('cookie_data').sessionid).toEqual('AJ483923HBAJEA4RJ');
	});
	
	it("should be able to remove an array key", function(){
		jsper.set('array', array);
		jsper.remove_item('array', 1);
		expect(jsper.get('array').length).toEqual(3);
	});
	
	it("should be able to remove an object attribute", function(){
		jsper.set('object', object);
		jsper.remove_item('object', 'b');
		expect(jsper.get('object').b).toEqual(undefined);
		expect(jsper.get('object').a).toEqual('foo');
	});
	
	//sessionStorage does not work with local files
	if(location.href.indexOf("file://") === -1 && location.href.indexOf('C:\\') === -1)
	{
		it("should be able to utilize session storage", function(){
			jsper.force_engine('sessionStorage');
			jsper.set('object', object);
			expect(jsper.storage_engine).toEqual('sessionStorage');
			expect(jsper.get('object').b.d).toEqual('baz');
		});
	}
	
	it("should be able to remove a key", function(){
		jsper.force_engine('localStorage');
		jsper.set('string', str);
		expect(jsper.get('string')).toEqual('Hello World!');
		jsper.remove('string');
		expect(jsper.get('string')).toEqual(null);
	});
	
	it("should be able to clear the entire cache", function(){
		jsper.set('object', object);
		jsper.clear();
		expect(jsper.size()).toEqual(0);
	});
});