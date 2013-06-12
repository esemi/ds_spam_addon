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
			if( gameClient.isGameUrl(url) ){
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
		spamFireCallback(options.armyCount, options.enemyAdr);
	});
};

function spamFireCallback(count, enemy){
	var res = gameClient.parseInitParams();
	if( res !== true )
	{
		console.log('first init params failed');
		NOTIFICATIONS.notify({
			title: "DSspam failed",
			text: "Не удалось получить начальные параметры сессии"
		});
		return;
	}

	var res = gameClient.checkin();
	if( res !== true )
	{
		console.log('checkin failed');
		NOTIFICATIONS.notify({
			title: "DSspam failed",
			text: "Не удалось обновить сессию"
		});
		return;
	}

	//--------------------для каждой армии
		//создаём армию
		//шлём армию
		//проверяем на ошибки
	//--------------------
}

