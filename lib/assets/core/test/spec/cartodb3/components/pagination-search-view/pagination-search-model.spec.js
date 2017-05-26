var Backbone = require('backbone');
var PaginationSearchModel = require('../../../../../javascripts/cartodb3/components/pagination-search/pagination-search-model');

describe('components/pagination-search/pagination-search-model', () => {
  var onFetching = jest.createSpy('onFetching');
  var onFetched = jest.createSpy('onFetched');

  beforeEach(() => {
    this.collection = new Backbone.Collection([{
      user: 'foo'
    }, {
      user: 'bar'
    }, {
      user: 'baz'
    }]);
    this.collection.totalCount = () => {
      return 3;
    };

    spyOn(this.collection, 'fetch');
    this.model = new PaginationSearchModel({}, {
      collection: this.collection
    });

    this.model.on('fetching', onFetching);
    this.model.on('fetched', onFetched);
  });

  it('should fetch a collection', () => {
    this.model.fetch();
    expect(this.collection.fetch).toHaveBeenCalled();
  });

  it('should trigger events', () => {
    this.model.fetch();
    expect(onFetching).toHaveBeenCalled();

    this.collection.trigger('sync');
    expect(onFetched).toHaveBeenCalled();
  });
});
