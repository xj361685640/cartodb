var Backbone = require('backbone');

describe('components/form-components/editors/datetime', () => {
  beforeEach(() => {
    this.model = new Backbone.Model({
      dateee: '2016-12-01T12:00:00+00:00'
    });

    this.view = new Backbone.Form.editors.DateTime({
      schema: {},
      key: 'dateee',
      model: this.model
    });
  });

  describe('when date time is provided', () => {
    it('should render properly', () => {
      expect(this.view.$('.js-input').length).toBe(1);
      expect(this.view.$('.js-input').html()).toBe('2016-12-01T12:00:00Z');
      expect(this.view.$('.js-datetimePicker').length).toBe(0);
    });

    it('should open time picker when click over input and not change the time', () => {
      expect(this.view.$('.js-input').html()).toBe('2016-12-01T12:00:00Z');
      this.view.$('.js-input').click();
      expect(this.view.$('.js-datetimePicker').length).toBe(1);
      expect(this.view.$('.js-input').html()).toBe('2016-12-01T12:00:00Z');
    });
  });

  describe('when date time is NOT provided', () => {
    beforeEach(() => {
      this.view.value = '';
      this.model.set('dateee', '');
      this.view.render();
    });

    it('should return null as value when datetime is not selected', () => {
      expect(this.view.getValue()).toBe(null);
    });

    it('should render null when datetime is not selected', () => {
      expect(this.view.$('.js-input').length).toBe(1);
      expect(this.view.$('.js-input').html()).toBe('null');
      expect(this.view.$('.js-input').hasClass('is-empty')).toBeTruthy();
    });

    it('should change input when it is clicked for showing time picker', () => {
      expect(this.view.$('.js-input').html()).toBe('null');
      this.view.$('.js-input').click();
      expect(this.view.$('.js-datetimePicker').length).toBe(1);
      expect(this.view.$('.js-input').html()).not.toBe('null');
      expect(this.view.$('.js-input').hasClass('is-empty')).toBeFalsy();
    });
  });

  afterEach(() => {
    this.view.remove();
  });
});
