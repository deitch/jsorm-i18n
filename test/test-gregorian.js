/*global JSORM */
testFn.testGregorianCalendar = function(T) {
	var cal;
	var retText = null;

	// test bundles: [rd,m,y,d,dow]
	// reference dates, incl. y/m/d/dow given by Calendrical Calculations (Reingold & Dershowitz)
	//  day of year, week of month, week of year calculated by genRefDates.java
	// each refDate entry is [rd,year,month,date,dayOfWeek,dayOfYear,weekOfMonth,weekOfYear]
	var refDates = [
		[-214193, -586, 7, 24, 0, 205, 4, 30],
		[-61387, -168, 12, 5, 3, 340, 1, 49],
		[25469, 70, 9, 24, 3, 267, 4, 39],
		[49217, 135, 10, 2, 0, 275, 1, 40],
		[171307, 470, 1, 8, 3, 8, 2, 2],
		[210155, 576, 5, 20, 1, 141, 4, 21],
		[253427, 694, 11, 10, 6, 314, 1, 45],
		[369740, 1013, 4, 25, 0, 115, 4, 17],
		[400085, 1096, 5, 24, 0, 145, 4, 22],
		[434355, 1190, 3, 23, 5, 82, 3, 12],
		[452605, 1240, 3, 10, 6, 70, 1, 10],
		[470160, 1288, 4, 2, 5, 93, 0, 13],
		[473837, 1298, 4, 27, 0, 117, 5, 18],
		[507850, 1391, 6, 12, 0, 163, 3, 24],
		[524156, 1436, 2, 3, 3, 34, 1, 5],
		[544676, 1492, 4, 9, 6, 100, 1, 14],
		[567118, 1553, 9, 19, 6, 262, 3, 37],
		[569477, 1560, 3, 5, 6, 65, 1, 9],
		[601716, 1648, 6, 10, 3, 162, 2, 24],
		[613424, 1680, 6, 30, 0, 182, 5, 27],
		[626596, 1716, 7, 24, 5, 206, 4, 30],
		[645554, 1768, 6, 19, 0, 171, 4, 25],
		[664224, 1819, 8, 2, 1, 214, 1, 31],
		[671401, 1839, 3, 27, 3, 86, 4, 13],
		[694799, 1903, 4, 19, 0, 109, 4, 16],
		[704424, 1929, 8, 25, 0, 237, 4, 35],
		[708842, 1941, 9, 29, 1, 272, 5, 40],
		[709409, 1943, 4, 19, 1, 109, 3, 16],
		[709580, 1943, 10, 7, 4, 280, 1, 40],
		[727274, 1992, 3, 17, 2, 77, 3, 12],
		[728714, 1996, 2, 25, 0, 56, 4, 9],
		[744313, 2038, 11, 10, 3, 314, 2, 45],
		[764652, 2094, 7, 18, 0, 199, 3, 29]
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
		{year:1900,month:2,expect:28},
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
		{year: 1900, leap: false, months:12,days: 365},
		{year: 1901, leap: false, months:12,days: 365},
		{year: 1960, leap: true, months:12,days: 366},
		{year: 1959, leap: false, months:12,days: 365},
		{year: 1980, leap: true, months:12,days: 366},
		{year: 1979, leap: false, months:12,days: 365},
		{year: 1981, leap: false, months:12,days: 365},
		{year: 1984, leap: true, months:12,days: 366},
		{year: 1990, leap: false, months:12,days: 365},
		{year: 1992, leap: true, months:12,days: 366},
		{year: 2000, leap: true, months:12,days: 366},
		{year: 2001, leap: false, months:12,days: 365}
	];

	// get the configuration object literal
	var o = testCalImpl(T,"Gregorian Calendar Tests","../src/calendars/gregorian.json",years,maxDates,refDates,JSORM.calendar.MIDNIGHT);
	return new T.testCase(o);	
};

