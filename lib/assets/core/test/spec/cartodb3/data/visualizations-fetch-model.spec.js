var VisualizationsFetchModel = require('../../../../javascripts/cartodb3/data/visualizations-fetch-model');

describe('data/visualizations-fetch-model', () => {
  beforeEach(() => {
    this.model = new VisualizationsFetchModel({
      shared: false,
      page: 1
    });
  });

  describe('.isSearching', () => {
    it('should return true if set to a search or tag query', () => {
      this.model.set({
        q: '',
        tag: ''
      });
      expect(this.model.isSearching()).toBeFalsy();

      this.model.set({
        q: 'foobar',
        tag: ''
      });
      expect(this.model.isSearching()).toBeTruthy();

      this.model.set({
        q: '',
        tag: 'some-tag'
      });
      expect(this.model.isSearching()).toBeTruthy();
    });
  });

  describe('.isDeepInsights', () => {
    it('should return true if content_type is maps and deep-insights are enabled', () => {
      this.model.set({
        content_type: 'datasets',
        deepInsights: true
      });
      expect(this.model.isDeepInsights()).toBeFalsy();
      this.model.set({
        content_type: 'maps'
      });
      expect(this.model.isDeepInsights()).toBeTruthy();
      this.model.set({
        deepInsights: false
      });
      expect(this.model.isDeepInsights()).toBeFalsy();
    });
  });
});
