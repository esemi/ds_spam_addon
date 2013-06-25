self.port.on("getCk", function() {
	console.log(document.readyState);
	console.log(document.body);

	self.port.emit("gotCk", 'dfsdfsdf');
});