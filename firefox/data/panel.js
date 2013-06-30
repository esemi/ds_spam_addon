//@TODO replace id to js-class

(function(){

/*
	//открываем управляющую панель при событии
	self.port.on("show-panel", function(){
		console.log('show panel port on');
		document.getElementById("js-control-panel").classList.remove("hide");
		document.getElementById("js-gamepageonly-message").classList.add("hide");
	});

	//скрываем управляющую панель при событии
	self.port.on("hide-panel", function(){
		console.log('hide panel port on');
		document.getElementById("js-control-panel").classList.add("hide");
		document.getElementById("js-gamepageonly-message").classList.remove("hide");
	});

	//добавляем сообщение в лог
	self.port.on("add-log", function(message){
		var d = new Date();
		var elemLog = document.getElementById("log");
		elemLog.innerHTML += d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + ': ' + message + "\n";
		elemLog.scrollTop = elemLog.scrollHeight;
	});
*/
	//удалять кнопочки при включенной галочке
	document.getElementById("js-only-create").onchange = function(){
		if (this.checked){
			document.getElementById("js-send-army-panel").classList.add("hide");
		}else{
			document.getElementById("js-send-army-panel").classList.remove("hide");
		}
	}

	document.getElementById("spamStart").onclick = function() {
		console.log('spamStart button fire');

		//@TODO check options before send
		self.port.emit("spamStart", {
			countArmy:150,
			unitId: document.getElementById('unitId').value,
			onlyCreate: false,
			delay: 5,
			seriesArmyCount: 3,
			ring: 3,
			compl: 123,
			sota: 1
		});
	};

	(function(){
		var elems = document.getElementsByClassName("js-prevalidate");
		for (var i in elems){
			elems[i].onkeyup = function(){
				var intValue = parseInt(this.value,10);
				if (isNaN(intValue)|| intValue < this.min){
					intValue = this.min;
				}else if (intValue > this.max){
					intValue=this.max;
				}
				this.value = intValue;
			}
		}
	})();
})();