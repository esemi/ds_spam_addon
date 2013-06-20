var self = require("sdk/self");
var TABS = require("sdk/tabs");
var URL_PARSER = require("sdk/url").URL;
var XHR = require("sdk/net/xhr").XMLHttpRequest;
var REQUEST = require("sdk/request");

var myConfig = require("./config.js").config;

var instance = null;

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
	this._baseUrl = url.scheme + url.host;

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
	/*var armyName = 'randomname13545';
	var req = REQUEST.Request({
		url : this._baseUrl + '/ds/useraction.php?SIDIX=' + this._sessid,
		content: {
			"ck": this._ck,
			"onLoad": "[type Function]",
			"xmldata": '<createarmy><armyname><![CDATA[' + armyName + ']></armyname><unit id="' + unitId + '" count="1"/></createarmy>'
		}
	});

	return true;*/
};

gameClient.prototype._parseCk = function(content){
	var matches = /\&ck=([\d\w]{10})\&loadkey=/i.exec(content);
	if( matches !== null && ckMatches.length === 2 ){
		this._ck=matches[1];
		return true;
	}

	return false;
};

gameClient.prototype._getActionUrl = function(){
	return this._baseUrl + '/ds/useraction.php?SIDIX=' + encodeURIComponent(this._sessid);
};

/**
 * Checkin into world for update ck
 *
 * @returns boolean
 */
gameClient.prototype.checkin = function(){
	console.log(this._getActionUrl());
	var request = new XHR();
	request.open('POST', this._getActionUrl(), false);
	request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	request.send(encodePostParams({
		ck: this._ck,
		onLoad: '[type Function]',
		xmldata: '<getbuildmenu c="124" />' //main building
	}));

	var res = this._parseCk(request.responseText);
	if( res !== true ){
		console.log('Not parsed new ck: ' + request.responseText);
	}
	return res;
};


function encodePostParams(params)
{
	var out = [];
	for( var i in params ){
		out.push(i + '=' + encodeURIComponent(params[i]));
	}
	return out.join('&');
}

exports.getClient = function(){
	if(instance === null){
		instance = new gameClient();
	}
	return instance;
};