testFn.testCore = function(Y) {
	var suite = new Y.Test.Suite("Core Tests");
	suite.add(testCalendar(Y));
	suite.add(testCurrency(Y));
	suite.add(testResourceBundle(Y));
	suite.add(testTimeZone(Y));
};