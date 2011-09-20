/*global JSORM */
testFn.testSym010Calendar = function(T) {
	var cal;

	// test bundles: [rd,m,y,d,dow]
	// reference dates, incl. y/m/d/dow given by sym010.org (Irv Bromberg)
	//  day of year, week of month, week of year calculated by genRefDates.java
	// each refDate entry is [rd,year,month,date,dayOfWeek,dayOfYear,weekOfMonth,weekOfYear]
	var refDates = [							// in Sym010
		[-214193, -586, 7, 21, 0, 205, 4, 30], // -586, 7, 21
		[-61387, -168, 12, 5, 3, 340, 1, 49], // -168, 12, 5
		[-61362, -168, 12, 30, 3, 340, 1, 49], // -168, 12, 30
		[-61361, -167, 1, 1, 3, 340, 1, 49], // -167, 1, 1
		[-61360, -167, 1, 2, 3, 340, 1, 49], // -167, 1, 2
		[25469, 70, 9, 26, 3, 267, 4, 39], // 70, 9, 26
		[49217, 135, 9, 30, 0, 275, 1, 40], // 135, 9, 30
		[171307, 470, 1, 10, 3, 8, 2, 2], // 470, 1, 10
		[210155, 576, 5, 20, 1, 141, 4, 21], // 576, 5, 20
		[253427, 694, 11, 11, 6, 314, 1, 45], // 694, 11, 11
		[369740, 1013, 4, 21, 0, 115, 4, 17], // 1013, 4, 21
		[400085, 1096, 5, 26, 0, 145, 4, 22], // 1096, 5, 26
		[434355, 1190, 3, 21, 5, 82, 3, 12], // 1190, 3, 21
		[452605, 1240, 3, 8, 6, 70, 1, 10], // 1240, 3, 8
		[470160, 1288, 4, 5, 5, 93, 0, 13], // 1288, 4, 5
		[473837, 1298, 4, 28, 0, 117, 5, 18], // 1298, 4, 28
		[507850, 1391, 6, 9, 0, 163, 3, 24], // 1391, 6, 9
		[524156, 1436, 2, 1, 3, 34, 1, 5], // 1436, 2, 1
		[544676, 1492, 4, 6, 6, 100, 1, 14], // 1492, 4, 6
		[567118, 1553, 9, 22, 6, 262, 3, 37], // 1553, 9, 22
		[569477, 1560, 3, 1, 6, 65, 1, 9], // 1560, 3, 1
		[601716, 1648, 6, 12, 3, 162, 2, 24], // 1648, 6, 12
		[613424, 1680, 6, 30, 0, 182, 5, 27], // 1680, 6, 30
		[626596, 1716, 7, 26, 5, 206, 4, 30], // 1716, 7, 26
		[645554, 1768, 6, 16, 0, 171, 4, 25], // 1768, 6, 16
		[664224, 1819, 7, 29, 1, 214, 1, 31], // 1819, 7, 29
		[671401, 1839, 3, 26, 3, 86, 4, 13], // 1839, 3, 26
		[694799, 1903, 4, 14, 0, 109, 4, 16], // 1903, 4, 14
		[704424, 1929, 8, 26, 0, 237, 4, 35], // 1929, 8, 26
		[708842, 1941, 10, 1, 1, 272, 5, 40], // 1941, 10, 1
		[709409, 1943, 4, 15, 1, 109, 3, 16], // 1943, 4, 15
		[709580, 1943, 10, 4, 4, 280, 1, 40], // 1943, 10, 4
		[727274, 1992, 3, 18, 2, 77, 3, 12], // 1992, 3, 18
		[728714, 1996, 2, 26, 0, 56, 4, 9], // 1996, 2, 26
		[744313, 2038, 11, 8, 3, 314, 2, 45], // 2038, 11, 8
		[764652, 2094, 7, 21, 0, 199, 3, 29] // 2094, 7, 21
	];

	var maxDates = [
		{year:1959,month:1,expect:30},
		{year:1959,month:2,expect:31},
		{year:1959,month:3,expect:30},
		{year:1959,month:4,expect:30},
		{year:1959,month:5,expect:31},
		{year:1959,month:6,expect:30},
		{year:1959,month:7,expect:30},
		{year:1959,month:8,expect:31},
		{year:1959,month:9,expect:30},
		{year:1959,month:10,expect:30},
		{year:1959,month:11,expect:31},
		{year:1959,month:12,expect:37},
		{year:2008,month:1,expect:30},
		{year:2008,month:2,expect:31},
		{year:2008,month:3,expect:30},
		{year:2008,month:4,expect:30},
		{year:2008,month:5,expect:31},
		{year:2008,month:6,expect:30},
		{year:2008,month:7,expect:30},
		{year:2008,month:8,expect:31},
		{year:2008,month:9,expect:30},
		{year:2008,month:10,expect:30},
		{year:2008,month:11,expect:31},
		{year:2008,month:12,expect:30},
		{year:2009,month:1,expect:30},
		{year:2009,month:2,expect:31},
		{year:2009,month:3,expect:30},
		{year:2009,month:4,expect:30},
		{year:2009,month:5,expect:31},
		{year:2009,month:6,expect:30},
		{year:2009,month:7,expect:30},
		{year:2009,month:8,expect:31},
		{year:2009,month:9,expect:30},
		{year:2009,month:10,expect:30},
		{year:2009,month:11,expect:31},
		{year:2009,month:12,expect:37},
		{year:2000,month:1,expect:30},
		{year:2000,month:2,expect:31},
		{year:2000,month:3,expect:30},
		{year:2000,month:4,expect:30},
		{year:2000,month:5,expect:31},
		{year:2000,month:6,expect:30},
		{year:2000,month:7,expect:30},
		{year:2000,month:8,expect:31},
		{year:2000,month:9,expect:30},
		{year:2000,month:10,expect:30},
		{year:2000,month:11,expect:31},
		{year:2000,month:12,expect:30},
		{year:1999,month:1,expect:30},
		{year:1999,month:2,expect:31},
		{year:1999,month:3,expect:30},
		{year:1999,month:4,expect:30},
		{year:1999,month:5,expect:31},
		{year:1999,month:6,expect:30},
		{year:1999,month:7,expect:30},
		{year:1999,month:8,expect:31},
		{year:1999,month:9,expect:30},
		{year:1999,month:10,expect:30},
		{year:1999,month:11,expect:31},
		{year:1999,month:12,expect:30},
		{year:1900,month:1,expect:30},
		{year:1900,month:2,expect:31},
		{year:1900,month:3,expect:30},
		{year:1900,month:4,expect:30},
		{year:1900,month:5,expect:31},
		{year:1900,month:6,expect:30},
		{year:1900,month:7,expect:30},
		{year:1900,month:8,expect:31},
		{year:1900,month:9,expect:30},
		{year:1900,month:10,expect:30},
		{year:1900,month:11,expect:31},
		{year:1900,month:12,expect:30}
	];

	var years = [
		{year: 1900, leap: false, months:12, days: 364},
		{year: 1901, leap: false, months:12, days: 364},
		{year: 1960, leap: false, months:12, days: 364},
		{year: 1959, leap: true, months:12, days: 371},
		{year: 1980, leap: false, months:12, days: 364},
		{year: 1979, leap: false, months:12, days: 364},
		{year: 1981, leap: true, months:12, days: 371},
		{year: 1984, leap: false, months:12, days: 364},
		{year: 1990, leap: false, months:12, days: 364},
		{year: 1992, leap: true, months:12, days: 371},
		{year: 2000, leap: false, months:12, days: 364},
		{year: 2001, leap: false, months:12, days: 364},
		{year: 2008, leap: false, months:12, days: 364},
		{year: 2009, leap: true, months:12, days: 371},
		{year: 2010, leap: false, months:12, days: 364},
		{year: 2011, leap: false, months:12, days: 364},
		{year: 2012, leap: false, months:12, days: 364}
	];

	// get the configuration object literal
	var o = testCalImpl(T,"Sym010 Calendar Tests","../src/calendars/sym010.json",years,maxDates,refDates,JSORM.calendar.MIDNIGHT);
	return new T.testCase(o);
};

