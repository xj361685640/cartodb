var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
var CDB = require('cartodb.js');
var MetricsTracker = require('../../../../javascripts/cartodb3/components/metrics/metrics-tracker');
var ConfigModel = require('../../../../javascripts/cartodb3/data/config-model');
var UserModel = require('../../../../javascripts/cartodb3/data/user-model');
var LayerDefinitionModel = require('../../../../javascripts/cartodb3/data/layer-definition-model');
var AnalysisDefinitionNodesCollection = require('../../../../javascripts/cartodb3/data/analysis-definition-nodes-collection');
var AnalysisDefinitionsCollection = require('../../../../javascripts/cartodb3/data/analysis-definitions-collection');
var LayerDefinitionsCollection = require('../../../../javascripts/cartodb3/data/layer-definitions-collection');
var WidgetDefinitionsCollection = require('../../../../javascripts/cartodb3/data/widget-definitions-collection');
var AnalysisFormModel = require('../../../../javascripts/cartodb3/editor/layers/layer-content-views/analyses/analysis-form-models/base-analysis-form-model');
var WidgetOptionModel = require('../../../../javascripts/cartodb3/components/modals/add-widgets/widget-option-model');
var UserActions = require('../../../../javascripts/cartodb3/data/user-actions');
var AreaOfInfluenceFormModel = require('../../../../javascripts/cartodb3/editor/layers/layer-content-views/analyses/analysis-form-models/area-of-influence-form-model');
var CategoryWidgetOptionModel = require('../../../../javascripts/cartodb3/components/modals/add-widgets/category/category-option-model');
var FilterByNodeColumnFormModel = require('../../../../javascripts/cartodb3/editor/layers/layer-content-views/analyses/analysis-form-models/filter-by-node-column');
var TableModel = require('../../../../javascripts/cartodb3/data/table-model');
var AnalysisSourceOptionsModel = require('../../../../javascripts/cartodb3/editor/layers/layer-content-views/analyses/analysis-source-options-model');
var analyses = require('../../../../javascripts/cartodb3/data/analyses');

describe('cartodb3/data/user-actions', () => {
  var interceptAjaxCall;

  beforeEach(() => {
    interceptAjaxCall = null;

    spyOn(MetricsTracker, 'track');

    this.configModel = new ConfigModel({
      base_url: '/u/pepe',
      user_name: 'pepe'
    });

    this.userModel = new UserModel({
      limits: { max_layers: 4 }
    }, {
      configModel: this.configModel
    });

    this.analysisDefinitionNodesCollection = new AnalysisDefinitionNodesCollection(null, {
      configModel: this.configModel,
      userModel: this.userModel
    });
    this.analysisDefinitionsCollection = new AnalysisDefinitionsCollection(null, {
      configModel: this.configModel,
      vizId: 'viz-123',
      layerDefinitionsCollection: new Backbone.Collection(),
      analysisDefinitionNodesCollection: this.analysisDefinitionNodesCollection
    });

    this.layerDefinitionsCollection = new LayerDefinitionsCollection(null, {
      configModel: this.configModel,
      userModel: this.userModel,
      analysisDefinitionNodesCollection: this.analysisDefinitionNodesCollection,
      mapId: 'map-123',
      stateDefinitionModel: {}
    });

    this.widgetDefinitionsCollection = new WidgetDefinitionsCollection(null, {
      configModel: this.configModel,
      layerDefinitionsCollection: this.layerDefinitionsCollection,
      mapId: 'map-123'
    });

    this.userActions = UserActions({
      userModel: this.userModel,
      analysisDefinitionNodesCollection: this.analysisDefinitionNodesCollection,
      analysisDefinitionsCollection: this.analysisDefinitionsCollection,
      layerDefinitionsCollection: this.layerDefinitionsCollection,
      widgetDefinitionsCollection: this.widgetDefinitionsCollection
    });

    // Fake requests working, by default
    this.originalAjax = Backbone.ajax;
    Backbone.ajax = function (params) {
      interceptAjaxCall && interceptAjaxCall(params);
      return {
        always: function (cb) {
          cb();
        },
        done: function (cb) {
          cb();
        },
        fail: () => {}
      };
    };
  });

  afterEach(() => {
    Backbone.ajax = this.originalAjax;
  });

  describe('.createAnalysisNode', () => {
    beforeEach(() => {
      spyOn(this.analysisDefinitionsCollection, 'create');

      this.a0 = this.analysisDefinitionNodesCollection.add({
        id: 'a0',
        type: 'source',
        params: {
          query: 'SELECT * FROM a_table'
        },
        options: {
          table_name: 'a_table'
        }
      });
    });

    describe('when given a layer that has no analysis yet', () => {
      beforeEach(() => {
        this.layerDefModel = this.layerDefinitionsCollection.add({
          id: 'layerA',
          kind: 'carto',
          options: {
            table_name: 'alice',
            letter: 'a',
            source: 'a0'
          }
        });
        spyOn(this.layerDefModel, 'save').and.callThrough();

        var nodeAttrs = {
          id: 'a1',
          type: 'trade-area',
          source: 'a0',
          kind: 'walk',
          time: 123
        };

        spyOn(this.userActions, '_resetStylePerNode');
        this.nodeDefModel = this.userActions.createAnalysisNode(nodeAttrs, this.layerDefModel);
      });

      it('should create a new analysis', () => {
        expect(this.analysisDefinitionsCollection.pluck('node_id')).toEqual(['a1']);
      });

      it('should have updated the layer', () => {
        expect(this.layerDefModel.get('source')).toEqual('a1');
        expect(this.layerDefModel.get('cartocss')).toEqual(jest.any(String));
        expect(this.layerDefModel.save).toHaveBeenCalled();
      });

      it('should return a new node', () => {
        expect(this.nodeDefModel).toBeDefined();
        expect(this.nodeDefModel.id).toEqual('a1');
      });

      it('should try to reset styles', () => {
        expect(this.userActions._resetStylePerNode).toHaveBeenCalled();
      });
    });

    describe('when given a layer that already have an analysis for the source of given attrs', () => {
      beforeEach(() => {
        this.layerDefModel = this.layerDefinitionsCollection.add({
          id: 'layerA',
          kind: 'carto',
          options: {
            letter: 'a',
            source: 'a0'
          }
        });
        spyOn(this.layerDefModel, 'save').and.callThrough();
        this.analysisDefinitionsCollection.add({analysis_definition: {id: 'a0'}});

        var nodeAttrs = {
          id: 'a1',
          type: 'trade-area',
          source: 'a0',
          kind: 'walk',
          time: 123
        };

        this.nodeDefModel = this.userActions.createAnalysisNode(nodeAttrs, this.layerDefModel);
      });

      it('should not create a new analysis', () => {
        expect(this.analysisDefinitionsCollection.pluck('node_id')).toEqual(['a1']);
      });

      it('should updated layer', () => {
        expect(this.layerDefModel.get('source')).toEqual('a1');
        expect(this.layerDefModel.get('cartocss')).toEqual(jest.any(String));
        expect(this.layerDefModel.save).toHaveBeenCalled();
      });

      it('should return a new node', () => {
        expect(this.nodeDefModel).toBeDefined();
        expect(this.nodeDefModel.id).toEqual('a1');
      });
    });
  });

  describe('.saveAnalysis', () => {
    beforeEach(() => {
      this.layerDefModel = this.layerDefinitionsCollection.add({
        id: 'l1',
        kind: 'carto',
        options: {
          letter: 'a',
          source: 'a0'
        }
      });

      this.analysisDefinitionNodesCollection.add({
        id: 'a0',
        type: 'source',
        params: {
          query: 'SELECT * from alice'
        }
      });
      this.aFormModel = new AnalysisFormModel({
        id: 'a1',
        type: 'buffer',
        radius: 100,
        source: 'a0'
      }, {
        analyses: analyses,
        configModel: {},
        layerDefinitionModel: this.layerDefModel,
        analysisSourceOptionsModel: {}
      });
      spyOn(this.userActions, '_resetStylePerNode');
      spyOn(this.aFormModel, 'isValid');
    });

    it('should do nothing if invalid', () => {
      this.aFormModel.isValid.and.returnValue(false);
      this.userActions.saveAnalysis(this.aFormModel);
    });

    describe('when valid', () => {
      beforeEach(() => {
        this.aFormModel.isValid.and.returnValue(true);
      });

      describe('when node does not exist for given form-model', () => {
        beforeEach(() => {
          spyOn(this.aFormModel, 'createNodeDefinition').and.callThrough();
          this.userActions.saveAnalysis(this.aFormModel);
        });

        it('should delegate back to form model to create node', () => {
          expect(this.aFormModel.createNodeDefinition).toHaveBeenCalledWith(this.userActions);
        });

        it('should persist the new analysis', () => {
          expect(this.analysisDefinitionsCollection.pluck('node_id')).toEqual(['a1']);
        });
      });

      describe('when node-definition exists for given form-model', () => {
        beforeEach(() => {
          this.layerDefModel.set('source', 'a1');
          this.layerAnalysis = this.analysisDefinitionsCollection.add({
            id: 'for-A',
            analysis_definition: {
              id: 'a1',
              type: 'buffer',
              params: {
                id: 'a0',
                type: 'source',
                params: {query: ''}
              }
            }
          });
          spyOn(this.layerAnalysis, 'save').and.callThrough();
          spyOn(this.aFormModel, 'updateNodeDefinition').and.callThrough();
          this.a1 = this.analysisDefinitionNodesCollection.get('a1');

          this.userActions.saveAnalysis(this.aFormModel);
        });

        it('should delegate back to form model to update the node-definition', () => {
          expect(this.aFormModel.updateNodeDefinition).toHaveBeenCalledWith(this.a1);
        });

        it('should persist the analysis change', () => {
          expect(this.analysisDefinitionsCollection.pluck('node_id')).toEqual(['a1']);
          expect(this.layerAnalysis.save).toHaveBeenCalled();
        });

        it('should set the USER_SAVED flag', () => {
          var node = this.analysisDefinitionNodesCollection.get('a1');
          expect(node.USER_SAVED).toBeTruthy();
        });

        it('should try to reset style if possible', () => {
          expect(this.userActions._resetStylePerNode).toHaveBeenCalled();
          expect(this.userActions._resetStylePerNode.calls.argsFor(0)[3]).toBeTruthy();
        });
      });
    });
  });

  describe('.saveAnalysisSourceQuery', () => {
    beforeEach(() => {
      this.query = 'SELECT * FROM table';
      this.a0 = this.analysisDefinitionNodesCollection.add({
        id: 'a0',
        type: 'source',
        params: {query: ''}
      });
      this.a1 = this.analysisDefinitionNodesCollection.add({
        id: 'a1',
        type: 'buffer',
        params: {
          source: {id: 'a0'}
        }
      });
      this.layerDefModel = new LayerDefinitionModel({
        id: 'layerA',
        kind: 'carto',
        options: {
          source: 'a0',
          table_name: 'table_name'
        }
      }, {
        configModel: this.configModel,
        parse: true
      });

      this.layerDefinitionsCollection.add(this.layerDefModel);
    });

    it('should not accept a non-source', () => {
      expect(() => {
        this.userActions.saveAnalysisSourceQuery(this.query, this.a1, this.layerDefModel);
      }).toThrowError(/source/);
    });

    describe('setDefaultPropertiesByType', () => {
      beforeEach(() => {
        spyOn(this.layerDefModel.styleModel, 'setDefaultPropertiesByType');
        this.queryGeometryModel = this.a0.queryGeometryModel;
        this.queryGeometryModel.set({
          simple_geom: 'point',
          query: 'SELECT * FROM table_name'
        });
        spyOn(this.userActions, '_resetStylePerNode');
        this.userActions.saveAnalysisSourceQuery(this.query, this.a0, this.layerDefModel);
      });

      it('should try to reset style if possible', () => {
        expect(this.userActions._resetStylePerNode).toHaveBeenCalled();
      });
    });

    describe('when there is no analysis', () => {
      /*
        There is no possibility to have a layer without an analysis
        because source analysis are pre generated in the backend
      */
    });

    describe('when there is an persisted analysis already', () => {
      beforeEach(() => {
        this.analysis = this.analysisDefinitionsCollection.add({
          id: 'for-layerA',
          analysis_definition: {id: 'a1'}
        });
        spyOn(this.analysis, 'save');
        this.userActions.saveAnalysisSourceQuery(this.query, this.a0, this.layerDefModel);
      });

      it('should set query on analysis-definition-node-model', () => {
        var query = this.a0.get('query');
        expect(query).toEqual(this.query);
        expect(_.isEmpty(query)).toBe(false);
      });

      it('should save the analysis that contains the affected node', () => {
        expect(this.analysis.save).toHaveBeenCalled();
        expect(this.analysisDefinitionsCollection.pluck('node_id')).toEqual(['a1']);
      });
    });
  });

  describe('.saveWidgetOption', () => {
    beforeEach(() => {
      this.a0 = this.analysisDefinitionNodesCollection.add({
        id: 'a0',
        type: 'source',
        params: {query: ''}
      });
      this.a1 = this.analysisDefinitionNodesCollection.add({
        id: 'a1',
        type: 'buffer',
        params: {
          source: {id: 'a0'}
        }
      });

      this.layerDefModel = this.layerDefinitionsCollection.add({
        id: 'layerA',
        kind: 'carto',
        options: {
          letter: 'a',
          source: 'a1'
        }
      });
      spyOn(this.layerDefModel, 'save').and.callThrough();

      this.widgetOptionModel = new WidgetOptionModel({
        type: 'category'
      });
      spyOn(this.widgetOptionModel, 'analysisDefinitionNodeModel').and.returnValue(this.a1);
      spyOn(this.widgetOptionModel, 'layerDefinitionModel').and.returnValue(this.layerDefModel);
      spyOn(this.widgetOptionModel, 'save');
    });

    describe('when source of widget is not yet persisted', () => {
      beforeEach(() => {
        this.userActions.saveWidgetOption(this.widgetOptionModel);
      });

      it('should create a new analysis', () => {
        expect(this.analysisDefinitionsCollection.pluck('node_id')).toEqual(['a1']);
      });

      it('should not persist layer, it is necessary', () => {
        expect(this.layerDefModel.save).not.toHaveBeenCalled();
      });

      it('should delegate side-effects to the option model', () => {
        expect(this.widgetOptionModel.save).toHaveBeenCalledWith(this.widgetDefinitionsCollection);
      });
    });

    describe('when source of widget is already persisted', () => {
      beforeEach(() => {
        this.analysisDefinitionsCollection.add({
          id: 'for-A',
          analysis_definition: {id: 'a1'}
        });
        this.userActions.saveWidgetOption(this.widgetOptionModel);
      });

      it('should only delegate side-effects to the option model', () => {
        expect(this.widgetOptionModel.save).toHaveBeenCalledWith(this.widgetDefinitionsCollection);
      });

      it('should not save associated layer-definition-model, it is not necessary', () => {
        expect(this.layerDefModel.save).not.toHaveBeenCalled();
      });
    });

    describe('when there is no analysis-definition-node-model available (e.g. time-series none-option)', () => {
      beforeEach(() => {
        spyOn(this.analysisDefinitionsCollection, 'saveAnalysisForLayer');
        this.widgetOptionModel.analysisDefinitionNodeModel.and.returnValue(undefined);
        this.userActions.saveWidgetOption(this.widgetOptionModel);
      });

      it('should only delegate side-effects to the option model', () => {
        expect(this.widgetOptionModel.save).toHaveBeenCalledWith(this.widgetDefinitionsCollection);

        expect(this.analysisDefinitionsCollection.saveAnalysisForLayer).not.toHaveBeenCalled();
      });
    });
  });

  describe('.deleteAnalysisNode', () => {
    beforeEach(() => {
      spyOn(this.userActions, '_resetStylePerNode');
    });

    describe('when there is a layer with some analysis', () => {
      beforeEach(() => {
        this.layerA = this.layerDefinitionsCollection.add({
          id: 'A',
          kind: 'carto',
          options: {
            source: 'a2',
            table_name: 'alice'
          }
        });

        this.analysisDefinitionsCollection.add({
          id: 'for-layer-A',
          analysis_definition: {
            id: 'a2',
            type: 'buffer',
            params: {
              source: {
                id: 'a1',
                type: 'buffer',
                params: {
                  source: {
                    id: 'a0',
                    type: 'source',
                    params: {
                      query: 'SELECT * FROM alice'
                    },
                    options: {
                      style_history: {
                        A: {
                          options: {
                            tile_style: 'wadus',
                            style_properties: {
                              type: 'wadus'
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        });
      });

      describe('deleting a1', () => {
        beforeEach(() => {
          this.userActions.deleteAnalysisNode('a1');
        });

        it('should delete self and dependent nodes', () => {
          expect(this.analysisDefinitionNodesCollection.pluck('id')).toEqual(['a0'], 'should leave a0 at least');
        });

        it('should update analysis to point to source of deleted node', () => {
          expect(this.analysisDefinitionsCollection.pluck('node_id')).toEqual(['a0']);
        });

        it('should update the layer to point to the primary source', () => {
          expect(this.layerA.get('source')).toEqual('a0');
          expect(this.layerDefinitionsCollection.pluck('id')).toEqual(['A']);
        });

        it('should reset styles', () => {
          expect(this.userActions._resetStylePerNode).toHaveBeenCalled();
        });

        it('should copy styles from analysis node', () => {
          expect(this.layerA.styleModel.get('type')).toEqual('wadus');
          expect(this.layerA.get('cartocss')).toEqual('wadus');
        });
      });

      describe('deleting a2', () => {
        beforeEach(() => {
          this.userActions.deleteAnalysisNode('a2');
        });

        it('should reset styles', () => {
          expect(this.userActions._resetStylePerNode).toHaveBeenCalled();
        });
      });
    });

    describe('for some interrelated layers', () => {
      beforeEach(() => {
        // creates a nodes graph to test various scenarios:
        // a0         <-- head of layer A
        // c1         <-- head of layer C + widget
        //   b2
        //     b1     <-- head layer B
        //       b0   <-- widget
        //   c0
        this.analysisDefinitionsCollection.add({
          id: 'layer-A',
          analysis_definition: {
            id: 'a0',
            type: 'source',
            params: {
              query: 'SELECT * FROM a_single_source'
            }
          }
        });
        this.analysisDefinitionsCollection.add({
          id: 'layer-B',
          analysis_definition: {
            id: 'b2',
            type: 'buffer',
            params: {
              source: {
                id: 'b1',
                type: 'trade-area',
                params: {
                  source: {
                    id: 'b0',
                    type: 'source',
                    params: {
                      query: 'SELECT * FROM bar'
                    }
                  }
                }
              }
            }
          }
        });
        this.analysisDefinitionsCollection.add({
          id: 'layer-C',
          analysis_definition: {
            id: 'c1',
            type: 'intersection',
            params: {
              source: {
                id: 'c0',
                type: 'source',
                params: {
                  query: 'SELECT * FROM my_polygons'
                }
              },
              target: {id: 'b2'}
            },
            options: {
              primary_source_name: 'source'
            }
          }
        });

        this.layerDefinitionsCollection.add([
          {
            id: 'A',
            kind: 'carto',
            options: {
              letter: 'a',
              source: 'a0'
            }
          },
          {
            id: 'B',
            kind: 'carto',
            options: {
              letter: 'b',
              source: 'b2'
            }
          }, {
            id: 'C',
            kind: 'carto',
            options: {
              letter: 'c',
              source: 'c1'
            }
          }
        ]);

        this.widgetDefinitionsCollection.add([
          {
            id: 'for-b0',
            type: 'formula',
            source: {
              id: 'b0'
            }
          }, {
            id: 'for-c1',
            type: 'formula',
            source: {
              id: 'c1'
            }
          }
        ]);

        expect(this.analysisDefinitionNodesCollection.pluck('id')).toEqual(['a0', 'b0', 'b1', 'b2', 'c0', 'c1'], 'should have created individual nodes');
      });

      it('should do nothing if the node does not exist', () => {
        expect(this.userActions.deleteAnalysisNode('x1')).toBe(false);
        expect(this.userActions.deleteAnalysisNode('')).toBe(false);
        expect(this.userActions.deleteAnalysisNode(undefined)).toBe(false);
        expect(this.userActions.deleteAnalysisNode(null)).toBe(false);
        expect(this.userActions.deleteAnalysisNode(true)).toBe(false);
      });

      describe('when given a head node w/o any dependent nodes (c1)', () => {
        beforeEach(() => {
          this.c1 = this.analysisDefinitionNodesCollection.get('c1');
          this.C = this.layerDefinitionsCollection.get('C');

          spyOn(this.c1, 'destroy').and.callThrough();
          spyOn(this.C, 'save').and.callThrough();
          spyOn(this.analysisDefinitionsCollection, 'create').and.callThrough();

          this.userActions.deleteAnalysisNode('c1');
        });

        it('should delete dependent nodes', () => {
          expect(this.analysisDefinitionNodesCollection.pluck('id')).not.toContain('c1');
          expect(this.analysisDefinitionNodesCollection.pluck('id')).toEqual(['a0', 'b0', 'b1', 'b2', 'c0'], 'c1 and its primary source c0 should have been removed');
        });

        it('should update affected analysis', () => {
          expect(this.analysisDefinitionsCollection.pluck('node_id')).toEqual(['a0', 'b2', 'c0'], 'should have updated c1 => c0');
        });

        it('should update layer to point to new head', () => {
          expect(this.C.save).toHaveBeenCalled();
          expect(this.C.get('source')).toEqual('c0');
          expect(this.layerDefinitionsCollection.pluck('source')).toEqual(['a0', 'b2', 'c0']);
        });

        it('should delete dependent widgets', () => {
          expect(this.widgetDefinitionsCollection.pluck('source')).toEqual(['b0']);
        });

        it('should delete node', () => {
          expect(this.c1.destroy).toHaveBeenCalled();
        });
      });

      describe('when given a head node which have dependent nodes (b2)', () => {
        beforeEach(() => {
          this.b2 = this.analysisDefinitionNodesCollection.get('b2');
          this.B = this.layerDefinitionsCollection.get('B');

          spyOn(this.b2, 'destroy').and.callThrough();
          spyOn(this.B, 'save').and.callThrough();

          this.userActions.deleteAnalysisNode('b2');
        });

        it('should delete dependent nodes', () => {
          var nodeIds = this.analysisDefinitionNodesCollection.pluck('id');
          expect(nodeIds).not.toContain('b2');
          expect(nodeIds).not.toContain('c1');
          expect(nodeIds).not.toContain('c0');
          expect(nodeIds).toEqual(['a0', 'b0', 'b1']);
        });

        it('should delete analysis for C', () => {
          expect(this.analysisDefinitionsCollection.pluck('node_id')).not.toContain('c1');
        });

        it('should have created a new analysis for the remaining b0', () => {
          expect(this.analysisDefinitionsCollection.pluck('node_id')).toContain('b1');
        });

        it('should update layer B to point to new head', () => {
          expect(this.B.save).toHaveBeenCalled();
          expect(this.B.get('source')).toEqual('b1');
        });

        it('should delete C layer', () => {
          expect(this.layerDefinitionsCollection.pluck('id')).toEqual(['A', 'B']);
        });

        it('should not affect widgets', () => {
          expect(this.widgetDefinitionsCollection.pluck('source')).toEqual(['b0']);
        });

        it('should delete node', () => {
          expect(this.b2.destroy).toHaveBeenCalled();
        });
      });

      describe('when given a node which is neither a head or source (b1)', () => {
        beforeEach(() => {
          this.b1 = this.analysisDefinitionNodesCollection.get('b1');

          spyOn(this.b1, 'destroy').and.callThrough();

          this.userActions.deleteAnalysisNode('b1');
        });

        it('should delete dependent nodes', () => {
          var nodeIds = this.analysisDefinitionNodesCollection.pluck('id');
          expect(nodeIds).not.toContain('b2');
          expect(nodeIds).not.toContain('b1');
          expect(nodeIds).not.toContain('c1');
          expect(nodeIds).toEqual(['a0', 'b0']);
        });

        it('should have created a new analysis for the remaining b0', () => {
          expect(this.analysisDefinitionsCollection.pluck('node_id')).toContain('b0');
        });

        it('should delete analysis for C', () => {
          expect(this.analysisDefinitionsCollection.pluck('node_id')).not.toContain('c1');
        });

        it('should delete affected layers', () => {
          expect(this.layerDefinitionsCollection.pluck('id')).toEqual(['A', 'B'], 'only C');
        });

        it('should not affect widgets', () => {
          expect(this.widgetDefinitionsCollection.pluck('source')).toEqual(['b0']);
        });

        it('should delete node', () => {
          expect(this.b1.destroy).toHaveBeenCalled();
        });
      });
    });
  });

  describe('.createLayerFromTable', () => {
    beforeEach(() => {
      interceptAjaxCall = function (params) {
        if (/layers/.test(params.url)) {
          params.success && params.success({
            id: undefined,
            options: {},
            order: 2,
            infowindow: '',
            tooltip: '',
            kind: 'carto'
          });
        }
      };
    });

    it('should create layer with infowindows and tooltips', () => {
      var tableModel = new TableModel({ name: 'tableName' }, { configModel: this.configModel });
      var newLayer = this.userActions.createLayerFromTable(tableModel);
      expect(newLayer.get('infowindow')).toBeDefined();
      expect(newLayer.get('tooltip')).toBeDefined();
    });

    it('should create a new analysis for the source', () => {
      var tableModel = new TableModel({ name: 'foobar' }, { configModel: this.configModel });
      var newLayer = this.userActions.createLayerFromTable(tableModel);
      var analysisDefModel = this.analysisDefinitionsCollection.findWhere({node_id: newLayer.get('source')});
      expect(analysisDefModel).toBeDefined();

      var nodeDefModel = this.analysisDefinitionNodesCollection.get(newLayer.get('source'));
      expect(nodeDefModel).toBeDefined();
      expect(nodeDefModel.attributes).toEqual({
        id: 'a0',
        type: 'source',
        table_name: 'foobar',
        query: 'SELECT * FROM foobar',
        status: 'ready'
      });
    });

    it('should create a new analysis for the source quoting table names if needed', () => {
      var tableModel = new TableModel({ name: '000cd294-b124-4f82-b569-0f7fe41d2db8' }, { configModel: this.configModel });
      var newLayer = this.userActions.createLayerFromTable(tableModel);
      var analysisDefModel = this.analysisDefinitionsCollection.findWhere({node_id: newLayer.get('source')});
      expect(analysisDefModel).toBeDefined();

      var nodeDefModel = this.analysisDefinitionNodesCollection.get(newLayer.get('source'));
      expect(nodeDefModel).toBeDefined();
      expect(nodeDefModel.attributes).toEqual({
        id: 'a0',
        type: 'source',
        table_name: '"000cd294-b124-4f82-b569-0f7fe41d2db8"',
        query: 'SELECT * FROM "000cd294-b124-4f82-b569-0f7fe41d2db8"',
        status: 'ready'
      });
    });

    it('should create a new analysis for the source getting owner name if present', () => {
      var tableModel = new TableModel({ name: '"user".table' }, { configModel: this.configModel });
      this.configModel.set('user_name', 'pepito');
      var newLayer = this.userActions.createLayerFromTable(tableModel);
      var analysisDefModel = this.analysisDefinitionsCollection.findWhere({node_id: newLayer.get('source')});
      expect(analysisDefModel).toBeDefined();

      expect(newLayer.get('table_name')).toBe('table');
      expect(newLayer.get('user_name')).toBe('user');

      var nodeDefModel = this.analysisDefinitionNodesCollection.get(newLayer.get('source'));
      expect(nodeDefModel).toBeDefined();
      expect(nodeDefModel.attributes).toEqual({
        id: 'a0',
        type: 'source',
        table_name: 'user.table',
        query: 'SELECT * FROM user.table',
        status: 'ready'
      });
    });

    it('should create a new analysis for the source passing the table model', () => {
      var tableModel = new TableModel({ name: 'foobar', privacy: 'PRIVATE' }, { configModel: this.configModel });
      var newLayer = this.userActions.createLayerFromTable(tableModel);
      var analysisDefModel = this.analysisDefinitionsCollection.findWhere({node_id: newLayer.get('source')});
      expect(analysisDefModel).toBeDefined();

      var nodeDefModel = this.analysisDefinitionNodesCollection.get(newLayer.get('source'));
      expect(nodeDefModel.tableModel).toBeDefined();
      expect(nodeDefModel.tableModel.get('name')).toEqual('foobar');
      expect(nodeDefModel.tableModel.get('privacy')).toEqual('PRIVATE');
    });

    it('should invoke the success callback if layer is correctly created', () => {
      spyOn(this.layerDefinitionsCollection, 'create');
      var successCallback = jest.createSpy('successCallback');
      var tableModel = new TableModel({ name: 'tableName' }, { configModel: this.configModel });
      this.userActions.createLayerFromTable(tableModel, { success: successCallback });
      this.layerDefinitionsCollection.create.calls.argsFor(0)[1].success();
      expect(successCallback).toHaveBeenCalled();
    });

    it('should add style_properties if geometry is provided', () => {
      var tableModel = new TableModel({ name: 'tableName', geometry_types: ['st_multilinestring'] }, { configModel: this.configModel });
      var layer = this.userActions.createLayerFromTable(tableModel);
      expect(layer.styleModel.get('type')).toBe('simple');
      var stroke = layer.styleModel.get('stroke');
      expect(stroke.color.fixed).toBe('#3EBCAE');

      tableModel.set({
        name: 'tableName',
        geometry_types: ['st_polygon']
      });
      var layer2 = this.userActions.createLayerFromTable(tableModel);
      expect(layer2.styleModel.get('type')).toBe('simple');
      var fill = layer2.styleModel.get('fill');
      expect(fill.color.fixed).toBe('#374C70');
    });

    it('should invoke the error callback if layer creation fails', () => {
      spyOn(this.layerDefinitionsCollection, 'create');
      var errorCallback = jest.createSpy('errorCallback');
      var tableModel = new TableModel({ name: 'tableName' }, { configModel: this.configModel });
      this.userActions.createLayerFromTable(tableModel, { error: errorCallback });
      this.layerDefinitionsCollection.create.calls.argsFor(0)[1].error();
      expect(errorCallback).toHaveBeenCalled();
    });

    it('should place the layer below the "Tiled" layer on top', () => {
      this.layerDefinitionsCollection.add({
        id: 'labels-on-top',
        kind: 'tiled',
        order: 1
      });
      this.layerDefinitionsCollection.add({
        id: 'cartodb-layer',
        kind: 'carto',
        options: {table_name: 'carto'},
        order: 0
      });

      spyOn(this.layerDefinitionsCollection, 'create').and.callThrough();
      spyOn(this.layerDefinitionsCollection, 'save').and.callThrough();

      var tableModel = new TableModel({ name: 'tableName' }, { configModel: this.configModel });
      this.userActions.createLayerFromTable(tableModel);

      expect(this.layerDefinitionsCollection.pluck('id')).toEqual([ 'cartodb-layer', undefined, 'labels-on-top' ]);
      expect(this.layerDefinitionsCollection.pluck('order')).toEqual([ 0, 1, 2 ]);

      // Layer is created successfully
      this.layerDefinitionsCollection.create.calls.argsFor(0)[1].success();

      expect(this.layerDefinitionsCollection.save).toHaveBeenCalled();
    });

    it('should place the layer below the "Torque" layer on top', () => {
      this.layerDefinitionsCollection.add({
        id: 'torque-layer',
        kind: 'torque',
        options: {table_name: 'torque'},
        order: 1
      });
      this.layerDefinitionsCollection.add({
        id: 'cartodb-layer',
        kind: 'carto',
        options: {table_name: 'carto'},
        order: 0
      });

      spyOn(this.layerDefinitionsCollection, 'create').and.callThrough();
      spyOn(this.layerDefinitionsCollection, 'save').and.callThrough();
      var tableModel = new TableModel({ name: 'tableName' }, { configModel: this.configModel });
      this.userActions.createLayerFromTable(tableModel);

      expect(this.layerDefinitionsCollection.pluck('id')).toEqual([ 'cartodb-layer', undefined, 'torque-layer' ]);
      expect(this.layerDefinitionsCollection.pluck('order')).toEqual([ 0, 1, 2 ]);

      // Layer is created successfully
      this.layerDefinitionsCollection.create.calls.argsFor(0)[1].success();
      expect(this.layerDefinitionsCollection.save).toHaveBeenCalled();
    });

    it('should place the new layer above the "CartoDB" layer on top', () => {
      this.layerDefinitionsCollection.add({
        id: 'layer-0',
        kind: 'carto',
        options: {table_name: 'alice'},
        order: 0
      });
      this.layerDefinitionsCollection.add({
        id: 'layer-1',
        kind: 'carto',
        options: {table_name: 'bob'},
        order: 1
      });

      spyOn(this.layerDefinitionsCollection, 'create').and.callThrough();
      spyOn(this.layerDefinitionsCollection, 'save').and.callThrough();

      var tableModel = new TableModel({ name: 'tableName' }, { configModel: this.configModel });
      var newLayer = this.userActions.createLayerFromTable(tableModel);
      newLayer.set('id', 'new-layer');

      expect(this.layerDefinitionsCollection.pluck('id')).toEqual([ 'layer-0', 'layer-1', 'new-layer' ]);
      expect(this.layerDefinitionsCollection.pluck('order')).toEqual([ 0, 1, 2 ]);

      // Layer is created successfully
      this.layerDefinitionsCollection.create.calls.argsFor(0)[1].success();

      // Order of other layers has not been changed
      expect(this.layerDefinitionsCollection.save).toHaveBeenCalled();
    });

    it('should create analysis for all layers that lack one', () => {
      this.layerDefinitionsCollection.add({kind: 'tiled'});

      // Layers w/ analysis
      this.layerA = this.layerDefinitionsCollection.add({
        id: 'layerA',
        kind: 'carto',
        options: {
          letter: 'a',
          source: 'a0'
        }
      });
      this.analysisDefinitionsCollection.add({
        analysis_definition: {
          id: 'a0',
          type: 'source',
          params: {}
        }
      });

      // Layer w/o analysis
      this.layerB = this.layerDefinitionsCollection.add({
        id: 'layerB',
        kind: 'carto',
        options: {
          letter: 'b',
          source: 'b0'
        }
      });

      spyOn(this.analysisDefinitionsCollection, 'saveAnalysisForLayer');

      var tableModel = new TableModel({ name: 'tableName' }, { configModel: this.configModel });
      this.userActions.createLayerFromTable(tableModel);

      // Should create an aalysis for layerB
      expect(this.analysisDefinitionsCollection.saveAnalysisForLayer).toHaveBeenCalled();
      expect(this.analysisDefinitionsCollection.saveAnalysisForLayer.calls.count()).toEqual(2);
      expect(this.analysisDefinitionsCollection.saveAnalysisForLayer.calls.argsFor(0)[0].id).toEqual('layerB');
    });

    it('should place new layer below labels on top and torque if they exists', () => {
      this.layerDefinitionsCollection.add({
        id: 'labels-on-top',
        kind: 'tiled',
        order: 1
      });
      this.layerDefinitionsCollection.add({
        id: 'torque-layer',
        kind: 'torque',
        options: {table_name: 'torque'},
        order: 0
      });

      spyOn(this.layerDefinitionsCollection, 'create').and.callThrough();
      spyOn(this.layerDefinitionsCollection, 'save').and.callThrough();
      var tableModel = new TableModel({ name: 'tableName' }, { configModel: this.configModel });
      this.userActions.createLayerFromTable(tableModel);

      expect(this.layerDefinitionsCollection.pluck('id')).toEqual([ undefined, 'torque-layer', 'labels-on-top' ]);
      expect(this.layerDefinitionsCollection.pluck('order')).toEqual([ 0, 1, 2 ]);

      // Layer is created successfully
      this.layerDefinitionsCollection.create.calls.argsFor(0)[1].success();
      expect(this.layerDefinitionsCollection.save).toHaveBeenCalled();
    });
  });

  describe('.createLayerForAnalysisNode', () => {
    var userActions;

    beforeEach(() => {
      userActions = this.userActions;
      this.analysisDefinitionsCollection.add({
        id: '1st',
        analysis_definition: {
          id: 'a2',
          type: 'trade-area',
          params: {
            source: {
              id: 'a1',
              type: 'buffer',
              params: {
                source: {
                  id: 'a0',
                  type: 'source',
                  params: {
                    query: 'SELECT * FROM something'
                  },
                  options: {
                    table_name: 'something'
                  }
                }
              },
              options: {
                style_history: {
                  layer_with_styles: {
                    options: {
                      tile_style: 'wadus',
                      style_properties: {
                        type: 'wadus'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      this.widgetDefinitionsCollection.add({
        id: 'should-not-change',
        type: 'formula',
        source: {
          id: 'w101'
        }
      });
    });

    it('should not allow to create layer below or on basemap', () => {
      expect(() => { userActions.createLayerForAnalysisNode('a1'); }).toThrowError(/required/);
      expect(() => { userActions.createLayerForAnalysisNode('a1', null); }).toThrowError(/required/);

      expect(() => { userActions.createLayerForAnalysisNode('a1', {}); }).toThrowError(/base layer/);
      expect(() => { userActions.createLayerForAnalysisNode('a1', {at: 0}); }).toThrowError(/base layer/);
      expect(() => { userActions.createLayerForAnalysisNode('a1', {at: null}); }).toThrowError(/base layer/);
    });

    it('should throw an error if given node does not exist', () => {
      expect(() => { userActions.createLayerForAnalysisNode('x1', {at: 0}); }).toThrowError(/does not exist/);
    });

    it('should throw an error if max layers limit is reached', () => {
      var error;
      spyOn(this.layerDefinitionsCollection, 'getNumberOfDataLayers').and.returnValue(4);
      try {
        userActions.createLayerForAnalysisNode('x1', {at: 0});
      } catch (err) {
        error = err;
      }
      expect(error).toBeDefined();
      expect(error.message).toContain('max');
      expect(error.userMaxLayers).toEqual(4);
    });

    describe('when given node is a source node', () => {
      beforeEach(() => {
        this.layerDefinitionsCollection.add([
          {
            id: 'basemap',
            kind: 'tiled',
            order: 0
          }, {
            id: 'layerA',
            order: 1,
            kind: 'carto',
            options: {
              letter: 'a',
              source: 'a0',
              table_name: 'alice',
              table_name_alias: 'alice_alias',
              cartocss: 'wadus',
              style_properties: {
                type: 'wadus'
              }
            }
          }
        ]);

        spyOn(this.layerDefinitionsCollection, 'create').and.callThrough();
        spyOn(this.userActions, '_resetStylePerNode');
        this.userActions.createLayerForAnalysisNode('a0', {at: 1});
        this.newLayerDefModel = this.layerDefinitionsCollection.findWhere({letter: 'b'});
      });

      it('should create a new layer', () => {
        expect(this.layerDefinitionsCollection.pluck('letter')).toEqual([undefined, 'b', 'a'], 'should add new layer at the given at position');
        expect(this.newLayerDefModel.get('letter')).toEqual('b', 'should have new letter');
        expect(this.newLayerDefModel.get('source')).toEqual('a0', 'should have same source');
        expect(this.newLayerDefModel.get('sql')).toEqual('SELECT * FROM alice', 'should have same SQL');
        expect(this.newLayerDefModel.get('table_name')).toEqual('alice', 'should have same table name');
        expect(this.newLayerDefModel.get('table_name_alias')).toEqual('alice_alias', 'should have same table name alias');
        expect(this.newLayerDefModel.get('order')).toEqual(1, 'should be the same as given at position');
        expect(this.newLayerDefModel.get('cartocss')).toEqual('wadus', 'should have same cartocss');
        expect(this.newLayerDefModel.styleModel.get('type')).toEqual('wadus', 'should have same style properties');
      });

      it('should not force-reset styles, they are copied from original layer', () => {
        this.userActions._resetStylePerNode.calls.reset();
        this.layerDefinitionsCollection.create.calls.argsFor(0)[1].success();
        var queryGeometryModel = this.newLayerDefModel.getAnalysisDefinitionNodeModel().queryGeometryModel;
        queryGeometryModel.set({ status: 'fetched', ready: true, simple_geom: 'line' });
        expect(this.userActions._resetStylePerNode).toHaveBeenCalled();
        expect(this.userActions._resetStylePerNode.calls.argsFor(0)[3]).toBeFalsy();
      });

      it('should not change any analysis', () => {
        expect(this.analysisDefinitionNodesCollection.pluck('id')).toEqual(['a0']);
      });
    });

    // Node is NOT a head of a node, e.g. given nodeId is 'a2' this would create a new layer B which takes over the
    // ownership of the given node and its underlying nodes
    //   _______       _______   ______
    //  | A    |      | A    |  | B    |
    //  |      |      |      |  |      |
    //  | [A3] |      | [A3] |  | {B2} |
    //  | {A2} |  =>  | {B2} |  | [B1] |
    //  | [A1] |      |      |  | [B0] |
    //  | [A0] |      |      |  |      |
    //  |______|      |______|  |______|
    describe('when given node is NOT a head of any layer', () => {
      beforeEach(() => {
        this.analysisDefinitionsCollection.reset([{
          id: 'A4',
          analysis_definition: {
            id: 'a4',
            type: 'buffer',
            params: {
              radius: 40,
              source: {
                id: 'a3',
                type: 'buffer',
                params: {
                  radius: 30,
                  source: this.analysisDefinitionNodesCollection.get('a2').toJSON()
                },
                options: {
                  style_history: {
                    l1: {
                      options: {
                        tile_style: 'wadus',
                        style_properties: {
                          type: 'wadus'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }]);
        this.A4 = this.analysisDefinitionsCollection.get('A4');
        spyOn(this.A4, 'save').and.callThrough();

        this.layerDefModel = this.layerDefinitionsCollection.add({
          id: 'l1',
          order: 1,
          kind: 'carto',
          options: {
            table_name: 'foobar',
            table_name_alias: 'alias',
            cartocss: 'before',
            source: 'a4'
          }
        });

        this.widgetDefinitionsCollection.add({
          id: 'should-change',
          type: 'formula',
          source: {
            id: 'a2'
          }
        });

        expect(this.widgetDefinitionsCollection.size()).toBe(2);
        spyOn(this.layerDefinitionsCollection, 'create').and.callThrough();
      });

      describe('and does not have saved styles', () => {
        beforeEach(() => {
          this.userActions.createLayerForAnalysisNode('a2', {at: 2});
        });

        describe('should create new layer with', () => {
          beforeEach(() => {
            expect(this.layerDefinitionsCollection.pluck('letter')).toEqual(['a', 'b']);
            this.newLayerDefModel = this.layerDefinitionsCollection.last();
          });

          it('source pointing to new node', () => {
            expect(this.analysisDefinitionNodesCollection.get('b2')).toBeDefined();
            expect(this.newLayerDefModel.get('source')).toEqual('b2');
          });

          it('table name of prev layer', () => {
            expect(this.newLayerDefModel.get('table_name')).toEqual('foobar');
          });

          it('should set table name alias of prev layer', () => {
            expect(this.newLayerDefModel.get('table_name_alias')).toEqual('alias');
          });
        });

        it('should remove all widgets pointing to the affected node', () => {
          expect(this.widgetDefinitionsCollection.size()).toBe(1);
        });

        it('should still have same unaffected nodes on layer A', () => {
          expect(this.layerDefModel.get('source')).toEqual('a4');
          expect(this.analysisDefinitionNodesCollection.get('a4')).toBeDefined();
          expect(this.analysisDefinitionNodesCollection.get('a3')).toBeDefined();
        });

        it('the head of the moved node should now point to the head of the new layer B', () => {
          expect(this.analysisDefinitionNodesCollection.get('a3').get('source')).toEqual('b2');
        });

        it('should have created new node from the sub-tree of the given node', () => {
          expect(this.analysisDefinitionNodesCollection.get('b2')).toBeDefined();
          expect(this.analysisDefinitionNodesCollection.get('b1')).toBeDefined();
          expect(this.analysisDefinitionNodesCollection.get('b0')).toBeDefined();
        });

        it('should have removed the underlying no-longer-used nodes', () => {
          expect(this.analysisDefinitionNodesCollection.get('a2')).toBeUndefined();
          expect(this.analysisDefinitionNodesCollection.get('a1')).toBeUndefined();
          expect(this.analysisDefinitionNodesCollection.get('a0')).toBeUndefined();
        });

        it('should save the existing analysis', () => {
          expect(this.A4.save).toHaveBeenCalled();
        });

        it('should create a new analysis for new layer', () => {
          expect(this.analysisDefinitionsCollection.pluck('node_id')).toEqual(['a4', 'b2']);
        });

        describe('when created a layer successfully', () => {
          beforeEach(() => {
            spyOn(this.widgetDefinitionsCollection, 'create').and.callThrough();
            this.layerDefinitionsCollection.create.calls.argsFor(0)[1].success();
          });

          it('should recreate all affected widgets', () => {
            expect(this.widgetDefinitionsCollection.create).toHaveBeenCalledWith(
              jest.objectContaining({
                type: 'formula',
                options: jest.objectContaining({
                  sync_on_data_change: true,
                  sync_on_bbox_change: true
                }),
                avoidNotification: true,
                source: jest.objectContaining({
                  id: 'b2'
                }),
                layer_id: undefined,
                order: 1
              }),
              jest.objectContaining({
                wait: true,
                success: jest.any(Function),
                error: jest.any(Function)
              })
            );
          });

          describe('when widgets are created', () => {
            beforeEach(() => {
              spyOn(this.userActions, '_resetStylePerNode');
              spyOn(this.layerDefinitionsCollection, 'save').and.callThrough();
              this.widgetDefinitionsCollection.create.calls.argsFor(0)[1].success();
            });

            it('should reset orders', () => {
              expect(this.layerDefinitionsCollection.pluck('order')).toEqual([0, 1]);
            });

            it('should save layers', () => {
              expect(this.layerDefinitionsCollection.save).toHaveBeenCalled();
            });

            it('should force-reset the styles', () => {
              expect(this.userActions._resetStylePerNode).toHaveBeenCalledWith(jest.anything(), this.layerDefinitionsCollection.at(1), true);
            });
          });
        });
      });

      describe('and does have saved styles', () => {
        beforeEach(() => {
          this.userActions.createLayerForAnalysisNode('a3', {at: 2});
          spyOn(this.widgetDefinitionsCollection, 'create').and.callThrough();
          this.layerDefinitionsCollection.create.calls.argsFor(0)[1].success();
          spyOn(this.userActions, '_resetStylePerNode');
          spyOn(this.layerDefinitionsCollection, 'save').and.callThrough();
          this.widgetDefinitionsCollection.create.calls.argsFor(0)[1].success();
        });

        it('should not force-reset the styles', () => {
          expect(this.userActions._resetStylePerNode).toHaveBeenCalled();
          expect(this.userActions._resetStylePerNode.calls.argsFor(0)[3]).toBeFalsy();
        });
      });
    });

    // Node is head of a layer, e.g. given nodeId A3 it should rename prev layer (A => B), and create a new layer (A)
    // where the prev layer was to take over its letter identity and its primary source (A2).
    // The motivation for this is to maintain the layer's state (styles, popup etc.) which really depends on the
    // last analysis output than the layer itself:
    //   _______       _______   ______
    //  | A    |      | A    |  | B    | <-- note that B is really A which just got moved & had it's nodes renamed
    //  |      |      |      |  |      |
    //  | [A2] |  =>  |      |  | {B1} |
    //  | [A1] |      | [A1] |  | [A1] |
    //  | [A0] |      | [A0] |  |      |
    //  |______|      |______|  |______|
    describe('when given node is head of a layer', () => {
      describe('without saved styles', () => {
        beforeEach(() => {
          this.layerDefModel = this.layerDefinitionsCollection.add({
            id: 'l1',
            order: 1,
            kind: 'carto',
            options: {
              table_name: 'foobar',
              table_name_alias: 'alias',
              cartocss: 'before',
              source: 'a2'
            }
          });
          spyOn(LayerDefinitionModel.prototype, 'save').and.callThrough();
          this.widgetDefinitionsCollection.add({
            layer_id: 'l1',
            id: 'w2',
            type: 'formula',
            source: {
              id: 'a2'
            }
          });
          this.widgetDefinitionsCollection.add({
            layer_id: 'l1',
            id: 'w3',
            type: 'formula',
            source: {
              id: 'a1'
            }
          });
          expect(this.widgetDefinitionsCollection.size()).toBe(3);
        });

        beforeEach(() => {
          spyOn(this.userActions, '_resetStylePerNode');
          this.userActions.createLayerForAnalysisNode('a2', {at: 2});
        });

        it('should have created a new layer that takes over the position of layer with head node', () => {
          expect(this.layerDefinitionsCollection.pluck('letter')).toEqual(['a', 'b']);
        });

        it('should remove all widgets pointing to the affected node', () => {
          expect(this.widgetDefinitionsCollection.size()).toBe(1);
        });

        it('should change the source layer to appear as the new layer B', () => {
          expect(this.layerDefModel.get('letter')).toEqual('b');
          expect(this.layerDefModel.get('source')).toEqual('b1');
        });

        it('should create a new layer which appears to be the source layer A (to preserve styles, popups etc.)', () => {
          var newLayerDefModel = this.layerDefinitionsCollection.at(0);
          expect(newLayerDefModel.get('source')).toEqual('a1');
          expect(newLayerDefModel.get('letter')).toEqual('a');
          expect(newLayerDefModel.get('table_name')).toEqual('foobar');
          expect(newLayerDefModel.get('table_name_alias')).toEqual('alias');
        });

        it('should remove old head node', () => {
          expect(this.analysisDefinitionNodesCollection.get('a2')).toBeUndefined('should no longer exist since replaced by b1');
        });

        it('should have two analyses, one for each layer', () => {
          expect(this.analysisDefinitionsCollection.pluck('node_id')).toEqual(['a1', 'b1']);
        });

        it('should reset styles from the previous layer', () => {
          expect(this.userActions._resetStylePerNode).toHaveBeenCalled();
          expect(this.userActions._resetStylePerNode.calls.argsFor(0)[3]).toBeFalsy();
        });

        describe('when created a layer successfully', () => {
          beforeEach(() => {
            spyOn(this.widgetDefinitionsCollection, 'create').and.callThrough();
            spyOn(this.layerDefinitionsCollection, 'save').and.callThrough();
            LayerDefinitionModel.prototype.save.calls.argsFor(1)[1].success();
          });

          it('should recreate all affected widgets', () => {
            expect(this.widgetDefinitionsCollection.create).toHaveBeenCalled();
            expect(this.widgetDefinitionsCollection.create.calls.count()).toBe(2);
            var calls = this.widgetDefinitionsCollection.create.calls.all();
            var firstWidgetAttrs = calls[0].args[0];
            var secondWidgetAttrs = calls[1].args[0];

            expect(firstWidgetAttrs).toEqual(
              jest.objectContaining({
                layer_id: 'l1',
                type: 'formula',
                options: jest.objectContaining({
                  sync_on_data_change: true,
                  sync_on_bbox_change: true
                }),
                source: jest.objectContaining({
                  id: 'b1'
                }),
                avoidNotification: true,
                order: 1
              })
            );

            expect(secondWidgetAttrs).toEqual(
              jest.objectContaining({
                source: jest.objectContaining({
                  id: 'a1'
                }),
                type: 'formula',
                options: jest.objectContaining({
                  sync_on_data_change: true,
                  sync_on_bbox_change: true
                }),
                avoidNotification: true,
                layer_id: undefined,
                order: 1
              })
            );
          });

          describe('when widgets are created', () => {
            beforeEach(() => {
              _.each(this.widgetDefinitionsCollection.create.calls.all(), function (call) {
                call.args[1].success();
              });
            });

            it('should reset order', () => {
              expect(this.layerDefinitionsCollection.pluck('order')).toEqual([0, 1]);
            });

            it('should save layers', () => {
              expect(this.layerDefinitionsCollection.save).toHaveBeenCalled();
            });

            it('should force-reset the styles', () => {
              expect(this.userActions._resetStylePerNode).toHaveBeenCalledWith(jest.anything(), this.layerDefinitionsCollection.at(0), true);
            });
          });
        });
      });

      describe('with saved styles', () => {
        beforeEach(() => {
          this.layerDefModel = this.layerDefinitionsCollection.add({
            id: 'layer_with_styles',
            order: 1,
            kind: 'carto',
            options: {
              table_name: 'foobar',
              table_name_alias: 'alias',
              cartocss: 'before',
              source: 'a2'
            }
          });
          spyOn(LayerDefinitionModel.prototype, 'save').and.callThrough();
        });

        beforeEach(() => {
          spyOn(this.userActions, '_resetStylePerNode');
          this.userActions.createLayerForAnalysisNode('a2', {at: 2});
        });

        describe('when created a layer successfully', () => {
          beforeEach(() => {
            spyOn(this.widgetDefinitionsCollection, 'create').and.callThrough();
            spyOn(this.layerDefinitionsCollection, 'save').and.callThrough();
            LayerDefinitionModel.prototype.save.calls.argsFor(1)[1].success();
          });

          it('should not force-reset the styles', () => {
            expect(this.userActions._resetStylePerNode).toHaveBeenCalled();
            expect(this.userActions._resetStylePerNode.calls.argsFor(0)[3]).toBeFalsy();
          });

          it('should copy styles from analysis node', () => {
            var newLayerDefModel = this.layerDefinitionsCollection.at(0);
            expect(newLayerDefModel.styleModel.get('type')).toEqual('wadus');
            expect(newLayerDefModel.get('cartocss')).toEqual('wadus');
          });
        });
      });
    });
  });

  describe('.moveLayer', () => {
    beforeEach(() => {
      this.layer1 = this.layerDefinitionsCollection.add({ id: 'layer1', order: 0, kind: 'tiled' });
      this.layer2 = this.layerDefinitionsCollection.add({ id: 'layer2', order: 1, kind: 'carto' });
      this.layer3 = this.layerDefinitionsCollection.add({ id: 'layer3', order: 2, kind: 'carto' });
      this.layer4 = this.layerDefinitionsCollection.add({ id: 'layer4', order: 3, kind: 'carto' });
      this.layer5 = this.layerDefinitionsCollection.add({ id: 'layer5', order: 4, kind: 'carto' });

      this.layerDefinitionsCollection.reset([
        this.layer1,
        this.layer2,
        this.layer3,
        this.layer4,
        this.layer5
      ]);
      this.layerDefinitionsCollection.sort();
      spyOn(this.layerDefinitionsCollection, 'save').and.callThrough();

      this.promise = jest.createSpyObj('$.Deferred', ['done', 'fail']);
      spyOn($.when, 'apply').and.returnValue(this.promise);
    });

    it('should reset orders when moving a layer up', () => {
      this.userActions.moveLayer({ from: 1, to: 3 });

      expect(this.layerDefinitionsCollection.pluck('id')).toEqual([
        'layer1',
        'layer3',
        'layer4',
        'layer2',
        'layer5'
      ]);

      this.promise.done.calls.argsFor(0)[0]();
      expect(this.layerDefinitionsCollection.pluck('order')).toEqual([0, 1, 2, 3, 4]);
    });

    it('should reset orders when moving a layer down', () => {
      this.userActions.moveLayer({ from: 3, to: 1 });

      expect(this.layerDefinitionsCollection.pluck('id')).toEqual([
        'layer1',
        'layer4',
        'layer2',
        'layer3',
        'layer5'
      ]);

      this.promise.done.calls.argsFor(0)[0]();
      expect(this.layerDefinitionsCollection.pluck('order')).toEqual([0, 1, 2, 3, 4]);
    });

    it('should save the collection when analyses are saved', () => {
      this.userActions.moveLayer({ from: 3, to: 1 });

      expect(this.layerDefinitionsCollection.save).not.toHaveBeenCalled();
      this.promise.done.calls.argsFor(0)[0]();
      expect(this.layerDefinitionsCollection.save).toHaveBeenCalled();
    });

    it('should trigger a "layerMoved" event when collection is saved', () => {
      var onAddCallback = jest.createSpy('onAddCallback');
      var onRemoveCallback = jest.createSpy('onRemoveCallback');
      var onLayerMovedCallback = jest.createSpy('onLayerMovedCallback');

      this.layerDefinitionsCollection.on('add', onAddCallback);
      this.layerDefinitionsCollection.on('remove', onRemoveCallback);
      this.layerDefinitionsCollection.on('layerMoved', onLayerMovedCallback);

      this.userActions.moveLayer({ from: 3, to: 1 });

      this.promise.done.calls.argsFor(0)[0]();
      this.layerDefinitionsCollection.save.calls.argsFor(0)[0].success();
      expect(onAddCallback).not.toHaveBeenCalled();
      expect(onRemoveCallback).not.toHaveBeenCalled();
      expect(onLayerMovedCallback).toHaveBeenCalled();
      expect(onLayerMovedCallback.calls.argsFor(0)[0].id).toEqual('layer4');
    });

    it('should create analysis for layers that have a source', () => {
      this.analysisDefinitionNodesCollection.createSourceNode({id: 'a0', tableName: 'foo'});
      this.layer2.set('source', 'a0');
      this.analysisDefinitionNodesCollection.createSourceNode({id: 'b0', tableName: 'bar'});
      this.layer3.set('source', 'b0');

      this.userActions.moveLayer({from: 3, to: 1});

      this.promise.done.calls.argsFor(0)[0]();
      expect(this.analysisDefinitionsCollection.pluck('node_id')).toEqual(['a0', 'b0']);
    });
  });

  describe('.deleteLayer', () => {
    beforeEach(() => {
      /**
       * Layer deletion have a lot of complexity to it, so the before-each has a very complicated setup on purpose,
       * to be able to assert the side-effects of various scenarios and corner cases.
       */
      this.analysisDefinitionsCollection.add([
        {
          id: 'for-layerA',
          analysis_definition: {
            id: 'a1',
            type: 'buffer',
            params: {
              radius: 100,
              source: {
                id: 'a0',
                type: 'source',
                params: {
                  query: 'SELECT * FROM something'
                },
                options: {
                  table_name: 'something'
                }
              }
            }
          }
        }, {
          id: 'for-layerB',
          analysis_definition: {
            id: 'b2',
            type: 'intersection',
            params: {
              source: {
                id: 'b1',
                type: 'buffer',
                params: {
                  radius: 100,
                  source: {
                    id: 'b0',
                    type: 'source',
                    params: {
                      query: 'SELECT * FROM something'
                    }
                  }
                }
              },
              target: {
                id: 'a0' // already added before
              }
            }
          }
        }, {
          id: 'for-layerC',
          analysis_definition: {
            id: 'c2', // already added before
            type: 'buffer',
            params: {
              radius: 100,
              source: {
                id: 'c1',
                type: 'buffer',
                params: {
                  radius: 100,
                  source: {
                    id: 'b2' // alredy added before
                  }
                }
              }
            }
          }
        }, {
          id: 'for-layerD',
          analysis_definition: {
            id: 'd2',
            type: 'intersection',
            params: {
              source: {
                id: 'd1',
                type: 'buffer',
                params: {
                  radius: 100,
                  source: {
                    id: 'c1' // already added before
                  }
                }
              },
              target: {
                id: 'c2', // already added before
                type: 'buffer',
                params: {
                  radius: 100,
                  source: {
                    id: 'c1' // already added before
                  }
                }
              }
            },
            options: {
              primary_source_name: 'source'
            }
          }
        }, {
          id: 'for-layerE',
          analysis_definition: {
            id: 'e1',
            type: 'buffer',
            params: {
              radius: 100,
              source: {
                id: 'c1' // already added --^
              }
            }
          }
        }
      ]);

      this.layerDefModel = this.layerDefinitionsCollection.add([
        {
          id: 'basemap',
          order: 0,
          kind: 'tiled'
        }, {
          id: 'A',
          order: 1,
          kind: 'carto',
          options: {
            letter: 'a',
            table_name: 'something',
            cartocss: 'before',
            source: 'a1'
          }
        }, {
          id: 'B',
          order: 2,
          kind: 'carto',
          options: {
            letter: 'b',
            table_name: 'something',
            cartocss: 'before',
            source: 'b2'
          }
        }, {
          id: 'C',
          order: 3,
          kind: 'carto',
          options: {
            letter: 'c',
            table_name: 'something',
            cartocss: 'before',
            source: 'c2'
          }
        }, {
          id: 'D',
          order: 4,
          kind: 'carto',
          options: {
            letter: 'd',
            table_name: 'something',
            cartocss: 'before',
            source: 'd2'
          }
        }, {
          id: 'E',
          order: 5,
          kind: 'carto',
          options: {
            letter: 'e',
            table_name: 'something',
            cartocss: 'before',
            source: 'e1'
          }
        }
      ]);

      this.widgetDefinitionsCollection.add([
        {
          id: 'w-b1',
          type: 'formula',
          source: {
            id: 'b1'
          }
        }, {
          id: 'w-b2',
          type: 'formula',
          source: {
            id: 'b2'
          }
        }, {
          id: 'w-c1',
          type: 'formula',
          source: {
            id: 'c1'
          }
        }, {
          id: 'w-d2',
          type: 'formula',
          source: {
            id: 'd2'
          }
        }, {
          id: 'w-e1',
          type: 'formula',
          source: {
            id: 'e1'
          }
        }
      ]);

      this.promise = jest.createSpyObj('$.Deferred', ['done', 'fail']);
      spyOn($.when, 'apply').and.returnValue(this.promise);
    });

    describe('when given a basemap', () => {
      beforeEach(() => {
        this.userActions.deleteLayer('basemap');
      });

      it('should throw an error since user should not be able to delete it explicitly', () => {
        expect(this.layerDefinitionsCollection.first().id).toEqual('basemap');
        expect(this.layerDefinitionsCollection.pluck('id')).toEqual(['basemap', 'A', 'B', 'C', 'D', 'E']);
      });
    });

    describe('when given a layer w/o any dependent nodes (E)', () => {
      beforeEach(() => {
        this.successSpy = jest.createSpy('success');
        this.errorSpy = jest.createSpy('error');
        expect(this.layerDefinitionsCollection.get('E').canBeDeletedByUser()).toBe(true, 'should be able to delete layer');

        this.res = this.userActions.deleteLayer('E', {
          success: this.successSpy,
          error: this.errorSpy
        });
      });

      it('should delete the layer', () => {
        expect(this.layerDefinitionsCollection.pluck('id')).toEqual(['basemap', 'A', 'B', 'C', 'D'], 'should exclude E');
      });

      it('should delete affected widgets', () => {
        expect(this.widgetDefinitionsCollection.pluck('source')).toEqual(['b1', 'b2', 'c1', 'd2'], 'should exlude e1');
      });

      it('should have persisted the remaining layers', () => {
        expect(this.analysisDefinitionsCollection.pluck('node_id')).toEqual(['a1', 'b2', 'c2', 'd2'], 'should delete e1');
      });

      it('should delete orphaned nodes', () => {
        expect(this.analysisDefinitionNodesCollection.pluck('id').sort()).toEqual(['a0', 'a1', 'b0', 'b1', 'b2', 'c1', 'c2', 'd1', 'd2'], 'should exclude e1');
      });

      it('should return a promise', () => {
        expect(this.res).toBe(this.promise);
      });
    });

    describe('when given a layer w/o any dependent nodes (D)', () => {
      beforeEach(() => {
        expect(this.layerDefinitionsCollection.get('D').canBeDeletedByUser()).toBe(true, 'should be able to delete layer');
        this.userActions.deleteLayer('D');
      });

      it('should delete the layer', () => {
        expect(this.layerDefinitionsCollection.pluck('id')).toEqual(['basemap', 'A', 'B', 'C', 'E'], 'should exclude D');
      });

      it('should delete affected widgets', () => {
        expect(this.widgetDefinitionsCollection.pluck('source')).toEqual(['b1', 'b2', 'c1', 'e1'], 'should exclude d2');
      });

      it('should persist analyses', () => {
        expect(this.analysisDefinitionsCollection.pluck('node_id')).toEqual(['a1', 'b2', 'c2', 'e1'], 'should exclude d2');
      });

      it('should delete orphaned nodes', () => {
        expect(this.analysisDefinitionNodesCollection.pluck('id').sort()).toEqual(['a0', 'a1', 'b0', 'b1', 'b2', 'c1', 'c2', 'e1'], 'should exclude [d2, d2]');
      });
    });

    describe('when given a layer with a primary dependent layer further down the linked nodes list (C)', () => {
      beforeEach(() => {
        expect(this.layerDefinitionsCollection.get('C').canBeDeletedByUser()).toBe(true, 'should be able to delete layer');
        this.userActions.deleteLayer('C');
      });

      it('should delete affected layers', () => {
        expect(this.layerDefinitionsCollection.pluck('id')).toEqual(['basemap', 'A', 'B', 'E'], 'should exclude [C,D]');
      });

      it('should update the parent layer found with new source', () => {
        expect(this.layerDefinitionsCollection.get('E').get('source')).toEqual('e2');
      });

      it('should updated affected widgets', () => {
        expect(this.widgetDefinitionsCollection
          .map(function (m) {
            return [m.id, m.get('source')];
          }))
          .toEqual([['w-b1', 'b1'], ['w-b2', 'b2'], ['w-c1', 'e1'], ['w-e1', 'e2']], 'should exclude [c2, d2], and changed w-e1 => e2');
      });

      it('should persist analyses and deleted the analysis of the ones that are no longer needed', () => {
        expect(this.analysisDefinitionsCollection.pluck('node_id')).toEqual(['a1', 'b2', 'e2']);
      });

      it('should delete orphaned nodes', () => {
        expect(this.analysisDefinitionNodesCollection.pluck('id').sort()).toEqual(['a0', 'a1', 'b0', 'b1', 'b2', 'e1', 'e2'], 'should exclude [c2, d2, d2]');
      });
    });

    describe('when given layer with a primary dependent layer on the head node (B)', () => {
      beforeEach(() => {
        expect(this.layerDefinitionsCollection.get('B').canBeDeletedByUser()).toBe(true, 'should be able to delete layer');
        this.userActions.deleteLayer('B');
      });

      it('should delete layer', () => {
        expect(this.layerDefinitionsCollection.pluck('id')).toEqual(['basemap', 'A', 'C', 'D', 'E'], 'should exclude B only');
      });

      it('should update the parent layer found with new source', () => {
        expect(this.layerDefinitionsCollection.get('C').get('source')).toEqual('c4');
      });

      it('should updated affected widgets', () => {
        expect(this.widgetDefinitionsCollection
          .map(function (m) {
            return [m.id, m.get('source')];
          }))
          .toEqual([['w-b1', 'c1'], ['w-b2', 'c2'], ['w-c1', 'c3'], ['w-d2', 'd2'], ['w-e1', 'e1']], 'should exclude update sources');
      });

      it('should persist analyses', () => {
        expect(this.analysisDefinitionsCollection.pluck('node_id')).toEqual(['a1', 'c4', 'd2', 'e1']);
      });

      it('should delete orphaned nodes', () => {
        expect(this.analysisDefinitionNodesCollection.pluck('id').sort()).toEqual(['a0', 'a1', 'c0', 'c1', 'c2', 'c3', 'c4', 'd1', 'd2', 'e1'], 'should exclude [b1, b2]');
      });
    });

    describe('when given a layer which all other layers depend on (A)', () => {
      beforeEach(() => {
        spyOn(Backbone.Model.prototype, 'destroy');
        spyOn(Backbone.Model.prototype, 'save');
        spyOn(Backbone.Collection.prototype, 'create');

        expect(this.layerDefinitionsCollection.get('A').canBeDeletedByUser()).toBe(false);
        this.userActions.deleteLayer('A');
      });

      it('should not delete anything', () => {
        expect(this.layerDefinitionsCollection.pluck('id')).toEqual(['basemap', 'A', 'B', 'C', 'D', 'E']);

        expect(Backbone.Model.prototype.destroy).not.toHaveBeenCalled();
        expect(Backbone.Model.prototype.save).not.toHaveBeenCalled();
        expect(Backbone.Collection.prototype.create).not.toHaveBeenCalled();
      });
    });

    describe('when having a layer which source is owned by another layer', () => {
      //   _______   ______    ______
      //  | X    |  | Y    |  | Z    |
      //  |      |  |      |  |      |
      //  | [x0] |  | [x0] |  | [x0] | <-- all layers share the x0 node owned by layer X
      //  |______|  |______|  |______|     test deleting layer X and Y and assert side-effects:
      beforeEach(() => {
        this.analysisDefinitionNodesCollection.createSourceNode({id: 'x0', tableName: 'xena'});
        this.layerX = this.layerDefinitionsCollection.add({
          id: 'X',
          kind: 'carto',
          options: {
            letter: 'x',
            source: 'x0'
          }
        });
        this.layerY = this.layerDefinitionsCollection.add({
          id: 'Y',
          kind: 'carto',
          options: {
            letter: 'y',
            source: 'x0' // ref to ^^^
          }
        });
        this.layerZ = this.layerDefinitionsCollection.add({
          id: 'Z',
          kind: 'carto',
          options: {
            letter: 'z',
            source: 'x0' // ref to ^^^
          }
        });
      });

      describe('when deleting a layer which node is a reference to other source node of other layer', () => {
        beforeEach(() => {
          this.userActions.deleteLayer('Y');
        });

        it('should just delete the layer and leave the nodes alone', () => {
          expect(this.layerDefinitionsCollection.pluck('id')).toEqual(['basemap', 'A', 'B', 'C', 'D', 'E', 'X', 'Z'], 'should exclude Y');
          expect(this.analysisDefinitionNodesCollection.pluck('id').sort()).toEqual(['a0', 'a1', 'b0', 'b1', 'b2', 'c1', 'c2', 'd1', 'd2', 'e1', 'x0'], 'should include x0 in addition to the defaults');
        });
      });

      describe('when deleting the other layer which owns the shared source node', () => {
        beforeEach(() => {
          this.userActions.deleteLayer('X');
        });

        it('should delete the layer of given id', () => {
          expect(this.layerDefinitionsCollection.pluck('id')).toEqual(['basemap', 'A', 'B', 'C', 'D', 'E', 'Y', 'Z'], 'should exclude X');
        });

        it('should move the analysis node to one of the other layers', () => {
          expect(this.analysisDefinitionNodesCollection.pluck('id').sort()).toEqual(['a0', 'a1', 'b0', 'b1', 'b2', 'c1', 'c2', 'd1', 'd2', 'e1', 'y0'], 'should moved x0 to y0');
          expect(this.layerDefinitionsCollection.pluck('source')).toEqual([undefined, 'a1', 'b2', 'c2', 'd2', 'e1', 'y0', 'y0']);
        });
      });
    });

    // https://github.com/CartoDB/cartodb/issues/9168
    describe('when a layer has nodes with larger ids than there are nodes', () => {
      beforeEach(() => {
        this.analysisDefinitionNodesCollection.reset();
        this.analysisDefinitionsCollection.reset();
        this.analysisDefinitionsCollection.add({
          id: '41ceca6d-1b59-45e1-ab9b-0b092fc5cb9d',
          analysis_definition: {
            id: 'a1',
            type: 'kmeans',
            params: {
              source: {
                id: 'a0',
                type: 'source',
                params: {
                  query: 'SELECT * FROM crime_incidents_2016_5'
                },
                options: {
                  table_name: 'crime_incidents_2016_5'
                }
              },
              clusters: 3
            }
          }
        });
        this.analysisDefinitionsCollection.add({
          id: '5fb42f6d-debb-4b0c-bf37-daac79639b57',
          analysis_definition: {
            id: 'b4',
            type: 'intersection',
            params: {
              source: {
                id: 'b3',
                type: 'buffer',
                params: {
                  source: {
                    id: 'c2',
                    type: 'centroid',
                    params: {
                      source: {id: 'a1'},
                      category_column: 'cluster_no'
                    }
                  },
                  radius: 750,
                  isolines: 1,
                  dissolved: false
                },
                options: {
                  kind: 'car',
                  time: '300',
                  distance: 'meters'
                }
              },
              target: {id: 'a1'}
            }
          }
        });
        this.analysisDefinitionsCollection.add({
          id: '312a9e2a-8c59-406b-bd77-588e7e98ebef',
          analysis_definition: {id: 'c2'}
        });
        this.layerDefinitionsCollection.reset();
        this.layerA = this.layerDefinitionsCollection.add({
          id: 'A',
          kind: 'carto',
          options: {
            letter: 'a',
            source: 'a1'
          }
        });
        this.layerB = this.layerDefinitionsCollection.add({
          id: 'B',
          kind: 'carto',
          options: {
            letter: 'b',
            source: 'b4'
          }
        });
        this.layerZ = this.layerDefinitionsCollection.add({
          id: 'C',
          kind: 'carto',
          options: {
            letter: 'c',
            source: 'c2'
          }
        });

        this.userActions.deleteLayer('C');
      });

      it('should fold node c2 under layer B', () => {
        expect(this.layerDefinitionsCollection.pluck('id')).toEqual(['A', 'B'], 'layer C should be deleted');
        expect(this.analysisDefinitionNodesCollection.pluck('id')).toEqual(['a0', 'a1', 'b2', 'b3', 'b4'], 'c2 should not be b2');
        expect(this.analysisDefinitionNodesCollection.get('b3').get('source')).toEqual('b2', 'b3 should point on the renamed node');
        expect(this.analysisDefinitionNodesCollection.get('b2').get('source')).toEqual('a1', 'b2 should still point to the same node');
        expect(this.analysisDefinitionNodesCollection.get('b2').get('type')).toEqual('centroid', 'b2 should be the prev c2');
      });
    });

    // https://github.com/CartoDB/cartodb/issues/10366
    describe('when a layer has to fold things into only one layer', () => {
      beforeEach(() => {
        this.analysisDefinitionNodesCollection.reset();
        this.analysisDefinitionsCollection.reset();
        this.analysisDefinitionsCollection.add({
          id: '41ceca6d-1b59-45e1-ab9b-0b092fc5cb9d',
          analysis_definition: {
            id: 'a2',
            type: 'centroid',
            params: {
              category_column: 'cluster_no',
              source: {
                id: 'b1',
                type: 'kmeans',
                params: {
                  clusters: 3,
                  source: {
                    id: 'b0',
                    type: 'source',
                    options: {
                      table_name: 'ec_kvy'
                    },
                    params: {
                      query: 'SELECT * FROM ec_kvy'
                    }
                  }
                }
              }
            }
          }
        });

        this.analysisDefinitionsCollection.add({
          id: '5fb42f6d-debb-4b0c-bf37-daac79639b57',
          analysis_definition: {
            id: 'b1',
            type: 'kmeans',
            params: {
              clusters: 2,
              source: {
                id: 'b0',
                type: 'source',
                options: {
                  table_name: 'ec_kvy'
                },
                params: {
                  query: 'SELECT * FROM ec_kvy'
                }
              }
            }
          }
        });

        this.layerDefinitionsCollection.reset();
        this.layerA = this.layerDefinitionsCollection.add({
          id: 'A',
          kind: 'carto',
          options: {
            letter: 'a',
            source: 'a2'
          }
        });
        this.layerB = this.layerDefinitionsCollection.add({
          id: 'B',
          kind: 'carto',
          options: {
            letter: 'b',
            source: 'b1'
          }
        });

        this.userActions.deleteLayer('B');
      });

      it('should fold node b1 and b0 under layer A', () => {
        expect(this.layerDefinitionsCollection.pluck('id')).toEqual(['A'], 'layer B should be deleted');
        expect(this.analysisDefinitionNodesCollection.pluck('id')).toEqual(['a0', 'a1', 'a2'], 'b0 and b1 should not be removed, and b1 should be a1 and b0 should be a0');
        expect(this.analysisDefinitionNodesCollection.get('a1').get('source')).toEqual('a0', 'b1 should point on the renamed node');
        expect(this.analysisDefinitionNodesCollection.get('a2').get('source')).toEqual('a1');
      });
    });
  });

  describe('.saveLayer', () => {
    describe('when given layer is a non-data layer', () => {
      beforeEach(() => {
        this.layerDefModel = this.layerDefinitionsCollection.add({
          id: 'basemap',
          kind: 'tiled'
        });
        this.layerDefModel.set('dirty', true);
        spyOn(this.layerDefModel, 'save').and.callThrough();

        this.res = this.userActions.saveLayer(this.layerDefModel);
      });

      it('should only save layer', () => {
        expect(this.layerDefModel.save).toHaveBeenCalled();
      });

      it('should return a promise', () => {
        expect(this.res).toBeDefined();
        expect(this.res.done).toEqual(jest.any(Function));
        expect(this.res.fail).toEqual(jest.any(Function));
      });
    });

    describe('when given layer is a data layer', () => {
      beforeEach(() => {
        this.layerDefModel = this.layerDefinitionsCollection.add({
          id: 'A',
          kind: 'carto',
          options: {
            letter: 'a',
            cartocss: '',
            table_name: 'foobar'
          }
        });
        this.layerDefModel.set('dirty', true);
        spyOn(this.layerDefModel, 'save').and.callThrough();

        this.res = this.userActions.saveLayer(this.layerDefModel);
      });

      it('should layer', () => {
        expect(this.layerDefModel.save).toHaveBeenCalled();
      });

      it('should save analysis', () => {
        expect(this.analysisDefinitionsCollection.pluck('node_id')).toEqual(['a0']);
      });

      it('should return a promise', () => {
        expect(this.res).toBeDefined();
        expect(this.res.done).toEqual(jest.any(Function));
        expect(this.res.fail).toEqual(jest.any(Function));
      });
    });
  });

  describe('.saveWidget', () => {
    beforeEach(() => {
      this.A = this.layerDefinitionsCollection.add({
        id: 'A',
        kind: 'carto',
        options: {
          letter: 'a',
          table_name: 'alice'
        }
      });
      this.B = this.layerDefinitionsCollection.add({
        id: 'B',
        kind: 'carto',
        options: {
          letter: 'b',
          table_name: 'bob'
        }
      });
      spyOn(this.A, 'save').and.callThrough();
      spyOn(this.B, 'save').and.callThrough();

      this.wa0 = this.widgetDefinitionsCollection.add({
        id: 'wa0',
        type: 'formula',
        source: {id: 'a0'}
      });
      this.wa0.set('dirty', true);

      spyOn(this.wa0, 'save').and.callThrough();
    });

    describe('when given a widget which is not tied to a layer', () => {
      beforeEach(() => {
        this.userActions.saveWidget(this.wa0);
      });

      it('should only save widget', () => {
        expect(this.wa0.save).toHaveBeenCalled();
        expect(this.A.save).not.toHaveBeenCalled();
        expect(this.B.save).not.toHaveBeenCalled();
      });
    });

    describe('when given a widget which is tied to a layer', () => {
      beforeEach(() => {
        this.wa0.set('layer_id', 'A');
        this.userActions.saveWidget(this.wa0);
      });

      it('should save widget', () => {
        expect(this.wa0.save).toHaveBeenCalled();
      });

      it('should not save the layer, it is not necessary', () => {
        expect(this.A.save).not.toHaveBeenCalled();
        expect(this.B.save).not.toHaveBeenCalled();
      });

      it('should save analysis', () => {
        expect(this.analysisDefinitionsCollection.pluck('node_id')).toEqual(['a0']);
      });
    });
  });

  describe('smoke tests', () => {
    beforeEach(() => {
      this.analysisSourceOptionsModel = new AnalysisSourceOptionsModel(null, {
        analysisDefinitionNodesCollection: this.analysisDefinitionNodesCollection,
        layerDefinitionsCollection: this.layerDefinitionsCollection,
        tablesCollection: new Backbone.Collection()
      });

      CDB.SQL.prototype.execute = function (query, vars, params) {
        params && params.success({
          rows: [],
          fields: []
        });
      };
    });

    it('Metro Madrid use case', () => {
      this.configModel.dataServiceEnabled = () => {
        return true;
      };

      // create a new map w/ paradas_metro_madrid dataset, playing with styles
      this.basemap = this.layerDefinitionsCollection.add({
        id: 'basemap',
        kind: 'tiled'
      });
      this.layerA = this.layerDefinitionsCollection.add({
        id: 'layerA',
        kind: 'carto',
        options: {
          table_name: 'paradas_metro_madrid'
        }
      });
      this.labelsOnTop = this.layerDefinitionsCollection.add({
        id: 'labels-on-top',
        kind: 'tiled'
      });
      expect(this.layerA.get('letter')).toEqual('a', 'should have a letter representation');
      expect(this.analysisDefinitionsCollection.pluck('node_id')).toEqual([], 'analysis is not persisted initially, for backward compability with old editor');
      expect(this.analysisDefinitionNodesCollection.pluck('id')).toEqual(['a0'], 'should have a node created implicitly for the table of layerA');

      // First, Play with the styles for this layer
      this.layerA.styleModel.setDefaultPropertiesByType('simple', 'point');
      this.userActions.saveLayer(this.layerA);
      expect(this.analysisDefinitionsCollection.pluck('node_id')).toEqual(['a0'], 'should persist the analysis when layer is saved');

      // Add "area of influence" analysis by distance 1km to your layer
      var aFormModel = new AreaOfInfluenceFormModel({
        id: 'a1',
        type: 'buffer',
        radius: '1000',
        source: 'a0',
        distance: 'kilometers'
      }, {
        analyses: analyses,
        configModel: this.configModel,
        layerDefinitionModel: this.layerA,
        analysisSourceOptionsModel: {}
      });
      this.userActions.saveAnalysis(aFormModel);
      expect(this.analysisDefinitionNodesCollection.pluck('id')).toEqual(['a0', 'a1'], 'should create a new node');
      expect(this.analysisDefinitionsCollection.pluck('node_id')).toEqual(['a1'], 'should update analysis of layer to point to new head node');

      // Go to the layer list and drag the AOI node outside the current layer to create a new one.
      this.userActions.createLayerForAnalysisNode('a1', {at: 1});
      expect(this.layerDefinitionsCollection.pluck('letter')).toEqual([undefined, 'b', 'a', undefined], 'should have a new letter representation b for new layer');
      expect(this.analysisDefinitionNodesCollection.pluck('id')).toEqual(['a0', 'b1'], 'should replaced node a1 with b1');
      expect(this.analysisDefinitionsCollection.pluck('node_id')).toEqual(['a0', 'b1'], 'should updated prev layer to have prev node (a0), and created a new analysis for new layer (b1)');

      // Play with the styles for the AOI layer.
      this.layerA.styleModel.setDefaultPropertiesByType('squares', 'point');
      this.userActions.saveLayer(this.layerA);

      // Add a Category Widget to 'Line' column on A0 (Metro stations layer Data Source)
      var categoryWidgetOption = new CategoryWidgetOptionModel({
        type: 'category',
        layer_index: '0',
        title: 'default-title',
        tuples: [{
          columnModel: new Backbone.Model({name: 'line'}),
          layerDefinitionModel: this.layerA,
          analysisDefinitionNodeModel: this.analysisDefinitionNodesCollection.get('a0')
        }]
      });
      interceptAjaxCall = function (params) {
        if (/widgets/.test(params.url)) {
          params.success({
            id: 'a0-line-category',
            type: 'category',
            title: 'default-title',
            order: 1,
            layer_id: 'layerA',
            options: {
              column: 'line',
              aggregation_column: 'line',
              aggregation: 'count',
              sync_on_data_change: true,
              sync_on_bbox_change: true
            },
            source: {id: 'a0'}
          });
        }
      };
      this.userActions.saveWidgetOption(categoryWidgetOption);
      expect(this.widgetDefinitionsCollection.pluck('title')).toEqual(['default-title']);
      expect(this.widgetDefinitionsCollection.pluck('id')).toEqual(['a0-line-category']);

      // Change the widget name to "Stations per Line"
      var lineCategoryWidget = this.widgetDefinitionsCollection.get('a0-line-category');
      lineCategoryWidget.set('title', 'Stations per line');
      interceptAjaxCall = function (params) {
        if (/widgets/.test(params.url)) {
          params.success({
            id: 'a0-line-category',
            title: 'Stations per line'
          });
        }
      };
      this.userActions.saveWidget(lineCategoryWidget);
      expect(this.widgetDefinitionsCollection.pluck('title')).toEqual(['Stations per line']);

      // Skipped these because can't do the assertions of cartodb.js here
      // Filter by L1 on the Widget. This will only show metro stations and AOIs for that line (Isn't this cool??)
      // Add a Category Widget to 'Name' column on A0 (Metro stations layer Data Source)

      // A new Data Layer with lines should appear in your layer list now.
      interceptAjaxCall = function (params) {
        if (/layers/.test(params.url)) {
          params.success && params.success({
            id: 'metro_lines',
            order: 1,
            infowindow: {},
            tooltip: {},
            kind: 'carto'
          });
        }
      };
      var tableModel = new TableModel({ name: 'metro_lines' }, { configModel: this.configModel });
      this.userActions.createLayerFromTable(tableModel);
      expect(this.layerDefinitionsCollection.pluck('id')).toEqual(['basemap', 'layerA', undefined, 'metro_lines', 'labels-on-top']);
      expect(this.layerDefinitionsCollection.pluck('source')).toEqual([undefined, 'b1', 'a0', 'c0', undefined]);
      expect(this.analysisDefinitionsCollection.pluck('node_id')).toEqual(['a0', 'b1', 'c0']);

      aFormModel = new FilterByNodeColumnFormModel({
        id: 'c1',
        type: 'filter-by-node-column',
        source: 'c0',
        column: 'name',
        filter_source: 'b1',
        filter_column: 'line'
      }, {
        analyses: analyses,
        configModel: this.configModel,
        layerDefinitionModel: this.layerDefinitionsCollection.findWhere({letter: 'c'}),
        analysisSourceOptionsModel: this.analysisSourceOptionsModel
      });
      this.userActions.saveAnalysis(aFormModel);
      expect(this.analysisDefinitionNodesCollection.pluck('id')).toEqual(['a0', 'b1', 'c0', 'c1'], 'should add new node c1');
      expect(this.analysisDefinitionsCollection.pluck('node_id')).toEqual(['a0', 'b1', 'c1'], 'should updated existing analysis (c0 => c1)');

      // Stopping here, since remaining stuff can't be verified anyway
    });
  });
});
