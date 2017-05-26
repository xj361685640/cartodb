var ConfigModel = require('../../../../javascripts/cartodb3/data/config-model');
var OrganizationModel = require('../../../../javascripts/cartodb3/data/organization-model');

describe('data/organization-model', () => {
  beforeEach(() => {
    var configModel = new ConfigModel({
      base_url: '/u/pepe'
    });

    this.model = new OrganizationModel({
      id: 'org1',
      owner: {
        id: 'hello',
        username: 'dev',
        email: 'hello@hello'
      }
    }, {
      configModel: configModel
    });
  });

  it('should have owner', () => {
    expect(this.model._ownerModel.get('username')).toEqual('dev');
  });

  it('should return the owner id', () => {
    expect(this.model.getOwnerId()).toBe(this.model._ownerModel.get('id'));
  });

  it('should return the owner email', () => {
    expect(this.model.getOwnerEmail()).toBe(this.model._ownerModel.get('email'));
  });
});
