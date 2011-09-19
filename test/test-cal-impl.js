/*global JSORM */
testCalImpl = function(Y,name,plugin,years,maxDates,refDates,startOfDay) {
	var cal;
	var retText = null;

	return {
		name: name,
		/*
		 * Functions to test calendar functionality.
		 * These are the tests we want to perform:
		 * 1) maximum month for several years *
		 * 2) maximum days in several months for several years *
		 * 3) isLeapYear for several years *
		 * 4) daysToCalendar for several RD days *
		 * 5) calendarToDays for several dates *
		 * 6) processWeekCount - for several dates *
		 * 7) processIsoWeekCount - for several dates *
		 * 8) processTime - convert several times in different zones to the calendar equivalents *
		 * 9) processFields - convert fields to time for different dates and zones *
		 */
		runTest : function(fn) {
			var test = this;
			var resume = function(cal) {
				test.resume(function(){fn(cal);});
			};
			JSORM.getFile(plugin,function(url,xmlHttp,success,options) {
				if (success) {
					// we have it loaded
					retText = xmlHttp.responseText;
					var cal = eval("("+xmlHttp.responseText+")"); 
					resume(cal);
				}
			});
			this.wait(3000);
		},
		testMaxMonths : function() {
			this.runTest(function(cal) {
				var max = null;
				for (var i=0;i<years.length;i++) {
					max = cal.getMaxMonth(1,years[i]);
					Y.Assert.areEqual(years[i].months,max,"Maximum month for "+years[i].year);
				}					
			});
		},
		testMaxDays : function () {
			this.runTest(function(cal) {
				var max = null, dates = maxDates;
				for (var i=0;i<dates.length;i++) {
					var era = 1;
					max = cal.getMaxDate(era,dates[i].year, dates[i].month);
					Y.Assert.areEqual(dates[i].expect,max,"Maximum date for "+dates[i].year+'.'+dates[i].month);
					//debug("For era/year/month " + [era,dates[i].year,dates[i].month].join('/') + " expected "+dates[i].expect+" received "+max);
				}
			});
		},
		testMaxYearDay : function() {
			this.runTest(function(cal) {
				var max = null;
				for (var i=0;i<years.length;i++) {
					max = cal.getMaxDayOfYear(0,years[i].year);
					Y.Assert.areEqual(years[i].days,max,"Maximum days in year for "+years[i].year);
				}				
			});
		},
		testLeapYear : function () {
			this.runTest(function(cal) {
				var isLeap = null;
				for (var i=0;i<years.length;i++) {
					isLeap = cal.isLeapYear(years[i].year);
					Y.Assert.areEqual(years[i].leap,isLeap,"Mismatch for leap year "+years[i].year);
					//debug("for year "+years[i].year+ ": expected "+years[i].expect + " received "+isLeap);
				}
			});
		},

		testDaysToCalendar : function() {
			this.runTest(function(cal) {
				var rd, y, m, d, o, s1,s2;
				for (var i=0;i<refDates.length;i++) {
					rd = refDates[i][0];
					y = refDates[i][1];
					m = refDates[i][2];
					d = refDates[i][3];
					o = cal.daysToCalendar(rd);
					s1 = [y,m,d].join(':');
					s2 = [o.YEAR,o.MONTH,o.DATE].join(':');
					Y.Assert.areEqual(s1,s2,"for rd "+rd);
					//debug("for rd "+rd+ ": expected "+s1 + " received "+s2);
				}
			});
		},
		testCalendarToDays : function() {
			this.runTest(function(cal) {
				var rd, y, m, d, dow, o, s1;
				for (var i=0;i<refDates.length;i++) {
					rd = refDates[i][0];
					y = refDates[i][1];
					// the refDates is months:1-12 and dates:1-31, but we use months:0-11 and dates:0-30
					m = refDates[i][2];
					d = refDates[i][3];
					dow = refDates[i][4];
					o = cal.calendarToDays(1,y,m,d);
					s1 = [y,m,d].join('.');
					Y.Assert.areEqual(rd,o,"for y.m.d "+s1);
				}
			});
		},
		testStartOfDay : function() {
			this.runTest(function(cal) {
				for (var i=0;i<refDates.length;i++) {
					//console.log(jsorm.calendar);
					Y.Assert.areEqual(startOfDay,cal.getStartOfDay(),"Start of day should be midnight",cal.getStartOfDay());
				}
			});
		}
	};
};

