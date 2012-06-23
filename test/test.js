/*jslint nomen:false, node:true */
/*global exports*/

/*
 * rest api test cases for studymesh
 */
var tests = [], tmp = {}, _ = require('underscore'), exec = require('child_process').exec,
nodeunit = require('nodeunit'), fs = require('fs'), vm = require('vm'), arg, testFn = {}, 
jsormUtil = require('jsorm-utilities'), jsorm = require('./jsorm-i18n-src'), code, 
sandbox = {testFn: testFn, JSORM: jsormUtil.apply(jsorm,jsormUtil), nodeunit:nodeunit},
runTests, testRunner;

runTests = function(tests) {
	var file;
	_.each(tests,function(elm,i){
		if (elm === "all") {
			// just load all from folder
			_.each(fs.readdirSync("./") || [], function(f) {
				file = f;
				/*jslint regexp:false */
				if (file.match(/^test-.*\.js$/)) {
					/*jslint regexp:true */
					code = fs.readFileSync("./"+file);
					vm.runInNewContext(code,sandbox,file);
				}
			});
		} else {
			file = "./test-"+elm+".js";
			code = fs.readFileSync(file);
			vm.runInNewContext(code,sandbox,file);
		}
	});

	// one name or all


	// convert to properly named
	_.each(testFn,function(val,key){
		var o = {};
		o[key] = val;
		tests.push(o);
	});
	nodeunit.reporters["default"].run(sandbox.testFn);
};
testRunner = function() {
	var file, code;
	arg = process.argv.slice(2);

	// each argument is either the name of a test, or a keyword to other tests
	if (arg.length < 1) {
		arg = ["all"];
	}
	// what about preload?
	if (!testFn.testCalImpl) {
		file = "./test-cal-impl.js";
		code = fs.readFileSync(file);
		vm.runInNewContext(code,sandbox,file);
	}
	runTests(arg);

};

process.stdout.write("Type 'i' and hit enter to start the node inspector.\n");
process.stdout.write("Type 'b' and hit enter to start web browser.\n");
process.stdout.write("Type 'q' and hit enter to quit.\n");
process.stdout.write("Type enter by itself to continue...\n");
process.stdout.write("> ");
process.stdin.resume();
process.stdin.on('data',function(chunk){
	var d = chunk.toString();
	d = d.substring(0,d.length-1);
	switch (d) {
		case 'q': process.stdout.write("Exiting...\n"); process.exit(); break;
		case 'i': exec("node-inspector --debug port 5858"); process.stdout.write("node-inspector started\n> "); break;
		case 'b': exec("open http://0.0.0.0:8080/debug?port=5858"); process.stdout.write("browser started\n> "); break;
		case '': testRunner(); break;
	}
});
