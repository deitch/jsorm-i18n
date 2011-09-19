/**
 * Construct a new TimeZone. In general, you should <b>never</b> construct a new TimeZone directly, but rather use TimeZone.getZone()
 * 
 * @class Represents a timezone. A timezone is responsible for reporting what the zoneoffset is between UTC and 
 * and the zone for a particular moment in time, i.e. accounting for standard time, DST and all other changes, when it can.
 * There are time when it cannot, for example when it is only created with an offset from UTC/GMT. 
 * <p/>
 * You use a TimeZone as follows:
 * <ol>
 * <li>Create a TimeZone by TimeZone.getZone()</li>
 * <li>Get the information (offset, isDst, abbreviation) for a particular moment in time using either 
 * getZoneInfo() or getZoneInfoUTC()</li>
 * <li>Get the name of the zone using getName()</li>
 * </ol>
 * <p/>
 * TimeZone retrieves its data from one of three places, depending on the zone name passed
 * <ul>
 * <li>Blank: it will use the current local timezone. It will have no knowledge of DST or other historical oddities</li>
 * <li>GMT[-|+]nnnn: it will assume that the offset from GMT is as given. It will have no knowledge of DST or other historical oddities</li>
 * <li>Name: if the name is one recognized as a standard elsie zoneinfo database, and the specialized i18n format of the database
 *     is available in an appropriate directory, then the data will be used. In this case, the full zone will be known, and
 *     DST and other historical oddities will be available.</li>
 * </ul>
 * <p/>
 * The full database from Elsie, specially compiled, is included as part of this distribution. It may need to be updated regularly. 
 * For more information about the Elsie database, see http://www.twinsun.com/tz/tz-link.htm
 * 
 * @param {String} name Name of the timezone for reference
 * @param {Object} zoneData Object with all our zone data, or null if we should just use the local machine default
 * @constructor
 */
/*global exports, utils, JSORM, JSON */
var extend = utils.extend, apply = utils.apply;
exports.TimeZone = extend({},function(n,d) {
	var zoneData = d, name = n, findTx;


	/**
	 * Find the last transaction in the data that applies before a given moment in time.
	 * 
	 * @param {long} secs Seconds since system Epoch (midnight at start of 1 January 1970 UTC) we are looking for
	 * @param {Object} zoneData Zone data as provided by the specially compiled zoneinfo files
	 * @param {boolean} zoned If the seconds passed were passed as seconds since system Epoch or local seconds
	 * @return {Array} Array containing the most recent entry. The elements of the array are [offset,isDst,abbreviation]
	 * @private
	 */
	findTx = function(secs,zoneData,zoned) {
		// this is easy - look through until the last transition - however, we may need to take into account the offsets if zoned==true
		var tx = zoneData.transitions, ty = zoneData.types, len = tx.length-1, i, offset, zi = ty[0];
		for (i=-1; i<len; i++) {
			offset = zoned ? zi[0] : 0;
			if (tx[i+1][0] > secs-offset) {
				break;
			} else {
				zi = ty[tx[i+1][1]];
			}
		}
		return(zi);
	};

	apply(this, /** @scope JSORM.TimeZone.prototype */{
		/**
		 * Get the name of the zone. This is either the standardized GMT[-|+]nnnn name or the actual name of the zoneinfo file.
		 * 
		 * @return {String} The name
		 */
		getName : function() {
			return(name);
		},
		/**
		 * Get the offset, whether or not in DST, and abbreviation to use for a particular moment in time. The moment
		 * in time is defined by passing the <u>local</u> date and time in the zone. If you wish to pass UTC time, use
		 * getZoneInfoUTC(). The following two examples are for New York City. The first shows standard time, the second
		 * daylight savings time.
		 * <br/>
		 * <table>
		 * <tr><th>Inputs</th><th>Output</th><th>Description</th></tr>
		 * <tr><td>getZoneInfo(1995,5,2,21,10,10)</td><td>{offset: -14400, isDst: 1, abbr: 'EDT'}</td><td>On 3 June 1995 at 21:10:10, 
		 *   the offset was 4 hours behind UTC, it was in DST, and the abbreviation is EDT</td></tr>
		 * <tr><td>getZoneInfo(1995,0,2,21,10,10)</td><td>{offset: -18000, isDst: 0, abbr: 'EST'}</td><td>On 3 January 1995 at 21:10:10, 
		 *   the offset was 5 hours behind UTC, it was not in DST, and the abbreviation is EST</td></tr>
		 * </table>
		 * 
		 * @param {int} year The year whose offset we are looking for
		 * @param {int} month The month in the year whose offset we are looking for, from 0-11
		 * @param {int} day The day in the month whose offset we are looking for, from 0-max
		 * @param {int} hour The hour in the day whose offset we are looking for, from 0-23
		 * @param {int} minute The minute in the hour whose offset we are looking for, from 0-59
		 * @param {int} second The second in the minute whose offset we are looking for, from 0-59
		 * @return {Object} Object with three elements: {offset: the_offset, isDst: 0|1, abbr: abbreviation}
		 */
		getZoneInfo : function(year,month,day,hour,minute,second) {
			var ret = {}, secs, d, zi;
			// seconds only, not milliseconds
			secs = Math.abs(Date.UTC(year,month,day+1,hour,minute,second)/1000);
			// do we have zone data or not?
			if (!zoneData) {
				d = new Date();
				d.setTime(secs*1000);
				ret = {offset: d.getTimezoneOffset()*-1, isDst: 0, abbr: ''};			
			} else {
				// now find the most recent transition
				zi = findTx(secs,zoneData,true);
				ret = {offset: zi[0], isDst: zi[1], abbr: zi[2]};
			}
			return(ret);
		},
		/**
		 * Get the offset, whether or not in DST, and abbreviation to use for a particular moment in time. The moment
		 * in time is defined by passing the <u>UTC</u> time in seconds since the system Epoch (midnight at the start of 1 January 1970 UTC). 
		 * If you wish to pass locale time, use getZoneInfo(). The following two examples are for New York City. The first shows 
		 * standard time, the second daylight savings time.
		 * <br/>
		 * <table>
		 * <tr><th>Inputs</th><th>Output</th><th>Description</th></tr>
		 * <tr><td>getZoneInfoUTC(802228210)</td><td>{offset: -14400, isDst: 1, abbr: 'EDT'}</td><td>On 3 June 1995 at 21:10:10, 
		 *  the offset was 4 hours behind UTC, it was in DST, and the abbreviation is EDT</td></tr>
		 * <tr><td>getZoneInfoUTC(789185410)</td><td>{offset: -18000, isDst: 0, abbr: 'EST'}</td><td>On 3 January 1995 at 21:10:10, 
		 *  the offset was 5 hours behind UTC, it was not in DST, and the abbreviation is EST</td></tr>
		 * </table>
		 * 
		 * @param {int} secs The seconds since the system Epoch whose offset we are looking for
		 * @return {Object} An object with three elements: {offset: the_offset, isDst: 0|1, abbr: abbreviation}
		 */
		getZoneInfoUTC : function(secs) {
			var ret = {}, offset, abbr, isDst, zi;
			// do we have zone data or not?
			if (!zoneData) {
				offset = new Date(secs).getTimezoneOffset()*-1;
				abbr = '';
				isDst = 0;
				ret = {offset: offset, isDst: isDst, abbr: abbr};
			} else {
				// get the transaction
				zi = findTx(secs,zoneData,false);
				ret = {offset: zi[0], isDst: zi[1], abbr: zi[2]};
			}
			return(ret);
		}
	});
}, (function() {
	var myclass = function(){return(exports.TimeZone);}, zones = {}, zonelist = null, version = 0, createGmtName;
	/**
	 * Create a standardized GMT name
	 * 
	 * @param {String} sign The sign to use, normally + or -
	 * @param {String} hr The hour to use
	 * @param {String} min The minute to use
	 * @return {String} Standardized GMT name in format GMT[+|-]nnnn
	 * @private
	 */
	createGmtName = function(sign,hr,min) {
		var name = 'GMT'+sign+(hr.length === 2 ? hr : '0'+hr) + ':';
		switch(min.length) {
			case 0:
				name+='00';
				break;
			case 1:
				name+='0'+min;
				break;
			case 2:
				name+=min;
				break;
		}
		return(name);
	};
	return /** @scope JSORM.TimeZone */{
		/**
		 * Base path to use for searching for zoneinfo data files. Change this to change the default. It can be overridden on each 
		 * TimeZone.getZone() call.
		 * @memberOf JSORM.TimeZone
		 */
		basepath : '/lib/',
		/**
		 * Search path to use for searching for zoneinfo data files, relative to basepath. 
		 * Change this to change the default. It can be overridden on each 
		 * TimeZone.getZone() call.
		 * @memberOf JSORM.TimeZone
		 */
		path : 'i18n/zoneinfo/',

		/**
		 * Report the version of zoneinfo information we are using. This will return a single string in the format "nnnna" where "nnnn" is the 
		 * year, e.g. 2007, and "a" is a letter. The first release of the year is a, the second is b, etc.
		 * <p/>
		 * This function is intelligent enough to know when the version is loaded and not go back to the server.<br/>
		 * Configuration information is an object with the following elements:
		 * <ul>
		 * <li>basepath: override the default basepath and use a different basepath</li>
		 * <li>path: relative path to use to search for zoneinfo files</li>
		 * <li>callback: function to call when zone is loaded or has failed. The signature is callback(success,version,options)</li>
		 * <li>options: options to pass through to the callback</li>
		 * </ul>
		 * 
		 * @param {object} config The configuration information. See above.
		 * @memberOf JSORM.TimeZone
		 */
		getVersion : function(config) {
			var T = myclass(), callback = config.callback, basepath = config.basepath || T.basepath, path = config.path || T.path;
			// do we already have the list?
			if (version) {
				callback.call(this,true,version);
			} else {
				utils.getFile(basepath+path+'+VERSION',function(url,xmlHttp,success,options) {
					if (success) {
						version = xmlHttp.responseText;
					}
					options.callback(success,version,options);
				},{callback: callback, options: config.options});
			}		
		},

		/**
		 * Get a list of all valid zoneinfo zone names. This will return an object containing all the known timezones. The object is as follows:
		 * {zones: {zoneName: {comments: comments, country: ISO standard 2-letter country code, coordinates: coordinates}}}
		 * <p/>
		 * This function is intelligent enough to know when the list is loaded and not go back to the server.<br/>
		 * 
		 * @param {Object} config The configuration information. See above.
		 * @config {String} basepath Override the default basepath and use a different basepath
		 * @config {String} path Relative path to use to search for zoneinfo files
		 * @config {Function} callback Function to call when list is loaded or has failed. The signature is callback(success,zonelist,options)
		 * @config {Object} options Options to pass through to the callback
		 * @memberOf JSORM.TimeZone
		 */
		getZoneList : function(config) {
			var T = myclass(), callback = config.callback, basepath = config.basepath || T.basepath, path = config.path || T.path;
			// do we already have the list?
			if (zonelist) {
				callback.call(this,true,zonelist);
			} else {
				utils.getFile(basepath+path+'zones',function(url,xmlHttp,success,options) {
					if (success) {
						zonelist = JSON.parse(xmlHttp.responseText);
					}
					options.callback(success,zonelist, options);
				},{callback: callback, options: config.options});
			}
		},

		/**
		 * Get a zone. This will return an object which is a TimeZone.
		 * This function is intelligent enough to know when the zone is already loaded and not go back to the server.
		 * 
		 * @param {Object} config The configuration information. See above.
		 * @config {String} name The name of the zone to load, or undefined/null if you want to use the local time
		 * @config {String} basepath Override the default basepath and use a different basepath</li>
		 * @config {String} path Relative path to use to search for zoneinfo files</li>
		 * @config {Function} callback Function to call when list is loaded or has failed. The signature is callback(success,zonelist,options)</li>
		 * @config {Object} options Options to pass through to the callback</li>
		 * @memberOf JSORM.TimeZone
		 */
		getZone : function(config) {
			var tzClass = myclass(), name = config.name, callback = config.callback, options = config.options,
			zone, tzinfo, m, offset, dstIncr, zoneName, basepath, path;

			if (!name) {
				name = "local";

				// do we have it? if not, generate it
				zone = zones[name];
				if (!zone) {
					// null zoneData means just calculate directly
					zone = tzClass(name,null);
					zones[name] = zone;				
				}
				callback.call(this,true,zone,options);
			} else {
				// check if it already exists
				zone = zones[name];
				if (zone) {
					callback.call(this,true,zone,options);
				} else {
					// we need to know if it is a GMT+/-HH:mm timezone
					// is it a kind that we can process using zoneinfo?
					m = /^\s*GMT([\+\-])(\d\d?):?(\d?\d?)$/.exec(name);
					if (m) {
						// we can find the standard offset, but not the DST, since GMT+/-hh:mm gives us no
						//    DST info
						offset = (parseInt(m[2],10)*60+parseInt(m[3],10))*60*(m[1] === '+' ? 1 : -1);
						dstIncr = 0;
						zoneName = createGmtName(m[1],m[2],m[3]);
						// do we have it? if not, generate it
						zone = zones[zoneName];
						if (!zone) {
							zone = tzClass(zoneName,{leaps:[],transitions:[],types:[[offset,0,zoneName]]});
							zones[zoneName] = zone;
						}
						callback.call(this,true,zone,options);
					} else {
						// we will try to use zoneinfo
						basepath = config.basepath || tzClass.basepath;
						path = config.path || tzClass.path;
						// we need to set up the correct path
						utils.getFile(basepath+path+name,function(url,xmlHttp,success,options) {
							/*
							 * Format of the JSON is:
							 *     {
							 *      leaps: [[sec1,cum_leap_seconds],[sec2,cum_leap_seconds],..,[secN,cum_leap_seconds],
							 *      transitions: [[sec1,type1],[sec2,type2],..,[secN,typeN]],
							 *      types: [[offset,isdst,name],[offset,isdst,name],..,[offset,isdst,name]]
							 *     }
							 * 
							 * Where any secN is the number of seconds since the Unix epoch (midnight at the beginning of Jan 1, 1970 UTC)
							 * Where cum_leap_seconds is the total leap seconds (not the addition at that moment) as of that moment
							 * Where typeN is the index into the types array for the zone settings that begin at that sec
							 * Where the offset is offset from UTC, isdst is 0/1 for being DST, and name is the short form name for the zone
							 */
							if (success) {
								// this eval is evil, but we want to parse functions, no way to do that in JSON
								/*jslint evil:true */
								tzinfo = eval("("+xmlHttp.responseText+")");
								/*jslint evil:false */
								zone = tzClass(options.name,tzinfo);
								zones[options.name] = zone;								
							}
							options.callback(success,zone,options.options);
						},{name: name, callback: callback,options:options});
					}
				}
			}
		}

	};
}()));

