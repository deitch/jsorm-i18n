testFn.testCore = function(T) {
	var suite = new T.testSuite("Core Tests");
	suite.add(testFn.testCalendar(T));
	suite.add(testFn.testCurrency(T));
	suite.add(testFn.testResourceBundle(T));
	suite.add(testFn.testTimeZone(T));
};