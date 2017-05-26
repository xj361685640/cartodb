
var ConfigModel = require('../../../../javascripts/cartodb3/data/config-model');

describe('data/config-model', () => {
  beforeEach(() => {
    this.model = new ConfigModel();
  });

  describe('.urlVersion', () => {
    beforeEach(() => {
      this.version = this.model.urlVersion();
    });

    it('should return v1 by default', () => {
      expect(this.version).toEqual('v1');
    });
  });

  describe('.getSqlApiUrl', () => {
    beforeEach(() => {
      this.url = this.model.getSqlApiUrl();
    });

    it('should return a API url', () => {
      expect(this.url).toEqual(jest.any(String));
      expect(this.url).toContain('/sql');
    });
  });
});
