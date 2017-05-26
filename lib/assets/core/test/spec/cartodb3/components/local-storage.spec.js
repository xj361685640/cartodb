var Backbone = require('backbone');
var LocalStorage = require('../../../../javascripts/cartodb3/components/local-storage/local-storage');

describe('components/local-storage', () => {
  beforeEach(() => {
    this._userModel = new Backbone.Model({
      username: 'pepe'
    });

    LocalStorage.init('local_storage_spec', {
      userModel: this._userModel
    });
  });

  afterEach(() => {
    localStorage.removeItem('cdb.0.1.0.pepe.local_storage_spec.hello');
  });

  it('should store a key', () => {
    LocalStorage.set('hello', 'world');
    expect(localStorage.getItem('cdb.0.1.0.pepe.local_storage_spec.hello')).toBe('world');
  });

  it('should update a key', () => {
    LocalStorage.set('hello', 'world');
    LocalStorage.set('hello', 'mundo');
    expect(localStorage.getItem('cdb.0.1.0.pepe.local_storage_spec.hello')).toBe('mundo');
  });

  it('should retrieve a key', () => {
    LocalStorage.set('hello', 'world');
    expect(LocalStorage.get('hello')).toBe('world');
  });

  it('should remove a key', () => {
    LocalStorage.set('hello', 'world');
    LocalStorage.delete('hello');
    expect(localStorage.getItem('cdb.0.1.0.pepe.local_storage_spec.hello')).toBe(null);
    expect(LocalStorage.get('hello')).toBe(undefined);
  });
});
