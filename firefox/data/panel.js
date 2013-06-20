(function(){
	document.getElementById("spamStart").onclick = function() {
		console.log('spamStart button fire');
		self.port.emit("spamStart", {
			countArmy:5,
			ring: 3,
			compl: 1,
			sota: 1,
			unitId: 2
		});
	};

	//открываем управляющую панель при событии
	self.port.on("show-panel", function(){
		console.log('show panel fire');
	});

	//скрываем управляющую панель при событии
	self.port.on("hide-panel", function(){
		console.log('hide panel fire');
	});
})();