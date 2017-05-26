var $ = require('jquery');
var Backbone = require('backbone');
require('backbone-forms');
Backbone.$ = $;
require('../../../../../javascripts/cartodb3/components/form-components/field.js');

describe('components/form-components/field', () => {
  beforeEach(() => {
    this.model = new Backbone.Model({
      test: true
    });
    this.model.schema = {
      test: {
        type: 'Text'
      }
    };

    this.form = new Backbone.Form({
      model: this.model
    });

    this.view = this.form.fields.test;
  });

  describe('render', () => {
    it('should add help tooltip when it is defined', () => {
      spyOn(this.view, '_createTooltip').and.callThrough();
      expect(this.view._helpTooltip).toBeUndefined();
      this.view.schema.help = 'hello';
      this.view.render();
      expect(this.view._createTooltip).toHaveBeenCalled();
      expect(this.view._helpTooltip).toBeDefined();
    });

    it('should add a custom class for the field', () => {
      this.view.render();
      expect(this.view.$el.hasClass('Editor-formInner--Text')).toBeTruthy();
    });
  });

  describe('on error', () => {
    beforeEach(() => {
      spyOn(this.view, '_createTooltip').and.callThrough();
      this.view.setError('oh error!');
      spyOn(this.view._errorTooltip, 'hideTipsy').and.callThrough();
      spyOn(this.view._errorTooltip, 'destroyTipsy').and.callThrough();
    });

    it('should add error tooltip', () => {
      expect(this.view._createTooltip).toHaveBeenCalled();
      expect(this.view._errorTooltip).toBeDefined();
    });

    it('should clean error tooltip when error is gone', () => {
      this.view.clearError();
      expect(this.view._errorTooltip.hideTipsy).toHaveBeenCalled();
      expect(this.view._errorTooltip.destroyTipsy).toHaveBeenCalled();
    });

    afterEach(() => {
      this.view.clearError();
    });
  });

  it('should provide more info with templateData function', () => {
    var templateData = this.view.templateData();
    expect('hasNestedForm' in templateData).toBeDefined();
  });

  describe('remove', () => {
    it('should delete tooltip views', () => {
      spyOn(this.view, '_destroyHelpTooltip');
      spyOn(this.view, '_destroyErrorTooltip');
      this.view.remove();
      expect(this.view._destroyHelpTooltip).toHaveBeenCalled();
      expect(this.view._destroyErrorTooltip).toHaveBeenCalled();
    });
  });

  afterEach(() => {
    this.form.remove();
  });
});
