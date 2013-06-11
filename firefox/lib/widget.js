var self = require("sdk/self");
var WIDGET = require("sdk/widget");
var TABS = require("sdk/tabs");

var myConfig = require("./config.js").config;

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

			console.log(TABS.activeTab.url);
			if( isGameUrl(TABS.activeTab.url) ){
				myPanel.port.emit('show-panel');
			}else{
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

	//start spam button
	myPanel.port.on("spamStart", function(options) {
		console.log("spamStart button clicked");
		console.log(options);
	});
};

function isGameUrl(url)
{
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
}