var CustomCarouselItemModel = require('../../../../../javascripts/cartodb3/components/custom-carousel/custom-carousel-item-model');
var CustomCarouselItemView = require('../../../../../javascripts/cartodb3/components/custom-carousel/custom-carousel-item-view');

describe('components/custom-carousel/custom-carousel-item-view', () => {
  beforeEach(() => {
    this.model = new CustomCarouselItemModel({
      val: 'hello'
    });

    this.view = new CustomCarouselItemView({
      model: this.model
    });

    this.view.render();
  });

  it('should render properly', () => {
    expect(this.view.$('button').length).toBe(1);
  });

  it('should allow to add a className', () => {
    var view = new CustomCarouselItemView({
      model: this.model,
      itemOptions: {
        className: 'MyFabolousClassName'
      }
    });

    view.render();
    expect(view.$('button').hasClass('MyFabolousClassName')).toBeTruthy();
  });

  describe('hover', () => {
    beforeEach(() => {
      this.view.$el.trigger('mouseenter');
    });

    it('should add class when it is hovered', () => {
      expect(this.model.get('highlighted')).toBeTruthy();
    });

    it('should remove class when it is unhovered', () => {
      this.view.$el.trigger('mouseleave');
      expect(this.model.get('highlighted')).toBeFalsy();
    });
  });

  it('should set selected when it is clicked', () => {
    expect(this.model.get('selected')).toBeFalsy();
    this.view.$el.trigger('click');
    expect(this.model.get('selected')).toBeTruthy();
    expect(this.view.$el.hasClass('is-selected')).toBeTruthy();
  });
});
