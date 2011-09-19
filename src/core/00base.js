/**
 * @author adeitcher
 * @fileOverview Ensure that appropriate vars are defined.
 */
/*
 * Ensure that our variables are in place
 */
/*global module,exports,require */
var JSORM;
// are we running on node with require or the global JSORM?
if (typeof require !== "undefined") {
	JSORM = require('jsorm-utilities');
} else {
	JSORM = exports;
}

/**
 * Retrieve a file from the server via Ajax. Note that Ajax means asynchronous.
 * 
 * @param {String} fileName File name to retrieve, relative to the existing URL.
 * @param {Function} callback Function to call when retrieve is complete, success or failure. 
 *  Signature is callback(fileName,xmlHttpObject,success,options)
 * @param{Object} options Options to pass as is to callback in options parameter
 * @memberOf JSORM
 * @private
 */
var utils = {
	getFile : function(fileName,callback,options) {
		var fs;
		// need to determine if we are running in node or on a client-side
		if (module !== undefined && module.exports !== undefined && require !== undefined && typeof(require) === "function") {
			fs = require('fs');
			fs.readFile(fileName,function(err,data){
				var xmlHttp = {}, success;
				if (err) {
					xmlHttp.responseText = null;
					xmlHttp.responseCode = 404;
					success = false;
				} else {
					xmlHttp.responseText = null;
					xmlHttp.responseCode = 200;
					success = true;
				}
				callback(fileName,xmlHttp,true,options);
			});
		} else {
			JSORM.ajax({url: fileName, callback: callback, options: options});
		}
	},
	apply: JSORM.apply,
	extend: JSORM.extend,
	zeropad: JSORM.zeropad
};
