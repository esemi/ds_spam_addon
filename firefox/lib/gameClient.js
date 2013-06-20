
var URL_PARSER = require("sdk/url").URL;

var gameClient = function(){
	this._sessid = null;
	this._ck = null;
	this._baseUrl = null;
	this._isInititated = false;
};
/**
 * Init game client by url
 *
 * @param string Current tab url (must be game url example http://www.dsga.me/ds/index.php?ck=5xt7xLNacS&VERS=RU_CLASSIC&sport=17441&SIDIX=v0mb4o1n1rgbf5lvh5mm6kbui2)
 * @returns boolean Success initiated flag
 */
gameClient.prototype.init = function(currentUrl){
	var url = URL_PARSER(currentUrl);

	this._sessid = null;
	this._ck = null;
	this._baseUrl = url.host;

	console.log(url.path);
	if( /^\/ds\/index.php\?/.test(url.path) )
	{
		var ckMatches = /ck=([\d\w]{10})\&/.exec(url.path);
		if( ckMatches !== null && ckMatches.length === 2 )
			this._ck = ckMatches[1];

		var ssMatches = /SIDIX=([\w\d]{26})/.exec(url.path);
		if( ssMatches !== null && ssMatches.length === 2 )
			this._sessid = ssMatches[1];
	}

	if(
		this._sessid === null ||
		this._ck === null ||
		this._baseUrl === null
	){
		this._isInititated = false;
	}else{
		this._isInititated = true;
	}

	return this._isInititated;
};

/**
 * Create army from single unit
 *
 * @param int unitId Id unit for create spam army
 * @returns mixed True if success, string contains error if fail
 */
gameClient.prototype.createArmy = function(unitId){

	
	return true;
};

exports.getClient = function(){
	return new gameClient();
};