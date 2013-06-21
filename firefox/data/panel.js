(function(){
	document.getElementById("spamStart").onclick = function() {
		console.log('spamStart button fire');
		self.port.emit("spamStart", {
			countArmy:5,
			ring: 3,
			compl: 1,
			sota: 1,
			unitId: 3
		});
	};

	//открываем управляющую панель при событии
	self.port.on("show-panel", function(options){
		console.log(options.armyLimit);
	});

	//скрываем управляющую панель при событии
	self.port.on("hide-panel", function(){

	});

	//добавляем сообщение в лог
	self.port.on("add-log", function(message){
		document.getElementById("log").innerHTML += message + '<br>';
	});

})();