var Backbone = require('backbone');
var _ = require('underscore');
var $ = require('jquery');

var itemTemplate = '' +
'<div class="Item-container js-itemContent">' +
'  <div class="Item-header has-color-<%- letter %>">' +
'    <div class="Item-icon"><span class="js-letter"><%- letter %></span> <span class="Icon-order"><%- order %></span></div>' +
'    <div class="Item-title js-title"><%- title %></div>' +
'  </div>' +
'</div>' +
'<%= intersects %>';

module.exports = Backbone.View.extend({
  className: 'Item',

  events: {
    'dblclick .js-title': '_prompt',
    'mouseenter': '_onMouseEnter',
    'mouseleave': '_onMouseLeave'
  },

  template: itemTemplate,

  initialize: function (opts) {
    this.model.on('change:title', this.render, this);
    this.model.on('change:letter', this._onChangeLetter, this);
    this.model.on('change:order', this._onChangeOrder, this);
    this.model.on('remove', this._onRemove, this);
  },

  render: function () {
    this.$el.empty();
    this.$el.append(_.template(this.template)(
      this.model.attributes
    ));

    if (this.model.get('intersects')) {
      this.$el.addClass('has-items');
    }

    this.$el.attr('data-letter', this.model.get('letter'));
    this.$el.addClass('is-' + this.model.get('kind'));

    return this;
  },

  _prompt: function () {
    var title = prompt(this.model.get('title'));
    if (title) {
      this.model.set('title', title);
    }
  },

  _onMouseEnter: function () {
    if (this.model.get('intersectsLetter')) {
      $('[data-group="' + this.model.get('intersectsLetter') + '"]').addClass('is-selected');
    } else {
      $('[data-group="' + this.model.get('letter') + '"]').addClass('is-selected');
    }
  },

  _onMouseLeave: function () {
    $('[data-group]').removeClass('is-selected');
  },

  _onRemove: function () {
    var id = this.$el.attr('id');
    this.$el.remove();
    $('#' + id).remove();
  },

  _onChangeOrder: function () {
    this.$('.js-order').text(this.model.get('order'));
  },

  _onChangeLetter: function () {
    this.$('.js-letter').text(this.model.get('letter'));
  }
});
