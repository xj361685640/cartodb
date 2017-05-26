var Backbone = require('backbone');
var InputColorCategoriesList = require('../../../../../../../../../javascripts/cartodb3/components/form-components/editors/fill/input-color/input-categories/input-color-categories-list-view');

describe('components/form-components/editors/fill/input-color/input-categories/input-color-categories-list-view', () => {
  beforeEach(() => {
    this.model = new Backbone.Model({
      domain: ['foo', 'bar', 'baz'],
      images: ['', '', ''],
      range: ['#5F4690', '#1D6996', '#38a6a5']
    });

    this.view = new InputColorCategoriesList({
      model: this.model
    });

    this.view.render();
    document.body.appendChild(this.view.el);
  });

  afterEach(() => {
    if (document.body.contains(this.view.el)) {
      document.body.removeChild(this.view.el);
    }
  });

  it('should have no leaks', () => {
    expect(this.view).toHaveNoLeaks();
  });

  it('should render properly', () => {
    this.view.render();
    expect(this.view.$el.find('.js-color').length).toBe(3);
    expect(this.view.$el.find('.js-listItem').length).toBe(3);
  });

  it('should allow click on colors if color is valid', () => {
    spyOn(this.view, 'trigger');

    this.view.$('.js-color').eq(1).trigger('click');
    expect(this.view.trigger).toHaveBeenCalledWith('selectItem', {
      index: 1,
      target: 'color'
    }, this.view);
  });

  it('should not allow click on colors if there is no colors', () => {
    spyOn(this.view, 'trigger');

    this.view._collection.reset([]); // No categories, reseted
    this.view.$('.js-color').eq(1).trigger('click');
    expect(this.view.trigger).not.toHaveBeenCalled();
  });
});
