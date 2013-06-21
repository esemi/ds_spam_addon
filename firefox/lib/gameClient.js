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
	this._lastMessage = '';
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
	this._baseUrl = url.scheme + '://' + url.host;

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
 * @param string army Army name for create
 * @returns boolean
 */
gameClient.prototype.createArmy = function(unitId, army){
	var params = encodePostParams({
		"ck": this._ck,
		"onLoad": "[type Function]",
		"xmldata": '<createarmy><armyname><![CDATA[' + army + ']]></armyname><unit id="' + unitId + '" count="1"/></createarmy>'
	});
	var request = new XHR();
	request.open('POST', this._getActionUrl(), false);
	request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	request.send(params);

	var res = this._parseCk(request.responseText);
	if( res !== true ){
		console.log('Not parsed new ck: ' + request.responseText);
		return false;
	}

	//console.log(request.responseText);
	var res = this._parseCreateArmyResponse(request.responseText);
	if( res !== true )
	{
		console.log('Not parsed create army message: ' + request.responseText);
		return false;
	}

	return true;
};

gameClient.prototype.getLastMessage = function(){
	return this._lastMessage;
};

gameClient.prototype._parseCk = function(content){
	var ckMatches = /\&ck=([\d\w]{10})\&loadkey=/i.exec(content);
	if( ckMatches !== null && ckMatches.length === 2 ){
		this._ck = ckMatches[1];
		return true;
	}
	return false;
};

gameClient.prototype._parseCreateArmyResponse = function(content)
{
	var matches = /<sysmsg><m>(.*)<\/m><\/sysmsg>/.exec(content);

	if( matches !== null && matches.length === 2 )
	{
		this._lastMessage = matches[1].replace(/\{([^}]*)\}/g, '');
		return true;
	}else{
		this._lastMessage = '';
		return false;
	}
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
	var params = encodePostParams({
		ck: this._ck,
		onLoad: '[type Function]',
		xmldata: '<getbuildmenu c="124"/>'
	});
	var request = new XHR();
	request.open('POST', this._getActionUrl(), false);
	request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	request.send(params);

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
		out.push(i + '=' + encodeURIComponent(params[i]).replace('!', '%21'));
	}
	return out.join('&');
}

exports.getClient = function(){
	if(instance === null){
		instance = new gameClient();
	}
	return instance;
};