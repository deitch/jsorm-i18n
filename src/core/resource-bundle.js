/*global exports,utils,JSORM */
/**
 * You should <b>never</b> use the constructor directly. Rather, use ResourceBundle.getBundle()
 * 
 * @class ResourceBundle represents a local representation of a locale-aware bundle of resources. Resource bundles are key/value pairs that
 * are aware of their locale. For example, if the key is SUNDAY, the value in locale English US (en_US) would be "Sunday" while in
 * French France (fr_FR) it would be "Dimanche". ResourceBundle allows you to abstract the details of locale changes from your code,
 * thus making for significantly easier to maintain and more portable code.
 * <p/>
 * To use ResourceBundle, you would do the following:
 * <ol>
 * <li>Prepare a resource bundle with the appropriate key-value pairs. See below.</li>
 * <li>Load the bundle using ResourceBundle.getBundle(config). The config includes the locale you wish to use.</li>
 * <li>In your code, instead of using actual strings, use rb.get(key)</li>
 * </ol>
 * 
 * <p/>
 * A resource bundle file is just a Java-compatible properties file. As such, the file can have any arbitrary name you desire, in 
 * any accessible directory, with the suffix '.properties'. Example names could be myfile.properties or yourfile.properties. 
 * Additionally, following the filename but before the suffix, you can have a language or a language plus a country. For example,
 * you can have English, English US, or English UK. The language is always two letters, lowercase, according to the official IANA 
 * subtag language registry http://www.iana.org/assignments/language-subtag-registry. The country is always two letters, uppercase,
 * according to the official ISO 3166 country codes 
 * http://www.iso.org/iso/country_codes/iso_3166_code_lists/english_country_names_and_code_elements.htm. The filename and optional
 * language are separated by an underscore '_'; the language and optional country are separate by an underscore '_'.
 * There are thus three forms for a localized properties file. The following table describes the three forms.
 * <table>
 * <tr><th>Sample Filename</th><th>Format</th></tr>
 * <tr><td>myfile_en_US.properties</td><td>myfile in US English. Used when asked for a US English bundle.</td></tr>
 * <tr><td>myfile_en.properties</td><td>myfile in English. Used when asked for an English bundle, or for a country-specific English 
 *   bundle, e.g. UK English, but that bundle is not available.</td></tr>
 * <tr><td>myfile.properties</td><td>myfile as a default. Used when asked for a bundle that is not available.</td></tr>
 * </table>
 * <br/>
 * The search order when asked for a specific bundle and locale is as follows. The example assumes we have asked for lib/myfile bundle in
 * locale 'fr_FR' with a defaultLocale of 'en_US'.
 * <table>
 * <tr><th></th><th>Rule</th><th>Example</th></tr>
 * <tr><td>1</td><td>Search for file and locale</td><td>lib/myfile_fr_FR.properties</td></tr>
 * <tr><td>2</td><td>Search for file and language part of locale</td><td>lib/myfile_fr.properties</td></tr>
 * <tr><td>3</td><td>Search for file and default locale</td><td>lib/myfile_en_US.properties</td></tr>
 * <tr><td>4</td><td>Search for file and language part of default locale</td><td>lib/myfile_en.properties</td></tr>
 * <tr><td>5</td><td>Search for just the file as a default</td><td>lib/myfile.properties</td></tr>
 * <tr><td>6</td><td>Fail</td><td>Fail</td></tr>
 * </table>
 * <br/>
 * The system ensures that each entry is unique and no repeats occur. Thus, if the locale requests is only a language, it will not
 * search for that, then the language again, then the default, etc. Similarly, if the defaultLocale is the same as the requested locale,
 * there will be no repetition.
 * <p/>
 * The properties file is a straight text file. Each line represents another property, and is indicated by a key and a value. The key is 
 * the string before the first equals (=) sign, trimmed of whitespace. The value is everything after the equals (=) sign. Thus, a 
 * properties file for fr_FR might contain the following:
 * <pre>
 * Hello = Bonjour
 * Goodbye = Au revoir
 * </pre>
 * <br/>
 * If this properties file is loaded, rb.get('Hello') would return the string 'Bonjour' (without the quotes), while rb.get('Goodbye') 
 * would return the string 'Au revoir'.
 * 
 * @param {Object} config Configuration information
 * @config {String} name Name of the bundle, including path
 * @config {String} [locale] Locale to use, following the conventions in the introduction
 * @config {Object} data Data passed to allow determining timezone information
 * @constructor
 */
var extend = utils.extend, apply = utils.apply;
exports.ResourceBundle = extend({},function(config){
	var myclass = this.myclass, superclass = this.superclass, data, entry, lines, entries = {}, i, m;
	config = config || {};
	data = config.data;
	
	/*
	 * process the data - it is in the format where each line 
	 * key = value
	 * 
	 * # this is a comment
	 *  our regex is as follows:
	 *  match any line that has any blank space followed by no # symbol and some real chars
	 *  followed by one = and then the results
	 */
	/*jslint regexp:false */
	entry = /^\s*([^#\s][^=]*)\b\s*=\s*(.*)?\s*$/;
	/*jslint regexp:true */
	lines = data.split('\n');
	for (i=0;i<lines.length;i++) {
		// check for comment and key = value match
		m = entry.exec(lines[i]);
		if (m) {
			entries[m[1]] = m[2];
		}
	}

	apply(this,/** @scope JSORM.ResourceBundle.prototype */{
		// keep the name and locale for reference
		name : config.name,
		/**
		 * Which locale was actually found. This can differ from the requested locale due to the search path.
		 */
		locale : config.locale,
		/**
		 * Which locale was requested.
		 */
		givenLocale : config.givenLocale,
		/**
		 * get the value of a key
		 * 
		 * @param {String} key The key to look up
		 * @returns {String} The localized value
		 */
		get : function(key) {
			var a = entries[key];
			return(a);
		}
	});
},(function()/** @scope JSORM.ResourceBundle */{
	// NOTE: need to use myclass as function because JSORM.ResourceBundle is not yet defined until after this function
	// is run
	var myclass = function(){return(exports.ResourceBundle);}, bundles = {}, baseLocale;
	/**
	 * Construct the list of locales we should look for. This implements the rule described in the overview of this class wherein
	 * first we take the locale, then language, then defaultLocale, then countryOfDefaultLocale, then blank. This is a list of 
	 * characters to append to the filename. It properly handles underscores (_), as well as ensuring the same entry does not appear
	 * twice.
	 * 
	 * @param {String} locale The locale to use
	 * @returns {Array} Array with list of locales in order, with each entry guaranteed to be unique
	 * @private
	 */
	baseLocale = function(locale) {
		// the locale is split by a _ e.g, en_US en_GB fr_CA or just en, fr, de
		// list of the ones we are going to return
		// suffixes to keep track of ones we have done already
		var list = [], suffixes = {}, index, lname, defL;

		// if locale is blank, we are just using the default
		if (locale) {
			// first with the whole thing
			list.push(locale);
			suffixes[locale] = 1;
			// next just language locale
			index = locale.indexOf('_');
			if (index > -1) {
				lname = locale.substring(0,index);
				list.push(lname);
				suffixes[lname] = 1;
			}
		}
		// now use the default locale, if different from already used
		defL = myclass().defaultLocale;

		// first the entire locale
		if (!suffixes[defL]) {
			list.push(defL);
		}
		// now just the language part
		index = defL.indexOf('_');
		if (index > -1) {
			lname = defL.substring(0,index);
			if (!suffixes[lname]) {
				list.push(lname);
			}
		}

		// finally the basic name
		list.push('');

		// now we take them all and construct the full list with bundle
		return(list);		
	};

	return {
		/**
		 * Default locale to use. Change this to override.
		 * @memberOf JSORM.ResourceBundle
		 */
		defaultLocale : 'en_US',

		/**
		 * Default path to use. Change this to change the default, or override on each {@link #getBundle}. 
		 * To be relative to the current page, use './'
		 * @memberOf JSORM.ResourceBundle
		 */
		path : '/lib/locale/',

		/**
		 * Get a bundle. This will return an object which is a loaded bundle.
		 * This function is intelligent enough to know when the bundle is already loaded and not go back to the server.
		 * See the overview of this section to understand what a resource bundle properties file should look like, what 
		 * the search path is and other salient elements.
		 * The name is appended to the path to create the search path.
		 * 
		 * @param {object} config The configuration information
		 * @config {String} name Name of the file to load, including path, e.g. lib/foo
		 * @config {String} [locale] Name of the locale, normally a language and country as described in the overview, e.g. en_US
		 * @config {String} [path] Path to use to search for bundle files, or undefined/null to use the default path
		 * @config {function} callback Function to call when bundle is loaded or has failed. The signature is callback(success,bundle,options)
		 * @config {Object} options Options to pass through to the callback
		 * @memberOf JSORM.ResourceBundle
		 */
		getBundle : function(config) {
			var name = config.name, locale = config.locale, callback = config.callback, ptopts = config.options, path, 
			i, url, rbopts, rbCallback, ajaxCallback, list, checker = [], count;
			
			// the paths we use
			path = config.path || myclass().path;


			// list of all those that would satisfy this list
			list = baseLocale(locale);


			// keep track of all the files we need to get
			for (i=0;i<list.length;i++) {
				url = path+name+(list[i]?'_'+list[i]:'') + '.properties';
				checker[i] = {complete: false, success: false, url: url,locale:list[i]};
			}
			// get each of the files
			count = {complete: 0, required: list.length};
			rbCallback = function(success,options) {
				// so we have finished with this fileName
				var ch = options.checker[options.index], allSuccess, bundle, j;
				ch.complete = true;
				options.count.complete++;
				// did we have success?
				ch.success = success;
				// did we finish them all? if so, we can find the actual bundle and do the callback
				if (options.count.complete === options.count.required && options.callback && typeof(options.callback) === 'function') {
					allSuccess = false;
					bundle = null;
					for (j=0;j<options.checker.length;j++) {
						if (options.checker[j].success) {
							allSuccess = true;
							bundle = bundles[options.checker[j].url];
							break;
						}
					}
					// get the actual bundle we would use and callback
					options.callback(allSuccess,bundle,options.options);
				}				
			};
			ajaxCallback = function(url,xmlHttp,success,options){
				// if we were successful, read in the bundle - read every bundle we get, even if 
				//   we have a specific match
				bundles[url] = success ? myclass()({name:options.name,locale:options.locale,data:xmlHttp.responseText}) : false;	
				options.rbc(success,options);
			};
			for (i=0;i<list.length;i++) {
				url = checker[i].url;
				rbopts = {url: url, checker: checker, index: i, callback: callback, count: count,
								name: name, givenLocale: locale, locale:list[i], options: ptopts};

				// did we already get this one?
				if (bundles[url] === false) {
					rbCallback.call(this,false,rbopts);
				} else if (bundles[url]) {
					rbCallback.call(this,true,rbopts);
				} else {
					// make the ajax call with the async callback
					rbopts.rbc = rbCallback;
					utils.getFile(url,ajaxCallback,rbopts);
				}
			}
		}
	};
}()));

