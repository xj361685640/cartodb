var CoreView = require('backbone/core-view');
var _ = require('underscore');
var ContextMenuView = require('../components/context-menu/context-menu-view');
var CustomListCollection = require('../components/custom-list/custom-list-collection');
var template = require('./editor-header.tpl');
var moment = require('moment');

module.exports = CoreView.extend({
  events: {
    'click .js-privacy': '_onClickPrivacy',
    'click .js-options': '_showContextMenu'
  },

  initialize: function (opts) {
    if (!opts.editorModel) throw new Error('editorModel is required');
    if (!opts.visDefinitionModel) throw new Error('visDefinitionModel is required');
    if (!opts.privacyCollection) throw new Error('privacyCollection is required');
    if (!opts.onClickPrivacy) throw new Error('onClickPrivacy is required');

    this._editorModel = opts.editorModel;
    this._visDefinitionModel = opts.visDefinitionModel;
    this._title = this._visDefinitionModel.get('name');
    this._privacyCollection = opts.privacyCollection;

    this._published = _t('editor.published', {
      when: moment(this._visDefinitionModel.get('created_at')).fromNow()
    });

    _.bind(this._changeStyle, this);
    this._bindEvents();
  },

  render: function () {
    var model = this._privacyCollection.searchByPrivacy(this._visDefinitionModel.get('privacy'));

    this.$el.html(
      template({
        title: this._title,
        privacy: model.get('privacy'),
        cssClass: model.get('cssClass'),
        published: this._published
      })
    );
    return this;
  },

  _bindEvents: function () {
    this.listenTo(this._visDefinitionModel, 'change:privacy', this.render);
    this.add_related_model(this._visDefinitionModel);

    this.listenTo(this._editorModel, 'change:edition', this._changeStyle);
    this.add_related_model(this._editorModel);
  },

  _changeStyle: function (m) {
    this._getTitle().toggleClass('is-dark', m.isEditing());
  },

  _getTitle: function () {
    return this.$('.Editor-HeaderInfo');
  },

  _onClickPrivacy: function () {
    this.options.onClickPrivacy && this.options.onClickPrivacy();
  },

  _hasContextMenu: function () {
    return this._menuView;
  },

  _hideContextMenu: function () {
    this._menuView.collection.unbind(null, null, this);
    this._menuView.remove();
    this.removeView(this._menuView);
    delete this._menuView;
  },

  _showContextMenu: function (ev) {
    var position = { x: ev.clientX, y: ev.clientY };
    var menuItems = [
      {
        label: _t('components.table.rows.options.delete'),
        val: 'delete',
        destructive: true,
        action: function () {
          console.log("open dialog");
        }
      }
    ];

    var collection = new CustomListCollection(menuItems);

    this._menuView = new ContextMenuView({
      collection: collection,
      triggerElementID: '-',
      position: position
    });

    collection.bind('change:selected', function (menuItem) {
      var action = menuItem.get('action');
      action && action();
    }, this);

    this._menuView.model.bind('change:visible', function (model, isContextMenuVisible) {
      if (this._hasContextMenu() && !isContextMenuVisible) {
        this._hideContextMenu();
      }
    }, this);

    this._menuView.show();
    this.addView(this._menuView);
  }

});
