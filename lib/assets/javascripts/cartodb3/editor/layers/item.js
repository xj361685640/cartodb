var cdb = require('cartodb-deep-insights.js');
var Model = cdb.core.Model;

module.exports = Model.extend({
  defaults: {
    kind: 'analysis',
    intersects: '',
    order: 0
  }
});
