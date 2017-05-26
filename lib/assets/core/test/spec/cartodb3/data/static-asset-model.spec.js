var StaticAssetModel = require('../../../../javascripts/cartodb3/data/static-asset-model');

describe('data/static-asset-model', () => {
  beforeEach(() => {
    this.model = new StaticAssetModel();
  });
  describe('.getUrlFor', () => {
    it('should return the proper URL', () => {
      expect(this.model.getURLFor('paella'))
        .toEqual('https://s3.amazonaws.com/com.cartodb.users-assets.production/maki-icons/paella-18.svg');
    });
  });
});
