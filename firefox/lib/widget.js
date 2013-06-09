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
	mainPanel.port.emit('init');

	myWidget = WIDGET.Widget({
		id: "dsSpamWidget",
		label: "DS spam",
		contentURL: self.data.url("i/16.png"),
		panel: mainPanel,
		onClick: function() {
			console.log('widget click callback');
		}
	});
};


exports.initListeners = function()
{
	console.log('widget init listeners call');

	myWidget.port.on("fire", function() {
		console.log("fire button");
	});
};