var Backbone = require('backbone');
var _ = require('underscore');
var analyses = require('../../../../javascripts/cartodb3/data/analyses');
var ConfigModel = require('../../../../javascripts/cartodb3/data/config-model');
var DataServicesApiCheck = require('../../../../javascripts/cartodb3/editor/layers/layer-content-views/analyses/analyses-quota/analyses-quota-info');
var camshaftReference = require('camshaft-reference').getVersion('latest');
var UnknownTypeFormModel = require('../../../../javascripts/cartodb3/editor/layers/layer-content-views/analyses/analysis-form-models/unknown-type-form-model');
var FallbackFormModel = require('../../../../javascripts/cartodb3/editor/layers/layer-content-views/analyses/analysis-form-models/fallback-form-model');

describe('cartodb3/data/analysesjs', () => {
  Object.keys(analyses.MAP).forEach(function (key) {
    var def = analyses.MAP[key];

    describe(key + ' item', () => {
      it('should have a title', () => {
        expect(def.title).toEqual(jest.any(String));
      });

      it('should have a FormModel', () => {
        expect(def.FormModel).toEqual(jest.any(Function));
      });
    });
  }, this);

  describe('getAnalysesByModalCategory', () => {
    beforeEach(() => {
      this.configModel = new ConfigModel({
        user_name: 'foo',
        sql_api_template: 'foo',
        api_key: 'foo',
        dataservices_enabled: {
          geocoder_internal: true,
          hires_geocoder: true,
          isolines: true,
          routing: true,
          data_observatory: true
        }
      });

      this.userModel = new Backbone.Model();
    });

    describe('data observatory', () => {
      afterEach(() => {
        DataServicesApiCheck.get(this.configModel)._ready = 'ready';
      });

      var findDataObservatory = function (models) {
        return _.filter(models, function (model) {
          return model.nodeAttrs.type === 'data-observatory-measure';
        });
      };

      it('dataservices api existing', () => {
        DataServicesApiCheck.get(this.configModel)._ready = 'ready';
        var analysisModels = analyses.getAnalysesByModalCategory('create_clean', this.configModel, this.userModel);
        expect(analysisModels.length).toBe(4);
        expect(findDataObservatory(analysisModels).length).toBe(1);
      });

      it('dataservices api not existing', () => {
        DataServicesApiCheck.get(this.configModel)._ready = 'notready';
        var analysisModels = analyses.getAnalysesByModalCategory('create_clean', this.configModel, this.userModel);
        expect(analysisModels.length).toBe(3);
        expect(findDataObservatory(analysisModels).length).toBe(0);
      });
    });
  });

  describe('.findFormModelByType', () => {
    describe('when given an unknown type', () => {
      it('should return an unknown model', () => {
        expect(analyses.findFormModelByType('unknown-indeed')).toBe(UnknownTypeFormModel);
        expect(analyses.findFormModelByType()).toBe(UnknownTypeFormModel);
        expect(analyses.findFormModelByType({})).toBe(UnknownTypeFormModel);
        expect(analyses.findFormModelByType(true)).toBe(UnknownTypeFormModel);
        expect(analyses.findFormModelByType(false)).toBe(UnknownTypeFormModel);
      });
    });

    describe('when given a type which is not implemented (yet)', () => {
      beforeEach(() => {
        camshaftReference.analyses['just-for-testing'] = {};
      });

      afterEach(() => {
        delete camshaftReference['just-for-testing'];
      });

      it('should return fallback model', () => {
        expect(analyses.findFormModelByType('just-for-testing')).toBe(FallbackFormModel);
      });
    });

    describe('when given an implemented type', () => {
      it('should return its formModel', () => {
        var BufferFormModel = analyses.findFormModelByType('buffer');
        expect(BufferFormModel).toBeDefined();
        expect(BufferFormModel).not.toBe(UnknownTypeFormModel);
        expect(BufferFormModel).not.toBe(FallbackFormModel);
      });
    });
  });

  describe('.title', () => {
    describe('when given an unknown type', () => {
      it('should return unknown title', () => {
        expect(analyses.title()).toEqual('analyses.unknown');
        expect(analyses.title('')).toEqual('analyses.unknown');
        expect(analyses.title({})).toEqual('analyses.unknown');
        expect(analyses.title(true)).toEqual('analyses.unknown');
      });
    });

    describe('when given a type which is not implemented (yet)', () => {
      beforeEach(() => {
        camshaftReference.analyses['just-for-testing'] = {};
      });

      afterEach(() => {
        delete camshaftReference['just-for-testing'];
      });

      it('should return the default for type', () => {
        expect(analyses.title('just-for-testing')).toEqual('analyses.just-for-testing');
      });
    });

    describe('when given a implemented type', () => {
      it('should return a corresponding title', () => {
        expect(analyses.title('buffer')).toEqual(jest.any(String));
        expect(analyses.title('buffer')).not.toContain('unknown');
      });
    });

    describe('when given a DO analysis', () => {
      it('should return the measurement as the title for the DO analysis if implemented', () => {
        var model = new Backbone.Model({
          type: 'data-observatory-measure',
          measurement: 'age-and-gender'
        });
        expect(analyses.title(model)).toEqual('analyses.data-observatory-measure.age-and-gender');
      });

      it('should return the default title if the measurement is not implemented', () => {
        var model = new Backbone.Model({
          type: 'data-observatory-measure',
          measurement: 'something-very-new'
        });
        expect(analyses.title(model)).toEqual('analyses.data-observatory-measure.short-title');
      });
    });

    describe('when given a model', () => {
      it('should return the corresponding title', () => {
        var model = new Backbone.Model({type: 'buffer'});
        expect(analyses.title(model)).toEqual(jest.any(String));
        expect(analyses.title(model)).not.toContain('unknown');
        expect(analyses.title(model)).toEqual(analyses.title('buffer'));
      });
    });
  });

  describe('MAP', () => {
    it('should have right properties for closest analysis', () => {
      expect(analyses.MAP.closest).toBeDefined();
      expect(analyses.MAP.closest.modalTitle).toEqual('editor.layers.analysis-form.find-nearest.modal-title');
      expect(analyses.MAP.closest.modalDesc).toEqual('editor.layers.analysis-form.find-nearest.modal-desc');
      expect(analyses.MAP.closest.modalCategory).toEqual('analyze_predict');
      expect(analyses.MAP.closest.onboardingTemplate).toEqual(jest.any(Function));
    });
  });

  describe('checkIfxxx several checks', () => {
    var checkIfxxxTest = function (testTypes, dataServicesFlag) {
      var readyCalled = false;
      var fakeDS = {
        isReady: () => {
          readyCalled = true;
          return true;
        }
      };
      spyOn(DataServicesApiCheck, 'get').and.returnValue(fakeDS);
      _.each(testTypes, function (analysisType) {
        var checkIfEnabled = analyses.MAP[analysisType].checkIfEnabled;
        var configModel = {
          dataServiceEnabled: () => {}
        };
        spyOn(configModel, 'dataServiceEnabled').and.returnValue(true);
        readyCalled = false;

        expect(checkIfEnabled).toBeDefined();

        var result = checkIfEnabled(configModel);

        expect(result).toBe(true);
        expect(readyCalled).toBe(true);
        expect(configModel.dataServiceEnabled).toHaveBeenCalledWith(dataServicesFlag);
      });
    };

    it('analyses that needs georeference should check dataservices', () => {
      var geoReferenceAnalyses = [
        'georeference-city',
        'georeference-ip-address',
        'georeference-country',
        'georeference-postal-code',
        'georeference-admin-region'
      ];
      checkIfxxxTest(geoReferenceAnalyses, 'geocoder_internal');
    });

    it('analyses that needs routing should check dataservices', () => {
      var routingAnalyses = [
        'routing-sequential',
        'routing-to-layer-all-to-all',
        'routing-to-single-point'
      ];
      checkIfxxxTest(routingAnalyses, 'routing');
    });

    it('analyses that needs external geocoding should check dataservices', () => {
      var externalGeocodingAnalyses = [
        'georeference-street-address'
      ];
      checkIfxxxTest(externalGeocodingAnalyses, 'hires_geocoder');
    });

    it('analyses that needs Data Observatory should check dataservices', () => {
      var externalGeocodingAnalyses = [
        'data-observatory-measure'
      ];
      checkIfxxxTest(externalGeocodingAnalyses, 'data_observatory');
    });
  });

  describe('isAnalysisValidByType', () => {
    it('should call `checkIfEnabled` if the analysis has a `checkIf` function', () => {
      var theAnalysis = analyses.MAP['georeference-city'];
      spyOn(theAnalysis, 'checkIfEnabled').and.returnValue(true);

      analyses.isAnalysisValidByType('georeference-city');

      expect(theAnalysis.checkIfEnabled).toHaveBeenCalled();
    });
  });
});
