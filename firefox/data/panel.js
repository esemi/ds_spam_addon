(function(){
	document.getElementById("spamStart").onclick = function() {
		console.log('spamStart button fire');
		self.port.emit("spamStart", {
			"armyCount": 3,
			"enemyAdr": '2.1.1'
		});
	};

	//открываем управляющую панель при событии
	self.port.on("show-panel", function(options){
		console.log(options.armyLimit);
	});

	//скрываем управляющую панель при событии
	self.port.on("hide-panel", function(){

	});
})();