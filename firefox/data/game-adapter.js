self.port.on("getCk", function() {
	console.log('getCk on ' + window.document.readyState);
	self.port.emit("gotCk", 'ck key from source');
});
