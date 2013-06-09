
//первонаяальный инит событий
function init()
{
	console.log('TEST1');
	document.getElementById("test").onclick = function() {
		console.log('TEST');
		addon.port.emit("fire");
	};
};

//ловим событие инита от основного скрипта
addon.port.on("init", function(){init();});