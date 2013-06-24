exports.encodePostParams = function(params){
	var out = [];
	for( var i in params ){
		out.push(i + '=' + encodeURIComponent(params[i]).replace('!', '%21'));
	}
	return out.join('&');
};
