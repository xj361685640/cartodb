var Backbone = require('backbone');
var AnalysesQuotaEnough = require('../../../../../../../../javascripts/cartodb3/editor/layers/layer-content-views/analyses/analyses-quota/analyses-quota-enough');
var cdb = require('cartodb.js');

describe('editor/layers/layer-content-view/analyses/analyses-quota/analyses-quota-enough', () => {
  beforeEach(() => {
    var configModel = new Backbone.Model({
      user_name: 'foo',
      sql_api_template: 'foo',
      api_key: 'foo'
    });

    AnalysesQuotaEnough.init(configModel);
    this.successCallback = jest.createSpy('successCallback');
    this.errorCallback = jest.createSpy('errorCallback');
  });

  describe('requests', () => {
    beforeEach(() => {
      AnalysesQuotaEnough.deferred = {
        state: () => {
          return 'pending';
        },
        promise: () => {
          return 'foo';
        }
      };
    });

    afterEach(() => {
      AnalysesQuotaEnough.deferred = null;
    });

    it('should avoid multple request if executing', () => {
      spyOn(cdb.SQL.prototype, 'execute');
      AnalysesQuotaEnough.fetch();
      expect(cdb.SQL.prototype.execute).not.toHaveBeenCalled();
    });
  });

  it('not enough quota', () => {
    cdb.SQL.prototype.execute = function (query, vars, params) {
      params && params.success({
        rows: [{'cdb_enough_quota': false}]
      });
    };

    AnalysesQuotaEnough.fetch().then(this.successCallback, this.errorCallback);
    expect(this.successCallback).toHaveBeenCalledWith(false);
  });

  it('enough quota', () => {
    cdb.SQL.prototype.execute = function (query, vars, params) {
      params && params.success({
        rows: [{'cdb_enough_quota': true}]
      });
    };

    AnalysesQuotaEnough.fetch().then(this.successCallback, this.errorCallback);
    expect(this.successCallback).toHaveBeenCalledWith(true);
  });

  it('error', () => {
    cdb.SQL.prototype.execute = function (query, vars, params) {
      params && params.error({
        responseText: '{"error": ["foo"]}'
      });
    };

    AnalysesQuotaEnough.fetch().then(this.successCallback, this.errorCallback);
    expect(this.errorCallback).toHaveBeenCalled();
    expect(this.successCallback).not.toHaveBeenCalled();
  });
});

