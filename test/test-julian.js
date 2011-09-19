/*global JSORM */
testFn.testJulianCalendar = function(Y) {
	var cal;
	var retText = null;

	// test bundles: [rd,m,y,d,dow]
	// reference dates, incl. y/m/d/dow given by Calendrical Calculations (Reingold & Dershowitz)
	// each refDate entry is [rd,year,month,date,dayOfWeek,dayOfYear,weekOfMonth,weekOfYear]
	var refDates = [
		[-214193, -587, 7, 30, 0],
		[-61387, -169, 12, 8, 3],
		[25469, 70, 9, 26, 3],
		[49217, 135, 10, 3, 0],
		[171307, 470, 1, 7, 3],
		[210155, 576, 5, 18, 1],
		[253427, 694, 11, 7, 6],
		[369740, 1013, 4, 19, 0],
		[400085, 1096, 5, 18, 0],
		[434355, 1190, 3, 16, 5],
		[452605, 1240, 3, 3, 6],
		[470160, 1288, 3, 26, 5],
		[473837, 1298, 4, 20, 0],
		[507850, 1391, 6, 4, 0],
		[524156, 1436, 1, 25, 3],
		[544676, 1492, 3, 31, 6],
		[567118, 1553, 9, 9, 6],
		[569477, 1560, 2, 24, 6],
		[601716, 1648, 5, 31, 3],
		[613424, 1680, 6, 20, 0],
		[626596, 1716, 7, 13, 5],
		[645554, 1768, 6, 8, 0],
		[664224, 1819, 7, 21, 1],
		[671401, 1839, 3, 15, 3],
		[694799, 1903, 4, 6, 0],
		[704424, 1929, 8, 12, 0],
		[708842, 1941, 9, 16, 1],
		[709409, 1943, 4, 6, 1],
		[709580, 1943, 9, 24, 4],
		[727274, 1992, 3, 4, 2],
		[728714, 1996, 2, 12, 0],
		[744313, 2038, 10, 28, 3],
		[764652, 2094, 7, 5, 0]
	];

	var maxDates = [
		{year:2000,month:1,expect:31},
		{year:2000,month:2,expect:29},
		{year:2000,month:3,expect:31},
		{year:2000,month:4,expect:30},
		{year:2000,month:5,expect:31},
		{year:2000,month:6,expect:30},
		{year:2000,month:7,expect:31},
		{year:2000,month:8,expect:31},
		{year:2000,month:9,expect:30},
		{year:2000,month:10,expect:31},
		{year:2000,month:11,expect:30},
		{year:2000,month:12,expect:31},
		{year:1999,month:1,expect:31},
		{year:1999,month:2,expect:28},
		{year:1999,month:3,expect:31},
		{year:1999,month:4,expect:30},
		{year:1999,month:5,expect:31},
		{year:1999,month:6,expect:30},
		{year:1999,month:7,expect:31},
		{year:1999,month:8,expect:31},
		{year:1999,month:9,expect:30},
		{year:1999,month:10,expect:31},
		{year:1999,month:11,expect:30},
		{year:1999,month:12,expect:31},
		{year:1900,month:1,expect:31},
		{year:1900,month:2,expect:29},
		{year:1900,month:3,expect:31},
		{year:1900,month:4,expect:30},
		{year:1900,month:5,expect:31},
		{year:1900,month:6,expect:30},
		{year:1900,month:7,expect:31},
		{year:1900,month:8,expect:31},
		{year:1900,month:9,expect:30},
		{year:1900,month:10,expect:31},
		{year:1900,month:11,expect:30},
		{year:1900,month:12,expect:31}
	];

	var years = [
		{year: 1900, leap: true, months: 12, days: 366},
		{year: 1901, leap: false, months: 12, days: 365},
		{year: 1960, leap: true, months: 12, days: 366},
		{year: 1959, leap: false, months: 12, days: 365},
		{year: 1980, leap: true, months: 12, days: 366},
		{year: 1979, leap: false, months: 12, days: 365},
		{year: 1981, leap: false, months: 12, days: 365},
		{year: 1984, leap: true, months: 12, days: 366},
		{year: 1990, leap: false, months: 12, days: 365},
		{year: 1992, leap: true, months: 12, days: 366},
		{year: 2000, leap: true, months: 12, days: 366},
		{year: 2001, leap: false, months: 12, days: 365}
	];

	// get the configuration object literal
	var o = testCalImpl(Y,"Julian Calendar Tests","../src/calendars/julian.json",years,maxDates,refDates,JSORM.calendar.MIDNIGHT);
	return new Y.Test.Case(o);
};

