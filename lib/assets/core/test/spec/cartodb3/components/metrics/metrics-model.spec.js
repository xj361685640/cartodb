var MetricsModel = require('../../../../../javascripts/cartodb3/components/metrics/metrics-model.js');
var ConfigModel = require('../../../../../javascripts/cartodb3/data/config-model');

describe('components/metrics/metrics-model', () => {
  beforeEach(() => {
    var configModel = new ConfigModel({
      base_url: '/u/paco'
    });

    this.metricModel = new MetricsModel({
      eventName: 'event-name',
      eventProperties: { property: 'event-property-1' }
    }, {
      userId: 'paco',
      visId: '1234',
      configModel: configModel
    });
  });

  it('should create url correctly', () => {
    expect(this.metricModel.url()).toBe('/u/paco/api/v3/metrics');
  });

  it('should have eventName defined', () => {
    expect(this.metricModel.get('eventName')).toBe('event-name');
  });

  it('should have necessary options', () => {
    expect(this.metricModel._userId).toBeDefined();
    expect(this.metricModel._visId).toBeDefined();
    expect(this.metricModel._configModel).toBeDefined();
  });

  describe('.toJSON', () => {
    it('should define correctly the json structure', () => {
      expect(this.metricModel.toJSON()).toEqual(
        jest.objectContaining({
          name: 'event-name',
          properties: {
            property: 'event-property-1',
            visualization_id: '1234',
            user_id: 'paco'
          }
        })
      );
    });
  });
});
