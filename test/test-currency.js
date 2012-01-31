/*global JSORM, testFn, nodeunit */
testFn.testCurrency = (function() {
	var jcur = JSORM.currency, tests, numCurrencies;
	// list of zones to test and test inputs and expected outputs
	// each key is the name of a zone to load and check
	// each value is an array of tests
	// each test is itself an array whose keys are: [message,expected_value,time]
	tests = {
				  "USD":{name: 'Dollars', country: 'United States of America', tests:[["Whole positive with decimals","$20.00",20.00],["Whole positive","$15.00",15],
						["Whole negative with decimals",'-$15.25',-15.25],["Whole negative",'-$2.00',-2]]},
				  "GBP":{name: 'Pounds', country: 'United Kingdom', tests: [["Whole positive with decimals","\u00a3"+"20.00",20.00],["Whole positive","\u00a3"+"15.00",15],
						["Whole negative with decimals","-\u00a3"+'15.25',-15.25],["Whole negative","-\u00a3"+'2.00',-2]]},
				  "ILS":{name: 'New Shekels', country: 'Israel', tests:[["Whole positive with decimals",'\u20aa'+"20.00",20.00],["Whole positive",'\u20aa'+"15.00",15],
						["Whole negative with decimals",'-\u20aa'+'15.25',-15.25],["Whole negative",'-\u20aa'+'2.00',-2]]},
				  "CAD":{name: 'Dollars', country: 'Canada', tests: [["Whole positive with decimals","$20.00",20.00],["Whole positive","$15.00",15],
						["Whole negative with decimals",'-$15.25',-15.25],["Whole negative",'-$2.00',-2]]}
        , "BTC":{name: 'Bitcoins', country: 'N/A', tests: [["Postive fraction","0.00010000",0.0001],["Whole number positive","15.00000000",15],
            ["Whole negative with decimals","-15.25000000",-15.25],["Whole negative","-2.00000000",-2],["Negative fraction","-0.00004000",-0.00004]]}
				};
	// expected number of currencies
	numCurrencies = 128;
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
	
	return {"Currency Tests": nodeunit.testCase({
		testNumCurrencies : function(T) {
			var count=jcur.getCurrencies().length;
			T.equal(numCurrencies,count,"Wrong number of currencies");
			T.done();
		},
		testNullCurrency : function(T) {
			T.equal(jcur.defaultCurrency,jcur().getAbbreviation(),"Null currency gives wrong default");
			T.done();
		},
		testBadCurrency : function(T) {
			T.equal(jcur.defaultCurrency,jcur("XYZ").getAbbreviation(),"Null currency gives wrong default");
			T.done();
		},
		testConversions : function(T) {
			var cur,message,expect,input,output,i,j;
			for (i in tests) {
				if (tests.hasOwnProperty(i) && typeof(i) === "string") {
					cur = jcur(i);
					for (j=0;j<tests[i].tests.length;j++) {
						message = tests[i].tests[j][0];
						expect = tests[i].tests[j][1];
						input = tests[i].tests[j][2];
						output = cur.format(input);
						T.equal(expect,output,message+":"+i);
					}				
				}
			}
			T.done();
		},
		testNames : function(T) {
			var cur,i;
			for (i in tests) {
				if (tests.hasOwnProperty(i) && typeof(i) === "string") {
					cur = jcur(i);
					T.equal(i,cur.getAbbreviation(),"Check abbreviation:"+i);
					T.equal(tests[i].name,cur.getName(),"Check name:"+i);
					T.equal(tests[i].country,cur.getCountry(),"Check country:"+i);
				}
			}
			T.done();
		}	
	})};
}());
