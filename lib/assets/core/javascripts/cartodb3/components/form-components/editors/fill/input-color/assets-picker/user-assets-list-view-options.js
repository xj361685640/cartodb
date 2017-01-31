var CoreView = require('backbone/core-view');
var checkAndBuildOpts = require('../../../../../../helpers/required-opts');
var template = require('./user-assets-list-view-options.tpl');

var REQUIRED_OPTS = [
  'title',
  'editable',
  'assets'
];

module.exports = CoreView.extend({
  tagName: 'nav',

  className: 'CDB-NavMenu u-bSpace--m u-inner',

  events: {
    'click .js-remove': '_onClickRemove',
    'click .js-select-all': '_onClickSelectAll',
    'click .js-deselect-all': '_onClickDeselectAll'
  },

  initialize: function (opts) {
    checkAndBuildOpts(opts, REQUIRED_OPTS, this);

    this._initBinds();
  },

  render: function () {
    this.clearSubViews();

    var selectedCount = this._getSelectedAssetsCount();

    this.$el.html(template({
      title: this._title,
      editable: this._editable,
      assetsCount: this._assets.length,
      selectedCount: selectedCount,
      allSelected: selectedCount === this._assets.length
    }));

    return this;
  },

  _initBinds: function () {
    this._assets.bind('add change remove', this.render, this);
  },

  _onClickRemove: function () {
    this.trigger('remove');
  },

  _onClickSelectAll: function () {
    this.trigger('select-all');
  },

  _onClickDeselectAll: function () {
    this.trigger('deselect-all');
  },

  _getSelectedAssetsCount: function () {
    var selectedAssets = this._assets.where({ state: 'selected' });
    return selectedAssets ? selectedAssets.length : 0;
  }
});
