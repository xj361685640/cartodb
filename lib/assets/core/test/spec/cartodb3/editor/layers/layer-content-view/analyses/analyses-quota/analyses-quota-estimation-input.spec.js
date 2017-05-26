var Backbone = require('backbone');
var AnalysesQuotaEstimation = require('../../../../../../../../javascripts/cartodb3/editor/layers/layer-content-views/analyses/analyses-quota/analyses-quota-estimation-input');
var cdb = require('cartodb.js');

describe('editor/layers/layer-content-view/analyses/analyses-quota/analyses-quota-estimation-input', () => {
  beforeEach(() => {
    var configModel = new Backbone.Model({
      user_name: 'foo',
      sql_api_template: 'foo',
      api_key: 'foo'
    });

    AnalysesQuotaEstimation.init(configModel);
    this.successCallback = jest.createSpy('successCallback');
    this.errorCallback = jest.createSpy('errorCallback');
  });

  describe('requests', () => {
    beforeEach(() => {
      AnalysesQuotaEstimation.deferred = {
        state: () => {
          return 'pending';
        },
        promise: () => {
          return 'foo';
        }
      };
    });

    afterEach(() => {
      AnalysesQuotaEstimation.deferred = null;
    });

    it('should avoid multple request if executing', () => {
      spyOn(cdb.SQL.prototype, 'execute');
      AnalysesQuotaEstimation.fetch();
      expect(cdb.SQL.prototype.execute).not.toHaveBeenCalled();
    });
  });

  it('success', () => {
    cdb.SQL.prototype.execute = function (query, vars, params) {
      params && params.success({
        rows: [{row_count: 3242}]
      });
    };

    AnalysesQuotaEstimation.fetch().then(this.successCallback, this.errorCallback);
    expect(this.successCallback).toHaveBeenCalledWith(3242);
  });

  it('error', () => {
    cdb.SQL.prototype.execute = function (query, vars, params) {
      params && params.error({
        responseText: '{"error": ["foo"]}'
      });
    };

    AnalysesQuotaEstimation.fetch().then(this.successCallback, this.errorCallback);
    expect(this.errorCallback).toHaveBeenCalled();
    expect(this.successCallback).not.toHaveBeenCalled();
  });
});

