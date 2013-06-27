(function(){

	self.port.on("getCk", function() {
		console.log('getCk on ' + window.document.readyState);
		self.port.emit("gotCk", 'ck key from source');
	});

	//обновляем ck во flash клиенте игры
	self.port.on("updateCk", function(newCk){
		console.log('update ck port on' + newCk);
	});

})();