var Backbone = require('backbone');
var _ = require('underscore');
var camshaftReferenceAnalyses = require('camshaft-reference').getVersion('latest').analyses;
var analysisOptions = require('../../../../../../javascripts/cartodb3/components/modals/add-analysis/analysis-options');
var Analyses = require('../../../../../../javascripts/cartodb3/data/analyses');
var DataServicesApiCheck = require('../../../../../../javascripts/cartodb3/editor/layers/layer-content-views/analyses/analyses-quota/analyses-quota-info');

describe('cartodb3/components/modals/add-analysis/analysis-options', () => {
  var configModel = new Backbone.Model({
    user_name: 'foo',
    sql_api_template: 'foo',
    api_key: 'foo'
  });
  var userModel = new Backbone.Model();
  userModel.featureEnabled = () => { return true; };
  configModel.dataServiceEnabled = () => { return true; };

  DataServicesApiCheck.get(configModel)._state = 'fetched';

  it('should not add generated option if feature flag is disabled', () => {
    userModel.featureEnabled = () => { return false; };
    configModel.dataServiceEnabled = () => { return false; };
    var defaultAnalysisOptions = analysisOptions(Analyses, userModel, configModel);
    expect(defaultAnalysisOptions['generated']).toBeUndefined('should not have any generated options');
  });

  describe('each category (including generated)', () => {
    var options = analysisOptions(Analyses, userModel, configModel);

    _.each(options, function (item, category) {
      it('should have a key', () => {
        expect(category).toEqual(jest.any(String));
      });

      describe('category: ' + category, () => {
        describe('should have a definition', () => {
          var def = options[category];

          beforeEach(() => {
            expect(def).toEqual(jest.any(Object));
          });

          it('should have a title', () => {
            expect(def.title).toEqual(jest.any(String));
          });

          it('should have analyses', () => {
            expect(def.analyses).toEqual(jest.any(Array));
            expect(def.analyses.length).toBeGreaterThan(0);
          });

          describe('each analysis', () => {
            def.analyses.forEach(function (d) {
              describe('analysis: ' + d.title, () => {
                it('should have a title', () => {
                  expect(d.title).toEqual(jest.any(String));
                });

                it('should have a description', () => {
                  expect(d.desc).toEqual(jest.any(String));
                });

                it('should have attrs to create a node from', () => {
                  expect(d.nodeAttrs).toEqual(jest.any(Object));
                });

                it('should have at least a type', () => {
                  expect(d.nodeAttrs.type).toEqual(jest.any(String));
                  expect(camshaftReferenceAnalyses[d.nodeAttrs.type]).toBeDefined();
                });
              });
            });
          });
        });
      });
    });
  });
});
