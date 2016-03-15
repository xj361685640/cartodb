var _ = require('underscore');
var cdb = require('cartodb-deep-insights.js');
var DefaultLayerView = require('./layer-view');
var BasemapLayerView = require('./basemap-layer-view');
var LayerAnalysisViewFactory = require('./layer-analysis-view-factory');

var DEFAULT_VIEW_TYPE = {
  createView: function (opts) {
    return new DefaultLayerView(opts);
  }
};

var LAYER_VIEW_TYPES = [
  {
    match: function (m) {
      return m.get('type') === 'Tiled' && m.get('order') === 0;
    },
    createView: function (opts) {
      return new BasemapLayerView(opts);
    }
  }
];

/**
 * View to render layer definitions list
 */
module.exports = cdb.core.View.extend({
  className: 'BlockList',

  tagName: 'ul',

  initialize: function (opts) {
    if (!opts.layerDefinitionsCollection) throw new Error('layerDefinitionsCollection is required');
    if (!opts.analysisDefinitionsCollection) throw new Error('analysisDefinitionsCollection is required');

    this._layerDefinitionsCollection = opts.layerDefinitionsCollection;
    this._analysisDefinitionsCollection = opts.analysisDefinitionsCollection;

    this.listenTo(this._layerDefinitionsCollection, 'add', this._addLayerView);
  },

  render: function () {
    this.clearSubViews();
    this._layerDefinitionsCollection.each(this._addLayerView, this);
    return this;
  },

  _addLayerView: function (m) {
    var item = _.find(LAYER_VIEW_TYPES, function (item) {
      return item.match(m);
    });

    item = item || DEFAULT_VIEW_TYPE;

    var view = item.createView({
      model: m,
      layerDefinitionsCollection: this._layerDefinitionsCollection,
      layerAnalysisViewFactory: new LayerAnalysisViewFactory(this._analysisDefinitionsCollection.analysisDefinitionNodesCollection, this._layerDefinitionsCollection)
    });

    this.addView(view);
    this.$el.append(view.render().el);
  }
/*

· LAYERS BEHAVIOUR:

- Move simple layers to another place.
- Move part of analysis to another place, create new layer.
- Don't let move basemap layer.
- Don't let move layers below basemap.
- Don't let move torque layers.
- Don't let move plain layers above torque layers.
- Analysis can't be moved.
- Move any layer (not basemap) to the end of the list, will delete the layer.
*/

/*
var cdb = require('cartodb-deep-insights.js');
var View = cdb.core.View;
var Model = cdb.core.Model;
var $ = require('jquery');
var _ = require('underscore');

require('jquery-ui');

var Group = require('./group');
var GroupView = require('./group-view');
var Groups = require('./groups');
var Item = require('./item');
var Items = require('./items');

module.exports = View.extend({

  initialize: function (opts) {
    _.bindAll(this, '_onItemDrop', '_onGroupDrop');

    this.groups = new Groups();
    window.app = this;

    this._generateGroup('A', 'ATM Machines', new Items([
      { title: 'Est. population' },
      { title: 'Trade Area' },
      { title: 'Buffer' },
      { title: 'city_buses', kind: 'table' }
    ]));

    this._generateGroup('B', 'Weird people', new Items([
      { title: 'Buffer' },
      { title: 'Trade Area' },
      { title: 'stadiums', kind: 'table' }
    ]));

    this.groups.on('add', this._addGroup, this);

    this.model = new Model();
    this.model.on('change:dragging_group', this._onDraggingGroupChange, this);
    this.model.on('change:dragging_item', this._onDraggingItemChange, this);
  },

  render: function () {
    this.$el.html(' '+
      '<div class="js-content"></div>'+
      '<div class="DropArea DropArea--drop js-dropArea"></div>'+
      '<div class="DropArea DropArea--remove js-removeArea">remove</div>'
    );
    this._renderGroups();
    this._setupInteractions();
    return this;
  },

  _onDraggingItemChange: function () {
    this.$el.toggleClass('is-draggingItem', this.model.get('dragging_item'));
  },

  _onDraggingGroupChange: function () {
    this.$el.toggleClass('is-draggingGroup', this.model.get('dragging_group'));
  },

  _generateGroup: function (letter, title, items) {
    var groupModel = new Group({
      letter: letter,
      title: title,
      items: items
    });
    this.groups.add(groupModel);
  },

  _renderGroups: function () {
    this.groups.each(this._addGroup, this);
  },

  _addGroup: function (groupModel) {
    var groupView = new GroupView({
      id: groupModel.cid,
      model: groupModel
    });

    groupView.bind('stop_dragging_item', function () {
      this.model.set({ dragging_item: false });
    }, this);

    groupView.bind('start_dragging_item', function (id) {
      this.model.set({ dragging_item: true, selected_group: id });
    }, this);

    this.$('.js-content').append(groupView.render().$el);
  },

  _setupInteractions: function () {
    var self = this;

    this.$('.js-dropArea').droppable({
      accept: '.Item',
      tolerance: 'pointer',
      out: function () {
        $('.js-dropArea').removeClass('is-selected');
      },
      over: function () {
        $('.js-dropArea').addClass('is-selected');
      },
      drop: self._onItemDrop
    });

    this.$('.js-removeArea').droppable({
      tolerance: 'pointer',
      accept: '.Group',
      out: function () {
        $('.js-removeArea').removeClass('is-selected');
      },
      over: function () {
        $('.js-removeArea').addClass('is-selected');
      },
      drop: self._onGroupDrop
    });
  },

  nextLetter: function (s) {
    return s.replace(/([a-zA-Z])[^a-zA-Z]*$/, function (a) {
      var c = a.charCodeAt(0);
      switch (c) {
        case 90: return 'A';
        case 122: return 'a';
        default: return String.fromCharCode(++c);
      }
    });
  },

  _onGroupDrop: function (e, ui) {
    this.model.set('dragging_group', false);

    $('.js-removeArea').removeClass('is-selected');
    var group = this.model.get('selected_group');
    var letter = group.get('letter');

    group.destroy();

    this.groups.each(function (g) {
      g.get('items').each(function (i) {
        if (i.get('letter').toLowerCase() === letter.toLowerCase()) {
          i.destroy();
        }
      });
    });
  },

  _onItemDrop: function (e, ui) {
    this.model.set('dragging_item', false);

    $('.js-dropArea').removeClass('is-selected');

    var $item = $(ui.draggable);
    var order = $item.index();
    var group = this.groups.get(this.model.get('selected_group'));
    var itemModel = group.get('items').at(order);

    var draggedItems = group.get('items').filter(function (c, i) {
      return i >= order;
    });

    var toDestroy = [];

    group.get('items').filter(function (c, i) {
      if (c && i >= order) {
        toDestroy.push(c);
      }
    });

    _.each(toDestroy, function (m) {
      m.destroy();
    });

    var letter = this.nextLetter(this.groups.last().get('letter'));
    var newItems = _.map(draggedItems, function (m) { return m.set('letter', letter); });
    var items = new Items(newItems);
    var title = itemModel.get('title');

    group.get('items').add(new Item({ title: title, letter: letter }));
    this._generateGroup(letter, title, items);
  }
  */

});
