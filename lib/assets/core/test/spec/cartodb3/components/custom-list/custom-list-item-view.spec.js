var CustomListItemModel = require('../../../../../javascripts/cartodb3/components/custom-list/custom-list-item-model');
var CustomListItemView = require('../../../../../javascripts/cartodb3/components/custom-list/custom-list-item-view');

describe('components/custom-list/custom-list-item-view', () => {
  beforeEach(() => {
    this.model = new CustomListItemModel({
      val: 'hello'
    });

    this.view = new CustomListItemView({
      model: this.model,
      typeLabel: 'column'
    });

    this.view.render();
  });

  it('should render properly', () => {
    expect(this.view.$el.data('val')).not.toBeUndefined();
    expect(this.view.$('button').length).toBe(1);
    expect(this.view.$('button').attr('title')).toBe(this.model.getName());
  });

  it('should add disabled class if it has disabled property', () => {
    expect(this.view.$el.hasClass('is-disabled')).toBeFalsy();
    this.model.set('disabled', true);
    this.view.render();
    expect(this.view.$el.hasClass('is-disabled')).toBeTruthy();
  });

  describe('hover', () => {
    beforeEach(() => {
      this.view.$el.trigger('mouseenter');
    });

    it('should add class when it is hovered', () => {
      expect(this.view.$el.hasClass('is-highlighted')).toBeTruthy();
    });

    it('should remove class when it is unhovered', () => {
      this.view.$el.trigger('mouseleave');
      expect(this.view.$el.hasClass('is-highlighted')).toBeFalsy();
    });
  });

  it('should set selected when it is clicked', () => {
    expect(this.model.get('selected')).toBeFalsy();
    this.view.$el.trigger('click');
    expect(this.model.get('selected')).toBeTruthy();
  });

  it('shouldn\'t toggle by default when clicking', () => {
    expect(this.model.get('selected')).toBeFalsy();
    this.view.$el.trigger('click');
    this.view.$el.trigger('click');
    expect(this.model.get('selected')).toBeTruthy();
  });
});
