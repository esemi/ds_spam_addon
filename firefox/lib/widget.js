var self = require("sdk/self");
var WIDGET = require("sdk/widget");
var TABS = require("sdk/tabs");
var NOTIFICATIONS = require("sdk/notifications");
var EVENTS = require('sdk/event/core');

var myConfig = require("./config.js").config;
var myLibs = require("./libs.js");
var gameClient = require("./gameClient.js").getClient();

var myWidget = null;
var myPanel = null;

exports.panel = myPanel;
exports.widget = myWidget;

exports.create = function()
{
	console.log('create widget call');

	myPanel = require("sdk/panel").Panel({
		width:700,
		height:400,
		contentURL: self.data.url("panel.html"),
		contentScriptFile: self.data.url('panel.js'),
		contentScriptWhen: 'ready',
		onShow: function() {
			var url = TABS.activeTab.url;

			var res = gameClient.init(url);
			if( res ){
				console.log('show panel');
				myPanel.port.emit('show-panel');
			}else{
				console.log('hide panel');
				myPanel.port.emit('hide-panel');
			}
		}
	});

	myWidget = WIDGET.Widget({
		id: "dsSpamWidget",
		label: "DS spam",
		contentURL: self.data.url("i/16.png"),
		panel: myPanel
	});
};

exports.initListeners = function()
{
	console.log('init widget listeners call');

	var callback = new spamCallback(myPanel, gameClient);
	myPanel.port.on("spamStart", function(options) {
		console.log("spamStart event fire");
		callback.start(options);
	});
};

var spamCallback = function(panel, client){
	this._panel = panel;
	this._client = client;
	this._opt;
	this._armyPrefix;
	this._address;

	EVENTS.on(this._client, "ckChaged", function() {
		console.log('ckChaged event fire');
	});

};

spamCallback.prototype.log = function(message){
	this._panel.port.emit('add-log', message);
};

spamCallback.prototype.start = function(options){
	if( !this._client.isInitiated() )
	{
		console.log('client not initiated');
		this.log('client not initiated');
		return;
	}

	//check options
	var intRegExp = /\d+/;
	if(
		typeof options.countArmy === 'undefined' || !intRegExp.test(options.countArmy) ||
		typeof options.ring === 'undefined' || !intRegExp.test(options.ring) ||
		typeof options.compl === 'undefined' || !intRegExp.test(options.compl) ||
		typeof options.sota === 'undefined' || !intRegExp.test(options.sota) ||
		typeof options.unitId === 'undefined' || !intRegExp.test(options.unitId)
	){
		console.log('invalid options');
		this.log('invalid options');
		return;
	}
	this._opt = options;

	//generate army name
	this._armyPrefix = myLibs.randomString(10);
	this._address = [this._opt.ring, this._opt.compl, this._opt.sota].join('.');
	var mess =
			'start ' + this._opt.countArmy +
			' army create and send to ' + this._address +
			' by unit id ' + this._opt.unitId +
			' army prefix - "' + this._armyPrefix + '"';
	console.log(mess);
	this.log(mess);

	this.findArmyBase();
};

spamCallback.prototype.findArmyBase = function(){
	var res = this._client.loadBuildMap();
	if( res !== true ){
		console.log('loading build map failed');
		this.log('loading build map failed');
		return;
	}
	this.log('loading build map success');

	var res = this._client.getArmyBuildId();
	if( res === null )
	{
		console.log('army base build id not found');
		this.log('army base build id not found');
		return;
	}
	this.log('army base build id found success ' + res);

	this.createArmy();
};

spamCallback.prototype.createArmy = function(){
	var createdArmy = [];
	for( var i=1; i<=this._opt.countArmy; i++ )
	{
		var armyName = this._armyPrefix.concat(i);

		console.log('create army ' + armyName);

		//создали армию
		var res = this._client.createArmy(this._opt.unitId, armyName);
		if(res !== true)
		{
			console.log('fail create army');
			this.log('fail create army');
			break;
		}

		console.log(this._client.getLastMessage());
		this.log('server response: ' + this._client.getLastMessage());
		if( ! /была\sсоздана\sновая\sармия/.test(this._client.getLastMessage()) )
		{
			console.log('fail message from server (create army)');
			this.log('fail message from server (create army)');
			break;
		}

		createdArmy.push(armyName);
	}

	if( createdArmy.length > 0)
	{
		this.sendArmy(createdArmy);
	}
};

spamCallback.prototype.sendArmy = function(armyNames){
	console.log('created ' + armyNames.length + ' army');
	var armyIds = this._client.loadArmyOverview(armyNames);
	if(armyIds === false)
	{
		console.log('fail loading army ids');
		this.log('fail loading army ids');
		return;
	}

	for( var i in armyIds )
	{
		console.log('start send army ' + armyIds[i]);

		//отправили армию
		var res = this._client.sendArmy(armyIds[i], this._address);
		if(res !== true)
		{
			console.log('fail send army');
			this.log('fail send army');
			break;
		}

		console.log(this._client.getLastMessage());
		this.log('server response: ' + this._client.getLastMessage());
		if( ! /получила\sприказ\sатаковать\sсоту/.test(this._client.getLastMessage()) )
		{
			console.log('fail message from server (send army)');
			this.log('fail message from server (send army)');
			break;
		}
	}
};