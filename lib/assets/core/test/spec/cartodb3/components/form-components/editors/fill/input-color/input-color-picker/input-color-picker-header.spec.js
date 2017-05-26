var Backbone = require('backbone');
var InputColorPickerHeader = require('../../../../../../../../../javascripts/cartodb3/components/form-components/editors/fill/input-color/input-color-picker/input-color-picker-header');

describe('components/form-components/editors/fill/input-color/input-color-picker/input-color-picker-header', () => {
  beforeEach(() => {
    this.model = new Backbone.Model({
      ramp: [{
        val: '#c0ffee',
        color: '#c0ffee'
      }, {
        val: '#bada55',
        color: '#bada55'
      }, {
        val: '#decade',
        color: '#decade'
      }],
      opacity: 0.45,
      index: 0
    });
    this.view = new InputColorPickerHeader({ model: this.model });
  });

  describe('events', () => {
    it('should be properly hooked up', () => {
      expect(this.view.events['click .js-color']).toEqual('_onClickColor');
      expect(this.view.events['keyup .js-a']).toEqual('_onChangeOpacity');
    });
  });

  describe('render', () => {
    it('should create slider and opacity input with proper values', () => {
      this.view.render();

      var $slider = this.view.$('.js-slider');
      var expectedOpacity = this.model.get('opacity');
      expect(+this.view.$('.js-a').val()).toBe(expectedOpacity);
      expect($slider.slider('instance')).toEqual(jest.anything());
      expect($slider.slider('option', 'max')).toBe(1);
      expect($slider.slider('option', 'min')).toBe(0);
      expect($slider.slider('option', 'step')).toBe(0.02);
      expect($slider.slider('option', 'orientation')).toEqual('horizontal');
      expect($slider.slider('option', 'disabled')).toBe(false);
      expect($slider.slider('option', 'range')).toEqual('min');
      expect($slider.slider('option', 'value')).toEqual(this.view._inverseSliderValue(expectedOpacity));
      expect($slider.slider('option', 'slide')).toEqual(jest.anything());
    });

    it('should call _reRenderOpacity and not render anything else if opacity changes', () => {
      spyOn(this.view, '_reRenderOpacity');
      spyOn(this.view, 'clearSubViews');
      this.view.render({
        changed: {
          opacity: true
        }
      });

      expect(this.view._reRenderOpacity).toHaveBeenCalled();
      expect(this.view.clearSubViews).not.toHaveBeenCalled();
    });
  });

  describe('._onSlideChange', () => {
    it('should set model opacity inverting the value', () => {
      var opacity = 0.23;
      var expectedOpacity = this.view._inverseSliderValue(opacity);

      this.view._onSlideChange(null, { value: opacity });

      expect(this.view.model.get('opacity')).toBe(expectedOpacity);
    });
  });

  describe('._inverseSliderValue', () => {
    it('should inverse the provided value', () => {
      expect(this.view._inverseSliderValue(0)).toBe(1);
      expect(this.view._inverseSliderValue(1)).toBe(0);
      expect(this.view._inverseSliderValue(0.4)).toBe(0.6);
      expect(this.view._inverseSliderValue(0.2345)).toBe(0.77);
    });
  });

  describe('._onChangeOpacity', () => {
    var selector = '.js-a';
    var errorClass = 'has-error';

    beforeEach(() => {
      this.view.render();
    });

    it('should change model opacity and have no error if opacity is valid', () => {
      var opacity = 0.31;
      this.view.$(selector).val(opacity);

      this.view._onChangeOpacity();

      expect(this.view.$(selector).hasClass(errorClass)).toBe(false);
      expect(this.view.model.get('opacity')).toBe(opacity);
    });

    it('should not change model opacity and have error if opacity is no valid', () => {
      var opacity = 'hip';
      this.view.$(selector).val(opacity);

      this.view._onChangeOpacity();

      expect(this.view.$(selector).hasClass(errorClass)).toBe(true);
      expect(this.view.model.get('opacity')).toBe(0.45); // the original opacity
    });
  });

  describe('._isValidOpacity', () => {
    it('should return if the opacity input is valid', () => {
      expect(this.view._isValidOpacity('0')).toBe(true);
      expect(this.view._isValidOpacity('0.1')).toBe(true);
      expect(this.view._isValidOpacity('0.234')).toBe(true);
      expect(this.view._isValidOpacity('1')).toBe(true);
      expect(this.view._isValidOpacity('0.')).toBe(false);
      expect(this.view._isValidOpacity('.34')).toBe(false);
      expect(this.view._isValidOpacity('1.1')).toBe(false);
      expect(this.view._isValidOpacity('')).toBe(false);
      expect(this.view._isValidOpacity('-0.4')).toBe(false);
      expect(this.view._isValidOpacity('hello')).toBe(false);
      expect(this.view._isValidOpacity('0.f')).toBe(false);
    });
  });

  describe('._reRenderOpacity', () => {
    beforeEach(() => {
      this.view.render();
    });

    it('should update input when opacity changes', () => {
      this.view.$('.js-a').val(0.75);

      this.view.model.set('opacity', 0.69);

      expect(+this.view.$('.js-a').val()).toBe(0.69);
    });

    it('should update slider value when opacity changes', () => {
      this.view.$('.js-slider').slider('value', 0.75);

      this.view.model.set('opacity', 0.68);

      expect(this.view.$('.js-slider').slider('value')).toBe(this.view._inverseSliderValue(0.68));
    });
  });

  it('should not have leaks', () => {
    expect(this.view).toHaveNoLeaks();
  });
});
