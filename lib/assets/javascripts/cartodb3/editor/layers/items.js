var Item = require('./item');
var Backbone = require('backbone');

module.exports = Backbone.Collection.extend({
  model: Item,

  comparator: function (item) {
    return -item.get('order');
  },

  initialize: function () {
    this.on('reset change remove add', this.sort, this);
  }
});
