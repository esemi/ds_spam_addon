var self = require("sdk/self");
var WIDGET = require("sdk/widget");
var PANEL = require("sdk/panel");
var TABS = require("sdk/tabs");
var EVENTS = require('sdk/event/core');

var myGameClient = require("./gameClient.js");
var myCallbacks = require("./callbacks.js");

var myWidget = function(){
	this._panel;
	this._widget;
	this._worker;
	this._spamCallback;
	this._archCallback;
	this._client = myGameClient.getClient();
};

myWidget.prototype.create =  function(){
	console.log('create widget call');

	this._panel = PANEL.Panel({
		width:750,
		height:407,
		contentURL: self.data.url("panel.html"),
		contentScriptFile: self.data.url('panel.js'),
		contentScriptWhen: 'ready'
	});

	this._widget = WIDGET.Widget({
		id: "dsCheaterWidget",
		label: "DS cheater",
		contentURL: self.data.url("img/16.png"),
		panel: this._panel
	});

	this._spamCallback = new (myCallbacks.getSpam())(this._panel, this._client);
	this._archCallback = new (myCallbacks.getArch())(this._panel, this._client);
};

myWidget.prototype.initListeners = function(){
	console.log('init widget listeners call');

	var _self = this;

	//событие отображения панели
	this._panel.on('show', function(){
		var url = TABS.activeTab.url;
		var res = _self._client.init(url);
		if( res ){
			//панель готова к работе
			_self._panel.port.emit('show-panel');

			//TABS.activeTab.reload(); @FIXME exception after this code - wtf?
			_self._worker = TABS.activeTab.attach({
				contentScriptFile: self.data.url('game-adapter.js')
			});
		}else{
			//панель скрыта, поскольку человек не на соте
			_self._panel.port.emit('hide-panel');
		}
	});

	//нажатие на кнопку "отправить спам"
	this._panel.port.on("spamStart", function(options){
		console.log("spamStart event fire");
		_self._spamCallback.initListeners(_self._worker);
		_self._spamCallback.start(options);
	});

	//событие изменения ck в игровом клиенте (изменяем его и в игре)
	EVENTS.on(this._client, "ckChaged", function(){
		_self._worker.port.emit('update-сk', _self._client.getCk());
	});
};

exports.getWidget = function(){
	return new myWidget();
};