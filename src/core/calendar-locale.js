/**
 * @class This stub class is a guide to creating new locales for calendar implementations. Initially, i18n ships with only one locale,
 * English US = 'en_US'. If you wish to add new locales, e.g. fr_FR for a calendar implementation, follow the template in this file.
 * Note that locales for calendar implementations are <b>not</b> JavaScript files or classes, but rather .properties files,
 * identical to (and editable by) Java properties files
 * <p/>
 * A new locale must follow certain rules, known as the contract, to be used successfully as a locale.
 * <ul>
 * <li>The file <calendarname><locale>.properties. The <calendarname> must be in lower case. The <locale> component is any valid
 * language/country name. These are separated by '_', and separated from <calendarname> by '_'. Thus, valid locales are 'en_US', 'fr',
 * 'en'. You may also have no locale at all, which creates the default file to use if not matching one is found. Put together,
 * valid locale file examples are gregorian_en_US.properties, hebrew_fr.properties, muslim.properties.</li>
 * <li>The file contents must follow the Java properties file convention. The key is a string, followed by an equals sign '=', followed
 *     by the localized value. e.g. 
 * <pre>
 * SUNDAY = Dimanche
 * </pre>
 * </li>
 * <li>For any field where there is a short form and a long form, e.g. for months, the value must be longform:shortform, e.g.
 * <pre>
 * SUNDAY = Sunday:Sun
 * </pre>
 * </li>
 * </ul>
 * <p/>
 * The following table lists all the expected keys in a calendar localization file.
 * <table>
 * <tr><th>Key</th><th>long:short</th><th>Meaning</th></tr>
 * <tr><td>SUNDAY</td><td>Yes</td><td>Sunday, DAY_OF_WEEK=0</td></tr>
 * <tr><td>MONDAY</td><td>Yes</td><td>Monday, DAY_OF_WEEK=1</td></tr>
 * <tr><td>TUESDAY</td><td>Yes</td><td>Tuesday, DAY_OF_WEEK=2</td></tr>
 * <tr><td>WEDNESDAY</td><td>Yes</td><td>Wednesday, DAY_OF_WEEK=3</td></tr>
 * <tr><td>THURSDAY</td><td>Yes</td><td>Thursday, DAY_OF_WEEK=4</td></tr>
 * <tr><td>FRIDAY</td><td>Yes</td><td>Friday, DAY_OF_WEEK=5</td></tr>
 * <tr><td>SATURDAY</td><td>Yes</td><td>Saturday, DAY_OF_WEEK=6</td></tr>
 * <tr><td>JANUARY</td><td>Yes</td><td>MONTH=0</td></tr>
 * <tr><td>FEBRUARY</td><td>Yes</td><td>MONTH=1</td></tr>
 * <tr><td>MARCH</td><td>Yes</td><td>MONTH=2</td></tr>
 * <tr><td>APRIL</td><td>Yes</td><td>MONTH=3</td></tr>
 * <tr><td>MAY</td><td>Yes</td><td>MONTH=4</td></tr>
 * <tr><td>JUNE</td><td>Yes</td><td>MONTH=5</td></tr>
 * <tr><td>JULY</td><td>Yes</td><td>MONTH=6</td></tr>
 * <tr><td>AUGUST</td><td>Yes</td><td>MONTH=7</td></tr>
 * <tr><td>SEPTEMBER</td><td>Yes</td><td>MONTH=8</td></tr>
 * <tr><td>OCTOBER</td><td>Yes</td><td>MONTH=9</td></tr>
 * <tr><td>NOVEMBER</td><td>Yes</td><td>MONTH=10</td></tr>
 * <tr><td>DECEMBER</td><td>Yes</td><td>MONTH=11</td></tr>
 * <tr><td>UNDECIMBER</td><td>Yes</td><td>MONTH=12</td></tr>
 * <tr><td>AM</td><td>No</td><td>Midnight until just before noon</td></tr>
 * <tr><td>PM</td><td>No</td><td>Noon until just before midnight</td></tr>
 * <tr><td>ERA0</td><td>No</td><td>Before the major era change, e.g. BCE</td></tr>
 * <tr><td>ERA1</td><td>No</td><td>After the major era change, e.g. CE</td></tr>
 * <tr><td>COUNT0</td><td>No</td><td>The suffix to add to 0, e.g. 'th' to make 0th</td></tr>
 * <tr><td>COUNT1</td><td>No</td><td>The suffix to add to 1, e.g. 'st' to make 1st</td></tr>
 * <tr><td>COUNTN</td><td>No</td><td>The suffix to add to any unlisted number, e.g. 'th' to make Nth</td></tr>
 * </table>
 * <p/>
 * Note that for COUNT, you can list as many or as few as you want, e.g. COUNT235 would add the value to the number 235 as a suffix. 
 * If a specific suffix cannot be found, e.g. Calendar is looking for a suffic for 512 and cannot find one, it will default to using COUNTN.
 * <p/>
 * The following is an example properties file for Gregorian Calendar, locale en_US.
 * <pre>
	SUNDAY = Sunday:Sun
	MONDAY = Monday:Mon
	TUESDAY = Tuesday:Tue
	WEDNESDAY = Wednesday:Wed
	THURSDAY = Thursday:Thu
	FRIDAY = Friday:Fri
	SATURDAY = Saturday:Sat
	JANUARY = January:Jan
	FEBRUARY = February:Feb
	MARCH = March:Mar
	APRIL = April:Apr
	MAY = May:May
	JUNE = June:Jun
	JULY = July:Jul
	AUGUST = August:Aug
	SEPTEMBER = September:Sep 
	OCTOBER = October:Oct
	NOVEMBER = November:Nov
	DECEMBER = December:Dec
	AM = AM
	PM = PM
	ERA0 = BCE
	ERA1 = CE
	COUNT0 = th
	COUNT1 = st
	COUNT2 = nd
	COUNT3 = rd
	COUNTN = th
	COUNT21 = st
	COUNT22 = nd
	COUNT23 = rd
	COUNT31 = st
 * </pre>
 * @static
 */
JSORM.CalendarLocale = function() {};
