/*global JSORM, testFn, nodeunit */
testFn.testResourceBundle = (function() {
	var B = JSORM.ResourceBundle;
	// set paths
	B.path = 'core/';

	return {
		"ResourceBundle tests": nodeunit.testCase({
			/*
			 * Functions to test currency functionality.
			 * These are the tests we want to perform:
			 * 1) basename returns the appropriate list
			 * 2) retrieve a bundle successfully
			 * 3) error for an invalid bundle
			 * 4) Unknown locale but valid bundle falls back appropriately
			 * 5) Retrieve a key from a bundle
			 * 6) Retrieve the same key from a bundle in two different locales gives two different results
			 */
			testRetrieveEnUs : function(T) {
				var test = this, cb;
				cb = function(success,bundle,options) {
					T.notStrictEqual(bundle,null,"MyBundle en_US retrieval");
					T.done();
				};
				B.getBundle({name:'MyBundle',locale:'en_US',callback:cb});
			},
			testRetrieveFrFr : function(T) {
				var test = this, cb;
				cb = function(success,bundle,options) {
					T.notStrictEqual(bundle,null,"MyBundle fr_FR retrieval");					
					T.done();
				};
				B.getBundle({name:'MyBundle',locale:'fr_FR',callback:cb});
			},
			testBadLocale : function(T) {
				var test = this, cb;
				cb = function(success,bundle,options) {
					T.notStrictEqual(bundle,null,"MyBundle FOO locale bad should revert to default en_US");					
					T.equal(B.defaultLocale,bundle.locale,"MyBundle FOO locale bad should revert to en_US");
					T.done();
				};
				B.getBundle({name:'MyBundle',locale:'FOO',callback:cb});
			},
			testEmptyLocale : function(T) {
				var test = this, cb;
				cb = function(success,bundle,options) {
					T.notStrictEqual(bundle,null,"MyBundle <blank> locale bad should revert to default en_US");					
					T.equal(B.defaultLocale,bundle.locale,"MyBundle <blank> locale bad should revert to en_US");
					T.done();
				};
				B.getBundle({name:'MyBundle',locale:'',callback:cb});
			},
			testNullLocale : function(T) {
				var test = this, cb;
				cb = function(success,bundle,options) {
					T.notStrictEqual(bundle,null,"MyBundle null locale bad should revert to default en_US");					
					T.equal(B.defaultLocale,bundle.locale,"MyBundle null locale bad should revert to en_US");
					T.done();
				};
				B.getBundle({name:'MyBundle',locale:null,callback:cb});
			},
			testInvalidBundle : function(T) {
				var test = this, cb;
				cb = function(success,bundle,options) {
					T.strictEqual(bundle,null,"MyBundle2 bad bundlename should remain null");					
					T.done();
				};
				B.getBundle({name:'MyBundle2',locale:'en_US',callback:cb});
			},
			testKeys : function(T) {
				var test = this, bundles = {}, count = 0, cb;
				cb = function(success,bundle,options) {
					var enUsKey, frFrKey;
					count++;
					bundles[options.name] = bundle;
					if (count === 2) {
						enUsKey = bundles.en_US.get("hello");
						frFrKey = bundles.fr_FR.get("hello");
						T.notStrictEqual(enUsKey,null,"Should be hello");
						T.notStrictEqual(frFrKey,null,"Should be bonjour");
						T.equal("hello",enUsKey,"Should be hello");
						T.equal("bonjour",frFrKey,"Should be bonjour");
						T.done();
					}
				};
				B.getBundle({name:'MyBundle',locale:'en_US',callback:cb,options: {name: 'en_US'}});
				B.getBundle({name:'MyBundle',locale:'fr_FR',callback:cb,options: {name: 'fr_FR'}});
			}

		})
	};
}());
