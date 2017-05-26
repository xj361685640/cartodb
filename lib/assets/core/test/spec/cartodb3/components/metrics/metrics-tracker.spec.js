var MetricsTracker = require('../../../../../javascripts/cartodb3/components/metrics/metrics-tracker.js');
var MetricsModel = require('../../../../../javascripts/cartodb3/components/metrics/metrics-model.js');
var Backbone = require('backbone');

describe('components/metrics/metrics-tracker', () => {
  describe('.init', () => {
    it('should require userId and visId from the initialization', () => {
      expect(() => {
        MetricsTracker.init();
      }).toThrowError('visId, userId and configModel are required');

      expect(() => {
        MetricsTracker.init({ visId: 'paco' });
      }).toThrowError('userId is required');

      expect(() => {
        MetricsTracker.init({ userId: 'vis' });
      }).toThrowError('visId is required');

      expect(() => {
        MetricsTracker.init({ userId: 'user', visId: 'vis' });
      }).toThrowError('configModel is required');

      MetricsTracker.init({ userId: 'paco', visId: 'jasmine', configModel: 'whatever' });
      expect(MetricsTracker._userId).toBeDefined();
      expect(MetricsTracker._visId).toBeDefined();
      expect(MetricsTracker._configModel).toBeDefined();
    });
  });

  describe('.track', () => {
    beforeEach(() => {
      var configModel = new Backbone.Model();
      MetricsTracker.init({ userId: 'paco', visId: 'jasmine', configModel: configModel });
      spyOn(MetricsModel.prototype, 'save');
    });

    it('should check event name', () => {
      expect(() => {
        MetricsTracker.track();
      }).toThrowError('eventName is required');
    });

    it('should save metric model', () => {
      MetricsTracker.track('eventExample');
      expect(MetricsModel.prototype.save).toHaveBeenCalled();
    });
  });
});
