var Backbone = require('backbone');
var ConfigModel = require('../../../../../javascripts/cartodb3/data/config-model');
var UserModel = require('../../../../../javascripts/cartodb3/data/user-model');
var AnalysisDefinitionNodeSourceModel = require('../../../../../javascripts/cartodb3/data/analysis-definition-node-source-model');
var TableViewModel = require('../../../../../javascripts/cartodb3/components/table/table-view-model');

describe('components/table/table-view-model', () => {
  beforeEach(() => {
    this.configModel = new ConfigModel();
    this.userModel = new UserModel({
      name: 'pepito'
    }, {
      configModel: this.configModel
    });

    this.analysisDefinitionNodeModel = new AnalysisDefinitionNodeSourceModel({
      query: 'select * from pepito',
      table_name: 'pepito',
      id: 'dummy-id'
    }, {
      configModel: this.configModel,
      userModel: this.userModel
    });

    this.columnsCollection = new Backbone.Collection();

    spyOn(TableViewModel.prototype, '_setOrderAndSort').and.callThrough();

    this.model = new TableViewModel({}, {
      columnsCollection: this.columnsCollection,
      analysisDefinitionNodeModel: this.analysisDefinitionNodeModel
    });
  });

  describe('_setOrderAndSort', () => {
    it('should set order and sort when it is initialized', () => {
      expect(TableViewModel.prototype._setOrderAndSort).toHaveBeenCalled();
    });

    it('should set/change order when columnsCollection is reseted', () => {
      TableViewModel.prototype._setOrderAndSort.calls.reset();
      expect(TableViewModel.prototype._setOrderAndSort.calls.count()).toBe(0);
      this.columnsCollection.reset([]);
      expect(TableViewModel.prototype._setOrderAndSort).toHaveBeenCalled();
      expect(TableViewModel.prototype._setOrderAndSort.calls.count()).toBe(1);
    });

    it('should use cartodb_id as order_by and asc as sort_by if columnsCollection is reseted, and query is not custom', () => {
      spyOn(this.model, 'isCustomQueryApplied').and.returnValue(false);
      this.model.set('order_by', 'hello');
      this.columnsCollection.reset([{
        name: 'cartodb_id',
        type: 'number'
      }]);
      expect(this.model.get('order_by')).toBe('cartodb_id');
    });

    it('should not use cartodb_id as order_by and asc as sort_by if columnsCollection is reseted, it is available and query is custom', () => {
      spyOn(this.model, 'isCustomQueryApplied').and.returnValue(true);
      this.model.set('order_by', 'hello');
      this.columnsCollection.reset([{
        name: 'cartodb_id',
        type: 'number'
      }]);
      expect(this.model.get('order_by')).not.toBe('cartodb_id');
    });
  });

  describe('isDisabled', () => {
    it('should return that if analysisDefinitionNodeModel says so', () => {
      spyOn(this.analysisDefinitionNodeModel, 'isReadOnly').and.returnValue(false);
      expect(this.model.isDisabled()).toBeFalsy();
      this.analysisDefinitionNodeModel.isReadOnly.and.returnValue(true);
      expect(this.model.isDisabled()).toBeTruthy();
    });
  });

  describe('isCustomQueryApplied', () => {
    it('should return that if analysisDefinitionNodeModel says so', () => {
      spyOn(this.analysisDefinitionNodeModel, 'isCustomQueryApplied').and.returnValue(false);
      expect(this.model.isCustomQueryApplied()).toBeFalsy();
      this.analysisDefinitionNodeModel.isCustomQueryApplied.and.returnValue(true);
      expect(this.model.isCustomQueryApplied()).toBeTruthy();
    });
  });
});
