
(function(){

	function History(){
		if( typeof(Storage) !== "undefined" ){
			this._storage = localStorage;
		}else{
			this._storage = {};
		}

		if (typeof (this._storage.lastEnemies) === "undefined" ){
			this._storage.lastEnemies = JSON.stringify([]);
		}
	};

	History.prototype.add = function(ring, compl, sota){
		var temp = JSON.parse(this._storage.lastEnemies);
		var currentAdress = String(ring+','+compl+','+sota);

		//перебор адресов хрянящихся в localStorage
		for (var i in temp){
			var lastAdress = String(temp[i].ring+','+temp[i].compl+','+temp[i].sota);
			//удаление повторяющихся объектов
			if (currentAdress == lastAdress){
				temp.splice(i,1);
			}
		}
		//добавление в начало последнего адреса
		temp.unshift({ring:ring,compl:compl,sota:sota});

		//проверка длинны, оставляем только 10 последних врагов
		if (temp.length > 10){
			temp.pop();
		}
		this._storage.lastEnemies = JSON.stringify([]);
		this._storage.lastEnemies = JSON.stringify(temp);
	};

	History.prototype.getAll = function(){
		return JSON.parse(this._storage.lastEnemies);
	};

	//вывод последних врагов
	function lastEnemies(){
		var history = new History();
		var enemies= history.getAll();
		var select = document.getElementById("js-last-enemy");

		//удаление старых опшенов
		while(select.lastChild) {
			select.removeChild(select.lastChild);
		}

		if (enemies.length !== 0){
			for (var i in enemies){
				var child = document.createElement("option");
				child.setAttribute("ring", enemies[i].ring);
				child.setAttribute("compl", enemies[i].compl);
				child.setAttribute("sota", enemies[i].sota);

				var text = document.createTextNode([enemies[i].ring, enemies[i].compl, enemies[i].sota].join('.'));
				child.appendChild(text);
				select.appendChild(child);

			}
			select.classList.remove("hide");
		}
	};

	lastEnemies();



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
		var elemLog = document.getElementById("js-log");
		elemLog.innerHTML += d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + ': ' + message + "\n";
		elemLog.scrollTop = elemLog.scrollHeight;
	});

	//очистка лога
	document.getElementById("js-clear-log").onclick = function(){
		document.getElementById("js-log").innerHTML = "";
	}


	//удалять кнопочки при включенной галочке
	document.getElementById("js-only-create").onchange = function(){
		if (this.checked){
			document.getElementById("js-send-army-panel").classList.add("hide");
		}else{
			document.getElementById("js-send-army-panel").classList.remove("hide");
		}
	}

	//кнопка пуск
	document.getElementById("js-spam-start").onclick = function() {
		console.log('spamStart button fire');
		var history = new History();
		history.add(
			parseInt(document.getElementById("js-ring").value),
			parseInt(document.getElementById("js-compl").value),
			parseInt(document.getElementById("js-sota").value)
		);
		lastEnemies();

		self.port.emit("spamStart", {
			countArmy: parseInt(document.getElementById("js-count-army").value),
			unitId: parseInt(document.getElementById("js-unit-id").value),
			onlyCreate: document.getElementById("js-only-create").checked,
			delay: parseInt(document.getElementById("js-delay").value),
			seriesArmyCount: parseInt(document.getElementById("js-series-army-count").value),
			ring: parseInt(document.getElementById("js-ring").value),
			compl: parseInt(document.getElementById("js-compl").value),
			sota: parseInt(document.getElementById("js-sota").value)
		}); 
	};

	//привидение цифровых значений к допустимым максимуму и минимуму
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