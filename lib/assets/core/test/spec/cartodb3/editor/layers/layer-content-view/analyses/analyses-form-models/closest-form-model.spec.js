var Backbone = require('backbone');
var cdb = require('cartodb.js');
var Model = require('../../../../../../../../javascripts/cartodb3/editor/layers/layer-content-views/analyses/analysis-form-models/closest-form-model');
var BaseAnalysisFormModel = require('../../../../../../../../javascripts/cartodb3/editor/layers/layer-content-views/analyses/analysis-form-models/base-analysis-form-model');
var analyses = require('../../../../../../../../javascripts/cartodb3/data/analyses');

describe('editor/layers/layer-content-views/analyses/analysis-form-models/closest-form-model', () => {
  var cdbSQLBackup;

  beforeEach(() => {
    this.configModel = new Backbone.Model({});

    this.layerDefinitionModel = new Backbone.Model({});
    this.layerDefinitionModel.findAnalysisDefinitionNodeModel = () => {
      var node = {
        id: 808,
        letter: () => { return 'A'; },
        querySchemaModel: new Backbone.Model({
          query: 'SELECT * FROM somewhere;'
        })
      };
      return node;
    };
    this.layerDefinitionModel.getName = () => { return 'Metro Madrid'; };

    this.analysisSourceOptionsModel = new Backbone.Model({
      fetching: false
    });
    this.analysisSourceOptionsModel.getSelectOptions = () => {
      return [];
    };
    this.analysisSourceOptionsModel.createSourceNodeUnlessExisting = () => {};

    cdbSQLBackup = cdb.SQL;
    cdb.SQL = () => {
      return {
        execute: () => {}
      };
    };

    this.initializeOptions = {
      analyses: analyses,
      configModel: this.configModel,
      layerDefinitionModel: this.layerDefinitionModel,
      analysisSourceOptionsModel: this.analysisSourceOptionsModel
    };

    this.model = new Model(null, this.initializeOptions);
  });

  afterEach(() => {
    cdb.SQL = cdbSQLBackup;
  });

  describe('parse', () => {
    it('should set default value to responses property', () => {
      var parsed = this.model.parse({});

      expect(parsed.responses).toBe(1);
    });

    it('should not modify responses propertyif present', () => {
      var parsed = this.model.parse({responses: 32});

      expect(parsed.responses).toBe(32);
    });
  });

  describe('initialize', () => {
    it('should call proper function and hook events', () => {
      spyOn(BaseAnalysisFormModel.prototype, 'initialize');
      spyOn(this.model, '_resetColumnOptions');
      spyOn(this.model, '_initBinds');
      spyOn(this.model, '_setSchema');
      spyOn(this.model, '_fetchColumns');

      this.model.initialize(null, this.initializeOptions);

      expect(BaseAnalysisFormModel.prototype.initialize).toHaveBeenCalled();
      expect(this.model._resetColumnOptions).toHaveBeenCalled();
      expect(this.model._initBinds).toHaveBeenCalled();
      expect(this.model._setSchema).toHaveBeenCalled();
      expect(this.model._fetchColumns).toHaveBeenCalled();
    });
  });

  describe('_initBinds', () => {
    it('should hook up change:fetching and change:target events', () => {
      spyOn(this.model, '_onSourceOptionsFetched');

      this.model._initBinds();
      this.model._analysisSourceOptionsModel.set('fetching', true);

      expect(this.model._events['change:target']).toBeDefined();
      expect(this.model._onSourceOptionsFetched).toHaveBeenCalled();
    });
  });

  describe('.getTemplate', () => {
    it('should return the template', () => {
      var template = this.model.getTemplate();

      var templateContent = template();
      expect(templateContent.indexOf('<form>')).toBeGreaterThan(-1);
      expect(templateContent.indexOf('data-fields="source,target"')).toBeGreaterThan(-1);
      expect(templateContent.indexOf('data-fields="responses,category"')).toBeGreaterThan(-1);
    });
  });

  describe('.getTemplateData', () => {
    it('should return an empty object', () => {
      var templateData = this.model.getTemplateData();

      expect(templateData).toEqual({});
    });
  });

  describe('._resetColumnOptions', () => {
    it('should reset _columnOptions and hook up "columnsFetched" event', () => {
      this.model._columnOptions.set('aProperty', 'some value');
      spyOn(this.model, '_onColumnsFetched');

      this.model._resetColumnOptions();
      this.model._columnOptions.trigger('columnsFetched');

      expect(this.model._columnOptions.aProperty).not.toBeDefined();
      expect(this.model._onColumnsFetched).toHaveBeenCalled();
    });
  });

  describe('._onSourceOptionsFetched', () => {
    it('should call _setSchema', () => {
      spyOn(this.model, '_setSchema');

      this.model._onSourceOptionsFetched();

      expect(this.model._setSchema).toHaveBeenCalled();
    });
  });

  describe('._setSchema', () => {
    it('should call _setSchema of BaseAnalysisFormModel with proper schema', () => {
      spyOn(BaseAnalysisFormModel.prototype, '_setSchema');
      spyOn(this.model, '_primarySourceSchemaItem').and.callFake(function (title) {
        return title;
      });
      spyOn(this.model, '_getSourceOptionsForSource').and.callFake(function (sourceAttrName) {
        return sourceAttrName;
      });
      spyOn(this.model, '_isSourceDisabled').and.callFake(function (source) {
        return 'called with ' + source;
      });
      spyOn(this.model._columnOptions, 'filterByType').and.callFake(function (type) { return type; });

      var expectedSchema = {
        source: 'editor.layers.analysis-form.find-nearest.input',
        target: {
          type: 'NodeDataset',
          title: 'editor.layers.analysis-form.find-nearest.target',
          options: {sourceAttrName: 'target', includeSourceNode: true},
          dialogMode: 'float',
          validators: ['required'],
          editorAttrs: {
            disabled: 'called with target'
          }
        },
        category: {
          type: 'EnablerEditor',
          title: '',
          label: 'editor.layers.analysis-form.find-nearest.categorized',
          help: 'editor.layers.analysis-form.find-nearest.categorized-help',
          editor: {
            type: 'Select',
            options: 'string',
            dialogMode: 'float',
            editorAttrs: {
              showLabel: false
            }
          }
        },
        responses: {
          type: 'Number',
          title: 'editor.layers.analysis-form.find-nearest.max-results',
          value: 1,
          validators: ['required', {
            type: 'interval',
            min: 1,
            max: 32
          }]
        }
      };

      this.model._setSchema();

      expect(BaseAnalysisFormModel.prototype._setSchema).toHaveBeenCalledWith(expectedSchema);
    });
  });

  describe('._isSourceDisabled', () => {
    it('should return if attr is primary source or it is fetching, combination 1', () => {
      spyOn(this.model, '_isPrimarySource').and.returnValue(true);
      spyOn(this.model, '_isFetchingOptions').and.returnValue(false);

      var result = this.model._isSourceDisabled('target');

      expect(this.model._isPrimarySource).toHaveBeenCalledWith('target');
      expect(result).toBe(true);
    });

    it('should return if attr is primary source or it is fetching, combination 2', () => {
      spyOn(this.model, '_isPrimarySource').and.returnValue(false);
      spyOn(this.model, '_isFetchingOptions').and.returnValue(true);

      var result = this.model._isSourceDisabled('target');

      expect(this.model._isFetchingOptions).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return if attr is primary source or it is fetching, combination 3', () => {
      spyOn(this.model, '_isPrimarySource').and.returnValue(false);
      spyOn(this.model, '_isFetchingOptions').and.returnValue(false);

      var result = this.model._isSourceDisabled('target');

      expect(result).toBe(false);
    });
  });

  describe('._onChangeTarget', () => {
    it('should reset category and fetch columnds', () => {
      this.model.set('target', 'madrid');
      spyOn(this.model, '_setSchema');
      spyOn(this.model, '_fetchColumns');
      spyOn(this.model._analysisSourceOptionsModel, 'createSourceNodeUnlessExisting');

      this.model._onChangeTarget();

      expect(this.model.get('category')).toEqual('');
      expect(this.model._setSchema).toHaveBeenCalled();
      expect(this.model._analysisSourceOptionsModel.createSourceNodeUnlessExisting).toHaveBeenCalledWith('madrid');
      expect(this.model._fetchColumns).toHaveBeenCalled();
    });
  });

  describe('._fetchColumns', () => {
    beforeEach(() => {
      this.model.set('target', 'a layer');
      this.layerDefinitionModel.findAnalysisDefinitionNodeModel = () => {};
    });

    it('should set node in columnOptions if target is a node', () => {
      spyOn(this.model._layerDefinitionModel, 'findAnalysisDefinitionNodeModel').and.returnValue('node');
      spyOn(this.model._columnOptions, 'setNode');

      this.model._fetchColumns();

      expect(this.model._layerDefinitionModel.findAnalysisDefinitionNodeModel).toHaveBeenCalledWith('a layer');
      expect(this.model._columnOptions.setNode).toHaveBeenCalledWith('node');
    });

    it('should set target dataset in columnOptions if target is a dataset', () => {
      spyOn(this.model._layerDefinitionModel, 'findAnalysisDefinitionNodeModel').and.returnValue(null);
      spyOn(this.model._columnOptions, 'setDataset');

      this.model._fetchColumns();

      expect(this.model._layerDefinitionModel.findAnalysisDefinitionNodeModel).toHaveBeenCalledWith('a layer');
      expect(this.model._columnOptions.setDataset).toHaveBeenCalledWith('a layer');
    });
  });

  describe('._onColumnsFetched', () => {
    it('should call _setSchema', () => {
      spyOn(this.model, '_setSchema');

      this.model._onColumnsFetched();

      expect(this.model._setSchema).toHaveBeenCalled();
    });
  });
});
