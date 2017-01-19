var Backbone = require('backbone');
var _ = require('underscore');
var CoreView = require('backbone/core-view');
var template = require('./assets-view.tpl');
var ScrollView = require('../../../../../scroll/scroll-view');
var AssetsListView = require('./assets-list-view');
var MakiIcons = require('../assets/maki-icons');
var PinIcons = require('../assets/pin-icons');
var SimpleIcons = require('../assets/simple-icons');
var checkAndBuildOpts = require('../../../../../../helpers/required-opts');
var AssetsCollection = require('../../../../../../data/assets-collection');

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
    this._assetsListViews = [];

    this._maxIcons = 23;

    this.model = new Backbone.Model({
      isProcessRunning: false
    });

    this._assetCollection = new AssetsCollection(
      null, {
        configModel: this._configModel,
        userModel: this._userModel
      }
    );

    this._initBinds();
    this._fetchAllAssets();
  },

  render: function () {
    this.clearSubViews();
    this._renderAssets();

    if (this.model.get('image')) {
      this.$('.js-add').removeClass('is-disabled');
    }

    return this;
  },

  _initBinds: function () {
    this.model.on('change:image', this._onChangeModel, this);
  },

  _fetchAllAssets: function () {
    this._assetCollection.fetch({
      success: this._renderAllAssets.bind(this),
      error: this._onFetchAssetsError.bind(this)
    });
  },

  _renderAllAssets: function () {
    _.each(this._assetCollection.models, function (icon) {
      console.log(icon);
    }, this);
  },

  _onFetchAssetsError: function () {
    this._showErrorMessage(this._fetchErrorMessage);
  },

  _onChangeModel: function () {
    this.$('.js-add').removeClass('is-disabled');
  },

  _renderAssets: function () {
    this.$el.html(template());

    var view = new ScrollView({
      createContentView: function () {
        var view = new CoreView();

        this._assetsListViews.length = 0;

        var pinIcons = new AssetsListView({
          model: this.model,
          title: 'Pin icons',
          icons: PinIcons.icons,
          disclaimer: PinIcons.disclaimer,
          folder: 'pin-maps',
          size: ''
        });
        this._assetsListViews.push(pinIcons);

        view.$el.append(pinIcons.render().$el);

        var simpleIcons = new AssetsListView({
          model: this.model,
          title: 'Simple icons',
          icons: SimpleIcons.icons,
          disclaimer: SimpleIcons.disclaimer,
          folder: 'simpleicon',
          size: ''
        });
        this._assetsListViews.push(simpleIcons);

        view.$el.append(simpleIcons.render().$el);

        var makiIcons = new AssetsListView({
          model: this.model,
          title: 'Maki icons',
          icons: MakiIcons.icons,
          disclaimer: MakiIcons.disclaimer,
          folder: 'maki-icons',
          size: 18
        });
        this._assetsListViews.push(makiIcons);

        view.$el.append(makiIcons.render().$el);

        _.each(this._assetsListViews, function (view) {
          view.model.on('change:image', this._onImageSelected, this);
        }, this);

        return view;
      }.bind(this)
    });

    this.addView(view);
    this.$('.js-body').append(view.render().el);
  },

  _onClickUpload: function (e) {
    this.killEvent(e);
    this.$('.js-uploadInput').click();
  },

  _onFileSelected: function () {
    var files = this.$('#iconfile').prop('files');

    _.each(files, function (file) {
      console.log(file);

      this._assetCollection.create({
        kind: 'marker',
        type: 'file',
        value: file,
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
      this._runningMessage = 'Uploading icons...';
      this.model.set('isProcessRunning', true);
    }
  },

  _onIconUploaded: function (iconModel) {
    this._resetFileSelection();
    //this._addIconElement(iconModel);
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
    this.trigger('change', this.model.get('image'), this);
    this._modalModel.destroy(this.model);
  },

  _onImageSelected: function (image) {
    _.each(this._assetsListViews, function (view) {
      view.unselectItems(image);
    }, this);
  }
});
