var LayerDefinitionModel = require('../../../../../../../javascripts/cartodb3/data/layer-definition-model');
var AnalysisOptionModel = require('../../../../../../../javascripts/cartodb3/components/modals/add-analysis/analysis-option-models/analysis-option-model');

describe('cartodb3/components/modals/add-analysis/analysis-option-models/analysis-option-model', () => {
  beforeEach(() => {
    this.model = new AnalysisOptionModel({
      title: 'a Buffer',
      desc: 'An example of how buffer would/should behave',
      type_group: 'Specs'
    }, {
      nodeAttrs: {
        type: 'buffer',
        radius: 123
      }
    });
  });

  describe('.acceptsGeometryTypeAsInput', () => {
    it('should return true for valid geometries', () => {
      expect(this.model.acceptsGeometryTypeAsInput('point')).toBe(true);
      expect(this.model.acceptsGeometryTypeAsInput('polygon')).toBe(true);
      expect(this.model.acceptsGeometryTypeAsInput('line')).toBe(true);

      var model = new AnalysisOptionModel(null, {nodeAttrs: {type: 'trade-area'}});
      expect(model.acceptsGeometryTypeAsInput('point')).toBe(true);
      expect(model.acceptsGeometryTypeAsInput('polygon')).toBe(false);
    });
  });

  describe('.getValidInputGeometries', () => {
    it('should return valid input geometries', () => {
      expect(this.model.getValidInputGeometries()).toEqual(jest.any(Array));
      expect(this.model.getValidInputGeometries()[0]).toEqual(jest.any(String));
    });
  });

  describe('.getFormAttrs', () => {
    beforeEach(() => {
      this.layerDefModel = new LayerDefinitionModel({
        id: 'layerA',
        type: 'cartoDB',
        letter: 'a',
        source: 'a0'
      }, {
        configModel: {}
      });
    });

    describe('when given a layer with own source', () => {
      it('should return attrs to create a form model for analysis', () => {
        expect(this.model.getFormAttrs(this.layerDefModel)).toEqual({
          id: 'a1',
          source: 'a0',
          type: 'buffer',
          radius: 123
        });
      });
    });

    describe('when given a layer which source belongs to another layer', () => {
      beforeEach(() => {
        this.layerDefModel.set('source', 'b0');
      });

      it('should return attrs to create a form model for analysis', () => {
        var attrs = this.model.getFormAttrs(this.layerDefModel);
        expect(attrs.id).toEqual('a1', 'id should be adapted for layer, not continue on source node');
        expect(attrs).toEqual({
          id: 'a1',
          source: 'b0',
          type: 'buffer',
          radius: 123
        });
      });
    });
  });
});
