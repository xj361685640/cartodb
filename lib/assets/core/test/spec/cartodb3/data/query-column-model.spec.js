var Backbone = require('backbone');
var QueryColumnModel = require('../../../../javascripts/cartodb3/data/query-column-model');

describe('data/query-columns-model', () => {
  beforeEach(() => {
    this.configModel = new Backbone.Model();

    spyOn(QueryColumnModel.prototype, 'fetch');
    this.model = new QueryColumnModel({}, {
      configModel: this.configModel,
      tableName: 'heyyy'
    });
  });

  describe('parse', () => {
    it('should parse correctly', () => {
      var dataParsed = this.model.parse({
        cartodb_type: 'string',
        name: 'hello'
      });
      expect(dataParsed.type).toBe('string');
      expect(dataParsed.name).toBe('hello');
      expect(dataParsed.isNew).toBeFalsy();
    });
  });

  describe('url', () => {
    beforeEach(() => {
      this.configModel.set({
        base_url: ''
      });
      this.configModel.urlVersion = () => { return 'v1'; };
    });

    it('should not provide a valid url if tableName is not defined', () => {
      this.model._tableName = '';
      expect(this.model.url()).toBeFalsy();
      this.model._tableName = 'heyman';
      expect(this.model.url()).toContain('/api/v1/tables/heyman/columns');
    });

    it('should add column name unless isNew is true', () => {
      this.model.set({
        name: 'newName',
        isNew: true
      });
      expect(this.model.url()).toBe('/api/v1/tables/heyyy/columns/');
      this.model.set('isNew', false);
      expect(this.model.url()).toBe('/api/v1/tables/heyyy/columns/newName');
    });
  });

  describe('static methods', () => {
    it('should provide information if a column change type is destructive', () => {
      expect(QueryColumnModel.isTypeChangeDestructive).toBeDefined();
      expect(QueryColumnModel.isTypeChangeDestructive('number', 'date')).toBeTruthy();
      expect(QueryColumnModel.isTypeChangeDestructive('date', 'string')).toBeFalsy();
    });

    it('should provide information if a column change type is allowed', () => {
      expect(QueryColumnModel.isTypeChangeAllowed).toBeDefined();
      expect(QueryColumnModel.isTypeChangeAllowed('number', 'date')).toBeFalsy();
      expect(QueryColumnModel.isTypeChangeAllowed('boolean', 'date')).toBeFalsy();
      expect(QueryColumnModel.isTypeChangeAllowed('number', 'string')).toBeTruthy();
    });
  });
});
