var Backbone = require('backbone');
var $ = require('jquery');
var TableHeadItemView = require('../../../../../../javascripts/cartodb3/components/table/head/table-head-item-view');
var TableViewModel = require('../../../../../../javascripts/cartodb3/components/table/table-view-model');
var UserModel = require('../../../../../../javascripts/cartodb3/data/user-model');
var AnalysisDefinitionNodeSourceModel = require('../../../../../../javascripts/cartodb3/data/analysis-definition-node-source-model');
var QueryColumnsCollection = require('../../../../../../javascripts/cartodb3/data/query-columns-collection');
var FactoryModals = require('../../../factories/modals');

var simulateESCKeyPress = () => {
  var e = $.Event('keydown');
  e.keyCode = e.which = $.ui.keyCode.ESCAPE;
  $(document).trigger(e);
};

var simulateENTERKeyPress = () => {
  var e = $.Event('keydown');
  e.keyCode = e.which = $.ui.keyCode.ENTER;
  $(document).trigger(e);
};

describe('components/table/head/table-head-item-view', () => {
  beforeEach(() => {
    this.configModel = new Backbone.Model();
    var userModel = new UserModel({
      name: 'hello'
    }, {
      configModel: this.configModel
    });
    this.configModel.getSqlApiUrl = () => { return ''; };
    this.analysisDefinitionNodeModel = new AnalysisDefinitionNodeSourceModel({
      query: 'select * from pepito',
      table_name: 'pepito',
      id: 'dummy-id'
    }, {
      configModel: this.configModel,
      userModel: userModel
    });

    this.columnsCollection = new QueryColumnsCollection([
      {
        name: 'cartodb_id',
        type: 'number'
      }, {
        name: 'description',
        type: 'string'
      }
    ], {
      querySchemaModel: this.analysisDefinitionNodeModel.querySchemaModel,
      configModel: this.configModel
    });

    spyOn(this.columnsCollection, 'create');

    this.tableViewModel = new TableViewModel({
      tableName: 'pepito'
    }, {
      analysisDefinitionNodeModel: this.analysisDefinitionNodeModel,
      columnsCollection: this.columnsCollection
    });

    spyOn(this.analysisDefinitionNodeModel, 'isCustomQueryApplied').and.returnValue(false);
    spyOn(this.analysisDefinitionNodeModel, 'isReadOnly').and.returnValue(false);

    this.model = this.columnsCollection.at(1);
    spyOn(this.model, 'save');
    this.modals = FactoryModals.createModalService();
    this.view = new TableHeadItemView({
      model: this.model,
      columnsCollection: this.columnsCollection,
      tableViewModel: this.tableViewModel,
      simpleGeometry: 'point',
      modals: this.modals
    });
  });

  describe('column-options', () => {
    beforeEach(() => {
      this._makeClick = () => {
        this.view.$('.js-columnOptions').click();
      };
      this.view.render();
    });

    it('should open options when options is clicked', () => {
      this._makeClick();
      expect(this.view._menuView).toBeDefined();
    });

    it('should highlight/unhighlight when options is opened/closed', () => {
      this._makeClick();
      expect(this.view.$el.hasClass('is-highlighted')).toBeTruthy();
      simulateESCKeyPress();
      expect(this.view.$el.hasClass('is-highlighted')).toBeFalsy();
    });

    describe('table-binds', () => {
      beforeEach(() => {
        spyOn(this.view, '_initScrollBinding');
        spyOn(this.view, '_destroyScrollBinding');
      });

      it('should bind / unbind table scroll when it is opened / hidden', () => {
        this._makeClick();
        expect(this.view._initScrollBinding).toHaveBeenCalled();
        simulateESCKeyPress();
        expect(this.view._destroyScrollBinding).toHaveBeenCalled();
      });
    });

    describe('number of options', () => {
      it('should show all options', () => {
        this._makeClick();
        expect(this.view._menuView.collection.size()).toBe(5);
      });

      it('should not show all options when table view model is disabled', () => {
        spyOn(this.tableViewModel, 'isDisabled').and.returnValue(true);
        this._makeClick();
        expect(this.view._menuView.collection.size()).toBe(1);
      });

      it('should not show create/update/delete options if column is geometry', () => {
        spyOn(this.model, 'isGeometryColumn').and.returnValue(true);
        this.view.render();
        this._makeClick();
        var items = this.view._menuView.collection;
        expect(items.size()).toBe(2);
        expect(items.at(0).get('val')).toBe('order');
        expect(items.at(1).get('val')).toBe('create');
      });

      it('should not show create/update/delete options if column is cartodb_id', () => {
        spyOn(this.model, 'isCartoDBIDColumn').and.returnValue(true);
        this.view.render();
        this._makeClick();
        var items = this.view._menuView.collection;
        expect(items.size()).toBe(2);
        expect(items.at(0).get('val')).toBe('order');
        expect(items.at(1).get('val')).toBe('create');
      });
    });

    describe('actions', () => {
      beforeEach(() => {
        spyOn(this.tableViewModel, 'isDisabled').and.returnValue(false);
        spyOn(this.model, 'isEditable').and.returnValue(true);
        this._makeClick();
        this._menuView = this.view._menuView;
      });

      it('should change table-view-model when order is changed', () => {
        spyOn(this.tableViewModel, 'set');
        this._menuView.$('.js-asc').click();
        expect(this.tableViewModel.set).toHaveBeenCalledWith({ sort_order: 'asc', order_by: 'description' });
      });

      it('should start editing when rename option is clicked', () => {
        spyOn(this.view, '_startEditing');
        this._menuView.$('[data-val="rename"]').click();
        expect(this.view._startEditing).toHaveBeenCalled();
      });

      it('should change column type when change option and type is clicked', () => {
        spyOn(this.view, '_changeColumnType');
        this._menuView.$('[data-val="change"]').click();
        this._menuView.$('.Table-columnTypeMenu .js-listItem:eq(0)').click();
        expect(this.view._changeColumnType).toHaveBeenCalled();
      });

      it('should add a new column when change create is clicked', () => {
        spyOn(this.view, '_addColumn');
        this._menuView.$('[data-val="create"]').click();
        expect(this.view._addColumn).toHaveBeenCalled();
      });

      it('should remove column when remove option is clicked', () => {
        spyOn(this.view, '_removeColumn');
        this._menuView.$('[data-val="delete"]').click();
        expect(this.view._removeColumn).toHaveBeenCalled();
      });
    });
  });

  describe('rename', () => {
    beforeEach(() => {
      this.view.render();
      this.$input = this.view.$('.js-attribute');
      this._makeDblClick = () => {
        this.view.$('.js-attribute').dblclick();
      };
    });

    it('should let edit attribute name if double clicked over it', () => {
      spyOn(this.model, 'isEditable').and.returnValue(true);
      spyOn(this.tableViewModel, 'isDisabled').and.returnValue(true);
      spyOn(this.view, '_startEditing');

      this._makeDblClick();
      expect(this.view._startEditing).not.toHaveBeenCalled();

      this.tableViewModel.isDisabled.and.returnValue(false);
      this.model.isEditable.and.returnValue(false);
      this._makeDblClick();
      expect(this.view._startEditing).not.toHaveBeenCalled();

      this.model.isEditable.and.returnValue(true);
      this.tableViewModel.isDisabled.and.returnValue(false);
      this._makeDblClick();
      expect(this.view._startEditing).toHaveBeenCalled();
    });

    it('should add is-active class, remove readonly and bind changes when it is edited', () => {
      spyOn(this.view, '_initRenameBinds');
      this._makeDblClick();
      expect(this.$input.hasClass('is-active')).toBeTruthy();
      expect(this.$input.get(0).hasAttribute('readonly')).toBeFalsy();
      expect(this.view._initRenameBinds).toHaveBeenCalled();
    });

    it('should remove is-active class, add readonly and unbind changes when it is finished/closed', () => {
      this._makeDblClick();
      spyOn(this.view, '_destroyRenameBinds');
      simulateESCKeyPress();
      expect(this.$input.val()).toBe(this.model.get('name'));
      expect(this.$input.hasClass('is-active')).toBeFalsy();
      expect(this.$input.get(0).hasAttribute('readonly')).toBeTruthy();
      expect(this.view._destroyRenameBinds).toHaveBeenCalled();
    });

    it('should save name change when ENTER is pressed', () => {
      spyOn(this.view, '_saveNewName');
      this._makeDblClick();
      simulateENTERKeyPress();
      expect(this.view._saveNewName).toHaveBeenCalled();
    });

    it('should discard name change when ESC is pressed', () => {
      spyOn(this.view, '_saveNewName');
      this._makeDblClick();
      simulateESCKeyPress();
      expect(this.view._saveNewName).not.toHaveBeenCalled();
    });

    it('should open confirmation modal when name is changed', () => {
      spyOn(this.model, 'isEditable').and.returnValue(true);
      spyOn(this.modals, 'create');
      this._makeDblClick();
      this.$input.val('helloooo');
      simulateENTERKeyPress();
      expect(this.modals.create).toHaveBeenCalled();
    });
  });

  it('should disable scroll binding and document keypress when view is cleaned', () => {
    spyOn(this.view, '_destroyScrollBinding');
    spyOn(this.view, '_destroyRenameBinds');
    this.view.clean();
    expect(this.view._destroyScrollBinding).toHaveBeenCalled();
    expect(this.view._destroyRenameBinds).toHaveBeenCalled();
  });

  it('should have no leaks', () => {
    expect(this.view).toHaveNoLeaks();
  });

  afterEach(() => {
    this.view.clean();
  });
});
