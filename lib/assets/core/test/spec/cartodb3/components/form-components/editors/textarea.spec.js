var _ = require('underscore');
var Backbone = require('backbone');

describe('components/form-components/editors/textarea', () => {
  var createViewFn = function (options) {
    var model = new Backbone.Model({
      street_address_column: ''
    });

    var defaultOptions = {
      schema: {},
      model: model,
      key: 'street_address_column'
    };

    var view = new Backbone.Form.editors.TextArea(_.extend(defaultOptions, options));
    view.render();
    return view;
  };

  beforeEach(() => {
    this.createView = createViewFn.bind(this);
  });

  it('set key variable', () => {
    var view = this.createView();
    expect(view.key).toBe('street_address_column');
    view.remove();
  });

  it('should render properly', () => {
    var view = this.createView();
    expect(view.$el.prop('tagName').toLowerCase()).toBe('textarea');
    view.remove();
  });

  it('should return the value', () => {
    var model = new Backbone.Model({
      street_address_column: 'Hello'
    });

    var view = this.createView({
      model: model
    });

    expect(view.getValue()).toBe('Hello');
    view.remove();
  });

  describe('change value', () => {
    beforeEach(() => {
      this.view = this.createView();

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
});
