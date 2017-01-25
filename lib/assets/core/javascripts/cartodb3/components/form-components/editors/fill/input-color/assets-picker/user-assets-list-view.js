var CoreView = require('backbone/core-view');
var AssetItemView = require('./asset-item-view');
var template = require('./assets-list-view.tpl');
var checkAndBuildOpts = require('../../../../../../helpers/required-opts');

var REQUIRED_OPTS = [
  'icons'
];

var ASSET_HEIGHT = 48;

module.exports = CoreView.extend({
  initialize: function (opts) {
    checkAndBuildOpts(opts, REQUIRED_OPTS, this);
  },

  render: function () {
    this.clearSubViews();
    this.$el.append(template({
      title: this.options.title
    }));

    this._renderItems();
    return this;
  },

  _renderItems: function () {
    this._icons.each(function (mdl) {
      var item = new AssetItemView({
        model: mdl,
        assetHeight: ASSET_HEIGHT
      });

      if (item.model.get('public_url') === this.model.get('image')) {
        item.model.set('state', 'selected');
      }

      item.bind('selected', this._selectItem, this);

      this.$('.js-items').append(item.render().el);
      this.addView(item);
    }, this);
  },

  _selectItem: function (m) {
    this.model.set('selected_image', m.get('public_url'));
    this.unselectItems(m);
  },

  unselectItems: function (m) {
    this._icons.each(function (mdl) {
      if (mdl !== m && mdl.get('state') === 'selected') {
        mdl.set('state', 'idle');
      }
    });
  }
});
