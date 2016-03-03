var Group = require('./group');
var cdb = require('cartodb-deep-insights.js');
var Model = cdb.core.Model;

module.exports = Model.extend({
  model: Group,

  defaults: {
    collapsed: false,
    footer: false
  },

  initialize: function () {
    this.on('reset change add', function () {
      this.get('items').sort();
    }, this);
  }
});
