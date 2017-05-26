var Backbone = require('backbone');
var AnalysesQuotaOptions = require('../../../../../../../../javascripts/cartodb3/editor/layers/layer-content-views/analyses/analyses-quota/analyses-quota-options');
var AnalysesQuotaInfo = require('../../../../../../../../javascripts/cartodb3/editor/layers/layer-content-views/analyses/analyses-quota/analyses-quota-info');

describe('editor/layers/layer-content-views/analyses/analyses-quota/analyses-quota-options', () => {
  beforeEach(() => {
    var configModel = new Backbone.Model({
      user_name: 'foo',
      sql_api_template: 'foo',
      api_key: 'foo'
    });

    this.quotaInfo = AnalysesQuotaInfo.get(configModel);
    this.quotaInfo.reset([
      {service: 'isolines', monthly_quota: 2000, used_quota: 23, soft_limit: false, provider: 'heremaps'},
      {service: 'hires_geocoder', monthly_quota: 1000, used_quota: 0, soft_limit: true, provider: 'heremaps'},
      {service: 'routing', monthly_quota: 1000, used_quota: 0, soft_limit: false, provider: 'mapzen'},
      {service: 'observatory', monthly_quota: 1000, used_quota: 0, soft_limit: false, provider: 'data observatory'}
    ]);
  });

  describe('requiresQuota', () => {
    it('analysis does not require quota', () => {
      expect(AnalysesQuotaOptions.requiresQuota('foo', this.quotaInfo)).toBe(false);
    });

    it('routing or data observatory', () => {
      expect(AnalysesQuotaOptions.requiresQuota('routing-sequential', this.quotaInfo)).toBe(true);
      expect(AnalysesQuotaOptions.requiresQuota('data-observatory-measure', this.quotaInfo)).toBe(true);
    });

    describe('trade-area', () => {
      it('should require quota if provider is set', () => {
        var geocoder = this.quotaInfo.getService('hires_geocoder');
        expect(AnalysesQuotaOptions.requiresQuota('trade-area', this.quotaInfo)).toBeTruthy();
        geocoder.set('provider', 'mapzen');
        expect(AnalysesQuotaOptions.requiresQuota('trade-area', this.quotaInfo)).toBeTruthy();
      });

      it('should not require quota when provider is empty', () => {
        var isolines = this.quotaInfo.getService('isolines');
        expect(AnalysesQuotaOptions.requiresQuota('trade-area', this.quotaInfo)).toBeTruthy();
        isolines.set('provider', null);
        expect(AnalysesQuotaOptions.requiresQuota('trade-area', this.quotaInfo)).toBeFalsy();
      });
    });

    describe('georeference-street-address', () => {
      it('should return quota', () => {
        expect(AnalysesQuotaOptions.requiresQuota('georeference-street-address', this.quotaInfo)).toBeTruthy();
      });
    });
  });

  describe('transform input', () => {
    it('should return same input for analysis without quota', () => {
      expect(AnalysesQuotaOptions.transformInput('foo', 20, {})).toBe(20);
    });

    it('should return same input for analysis with quota but isolines', () => {
      expect(AnalysesQuotaOptions.transformInput('georeference-street-address', 20, {})).toBe(20);
      expect(AnalysesQuotaOptions.transformInput('data-observatory-measure', 15, {})).toBe(15);
    });

    it('should return input multiplied for tracts for isolines', () => {
      var formModel = new Backbone.Model({
        isolines: 1
      });

      expect(AnalysesQuotaOptions.transformInput('trade-area', 20, formModel)).toBe(20);
      formModel.set('isolines', 2);
      expect(AnalysesQuotaOptions.transformInput('trade-area', 20, formModel)).toBe(40);
      formModel.set('isolines', 10);
      expect(AnalysesQuotaOptions.transformInput('trade-area', 20, formModel)).toBe(200);
    });
  });

  it('getAnalysisName', () => {
    expect(AnalysesQuotaOptions.getAnalysisName('foo')).toBe(null);
    expect(AnalysesQuotaOptions.getAnalysisName('trade-area')).toBe('editor.layers.analysis-form.quota.analysis-type.trade-area');
    expect(AnalysesQuotaOptions.getAnalysisName('data-observatory-measure')).toBe('editor.layers.analysis-form.quota.analysis-type.data-observatory-measure');
  });

  it('getServiceName', () => {
    expect(AnalysesQuotaOptions.getServiceName('foo')).toBe(null);
    expect(AnalysesQuotaOptions.getServiceName('trade-area')).toBe('isolines');
    expect(AnalysesQuotaOptions.getServiceName('data-observatory-measure')).toBe('observatory');
  });

  it('getUserDataName', () => {
    expect(AnalysesQuotaOptions.getUserDataName('foo')).toBe(null);
    expect(AnalysesQuotaOptions.getUserDataName('trade-area')).toBe('here_isolines');
    expect(AnalysesQuotaOptions.getUserDataName('data-observatory-measure')).toBe('obs_general');
  });
});

