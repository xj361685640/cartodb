var template = require('./tab-pane-file.tpl');
var ImageLoaderView = require('../img-loader-view');

/**
 *  File component
 */

module.exports = ImageLoaderView.extend({
  tagName: 'i',

  className: 'CDB-IconFont',

  initialize: function (options) {
    if (!this.model) throw new Error('A model should be provided');

    this.model.bind('change:label', this.render, this);
    this.model.bind('change:color', this._updateColor, this);

    ImageLoaderView.prototype.initialize.call(this, {
      imageClass: 'Tab-paneLabelImage'
    });
  },

  render: function () {
    this.clearSubViews();

    var label = this.model.get('label');

    this.$el.html(template({
      type: this._getType(),
      label: label.image, // TODO: change to `url` instead of image,
      kind: label.kind,
      selectedChild: this.model.get('selectedChild') || ''
    }));

    if (this._getType() === 'file') {
      this._loadImage(this._getImage(), this.model.get('color'));
    }

    return this;
  },

  _updateColor: function () {
    this._updateImageColor(this.model.get('color'));
  },

  _getType: function () {
    var label = this.model.get('label');
    return label && label.image && label.image.match(/^http/) ? 'file' : 'text'; // TODO: change to `url` instead of image
  },

  _getImage: function () {
    return this.model.get('label');
  }
});
