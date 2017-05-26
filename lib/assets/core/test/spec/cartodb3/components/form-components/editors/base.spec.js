var Backbone = require('backbone');
var FactoryModals = require('../../../factories/modals');
var EditorHelpers = require('../../../../../../javascripts/cartodb3/components/form-components/editors/editor-helpers-extend');

function dispatchDocumentEvent (type, opts) {
  var e = document.createEvent('HTMLEvents');
  e.initEvent(type, false, true);
  if (opts.which) {
    e.which = opts.which;
  }
  document.dispatchEvent(e, opts);
}

describe('components/form-components/editors/base', () => {
  var view;

  beforeEach(() => {
    view = new Backbone.Form.editors.Base();
    view.options = {
      validators: ['required']
    };

    document.body.appendChild(view.el);
  });

  afterEach(() => {
    document.body.removeChild(view.el);
  });

  it('should take default validation', () => {
    EditorHelpers.setOptions(view, {
      schema: {
        min: 0,
        max: 10,
        step: 1,
        showSlider: true
      }
    });
    expect(view.options.validators.length).toBe(1);
    expect(view.options.validators[0]).toBe('required');
  });

  it('should take opts validation plus the default one', () => {
    EditorHelpers.setOptions(view, {
      schema: {
        validators: [{
          type: 'regexp',
          regexp: /^[0-9]*\.?[0-9]*$/,
          message: 'Must be valid'
        }]
      }
    });
    expect(view.options.validators.length).toBe(2);
    expect(view.options.validators[0].type).toBe('regexp');
    expect(view.options.validators[1]).toBe('required');
  });

  describe('document click and escape binding', () => {
    beforeEach(() => {
      this.modals = FactoryModals.createModalService();
    });

    it('without modals set', () => {
      var cb = jest.createSpy('cb');
      view.applyClickOutsideBind(cb);

      dispatchDocumentEvent('click', { target: 'body' });
      expect(cb).toHaveBeenCalled();
    });

    it('with some modal open', () => {
      var clickCB = jest.createSpy('clickCB');
      var escCB = jest.createSpy('escCB');

      EditorHelpers.setOptions(view, {
        modals: this.modals
      });

      view.applyClickOutsideBind(clickCB);
      view.applyESCBind(escCB);

      this.modals.set('open', true);
      dispatchDocumentEvent('click', { target: 'body' });
      expect(clickCB).not.toHaveBeenCalled();

      dispatchDocumentEvent('keydown', { which: 27 });
      expect(escCB).not.toHaveBeenCalled();
    });

    it('without any modal open', () => {
      var clickCB = jest.createSpy('clickCB');
      var escCB = jest.createSpy('escCB');

      EditorHelpers.setOptions(view, {
        modals: this.modals
      });

      view.applyClickOutsideBind(clickCB);
      view.applyESCBind(escCB);

      this.modals.set('open', false);
      dispatchDocumentEvent('click', { target: 'body' });
      expect(clickCB).toHaveBeenCalled();

      dispatchDocumentEvent('keydown', { which: 27 });
      expect(escCB).toHaveBeenCalled();
    });
  });
});
