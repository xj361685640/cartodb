var CoreView = require('backbone/core-view');
var checkAndBuildOpts = require('../../../../../../helpers/required-opts');
var ScrollView = require('../../../../../scroll/scroll-view');
var AssetsCollection = require('../../../../../../data/assets-collection');
var AssetsListView = require('./user-assets-list-view');

var REQUIRED_OPTS = [
  'configModel',
  'userModel'
];

module.exports = CoreView.extend({
  className: 'Modal-inner Modal-inner--with-navigation',

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
    return this;
  },

  _fetchAllAssets: function () {
    this._assetCollection.fetch({
      success: this._renderAllAssets.bind(this),
      error: this._onFetchAssetsError.bind(this)
    });
  },

  _renderAllAssets: function (assets, data) {
    var view = new ScrollView({
      createContentView: function () {
        var iconsView = new AssetsListView({
          model: this.model,
          icons: assets
        });

        iconsView.model.on('change:image', this._onImageSelected, this);
        return iconsView;
      }.bind(this)
    });

    this.addView(view);
    this.$el.append(view.render().el);
  },

  _onFetchAssetsError: function () {
    console.log('Error');
  }
});
