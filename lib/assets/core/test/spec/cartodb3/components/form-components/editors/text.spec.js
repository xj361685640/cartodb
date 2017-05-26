var _ = require('underscore');
var Backbone = require('backbone');

describe('components/form-components/editors/text', () => {
  var createViewFn = function (options) {
    var defaultOptions = {
      schema: {}
    };

    var view = new Backbone.Form.editors.Text(_.extend(defaultOptions, options));
    view.render();

    return view;
  };

  it('should render properly', () => {
    var view = createViewFn();
    expect(view.$el.attr('type')).toBe('text');

    view.remove();
  });

  it('should be possible to create another text type', () => {
    var view = createViewFn({
      schema: {
        editorAttrs: {
          type: 'email'
        }
      }
    });
    expect(view.$el.attr('type')).toBe('email');

    view.remove();
  });

  it('should return the value', () => {
    var view = createViewFn({
      value: 'Hello',
      schema: {}
    });

    expect(view.options.value).toBe('Hello');
    view.render();
    expect(view.getValue()).toBe('Hello');

    view.remove();
  });

  describe('change value', () => {
    beforeEach(() => {
      this.view = createViewFn();

      this.onChanged = jest.createSpy('onChanged');
      this.view.bind('change', this.onChanged);
    });

    describe('when input changes', () => {
      beforeEach(() => {
        this.view.$el
          .val(6)
          .trigger('keyup');
      });

      it('should trigger change', () => {
        expect(this.onChanged).toHaveBeenCalled();
      });

      it('should update input', () => {
        expect(this.view.$el.val()).toBe('6');
      });
    });

    afterEach(() => {
      this.view.remove();
    });
  });

  it('should render custom placeholder if provided', () => {
    var view = createViewFn({
      placeholder: 'wadus'
    });

    expect(view.$el.prop('placeholder')).toContain('wadus');

    view.remove();
  });

  it('should be disabled if provided', () => {
    var view = createViewFn({
      disabled: true
    });

    expect(view.$el.prop('readonly')).toBe(true);
    expect(view.$el.hasClass('is-disabled')).toBe(true);

    view.remove();
  });
});
