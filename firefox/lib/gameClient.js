var self = require("sdk/self");
var { Cc, Ci } = require('chrome');
var TABS = require("sdk/tabs");
var URL = require("sdk/url");
var XHR = require("sdk/net/xhr").XMLHttpRequest;
var REQUEST = require("sdk/request");

var myConfig = require("./config.js").config;

var instance = null;

var GameClient = function(){
	this._url = '';
	this._ck = '';
	this._sessid = '';
	this._cookie = '';
};

GameClient.prototype.isGameUrl = function(url){
	var regexps = myConfig.gameDomainRegexp;
	for( var i in regexps )
	{
		if(
			regexps[i].test(url) &&
			url.indexOf('/ds/index.php') >= 0
		)
			return true;
	}
	return false;
};

GameClient.prototype._parseCookie = function(){
	var ios = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
	var uri = ios.newURI(TABS.activeTab.url, null, null);
	var cookieSvc = Cc["@mozilla.org/cookieService;1"].getService(Ci.nsICookieService);
	this._cookie = cookieSvc.getCookieString(uri, null);
};

GameClient.prototype._parseCkFromLink = function(url){
	var matches = /ck=([\w\d]{10})/i.exec(url);
	if( matches !== null && typeof matches[1] !== 'undefined' )
		this._ck=matches[1];
	else
		this._ck = '';
};

GameClient.prototype._parseSessid = function(url){
	var matches = /SIDIX=([\w\d]{26})/i.exec(url);
	if( matches !== null && typeof matches[1] !== 'undefined' )
		this._sessid=matches[1];
	else
		this._sessid = '';
};

GameClient.prototype._parseUrl = function(url){
	var url = URL.URL(url);
	if( url.host !== null )
		this._url=url.host;
	else
		this._url = '';
};

GameClient.prototype.parseInitParams = function(){

	this._parseCookie();

	this._parseCkFromLink(TABS.activeTab.url);

	this._parseSessid(TABS.activeTab.url);

	this._parseUrl(TABS.activeTab.url);

	console.log("sessid: " + this._sessid + " ck:" + this._ck + " url:" + this._url);

	return (this._sessid.length > 0 && this._ck.length > 0 && this._cookie.length > 0 && this._url.length > 0);
};

GameClient.prototype._parseCk = function(content){
	var matches = /\&ck=([\d\w]{10})\&loadkey=/i.exec(content);
	if( matches !== null && typeof matches[1] !== 'undefined' ){
		this._ck=matches[1];
		return true;
	}

	return false;
};

GameClient.prototype.checkin = function(){
	//запрашиваем главное здание для обновления ck
	var request = new XHR();
	request.open('POST', 'http://' + this._url + '/ds/useraction.php?SIDIX=' + encodeURIComponent(this._sessid), false);
	request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	request.send(encodePostParams({
		ck: this._ck,
		onLoad: '[type Function]',
		xmldata: '<getbuildmenu c="124" />'
	}));
	
	var content = request.responseText;
	var res = this._parseCk(content);
	if( res !== true ){
		console.log('Not parsed new ck: ' + content);
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
		instance = new GameClient();
	}
	return instance;
};