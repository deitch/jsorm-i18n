
 i18n.js library, providing easy internationalization and resources for JavaScript
 Includes the following key classes:
 1) ResourceBundle : retrieve localized elements via Ajax from the server. Elements are stored in 
     Java-style properties files, and follow the same locale sequence.
 2) Currency : format currency into the appropriate country-specific format. 
 3) TimeZone : refer to a specific timezone. Includes all offset from UTC information and daylight savings time
     information. Uses a specially compiled JSON version of the Elsie ZoneInfo files in use on all Unix variants
     as well as Java. In order to keep it lightweight, the necessary information for a particular TimeZone is
     retrieved via Ajax.
 4) Locale : refer to localized information, specifically covering dates and times, for a specific locale.
     Understands fallbacks. For example, if one requests fr_FR, it will look for fr_FR, fr, en_US, en, nothing
 5) Calendar : map a specific instance in time, as normally provided by Date() or time in milliseconds since
     Unix Epoch (midnight January 1, 1970 UTC Gregorian) to its various fields in a specific Calendar. By 
     default uses GregorianCalendar, but can easily support any other type. Additionally, provides simple
     methods to modify fields, e.g. roll the month forward by 2, or set the date to be the 31st of the month.
     Finally, supports formatting to a string, using any of java, php or strftime formats, including
     full localization. E.g. one can get a Calendar, set the date to April 6, 2005 13:25:32 567 in the 
     timezone Australia/Sydney, add 2 months and 3 days to the date, then format it using calendar.format()

To Use in Browser:
 Include jsorm-utilities http://github.com/deitch/jsorm-utilities
 Include jsorm-i18n.js

To Use in Nodejs:
 npm install jsorm-i18n
 i18n = require('jsorm-i18n');

To test in browser:
  cd to the root directory
  launch a local Web server, simplest is "python -m SimpleHTTPServer"
  open a browser (Firefox is best) to the site http://localhost:8080/test/test.html

To test in nodejs:
  cd to the root director
  cd to test/
  make sure you have the right npm modules installed
      npm install underscore nodeunit
  node ./nodetest.js <test test ...>
      each test is the name of a section to test, e.g. calendar, core, currency, etc. separated by whitespace, or "all" for all
      the name of a test is a js file in the same directory, formatted as test-*.js

Extensive wiki at http://jsorm.com/wiki


	

