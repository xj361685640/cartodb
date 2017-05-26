var Backbone = require('backbone');
var ConfigModel = require('../../../../javascripts/cartodb3/data/config-model');
var QueryGeometryModel = require('../../../../javascripts/cartodb3/data/query-geometry-model');

describe('data/query-geometry-model', () => {
  beforeEach(() => {
    this.xhrSpy = jest.createSpyObj('xhr', ['abort', 'always', 'fail']);
    spyOn(Backbone.Model.prototype, 'sync').and.returnValue(this.xhrSpy);
    spyOn(Backbone.Model.prototype, 'fetch').and.callThrough();

    var configModel = new ConfigModel({
      base_url: '/u/pepe',
      api_key: 'xyz123'
    });
    this.model = new QueryGeometryModel({
      ready: true
    }, {
      configModel: configModel
    });
  });

  it('should not have any geometry initially', () => {
    expect(this.model.get('simple_geom')).toBeFalsy();
  });

  describe('when there is no query set', () => {
    it('should be unavailable by default', () => {
      expect(this.model.get('status')).toEqual('unavailable');
    });

    it('should not allow to fetch', () => {
      expect(this.model.fetch());
      expect(Backbone.Model.prototype.fetch).not.toHaveBeenCalled();
    });
  });

  describe('when it is not ready', () => {
    beforeEach(() => {
      this.model.set({
        ready: false,
        query: 'SELECT * FROM wherever'
      });
    });

    it('should not allow to fetch', () => {
      expect(this.model.fetch());
      expect(Backbone.Model.prototype.fetch).not.toHaveBeenCalled();
    });
  });

  describe('when a query is changed', () => {
    beforeEach(() => {
      this.model.set('query', 'SELECT * FROM foo');
    });

    it('should update status accordingly', () => {
      expect(this.model.get('status')).toEqual('unfetched');

      this.model.unset('query');
      expect(this.model.get('status')).toEqual('unavailable');
    });

    describe('when fetch', () => {
      beforeEach(() => {
        this.model.fetch();
      });

      it('should fetch with a wrapped query', () => {
        expect(Backbone.Model.prototype.fetch).toHaveBeenCalled();
        expect(Backbone.Model.prototype.fetch.calls.argsFor(0)[0].data.q).toMatch(/^SELECT .+$/);
        expect(Backbone.Model.prototype.fetch.calls.argsFor(0)[0].data.q).toMatch(/FROM \(.+\) .+$/);
      });

      it('should add order, rows and page', () => {
        expect(Backbone.Model.prototype.fetch.calls.argsFor(0)[0].data.rows_per_page).toBe(40);
        expect(Backbone.Model.prototype.fetch.calls.argsFor(0)[0].data.page).toBe(0);
        expect(Backbone.Model.prototype.fetch.calls.argsFor(0)[0].data.sort_order).toBe('asc');
      });

      it('should fetch using an API key', () => {
        expect(Backbone.Model.prototype.fetch.calls.argsFor(0)[0].data.api_key).toEqual('xyz123');
      });

      it('should change status', () => {
        expect(this.model.get('status')).toEqual('fetching');
      });

      describe('when a request is already ongoing', () => {
        beforeEach(() => {
          this.model.fetch();
        });

        it('should cancel current request', () => {
          expect(this.xhrSpy.abort).toHaveBeenCalled();
        });

        it('should fetch again', () => {
          expect(Backbone.Model.prototype.fetch.calls.count()).toEqual(2);
        });
      });

      describe('when request succeeds', () => {
        beforeEach(() => {
          Backbone.Model.prototype.sync.calls.argsFor(0)[2].success({
            fields: {
              cartodb_id: {type: 'number'},
              title: {type: 'string'},
              the_geom: {type: 'string'}
            },
            rows: [
              { cartodb_id: 1, title: '1st', the_geom: '' },
              { cartodb_id: 2, title: '2nd', the_geom: 'line' },
              { cartodb_id: 3, title: '3rd', the_geom: 'line' }
            ]
          });
        });

        it('should change status', () => {
          expect(this.model.get('status')).toEqual('fetched');
        });

        it('should setup raw geom', () => {
          expect(this.model.get('simple_geom')).toEqual(jest.any(String));
        });
      });

      describe('when request fails', () => {
        beforeEach(() => {
          Backbone.Model.prototype.sync.calls.argsFor(0)[2].error({
            responseText: '{"error": ["meh"]}'
          });
        });

        it('should have unavailable status', () => {
          expect(this.model.get('status')).toEqual('unavailable');
        });

        it('should don\'t have simple_geom', () => {
          expect(this.model.get('simple_geom')).toEqual('');
        });
      });

      describe('when request is aborted', () => {
        beforeEach(() => {
          Backbone.Model.prototype.sync.calls.argsFor(0)[2].error({
            statusText: 'abort'
          });
        });

        it('should not have anavailable status if error comes from an abort request', () => {
          expect(this.model.get('status')).not.toEqual('unavailable');
          expect(this.model.get('query_errors')).toBeUndefined();
        });

        it('should not change simple_geom', () => {
          expect(this.model.get('status')).not.toEqual('unavailable');
          expect(this.model.hasChanged('simple_geom')).toBeFalsy();
        });
      });
    });
  });

  describe('when ready flag is changed', () => {
    describe('when there is no query', () => {
      beforeEach(() => {
        this.model.set('ready', true);
      });

      it('should change status', () => {
        expect(this.model.get('status')).toEqual('unavailable');
      });
    });

    describe('when there is a query', () => {
      beforeEach(() => {
        this.model.set({
          query: 'SELECT * FROM something',
          ready: false
        });
      });

      it('should change status', () => {
        expect(this.model.get('status')).toEqual('unfetched');
      });
    });
  });

  describe('.destroy', () => {
    beforeEach(() => {
      this.destroySpy = jest.createSpy('destroy');
      this.model.once('destroy', this.destroySpy);

      this.model.destroy();
    });

    it('should do default destroy process to cleanup bindings', () => {
      expect(this.destroySpy).toHaveBeenCalled();
    });
  });

  describe('resetFetch', () => {
    it('should set status to `unfetched`', () => {
      this.model.set('status', 'fetched');

      this.model.resetFetch();

      expect(this.model.get('status')).toEqual('unfetched');
    });
  });
});
