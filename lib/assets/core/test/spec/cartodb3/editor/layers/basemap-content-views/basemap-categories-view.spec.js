var BasemapCategoriesView = require('../../../../../../javascripts/cartodb3/editor/layers/basemap-content-views/basemap-categories-view');
var CarouselCollection = require('../../../../../../javascripts/cartodb3/components/custom-carousel/custom-carousel-collection');

describe('editor/layers/basemap-content-views/basemap-categories-view', () => {
  beforeEach(() => {
    this.collection = new CarouselCollection([{
      selected: true,
      val: 'CARTO',
      label: 'CARTO',
      template: () => {
        return 'CARTO';
      }
    }, {
      selected: false,
      val: 'Here',
      label: 'Here',
      template: () => {
        return 'Here';
      }
    }, {
      selected: false,
      val: 'Stamen',
      label: 'Stamen',
      template: () => {
        return 'Stamen';
      }
    }, {
      selected: false,
      val: 'Custom',
      label: 'Custom',
      template: () => {
        return 'Custom';
      }
    }, {
      selected: false,
      val: 'Color',
      label: 'Color',
      template: () => {
        return 'Color';
      }
    }]);

    this.view = new BasemapCategoriesView({
      categoriesCollection: this.collection
    });

    this.view.render();
  });

  it('should render properly', () => {
    expect(this.view.$('.Carousel-item').length).toBe(5);
  });

  it('should have no leaks', () => {
    expect(this.view).toHaveNoLeaks();
  });
});
