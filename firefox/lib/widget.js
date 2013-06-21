var self = require("sdk/self");
var WIDGET = require("sdk/widget");
var TABS = require("sdk/tabs");
var NOTIFICATIONS = require("sdk/notifications");

var myConfig = require("./config.js").config;
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
			console.log(url);

			var res = gameClient.init(url);
			if( res ){
				console.log('show panel');
				myPanel.port.emit('show-panel',myConfig.panelOptions);
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
	//start spam button
	myPanel.port.on("spamStart", function(options) {
		console.log("spamStart button clicked");
		spamStartCallback(myPanel, gameClient, options);
	});

};

function spamStartCallback(panel, client, options)
{
	console.log('spam callback fire');

	var res = client.init(TABS.activeTab.url);
	if( res !== true ){
		//@TODO print error
		console.log('not init client');
		console.log(TABS.activeTab.url);
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
		//@TODO print error
		console.log('invalid options');
		return;
	}

	//@TODO send log messages to panel
	var mess = 'start ' + options.countArmy + ' army create and send to ' + options.ring + '.' + options.compl + '.' + options.sota + ' by unit id ' + options.unitId;
	console.log(mess);
	panel.port.emit('add-log', mess);

	var res = client.checkin();
	if( res !== true ){
		//@TODO print error
		console.log('checkin failed');
		panel.port.emit('add-log', 'checkin failed');
		return;
	}

	var armyPrefix = randomString(10);
	console.log("select army prefix " + armyPrefix);

	for( var i=1; i<=options.countArmy; i++ )
	{
		var armyName = armyPrefix.concat(i);

		panel.port.emit('add-log', 'start create army ' + armyName);
		console.log('create army ' + armyName);

		//создали армию
		var res = client.createArmy(options.unitId, armyName);
		if(res !== true)
		{
			panel.port.emit('add-log', 'fail create army');
			console.log('fail create army');
			break;
		}

		console.log(client.getLastMessage());
		console.log(client.getLastMessage().length);
		console.log(decodeURIComponent(client.getLastMessage()));
		panel.port.emit('add-log', 'test: ' + client.getLastMessage());
		if( ! /была создана новая армия/.test(client.getLastMessage()) )
		{
			panel.port.emit('add-log', 'fail message from server (create army)');
			console.log('fail message from server (create army)');
			break;
		}
		panel.port.emit('add-log', 'army success created');

		//отправили армию

	}
};

function randomString(length)
{
	var chars = '0123456789abcdefghijklmnopqrstuvwxyz';
	var result = '';
	for (var i = length; i > 0; --i)
		result += chars[Math.round(Math.random() * (chars.length - 1))];
	return result;
}