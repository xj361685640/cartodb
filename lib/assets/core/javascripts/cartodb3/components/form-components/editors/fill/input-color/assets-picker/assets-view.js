var _ = require('underscore');
var CoreView = require('backbone/core-view');
var template = require('./assets-view.tpl');
var MakiIcons = require('../assets/maki-icons');
var PinIcons = require('../assets/pin-icons');
var SimpleIcons = require('../assets/simple-icons');
var checkAndBuildOpts = require('../../../../../../helpers/required-opts');
var AssetsCollection = require('../../../../../../data/assets-collection');
var AssetView = require('./assets-tab');
var UserAssetsView = require('./user-assets-tab');
var UploadAssetsView = require('./upload-assets-tab');

var createTextLabelsTabPane = require('../../../../../../components/tab-pane/create-text-labels-tab-pane');

var REQUIRED_OPTS = [
  'modalModel',
  'configModel',
  'userModel'
];

module.exports = CoreView.extend({
  className: 'Dialog-content Dialog-content--expanded',

  events: {
    'click .js-add': '_onSetImage',
    'click .js-upload': '_onClickUpload',
    'change .js-uploadInput': '_onFileSelected'
  },

  initialize: function (opts) {
    checkAndBuildOpts(opts, REQUIRED_OPTS, this);

    this.model.set({
      isProcessRunning: false,
      selected_image: this.model.get('image')
    });

    this._assetCollection = new AssetsCollection(
      null, {
        configModel: this._configModel,
        userModel: this._userModel
      }
    );

    this._initBinds();
  },

  render: function () {
    this.clearSubViews();

    this._createTabPane();

    if (this.model.get('image')) {
      this.$('.js-add').removeClass('is-disabled');
    }

    return this;
  },

  _createTabPane: function () {
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
        disclaimer: SimpleIcons.disclaimer, // TODO: will it be always the first screen?
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

    this._assetsTabPaneView.collection.bind('change:selected', this._onChangeSelectedTab, this);

    this.$el.append(this._assetsTabPaneView.render().$el);
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
      title: 'Pin icons',
      folderName: 'pin-maps'
    }).bind(this);
  },

  _createYourUploadsView: function () {
    return new UserAssetsView({
      model: this.model,
      userModel: this._userModel,
      configModel: this._configModel
    }).bind(this);
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
      title: 'Simple Icons',
      folderName: 'simpleicon'
    }).bind(this);
  },

  _createMakiIconsView: function () {
    return new AssetView({
      model: this.model,
      iconSet: MakiIcons,
      title: 'Maki icons',
      folderName: 'maki-icons',
      size: 18
    }).bind(this);
  },

  _initBinds: function () {
    this.model.on('change:selected_image', this._onChangeSelectedImage, this);
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

  _onClickUpload: function (e) {
    this.killEvent(e);
    this.$('.js-uploadInput').click();
  },

  _onFileSelected: function () {
    var files = this.$('#iconfile').prop('files');

    _.each(files, function (file) {
      this._assetCollection.create({
        kind: 'marker',
        type: 'file',
        filename: file
      }, {
        beforeSend: this._beforeIconUpload.bind(this),
        success: this._onIconUploaded.bind(this),
        error: this._onIconUploadError.bind(this),
        complete: this._onIconUploadComplete.bind(this)
      });
    }, this);
  },

  _beforeIconUpload: function () {
    this._numOfUploadingProcesses++;

    if (this._numOfUploadingProcesses > 0) {
      this.model.set('isProcessRunning', true);
    }
  },

  _onIconUploaded: function (iconModel) {
    this._resetFileSelection();
    this.render();
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

  _onIconUploadError: function (model, response) {
    var errorText = this._parseResponseText(response);
    this._resetFileSelection();
    console.log(errorText);
  },

  _onIconUploadComplete: function () {
    this._numOfUploadingProcesses--;
    if (this._numOfUploadingProcesses <= 0) {
      this.model.set('isProcessRunning', false);
    }
  },

  _resetFileSelection: function () {
    this.$('#iconfile').val('');
  },

  _onSetImage: function (e) {
    this.killEvent(e);
    var image = this.model.get('selected_image');
    var data = { image: image, kind: 'custom-marker' };
    this.model.set('image', data);
    this.trigger('change', data, this);
    this._modalModel.destroy(this.model);
  }
});
