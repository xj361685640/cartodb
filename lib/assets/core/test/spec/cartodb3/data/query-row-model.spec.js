var Backbone = require('backbone');
var QueryRowModel = require('../../../../javascripts/cartodb3/data/query-row-model');

describe('data/query-row-model', () => {
  beforeEach(() => {
    this.configModel = new Backbone.Model();

    this.collection = new Backbone.Collection();
    this.collection._tableName = 'paco';
    this.collection._configModel = this.configModel;

    spyOn(QueryRowModel.prototype, '_onError').and.callThrough();
    this.model = new QueryRowModel({
      hey: 'how',
      hi: 'howdy',
      the_geom_webmercator: 'EOEOEOEOEOE19203210'
    }, {
      collection: this.collection
    });
  });

  it('should have __id as idAttribute', () => {
    expect(this.model.idAttribute).toBe('__id');
  });

  describe('parse', () => {
    it('should add __id attribute if it is not present', () => {
      var attrs = this.model.parse(this.model.attributes);
      expect(attrs.__id).toBeDefined();
    });
  });

  describe('toJSON', () => {
    it('should not include __id or the_geom_webmercator', () => {
      var attrs = this.model.toJSON();
      expect(attrs.__id).not.toBeDefined();
      expect(attrs.the_geom_webmercator).not.toBeDefined();
    });
  });

  describe('url', () => {
    beforeEach(() => {
      this.configModel.set('base_url', '');
      this.configModel.urlVersion = () => { return 'v1'; };
    });

    it('should not provide a valid url if tableName is not defined', () => {
      this.model._tableName = '';
      expect(this.model.url()).toBeFalsy();
      this.model._tableName = 'paco';
      expect(this.model.url()).toBe('/api/v1/tables/paco/records');
    });
  });

  describe('save', () => {
    it('should set previous attributes if there is an error', () => {
      this.model.sync = function (a, b, opts) {
        opts.error();
      };

      this.model
        .set({ hey: 'ha' })
        .save();
      expect(QueryRowModel.prototype._onError).toHaveBeenCalled();
      expect(this.model.get('hey')).toBe('how');
    });
  });
});
