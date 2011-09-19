/**
 * @class This stub class is a guide to creating new calendar implementation. Initially, i18n ships with only one implementation, 
 * GregorianCalendar. If you wish to create new implementations, follow the template in this file.
 * <p/>
 * A new calendar implementation must follow certain rules, known as the contract, to be used successfully as an implementation.
 * <ul>
 * <li>The file must be named <calendarname>.js in lower case, e.g. gregorian.js, hebrew.js, julian.js, muslim.js</li>
 * <li>The contents of the file should be a single JSON-compliant www.json.org object literal. This object literal will be treated
 * 		as the prototype of the class. You must <b>not</b> assume your object literal will be parsed by eval(). It may be
 * 		parsed by any JSON-compliant parser.</li>
 * <li>Because you are creating the prototype as an object literal, no constructor will be allowed.</li>
 * <li>The literal must have the method signature getMaxEra()</li>
 * <li>The literal must have the method signature getMinEra()</li>
 * <li>The literal must have the method signature getMaxYear(era)</li>
 * <li>The literal must have the method signature getMinYear(era)</li>
 * <li>The literal must have the method signature getMaxMonth(era,year)</li>
 * <li>The literal must have the method signature getMinMonth(era,year)</li>
 * <li>The literal must have the method signature getMaxDate(era,year,month)</li>
 * <li>The literal must have the method signature getMinDate(era,year,month)</li>
 * <li>The literal must have the method signature getMaxDayOfYear(era,year)</li>
 * <li>The literal must have the method signature getMinDayOfYear(era,year)</li>
 * <li>The literal must have the method signature daysToCalendar(days)</li>
 * <li>The literal must have the method signature calendarToDays(era,year,month,date)</li>
 * <li>The literal must have the method signature getDefaultLocale</li>
 * <li>The literal must have the method signature getDefaultLocaleInfo</li>
 * <li>The literal must have the method signature getName</li>
 * <li>The literal must have the method signature getStartOfDay</li>
 * </ul>
 * <p/>
 * Calendar processing is a relationship of calculation between a set of fields - year, month, date, in a particular calendaring
 * system, a.k.a. implementation, and a particular day relative to an arbitrary epoch. For our purposes, we have picked the arbitrary
 * epoch of the first day of the Gregorian calendar system, if that system were stretched backwards in time. Put in other words,
 * it is 01.01.0001 Gregorian.
 * The moment in time is <u>always</u> given in terms of milliseconds
 * since the system Epoch, midnight at the beginning of 1 January 1970 UTC/GMT. In general calendar implementations do not require millisecond 
 * precision, which can make calculations inefficient, and will convert to seconds, calculate, and then add back the milliseconds, but this
 * is not required. 
 * <p/>
 * Calendar processing takes into account two other elements: week calculations and timezones.
 * <ol>
 * <li>Timezones are fairly straightforward. Because the time of day and even date for a particular absolute moment in time may
 *     change based on your timezone, i.e. location, timezone must be taken into account. For example, the system Epoch of midnight at
 *     the beginning of 1 January 1970 UTC/GMT, is 19:00 in New York City on 31 December 1969, and 02:00 in Moscow on 1 January 1970. 
 *     Timezones use the TimeZone object. In order to use them correctly, please see the TimeZone.</li>
 * <li>Week calculations determine which week of the month or year a particular date is in. For example, the June 8 might be considered
 * 		week 1 or week 2 of the month. This depends on three critical elements:
 * 	<ol>
 * 		<li>The day of the week, e.g. if June 8 is on a Tuesday versus a Sunday</li>
 * 		<li>The first day of the week, e.g. are we counting weeks beginning on Sunday, Monday, Thursday or some other day</li>
 * 		<li>The minimum days in a week, e.g. must there be 1,2,3 or more days in a week for it to be considered a full week</li>
 * 	</ol>
 * </li>
 * </ol>
 * <p/>
 * In order to better illustrate how week counting works, here are several examples. We will assume the first day of the week is provided
 * as Monday, i.e. 1, and the minimum days in the week is 4. This is specifically the case of ISO week counting.
 * If the 1st of the month is on a Thursday, then there are 4 days in the week before the next incidence of the first of the week, i.e. Monday.
 * These are days 1,2,3,4 = Thu,Fri,Sat,Sun. Thus, these days are considered week 1 of the month, and the following Mon-Sun are considered week 
 * 2. On the other hand, if the first of the month is on Fri, then there are only 3 days in the week before the next incidence of the first
 * of the week, i.e. Monday. These are days 1,2,3 = Fri,Sat,Sun. Since we already determined that the minimum days in the week is 4, yet there
 * are only 3, this week is considered week 0, or possibly the last week of the previous month, and the days from Mon-Sun, i.e. dates
 * 4-10, are considered week 1.
 * <p/>
 * The calendar fields that are passed to processFields, getMax and getMin and are 
 * expected from processTime can be found in the introduction to Calendar.
  * 
  * @static
  * @name JSORM.CalendarImpl
  */
/** @scope JSORM.CalendarImpl.prototype */{
	/**
	 * Get the name of the calendar. It is used solely for reference.
	 */
	getName : function() {}, // default 'gregorian'
	/**
	 * List what locale is built into the Calendar implementation, to be used
	 * if no locale-appropriate file is available. The example included in CalendarImpl is for locale English US = 'en_US'
	 */
	getDefaultLocale : function(){}, // default 'en_US'

	/**
	 * List the localized entries to use when no locale files are available. They should be according to the defaultLocale described
	 * in defaultLocale. The keys and values are expected to follow the rules for CalendarLocale.
	 */
	getDefaultLocaleInfo : function() {}, /* default{
		SUNDAY : 'Sunday:Sun', MONDAY: 'Monday:Mon', TUESDAY: 'Tuesday:Tue', WEDNESDAY: 'Wednesday:Wen',
		THURSDAY: 'Thursday:Thu', FRIDAY: 'Friday:Fri', SATURDAY: 'Saturday:Sat',
		JANUARY: 'January:Jan', FEBRUARY: 'February:Feb', MARCH: 'March:Mar', APRIL: 'April:Apr', MAY: 'May:May',
		JUNE: 'June:Jun', JULY: 'July:Jul', AUGUST: 'August:Aug', SEPTEMBER: 'September:Sep', 
		OCTOBER: 'October:Oct', NOVEMBER: 'November:Nov', DECEMBER: 'December:Dec',
		AM: 'AM', PM: 'PM', ERA0: 'BCE', ERA1: 'CE', COUNT0: 'th', COUNT1: 'st', COUNT2: 'nd', COUNT3: 'rd',
		COUNT21: 'st', COUNT22: 'nd', COUNT23: 'rd', COUNT31: 'st', COUNTN: 'th'
	},*/
	
	/**
	 * Get the start of the day, one of 
	 * - JSORM.Calendar.MIDNIGHT 
	 * - JSORM.Calendar.NOON
	 * - JSORM.Calendar.SUNRISE
	 * - JSORM.Calendar.SUNSET
	 */
	getStartOfDay : function() {},

	/**
	 * Get the maximum allowed for the era, under this calendaring system. This is part of the base
	 * contract between a Calendar and an implementation.
	 * @return {int} The maximum actual possible value for the era
	 */
	getMaxEra : function() {},

	/**
	 * Get the minimum allowed for the era, under this calendaring system. This is part of the base
	 * contract between a Calendar and an implementation.
	 * @return {int} The minimum actual possible value for the era
	 */
	getMinEra : function() {},

	/**
	 * Get the maximum allowed for the year, given the era, under this calendaring system. This is part of the base
	 * contract between a Calendar and an implementation.
	 * @param {int} era The era in this calendaring system
	 * @return {int} The maximum actual possible value for the era
	 */
	getMaxYear : function(era) {},

	/**
	 * Get the minimum allowed for the year, given the era, under this calendaring system. This is part of the base
	 * contract between a Calendar and an implementation.
	 * @param {int} era The era in this calendaring system
	 * @return {int} The minimum actual possible value for the era
	 */
	getMinYear : function(era) {},

	/**
	 * Get the maximum allowed for the month, given the era and year, under this calendaring system. This is part of the base
	 * contract between a Calendar and an implementation.
	 * @param {int} era The era in this calendaring system
	 * @param {int} year The year in the given era in this calendaring system
	 * @return {int} The maximum actual possible value for the month
	 */
	getMaxMonth : function(era,year) {},

	/**
	 * Get the minimum allowed for the month, given the era and year, under this calendaring system. This is part of the base
	 * contract between a Calendar and an implementation.
	 * @param {int} era The era in this calendaring system
	 * @param {int} year The year in the given era in this calendaring system
	 * @return {int} The minimum actual possible value for the month
	 */
	getMinMonth : function(era,year) {},

	/**
	 * Get the maximum allowed for the date, given the era, year and month, under this calendaring system. This is part of the base
	 * contract between a Calendar and an implementation.
	 * @param {int} era The era in this calendaring system
	 * @param {int} year The year in the given era in this calendaring system
	 * @param {int} month The month in the given era in this calendaring system
	 * @return {int} The maximum actual possible value for the date
	 */
	getMaxDate : function(era,year,month) {},

	/**
	 * Get the minimum allowed for the date, given the era, year and month, under this calendaring system. This is part of the base
	 * contract between a Calendar and an implementation.
	 * @param {int} era The era in this calendaring system
	 * @param {int} year The year in the given era in this calendaring system
	 * @param {int} month The month in the given year in this calendaring system
	 * @return {int} The minimum actual possible value for the date
	 */
	getMinDate : function(era,year,month) {},

	/**
	 * Get the maximum allowed for the day of year, given the era and year, under this calendaring system. 
	 * This is part of the base contract between a Calendar and an implementation.
	 * @param {int} era The era in this calendaring system
	 * @param {int} year The year in the given era in this calendaring system
	 * @return {int} The maximum actual possible value for the day of year
	 */
	getMaxDayOfYear : function(era,year) {},

	/**
	 * Get the minimum allowed for the day of year, given the era and year, under this calendaring system. 
	 * This is part of the base contract between a Calendar and an implementation.
	 * @param {int} era The era in this calendaring system
	 * @param {int} year The year in the given era in this calendaring system
	 * @return {int} The minimum actual possible value for the day of year
	 */
	getMaxDayOfYear : function(era,year) {},


	/**
	 * Convert a day relative to the arbitrary Epoch to a combination of era/year/month/date in this calendar. Because not every
	 * calendar system switches days at the same time - e.g. Gregorian does midnight, while Hebrew does sunset, which varies
	 * with time of year and location - the assumption in this conversion is that the moment in time is high noon. 
	 * Accounting for time differences is handled in two steps:
	 * 1) The Calendar object (i.e. not the particular implementation) will convert from the specific moment in time
	 *     to the relevant moment in time in the time zone. For example, if the specific time is 2:00am UTC, but the time zone is
	 *     New York City, then the local time is 9:00pm the previous evening. If needed - i.e. if the timezone accounting
	 *     means the day has changed - the Calendar will call daysToCalendar again, as necessary
	 * 2) The Calendar object (i.e. not the particular implementation) will query the calendar to determine when
	 *     its day starts, one of: noon, midnight, sunrise, sunset. It will then determine if the actual time
	 *     means the date should be different and recalculate accordingly. For example, if the specific time is 10:00am in the
	 *     local time zone, but the calendar is Julian, which switches at noon, then the actual day should be rolled backwards
	 *     by one - the Calendar will call daysToCalendar again, as necessary 
	 * <p/>
	 * The returned object is a JavaScript literal array with 6 fields: 
	 * era, year, month, date, dayOfYear, leap
	 *  
	 * For example, in the Gregorian calendar system, January 1, 1970 CE will be given as 
	 * {ERA: 1, YEAR: 1970, MONTH: 0, DATE: 0, DAY_OF_YEAR: 0, LEAP: 0}
	 * This is part of the base contract between Calendar and an implementation. 
	 * 
	 * @param {int} day Days since the arbitrary Epoch, 01.01.0001 Gregorian 
	 * @return {object} Object containing the calculated fields, following the Calendar contract, see the comments to this method
	 */	
	daysToCalendar : function(day) {},

	/**
	 * Convert a given date in this calendar system - era, year, month, date - into a day relative to the
	 * arbitrary Epoch. Because not every
	 * calendar system switches days at the same time - e.g. Gregorian does midnight, while Hebrew does sunset, which varies
	 * with time of year and location - the assumption in this conversion is that the moment in time is high noon
	 * in the local time zone. Accounting for time differences is handled separately.
	 * This is part of the base contract between Calendar 
	 * and an implementation. 
	 * <p/>
	 * calendarToDays is expected to sanely handle invalid field values according to its own rules. For example, if the maximum for a valid 
	 * month is 11, yet the user sets it to 13, this function should understand that this is really 2 months into the next year,
	 * and increment all higher fields appropriately.
	 * 
	 * @param {int} e Era for the passed date, beginning with 0
	 * @param {int} y Year within the era for the passed date, following the conventions of the calendar
	 * @param {int} m Month within the year within the era for the passed date, beginning with 0
	 * @param {int} d Date within the month within the year within the era for the passed date, beginning with 0
	 * @return {int} Days since the arbitrary Epoch, 01.01.0001 Gregorian
	 */
	calendarToDays : function(e,y,m,d) {}


	/*
	 * Old ones - soon to be retired
	 */
	
	
	/**
	 * Get the maximum allowed for a particular field, given the other information in the fields. This is part of the base
	 * contract between a Calendar and an implementation.
	 * @param {String} field The name of the field whose maximum is desired. You can use the actual string, but the Calendar.<NAME> constant 
	 *  is preferred.
	 * @param {object} fields Object containing all of the normal Calendar fields. This is passed by the Calendar
	 *   object when getMax() is called. In general, getMax() should <b>not</b> modify this field.
	 * @return {int} The maximum actual possible value for the field, given the other field values
	 */
	getMax : function(field,fields) {},

	/**
	 * Get the minimum allowed for a particular field, given the other information in the fields. This is part of the base
	 * contract between a Calendar and an implementation.
	 * @param {String} field The name of the field whose minimum is desired. You can use the actual string, but the Calendar.<NAME> constant 
	 *  is preferred.
	 * @param {object} fields Object containing all of the normal Calendar fields. This is passed by the Calendar
	 *   object when getMin() is called. In general, getMin() should <b>not</b> modify this field.
	 * @return {int} The minimum actual possible value for the field, given the other field values
	 */
	getMin : function(field,fields) {},


	/**
	 * Convert an absolute moment in time in a given zone with a given set of rules to a moment in time according to this
	 * calendar. This is part of the base contract between Calendar and an implementation. The first two arguments are necessary 
	 * to determine what the actual calendar entities are: day, month, year, hour, minute, second, day of week, day of year.
	 * The second two arguments determine what week of the month and week of the year it is. In some locales or systems, 
	 * the first day of the week is Sunday, in others Monday, etc. Similarly, in some locales, the first week of a period,
	 * in order to be considered the first week, must have a minimum number of days. 
	 * @param {long} time time in milliseconds since the systems epoch, midnight at the start 1 January 1970 UTC.
	 * @param {Object} zone a TimeZone object that provides the rules for offset from GMT as well as daylight savings rules
	 * @param {int} firstDayOfWeek the first day of the week from 0 (Sunday) to 6 (Saturday)
	 * @param {int} minDaysInWeek the minimum number of days in a week for it to be considered the first week
	 * @return {object} Object containing all the calculated fields, following the Calendar contract, see the introduction to this file
	 */	
	processTime : function(time,zone,firstDayOfWeek,minDaysInWeek) {},

	/**
	 * Convert a given set of fields - year, month, day, hour, minute, second - into an absolute moment in time in milliseconds
	 * since the system epoch (midnight at the start of 1 January 1970 UTC). This is part of the base contract between Calendar 
	 * and an implementation. It is up to the implementation to determine which fields are checked in which order. However, in general, users
	 * expect the Calendar to follow:
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
	 * For the field list, see the beginning of this file.
	 * <p/>
	 * The specific Calendar Implementation is not expected to modify the fields after processing. Specifically, after processing the fields
	 * and returning the time, the implementation can <b>always</b> expect Calendar to call processTime to reset the fields
	 * properly.
	 * <p/>
	 * processFields is expected to sanely handle invalid field values according to its own rules. For example, if the maximum for a valid 
	 * SECOND field is 59, yet the user sets it to 62, processFields() should understand that this is really 2 seconds into the next minute,
	 * and increment all higher fields appropriately.
	 * 
	 * @param {object} fields The fields with the data to use to convert to milliseconds.
	 * @param {object} dirty An object whose keys match those keys in fields that have been modified. The values are the timestamps, in
	 * milliseconds since the system epoch, of the most recent modification. 
	 * @param {object} zone A timezone object
	 * @return {long} Milliseconds since the system epoch (midnight at the start of 1 January 1970 UTC) for the given fields
	 */
	processFields : function(fields,dirty,zone) {}

}


