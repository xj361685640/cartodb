var Backbone = require('backbone');
var ConfigModel = require('../../../../../../javascripts/cartodb3/data/config-model');
var UserModel = require('../../../../../../javascripts/cartodb3/data/user-model');
var QuerySchemaModel = require('../../../../../../javascripts/cartodb3/data/query-schema-model');
var AnalysisDefinitionNodesCollection = require('../../../../../../javascripts/cartodb3/data/analysis-definition-nodes-collection');
var EditFeatureActionView = require('../../../../../../javascripts/cartodb3/editor/layers/edit-feature-content-views/edit-feature-action-view');
var EditFeatureGeometryFormModel = require('../../../../../../javascripts/cartodb3/editor/layers/edit-feature-content-views/edit-feature-geometry-form-model');
var EditFeatureAttributesFormModel = require('../../../../../../javascripts/cartodb3/editor/layers/edit-feature-content-views/edit-feature-attributes-form-model');
var QueryColumnsCollection = require('../../../../../../javascripts/cartodb3/data/query-columns-collection');
var LayerDefinitionsCollection = require('../../../../../../javascripts/cartodb3/data/layer-definitions-collection');

describe('editor/layers/edit-feature-content-views/edit-feature-action-view', () => {
  beforeEach(() => {
    this.configModel = new ConfigModel({
      base_url: '/u/pepe',
      user_name: 'pepe'
    });
    this.userModel = new UserModel({}, {
      configModel: this.configModel
    });

    this.querySchemaModel = new QuerySchemaModel({}, {
      configModel: this.configModel
    });

    var analysisDefinitionNodesCollection = new AnalysisDefinitionNodesCollection(null, {
      configModel: this.configModel,
      userModel: this.userModel
    });

    var layerDefinitionsCollection = new LayerDefinitionsCollection(null, {
      configModel: this.configModel,
      userModel: this.userModel,
      analysisDefinitionNodesCollection: analysisDefinitionNodesCollection,
      mapId: 'm-123',
      stateDefinitionModel: {}
    });
    layerDefinitionsCollection.add({
      id: 'l-1',
      kind: 'carto',
      options: {
        table_name: 'foo'
      }
    });
    var layerDefinitionModel = layerDefinitionsCollection.at(0);

    this.columnsCollection = new QueryColumnsCollection([
      {
        name: 'cartodb_id',
        type: 'number'
      }, {
        name: 'name',
        type: 'string'
      }, {
        name: 'description',
        type: 'string'
      }, {
        name: 'the_geom',
        type: 'geometry'
      }
    ], {
      querySchemaModel: this.querySchemaModel,
      configModel: this.configModel
    });

    this.featureModel = new Backbone.Model({
      the_geom: '{"type":"LineString","coordinates":[[0,0],[0,1]]}',
      name: '',
      description: ''
    });

    this.geometryFormModel = new EditFeatureGeometryFormModel(this.featureModel.toJSON(), {
      featureModel: this.featureModel
    });

    this.attributesFormModel = new EditFeatureAttributesFormModel(this.featureModel.toJSON(), {
      featureModel: this.featureModel,
      columnsCollection: this.columnsCollection,
      configModel: this.configModel,
      nodeDefModel: layerDefinitionModel.getAnalysisDefinitionNodeModel()
    });

    this.model = new Backbone.Model({
      hasChanges: false,
      isValidAttributes: true,
      isValidGeometry: true
    });

    this.view = new EditFeatureActionView({
      model: this.model,
      featureModel: this.featureModel,
      geometryFormModel: this.geometryFormModel,
      attributesFormModel: this.attributesFormModel
    });
    this.view.render();
  });

  it('should render properly', () => {
    expect(this.view.$('.js-save').length).toBe(1);
  });

  it('button should be disabled by default', () => {
    expect(this.view.$el.html()).toContain('is-disabled');
  });

  it('should update model if feature changes', () => {
    expect(this.model.get('hasChanges')).toBe(false);
    this.featureModel.set('the_geom', '{"type":"LineString","coordinates":[[0,0],[1,1]]}');
    expect(this.model.get('hasChanges')).toBe(true);
  });

  describe('when is new', () => {
    beforeEach(() => {
      this.featureModel.isNew = () => { return true; };
    });

    it('button should be add', () => {
      expect(this.view.$el.html()).toContain('editor.edit-feature.add');
    });
  });

  describe('when feature already exists', () => {
    beforeEach(() => {
      this.featureModel.isNew = () => { return false; };

      this.view.render();
    });

    it('button should be save', () => {
      expect(this.view.$el.html()).toContain('editor.edit-feature.save');
    });
  });

  describe('save feature', () => {
    beforeEach(() => {
      spyOn(this.featureModel, 'save');
    });

    describe('when has no changes', () => {
      beforeEach(() => {
        this.view.$('.js-save').click();
      });

      it('button should be disabled', () => {
        expect(this.view.$el.html()).toContain('is-disabled');
      });
    });

    describe('when has changes', () => {
      beforeEach(() => {
        this.model.set('hasChanges', true);

        this.view.$('.js-save').click();
      });

      it('should save the feature model', () => {
        expect(this.featureModel.save).toHaveBeenCalled();
      });

      describe('when save succeeds', () => {
        beforeEach(() => {
          this.featureModel.save.calls.argsFor(0)[0].success();
        });

        it('should update changes', () => {
          expect(this.model.get('hasChanges')).toBe(false);
        });
      });

      describe('when save fails', () => {
        beforeEach(() => {
          this.featureModel.save.calls.argsFor(0)[0].error();
        });

        it('should not have changes', () => {
          expect(this.model.get('hasChanges')).toBe(true);
        });
      });
    });
  });

  it('should have no leaks', () => {
    expect(this.view).toHaveNoLeaks();
  });
});
