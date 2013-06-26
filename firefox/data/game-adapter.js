console.log(document.readyState);
console.log(document.boby.innerHTML);

self.port.on("getCk", function() {
	console.log(document.readyState);
	console.log(document.boby.innerHTML);
	self.port.emit("gotCk", 'dfsdfsdf');
});
