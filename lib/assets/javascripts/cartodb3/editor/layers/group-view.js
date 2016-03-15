var Backbone = require('backbone');
var _ = require('underscore');
var Item = require('./item');
var ItemView = require('./item-view');
var $ = require('jquery');

var groupTemplate = '' +
'<div class="Group-header has-color-<%- letter %>">' +
'  <div class="Group-headerTitle">' +
'    <div class="Group-icon"><%- letter %></div>' +
'    <div class="Group-title js-title"><%- title %></div>' +
'  </div>' +
'  <div class="Group-actions">' +
'    <!--button class="Button js-collapse">⌃</button>' +
'    <button class="Button js-add">+</button-->' +
'  </div>' +
'</div>' +
'<div class="Group-items js-items"></div>' +
'<div class="Group-footer"><%- footer %></div>';

module.exports = Backbone.View.extend({
  className: 'Group',

  events: {
    'dblclick .js-title': '_prompt',
    'click .js-collapse': '_onCollapseClick',
    'click .js-add': '_onAddClick'
  },

  template: groupTemplate,

  initialize: function (opts) {
    _.bindAll(this, '_createHelper', '_onGroupDrop');

    this.collection = this.model.get('items');
    this.model.bind('remove', this._onRemove, this);
    this.model.bind('change:collapsed', this._onCollapseChange, this);
    this.model.on('change:title', this.render, this);
    this.collection.on('add', this._addItem, this);
    this.collection.on('add', this.render, this);
  },

  _prompt: function () {
    var title = prompt(this.model.get('title'));
    if (title) {
      this.model.set('title', title);
    }
  },

  _addItem: function (itemModel) {
    var item = new ItemView({
      id: itemModel.cid,
      model: itemModel
    });

    item.bind('item_on_group', this._onItemGroupDrop, this);

    this.$('.js-items').append(item.render().$el);
  },

  _onRemove: function () {
    this.$el.remove();
  },

  _onCollapseChange: function () {
    this.$el.toggleClass('is-collapsed', this.model.get('collapsed'));
  },

  _onAddClick: function () {
    var itemModel = new Item({
      order: this.collection.length,
      letter: this.model.get('letter'),
      title: 'Title'
    });
    this.collection.add(itemModel);
  },

  _onCollapseClick: function (e) {
    this.model.set('collapsed', !this.model.get('collapsed'));
  },

  _renderItems: function () {
    var i = this.collection.length - 1;
    this.collection.each(function (itemModel) {
      if (!itemModel.get('letter')) {
        itemModel.set({
          letter: this.model.get('letter'),
          order: i--
        });
      }
    }, this);

    this.collection.each(function (m) {
      this._addItem(m);
    }, this);
  },

  _createHelper: function (e, ui) {
    var $item = $(ui);
    var order = $item.index();

    var models = this.collection.models;
    var itemModel = models[order];

    var letter = app.nextLetter(app.groups.last().get('letter'));

    var html = _.template(groupTemplate)({
      letter: letter,
      title: itemModel.get('title'),
      footer: 'Create new layer based on ' + this.model.get('letter')
    });

    var items = this.collection.filter(function (c, i) {
      return i >= order;
    });

    var itemsHtml = '';

    _.each(items, function (m) {
      m = new Item(_.extend(m.toJSON(), { letter: letter }));
      itemsHtml += new ItemView({ model: m }).render().$el.html();
    });

    var $el = $('<div><div class="Group is-dragging has-footer">' + html + '</div></div>');
    $el.find('.js-items').append(itemsHtml);

    return $el;
  },

  _onGroupDrop: function (e, ui) {
    var $group = $(ui.draggable);
    var id = $group.attr('id');
    var group = app.groups.get(id);
    var item = new ItemView({
      model: new Item({
        letter: group.get('letter'),
        title: group.get('title')
      })
    });

    var model = new Item({
      title: 'Intersection',
      letter: this.model.get('letter'),
      intersects: item.render().$el.html(),
      intersectsLetter: item.model.get('letter'),
      order: this.collection.length
    });

    this.collection.add(model);
    this.render();
  },

  render: function () {
    var self = this;
    this.$el.empty();
    this.$el.append(_.template(this.template)(this.model.attributes));

    this.$el.droppable({
      accept: '.Group',
      tolerance: 'pointer',
      hoverClass: 'ui-state-default',
      drop: this._onGroupDrop
    });

    this.$('.js-items').sortable({
      helper: self._createHelper,
      start: function (e, ui) {
        self.trigger('start_dragging_item', self.model.cid);
      },
      stop: function (e, ui) {
        self.trigger('stop_dragging_item');
        self.render();
      }
    });

    this.$el.draggable({
      tolerance: 'intersect',
      revert: true,
      revertDuration: 100,
      stop: function (e, ui) {
        $('.js-removeArea').removeClass('is-selected');
        app.model.set('dragging_group', false);
      },
      start: function (e, ui) {
        var $item = $(ui.helper);
        var order = $item.index();
        var group = app.groups.at(order);
        app.model.set({
          selected_group: group,
          dragging_group: true
        });
      }
    });

    this._renderItems();

    this.$el.attr('data-group', this.model.get('letter'));

    return this;
  }
});
