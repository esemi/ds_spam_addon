'use strict';

/*
 * const replaced to var for netbeans 7.3 parser (https://netbeans.org/bugzilla/show_bug.cgi?id=226477)
 */
var self = require("sdk/self");
var myWidget = require("./widget.js");

//main function
exports.main = function(options, callbacks)
{
	myWidget.create();
	myWidget.initListeners();
};