var _ = require('underscore');
var Backbone = require('backbone');
var CoreView = require('backbone/core-view');
var checkAndBuildOpts = require('../../../../../../helpers/required-opts');
var AssetsCollection = require('../../../../../../data/assets-collection');
var loadingView = require('../../../../../loading/render-loading');
var ErrorView = require('../../../../../error/error-view');
var errorTemplate = require('./upload-assets-error.tpl');
var template = require('./upload-assets-tab.tpl');

var REQUIRED_OPTS = [
  'configModel',
  'userModel'
];

module.exports = CoreView.extend({
  className: 'Form',

  events: {
    'change .js-fileInput': '_onFileSelected',
    'click .js-submit': '_onClickSubmit',
    'click .js-back': '_onClickBack'
  },

  initialize: function (opts) {
    checkAndBuildOpts(opts, REQUIRED_OPTS, this);

    this._numOfUploadingProcesses = 0;

    this._stateModel = new Backbone.Model({
      status: 'show'
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

    if (this._isLoading()) {
      this._renderLoading();
    } else if (this._hasError()) {
      this._renderError();
    } else {
      this.$el.html(template());
    }

    return this;
  },

  _renderError: function () {
    this.$el.html(
      new ErrorView({
        title: this._stateModel.get('error_message'),
        template: errorTemplate
      }).render().$el
    );
  },

  _renderLoading: function () {
    this.$el.html(
      loadingView({
        title: _t('components.modals.dataset-metadata.loading')
      })
    );
  },

  _initBinds: function () {
    this._stateModel.on('change:status', this.render, this);
    this.add_related_model(this._stateModel);
  },

  _isLoading: function () {
    return this._stateModel.get('status') === 'loading';
  },

  _hasError: function () {
    return this._stateModel.get('status') === 'error';
  },

  _upload: function (data) {
    this._assetCollection.create(data, {
      beforeSend: this._beforeAssetUpload.bind(this),
      success: this._onAssetUploaded.bind(this),
      error: this._onAssetUploadError.bind(this),
      complete: this._onAssetUploadComplete.bind(this)
    });
  },

  _onClickBack: function (e) {
    this.killEvent(e);
    this._stateModel.set('status', '');
  },

  _onClickSubmit: function (e) {
    this.killEvent(e);

    var url = this.$('.js-url').val();

    this._upload({
      kind: 'user-asset',
      type: 'url',
      url: url,
      file: url,
      filename: url
    });
  },

  _onFileSelected: function () {
    var files = this.$('.js-fileInput').prop('files');

    _.each(files, function (file) {
      this._upload({
        kind: 'user-asset',
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
        } else if (text && text.error) {
          return text.error[0];
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
      this.trigger('upload-complete');
      this._stateModel.set('status', '');
    }
  },

  _resetFileSelection: function () {
    this.$('.js-fileInput').val('');
  }
});
