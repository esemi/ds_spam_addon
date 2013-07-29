exports.encodePostParams = function(params){
	var out = [];
	for( var i in params ){
		out.push(i + '=' + encodeURIComponent(params[i]).replace('!', '%21'));
	}
	return out.join('&');
};

exports.randomString = function(length){
	var chars = 'abcdefghijklmnopqrstuvwxyz';
	var result = '';
	for (var i = length; i > 0; --i)
		result += chars[Math.round(Math.random() * (chars.length - 1))];
	return result;
};

exports.extend = function(Child, Parent){
	var F = function(){};
	F.prototype = Parent.prototype;
	Child.prototype = new F();
	Child.prototype.constructor = Child;
	Child.superclass = Parent.prototype;
};
