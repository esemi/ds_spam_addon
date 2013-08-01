(function(){

	/*******************************************SPAM SEND***************************************************************/


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
		var currentAdress = ring + ',' + compl + ',' + sota;

		//перебор адресов хрянящихся в localStorage
		for (var i in temp){
			var lastAdress = temp[i].ring + ',' + temp[i].compl + ',' + temp[i].sota;
			//удаление повторяющихся объектов
			if (currentAdress === lastAdress){
				temp.splice(i,1);
			}
		}
		//добавление в начало последнего адреса
		temp.unshift({ring:ring,compl:compl,sota:sota});

		//проверка длинны, оставляем только 10 последних врагов
		temp = temp.splice(0,10);

		this._storage.lastEnemies = JSON.stringify(temp);
	};

	History.prototype.getAll = function(){
		return JSON.parse(this._storage.lastEnemies);
	};

	//вывод последних врагов
	function initLastEnemySelector(){
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

	initLastEnemySelector();

	//удалять кнопочки при включенной галочке
	document.getElementById("js-only-create").onchange = function(){
		if (this.checked){
			document.getElementById("js-send-army-panel").classList.add("hide");
		}else{
			document.getElementById("js-send-army-panel").classList.remove("hide");
		}
	};

	//кнопка пуска спама
	document.getElementById("js-spam-start").onclick = function() {
		console.log('spamStart button fire');

		if (document.getElementById("js-compl").value.length !== 0 ){
			var history = new History();
			history.add(
				parseInt(document.getElementById("js-ring").value),
				parseInt(document.getElementById("js-compl").value),
				parseInt(document.getElementById("js-sota").value)
			);
		}

		initLastEnemySelector();

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

	//подстановка цели спама из истории
	document.getElementById('js-last-enemy').onchange = function(){
		var selectedEnemy = this.options[this.selectedIndex];

		document.getElementById('js-ring').selectedIndex = selectedEnemy.getAttribute('ring')-1;
		document.getElementById('js-compl').value = selectedEnemy.getAttribute('compl');
		document.getElementById('js-sota').selectedIndex = selectedEnemy.getAttribute('sota')-1;

	};


	/*******************************************ARCH SEND***************************************************************/


	//кнопка отправки архов
	document.getElementById("js-arch-start").onclick = function() {
		console.log('archStart button fire');

		self.port.emit("archSendStart", {
			dest: document.getElementById("js-arch-dest").value,
			artSize: parseInt(document.getElementById("js-arch-art-size").value),
			time: parseInt(document.getElementById("js-arch-time").value),
			groupCount: parseInt(document.getElementById("js-arch-group-count").value),
			archCount: parseInt(document.getElementById("js-arch-arch-count").value)
		});
	};


	/****************************others**************************************************************************************/


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

	//переключалка вкладок
	(function(){
		var tabs = document.getElementsByClassName('js-tab-button');
		for (var i=0; i < tabs.length; i++){
			tabs[i].onclick = function(){
				for (var i=0; i < tabs.length; i++){
					tabs[i].classList.remove('active');
					tabs[i].classList.add('unactive');
				}
				this.classList.remove('unactive');
				this.classList.add('active');

				//скрытие/открытие блоков @FIXME work with classes and remove ids
				document.getElementById('js-spam-block').classList.add('hide');
				document.getElementById('js-arch-block').classList.add('hide');
				document.getElementById('js-grabli-block').classList.add('hide');

				//@FIXME custom attr
				if (this.id === 'js-tab-spam'){
					document.getElementById('js-spam-block').classList.remove('hide');
				}else if(this.id === 'js-tab-arhi'){
					document.getElementById('js-arch-block').classList.remove('hide');
				}else if (this.id === 'js-tab-grabli'){
					document.getElementById('js-grabli-block').classList.remove('hide');
				}
			};
		};
	})();

	//очистка лога
	document.getElementById("js-clear-log").onclick = function(){
		var elem = document.getElementById("js-log");
		while(elem.lastChild) {
			elem.removeChild(elem.lastChild);
		}
	};

	//привидение цифровых значений к допустимым максимуму и минимуму
	(function(){
		var elems = document.getElementsByClassName("js-prevalidate");
		for (var i=0; i < elems.length; i++){
			elems[i].onkeyup = function(){
				var intValue = parseInt(this.value,10);
				if (isNaN(intValue)|| intValue < this.min){
					intValue = this.min;
				}else if (intValue > this.max){
					intValue=this.max;
				}
				this.value = intValue;
			};
		}
	})();

})();