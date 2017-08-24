require('./SpecHelper');
require('../../../javascripts/cartodb3/components/form-components/index.js');

var testsContext = require.context('./', true, /\.js$/);

// IDEA: get the affected_specs here and filter testContext
var runnable = testsContext.keys();

runnable.forEach(testsContext);
