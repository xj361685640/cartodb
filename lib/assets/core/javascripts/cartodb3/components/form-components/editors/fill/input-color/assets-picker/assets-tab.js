var CoreView = require('backbone/core-view');
var template = require('./assets-tab.tpl');
var checkAndBuildOpts = require('../../../../../../helpers/required-opts');
var ScrollView = require('../../../../../scroll/scroll-view');
var AssetsListView = require('./assets-list-view');

var REQUIRED_OPTS = [
  'title',
  'folderName',
  'iconSet'
];

module.exports = CoreView.extend({
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

    this.$el.html(template());

    var view = new ScrollView({
      createContentView: function () {
        var iconsView = new AssetsListView({
          model: this.model,
          title: this._title,
          icons: this._iconSet.icons,
          disclaimer: this._iconSet.disclaimer,
          folder: this._folderName,
          size: this._size || ''
        });

        iconsView.model.on('change:image', this._onImageSelected, this);
        return iconsView;
      }.bind(this)
    });

    this.addView(view);
    this.$('.js-body').append(view.render().el);

    return this;
  }
});
