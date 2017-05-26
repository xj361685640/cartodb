var CustomCarouselView = require('../../../../../javascripts/cartodb3/components/custom-carousel/custom-carousel-view');

describe('components/custom-carousel/custom-carousel-view', () => {
  beforeEach(() => {
    this.view = new CustomCarouselView({
      options: [
        { val: 'hello', selected: true },
        { val: 'howdy' },
        { val: 'hi' }
      ]
    });
    spyOn(this.view, '_bindScroll');
    spyOn(this.view, '_checkShadows');
    spyOn(this.view, '_checkScroll');
    jest.clock().install();
    this.view.render();
    this.view.initScroll();
    jest.clock().tick(100);
  });

  it('should allow to add a className for every list item', () => {
    var view = new CustomCarouselView({
      options: [
        { val: 'hello', selected: true },
        { val: 'howdy' },
        { val: 'hi' }
      ],
      listItemOptions: {
        className: 'MyFabolousClassName'
      }
    });

    view.render();
    expect(view.$('li').hasClass('MyFabolousClassName')).toBeTruthy();
  });

  it('should render properly', () => {
    expect(this.view.$('li').length).toBe(3);
    expect(this.view.$('.Carousel-shadow').length).toBe(2);
  });

  it('should bind scroll', () => {
    expect(this.view._bindScroll).toHaveBeenCalled();
  });

  it('should check shadows', () => {
    expect(this.view._checkShadows).toHaveBeenCalled();
  });

  afterEach(() => {
    jest.clock().uninstall();
  });

  describe('bind', () => {
    it('should check scroll when selected item changes', () => {
      this.view.collection.at(1).set('selected', true);
      expect(this.view._checkScroll).toHaveBeenCalled();
    });
  });

  describe('unbind', () => {
    it('should not check shadows after unbind', () => {
      this.view._checkShadows.calls.reset();
      this.view._unbindScroll();
      this.view._listContainer().trigger('ps-scroll-x');
      expect(this.view._checkShadows).not.toHaveBeenCalled();
    });
  });

  it('should destroy custom scroll when view is removed', () => {
    spyOn(this.view, '_destroyCustomScroll');
    this.view.clean();
    expect(this.view._destroyCustomScroll).toHaveBeenCalled();
  });
});
