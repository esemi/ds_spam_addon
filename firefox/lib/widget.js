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
		width:250,
		height:200,
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
	//start spam button
	myPanel.port.on("spamStart", function(options) {
		console.log("spamStart button clicked");
		spamStartCallback(myPanel, gameClient, options);
	});

};

function spamStartCallback(panel, client, options)
{

	var res = client.init(TABS.activeTab.url);
	if( res === false ){
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
	console.log('start ' + options.countArmy + ' army create and send to ' + options.ring + '.' + options.compl + '.' + options.sota + ' by unit id ' + options.unitId);

	for( var i=1; i<=options.countArmy; i++ )
	{
		//создали армию
		client.createArmy(options.unitId);

		//отправили армию

	}
}

