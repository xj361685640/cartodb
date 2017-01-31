var CoreView = require('backbone/core-view');
var checkAndBuildOpts = require('../../../../../../helpers/required-opts');
var ScrollView = require('../../../../../scroll/scroll-view');
var AssetsListView = require('./assets-list-view');

var REQUIRED_OPTS = [
  'title',
  'folderName',
  'iconSet',
  'kind'
];

module.exports = CoreView.extend({
  className: 'Modal-inner Modal-inner--with-navigation',

  events: {
    'click .js-add': '_onSetImage',
    'click .js-upload': '_onClickUpload',
    'change .js-uploadInput': '_onFileSelected'
  },

  initialize: function (opts) {
    checkAndBuildOpts(opts, REQUIRED_OPTS, this);
  },

  render: function () {
    this.clearSubViews();
    this._createScrollView();
    return this;
  },

  _createScrollView: function () {
    var view = new ScrollView({
      createContentView: function () {
        var iconsView = new AssetsListView({
          model: this.model,
          title: this._title,
          icons: this._iconSet.icons,
          disclaimer: this._iconSet.disclaimer,
          folder: this._folderName,
          size: this.options.size || '',
          kind: this._kind
        });

        iconsView.model.on('change:image', this._onImageSelected, this);
        return iconsView;
      }.bind(this)
    });

    this.addView(view);
    this.$el.append(view.render().el);
  }
});
