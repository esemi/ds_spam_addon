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
		panel.port.emit('add-log', 'invalid options');
		return;
	}

	var armyPrefix = randomString(10);
	var address = [options.ring, options.compl, options.sota].join('.');
	var mess =
			'start ' + options.countArmy +
			' army create and send to ' + address +
			' by unit id ' + options.unitId +
			' army prefix - "' + armyPrefix + '"';
	console.log(mess);
	panel.port.emit('add-log', mess);

	var res = client.loadBuildMap();
	if( res !== true ){
		console.log('loading build map failed');
		panel.port.emit('add-log', 'loading build map failed');
		return;
	}

	var armyBaseId = client.getArmyBuildId();
	console.log("army base id " + armyBaseId);
	if( armyBaseId === null )
	{
		console.log('army base build id not found');
		panel.port.emit('add-log', 'army base build id not found');
		return;
	}

	//@TODO убиваем отображение соты, дабы не нащёлкали лишнего пока идёт отправка

	var createdArmy = [];
	for( var i=1; i<=options.countArmy; i++ )
	{
		var armyName = armyPrefix.concat(i);

		console.log('create army ' + armyName);
		panel.port.emit('add-log', 'start create army ' + armyName);

		//создали армию
		var res = client.createArmy(options.unitId, armyName);
		if(res !== true)
		{
			panel.port.emit('add-log', 'fail create army');
			console.log('fail create army');
			break;
		}

		console.log(client.getLastMessage());
		panel.port.emit('add-log', 'server response: ' + client.getLastMessage());
		if( ! /была\sсоздана\sновая\sармия/.test(client.getLastMessage()) )
		{
			console.log('fail message from server (create army)');
			panel.port.emit('add-log', 'fail message from server (create army)');
			break;
		}

		createdArmy.push(armyName);
	}

	if( createdArmy.length > 0)
	{
		console.log('created ' + createdArmy.length + ' army ');
		panel.port.emit('add-log', 'start send army to ' + address);
		for( var i in createdArmy )
		{
			console.log('send army to ' + address);
			panel.port.emit('add-log', 'start send army to ' + address);

			//отправили армию
			var res = client.sendArmy(armyName, address);
			if(res !== true)
			{
				console.log('fail send army');
				panel.port.emit('add-log', 'fail send army');
				break;
			}

			console.log(client.getLastMessage());
			panel.port.emit('add-log', 'server response: ' + client.getLastMessage());
			if( ! /была\sсоздана\sновая\sармия/.test(client.getLastMessage()) )
			{
				console.log('fail message from server (send army)');
				panel.port.emit('add-log', 'fail message from server (send army)');
				break;
			}
		}
	}


};

function randomString(length)
{
	var chars = 'abcdefghijklmnopqrstuvwxyz';
	var result = '';
	for (var i = length; i > 0; --i)
		result += chars[Math.round(Math.random() * (chars.length - 1))];
	return result;
}