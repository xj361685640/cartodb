var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');

describe('components/form-components/editors/slider', () => {
  var labels = ['Huckepack', 'Naseweis', 'Packe', 'Pick', 'Puck', 'Purzelbaum', 'Rumpelbold'];
  var values = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

  var createViewFn = function (options) {
    var defaultOptions = {
      labels: labels,
      schema: {}
    };

    var view = new Backbone.Form.editors.Slider(_.extend(defaultOptions, options));
    view.render();
    return view;
  };

  beforeEach(() => {
    this.view = createViewFn();
    this.viewWithValues = createViewFn({
      values: values,
      value: 'f'
    });

    this.view.render();
  });

  it('should render properly', () => {
    expect(this.view.$('.js-slider').length).toBe(1);
    expect(this.view.$('.js-tick').length).toBe(labels.length);
    expect(this.view.$('.js-label').text()).toBe('Huckepack');
    expect($(this.view.$('.js-tick').get(0)).hasClass('is-highlighted')).toBeTruthy();

    expect(this.viewWithValues.$('.js-slider').length).toBe(1);
    expect(this.viewWithValues.$('.js-tick').length).toBe(labels.length);
    expect(this.viewWithValues.$('.js-label').text()).toBe('Purzelbaum');
    expect($(this.viewWithValues.$('.js-tick').get(5)).hasClass('is-highlighted')).toBeTruthy();
  });

  describe('data', () => {
    it('should get a value by default', () => {
      expect(this.view.$('.js-label').text()).toBe('Huckepack');
      expect(this.viewWithValues.$('.js-label').text()).toBe('Purzelbaum');
    });

    describe('change value', () => {
      beforeEach(() => {
        this.onChanged = jest.createSpy('onChanged');
        this.view.bind('change', this.onChanged);
        this.viewWithValues.bind('change', this.onChanged);
      });

      describe('when slider changes', () => {
        beforeEach(() => {
          var $slider = this.view.$('.js-slider');
          $slider.slider('option', 'slide').call($slider, {}, { value: 50 });
          $slider.slider('option', 'stop').call($slider);

          var $sliderWithValues = this.viewWithValues.$('.js-slider');
          $sliderWithValues.slider('option', 'slide').call($sliderWithValues, {}, { value: 50 });
          $sliderWithValues.slider('option', 'stop').call($sliderWithValues);
        });

        it('should trigger change', () => {
          expect(this.onChanged).toHaveBeenCalled();
        });

        it('should update label', () => {
          expect(this.view.$('.js-label').text()).toBe('Pick');
          expect(this.viewWithValues.$('.js-label').text()).toBe('Pick');
        });

        it('should highlight tick', () => {
          expect($(this.view.$('.js-tick').get(3)).hasClass('is-highlighted')).toBeTruthy();
          expect($(this.viewWithValues.$('.js-tick').get(3)).hasClass('is-highlighted')).toBeTruthy();
        });

        it('should return value', () => {
          expect(this.view.getValue()).toBe(3);
          expect(this.viewWithValues.getValue()).toBe('d');
        });
      });
    });

    describe('exceptions', () => {
      it('should throw exception when the values and labels differ', () => {
        var wrapper = () => {
          createViewFn({
            values: [1, 2, 3, 4],
            labels: ['a', 'b'],
            schema: {}
          });
        };
        expect(wrapper).toThrow();
      });

      it('should throw exception when there are no labels', () => {
        var wrapper = () => {
          createViewFn({
            values: [1, 2, 3, 4],
            schema: {}
          });
        };
        expect(wrapper).toThrow();
      });
    });

    it('should destroy horizontal slider when element is removed', () => {
      spyOn(this.view, '_destroySlider');
      this.view.remove();
      expect(this.view._destroySlider).toHaveBeenCalled();
    });
  });

  afterEach(() => {
    this.view.remove();
    this.viewWithValues.remove();
  });
});
