/*global JSORM */
calImplTests.push({name: "Islamic Calendar",fn: function(Y) {
	var cal;
	var retText = null;

	// test bundles: [rd,m,y,d,dow]
	// reference dates, incl. y/m/d/dow given by Calendrical Calculations (Reingold & Dershowitz)
	// each refDate entry is [rd,year,month,date,dayOfWeek,dayOfYear,weekOfMonth,weekOfYear]
	var refDates = [
		[-214193, -1245, 12, 9, 0],
		[-61387, -813, 2, 23, 3],
		[25469,-568, 4, 1, 3],
		[49217, -501, 4, 6, 0],
		[171307, -157, 10, 17, 3],
		[210155, -47, 6, 3, 1],
		[253427, 75, 7, 13, 6],
		[369740, 403, 10, 5, 0],
		[400085, 489, 5, 22, 0],
		[434355, 586, 2, 7, 5],
		[452605, 637, 8, 7, 6],
		[470160, 687, 2, 20, 5],
		[473837, 697, 7, 7, 0],
		[507850, 793, 7, 1, 0],
		[524156, 839, 7, 6, 3],
		[544676, 897, 6, 1, 6],
		[567118, 960, 9, 30, 6],
		[569477, 967, 5, 27, 6],
		[601716, 1058, 5, 18, 3],
		[613424, 1091, 6, 2, 0],
		[626596, 1128, 8, 4, 5],
		[645554, 1182, 2, 3, 0],
		[664224, 1234, 10, 10, 1],
		[671401, 1255, 1, 11, 3],
		[694799, 1321, 1, 21, 0],
		[704424, 1348, 3, 19, 0],
		[708842, 1360, 9, 8, 1],
		[709409, 1362, 4, 13, 1],
		[709580, 1362, 10, 7, 4],
		[727274, 1412, 9, 13, 2],
		[728714, 1416, 10, 5, 0],
		[744313, 1460, 10, 12, 3],
		[764652, 1518, 3, 5, 0]
	];

	var maxDates = [
		{year:1000,month:1,expect:30},
		{year:1000,month:2,expect:29},
		{year:1000,month:3,expect:30},
		{year:1000,month:4,expect:29},
		{year:1000,month:5,expect:30},
		{year:1000,month:6,expect:29},
		{year:1000,month:7,expect:30},
		{year:1000,month:8,expect:29},
		{year:1000,month:9,expect:30},
		{year:1000,month:10,expect:29},
		{year:1000,month:11,expect:30},
		{year:1000,month:12,expect:30},
		{year:999,month:1,expect:30},
		{year:999,month:2,expect:29},
		{year:999,month:3,expect:30},
		{year:999,month:4,expect:29},
		{year:999,month:5,expect:30},
		{year:999,month:6,expect:29},
		{year:999,month:7,expect:30},
		{year:999,month:8,expect:29},
		{year:999,month:9,expect:30},
		{year:999,month:10,expect:29},
		{year:999,month:11,expect:30},
		{year:999,month:12,expect:29},
		{year:900,month:1,expect:30},
		{year:900,month:2,expect:29},
		{year:900,month:3,expect:30},
		{year:900,month:4,expect:29},
		{year:900,month:5,expect:30},
		{year:900,month:6,expect:29},
		{year:900,month:7,expect:30},
		{year:900,month:8,expect:29},
		{year:900,month:9,expect:30},
		{year:900,month:10,expect:29},
		{year:900,month:11,expect:30},
		{year:900,month:12,expect:29}
	];

	var years = [
		{year: 1000, leap: true, months: 12, days: 355},
		{year: 900, leap: false, months: 12, days: 354}
	];

	var o = testCalImpl(Y,"Islamic Calendar Tests","../src/calendars/islamic.json",years,maxDates,refDates,JSORM.calendar.SUNSET);
	return new Y.Test.Case(o);
}});

