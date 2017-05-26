var ConfigModel = require('../../../../../../../javascripts/cartodb3/data/config-model');
var Backbone = require('backbone');
var AnalysisDefinitionNodesCollection = require('../../../../../../../javascripts/cartodb3/data/analysis-definition-nodes-collection');
var TablesCollection = require('../../../../../../../javascripts/cartodb3/data/tables-collection');
var TableModel = require('../../../../../../../javascripts/cartodb3/data/table-model');
var AnalysisSourceOptionsModel = require('../../../../../../../javascripts/cartodb3/editor/layers/layer-content-views/analyses/analysis-source-options-model');

describe('cartodb3/editor/layers/layer-content-views/analyses/analysis-source-options-model', () => {
  beforeEach(() => {
    var configModel = new ConfigModel({
      base_url: '/u/pepe'
    });

    spyOn(TableModel.prototype, 'fetch');

    this.analysisDefinitionNodesCollection = new AnalysisDefinitionNodesCollection(null, {
      configModel: configModel,
      userModel: {}
    });

    this.analysisDefinitionNodesCollection.add({
      id: 'a0',
      type: 'source',
      params: {
        table_name: 'hello',
        query: 'SELECT * FROM first'
      }
    });

    var layerModel = new Backbone.Model({
      name: 'table_layer',
      source: 'a0',
      color: '#000'
    });
    layerModel.getName = () => { return this.get('name'); };
    this.layerDefinitionsCollection = new Backbone.Collection(layerModel);
    this.layerDefinitionsCollection.findOwnerOfAnalysisNode = function (node) {
      return layerModel;
    };

    this.tablesCollection = new TablesCollection(null, {
      configModel: configModel
    });

    this.model = new AnalysisSourceOptionsModel(null, {
      analysisDefinitionNodesCollection: this.analysisDefinitionNodesCollection,
      layerDefinitionsCollection: this.layerDefinitionsCollection,
      tablesCollection: this.tablesCollection
    });
  });

  it('should not have any select options just yet', () => {
    expect(this.model.getSelectOptions('point')).toEqual([]);
    expect(this.model.getSelectOptions('polygon')).toEqual([]);
  });

  describe('when analysis are already fetched', () => {
    beforeEach(() => {
      spyOn(this.tablesCollection, 'fetch');
      spyOn(this.analysisDefinitionNodesCollection.first().queryGeometryModel, 'fetch');
      this.analysisDefinitionNodesCollection.first().queryGeometryModel.set({
        simple_geom: 'polygon',
        status: 'fetched'
      });

      this.model.fetch();

      this.tablesCollection.trigger('sync');
      expect(this.model.get('fetching')).toBe(false);
    });

    it('should populate nodes from already fetched nodes', () => {
      expect(this.model.getSelectOptions('polygon')).toEqual([
        jest.objectContaining({
          val: 'a0',
          label: 'a0',
          type: 'node'
        })
      ]);
    });
  });

  describe('when analysis nodes are fetched', () => {
    beforeEach(() => {
      spyOn(this.tablesCollection, 'fetch');
      spyOn(this.analysisDefinitionNodesCollection.first().queryGeometryModel, 'fetch');
      this.model.fetch();
    });

    it('should fetch tables reducing the data to be retrieved', () => {
      expect(this.tablesCollection.fetch.calls.first().args).toContain(
        {
          data: Object({
            show_likes: false,
            show_liked: false,
            show_stats: false,
            show_table_size_and_row_count: false,
            show_permission: false,
            show_synchronization: false,
            show_uses_builder_features: false,
            load_totals: false,
            per_page: 1000
          })
        }
      );
    });

    it('should be in fetching state', () => {
      expect(this.model.get('fetching')).toBe(true);
    });

    describe('when all items are fetched successfully', () => {
      beforeEach(() => {
        this.tablesCollection.add({
          name: 'table_with_points',
          geometry_types: ['ST_POINT']
        });
        this.tablesCollection.trigger('sync');
        expect(this.model.get('fetching')).toBe(true);

        this.analysisDefinitionNodesCollection.first().queryGeometryModel.set({
          simple_geom: 'polygon',
          status: 'fetched'
        });
      });

      it('should not be fetching anymore', () => {
        expect(this.model.get('fetching')).toBe(false);
      });

      it('should have items matching geometry type', () => {
        expect(this.model.getSelectOptions('polygon')).toEqual([
          jest.objectContaining({
            val: 'a0',
            label: 'a0',
            type: 'node'
          })
        ]);

        expect(this.model.getSelectOptions('point')).toEqual([
          jest.objectContaining({
            val: 'table_with_points',
            label: 'table_with_points',
            type: 'dataset'
          })
        ]);
      });

      it('should have items matching multiple accepted geometries', () => {
        expect(this.model.getSelectOptions(['polygon', 'point'])).toEqual([
          jest.objectContaining({
            val: 'a0',
            label: 'a0',
            type: 'node'
          }),
          jest.objectContaining({
            val: 'table_with_points',
            label: 'table_with_points',
            type: 'dataset'
          })
        ]);
      });

      it('should have items matching a wildcard geometry', () => {
        expect(this.model.getSelectOptions(['*'])).toEqual([
          jest.objectContaining({
            val: 'a0',
            label: 'a0',
            type: 'node'
          }),
          jest.objectContaining({
            val: 'table_with_points',
            label: 'table_with_points',
            type: 'dataset'
          })
        ]);
      });
    });
  });
});
