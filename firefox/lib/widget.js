var self = require("sdk/self");
var WIDGET = require("sdk/widget");
var TABS = require("sdk/tabs");
var NOTIFICATIONS = require("sdk/notifications");
var EVENTS = require('sdk/event/core');

var myConfig = require("./config.js").config;
var myLibs = require("./libs.js");


var myWidget = function(){
	this._panel;
	this._widget;
	this._worker;
	this._client = require("./gameClient.js").getClient();
};

myWidget.prototype.create =  function(){
	console.log('create widget call');

	var _self = this;
	this._panel = require("sdk/panel").Panel({
		width:750,
		height:400,
		contentURL: self.data.url("panel.html"),
		contentScriptFile: self.data.url('panel.js'),
		contentScriptWhen: 'ready'
	});

	this._widget = WIDGET.Widget({
		id: "dsSpamWidget",
		label: "DS spam",
		contentURL: self.data.url("i/16.png"),
		panel: this._panel
	});
};

myWidget.prototype.initListeners = function(){
	console.log('init widget listeners call');

	var _self = this;

	this._panel.port.on("spamStart", function(options){
		console.log("spamStart event fire");
		var callback = new spamCallback(_self._panel, _self._client);
		callback.start(options);
	});

	this._panel.on('show', function(){
		var url = TABS.activeTab.url;
		var res = _self._client.init(url);
		if( res ){
			_self._panel.port.emit('show-panel');
			_self._worker = TABS.activeTab.attach({
				contentScriptFile: self.data.url('game-adapter.js')
			});
		}else{
			_self._panel.port.emit('hide-panel');
		}
	});

	EVENTS.on(this._client, "ckChaged", function(){
		_self._worker.port.emit('update-сk', _self._client.getCk());
	});
};


var spamCallback = function(panel, client){
	this._panel = panel;
	this._client = client;
	this._opt;
	this._armyPrefix;
	this._address;
};

spamCallback.prototype._parseOptions = function(options){
	var intRegExp = /\d+/;
	if( typeof options.countArmy === 'undefined' || !intRegExp.test(options.countArmy) || parseInt(options.countArmy) < 1 )
		return 'Invalid army count';

	if( typeof options.unitId === 'undefined' || !intRegExp.test(options.unitId) || parseInt(options.unitId) < 1 )
		return 'Invalid unit id';

	if( typeof options.onlyCreate === 'undefined' )
		return 'Invalid "create only" flag';

	if( !options.onlyCreate )
	{
		if( typeof options.ring === 'undefined' || !intRegExp.test(options.ring) || parseInt(options.ring) < 1 ||  parseInt(options.ring) > 4 )
			return 'Invalid ring';

		if( typeof options.compl === 'undefined' || !intRegExp.test(options.compl) || parseInt(options.compl) < 1 )
			return 'Invalid compl';

		if( typeof options.sota === 'undefined' || !intRegExp.test(options.sota) || parseInt(options.sota) < 1 ||  parseInt(options.sota) > 6 )
			return 'Invalid sota';

		if( typeof options.delay === 'undefined' || !intRegExp.test(options.delay) || parseInt(options.delay) < 0 ||  parseInt(options.delay) > 10 )
			return 'Invalid delay';

		if( typeof options.seriesArmyCount === 'undefined' || !intRegExp.test(options.seriesArmyCount) || parseInt(options.seriesArmyCount) < 1 ||  parseInt(options.seriesArmyCount) > 10 )
			return 'Invalid series army count';
	}

	this._opt = options;
	return true;
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
	var res = this._parseOptions(options);
	if( res !== true )
	{
		console.log('invalid options ' + res);
		this.log('invalid options ' + res);
		return;
	}

	//generate army name
	this._armyPrefix = myLibs.randomString(10);
	var mess =
			'start task for ' + this._opt.countArmy +
			' army by unit id ' + this._opt.unitId +
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

	if( createdArmy.length > 0 && !this._opt.onlyCreate )
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

	var address = [this._opt.ring, this._opt.compl, this._opt.sota].join('.');
	var mess = 'start send '
			+ armyIds.length
			+ ' army to '
			+ address
			+ ' with delay '
			+ this._opt.delay
			+ ' and '
			+ this._opt.seriesArmyCount
			+ ' army in series';
	console.log(mess);
	this.log(mess);

	//calculate speed by delay and seriesArmyCount params
	var speed = this._client.getMaxArmySpeed();
	var currentSeriesCount = 0;
	for( var i in armyIds )
	{
		if( this._opt.delay > 0 && speed > this._client.getMinArmySpeed() )
		{
			currentSeriesCount+=1;
			if( currentSeriesCount > this._opt.seriesArmyCount )
			{
				currentSeriesCount = 1;
				speed = speed - this._opt.delay;
			}
		}

		if(speed < this._client.getMinArmySpeed())
			speed = this._client.getMinArmySpeed();

		console.log('start send army ' + armyIds[i] + ' speed ' + speed);

		//отправили армию
		var res = this._client.sendArmy(armyIds[i], address, speed);
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



exports.getWidget = function(){
	return new myWidget();
};