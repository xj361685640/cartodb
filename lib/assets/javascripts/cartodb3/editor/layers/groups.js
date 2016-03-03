var Backbone = require('backbone');
var Group = require('./group');

module.exports = Backbone.Collection.extend({
  model: Group
});
