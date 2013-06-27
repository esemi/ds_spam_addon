'use strict';

//main function
exports.main = function(options, callbacks)
{
	var myWidget = require("./widget.js").getWidget();
	myWidget.create();
	myWidget.initListeners();
};