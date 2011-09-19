testFn.testCore = function(Y) {
	var suite = new Y.Test.Suite("Core Tests");
	suite.add(testFn.testCalendar(Y));
	suite.add(testFn.testCurrency(Y));
	suite.add(testFn.testResourceBundle(Y));
	suite.add(testFn.testTimeZone(Y));
};