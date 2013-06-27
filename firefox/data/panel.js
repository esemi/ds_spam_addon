//@TODO replace id to js-class
//@TODO check options before send
//@TODO auto scroll log textarea

(function(){
	document.getElementById("spamStart").onclick = function() {
		console.log('spamStart button fire');
		self.port.emit("spamStart", {
			countArmy:150,
			unitId: 3,
			onlyCreate: false,
			delay: 5,
			seriesArmyCount: 3,
			ring: 3,
			compl: 123,
			sota: 1
		});
	};

	//открываем управляющую панель при событии
	self.port.on("show-panel", function(){
		console.log('show panel port on');
	});

	//скрываем управляющую панель при событии
	self.port.on("hide-panel", function(){
		console.log('hide panel port on');
	});

	//добавляем сообщение в лог
	self.port.on("add-log", function(message){
		var d = new Date();
		document.getElementById("log").innerHTML += d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + ': ' + message + "\n";
	});
})();