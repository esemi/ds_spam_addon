(function(){

	//блочим соту
	self.port.on("lock-client", function(){
		console.log('block client port on');
		window.document.getElementById('ds').style.display = 'none';
	});

	//разлочим соту
	self.port.on("unlock-client", function(){
		console.log('unblock client port on');
		window.document.getElementById('ds').style.display = 'block';
	});

	//обновляем ck во flash клиенте игры
	self.port.on("update-сk", function(newCk){
		console.log('update ck port on ' + newCk);
		window.document.getElementById('ds').innerHTML = window.document.getElementById('ds').innerHTML.replace(/ck=([\d\w]{10})/g, 'ck=' + newCk);
	});

	//
	self.port.on("get-сk", function() {
		console.log('get сk port on');
		self.port.emit("got ck", 'ck key from source');
	});

})();