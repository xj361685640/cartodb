var CoreView = require('backbone/core-view');
var template = require('./user-assets-tab.tpl');
var checkAndBuildOpts = require('../../../../../../helpers/required-opts');
var StaticAssetItemView = require('./static-asset-item-view');
var ScrollView = require('../../../../../scroll/scroll-view');
var AssetsCollection = require('../../../../../../data/assets-collection');

var REQUIRED_OPTS = [
  'configModel',
  'userModel'
];

module.exports = CoreView.extend({
  events: {
    'change .js-uploadInput': '_onFileSelected'
  },

  initialize: function (opts) {
    checkAndBuildOpts(opts, REQUIRED_OPTS, this);

    this._assetCollection = new AssetsCollection(
      null, {
        configModel: this._configModel,
        userModel: this._userModel
      }
    );

    this._fetchAllAssets();
  },

  render: function () {
    this.clearSubViews();

    this.$el.html(template());

    return this;
  },

  _fetchAllAssets: function () {
    this._assetCollection.fetch({
      success: this._renderAllAssets.bind(this),
      error: this._onFetchAssetsError.bind(this)
    });
  },

  _renderAllAssets: function () {
    this._assetCollection.each(function (mdl) {
      var item = new StaticAssetItemView({
        model: mdl
      });

      this.$('.js-items').append(item.render().el);
      this.addView(item);
    }, this);
  },

  _onFetchAssetsError: function () {
    console.log('Error');
    // this._showErrorMessage(this._fetchErrorMessage);
  }
});
