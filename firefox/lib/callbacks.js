var EVENTS = require('sdk/event/core');
var NOTIFICATIONS = require("sdk/notifications");

var myLibs = require('./libs.js');

/**
 * @param {object} panel
 * @param {object} client
 * @abstract continueAfterUpdateCK()
 * @abstract _parseOptions(opt)
 */
var BaseCallback = function(panel, client){
	this._panel = panel;
	this._client = client;
	this._listenersInited = false;
	this._opt;
};

BaseCallback.prototype.log = function(message){
	this._panel.port.emit('add-log', message);
};

BaseCallback.prototype.updateCK = function(ck){
	console.log('update new ck ' + ck);
	if( ck === null ){
		return this.end('update ck from flash vars failed');
	}
	this._client.setCk(ck);
	this.continueAfterUpdateCK();
};

BaseCallback.prototype.start = function(options){
	EVENTS.emit(this, 'startWork');

	if( !this._client.isInitiated() ){
		return this.end('client not initiated');
	}

	//check options
	var res = this._parseOptions(options);
	if( res !== true ){
		return this.end('invalid options ' + res);
	}

	EVENTS.emit(this, 'gettingCk');
};

BaseCallback.prototype.end = function( message ){
	EVENTS.emit(this, 'endWork');
	console.log('end message: ' + message);
	this.log('end message: ' + message);

	NOTIFICATIONS.notify({
		title: 'ds_cheater',
		text: 'Work ended with message "' + message + '"'
	});
};

BaseCallback.prototype.initListeners = function(worker){
	console.log("init listeners of " + this._listenersInited);
	if( !this._listenersInited ){
		this._listenersInited = true;
		var _self = this;

		EVENTS.on(this, "gettingCk", function(){
			worker.port.emit('get-сk');
		});

		EVENTS.on(this, "startWork", function(){
			worker.port.emit('lock-client');
		});

		EVENTS.on(this, "endWork", function(){
			worker.port.emit('unlock-client');
			worker.port.emit('update-сk', _self._client.getCk());
		});

		worker.port.on("returnCk", function(ck){
			_self.updateCK(ck);
		});
	}
};


var SpamCallback = function(panel, client){
	SpamCallback.superclass.constructor.apply(this, arguments);
};

myLibs.extend(SpamCallback, BaseCallback);

/**
 * Parse spam send options
 *
 * @param {array} options (countArmy, unitId, onlyCreate, ring, compl, sota, delay, seriesArmyCount)
 * @returns String|Boolean
 */
SpamCallback.prototype._parseOptions = function(options){
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

	var mess = 'start task for ' + this._opt.countArmy + ' army by unit id ' + this._opt.unitId;
	console.log(mess);
	this.log(mess);

	return true;
};

SpamCallback.prototype.continueAfterUpdateCK = function(){
	this.findArmyBase();
};

SpamCallback.prototype.findArmyBase = function(){
	var res = this._client.loadBuildMap();
	if( res !== true ){
		return this.end('loading build map failed');
	}
	this.log('loading build map success');

	var res = this._client.getArmyBuildId();
	if( res === null ){
		return this.end('army base build id not found');
	}
	this.log('army base build id found success ' + res);

	this.createArmy();
};

SpamCallback.prototype.createArmy = function(){

	var armyPrefix = myLibs.randomString(10);

	var createdArmy = [];
	for( var i=1; i<=this._opt.countArmy; i++ )
	{
		var armyName = armyPrefix.concat(i);
		console.log('create army ' + armyName);

		//создали армию
		var res = this._client.createArmy(this._opt.unitId, armyName);
		if(res !== true){
			console.log('fail create army: ' + res);
			this.log('fail create army: ' + res);
			break;
		}

		console.log(this._client.getLastMessage());
		this.log('server response: ' + this._client.getLastMessage());
		if( ! /была\sсоздана\sновая\sармия/.test(this._client.getLastMessage()) )
		{
			console.log('warning message from server (create army)');
			this.log('warning message from server (create army)');
			break;
		}

		createdArmy.push(armyName);
	}

	if( createdArmy.length > 0 && !this._opt.onlyCreate )
	{
		this.sendArmy(createdArmy);
	}else{
		this.end('created ' + createdArmy.length + ' army');
	}
};

SpamCallback.prototype.sendArmy = function(armyNames){
	console.log('created ' + armyNames.length + ' army');
	var armyIds = this._client.loadArmyOverview(armyNames);
	if(armyIds === false){
		return this.end('fail loading army ids');
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
		if(res !== true){
			console.log('fail send army: ' + res);
			this.log('fail send army: ' + res);
			break;
		}

		console.log(this._client.getLastMessage());
		this.log('server response: ' + this._client.getLastMessage());
		if( ! /получила\sприказ\sатаковать\sсоту/.test(this._client.getLastMessage()) )
		{
			console.log('warning message from server (send army)');
			this.log('warning message from server (send army)');
			break;
		}
	}

	this.end('end work');
};


var ArchCallback = function(panel, client){
	ArchCallback.superclass.constructor.apply(this, arguments);
};

myLibs.extend(ArchCallback, BaseCallback);

/**
 * Parse arch send options
 *
 * @param {array} options (dest, artSize, time, groupCount, archCount)
 * @returns String|Boolean
 */
ArchCallback.prototype._parseOptions = function(options){
	var intRegExp = /\d+/;
	if( typeof options.artSize === 'undefined' || !intRegExp.test(options.artSize) || parseInt(options.artSize) < 1 || parseInt(options.artSize) > 6 )
		return 'Invalid art size';

	if( typeof options.time === 'undefined' || !intRegExp.test(options.time) || [1,2,3,5,8,12].indexOf(options.time) < 0 )
		return 'Invalid time';

	if( typeof options.dest === 'undefined' || ['HOME', 'CENTRAL', 'NEUTRAL'].indexOf(options.dest) < 0 )
		return 'Invalid destination';

	if( typeof options.groupCount === 'undefined' || !intRegExp.test(options.groupCount) || parseInt(options.groupCount) < 1 )
		return 'Invalid group count';

	if( typeof options.archCount === 'undefined' || !intRegExp.test(options.archCount) || parseInt(options.archCount) < 1 )
		return 'Invalid arch count';

	this._opt = options;

	var mess = 'start task ' + this._opt.groupCount + ' group by ' + this._opt.archCount + ' arch-s to ' + this._opt.dest + ' an ' + this._opt.time + ' hours and ' + this._opt.artSize + ' art size';
	console.log(mess);
	this.log(mess);

	return true;
};

ArchCallback.prototype.continueAfterUpdateCK = function(){
	this.prepareArchGroups();
};

ArchCallback.prototype.prepareArchGroups = function(){
	var res = this._client.loadBuildMap();
	if( res !== true ){
		return this.end('loading build map failed');
	}
	this.log('loading build map success');

	var archCountSota = this._client.getArchCount();
	if( archCountSota === null || archCountSota === 0 ){
		return this.end('not found arch on sota');
	}
	this.log('found ' + archCountSota + ' arch on sota');

	//prepare arch groups
	if(this._opt.archCount > archCountSota) //парень указал архов в одну группу больше чем на соте всего
	{
		this._opt.archCount = archCountSota;
		this._opt.groupCount = 1;
		this.log('decrease arch-s by count on sota: arch ' + this._opt.archCount + ' and group ' + this._opt.groupCount);
	}else if( this._opt.groupCount > Math.floor(archCountSota / this._opt.archCount) ){ //с количеством архов всё ок - проверяем кол-во груп
		this._opt.groupCount  = Math.floor(archCountSota / this._opt.archCount);
		this.log('decrease arch groups by count on sota: arch ' + this._opt.archCount + ' and group ' + this._opt.groupCount);
	}

	this.sendArch();
};

ArchCallback.prototype.sendArch = function(){

	this.log('start send ' + this._opt.groupCount + ' arch groups');

	for( var i = 0; i < this._opt.groupCount; i++ ){
		//отправили армию
		var res = this._client.sendArchGroup(this._opt.dest, this._opt.archCount, this._opt.time, this._opt.artSize);
		if(res !== true){
			console.log('fail send arch group: ' + res);
			this.log('fail send arch group: ' + res);
			break;
		}

		console.log(this._client.getLastMessage());
		this.log('server response: ' + this._client.getLastMessage());
		if( ! /отправлена\sна\sпоиски\sв\sрайон/.test(this._client.getLastMessage()) )
		{
			console.log('warning message from server (send arch group)');
			this.log('warning message from server (send arch group)');
			break;
		}
	}

	return this.end('end work');
};

exports.getArch = function(){
	return ArchCallback;
};
exports.getSpam = function(){
	return SpamCallback;
};