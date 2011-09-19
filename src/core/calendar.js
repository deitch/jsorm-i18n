/*global exports,utils,JSORM */
/**
 * You should <b>not</b> use the constructor for calendar. Use calendar.getCalendar() instead.
 * 
 * @class A calendar is an object that manages and gives information for a single moment in time under a single timezone,
 * for a single locale and under a single calendaring system. Unlike the javascript Date object, calendar can use multiple calendars,
 * any locale, and any timezone. In general, one uses a calendar object as follows:
 * <ol>
 * <li>Determine the specific moment in time you want, and create a javascript date object around it</li>
 * <li>Determine the desired locale, and save its name</li>
 * <li>Determine the desired timezone, and either save its name or load its object TimeZone</li>
 * <li>Determine the specific calendar implementation you want, e.g. Gregorian, Julian, Hebrew, Muslim, etc.</li>
 * <li>Call calendar.getCalendar(config) #getCalendar, where the config contains all the configuration information just determined, 
 *    as well as the correct callback</li>
 * <li>Get the fields whose information you want.</li>
 * <li>Set any fields and then get more fields .</li>
 * <li>Change the locale or timezone, then set and get more fields</li>
 * </ol>
 * <p/>
 * 
 * <table>
 * <tr><th>Field</th><th>Range</th><th>Meaning</th></tr>
 * <tr><td>YEAR</td><td>Any</td><td>year in the calendar implementation</td></tr>
 * <tr><td>MONTH</td><td>1 to 12 or 13, depending on calendar implementation</td><td>month in the given year</td></tr>
 * <tr><td>DATE</td><td>1 to max, depending on the month and calendar implementation</td><td>date in the given month</td></tr>
 * <tr><td>DAY_OF_YEAR</td><td>1 to max, depending on calendar implementation</td><td>day of the given year this is</td></tr>
 * <tr><td>LEAP</td><td>either 0 or 1</td><td>whether or not the year is a leap year</td></tr>
 * <tr><td>ERA</td><td>0 or 1</td><td>1 for AD/CE, 0 for BC/BCE</td></tr>
 * <tr><td>DAY_OF_WEEK</td><td>0 (Sunday) through 6 (Saturday)</td><td>day of week of the given date</td></tr>
 * <tr><td>DAY_OF_WEEK_IN_MONTH</td><td>1 to 5</td><td>incidence of the day of week in the given month</td></tr>
 * <tr><td>WEEK_OF_YEAR</td><td>0 through 53</td><td>week of the year for the given date</td></tr>
 * <tr><td>WEEK_OF_MONTH</td><td>0 through 5</td><td>week of the given month for the given date</td></tr>
 * <tr><td>ZONE_OFFSET</td><td>-86400 through 86400</td><td>actual offset from UTC/GMT for the given moment in time for this zone, in seconds</td></tr>
 * <tr><td>DST</td><td>0 through 1</td><td>1 if the zone is currently known to be in DST, 0 otherwise</td></tr>
 * <tr><td>ZONENAME</td>N/A<td></td><td>name of the zone as provided by the zone parameter</td></tr>
 * <tr><td>RFC822</td><td>-2400 through +2400</td><td>rfc822-compliant form of the name of the zone at the given moment in time</td></tr>
 * <tr><td>ISO_YEAR</td><td>Any</td><td>year according to the ISO commercial calendar</td></tr>
 * <tr><td>ISO_WEEK_OF_YEAR</td><td>1 through 53</td><td>week of the year according to the ISO commercial calendar</td></tr>
 * <tr><td>HOUR_OF_DAY</td><td>0 (midnight) to 23</td><td>24-hour format hour of the day from </td></tr>
 * <tr><td>HOUR</td><td>1 through 12</td><td>12-hour format hour of the day</td></tr>
 * <tr><td>AM_PM</td><td>0 or 1</td><td>0 from midnight until just before noon, 1 from noon until just before midnight</td></tr>
 * <tr><td>MINUTE</td><td>0 through 59</td><td>minute of the hour</td></tr>
 * <tr><td>SECOND</td><td>0 through 59</td><td>second of the minute</td></tr>
 * <tr><td>MILLISECOND</td><td>0 through 999</td><td>millisecond of the second</td></tr>
 * </table>
 * NOTE: field numbers are always 0 to (max-1) rather than 1 to max unless it makes no sense that way (e.g. year) 
 *       or is explicitly specified. Known exceptions are: HOUR (1-12)
 * <p/>
 * Note that when using set for a field, values that are too large or too small are acceptable. On the next recomputation,
 * the field will be properly normalized. For example, if the month is January and you set the date to 35, the next recomputation
 * will show a date of 5 February.
 * 
 * calendar also handles formatting of the calendar object. It supports three strings for formatting:
 * <ul>
 * <li>Java DateFormat</li>
 * <li>PHP date()</li>
 * <li>strftime()</li>
 * </ul>
 * <p/>
 * In order to implement a specific calendar implementation, e.g. Gregorian, the implementation must follow the contract set forth
 * in CalendarImpl. This is normally provided by core developers, rather than calendar users.
 * In general, you should <b>never</b> directly instantiate a calendar. Rather you should use #getCalendar.
 * @constructor
 * @param {Object} config A configuration object with the necessary parameters to construct the calendar object. They are:
 * @config {Date} date JavaScript date object with the moment in time to be managed by this calendar instance. If empty, will use right now.
 * @config {TimeZone} zone TimeZone object representing the timezone for this calendar
 * @config {String} locale Name of the locale to use for this calendar
 * @config {String} calendar Name of the calendar implementation to use for this calendar, in lower-case, e.g. 'gregorian'
 * @config {String} basepath Base path to use for getting to locales, relative to the page URL
 * @config {String} localePath Path to use for getting to locales, relative to the page URL
 * @config {function} callback Callback function to use when the calendar object is fully ready or has failed. The signature of the 
 * callback is as in getCalendar().
 * @constructor
 */
var extend = utils.extend, apply = utils.apply, zeropad = utils.zeropad;
exports.calendar = extend({}, (function() {

	// system epoch, relative to RD0
	var EPOCH_YEAR = 1970, EPOCH_DAYS = 719163, 
	/**
	 * Constants for milliseconds in a minute, hour, day, week.
	 * 
	 * @memberOf JSORM.calendar
	 * @private
	 */
	ms1m = 60*1000, ms1h = 3600*1000, ms1d = 3600*1000*24, ms7d = 7*3600*1000*24,
	/**
	 * ISO standard date 
	 * @private
	 */
	iso = {date: 'yyyy-MM-DD', time: 'H:i:sP'},
	JAVA = 'J', PHP = 'P', STRFTIME = 'S',
	sec, formatters = {}, formats, mod, processWeekCount;

	// some second constants
	sec = {
		minute : 60, // seconds in a minute
		hour : 60 * 60, // seconds in an hour
		day : 60 * 60 * 24, // seconds in a day
		week : 7 * 60 * 60 * 24, // seconds in a week
		epoch : 719163 * 60 * 60 * 24 // seconds since the RD0 epoch (Jan 1, 0001)
	};
	
	
	/*
	 * Formatting functions
	 */	

	/*
	 * Java-style - single or multiple characters, and '' for literals
	 *  See http://java.sun.com/javase/6/docs/api/java/text/SimpleDateFormat.html
	 * JSORM.calendar.JAVA = 'J
	 * 
	 */
	formatters[JAVA] = {
		fn : function(format,formatter,cal) {
			/*
			 * here is how we process it
			 * we go through each letter, which has one of several possibilities:
			 * 1) A new letter: we keep it in a buffer, process the last one, and check the next
			 * 2) The same as the previous: increment the count for the previous and check the next
			 * 3) Last letter: treat like 1 or 2, but then process
			 * 4) Non-letter: pass it on as literal
			 * 5) Single-quote (''): everything from the first to the next is treated as a literal
			 */
			var str = '', buf = '', l = '', count = 1, e = false, i, f;
			for (i=0; i<format.length; i++) {
				f = format[i];
				// Single-quote means literal
				if (f === '\'') {
					// did we have a previous one?
					if (e) {
						str += buf;
						buf = '';
						e = false;
					} else {
						buf = '';
						e = true;
					}
					// we do not record any last letter
					l = '';
				} else if (e) {
					// we are already escaped
					buf += f;
				} else if (f === l) {
					// same as last letter; just increment the count
					count++;
				} else {
					// not the same as the last letter - process the last letter
					if (formatter[l]) {str += formatter[l].fn(cal,count);}
					
					// do we have a formatter for the new letter?
					if (formatter[f]) {
						l = f;
						count = 1;
					} else {
						l = '';
						str += f;
						count = 0;
					}
				}
			}
			// after the last one, we need to process it
			if (formatter[l]) {
				str += formatter[l].fn(cal,count);
			}
			return(str);
		},
		codes : {
			G : {fn: function(cal,len) { return (cal.getTextEra());}, desc: 'Era designator (AD/BC)'},
			y : {fn: function(cal,len) { 
					return(zeropad(cal.getYear(),len).slice(len*-1));
				}, desc: 'Year 07;2007'},
			M : {fn: function(cal,len) {
					var m = cal.getMonth();
					switch (len) {
						case 1:
							m = zeropad(m,len).slice(2*-1);
							break;
						case 2:
							m = zeropad(m,len).slice(len*-1);
							break;
						case 3:
							m = cal.getTextMonthShort();
							break;
						default:
							m = cal.getTextMonthLong();
							break;
					}
					return(m);
				}, desc: 'Month in year 07;Jul;July'},
			w : {fn: function(cal,len) {
					return(zeropad(cal.get('ISO_WEEK_OF_YEAR'),len));
				}, desc: 'ISO week in year 1-53'},
			W : {fn: function(cal,len) {
					return(cal.getWeekOfMonth());
				}, desc: 'Week in month 1-5'},
			D : {fn: function(cal,len) {
					return(zeropad(cal.getDayOfYear(),len));
				}, desc: 'Day in year 1-365'},
			d : {fn: function(cal,len) {
					return(zeropad(cal.getDate(),len));
				}, desc: 'Day in month 1-31'},
			F : {fn: function(cal,len) {
					return(cal.getDayOfWeekInMonth());
				}, desc: 'Incidence of day of week in month - 2nd Tuesday in month: 2'},
			E : {fn: function(cal,len) {
					return(cal.getTextDayOfWeek(len<=3));
				}, desc: 'Day in week Tue/Tuesday'},
			a : {fn: function(cal,len) {
					return(cal.getTextAmPm());
				}, desc: 'am/pm marker in capitals AM/PM'},
			H : {fn: function(cal,len) {return(zeropad(cal.getHourOfDay(),len)); }, desc: 'Hour in day 0-23'},
			k : {fn: function(cal,len) {return(zeropad(cal.getHourOfDay()===0?24:cal.getHourOfDay(),len)); }, desc: 'Hour in day 1-24'},
			K : {fn: function(cal,len) {return(zeropad(cal.getHour()%12,len));}, desc: 'Hour in am/pm 0-11'},
			h : {fn: function(cal,len) {return(zeropad(cal.getHour(),len));}, desc: 'Hour in am/pm 1-12'},
			m : {fn: function(cal,len) {return(zeropad(cal.getMinute(),len));}, desc: 'Minute in hour'},
			s : {fn: function(cal,len) {return(zeropad(cal.getSecond(),len));}, desc: 'Second in minute'},
			S : {fn: function(cal,len) {return(zeropad(cal.getMillisecond(),len));}, desc: 'Millisecond'},
			z : {fn: function(cal,len) {return(cal.getZoneName());}, desc: 'Time zone - Pacific Standard Time;PST;GMT-08:00'},
			Z : {fn: function(cal,len) {return(cal.getRfc822());}, desc: 'Time zone as RFC 822 format - -0800'}
		}
	};
	/*
	 * PHP-style - single characters for each and \ for literals
	 * see http://www.php.net/date
	 * JSORM.calendar.PHP = 'P'
	 */
	formatters[PHP] = {
		fn : function(format,formatter,cal) {
			/*
			 * here is how we process it
			 * we go through each letter, which has one of several possibilities:
			 * 1) \ (backslash) - escape the next character to literal
			 * 2) Known letter - transform
			 * 3) Unknown letter - treat as literal
			 */
			var str = '', e = false, i, f;
			for (i=0; i<format.length; i++) {
				f = format[i];
				// Single-quote means literal
				if (f === '\\') {
					// did we have a previous one?
					if (e) {
						str += f;
						e = false;
					} else {
						e = true;
					}
				} else if (e) {
					// we are already escaped
					str += f;
				} else if (formatter[f]) {
					str += formatter[f].fn(cal);						
				} else {
					str += f;
				}
			}
			return(str);
		},
		codes : {
			d : {fn: function(cal) {return(zeropad(cal.getDate(),2));}, desc: 'Day of the month, 2 digits with leading zeros'},
			D : {fn: function(cal) {return(cal.getTextDayOfWeekShort().substring(0,3));}, desc: 'A textual representation of a day, three letters'},
			j : {fn: function(cal) {return(cal.getDate());}, desc: 'Day of the month without leading zeros'},
			l : {fn: function(cal) {return(cal.getTextDayOfWeekLong());}, desc: 'A full textual representation of the day of the week'},
			N : {fn: function(cal) {var dow = cal.getDayOfWeek(); return(dow === 0 ? 7 : dow);}, desc: 'ISO-8601 numeric representation of the day of the week 1-7 for Mon-Sun'},
			S : {fn: function(cal) {return(cal.getTextCount());}, desc: 'English ordinal suffix for the day of the month, 2 characters'},
			w : {fn: function(cal) {return(cal.getDayOfWeek());}, desc: 'Numeric representation of the day of the week 0-6 for Sun-Sat'},
			z : {fn: function(cal) {return(cal.getDayOfYear()-1);}, desc: 'Day of the year 0-364/5'},
			W : {fn: function(cal) {return(cal.get('ISO_WEEK_OF_YEAR'));}, desc: 'ISO-8601 week number of year, weeks starting on Monday'},
			F : {fn: function(cal) {return(cal.getTextMonthLong());}, desc: 'A full textual representation of a month, such as January or March'},
			m : {fn: function(cal) {return(zeropad(cal.getMonth(),2));}, desc: 'Numeric representation of a month, with leading zeros 01-12'},
			M : {fn: function(cal) {return(cal.getTextMonthShort().substring(0,3));}, desc: 'A short textual representation of a month, three letters Jan-Dec'},
			n : {fn: function(cal) {return(cal.getMonth());}, desc: 'Numeric representation of a month, without leading zeros 1-12'},
			t : {fn: function(cal) {return(cal.getMax('DATE'));}, desc: 'Number of days in the given month'},
			L : {fn: function(cal) {return(cal.isLeap() ? 1 : 0);}, desc: 'leap year 1 for yes, 0 for no'},
			o : {fn: function(cal) {return(cal.get('ISO_YEAR'));}, desc: 'ISO-8601 year number. This has the same value as Y, except that if the ISO week number (W) belongs to the previous or next year, that year is used instead.'},
			Y : {fn: function(cal) {return(cal.getYear());}, desc: 'Full numeric representation of the year'},
			y : {fn: function(cal) {return(zeropad(cal.getYear(),2).slice(-2));}, desc: '2-digit numeric representation of the year'},
			a : {fn: function(cal) {return(cal.getTextAmPm().toLowerCase());}, desc: 'Lowercase am and pm'},
			A : {fn: function(cal) {return(cal.getTextAmPm().toUpperCase());}, desc: 'Uppercase AM and PM'},
			g : {fn: function(cal) {return(cal.getHour());}, desc: '12-hour format of an hour without leading zeros 1-12'},
			G : {fn: function(cal) {return(cal.getHourOfDay());}, desc: '24-hour format of an hour without leading zeros 0-23'},
			h : {fn: function(cal) {return(zeropad(cal.getHour(),2));}, desc: '12-hour format of an hour with leading zeros 01-12'},
			H : {fn: function(cal) {return(zeropad(cal.getHourOfDay(),2));}, desc: '24-hour format of an hour with leading zeros 00-23'},
			i : {fn: function(cal) {return(zeropad(cal.getMinute(),2));}, desc: 'Minutes with leading zeros 00-59'},
			s : {fn: function(cal) {return(zeropad(cal.getSecond(),2));}, desc: 'Seconds, with leading zeros 00-59'},
			u : {fn: function(cal) {return(cal.getMillisecond());}, desc: 'Milliseconds'},
			e : {fn: function(cal) {return(cal.getZone().getName());}, desc: 'Timezone'},
			I : {fn: function(cal) {return(cal.get('DST'));}, desc: 'If date is in daylight savings time: 1 for DST, 0 for not'},
			O : {fn: function(cal) {return(cal.getRfc822());}, desc: 'Difference to Greenwich time (GMT) in hours -0500'},
			P : {fn: function(cal) {var v = cal.getRfc822(); return(v.slice(0,v.length-2)+':'+v.slice(-2));}, desc: 'Difference to Greenwich time (GMT) with colon between hours and minutes -05:00'},
			T : {fn: function(cal) {return(cal.getZoneName());}, desc: 'Timezone abbreviation EST MDT PST'},
			c : {fn: function(cal) {return(cal.format('Y-m-d H:i:sP',PHP));}, desc: 'ISO 8601 date 2007-11-27T14:35:50-05:00 equal to Y-m-d H:i:sP'},
			r : {fn: function(cal) {return(cal.format('D, d-M-Y H:i:s O',PHP));}, desc: 'RFC 822 date Thu, 21 Dec 2000 16:01:07 +0200 equal to D, d-M-Y H:i:s O'},
			U : {fn: function(cal) {return(cal.getTime()/1000);}, desc: 'Seconds since the Unix epoch January 1 1970 00:00:00 GMT'}
		}
	};
	/*
	 * strftime - each formatting character is preceded by %, everything else is passed through as literal
	 * see http://opengroup.org/onlinepubs/007908799/xsh/strftime.html	
	 * JSORM.calendar.STRFTIME = 'S'
	 */
	formatters[STRFTIME] = {
		fn : function(format,formatter,cal) {
			/*
			 * here is how we process it
			 * we go through each letter, which has one of several possibilities:
			 * 1) % - use the formatter for the next character
			 * 2) Known letter after % - convert
			 * 3) Anything else - literal
			 */
			var str = '', e = false, i, f;
			for (i=0; i<format.length; i++) {
				f = format[i];
				// Are we already in a formatter
				if (e) {
					// we looking for a formatter
					if (formatter[f]) {
						str += formatter[f].fn(cal);							
					}
					e = false;						
				} else if (f === '%') {
					e = true;
				} else {
					str += f;
				}
			}
			return(str);
		},
		codes : {
			a: {fn: function(cal) { return cal.getTextDayOfWeekShort().substring(0,3);}, desc: 'abbreviated weekday name according to the current locale'},
			A: {fn: function(cal) { return cal.getTextDayOfWeekLong();}, desc: 'full weekday name according to the current locale'},
			b: {fn: function(cal) { return cal.getTextMonthShort().substring(0.3);}, desc: 'abbreviated month name according to the current locale'},
			B: {fn: function(cal) { return cal.getTextMonthLong();}, desc: 'full month name according to the current locale'},
			c: {fn: function(cal) { return new Date(cal.getTime()).toString();}, desc: 'preferred date and time representation for the current locale'},
			C: {fn: function(cal) { return zeropad(cal.getYear(),4).substring(0,2);}, desc: 'century number (the year divided by 100 and truncated to an integer) as a decimal number [00-99].'},
			d: {fn: function(cal) { return zeropad(cal.getDate(),2);}, desc: 'day of the month as a decimal number (range 01 to 31)'},
			D: {fn: function(cal) { return cal.format('%m/%d/%y',STRFTIME);}, desc: 'Same as %m/%d/%y'},
			e: {fn: function(cal) { var date = cal.getDate(); return((date<10?' ':'')+date.toString());}, desc: 'day of the month as a decimal number [1,31]; a single digit is preceded by a space'},
			h: {fn: function(cal) { return cal.format('%b',STRFTIME); }, desc: 'Same as %b'},
			H: {fn: function(cal) { return zeropad(cal.getHourOfDay(),2);}, desc: 'hour as a decimal number using a 24-hour clock (range 00 to 23)'},
			I: {fn: function(cal) { return zeropad(cal.getHour(),2);}, desc: 'hour as a decimal number using a 12-hour clock (range 01 to 12)'},
			j: {fn: function(cal) { return zeropad(cal.getDayOfYear(),3);}, desc: 'day of the year as a decimal number [001,366]'},
			m: {fn: function(cal) { return zeropad(cal.getMonth(),2);}, desc: 'month as a decimal number (range 01 to 12)'}, // month-1
			M: {fn: function(cal) { return zeropad(cal.getMinute(),2);}, desc: 'minute as a decimal number'},
			n: {fn: function(cal) { return '\n';}, desc: 'Newline character'},
			p: {fn: function(cal) { return cal.getTextAmPm().toUpperCase();}, desc: 'either am or pm according to the given time value, or the corresponding strings for the current locale'},
			r: {fn: function(cal) { return cal.format('%I:%M:%S %p',STRFTIME);}, desc: 'time in a.m. and p.m. notation; in the POSIX locale this is equivalent to %I:%M:%S %p'},
			R: {fn: function(cal) { return cal.format('%H:%M',STRFTIME);}, desc: 'time in 24 hour notation (%H:%M)'},
			S: {fn: function(cal) { return zeropad(cal.getSecond(),2);}, desc: 'second as a decimal number'},
			t: {fn: function(cal) { return '\t';}, desc: 'tab character'},
			T: {fn: function(cal) { return cal.format('%H:%M:%S',STRFTIME);}, desc: 'time (%H:%M:%S)'},
			u: {fn: function(cal) { return cal.getDayOfWeek()===0?cal.getDayOfWeek()+7:cal.getDayOfWeek();}, desc: 'weekday as a decimal number [1,7], with 1 representing Monday'},
			U: {fn: function(cal) { return zeropad(cal.getWeekOfYear(),2);}, desc: 'week number of the year (Sunday as the first day of the week) as a decimal number [00,53]'},
			V: {fn: function(cal) { return zeropad(cal.getWeekOfYear()+1,2);}, desc: 'week number of the year (Monday as the first day of the week) as a decimal number [01,53]. If the week containing 1 January has four or more days in the new year, then it is considered week 1. Otherwise, it is the last week of the previous year, and the next week is week 1'},
			w: {fn: function(cal) { return cal.getDayOfWeek();}, desc: 'day of the week as a decimal, Sunday being 0'}, // 0..6 == sun..sat
			W: {fn: function(cal) { return zeropad(cal.getWeekOfYear(),2);}, desc: 'week number of the year (Monday as the first day of the week) as a decimal number [00,53]. All days in a new year preceding the first Monday are considered to be in week 0'},
			x: {fn: function(cal) { return cal.date();}, desc: 'locale appropriate date representation'}, 
			X: {fn: function(cal) { return cal.getTime();}, desc: 'locale appropriate time representation'}, 
			y: {fn: function(cal) { return zeropad(cal.getYear(),2).slice(-2);}, desc: 'year as a decimal number without a century (range 00 to 99)'},
			Y: {fn: function(cal) { return zeropad(cal.getYear(),4);}, desc: 'year as a decimal number including the century'},
			Z: {fn: function(cal) { return cal.getZoneName();}, desc: 'Zone name'},
			'%': {fn: function(cal) { return '%';}, desc: 'Literal %'}
		}
	};
	/**
	 * Standard date formats based on country codes
	 * @private
	 */
	formats = {
		AF : {name : 'AFGHANISTAN', date : ''},
		AX : {name : '\u00c5LAND ISLANDS', date : ''},
		AL : {name : 'ALBANIA', date : 'dd/mm/yyyy'},
		DZ : {name : 'ALGERIA', date : ''},
		AS : {name : 'AMERICAN SAMOA', date : ''},
		AD : {name : 'ANDORRA', date : ''},
		AO : {name : 'ANGOLA', date : ''},
		AI : {name : 'ANGUILLA', date : ''},
		AQ : {name : 'ANTARCTICA', date : ''},
		AG : {name : 'ANTIGUA AND BARBUDA', date : ''},
		AR : {name : 'ARGENTINA', date : 'dd/mm/yyyy'},
		AM : {name : 'ARMENIA', date : 'dd.mm.yyyy'},
		AW : {name : 'ARUBA', date : ''},
		AU : {name : 'AUSTRALIA', date : 'dd/mm/yyyy'},
		AT : {name : 'AUSTRIA', date : 'yyyy-mm-dd'},
		AZ : {name : 'AZERBAIJAN', date : ''},
		BS : {name : 'BAHAMAS', date : ''},
		BH : {name : 'BAHRAIN', date : ''},
		BD : {name : 'BANGLADESH', date : 'dd/mm/yyyy'},
		BB : {name : 'BARBADOS', date : 'dd/mm/yyyy'},
		BY : {name : 'BELARUS', date : 'dd/mm/yyyy'},
		BE : {name : 'BELGIUM', date : 'dd/mm/yyyy'},
		BZ : {name : 'BELIZE', date : 'dd/mm/yyyy'},
		BJ : {name : 'BENIN', date : ''},
		BM : {name : 'BERMUDA', date : ''},
		BT : {name : 'BHUTAN', date : ''},
		BO : {name : 'BOLIVIA', date : 'dd/mm/yyyy'},
		BA : {name : 'BOSNIA AND HERZEGOVINA', date : ''},
		BW : {name : 'BOTSWANA', date : ''},
		BV : {name : 'BOUVET ISLAND', date : ''},
		BR : {name : 'BRAZIL', date : 'dd/mm/yyyy'},
		IO : {name : 'BRITISH INDIAN OCEAN TERRITORY', date : ''},
		BN : {name : 'BRUNEI DARUSSALAM', date : ''},
		BG : {name : 'BULGARIA', date : 'dd.mm.yyyy'},
		BF : {name : 'BURKINA FASO', date : ''},
		BI : {name : 'BURUNDI', date : ''},
		KH : {name : 'CAMBODIA', date : ''},
		CM : {name : 'CAMEROON', date : ''},
		CA : {name : 'CANADA', date : 'dd/mm/yyyy'},
		CV : {name : 'CAPE VERDE', date : ''},
		KY : {name : 'CAYMAN ISLANDS', date : ''},
		CF : {name : 'CENTRAL AFRICAN REPUBLIC', date : ''},
		TD : {name : 'CHAD', date : ''},
		CL : {name : 'CHILE', date : 'dd/mm/yyyy'},
		CN : {name : 'CHINA', date : 'yyyy\u5e74mm\u6708dd\u65e5'},
		CX : {name : 'CHRISTMAS ISLAND', date : ''},
		CC : {name : 'COCOS (KEELING) ISLANDS', date : ''},
		CO : {name : 'COLOMBIA', date : 'dd/mm/yyyy'},
		KM : {name : 'COMOROS', date : ''},
		CD : {name : 'CONGO, THE DEMOCRATIC REPUBLIC OF THE', date : ''},
		CK : {name : 'COOK ISLANDS', date : ''},
		CR : {name : 'COSTA RICA', date : ''},
		CI : {name : 'C\u00d4TE D\'IVOIRE', date : ''},
		HR : {name : 'CROATIA', date : 'd.m.yyyy.'},
		CU : {name : 'CUBA', date : ''},
		CY : {name : 'CYPRUS', date : 'dd/mm/yyyy'},
		CZ : {name : 'CZECH REPUBLIC', date : 'd.m.yyyy'},
		DK : {name : 'DENMARK', date : 'dd-mm-yyyy'},
		DJ : {name : 'DJIBOUTI', date : ''},
		DM : {name : 'DOMINICA', date : 'dd/mm/yyyy'},
		DO : {name : 'DOMINICAN REPUBLIC', date : 'dd/mm/yyyy'},
		EC : {name : 'ECUADOR', date : 'dd/mm/yyyy'},
		EG : {name : 'EGYPT', date : 'dd/mm/yyyy'},
		SV : {name : 'EL SALVADOR', date : 'dd/mm/yyyy'},
		GQ : {name : 'EQUATORIAL GUINEA', date : ''},
		ER : {name : 'ERITREA', date : ''},
		EE : {name : 'ESTONIA', date : 'dd/mm/yyyy'},
		ET : {name : 'ETHIOPIA', date : ''},
		FK : {name : 'FALKLAND ISLANDS (MALVINAS)', date : ''},
		FO : {name : 'FAROE ISLANDS', date : ''},
		FJ : {name : 'FIJI', date : ''},
		FI : {name : 'FINLAND', date : 'd.m.yyyy'},
		FR : {name : 'FRANCE', date : 'dd/mm/yyyy'},
		GF : {name : 'FRENCH GUIANA', date : 'dd-mm-yyyy'},
		PF : {name : 'FRENCH POLYNESIA', date : ''},
		TF : {name : 'FRENCH SOUTHERN TERRITORIES', date : ''},
		GA : {name : 'GABON', date : ''},
		GM : {name : 'GAMBIA', date : ''},
		GE : {name : 'GEORGIA', date : ''},
		DE : {name : 'GERMANY', date : ''},
		GH : {name : 'GHANA', date : ''},
		GI : {name : 'GIBRALTAR', date : ''},
		GR : {name : 'GREECE', date : 'dd/mm/yyyy'},
		GL : {name : 'GREENLAND', date : ''},
		GD : {name : 'GRENADA', date : 'dd/mm/yyyy'},
		GP : {name : 'GUADELOUPE', date : ''},
		GU : {name : 'GUAM', date : ''},
		GT : {name : 'GUATEMALA', date : ''},
		GG : {name : 'GUERNSEY', date : ''},
		GN : {name : 'GUINEA', date : ''},
		GW : {name : 'GUINEA-BISSAU', date : ''},
		GY : {name : 'GUYANA', date : 'dd/mm/yyyy'},
		HT : {name : 'HAITI', date : ''},
		HM : {name : 'HEARD ISLAND AND MCDONALD ISLANDS', date : ''},
		HN : {name : 'HONDURAS', date : ''},
		HK : {name : 'HONG KONG', date : 'dd/mm/yyyy'},
		HU : {name : 'HUNGARY', date : 'yyyy.mm.dd'},
		IS : {name : 'ICELAND', date : 'dd.mm.yyyy'},
		IN : {name : 'INDIA', date : 'DD/MM/yyyy'},
		ID : {name : 'INDONESIA', date : 'dd-mm-yyyy'},
		IR : {name : 'IRAN, ISLAMIC REPUBLIC OF', date : 'dd/mm/yyyy'},
		IQ : {name : 'IRAQ', date : ''},
		IE : {name : 'IRELAND', date : 'dd/mm/yyyy'},
		IM : {name : 'ISLE OF MAN', date : ''},
		IL : {name : 'ISRAEL', date : 'dd/mm/yyyy'},
		IT : {name : 'ITALY', date : 'dd/mm/yyyy'},
		JM : {name : 'JAMAICA', date : 'dd/mm/yyyy'},
		JP : {name : 'JAPAN', date : 'yyyy\u5e74m\u6708d\u65e5'},
		JE : {name : 'JERSEY', date : ''},
		JO : {name : 'JORDAN', date : 'dd/mm/yyyy'},
		KZ : {name : 'KAZAKHSTAN', date : ''},
		KE : {name : 'KENYA', date : 'dd/mm/yyyy'},
		KI : {name : 'KIRIBATI', date : ''},
		KP : {name : 'KOREA, DEMOCRATIC PEOPLE\'S REPUBLIC OF', date : 'yyyy\ub144 MM\uc6d4 DD\uc77c'},
		KR : {name : 'KOREA, REPUBLIC OF', date : 'yyyy\ub144 MM\uc6d4 DD\uc77c'},
		KW : {name : 'KUWAIT', date : ''},
		KG : {name : 'KYRGYZSTAN', date : ''},
		LA : {name : 'LAO PEOPLE\'S DEMOCRATIC REPUBLIC', date : ''},
		LV : {name : 'LATVIA', date : 'dd.mm.yyyy'},
		LB : {name : 'LEBANON', date : ''},
		LS : {name : 'LESOTHO', date : ''},
		LR : {name : 'LIBERIA', date : ''},
		LY : {name : 'LIBYAN ARAB JAMAHIRIYA', date : ''},
		LI : {name : 'LIECHTENSTEIN', date : ''},
		LT : {name : 'LITHUANIA', date : 'yyyy-mm-dd'},
		LU : {name : 'LUXEMBOURG', date : ''},
		MO : {name : 'MACAO', date : 'dd/mm/yyyy'},
		MK : {name : 'MACEDONIA, THE FORMER YUGOSLAV REPUBLIC OF', date : ''},
		MG : {name : 'MADAGASCAR', date : ''},
		MW : {name : 'MALAWI', date : ''},
		MY : {name : 'MALAYSIA', date : 'dd/mm/yyyy'},
		MV : {name : 'MALDIVES', date : ''},
		ML : {name : 'MALI', date : ''},
		MT : {name : 'MALTA', date : ''},
		MH : {name : 'MARSHALL ISLANDS', date : ''},
		MQ : {name : 'MARTINIQUE', date : ''},
		MR : {name : 'MAURITANIA', date : ''},
		MU : {name : 'MAURITIUS', date : ''},
		YT : {name : 'MAYOTTE', date : ''},
		MX : {name : 'MEXICO', date : 'dd/mm/yyyy'},
		FM : {name : 'MICRONESIA, FEDERATED STATES OF', date : 'mm/dd/yyyy'},
		MD : {name : 'MOLDOVA, REPUBLIC OF', date : ''},
		MC : {name : 'MONACO', date : ''},
		MN : {name : 'MONGOLIA', date : 'yyyy-mm-dd'},
		ME : {name : 'MONTENEGRO', date : 'd.m.yyyy.'},
		MS : {name : 'MONTSERRAT', date : ''},
		MA : {name : 'MOROCCO', date : ''},
		MZ : {name : 'MOZAMBIQUE', date : ''},
		MM : {name : 'MYANMAR', date : ''},
		NA : {name : 'NAMIBIA', date : ''},
		NR : {name : 'NAURU', date : ''},
		NP : {name : 'NEPAL', date : 'yyyy-mm-dd'},
		NL : {name : 'NETHERLANDS', date : 'dd-mm-yyyy'},
		AN : {name : 'NETHERLANDS ANTILLES', date : ''},
		NC : {name : 'NEW CALEDONIA', date : ''},
		NZ : {name : 'NEW ZEALAND', date : 'dd/mm/yyyy'},
		NI : {name : 'NICARAGUA', date : ''},
		NE : {name : 'NIGER', date : ''},
		NG : {name : 'NIGERIA', date : ''},
		NU : {name : 'NIUE', date : ''},
		NF : {name : 'NORFOLK ISLAND', date : ''},
		MP : {name : 'NORTHERN MARIANA ISLANDS', date : ''},
		NO : {name : 'NORWAY', date : 'd.m.y'},
		OM : {name : 'OMAN', date : ''},
		PK : {name : 'PAKISTAN', date : 'dd/mm/yyyy'},
		PW : {name : 'PALAU', date : 'mm/dd/yyyy'},
		PS : {name : 'PALESTINIAN TERRITORY', date : ''},
		PA : {name : 'PANAMA', date : 'dd/mm/yyyy'},
		PG : {name : 'PAPUA NEW GUINEA', date : ''},
		PY : {name : 'PARAGUAY', date : 'dd/mm/yyyy'},
		PE : {name : 'PERU', date : 'dd/mm/yyyy'},
		PH : {name : 'PHILIPPINES', date : 'dd/mm/yyyy'},
		PN : {name : 'PITCAIRN', date : ''},
		PL : {name : 'POLAND', date : 'd.mm.yyyy'},
		PT : {name : 'PORTUGAL', date : 'dd/mm/yyyy'},
		PR : {name : 'PUERTO RICO', date : 'dd/mm/yyyy'},
		QA : {name : 'QATAR', date : ''},
		RE : {name : 'R\u00c9UNION', date : ''},
		RO : {name : 'ROMANIA', date : 'dd/mm/yyyy'},
		RU : {name : 'RUSSIAN FEDERATION', date : 'dd.mm.yyyy'},
		RW : {name : 'RWANDA', date : ''},
		BL : {name : 'SAINT BARTH\u00c9LEMY', date : ''},
		SH : {name : 'SAINT HELENA', date : ''},
		KN : {name : 'SAINT KITTS AND NEVIS', date : 'dd/mm/yyyy'},
		LC : {name : 'SAINT LUCIA', date : 'dd/mm/yyyy'},
		MF : {name : 'SAINT MARTIN', date : ''},
		PM : {name : 'SAINT PIERRE AND MIQUELON', date : ''},
		VC : {name : 'SAINT VINCENT AND THE GRENADINES', date : 'dd/mm/yyyy'},
		WS : {name : 'SAMOA', date : ''},
		SM : {name : 'SAN MARINO', date : ''},
		ST : {name : 'SAO TOME AND PRINCIPE', date : ''},
		SA : {name : 'SAUDI ARABIA', date : ''},
		SN : {name : 'SENEGAL', date : ''},
		RS : {name : 'SERBIA', date : 'd.m.yyyy'},
		SC : {name : 'SEYCHELLES', date : ''},
		SL : {name : 'SIERRA LEONE', date : ''},
		SG : {name : 'SINGAPORE', date : 'dd/mm/yyyy'},
		SK : {name : 'SLOVAKIA', date : 'd.m.yyyy'},
		SI : {name : 'SLOVENIA', date : 'dd/mm/yyyy'},
		SB : {name : 'SOLOMON ISLANDS', date : ''},
		SO : {name : 'SOMALIA', date : ''},
		ZA : {name : 'SOUTH AFRICA', date : 'yyyy-mm-dd'},
		GS : {name : 'SOUTH GEORGIA AND THE SOUTH SANDWICH ISLANDS', date : ''},
		ES : {name : 'SPAIN', date : 'dd/mm/yyyy'},
		LK : {name : 'SRI LANKA', date : ''},
		SD : {name : 'SUDAN', date : ''},
		SR : {name : 'SURINAME', date : ''},
		SJ : {name : 'SVALBARD AND JAN MAYEN', date : ''},
		SZ : {name : 'SWAZILAND', date : ''},
		SE : {name : 'SWEDEN', date : 'yyyy-mm-dd'},
		CH : {name : 'SWITZERLAND', date : 'dd.mm.yyyy'},
		SY : {name : 'SYRIAN ARAB REPUBLIC', date : ''},
		TW : {name : 'TAIWAN, PROVINCE OF CHINA', date : 'yyyy-mm-dd'},
		TJ : {name : 'TAJIKISTAN', date : ''},
		TZ : {name : 'TANZANIA, UNITED REPUBLIC OF', date : ''},
		TH : {name : 'THAILAND', date : 'dd/mm/yyyy'},
		TL : {name : 'TIMOR-LESTE', date : ''},
		TG : {name : 'TOGO', date : ''},
		TK : {name : 'TOKELAU', date : ''},
		TO : {name : 'TONGA', date : ''},
		TT : {name : 'TRINIDAD AND TOBAGO', date : 'dd/mm/yyyy'},
		TN : {name : 'TUNISIA', date : ''},
		TR : {name : 'TURKEY', date : 'dd/mm/yyyy'},
		TM : {name : 'TURKMENISTAN', date : ''},
		TC : {name : 'TURKS AND CAICOS ISLANDS', date : ''},
		TV : {name : 'TUVALU', date : ''},
		UG : {name : 'UGANDA', date : ''},
		UA : {name : 'UKRAINE', date : 'dd.mm.yyyy'},
		AE : {name : 'UNITED ARAB EMIRATES', date : ''},
		GB : {name : 'UNITED KINGDOM', date : 'dd/mm/yyyy'},
		US : {name : 'UNITED STATES', date : 'mm/dd/yyyy'},
		UM : {name : 'UNITED STATES MINOR OUTLYING ISLANDS', date : 'mm/dd/yyyy'},
		UY : {name : 'URUGUAY', date : 'dd/mm/yyyy'},
		UZ : {name : 'UZBEKISTAN', date : ''},
		VU : {name : 'VANUATU', date : ''},
		VA : {name : 'VATICAN CITY STATE', date : ''},
		VE : {name : 'VENEZUELA', date : 'dd/mm/yyyy'},
		VN : {name : 'VIET NAM', date : 'dd/mm/yyyy'},
		VG : {name : 'VIRGIN ISLANDS, BRITISH', date : ''},
		VI : {name : 'VIRGIN ISLANDS, U.S.', date : ''},
		WF : {name : 'WALLIS AND FUTUNA', date : ''},
		EH : {name : 'WESTERN SAHARA', date : ''},
		YE : {name : 'YEMEN', date : ''},
		CG : {name : 'ZAIRE', date : ''},
		ZM : {name : 'ZAMBIA', date : ''},
		ZW : {name : 'ZIMBABWE', date : ''}		
	};
	
	/**
	 * Special mod function. The general javascript % (mod) function will return the same sign (positive or negative) of the
	 * numerator. E.g. -1%3 = -1, while 1%3 = 1. We need a mod function that always follows the denominator, e.g. -1%3 = 1, 
	 * while 1%-3 = 1.
	 * @private
	 */
	mod = function(x,y) {return ( x - y*(Math.floor(x/y)));};

	/**
	 * Get the week count from given: dayOfPeriod, dayOfWeek, firstDayOfWeek, minDaysInWeek.
	 * @param {int} dayOfPeriod The day of the period from 1 through the last day of the period, normally 365/366 for a year
	 *              or 29/29/30/31 for a month
	 * @param {int} dayOfWeek The day of the week from 0 (Sunday) through 6 (Saturday)
	 * @param {int} firstDayOfWeek The locale-specific first day of week, from 0 (Sunday) through 6 (Saturday)
	 * @param {int} minDaysInWeek The minimum number of days in a week for it to be considered the first week, from 1 through 7
	 * @return {int} The week of the period from 0 through 5 for a month or 53 for a year.
	 * @private
	 */
	processWeekCount = function(dayOfPeriod, dayOfWeek, firstDayOfWeek, minDaysInWeek) {
		var relDow, day1dow, day1relDow, day1wk, weekOfPeriod;
		// what day of week is this relative to the provided firstDayOfWeek
		relDow = mod((dayOfWeek - firstDayOfWeek + 7),7);

		// get the day of week of Day 1 of period and figure out if it was in this period (wk1=1) or previous (wk1=0)

		// first get the offset of our date from Day 1: (dayOfPeriod-1)
		// then determine how many days of the week that is, i.e. mod 7: (dayOfPeriod-1)%7
		// then figure out what day of the week that is, by subtracting it from our day of the week: 
		//               dayOfWeek - ((dayOfPeriod-1)%7)
		// then make sure that the number is a positive 0 (Sunday) to 6 (Saturday): 
		//             (dayOfWeek - ((dayOfPeriod-1)%7) + 7)%7
		day1dow = mod(dayOfWeek-mod(dayOfPeriod-1,7)+7,7);

		// then determine the offset of the day of the week of Day 1 of period from the first day of the week
		//               by subtracting the firstDayOfWeek from the day of the week of Day 1. 
		//               (day1dow - firstDayOfWeek)
		// then add 7 and mod 7 to ensure it is positive 0 to 6 days offset
		//               (day1dow - firstDayOfWeek + 7)%7
		// this gives the relative day of week of Day 1 of the period. E.g. if first day of week is Thursday (4),
		//        and the first day of the month is Saturday, then the relative day is 2: 0 is Thu, 1 is Fri, 2 is Sat
		day1relDow = mod((day1dow-firstDayOfWeek+7),7);

		// what is the last day of the week that Day 1 can be for week 1 to be week 1 and not week 0?
		// it must be from min=firstDayOfWeek to max=7-minDaysInWeek+firstDayOfWeek
		// or in other words, the actual first day of the week until the last possible first day of the week
		// but we make everything easier if we just offset day1relDow, min and max by min
		// then it is from 0 to max-min
		// and to keep the jan1dayOfWeek in 0 to 6, we just take (day1relDow-min+7)%7
		day1wk = 7-day1relDow >= minDaysInWeek ? 1 : 0;

		// now we want to know how many whole weeks, as defined by the provided beginning of the week,
		//   there have been. That is given by going back to the last beginning of week as defined by
		//   firstDayOfWeek and dividing by 7 ignoring remainder. Finally add what week0/1 is
		//var weekOfPeriod = Math.floor(dayOfPeriod / 7) +day1wk;
		//var weekOfPeriod = Math.floor((dayOfPeriod-relDow) / 7) +day1wk;
		weekOfPeriod = Math.ceil((dayOfPeriod-1-relDow) / 7)+day1wk;

		return(weekOfPeriod);		
	};
	
	return function(config) {
		var date, myclass, superclass, zone, locale, time, calendar, firstDayOfWeek, minDaysInWeek,
		dateFormat = null, timeFormat = null, dateTimeFormat = null, dirty, dirtyCount,
		defaultFirstDayInWeek, defaultMinDaysInWeek, fields, bundle, recalculateWeeks, getLocalized, processTime, processFields, callback;
		
		
		// if we have no date, use right now
		date = config.date || new Date();

		// keep myclass and superclass
		myclass = this.myclass;
		superclass = this.superclass;

		// instantiate our timezone
		// save our zone and locale
		zone = config.zone;
		locale = config.locale;
		// this is the absolute time in milliseconds since the Unix Epoch (Jan 1, 1970 Gregorian UTC)
		time = date.getTime();
		// save the specific Calendar instance name and type
		calendar = config.calendar;
		// first day of the week
		firstDayOfWeek = 0;
		// min days in week
		minDaysInWeek = 1;
		
		/**
		 * hash containing the list of changed (i.e. dirty) fields. The key is the name of the field; the value is the time in milliseconds
		 * since the system Epoch (midnight 1 January 1970) that the fields was last changed.
		 * 
		 * @private
		 */
		dirty = {};
		/**
		 * boolean value determining if anything is dirty. This is necessary because JavaScript does not support object.length on dirty{} 
		 * to determine if any fields have changed.
		 * @private
		 */
		dirtyCount = false;
		/**
		 * By default, Sunday is the first day of the week
		 * @private
		 */
		defaultFirstDayInWeek = 0;
		/**
		 * By default, the minimum days in the week is 1.
		 * @private
		 */
		defaultMinDaysInWeek = 1;
		/**
		 * Fields that represent data
		 * @private
		 */
		fields = {};
		/**
		 * Resource bundle
		 * @private
		 */
		bundle = null;

		/**
		 * Recalculate the weekOfMonth and weekOfYear
		 * @private
		 */
		recalculateWeeks = (function(that) {
			return function(){
				fields.WEEK_OF_MONTH = processWeekCount(that.getDate(), that.getDayOfWeek(), that.getFirstDayOfWeek(), that.getMinimumDaysInWeek());
				fields.WEEK_OF_YEAR = processWeekCount(that.getDayOfYear(), that.getDayOfWeek(), that.getFirstDayOfWeek(), that.getMinimumDaysInWeek());
			};
		}(this));

		/**
		 * Get the localized version of a particular string. If there is no bundle, or the bundle does not have the appropriate key,
		 * then the default is taken from the Calendar implementation defaultLocaleInfo.
		 * 
		 * @param {String} key The key to get localized
		 * @return {String} Localized string for given key
		 * @private
		 */
		getLocalized = function(key) {
			var name = null;
			if (bundle && bundle.get) {
				name = bundle.get(key);
			}
			// if there was no localized version, use the default built-in
			name = name || calendar.getDefaultLocaleInfo(key);
			return(name);		
		};

		/**
		 * Convert an actual moment in time in a given zone with a given set of rules to a calendar-described moment in time.
		 * The first two arguments are necessary 
		 * to determine what the actual calendar entities are: day, month, year, hour, minute, second, day of week, day of year.
		 * The second two arguments determine what week of the month and week of the year it is. In some locales or systems, 
		 * the first day of the week is Sunday, in others Monday, etc. Similarly, in some locales, the first week of a period,
		 * in order to be considered the first week, must have a minimum number of days. 
		 * @param {long} time time in milliseconds since the systems epoch, midnight UTC on 1 January 1970
		 * @param {TimeZone} zone TimeZone object that provides the rules for offset from GMT as well as daylight savings rules
		 * @param {int} firstDayOfWeek the first day of the week from 0 (Sunday) to 6 (Saturday)
		 * @param {int} minDaysInWeek the minimum number of days in a week for it to be considered the first week
		 * @return {Object} Object containing all the calculated fields, following the calendar contract, see calendar
		 * @private
		 */	
		processTime = function() {
			/*
			 * Convert milliseconds since Unix Epoch into a calendar instance - all the fields as for UTC
			 * The recipient of this function is responsible for timezone and DST conversion
			 * 
			 * This takes several steps, including several runs of calculation:
			 * 1) Figure out what the calendar fields are for UTC - this is insufficient, since it may
			 *    be a different day in a different timezone
			 * 2) Get the timezone offset (including DST) for that day/date/etc.
			 * 3) Recalculate the calendar fields including the timezone offset. This, too, may be 
			 *    insufficient, since the offset may be different depending on the time of day
			 * 4) Calculate hours/mins/secs/milliseconds
			 */
			var ms, wholeDays, leftover, zi, zoneOffset, totalOff, isDst, zoneName, neg, rfc822, changeOffset,
			calTime, hr, min, s, amPm, hr12, cal, t = time;

			// now do the zone offset - this does not yet include DST
			ms = mod(t,1000);
			t = Math.floor(t/1000);
			wholeDays = Math.floor(t/sec.day);
			// leftover = how many seconds left in this day i.e. part of a day
			leftover = mod(t,sec.day);

			// calculate the zoneoffset - THIS NEEDS TO BE FOR GREGORIAN TO DO ZONE OFFSET
			//var zi = zone.getZoneInfo(cal.YEAR,cal.MONTH,cal.DATE,hr,min,sec);
			// calculate the zoneoffset
			zi = zone.getZoneInfoUTC(t);
			zoneOffset = zi.offset;
			isDst = zi.isDst;
			totalOff = Math.floor(zoneOffset/60); // now it is in minutes
			zoneName = zi.abbr;
			neg = totalOff < 0 ? '-' : '+';
			rfc822 = neg+zeropad(Math.floor(Math.abs(totalOff/60)),2)+zeropad(mod(totalOff,60),2);
			leftover += zoneOffset;

			// what if leftover - due to zone offset or any other reason - puts us into a different day? recalculate
			//   (-500 today is really +1900 yesterday)
			while (leftover >= sec.day) {
				leftover -= sec.day;
				wholeDays++;
			}
			while (leftover < 0) {
				leftover += sec.day;
				wholeDays--;
			}

			// now we have wholeDays since Unix Epoch, but we need whole days since RD0 Epoch
			wholeDays += EPOCH_DAYS;

			/*
			 * now we have wholeDays and leftover... relative to midnight, the starting time for RD0
			 * but each calendar may have different starting times, one of MIDNIGHT, NOON, SUNRISE, SUNSET
			 * midnight and noon are easy as 00:00:00.000 and 12:00:00.000
			 * Sunrise and sunset are harder, as they shift based on location and time of year
			 * Either way, we may need to adjust our wholeDays and leftover to match the calendar
			 * 
			 * What we need is an offset: how much to move start of day from midnight for this particular
			 * location at this moment in time, time being seconds since midnight UTC 01.01.1970.
			 * Until now, we have not dealt at all with location. This means that we must
			 * avoid it entirely, and have some handler to which we can say, 
			 * "here is the UTC time, what is the start of day?" Or better yet, 
			 * "here is the UTC time, and here is the moment we are looking for (MIDNIGHT, SUNRISE, etc.); what is the offset 
			 * to that moment?"
			 * 
			 * Initially, we will work with just using 18:00 as sunset, 06:00 as sunrise, 12:00 as noon and 00:00 as midnight
			 */

			// get when the transition is
			changeOffset = 0;
			switch(calendar.getStartOfDay()) {
				case myclass.MIDNIGHT: changeOffset = 0; break;
				case myclass.NOON: changeOffset = sec.hour*12; break;
				case myclass.SUNSET: changeOffset = sec.hour*-6; break;
				case myclass.SUNRISE: changeOffset = sec.hour*6; break;
				default: changeOffset = 0; break; 
			}
			// we do not change the leftover, since time remains in standard midnight to midnight 24-hour cycle
			// we only change the whole days
			calTime = leftover - changeOffset;
			if (calTime > sec.day) {
				wholeDays++;
			} else if (calTime < 0) {
				wholeDays--;
			}

			// calculate y/m/d
			cal = calendar.daysToCalendar(wholeDays);

			/*
			 * Year/Month/Day are done, now do day of week, week of month, etc. and hr/min/sec/millisec
			 */
			// what day of the week are we? RD1 is a Monday (dow=1), so just take date from RD1%7
			cal.DAY_OF_WEEK = mod(wholeDays,7);

			// incidence of this day of week in the month
			// if date is multiple of 7, it is date/7 th incident
			// if not, it is the date/7 th plus 1
			cal.DAY_OF_WEEK_IN_MONTH = Math.ceil(cal.DATE / 7);

			// get the weekOfMonth and weekOfYear
			cal.WEEK_OF_YEAR = processWeekCount(cal.DAY_OF_YEAR, cal.DAY_OF_WEEK, firstDayOfWeek, minDaysInWeek);
			cal.WEEK_OF_MONTH = processWeekCount(cal.DATE, cal.DAY_OF_WEEK, firstDayOfWeek, minDaysInWeek);

			apply(cal,{ZONE_OFFSET: zoneOffset, DST: isDst, ZONENAME: zoneName, RFC822: rfc822});

			// calculate the hrs/mins/secs
			hr = Math.floor(leftover/sec.hour);
			leftover = mod(leftover,sec.hour);
			min = Math.floor(leftover/sec.minute);
			s = mod(leftover,sec.minute);
			// am/pm version
			amPm = hr<12 ? 0 : 1;
			// hr12 is 1-12, not 0-11
			hr12 = mod(hr,12);
			if (hr12 === 0) {hr12 = 12;}
			apply(cal,{HOUR_OF_DAY: hr, MINUTE: min, SECOND: s, MILLISECOND: ms, HOUR: hr12, AM_PM: amPm});

			return(cal);
		};

		/**
		 * Convert a given set of fields - year, month, day, hour, minute, second - into the actual milliseconds
		 * since the system epoch (midnight 1 January 1970). 
		 * The following fields are checked in the following order to see if they contribute to the calculation:
		 * <ol>
		 * <li>YEAR</li>
		 * <li>ERA</li>
		 * <li>MONTH</li>
		 * <li>DATE</li>
		 * <li>HOUR_OF_DAY or HOUR+AM_PM</li>
		 * <li>MINUTE</li>
		 * <li>SECOND</li>
		 * <li>MILLISECOND</li>
		 * </ol>
		 * In the case where there is a conflict, e.g. HOUR_OF_DAY vs. HOUR, the most recently modified field is used.
		 * 
		 * @param {object} fields The fields with the data to use to convert to milliseconds.
		 * @param {object} dirty An object whose keys match those keys in fields that have been modified. The values are the timestamps, in
		 * milliseconds since the system epoch, of the most recent modification. 
		 * @param {TimeZone} zone TimeZone object that provides the rules for offset from GMT as well as daylight savings rules
		 * @return {long} Milliseconds since the system epoch (midnight 1 January 1970) for the given fields
		 * 
		 * @private
		 */
		processFields = function() {
			/*
			 * The rules are as follows:
			 * 1) Start with the time of day - HOUR/AMPM/HOUR_OF_DAY, MINUTE, SECOND, MILLISECOND and calculate the 
			 *    milliseconds since midnight for this date
			 * 2) Convert the year/month/day to the fixed-date, a.k.a. absolute days since RD0
			 * 3) Convert the fixed-date days since epoch (January 1, 1970)
			 * 4) Convert the days since epoch to milliseconds since epoch
			 * 5) Add the milliseconds since epoch to the milliseconds since midnight of that date
			 * 6) We now have the milliseconds since epoch for our fields - convert to milliseconds 
			 *     for our timezone
			 * 7) Recalculate and normalize all the fields
			 */
			// 1) start with the YEAR
			var year = fields.YEAR, hour = 0, time = 0, wholeDays, changeOffset = 0, calTime, zi;
			// if the year is before the transition, make it negative
			if (fields.ERA === this.BCE && year > 0) {
				year = 1 - year;
			}

			// What is our time in the day? did we set HOUR_OF_DAY or HOUR+AM_PM?
			if (dirty.HOUR_OF_DAY) {
				if (dirty.HOUR && dirty.HOUR > dirty.HOUR_OF_DAY) {
					hour += mod(fields.HOUR,12) + 12*fields.AM_PM;
				} else {
					hour += fields.HOUR_OF_DAY;
				}
			} else if (dirty.HOUR) {
				hour += mod(fields.HOUR,12) + 12*fields.AM_PM;			
			} else {
				hour += fields.HOUR_OF_DAY;
			}
			// add the time and convert to minutes
			time += hour;
			time *= 60;
			// add the minutes and convert to seconds
			time += fields.MINUTE;
			time *= 60;
			// add the seconds
			time += fields.SECOND;

			// we now have the seconds in the day, but what if any of the numbers was negative, 
			//  or the number rolled over?
			wholeDays = Math.floor(time / sec.day); // this should be 0 if it is within a day, but might be negative
			time = mod(time,sec.day); // this is the part of a day part
			// now we make sure the negative numbers are handled
			while (time < 0) {
				time += sec.day;
				wholeDays--;
			}

			/*
			 * now we have days... assuming the calendar was relative to midnight, the starting time for RD0
			 * but each calendar may have different starting times, one of MIDNIGHT, NOON, SUNRISE, SUNSET
			 * midnight and noon are easy as fixed hours 00:00:00.000 and 12:00:00.000
			 * Sunrise and sunset are harder, as they shift based on location and time of year
			 * Either way, we may need to adjust our time to match the calendar.
			 */	

			// get when the transition is
			switch(calendar.getStartOfDay()) {
				case myclass.MIDNIGHT: changeOffset = 0; break;
				case myclass.NOON: changeOffset = sec.hour*12; break;
				case myclass.SUNSET: changeOffset = sec.hour*-6; break;
				case myclass.SUNRISE: changeOffset = sec.hour*6; break;
				default: changeOffset = 0; break; 
			}
			// we do not change the leftover, since time remains in standard midnight to midnight 24-hour cycle
			// we only change the whole days
			calTime = time - changeOffset;
			if (calTime > sec.day) {
				wholeDays++;
			} else if (calTime < 0) {
				wholeDays--;
			}		

			// so now we have the fixed date from R.D. but we need it from the system epoch
			wholeDays += calendar.calendarToDays(fields.ERA,fields.YEAR,fields.MONTH,fields.DATE) - EPOCH_DAYS;

			time += wholeDays * sec.day;

			// add the offset for this zone
			//var zi = zone.getZoneInfo(fields.YEAR,fields.MONTH,fields.DATE,hour,fields.MINUTE,fields.SECOND);
			zi = zone.getZoneInfoUTC(time);
			calTime -= zi.offset;
			if (calTime > sec.day) {
				time += sec.day;
			} else if (calTime < 0) {
				time -= sec.day;
			}
			time -= zi.offset;

			// convert to milliseconds and add the part add the milliseconds
			time *= 1000;
			time += isNaN(fields.MILLISECOND) ? 0 : fields.MILLISECOND;

			// return the calculated time
			return(time);
		};


		apply(this,/** @scope JSORM.calendar.prototype */{

			/**
			 * Default style to use for Calendar output formatting is Java. Change this to change the default.
			 */
			defaultStyle : myclass.JAVA,

			/**
			 * Format this calendar according to a formatting string and style. For more information, see the appropriate constants.
			 * JAVA
			 * PHP
			 * STRFTIME
			 * 
			 * @param {String} format A formatting string according to the style given
			 * @param {String} style One of JSORM.calendar.JAVA, JSORM.calendar.PHP, JSORM.calendar.STRFTIME
			 * @return {String} The formatted date and time
			 */
			format : function(format,style) {
				// we format using the given style if available; if not, or none given, use the default
				var f = (style && formatters[style]) ? formatters[style] : formatters[this.defaultStyle];
				return(f.fn(format,f.codes,this));
			},
			/**
			 * Format this Calendar to return the date alone, according to the default style for the given locale.
			 * 
			 * @return {String} Formatted date
			 */
			date : function() {
				return(this.format(dateFormat,this.defaultStyle));
			},
			/**
			 * Format this calendar to return the time alone, according to the default style for the given locale.
			 * 
			 * @return {String} Formatted time
			 */
			time : function() {
				return(this.format(timeFormat,this.defaultStyle));
			},
			/**
			 * Format this calendar to return the date and time, according to the default style for the given locale.
			 * 
			 * @return {String} Formatted date and time
			 */
			dateTime : function() {
				return(this.format(dateTimeFormat,this.defaultStyle));		
			},

			/*
			 * BEGIN SPECIFIC FIELD GET FUNCTIONS
			 */
			/**
			 * Get if this year is a leap year
			 * 
			 * @return {boolean} true if leap, false if not
			 */
			isLeap : function() {
				return(this.get('LEAP') === 1);
			},
			/**
			 * The timezone formatted in rfc822
			 * 
			 * @return {String} The timezone formatted in RFC822 format
			 */
			getRfc822 : function() {
				return(this.get('RFC822'));
			},
			/**
			 * The timezone name
			 * 
			 * @return {String} The timezone name
			 */
			getZoneName : function() {
				return(this.get('ZONENAME'));
			},
			/**
			 * Get the year. Synonym for get('YEAR')
			 * 
			 * @return {int} Year
			 */
			getYear : function() {
				return this.get('YEAR');
			},
			/**
			 * Get the month. Synonym for get('MONTH')
			 * 
			 * @return {int} Month from 0 to 11 (12 if the calendar implementation supports 13 months)
			 */
			getMonth : function() {
				return this.get('MONTH');
			},
			/**
			 * Get the date. Synonym for get('DATE')
			 * 
			 * @return {int} Date from 0 to maximum date in month
			 */
			getDate : function() {
				return this.get('DATE');
			},
			/**
			 * Get the week of year. Synonym for get('WEEK_OF_YEAR')
			 * 
			 * @return {int} Week of year from 0 to maximum. This is affected by #setFirstDayOfWeek and #setMinDaysInWeek
			 */
			getWeekOfYear : function() {
				return this.get('WEEK_OF_YEAR');
			},
			/**
			 * Get the week of month. Synonym for get('WEEK_OF_MONTH')
			 * 
			 * @return {int} Week of month from 0 to maximum. This is affected by #setFirstDayOfWeek and #setMinDaysInWeek
			 */
			getWeekOfMonth : function() {
				return this.get('WEEK_OF_MONTH');
			},
			/**
			 * Get the day of the year. Synonym for get('DAY_OF_YEAR')
			 * 
			 * @return {int} Day of year from 0 to maximum for year. For Gregorian, this is 364 (365 for a leap year)
			 */
			getDayOfYear : function() {
				return this.get('DAY_OF_YEAR');
			},
			/**
			 * Get the day of week. Synonym for get('DAY_OF_WEEK')
			 * 
			 * @return {int} Day of week from 0 (Sunday) to 6 (Saturday)
			 */
			getDayOfWeek : function() {
				return this.get('DAY_OF_WEEK');
			},
			/**
			 * Get the occurrence of this day of week in the month. Synonym for get('DAY_OF_WEEK_IN_MONTH')
			 * 
			 * @return {int} Date from 0 to 4
			 */
			getDayOfWeekInMonth : function() {
				return this.get('DAY_OF_WEEK_IN_MONTH');
			},
			/**
			 * Get the hour. Synonym for get('HOUR')
			 * 
			 * @return {int} Hour of day from 1 to 12
			 */
			getHour : function() {
				return this.get('HOUR');
			},
			/**
			 * Get the hour. Synonym for get('HOUR_OF_DAY')
			 * 
			 * @return {int} Hour of day from 0 to 23
			 */
			getHourOfDay : function() {
				return this.get('HOUR_OF_DAY');
			},
			/**
			 * Get the era. Synonym for get('ERA')
			 * 
			 * @return {int} Era, normally 0 before some significant change (e.g. BC/BCE) and 1 after (e.g. AD/CE)
			 */
			getEra : function() {
				return this.get('ERA');
			},
			/**
			 * Get AM versus PM. Synonym for get('AM_PM')
			 * 
			 * @return {int} 0 if AM and 1 if PM
			 */
			getAmPm : function() {
				return this.get('AM_PM');
			},
			/**
			 * Get the minute in the hour. Synonym for get('MINUTE')
			 * 
			 * @return {int} Minute from 0 to 59
			 */	
			getMinute : function() {
				return this.get('MINUTE');
			},
			/**
			 * Get the second in the minute. Synonym for get('SECOND')
			 * 
			 * @return {int} Second from 0 to 59
			 */	
			getSecond : function() {
				return this.get('SECOND');
			},
			/**
			 * Get the millisecond in the second. Synonym for get('MILLISECOND')
			 * 
			 * @return {int} Millisecond from 0 to 999
			 */	
			getMillisecond : function() {
				return this.get('MILLISECOND');
			},
			/**
			 * Get the maximum value for a given field. This can change for different moments in time. For example, the
			 * maximum DATE in the month of January is 30, while in June it is 29.
			 * 
			 * @param {String} field The field whose maximum we want
			 * @return {int} The maximum as an integer
			 */	
			getMax : function(field) {
				/*
				 * era, year, month, date, day of year, leap are all determined by calendar impl, rest by Calendar
				 */
				var ret = null, maxDate = null, dow = null, remDays;
				switch(field) {
					case 'ERA':
						ret = calendar.getMaxEra();
						break;
					case 'YEAR':
						ret = calendar.getMaxYear(fields.ERA);
						break;
					case 'MONTH':
						ret = calendar.getMaxMonth(fields.ERA,fields.YEAR);
						break;
					case 'DATE':
						ret = calendar.getMaxDate(fields.ERA,fields.YEAR,fields.MONTH);
						break;
					case 'DAY_OF_YEAR':
						ret = calendar.getMaxDayOfYear(fields.ERA,fields.YEAR);
						break;
					case 'HOUR': ret = 12; break;
					case 'HOUR_OF_DAY': ret = 23; break;
					case 'AM_PM': ret = 1; break;
					case 'LEAP': ret = 1; break;
					case 'DAY_OF_WEEK': ret = 6; break;
					case 'DAY_OF_WEEK_IN_MONTH': 
						remDays = calendar.getMaxDate(fields.ERA,fields.YEAR,fields.MONTH)-fields.DATE;
						ret = fields.DAY_OF_WEEK_IN_MONTH+Math.ceil(remDays/7);
						break;
					case 'WEEK_OF_MONTH': 
						// get the day of week of the last day of month
						maxDate = calendar.getMaxDate(fields.ERA,fields.YEAR,fields.MONTH);
						dow = mod(maxDate - fields.DATE + fields.DAY_OF_WEEK,7);
						ret = processWeekCount(maxDate,dow,this.getFirstDayOfWeek(),this.getMinimumDaysInWeek());
						break;
					case 'WEEK_OF_YEAR':
						// get the day of week of the last day of this year
						maxDate = calendar.getMaxDayOfYear(fields.ERA,fields.YEAR);
						dow = mod(maxDate-fields.DATE+fields.DAY_OF_WEEK,7);
						ret = processWeekCount(maxDate,dow,this.getFirstDayOfWeek(),this.getMinimumDaysInWeek());
						break;
					case 'MINUTE': ret = 59; break;
					case 'SECOND': ret = 59; break;
					case 'MILLISECOND': ret = 999; break;
					default: ret = null; break;
				}
				return(ret);
			},
			/**
			 * Get the minimum value for a given field. 
			 * 
			 * @param {String} field The field whose minimum we want
			 * @return {int} The minimum as an integer
			 */	
			getMin : function(field) {
				/*
				 * era, year, month, date, dayOfYear are all determined by CalendarImpl, rest by calendar
				 */
				var ret = null;
				switch(field) {
					case 'ERA':
						ret = calendar.getMinEra();
						break;
					case 'YEAR':
						ret = calendar.getMinYear(fields.ERA);
						break;
					case 'MONTH':
						ret = calendar.getMinMonth(fields.ERA,fields.YEAR);
						break;
					case 'DATE':
						ret = calendar.getMinDate(fields.ERA,fields.YEAR,fields.MONTH);
						break;
					case 'DAY_OF_YEAR':
						ret = calendar.getMinDayOfYear(fields.ERA,fields.YEAR);
						break;
					case 'HOUR': ret = 1; break;
					case 'HOUR_OF_DAY': ret = 0; break;
					case 'AM_PM': ret = 0; break;
					case 'LEAP': ret = 0; break;
					case 'DAY_OF_WEEK': ret = 0; break;
					case 'DAY_OF_WEEK_IN_MONTH': ret = 1; break; 
					case 'WEEK_OF_MONTH': ret = 0; break;
					case 'WEEK_OF_YEAR': ret = 0; break;
					case 'MINUTE': ret = 0; break;
					case 'SECOND': ret = 0; break;
					case 'MILLISECOND': ret = 0; break;
					default: ret = null; break;
				}
				return(ret);
			},
			/**
			 * Get what the first day of the week is, as set by the user or default.
			 * 
			 * @return {int} The first day of the week from 0 (Sunday) to 6 (Saturday)
			 */
			getFirstDayOfWeek : function() {
				return firstDayOfWeek;
			},
			/**
			 * Get what the minimum days in week is, as set by the user or default.
			 * 
			 * @return {int} Minimum days in week, from 1 to 7
			 */
			getMinimumDaysInWeek : function() {
				return minDaysInWeek;
			},
			/**
			 * Get the JSORM.TimeZone object that is active for this calendar.
			 * 
			 * @return {TimeZone} TimeZone object
			 */
			getZone : function() {
				return zone;
			},
			/*
			 * END SPECIFIC FIELD GET FUNCTIONS
			 */

			/*
			 * BEGIN SPECIFIC FIELD SET FUNCTIONS
			 */
			/**
			 * Set the year. Synonym for set('YEAR',val)
			 * 
			 * @param {int} val The year
			 */
			setYear : function(val) {
				this.set('YEAR',val);
			},
			/**
			 * Set the month. Synonym for set('MONTH',val)
			 * 
			 * @param {int} val The month
			 */
			setMonth : function(val) {
				this.set('MONTH',val);
			},
			/**
			 * Set the month. Synonym for set('MONTH',val)
			 * 
			 * @param {int} val The month
			 */	
			setDate : function(val) {
				this.set('DATE',val);
			},
			/**
			 * Set the week of year. Synonym for set('WEEK_OF_YEAR',val)
			 * NOTE: At this point, this has no impact.
			 * 
			 * @param {int} val The week of year
			 */
			setWeekOfYear : function(val) {
				this.set('WEEK_OF_YEAR',val);
			},
			/**
			 * Set the week of month. Synonym for set('WEEK_OF_MONTH',val)
			 * NOTE: At this point, this has no impact.
			 * 
			 * @param {int} val The week of month
			 */
			setWeekOfMonth : function(val) {
				this.set('WEEK_OF_MONTH',val);
			},
			/**
			 * Set the day of year. Synonym for set('DAY_OF_YEAR',val)
			 * NOTE: At this point, this has no impact.
			 * 
			 * @param {int} val The day of year
			 */
			setDayOfYear : function(val) {
				this.set('DAY_OF_YEAR',val);
			},
			/**
			 * Set the day of week. Synonym for set('DAY_OF_WEEK',val)
			 * NOTE: At this point, this has no impact.
			 * 
			 * @param {int} val The day of week
			 */
			setDayOfWeek : function(val) {
				this.set('DAY_OF_WEEK',val);		
			},
			/**
			 * Set the day of week in month. Synonym for set('DAY_OF_WEEK_IN_MONTH',val)
			 * NOTE: At this point, this has no impact.
			 * 
			 * @param {int} val The occurrence of the day of week in month
			 */
			setDayOfWeekInMonth : function(val) {
				this.set('DAY_OF_WEEK_IN_MONTH',val);		
			},
			/**
			 * Set the hour. Synonym for set('HOUR',val)
			 * 
			 * @param {int} val The hour from 1 to 12
			 */
			setHour : function(val) {
				this.set('HOUR',val);		
			},
			/**
			 * Set the hour of day. Synonym for set('HOUR_OF_DAY',val)
			 * 
			 * @param {int} val The hour of day from 0 to 23
			 */
			setHourOfDay : function(val) {
				this.set('HOUR_OF_DAY',val);		
			},
			/**
			 * Set the era. Synonym for set('ERA',val)
			 * 
			 * @param {int} val The era, normally as 0 or 1
			 */	
			setEra : function(val) {
				this.set('ERA',val);		
			},
			/**
			 * Set the am or pm. Synonym for set('AM_PM',val)
			 * 
			 * @param {int} val 0 for AM and 1 for PM
			 */	
			setAmPm : function(val) {
				this.set('AM_PM',val);		
			},
			/**
			 * Set the minute. Synonym for set('MINUTE',val)
			 * 
			 * @param {int} val The minute from 0 to 59
			 */
			setMinute : function(val) {
				this.set('MINUTE',val);		
			},
			/**
			 * Set the second. Synonym for set('SECOND',val)
			 * 
			 * @param {int} val The second from 0 to 59
			 */
			setSecond : function(val) {
				this.set('SECOND',val);		
			},
			/**
			 * Set the millisecond. Synonym for set('MILLISECOND',val)
			 * 
			 * @param {int} val The millisecond from 0 to 999
			 */
			setMillisecond : function(val) {
				this.set('MILLISECOND',val);		
			},


			/**
			 * Set the first day of the week. This is used to calculate the WEEK_OF_MONTH and WEEK_OF_YEAR fields.
			 * 
			 * @param {int} val The first day of the week, from 0 (Sunday) to 6 (Saturday)
			 */
			setFirstDayOfWeek : function(val) {
				// try to parse the integer, and see if it is valid - must be a number from 0 to 6
				val = parseInt(val,10);
				val = isNaN(val) || val < 0 || val > 6 ? defaultFirstDayInWeek : val;

				// process only if the value has changed
				if (firstDayOfWeek !== val) {
					// keep the new value
					firstDayOfWeek = val;
					// and recalculate weekofmonth and weekofyear, the two affected values
					recalculateWeeks();
				}
			},
			/**
			 * Set the minimum days in week. This is used to calculate the WEEK_OF_MONTH and WEEK_OF_YEAR fields.
			 * 
			 * @param {int} val The minimum number of days from 1 to 7
			 */
			setMinimumDaysInWeek : function(val) {
				// try to parse the integer, and see if it is valid - must be a number from 0 to 6
				val = parseInt(val,10);
				val = isNaN(val) || val < 1 || val > 7 ? defaultMinDaysInWeek : val;

				// process only if the value has changed
				if (minDaysInWeek !== val) {
					// keep the new value
					minDaysInWeek = val;
					// and recalculate weekofmonth and weekofyear, the two affected values
					recalculateWeeks();
				}
			},
			/**
			 * Set the zone to use
			 * 
			 * @param {TimeZone} val The TimeZone object to use
			 */
			setZone : function(val) {
				zone = val;
				fields = processTime();
				dirty = {};
				dirtyCount = false;		
			},
			/*
			 * END SPECIFIC FIELD SET FUNCTIONS
			 */

			/*
			 * BEGIN LOCALIZED TEXT GET FUNCTIONS
			 */
			/**
			 * Get the day of the week as a localized string in long or short form, e.g. Thursday or Thu. 
			 * 
			 * @param {int} dayOfWeek The day of the week to get from 0 (Sunday) to 6 (Saturday). If undefined, use 
			 *              current one in defined calendar
			 * @param {boolean} shortName True if the name should be in short form, false if in long form
			 * @return {String} Localized string for day of week
			 */
			getTextDayOfWeek : function(shortName,d) {
				var name, l;
				// get the index name for the month
				if (d===undefined) {d=fields.DAY_OF_WEEK;}
				name = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'][d];
				// get the localized version
				l = getLocalized(name);
				// the short form is *after* the :
				return(l.split(':')[shortName?1:0]);
			},
			/**
			 * Get the day of the week as a localized string in short form, e.g. Thu. 
			 * 
			 * @param {int} dayOfWeek The day of the week to get from 0 (Sunday) to 6 (Saturday). If undefined, use 
			 *              current one in defined calendar
			 * @return {String} Localized string for day of week
			 */
			getTextDayOfWeekShort : function(d) {
				return(this.getTextDayOfWeek(true,d));
			},
			/**
			 * Get the day of the week as a localized string in long form, e.g. Thursday. 
			 * 
			 * @param {int} d The day of the week to get from 0 (Sunday) to 6 (Saturday). If undefined, use 
			 *              current one in calendar
			 * @return {String} Localized string for day of week
			 */
			getTextDayOfWeekLong : function(d) {
				return(this.getTextDayOfWeek(false,d));
			},
			/**
			 * Get the name of the month as a localized string in long or short form, e.g. February or Feb 
			 * 
			 * @param {boolean} shortName True if the name should be in short form, false if in long form
			 * @param {int} m The month to get from 1 to 12 or 13. If undefined, use current one in calendar.
			 * @return {String} Localized string for month name
			 */
			getTextMonth : function(shortName, m) {
				var name, l;
				// get the index name for the month
				if (m===undefined) {m = fields.MONTH;}
				name = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER','UNDECIMBER'][m-1];
				// get the localized version
				l = getLocalized(name);
				// the short form is *after* the :
				return(l ? l.split(':')[shortName?1:0] : l);
			},
			/**
			 * Get the name of the month as a localized string in short form, e.g. Feb 
			 * 
			 * @param {int} m The month to get from 1 to 12 or 13. If undefined, use current one in calendar.
			 * @return {String} Localized string for month name
			 */
			getTextMonthShort : function(m) {
				return(this.getTextMonth(true,m));
			},
			/**
			 * Get the name of the month as a localized string in long form, e.g. February
			 * 
			 * @param {int} m The month to get from 1 to 12 or 13. If undefined, use current one in calendar.
			 * @return {String} Localized string for month name
			 */
			getTextMonthLong : function(m) {
				return(this.getTextMonth(false,m));
			},
			/**
			 * Get AM or PM as a localized string
			 * 
			 * @param {int} d 0 for AM or 1 for PM
			 * @return {String} Localized string for AM/PM
			 */
			getTextAmPm : function() {
				// get the index name for the month
				var name = ['AM','PM'][fields.AM_PM];
				// get the localized version
				return(getLocalized(name));
			},
			/**
			 * Get the name of the era as a localized string
			 * 
			 * @param {int} e 0 for before an era shift (e.g. BC/BCE), 1 for after (e.g. AD/CE)
			 * @return {String} Localized string for era name
			 */
			getTextEra : function() {
				var name = ['ERA0','ERA1'][fields.ERA];
				return(getLocalized(name));
			},
			/**
			 * Get the suffix to a number for counting, e.g. 'st' to add to 1 to get 1st, 'nd' to add to 2 to get 2nd, etc.
			 * This number is also localized.
			 * 
			 * @param {int} n The number to which we want to add the suffix
			 * @return {String} Localized string for suffix
			 */
			getTextCount : function() {
				var n, name;
				// first we try 'COUNT' plus the number turned to a string
				n = fields.DATE-1;
				name = getLocalized('COUNT'+(n+1));
				// if that was empty, we try a generic form
				if (!name) {name = getLocalized('COUNTN');}
				// if that was empty, we use blank
				if (!name) {name = '';}
				return(name);		
			},
			/*
			 * END LOCALIZED TEXT GET FUNCTIONS 
			 */

			/*
			 * BEGIN LOCALIZATION FUNCTIONS
			 */
			/**
			 * Set the locale to a new locale. The locale must follow the standards set by ResourceBundle.
			 * 
			 * @param {Object} config Object containing the configuration parameters.
			 * @config {String} [basepath] Base path for the locale, overriding the default
			 * @config {String} [localePath] Path to the locale relative to the base path, overriding the default
			 * @config {function} callback Function to call when setting of locale is complete. The signature of the callback 
			 * should be callback(success,calendarObject,options,e)
			 * @config {Object} options Object containing options to pass to the callback
			 */
			setLocale : function(config) {
				var basepath, path, options, that = this;
				locale = config.locale;
				// set our localePath
				basepath = config.basepath || myclass.basepath;
				path = config.localePath || myclass.localePath;
				options = {callback: config.callback, config: config};
				exports.ResourceBundle.getBundle({path: basepath+path, name: calendar.name,locale: locale, callback: function(success,b,options,message) {
					var e, f, opts;
					if (success && b) {
						// save the bundle
						bundle = b;
						// does the localized bundle have defined a first day in week and minimum days in first week?
						that.setFirstDayOfWeek(b.get('FIRSTDAYINWEEK'));
						that.setMinimumDaysInWeek(b.get('MINIMUMDAYSINWEEK'));

						// set up some defaults for formatting
						f = formats[locale] || iso;
						dateFormat = f.date;
						timeFormat = f.time;
						dateTimeFormat = f.date + ' ' + f.time;

						e = null;
					} else if (!options.config.locale || calendar.getDefaultLocale() === options.config.locale) {
						// what if we do not have a locale given and we could not load? then we use the default built-in for the calendar
						//  the same if we could not load the locale, but is the same as the built-in

						// does the localized bundle have defined a first day in week and minimum days in first week?
						that.setFirstDayOfWeek(getLocalized('FIRSTDAYINWEEK'));
						that.setMinimumDaysInWeek(getLocalized('MINIMUMDAYSINWEEK'));

						// set up some defaults for formatting
						f = formats[locale] || iso;
						dateFormat = f.date;
						timeFormat = f.time;
						dateTimeFormat = f.date + ' ' + f.time;

						// success
						e = null;
						success = true;
					} else {
						// did not go blank, but did not successfully load either. Fail.
						e = "Unable to load bundle";
					}
					// do the relevant callback
					if (options.callback && typeof(options.callback) === 'function') {
						opts = options.config ? options.config.options : null;
						options.callback(success,that,opts,e);
					}
				},options: options});				
			},

			/*
			 * END LOCALIZATION FUNCTIONS
			 */

			/*
			 * BEGIN get/set/add/roll FUNCTIONS
			 */
			/**
			 * Get the value of a specific field. See the overview for the names of fields. This function forces a recalculation of
			 * The time and fields, if any is dirty.
			 * 
			 * @param {string} field The name of the field to get.
			 */
			get : function(field) {
				if (dirtyCount) {
					time = processFields();
					fields = processTime();
					dirty = {};
					dirtyCount = false;
				}
				return(fields[field]);
			},
			/**
			 * Set a field, marking as dirty, but no immediate recomputation, in order to save. Recomputation will happen at the next get().
			 * 
			 * @param {String} field The name of the field to change. See the overview for the names of fields.
			 * @param {int} val The value to set the field to.
			 */
			set : function(field,val) {
				fields[field] = val;
				dirty[field] = new Date().getTime();
				dirtyCount = true;
			},

			/**
			 * Add a field with a delta and do immediate recomputation. Add does increment larger fields.
			 * E.g. if the current time is 09:50, add('MINUTE',20) gives 10:10 while roll('MINUTE',20) gives 09:10.
			 * 
			 * @param {String} field The name of the field that should be added. See the overview for the names of fields.
			 * @param {int} delta The amount to increment (positive) or decrement (negative)
			 */
			add : function(field, delta) {
				// process the date and then mark all as clean
				if (dirtyCount) {
					time = processFields();
					dirty = {};
					dirtyCount = false;
					fields = processTime();
				}

				// what do we do?
				switch(field) {
					case 'DATE':
						time = time+delta*ms1d;
						break;
					case 'DAY_OF_YEAR':
						time = time+delta*ms1d;
						break;
					case 'DAY_OF_WEEK':
						time = time+delta*ms1d;
						break;
					case 'YEAR':
						fields.YEAR += delta;
						time = processFields();
						break;
					case 'MILLISECOND':
						time = time+delta;
						break;
					case 'SECOND':
						time = time+delta*1000;
						break;
					case 'MINUTE':
						time = time+delta*ms1m;
						break;
					case 'HOUR':
						time = time+delta*ms1h;
						break;
					case 'HOUR_OF_DAY':
						time = time+delta*ms1h;
						break;
					case 'MONTH':
						fields.MONTH += delta;
						time = processFields();
						break;
					case 'AM_PM':
						// every AM_PM is a 12 hour cycle
						time = time+delta*ms1d/2;
						break;
					case 'WEEK_OF_MONTH':
						time = time+delta*ms7d;
						break;
					case 'WEEK_OF_YEAR':
						time = time+delta*ms7d;
						break;
				}
				fields = processTime();
				dirty = {};
				dirtyCount = false;
			},

			/**
			 * Roll a field with a delta and do immediate recomputation. roll does not increment larger fields.
			 * E.g. if the current time is 09:50, add('MINUTE',20) gives 10:10 while
			 * roll('MINUTE',20) gives 09:10
			 * 
			 * @param {String} field The name of the field that should be rolled. See the overview for the names of fields.
			 * @param {int} delta The amount to increment (positive) or decrement (negative)
			 */
			roll : function(field, delta) {
				var cur, max, min, range, val;
				// use get() so we force a recomputation
				cur = this.get(field);
				// what if the cur+delta has overflow, even multiple times? We need the modulo
				max = this.getMax(field,fields);
				min = this.getMin(field,fields);
				range = max-min+1;
				val = (cur-min+range+delta) % range + min;
				if (val < min) {
					val += range;
				}
				// set forces the dirty flag		
				this.set(field,val);
				// process all fields and then mark dirty as clean
				time = processFields();	
				dirty = {};
				dirtyCount = false;
				fields = processTime();
			},

			/**
			 * set the absolute time in milliseconds since system Epoch (midnight 1 January 1970)
			 * 
			 * @param {long} time Time in milliseconds
			 */
			setTime : function(t) {
				// if no time passed, then it is today
				time = t || new Date().getTime();
				fields = processTime();
				dirty = {};
				dirtyCount = false;		
			},
			/**
			 * get the absolute time in milliseconds since system Epoch (midnight 1 January 1970)
			 * @return {long} time in milliseconds
			 */
			getTime : function() {
				// do we have to process dirty first?
				if (dirtyCount) {
					time = processFields();
					fields = processTime();
					dirty = {};
					dirtyCount = false;
				}
				return(time);
			}

			/*
			 * END get/set/add/roll FUNCTIONS
			 */

		});

		// setLocale loads the bundle via ajax, so we need to use a callback
		callback = function(success,that,options,e) {
			// did we get the locale or not?
			if (success) {
				that.setTime(time);
				options.callback(true,that,options.options,null);
			} else {
				options.callback(false,null,options.options,e);
			}
		};

		this.setLocale({locale:config.locale, basepath: config.basepath, localePath: config.localePath, callback: callback, options: config});
	};
	
}()),(function()/** @scope JSORM.calendar */{
	var myclass = function(){return exports.calendar;}, tzInit = function(){return exports.TimeZone;},
	/**
	 * Cache of implementations that we have loaded
	 */
	impls = {};
	return {
		/**
		 * Represent midnight
		 * @memberOf JSORM.calendar
		 */
		MIDNIGHT: 0,
		/**
		 * Represent noon
		 * @memberOf JSORM.calendar
		 */
		NOON: 1,
		/**
		 * Represent sunrise
		 * @memberOf JSORM.calendar
		 */
		SUNRISE: 2,
		/**
		 * Represent sunset
		 * @memberOf JSORM.calendar
		 */
		SUNSET: 3,

		/**
		 * Default path to locales. This may be changed at the class level (Calendar.localePath = '/new/path') to have all instances default
		 * to a new path. In either case, each getCalendar() call can override the default.
		 * @memberOf JSORM.calendar
		 */
		localePath : 'i18n/locale/',
		/**
		 * Default path to calendar implementations. This may be changed at the class level (Calendar.calendarPath = '/new/path') to 
		 * have all instances default to a new path. In either case, each #getCalendar call can override the default.
		 * @memberOf JSORM.calendar
		 */
		calendarPath : 'i18n/calendars/',
		/**
		 * Default base path to locales and calendars. This may be changed at the class level (Calendar.basePath = '/new/path') to 
		 * have all instances default to a new path. In either case, each getCalendar() call can override the default.
		 * @memberOf JSORM.calendar
		 */
		basePath : '/lib/',
		/**
		 * Default calendar implementation to use. This is the only one that ships by default with i18n.
		 * @memberOf JSORM.calendar
		 */
		defaultCalendar : 'Gregorian',
		/**
		 * Constant for Java-style formatting.
		 * See <a href="http://java.sun.com/javase/6/docs/api/java/text/SimpleDateFormat.html">
		 * http://java.sun.com/javase/6/docs/api/java/text/SimpleDateFormat.html</a>
		 * @memberOf JSORM.calendar
		 */
		JAVA : 'J',
		/**
		 * Constant for PHP-style formatting.
		 * See <a href="http://www.php.net/date">http://www.php.net/date</a>
		 * @memberOf JSORM.calendar
		 */
		PHP : 'P',
		/**
		 * Constant for strftime-style formatting.
		 * See <a href="http://opengroup.org/onlinepubs/007908799/xsh/strftime.html">http://opengroup.org/onlinepubs/007908799/xsh/strftime.html</a>
		 * @memberOf JSORM.calendar
		 */
		STRFTIME : 'S',


		/**
		 * Static function to get a new calendar. This is the primary entry point into the calendar class and only approved method of 
		 * acquiring a new calendar object.
		 * 
         * @param {Object} config An object containing the necessary configuration parameters for the new calendar.
		 * @config {TimeZone/String} [zone] TimeZone object or the name of a timezone. The name of the timezone must follow the rules for
		 *    TimeZone.getZone()
		 * @config {Date} [date] JavaScript Date object representing the moment in time to use. If undefined or null, will use right now
		 * @config {String} [locale] Name of a locale to use, following the ResourceBundle convention. If no bundle can be found,
		 *     the default of the calendar implementation will be used
		 * @config {String} [calendar] Case-insensitive name of a calendar implementation to use. If undefined or null, will use
		 *     JSORM.calendar.defaultCalendar. By default, only Gregorian is provided. For
		 *     more information on creating and deploying new implementations, see CalendarImpl
		 * @config {String} [calendarPath] Path to use to load Calendar implementations via Ajax. If undefined or null, will use
		 *     JSORM.calendar.calendarPath
		 * @config {String} [localePath] Path to use to load locale implementations via Ajax. If undefined or null, will use JSORM.calendar.localePath
		 * @config {Function} callback Function to call when the calendar load is complete
		 * The signature of the callback should be callback(success,calendarObject,options,e) where success = boolean for success or failure,
		 * calendarObject = the calendar object if successful or null if failed, options = the options passed as part of getCalendar under 
		 * config.options, e = the error message if failed
		 * @config {Object} [options] Options to pass to the callback as the options parameter
		 * @memberOf JSORM.calendar
		 */
		getCalendar : function(config) {
			var calInit = myclass(),
			date, calendar, basepath, calpath, calConf, calInst, callback, opts, zone, locale, localepath;
			// make sure we have a default config
			config = config || {};

			// do we have the zone or not?
			if (typeof(config.zone) === 'object') {
				date = config.date; zone = config.zone; locale = config.locale; callback = config.callback; opts = config.options;
				// our default is Gregorian
				calendar = config.calendar || calInit.defaultCalendar;
				calendar = calendar.toLowerCase();
				basepath = config.basePath || calInit.basePath;
				calpath = config.calendarPath || calInit.calendarPath;
				localepath = config.localePath || calInit.localePath;

				// all the config is ready. The question now is if we already have the calendar implementation prototype loaded,
				//   or if we need it get it via ajax
				if (impls[calendar]) {
					// we already have it, so just set up the config and make a new one - the result will be handled by the callback
					calConf = {calendar : impls[calendar](), date: date, zone: zone, locale: locale,
								  basepath: basepath, localePath:localepath, callback: callback, options: opts};
					calInst = calInit(calConf);
				} else {
					// we did not have the prototype loaded, so load it via ajax and then use it
					utils.getFile(basepath+calpath+calendar+'.json',function(url,xmlHttp,success,options) {
						// be sane about our options as an object
						options = options || {};
						if (success) {
							// we have it loaded
							/*jslint evil:true */
							impls[options.calendar] = function() {return eval("("+xmlHttp.responseText+")");};
							/*jslint evil:false */
							try {
								calConf = {calendar : impls[calendar](), date: options.date, zone: options.zone, 
												locale: options.locale, options: options.options,
											  basepath: options.basepath, localePath: options.localePath, callback: options.callback};
								calInst = calInit(calConf);
							} catch (e) {
								if (typeof(options.callback) === 'function') {options.callback(false,null,options.options,e);}							
							}
						} else {
							if (typeof(options.callback) === 'function') {options.callback(false,null,options.options,"Unknown calendar");}
						}
					},{calendar:calendar,date:date,zone:zone,locale:locale,basepath:basepath,localePath:localepath,callback:callback,options:opts});
				}						
			} else {
				tzInit().getZone({name: config.zone, options: config, callback: function(success,zone,options,e){
					// make sure options is sane
					options = options || {};
					// did we have success?
					if (success) {
						options.zone = zone;
						calInit.getCalendar(options);
					} else {
						// no success, so callback that we know of no such zone
						if (typeof(options.callback) === 'function') {options.callback(false,null,options.options,"Unknown zone");}
					}
				}});
			}
		},

		/**
		 * Static function to clear the cache for calendar types. Once the description of a calendar is loaded via ajax, the 
		 * calendar is cached for future reference. This clears the cache, to force the next one to be loaded.
		 * 
		 * @param {String} name Calendar type name to clear, case-insensitive, e.g. "Gregorian". If empty, will clear all.
		 * @memberOf JSORM.calendar
		 */
		clearCache : function(name) {
			if (name) {
				// delete just that one
				delete impls[name.toLowerCase()];
			} else {
				// delete them all
				impls = {};
			}
		}		
	};
}()));


