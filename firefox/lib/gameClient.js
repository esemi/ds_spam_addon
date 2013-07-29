var self = require("sdk/self");
var TABS = require("sdk/tabs");
var URL_PARSER = require("sdk/url").URL;
var XHR = require("sdk/net/xhr").XMLHttpRequest;
var REQUEST = require("sdk/request");

var myLibs = require("./libs.js");

var gameClient = function(){
	this._sessid = null;
	this._ck = null;
	this._baseUrl = null;
	this._isInititated = false;
	this._lastMessage = '';
	this._minArmySpeed = 50;
	this._maxArmySpeed = 150;
	this._archCount = 0;
	this._map = {
		'armyBase': null, //26 code
		'mainBuilding': 127
	};
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
		if( ckMatches !== null && ckMatches.length === 2 ){
			this._ck = ckMatches[1];
		}

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
 * Loading buildings map and global values (arch count & others)
 *
 * @returns boolean
 */
gameClient.prototype.loadBuildMap = function(){
	var params = myLibs.encodePostParams({
		ck: this._ck,
		onLoad: '[type Function]',
		xmldata: '<navigate cell="1" dest="HOME" />'
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
	var res = this._parseBuildMapResponse(request.responseText);
	if( res !== true )
	{
		console.log('Not parsed build army response: ' + request.responseText);
		return false;
	}

	return res;
};

/**
 * Loading army base buildMenu
 *
 * @param {array} armyNames Array of army names
 * @returns mixed Array of army ids or False if failed
 */
gameClient.prototype.loadArmyOverview = function(armyNames){
	var params = myLibs.encodePostParams({
		ck: this._ck,
		onLoad: '[type Function]',
		xmldata: '<getbuildmenu c="' + this.getArmyBuildId() + '" tab="PN_ArmyOverview" />'
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

	var res = this._parseArmyOverviewResponse(request.responseText, armyNames);
	if( res === false || res.length !== armyNames.length )
	{
		console.log(res);
		console.log('Not parsed army overview response: ' + request.responseText + ' length ' + res.length + ' vs ' + armyNames.length);
	}
	return res;
};

/**
 * Create army from single unit
 *
 * @param {int} unitId Id unit for create spam army
 * @param {string} army Army name for create
 * @returns mixed
 */
gameClient.prototype.createArmy = function(unitId, army){
	var params = myLibs.encodePostParams({
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
		return 'Not parsed new ck: ' + request.responseText;
	}

	var res = this._parseCreateArmyResponse(request.responseText);
	if( res !== true )
	{
		return 'Not parsed create army message: ' + request.responseText;
	}

	return true;
};

/**
 * Send army to address
 *
 * @param {int} armyId
 * @param {string} addr Army destination in format %d.%d.%d
 * @param {int} speed
 * @returns mixed
 */
gameClient.prototype.sendArmy = function(armyId, addr, speed){
	var params = myLibs.encodePostParams({
		"ck": this._ck,
		"onLoad": "[type Function]",
		"xmldata": '<attack res="ALL_RES" speed="' + speed + '" destination="' + addr + '" id_army="' + armyId + '" />'
	});
	var request = new XHR();
	request.open('POST', this._getActionUrl(), false);
	request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	request.send(params);

	var res = this._parseCk(request.responseText);
	if( res !== true ){
		return 'Not parsed new ck: ' + request.responseText;
	}

	//console.log(request.responseText);
	var res = this._parseSendArmyResponse(request.responseText);
	if( res !== true ){
		return 'Not parsed send army message: ' + request.responseText;
	}

	return true;
};

gameClient.prototype.getLastMessage = function(){
	return this._lastMessage;
};
gameClient.prototype.getArmyBuildId = function(){
	return this._map.armyBase;
};
gameClient.prototype.getMinArmySpeed = function(){
	return this._minArmySpeed;
};
gameClient.prototype.getMaxArmySpeed = function(){
	return this._maxArmySpeed;
};
gameClient.prototype.getArchCount = function(){
	return this._archCount;
};
gameClient.prototype.isInitiated = function(){
	return this._isInititated;
};
gameClient.prototype.getCk = function(){
	return this._ck;
};
gameClient.prototype.setCk = function(ck){
	this._ck = ck;
};

gameClient.prototype._parseCk = function(content){
	var ckMatches = /\&ck=([\d\w]{10})/i.exec(content);
	if( ckMatches !== null && ckMatches.length === 2 ){
		this.setCk(ckMatches[1]);
		return true;
	}
	return false;
};

gameClient.prototype._parseCreateArmyResponse = function(content){
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

gameClient.prototype._parseSendArmyResponse = function(content){
	var matches = /<sysmsg><w>(.*)<\/w><\/sysmsg>/.exec(content);

	if( matches !== null && matches.length === 2 )
	{
		this._lastMessage = matches[1].replace(/\{([^}]*)\}/g, '');
		return true;
	}else{
		this._lastMessage = '';
		return false;
	}
};

gameClient.prototype._parseBuildMapResponse = function(content){
	var matches = /<build>(.*)<\/build>/.exec(content);
	if( matches === null || matches.length !== 2 ){
		return false;
	}

	var temp = matches[1].split('^^');
	for(var i in temp)
	{
		var t = temp[i].split('^');
		if( t.length < 3 )
			continue;

		if( t[2] === '26' ) //army base
			this._map.armyBase = parseInt(t[1]) + 1;
	}

	var matches = /<ARCHEOLOGIST\scurrent="(\d+)"/.exec(content);
	if( matches === null || matches.length !== 2 ){
		console.log('not parsed arch count' + matches);
		return false;
	}
	this._archCount = parseInt(matches[1]);

	return true;
};

gameClient.prototype._parseArmyOverviewResponse = function(content, armyNames){
	var matches = /<armyoverview(.*)<\/armyoverview>/.exec(content);
	if( matches === null || matches.length !== 2 ){
		console.log('not parsed overview content' + matches);
		return false;
	}

	var armyContent = matches[1];

	var minSpeedMatches = /minspeed="(\d+)"/.exec(armyContent);
	if( minSpeedMatches === null || minSpeedMatches.length !== 2 ){
		console.log('not parsed min speed' + minSpeedMatches);
		return false;
	}
	this._minArmySpeed = parseInt(minSpeedMatches[1]);

	var maxSpeedMatches = /maxspeed="(\d+)"/.exec(armyContent);
	if( maxSpeedMatches === null || maxSpeedMatches.length !== 2 ){
		console.log('not parsed max speed' + maxSpeedMatches);
		return false;
	}
	this._maxArmySpeed = parseInt(maxSpeedMatches[1]);

	var result = [];
	for(var i in armyNames)
	{
		var re = new RegExp('<army\\sid_army="(\\d+)"\\sarmyname="' + armyNames[i] + '"');
		var match = re.exec(armyContent);
		if( match === null || match.length !== 2 ){
			console.log('not found army id ' + armyNames[i] + ' ' + match);
			continue;
		}
		result.push(match[1]);
	}

	return result;
};

gameClient.prototype._getActionUrl = function(){
	return this._baseUrl + '/ds/useraction.php?SIDIX=' + encodeURIComponent(this._sessid);
};


exports.getClient = function(){
	return new gameClient();
};