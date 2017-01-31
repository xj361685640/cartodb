var cdb = require('cartodb.js');
var $ = require('jquery');
var _ = require('underscore');
var CoreView = require('backbone/core-view');
var AssetItemView = require('./asset-item-view');
var checkAndBuildOpts = require('../../../../../../helpers/required-opts');
var Backbone = require('backbone');
var loadingView = require('../../../../../loading/render-loading');
var UserAssetsListViewOptions = require('./user-assets-list-view-options');

var ErrorView = require('../../../../../error/error-view');
var errorTemplate = require('./upload-assets-error.tpl');
var template = require('./assets-list-view.tpl');

var REQUIRED_OPTS = [
  'assets'
];

var ASSET_HEIGHT = 48;

module.exports = CoreView.extend({
  initialize: function (opts) {
    checkAndBuildOpts(opts, REQUIRED_OPTS, this);

    this._stateModel = new Backbone.Model();
    this.add_related_model(this._stateModel);

    this._userAssetsListViewOptions = new UserAssetsListViewOptions({
      editable: true,
      title: this.options.title,
      assets: this._assets
    });

    this._initBinds();
  },

  render: function () {
    this.clearSubViews();

    if (this._isLoading()) {
      this._renderLoading();
    } else if (this._hasError()) {
      this._renderError();
    } else {
      this.$el.html(template);
      this.$el.prepend(this._userAssetsListViewOptions.render().$el);
      this.addView(this._userAssetsListViewOptions);
      this._renderAssets();
    }

    return this;
  },

  _renderAssets: function () {
    var addAssetButton = new AssetItemView({
      model: new cdb.core.Model({
        type: 'text',
        name: '+'
      }),
      assetHeight: ASSET_HEIGHT
    });

    addAssetButton.bind('selected', function () {
      this.trigger('init-upload');
    }, this);

    this.$('.js-items').append(addAssetButton.render().$el);

    this._assets.each(this._renderAsset, this);
  },

  _initBinds: function () {
    this._keyDown = this._onKeyDown.bind(this);
    $(document).on('keydown', this._keyDown);

    this._keyUp = this._onKeyUp.bind(this);
    $(document).on('keyup', this._keyUp);

    this._stateModel.on('change:status', this.render, this);
    this._assets.on('change:state', this._onChangeAssetsState, this);

    this._userAssetsListViewOptions.bind('select-all', this._selectAllAssets, this);
    this._userAssetsListViewOptions.bind('deselect-all', this._deselectAllAssets, this);
    this._userAssetsListViewOptions.bind('remove', this._removeSelectedAssets, this);
  },

  _getSelectedAssetsCount: function () {
    var selectedAssets = this._assets.where({ state: 'selected' });
    return selectedAssets ? selectedAssets.length : 0;
  },

  _disableBinds: function () {
    $(document).off('keydown', this._keyDown);
    $(document).off('keyup', this._keyUp);
  },

  _onKeyDown: function (ev) {
    this._shiftKeyPressed = ev.shiftKey;
  },

  _onKeyUp: function (ev) {
    this._shiftKeyPressed = ev.shiftKey;
  },

  _onClickBack: function (e) {
    this.killEvent(e);
    this._stateModel.set('status', '');
  },

  _onChangeAssetsState: function () {
    this.trigger('set-button-state', this._getSelectedAssetsCount() === 1);
  },

  _renderAsset: function (assetModel) {
    var assetItemView = new AssetItemView({
      model: assetModel,
      assetHeight: ASSET_HEIGHT
    });

    if (assetItemView.model.get('public_url') === this.model.get('image')) {
      assetItemView.model.set('state', 'selected');
    }

    assetItemView.bind('selected', this._selectAsset, this);

    this.$('.js-items').append(assetItemView.render().el);
    this.addView(assetItemView);
  },

  _selectAllAssets: function () {
    this._assets.each(function (assetModel) {
      assetModel.set('state', 'selected');
    });
  },

  _selectAsset: function (m) {
    this.model.set({
      selected_image: m.get('public_url'),
      selected_kind: 'custom-marker'
    });

    if (this._shiftKeyPressed) {
      m.set('state', m.get('state') === 'selected' ? '' : 'selected');
    } else {
      m.set('state', 'selected');
    }

    if (!this._shiftKeyPressed) {
      this._deselectAllAssets2(m);
    }
  },

  _deselectAllAssets2: function (m) {
    this._assets.each(function (assetModel) {
      if (assetModel !== m && assetModel.get('state') === 'selected') {
        assetModel.set('state', '');
      }
    });
  },

  _deselectAllAssets: function () {
    this._assets.each(function (assetModel) {
      assetModel.set('state', '');
    });
  },

  _removeSelectedAssets: function () {
    this._stateModel.set('status', 'loading');

    var selectedAssets = this._assets.select(function (asset) {
      return asset.get('state') === 'selected';
    }, this);

    _.each(selectedAssets, function (asset) {
      asset.destroy({
        complete: this._onDestroyFinished.bind(this)
      });

      this.$('#' + asset.get('id')).remove();
    }, this);
  },

  _onDestroyFinished: function (response) {
    if (response.status === 200) {
      this._stateModel.set('status', '');
    } else {
      this._stateModel.set({
        error_message: response.statusText,
        status: 'error'
      });
    }
  },

  _isLoading: function () {
    return this._stateModel.get('status') === 'loading';
  },

  _hasError: function () {
    return this._stateModel.get('status') === 'error';
  },

  _renderLoading: function () {
    this.$el.html(
      loadingView({
        title: _t('components.modals.dataset-metadata.loading') // TODO: replace with right string
      })
    );
  },

  _renderError: function () {
    this.$el.html(
      new ErrorView({
        title: this._stateModel.get('error_message'),
        template: errorTemplate
      }).render().$el
    );
  },

  clean: function () {
    this._disableBinds();
    CoreView.prototype.clean.apply(this);
  }
});
