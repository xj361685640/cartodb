var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');

describe('components/form-components/editors/number', () => {
  var createViewFn = function (options) {
    var defaultOptions = {
      schema: {}
    };

    var view = new Backbone.Form.editors.Number(_.extend(defaultOptions, options));
    view.render();
    return view;
  };

  beforeEach(() => {
    this.view = createViewFn();
    this.view.render();
    this.$input = this.view.$('.js-input');
  });

  it('should render properly', () => {
    expect(this.$input.length).toBe(1);
    expect(this.view.$('.js-slider').length).toBe(1);
  });

  it('should not create the horizontal slider if not desired', () => {
    var view = createViewFn({
      showSlider: false
    });
    view.render();
    expect(view.$('.js-slider').length).toBe(0);
  });

  describe('max and min', () => {
    it('should get values by default', () => {
      expect(this.view.options.min).toBe(0);
      expect(this.view.options.max).toBe(10);
    });

    it('should accept max and min accross validators', () => {
      var view = createViewFn({
        schema: {
          validators: ['required', {
            type: 'interval',
            min: 5,
            max: 30
          }]
        }
      });
      expect(view.options.min).toBe(5);
      expect(view.options.max).toBe(30);
    });
  });

  describe('change value', () => {
    beforeEach(() => {
      this.onChanged = jest.createSpy('onChanged');
      this.view.bind('change', this.onChanged);
    });

    describe('when slider changes', () => {
      beforeEach(() => {
        var $slider = this.view.$('.js-slider');
        $slider.slider('option', 'slide').call($slider, {}, { value: 5 });
        $slider.slider('option', 'stop').call($slider);
      });

      it('should trigger change', () => {
        expect(this.onChanged).toHaveBeenCalled();
      });

      it('should update input', () => {
        expect(this.$input.val()).toBe('5');
      });
    });

    describe('when input changes', () => {
      beforeEach(() => {
        this.$input
          .val(6)
          .trigger('keyup');
      });

      it('should trigger change', () => {
        expect(this.onChanged).toHaveBeenCalled();
      });

      it('should update input', () => {
        expect(this.view.$('.js-slider').slider('value')).toBe(6);
      });

      it('should increase the value when pressing the up key', () => {
        this.view.setValue(7);

        var e = $.Event('keydown');
        e.keyCode = e.which = 38;

        this.$input.trigger(e);
        this.$input.trigger(e);
        this.$input.trigger(e);

        expect(this.$input.val()).toBe('10');
      });

      it('should increase the value when pressing the up key and shift', () => {
        this.view.setValue(10);

        var e = $.Event('keydown');
        e.keyCode = e.which = 38;
        e.shiftKey = true;

        this.$input.trigger(e);
        this.$input.trigger(e);
        this.$input.trigger(e);

        expect(this.$input.val()).toBe('40');
      });

      it('should decrease the value when pressing the down key', () => {
        this.view.setValue(7);

        var e = $.Event('keydown');
        e.keyCode = e.which = 40;

        this.$input.trigger(e);
        this.$input.trigger(e);
        this.$input.trigger(e);

        expect(this.$input.val()).toBe('4');
      });

      it('should decrease the value when pressing the down key and shift', () => {
        this.view.setValue(70);

        var e = $.Event('keydown');
        e.keyCode = e.which = 40;
        e.shiftKey = true;

        this.$input.trigger(e);
        this.$input.trigger(e);
        this.$input.trigger(e);

        expect(this.$input.val()).toBe('40');
      });
    });
  });

  it('should destroy horizontal slider when element is removed', () => {
    spyOn(this.view, '_destroySlider');
    this.view.remove();
    expect(this.view._destroySlider).toHaveBeenCalled();
  });

  afterEach(() => {
    this.view.remove();
  });
});
