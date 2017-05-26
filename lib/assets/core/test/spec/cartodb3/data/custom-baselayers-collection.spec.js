var CustomBaselayersCollection = require('../../../../javascripts/cartodb3/data/custom-baselayers-collection');
var ConfigModel = require('../../../../javascripts/cartodb3/data/config-model');

describe('data/custom-baselayers-collection', () => {
  beforeEach(() => {
    var configModel = new ConfigModel({
      base_url: '/u/pepe'
    });

    this.customBaselayersCollection = new CustomBaselayersCollection([{
      id: 'basemap-id-1',
      options: {
        urlTemplate: 'http://a.example.com/basemap/6/30/24.png'
      }
    }], {
      configModel: configModel,
      currentUserId: 'current-user-id'
    });
  });

  describe('.getSelected', () => {
    it('should return selected layer if any', () => {
      expect(this.customBaselayersCollection.getSelected()).toBe(undefined);
      this.customBaselayersCollection.at(0).set('selected', true);
      expect(this.customBaselayersCollection.getSelected().get('id')).toBe('basemap-id-1');
    });
  });

  describe('.hasCustomBaseLayer', () => {
    it('should return layer with same classname if any', () => {
      expect(this.customBaselayersCollection.hasCustomBaseLayer('httpcexamplecombasemap63024png')).toBe(false);
      expect(this.customBaselayersCollection.hasCustomBaseLayer('httpaexamplecombasemap63024png')).toBe(true);
    });
  });
});
