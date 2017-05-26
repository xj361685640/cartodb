var Backbone = require('backbone');
var InputAssetPickerHeader = require('../../../../../../../../../javascripts/cartodb3/components/form-components/editors/fill/input-color/assets-picker/input-asset-picker-header');

describe('components/form-components/editors/fill/input-color/assets-picker/input-asset-picker-header', () => {
  beforeEach(() => {
    this.model = new Backbone.Model({
      index: 0,
      ramp: [{
        color: '#FF0000',
        title: 'hola',
        image: 'http://www.image.com/image.jpg'
      }]
    });

    this.view = new InputAssetPickerHeader({
      index: 0,
      model: this.model
    });

    this.view.render();
  });

  describe('render', () => {
    it('should render template', () => {
      expect(this.view.$el.html()).toContain('CDB-Box-modalHeader');
    });
  });

  describe('.getRampItem', () => {
    it('should return ramp item element', () => {
      var item = this.view._getRampItem();
      expect(item.color).toBe('#FF0000');
    });
  });

  describe('._onClickBack', () => {
    it('should trigger back function', () => {
      var isBack;

      this.view.bind('back', () => {
        isBack = true;
      }, this);

      this.view.$('.js-back').click();
      expect(isBack).toBeTruthy();
    });
  });

  describe('._onGoToColorPicker', () => {
    it('should trigger goToColorPicker function', () => {
      var isInColorPicker;

      this.view.bind('goToColorPicker', () => {
        isInColorPicker = true;
      }, this);

      this.view.$('.js-colorPicker').click();
      expect(isInColorPicker).toBeTruthy();
    });
  });

  it('should not have leaks', () => {
    expect(this.view).toHaveNoLeaks();
  });

  afterEach(() => {
    this.view.clean();
  });
});
