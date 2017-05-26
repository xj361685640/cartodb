var BasemapsCollection = require('../../../../../../javascripts/cartodb3/editor/layers/basemap-content-views/basemaps-collection');

describe('editor/layers/basemap-content-views/basemaps-collection', () => {
  beforeEach(() => {
    this.collection = new BasemapsCollection([{
      default: true,
      url: 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
      subdomains: 'abcd',
      minZoom: '0',
      maxZoom: '18',
      name: 'Positron (labels below)',
      className: 'positron_rainbow',
      attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
      category: 'CARTO',
      selected: true,
      val: 'positron_rainbow',
      label: 'Positron (labels below)',
      template: () => {
        return 'positron_rainbow';
      }
    }, {
      default: false,
      url: 'http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
      subdomains: 'abcd',
      minZoom: '0',
      maxZoom: '18',
      name: 'Dark matter (labels below)',
      className: 'dark_matter_rainbow',
      attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
      category: 'CARTO',
      selected: false,
      val: 'dark_matter_rainbow',
      label: 'Dark matter (labels below)',
      template: () => {
        return 'dark_matter_rainbow';
      }
    }, {
      default: false,
      url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.png',
      subdomains: 'abcd',
      minZoom: '0',
      maxZoom: '18',
      name: 'Watercolor',
      className: 'watercolor_stamen',
      attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.',
      category: 'Stamen',
      selected: false,
      val: 'watercolor_stamen',
      label: 'Watercolor',
      template: () => {
        return 'watercolor_stamen';
      }
    }, {
      default: false,
      url: '://{s}.maps.nlp.nokia.com/maptile/2.1/maptile/newest/normal.day/{z}/{x}/{y}/256/png8?lg=eng&token=A7tBPacePg9Mj_zghvKt9Q&app_id=KuYppsdXZznpffJsKT24',
      subdomains: '1234',
      minZoom: '0',
      maxZoom: '20',
      name: 'Nokia Day',
      className: 'nokia_day',
      attribution: 'Map&copy;2016 HERE <a href="http://here.net/services/terms" target="_blank">Terms of use</a>',
      category: 'Here',
      selected: false,
      val: 'nokia_day',
      label: 'Nokia Day',
      template: () => {
        return 'nokia_day';
      }
    }, {
      default: false,
      color: '#ff6600',
      image: '',
      maxZoom: 32,
      className: 'plain',
      category: 'Color',
      type: 'Plain',
      selected: false,
      val: 'plain',
      label: 'plain',
      template: () => {
        return 'plain';
      }
    }]);

    this.collection.add({
      id: 'basemap-id-1',
      urlTemplate: 'https://a.tiles.mapbox.com/v4/username.12ab45c/{z}/{x}/{y}.png?access_token=aBcDC12323abc',
      maxZoom: 21,
      minZoom: 0,
      name: 'MapBox Streets Outdoors Global Preview',
      className: 'httpsatilesmapboxcomv4username12ab45czxypngaccess_tokenaBcDC12323abc',
      attribution: '<a href="https://www.mapbox.com/about/maps/" target="_blank">&copy; Mapbox &copy; OpenStreetMap</a> <a class="mapbox-improve-map" href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a>',
      order: 26,
      val: 'httpsatilesmapboxcomv4username12ab45czxypngaccess_tokenaBcDC12323abc'
    });

    this.collection.add({
      id: 'basemap-id-2',
      urlTemplate: 'https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg',
      maxZoom: 21,
      minZoom: 0,
      name: 'Custom basemap 29',
      className: 'httpsstamentilessasslfastlynetwatercolorzxyjpg',
      attribution: null,
      order: 29,
      val: 'httpsstamentilessasslfastlynetwatercolorzxyjpg'
    });
  });

  it('should have only one selected', () => {
    var l0 = this.collection.at(0);
    var l1 = this.collection.at(1);

    expect(l0.get('selected')).toBeTruthy();
    expect(this.collection.where({ selected: true }).length).toBe(1);
    l1.set('selected', true);
    expect(this.collection.where({ selected: true }).length).toBe(1);
    expect(l0.get('selected')).toBeFalsy();
    expect(l1.get('selected')).toBeTruthy();
  });

  describe('.getSelected', () => {
    it('should return selected model', () => {
      var l0 = this.collection.at(0);
      var selected = this.collection.getSelected();

      expect(l0.get('selected')).toBeTruthy();
      expect(selected.get('selected')).toBeTruthy();
      expect(l0.get('className')).toBe(selected.get('className'));
    });
  });

  describe('.findByCategory', () => {
    it('should return models for that category', () => {
      expect(this.collection.findByCategory('CARTO').length).toBe(2);
    });
  });

  describe('.getDefaultCategory', () => {
    it('should return default category', () => {
      expect(this.collection.getDefaultCategory()).toBe('CARTO');
    });
  });

  describe('.getCategories', () => {
    it('should return an array of categories', () => {
      expect(this.collection.getCategories()).toContain('CARTO');
      expect(this.collection.getCategories()).toContain('Here');
      expect(this.collection.getCategories()).toContain('Stamen');
      expect(this.collection.getCategories()).toContain('Color');
      expect(this.collection.getCategories()).toContain('Custom');
      expect(this.collection.getCategories()).toContain('Mapbox');
      expect(this.collection.getCategories()).toContain('WMS');
      expect(this.collection.getCategories()).toContain('TileJSON');
    });
  });

  describe('.updateSelected', () => {
    it('should update selected passing the classname', () => {
      var l0 = this.collection.at(0);
      var l1 = this.collection.at(1);

      expect(l0.get('className')).toBe('positron_rainbow');
      expect(l0.get('selected')).toBeTruthy();
      expect(l1.get('selected')).toBeFalsy();
      this.collection.updateSelected('dark_matter_rainbow');
      expect(l1.get('className')).toBe('dark_matter_rainbow');
      expect(l0.get('selected')).toBeFalsy();
      expect(l1).toBeTruthy();
    });
  });

  describe('.updateCategory', () => {
    it('should update category passing the classname and a category', () => {
      var l5 = this.collection.at(5);

      expect(l5.get('category')).toBe('Custom');

      this.collection.updateCategory('httpsatilesmapboxcomv4username12ab45czxypngaccess_tokenaBcDC12323abc', 'Mapbox');

      expect(l5.get('category')).toBe('Mapbox');
    });
  });

  describe('.getByValue', () => {
    it('should return model by value', () => {
      var l0 = this.collection.at(0);
      var l1 = this.collection.getByValue('positron_rainbow');

      expect(l0.get('className')).toBe(l1.get('className'));
    });
  });
});
