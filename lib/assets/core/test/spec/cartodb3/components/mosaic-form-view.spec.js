var _ = require('underscore');
var MosaicFormView = require('../../../../javascripts/cartodb3/components/mosaic-form-view');
var MosaicCollection = require('../../../../javascripts/cartodb3/components/mosaic/mosaic-collection');

describe('components/mosaic-form-view', () => {
  beforeEach(() => {
    this.collection = new MosaicCollection([
      { val: 'hello', selected: true },
      { val: 'howdy' },
      { val: 'hi' }
    ]);
    this.view = new MosaicFormView({
      collection: this.collection,
      template: _.template('<div class="js-highlight"><%- name %></div><div class="js-selector"></div>')
    });

    this.view.render();
  });

  describe('render', () => {
    it('should render properly', () => {
      expect(this.view.$('.Mosaic').length).toBe(1);
    });

    it('should require js-selector class', () => {
      this.view.template = _.template('<div></div>');
      expect(this.view.render).toThrow();
    });
  });

  it('should update selector when item is highlighted if element exists', () => {
    expect(this.view.$('.js-highlight').text()).toBe('hello');
    this.collection.at(2).set('highlighted', true);
    expect(this.view.$('.js-highlight').text()).toBe('hi');
  });
});
