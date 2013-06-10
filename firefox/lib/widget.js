var self = require("sdk/self");
var WIDGET = require("sdk/widget");
var TABS = require("sdk/tabs");

var myConfig = require("./config.js").config;

var myWidget = null;
var myPanel = null;

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
			console.log(TABS.activeTab.url); //@TODO test url on game and parse it on SESSID and ck
			//mainPanel.port.emit('show-panel');
			//mainPanel.port.emit('hide-panel');
		}
	});

	myWidget = WIDGET.Widget({
		id: "dsSpamWidget",
		label: "DS spam",
		contentURL: self.data.url("i/16.png"),
		panel: myPanel
	});

	//start spam button
	myPanel.port.on("spamStart", function(options) {
		console.log("spamStart button clicked");
		console.log(options);
	});
};