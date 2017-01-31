var _ = require('underscore');
var Backbone = require('backbone');
var CoreView = require('backbone/core-view');
var MakiIcons = require('../assets/maki-icons');
var PinIcons = require('../assets/pin-icons');
var SimpleIcons = require('../assets/simple-icons');
var checkAndBuildOpts = require('../../../../../../helpers/required-opts');
var AssetsCollection = require('../../../../../../data/assets-collection');
var AssetView = require('./assets-tab');
var UserAssetsView = require('./user-assets-tab');
var UploadAssetsView = require('./upload-assets-tab');
var createTextLabelsTabPane = require('../../../../../../components/tab-pane/create-text-labels-tab-pane');

var loadingView = require('../../../../../loading/render-loading');
var ErrorView = require('../../../../../error/error-view');
var errorTemplate = require('./upload-assets-error.tpl');

var template = require('./assets-view.tpl');

var REQUIRED_OPTS = [
  'modalModel',
  'configModel',
  'userModel'
];

module.exports = CoreView.extend({
  className: 'Dialog-content Dialog-content--expanded',

  events: {
    'click .js-add': '_onSetImage',
    'click .js-upload': '_initUpload',
    'change .js-fileInput': '_onFileSelected',
    'click .js-back': '_onClickBack'
  },

  initialize: function (opts) {
    checkAndBuildOpts(opts, REQUIRED_OPTS, this);

    this._numOfUploadingProcesses = 0;

    this.model.set({
      isProcessRunning: false,
      selected_image: this.model.get('image')
    });

    this._stateModel = new Backbone.Model({
      status: 'show'
    });

    this.add_related_model(this._stateModel);

    this._assetCollection = new AssetsCollection(
      null, {
        configModel: this._configModel,
        userModel: this._userModel
      }
    );

    this._initTabPane();
    this._initBinds();
  },

  render: function () {
    this.clearSubViews();

    this.$el.append(this._assetsTabPaneView.render().$el);

    if (this._isLoading()) {
      this._renderLoading();
    } else if (this._hasError()) {
      this._renderError();
    }

    if (this.model.get('image')) {
      this.$('.js-add').removeClass('is-disabled');
    }

    return this;
  },

  _onClickBack: function (e) {
    this.killEvent(e);
    this._stateModel.set('status', '');
  },

  _upload: function (data) {
    this._assetCollection.create(data, {
      beforeSend: this._beforeAssetUpload.bind(this),
      success: this._onAssetUploaded.bind(this),
      error: this._onAssetUploadError.bind(this),
      complete: this._onAssetUploadComplete.bind(this)
    });
  },

  _renderError: function () {
    this.$('.js-content').html(
      new ErrorView({
        title: this._stateModel.get('error_message'),
        template: errorTemplate
      }).render().$el
    );
  },

  _renderLoading: function () {
    this.$('.js-content').html(
      loadingView({
        title: _t('components.modals.dataset-metadata.loading')
      })
    );
  },

  _isLoading: function () {
    return this._stateModel.get('status') === 'loading';
  },

  _hasError: function () {
    return this._stateModel.get('status') === 'error';
  },

  _initTabPane: function () {
    var self = this;

    var tabPaneTabs = [{
      name: 'maki-icons',
      label: _t('components.modals.add-asset.maki-icons'),
      createContentView: self._createMakiIconsView.bind(self)
    }, {
      name: 'simple-icons',
      label: _t('components.modals.add-asset.simple-icons'),
      createContentView: self._createSimpleIconsView.bind(self)
    }, {
      name: 'pin-icons',
      label: _t('components.modals.add-asset.pin-icons'),
      createContentView: self._createPinIconsView.bind(self)
    }, {
      name: 'your-uploads',
      label: _t('components.modals.add-asset.your-uploads'),
      createContentView: self._createYourUploadsView.bind(self)
    }, {
      name: 'upload-file',
      label: _t('components.modals.add-asset.upload-file'),
      createContentView: self._createUploadFileView.bind(self)
    }];

    var tabPaneOptions = {
      tabPaneOptions: {
        template: template,
        disclaimer: MakiIcons.disclaimer, // TODO: will it be always the first screen?
        tabPaneItemOptions: {
          tagName: 'li',
          className: 'CDB-NavSubmenu-item'
        }
      },
      tabPaneItemLabelOptions: {
        tagName: 'button',
        className: 'CDB-NavSubmenu-link u-upperCase Publish-modalLink'
      }
    };

    this._assetsTabPaneView = createTextLabelsTabPane(tabPaneTabs, tabPaneOptions);
    this.addView(this._assetsTabPaneView);
  },

  _onChangeSelectedTab: function () {
    switch (this._assetsTabPaneView.getSelectedTabPaneName()) {
      case 'simple-icons':
        this.$('.js-disclaimer').html(SimpleIcons.disclaimer);
        break;
      case 'maki-icons':
        this.$('.js-disclaimer').html(MakiIcons.disclaimer);
        break;
      case 'pin-icons':
        this.$('.js-disclaimer').html(PinIcons.disclaimer);
        break;
      default:
        this.$('.js-disclaimer').html('');
        break;
    }
  },

  _createPinIconsView: function () {
    return new AssetView({
      model: this.model,
      iconSet: PinIcons,
      title: _t('components.modals.add-asset.pin-icons'),
      folderName: 'pin-maps',
      kind: 'marker'
    }).bind(this);
  },

  _createYourUploadsView: function () {
    var view = new UserAssetsView({
      model: this.model,
      title: _t('components.modals.add-asset.your-uploads'),
      userModel: this._userModel,
      configModel: this._configModel
    }).bind(this);

    this._userAssetsView = view;

    view.bind('init-upload', this._initUpload, this);
    view.bind('set-button-state', function (state) {
      this.$('.js-add')[state ? 'removeClass' : 'addClass']('is-disabled');
    }, this);

    return this._userAssetsView;
  },

  _createUploadFileView: function () {
    var view = new UploadAssetsView({
      model: this.model,
      userModel: this._userModel,
      configModel: this._configModel
    }).bind(this);

    view.bind('upload-complete', this._onUploadComplete, this);
    return view;
  },

  _createSimpleIconsView: function () {
    return new AssetView({
      model: this.model,
      iconSet: SimpleIcons,
      title: _t('components.modals.add-asset.simple-icons'),
      folderName: 'simpleicon',
      kind: 'marker'
    }).bind(this);
  },

  _createMakiIconsView: function () {
    return new AssetView({
      model: this.model,
      iconSet: MakiIcons,
      title: _t('components.modals.add-asset.maki-icons'),
      folderName: 'maki-icons',
      size: 18,
      kind: 'marker'
    }).bind(this);
  },

  _initBinds: function () {
    this.model.on('change:selected_image', this._onChangeSelectedImage, this);
    this._stateModel.on('change:status', this.render, this);
    this._assetsTabPaneView.collection.bind('change:selected', this._onChangeSelectedTab, this);
  },

  _onFetchAssetsError: function () {
    this._showErrorMessage(this._fetchErrorMessage);
  },

  _onUploadComplete: function () {
    this._assetsTabPaneView.setSelectedTabPaneByName('your-uploads');
  },

  _onChangeSelectedImage: function () {
    this.$('.js-add').toggleClass('is-disabled', !this.model.get('selected_image'));
  },

  _initUpload: function (e) {
    this.killEvent(e);
    this.$('.js-fileInput').click();
  },

  _onFileSelected: function () {
    var files = this.$('.js-fileInput').prop('files');

    _.each(files, function (file) {
      this._upload({
        kind: 'marker',
        type: 'file',
        filename: file
      });
    }, this);
  },

  _beforeAssetUpload: function () {
    this._numOfUploadingProcesses++;

    if (this._numOfUploadingProcesses > 0) {
      this._stateModel.set('status', 'loading');
    }
  },

  _onAssetUploaded: function (iconModel) {
    this._resetFileSelection();
  },

  _parseResponseText: function (response) {
    if (response && response.responseText) {
      try {
        var text = JSON.parse(response.responseText);
        if (text && text.errors && typeof text.errors === 'string') {
          return text.errors;
        }
      } catch (exc) {
        // Swallow
      }
    }
    return '';
  },

  _onAssetUploadError: function (model, response) {
    this._resetFileSelection();

    this._stateModel.set({
      error_message: this._parseResponseText(response),
      status: 'error'
    });
  },

  _onAssetUploadComplete: function () {
    this._numOfUploadingProcesses--;

    if (this._numOfUploadingProcesses < 1 && !this._hasError()) {
      this._onUploadComplete();
      this._stateModel.set('status', '');
    }
  },

  _resetFileSelection: function () {
    this.$('.js-fileInput').val('');
  },

  _onSetImage: function (e) {
    this.killEvent(e);

    this.model.set({
      image: this.model.get('selected_image'),
      kind: this.model.get('selected_kind')
    });

    this.trigger('change', {
      url: this.model.get('selected_image'),
      kind: this.model.get('selected_kind')
    }, this);

    this._modalModel.destroy(this.model);
  }
});
