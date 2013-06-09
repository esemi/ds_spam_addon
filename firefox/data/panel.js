//первонаяальный инит событий
function init()
{
	document.getElementById("spamStart").onclick = function() {
		addon.port.emit("spamStart");
	};
};

//открываем управляющую панель при событии
addon.port.on("show-panel", function(){
	console.log('show panel fire');
});

//скрываем управляющую панель при событии
addon.port.on("hide-panel", function(){
	console.log('hide panel fire');
});