var Backbone = require('backbone');
var ConfigModel = require('../../../../../../../../javascripts/cartodb3/data/config-model');
var AnalysisDefinitionNodeSourceModel = require('../../../../../../../../javascripts/cartodb3/data/analysis-definition-node-source-model');
var AnalysisDefinitionNodeModel = require('../../../../../../../../javascripts/cartodb3/data/analysis-definition-node-model');
var LayerDefinitionModel = require('../../../../../../../../javascripts/cartodb3/data/layer-definition-model');
var CentroidFormModel = require('../../../../../../../../javascripts/cartodb3/editor/layers/layer-content-views/analyses/analysis-form-models/centroid-form-model');
var analyses = require('../../../../../../../../javascripts/cartodb3/data/analyses');

describe('editor/layers/layer-content-views/analyses/analysis-form-models/centroid-form-model', () => {
  beforeEach(() => {
    var configModel = new ConfigModel({
      base_url: '/u/pepe',
      api_key: 'wadus',
      user_name: 'pepe'
    });

    this.analysisDefinitionNodesCollection = new Backbone.Collection();

    this.a0 = new AnalysisDefinitionNodeSourceModel({
      id: 'a0',
      type: 'centroid',
      query: 'SELECT * FROM a_table'
    }, {
      configModel: configModel,
      userModel: {},
      collection: this.analysisDefinitionNodesCollection
    });
    spyOn(this.a0, 'isValidAsInputForType').and.returnValue(true);

    this.a1 = new AnalysisDefinitionNodeModel({
      id: 'a1',
      type: 'centroid',
      source: 'a0'
    }, {
      configModel: configModel,
      collection: this.analysisDefinitionNodesCollection
    });

    this.layerDefinitionModel = new LayerDefinitionModel(null, {
      configModel: configModel
    });
    spyOn(this.layerDefinitionModel, 'findAnalysisDefinitionNodeModel').and.callFake(function (id) {
      switch (id) {
        case 'a0': return this.a0;
        case 'a1': return this.a1;
        default: return null;
      }
    });

    this.model = new CentroidFormModel(this.a1.attributes, {
      analyses: analyses,
      configModel: configModel,
      layerDefinitionModel: this.layerDefinitionModel,
      analysisSourceOptionsModel: {},
      parse: true
    });
  });

  it('should add analysis schema', () => {
    expect(this.model.schema).toBeDefined();
  });

  it('should have attributes set with defaults', () => {
    expect(this.model.attributes).toEqual({
      id: 'a1',
      source: 'a0',
      type: 'centroid',
      category: '',
      weight: '',
      aggregate: '',
      aggregation_column: '',
      aggregation: 'count'
    });
  });

  it('should have generated form fields', () => {
    expect(Object.keys(this.model.schema).length).toBe(4);
  });

  it('should bind properly', () => {
    this.model.set('category', 'wadus');
    expect(this.model.get('category_column')).toBe('wadus');
    this.model.set('category', '');
    expect(this.model.get('category_column')).not.toBeDefined();

    this.model.set('weight', 'wadus');
    expect(this.model.get('weight_column')).toBe('wadus');
    this.model.set('weight', '');
    expect(this.model.get('weight_column')).not.toBeDefined();

    this.model.set('aggregate', {operator: 'avg', attribute: 'wadus'});
    expect(this.model.get('aggregation_column')).toBe('wadus');
    expect(this.model.get('aggregation')).toBe('avg');
  });

  describe('type centroid', () => {
    beforeEach(() => {
      this.model.set('category', 'wadus');
    });

    it('should have type centroid', () => {
      expect(this.model.get('type')).toBe('centroid');
    });

    it('should not include weight_column', () => {
      expect(this.model.get('weight_column')).not.toBeDefined();
    });

    it('should have proper attributes', () => {
      expect(this.model.attributes).toEqual({
        id: 'a1',
        source: 'a0',
        type: 'centroid',
        category: 'wadus',
        category_column: 'wadus',
        weight: '',
        aggregate: '',
        aggregation_column: '',
        aggregation: 'count'
      });
    });
  });

  describe('type weighted-centroid', () => {
    beforeEach(() => {
      this.model.set('weight', 'wadus');
    });

    it('should change type to weighted-centroid', () => {
      expect(this.model.get('type')).toBe('weighted-centroid');
    });

    it('should include weight_column', () => {
      expect(this.model.get('weight_column')).toBeDefined();
    });

    it('should have proper attributes', () => {
      expect(this.model.attributes).toEqual({
        id: 'a1',
        source: 'a0',
        type: 'weighted-centroid',
        category: '',
        weight: 'wadus',
        weight_column: 'wadus',
        aggregate: '',
        aggregation_column: '',
        aggregation: 'count'
      });
    });
  });
});
