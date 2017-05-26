var ConfigModel = require('../../../../javascripts/cartodb3/data/config-model');
var VisDefinitionModel = require('../../../../javascripts/cartodb3/data/vis-definition-model');

describe('data/vis-definition-model', () => {
  beforeEach(() => {
    var configModel = new ConfigModel({
      base_url: '/u/pepe'
    });
    this.model = new VisDefinitionModel({
      id: 'v-123',
      map_id: 'm-123'
    }, {
      configModel: configModel
    });
  });

  it('should have a url', () => {
    expect(this.model.url()).toEqual('/u/pepe/api/v1/viz/v-123');
  });

  it('should have an embed url', () => {
    expect(this.model.embedURL()).toEqual('/u/pepe/builder/v-123/embed');
  });

  it('should have a mapcap url', () => {
    expect(this.model.mapcapsURL()).toEqual('/u/pepe/api/v3/viz/v-123/mapcaps');
  });
});
