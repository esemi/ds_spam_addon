var self = require("sdk/self");
var WIDGET = require("sdk/widget");

var myConfig = require("./config.js").config;

var myWidget = null;

exports.create = function()
{
	console.log('create widget call');

	var mainPanel = require("sdk/panel").Panel({
		width:250,
		height:200,
		contentURL: self.data.url("panel.html")
	});
	mainPanel.on('show', function(){

		//check url and emit event show/hide
		//mainPanel.port.emit('show-panel')
		//mainPanel.port.emit('hide-panel')
	});

	myWidget = WIDGET.Widget({
		id: "dsSpamWidget",
		label: "DS spam",
		contentURL: self.data.url("i/16.png"),
		panel: mainPanel
	});
};


exports.initListeners = function()
{
	console.log('widget init listeners call');

	myWidget.port.on("spamStart", function() {
		console.log("spamStart button clicked");
	});
};