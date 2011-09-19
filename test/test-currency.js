/*global JSORM, testFn */
testFn.testCurrency = function(Y) {
	var C = JSORM.currency;
	// list of zones to test and test inputs and expected outputs
	// each key is the name of a zone to load and check
	// each value is an array of tests
	// each test is itself an array whose keys are: [message,expected_value,time]
	var tests = {
				  "USD":{name: 'Dollars', country: 'United States of America', tests:[["Whole positive with decimals","$20.00",20.00],["Whole positive","$15.00",15],
						["Whole negative with decimals",'-$15.25',-15.25],["Whole negative",'-$2.00',-2]]},
				  "GBP":{name: 'Pounds', country: 'United Kingdom', tests: [["Whole positive with decimals","\u00a3"+"20.00",20.00],["Whole positive","\u00a3"+"15.00",15],
						["Whole negative with decimals","-\u00a3"+'15.25',-15.25],["Whole negative","-\u00a3"+'2.00',-2]]},
				  "ILS":{name: 'New Shekels', country: 'Israel', tests:[["Whole positive with decimals",'\u20aa'+"20.00",20.00],["Whole positive",'\u20aa'+"15.00",15],
						["Whole negative with decimals",'-\u20aa'+'15.25',-15.25],["Whole negative",'-\u20aa'+'2.00',-2]]},
				  "CAD":{name: 'Dollars', country: 'Canada', tests: [["Whole positive with decimals","$20.00",20.00],["Whole positive","$15.00",15],
						["Whole negative with decimals",'-$15.25',-15.25],["Whole negative",'-$2.00',-2]]}
				};
	// expected number of currencies
	var numCurrencies = 127;
	/*
	 * Functions to test currency functionality.
	 * These are the tests we want to perform:
	 * 1) Test we have the right number of currencies
	 * 2) Test that a null currency gives the default
	 * 3) Test that an unknown currency gives the default
	 * 4) Test conversion of several amounts in each of several currencies
	 * 5) Test expected currency names for several countries
	 * 6) Test expected country names for several countries
	 */
	
	return new Y.Test.Case({
		name : "Currency Tests",
		testNumCurrencies : function() {
			var count=C.getCurrencies().length;
			Y.Assert.areEqual(numCurrencies,count,"Wrong number of currencies");
		},
		testNullCurrency : function() {
			var cur = C();
			Y.Assert.areEqual(C.defaultCurrency,cur.getAbbreviation(),"Null currency gives wrong default");
		},
		testBadCurrency : function() {
			var cur = C("XYZ");
			Y.Assert.areEqual(C.defaultCurrency,cur.getAbbreviation(),"Null currency gives wrong default");
		},
		testConversions : function() {
			var cur,message,expect,input,output;
			for (var i in tests) {
				if (tests.hasOwnProperty(i) && typeof(i) === "string") {
					cur = C(i);
					for (var j=0;j<tests[i].tests.length;j++) {
						message = tests[i].tests[j][0];
						expect = tests[i].tests[j][1];
						input = tests[i].tests[j][2];
						output = cur.format(input);
						Y.Assert.areEqual(expect,output,message+":"+i);
					}					
				}
			}
		},
		testNames : function() {
			var cur;
			for (var i in tests) {
				if (tests.hasOwnProperty(i) && typeof(i) === "string") {
					cur = C(i);
					Y.Assert.areEqual(i,cur.getAbbreviation(),"Check abbreviation:"+i);
					Y.Assert.areEqual(tests[i].name,cur.getName(),"Check name:"+i);
					Y.Assert.areEqual(tests[i].country,cur.getCountry(),"Check country:"+i);
				}
			}
		}	
	});
};
