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
var isNode = typeof module !== "undefined" && typeof module.exports !== "undefined" && typeof require !== "undefined" && typeof(require) === "function";
if (isNode) {
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
		if (isNode) {
			fs = require('fs');
			fs.readFile(fileName,function(err,data){
				var xmlHttp = {}, success;
				if (err) {
					xmlHttp.responseText = null;
					xmlHttp.responseCode = 404;
					success = false;
				} else {
					xmlHttp.responseText = data.toString();
					xmlHttp.responseCode = 200;
					success = true;
				}
				callback(fileName,xmlHttp,success,options);
			});
		} else {
			JSORM.ajax({url: fileName, callback: callback, options: options});
		}
	},
	loadCode: function(code) {
		var results, vm, sandbox;
		// need to set up environment properly
		if (isNode) {
			vm = require('vm');
			sandbox = {
				JSORM: utils.apply(JSORM,exports),
				module: {exports: {}}
			};
			sandbox.exports = module.exports;
			vm.runInNewContext(code,sandbox);
			results = sandbox.module.exports;
		} else {
			/*jslint evil:true */
			(function(){
				var module = {exports: {}}, exports = module.exports;
				eval(code);
				results = module.exports;
			}());
			/*jslint evil:false */
		}
		return(results);
	},
	apply: JSORM.apply,
	extend: JSORM.extend,
	zeropad: JSORM.zeropad,
	fork: JSORM.fork
};

// save getFile
exports.getFile = utils.getFile;
