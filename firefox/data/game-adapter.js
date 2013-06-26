var isLoaded = (document.readyState === 'complete');
self.isInited = false;

if( !isLoaded )
{
	document.addEventListener("DOMContentLoaded", function(event){
		console.log('content loaded fire');
		init();
	}, false);
}else{
	console.log('first init');
	init();
}


function init(){
	if( self.isInited )
		return;

	self.isInited = true;
	self.port.on("getCk", function() {
		console.log(document.readyState);
		console.log(document.getElementsByTagName('BODY'));
		console.log(document.getElementsByTagName('BODY').innerHtml);
		self.port.emit("gotCk", 'dfsdfsdf');
	});
};