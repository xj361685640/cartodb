var Backbone = require('backbone');
var ImportModelPoller = require('../../../../../javascripts/cartodb3/data/background-importer/import-model-poller.js');

describe('ImportModelPoller', () => {
  beforeEach(() => {
    var Model = Backbone.Model.extend({
      url: '/hello'
    });
    this.model = new Model();
    this.model.sync = function (a, b, opts) {
      opts.success();
    };
    spyOn(this.model, 'fetch').and.callThrough();

    this.poller = new ImportModelPoller(this.model);

    jest.clock().install();
  });

  afterEach(() => {
    jest.clock().uninstall();
  });

  it('should stop polling when geocoding has failed', () => {
    this.model.set('state', 'failure');

    this.poller.start();

    jest.clock().tick(4000);

    expect(this.model.fetch.calls.count()).toBe(1);
  });

  it('should stop polling when geocoding has completed', () => {
    this.model.set('state', 'complete');

    this.poller.start();

    jest.clock().tick(4000);

    expect(this.model.fetch.calls.count()).toBe(1);
  });

  it('should increment the interval after a number of requests', () => {
    this.poller.start();

    // 2000 is the interval period and 30 the number of requests before
    // the interval is incremented.
    jest.clock().tick(2000 * 30);

    // 30 requests have been made
    expect(this.model.fetch.calls.count()).toBe(30);

    // Interval has been incremented to 2000 * 2.5
    jest.clock().tick(2000 * 2.5 + 1);

    // Only one more request has been made (interval has been incremented)
    expect(this.model.fetch.calls.count()).toBe(31);
  });
});
