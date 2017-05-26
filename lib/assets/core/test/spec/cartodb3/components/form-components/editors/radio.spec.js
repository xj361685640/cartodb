var _ = require('underscore');
var $ = require('jquery');
var Backbone = require('backbone');

var OPTIONS = [{
  type: 'jpg',
  label: '.jpg',
  className: 'firstClass'
}, {
  type: 'png',
  label: '.png',
  className: 'secondClass'
}];

describe('components/form-components/editors/radio', () => {
  beforeEach(() => {
    this.model = new Backbone.Model({ what: true });

    this.form = new Backbone.Form({
      model: this.model
    });

    this.view = new Backbone.Form.editors.Radio({
      key: 'what',
      form: this.form,
      schema: {
        options: _.map(OPTIONS, function (d) {
          return {
            val: d.type,
            label: d.label,
            className: d.className
          };
        }, this)
      }
    });

    this.view.render();
  });

  it('should render the radio buttons', () => {
    expect(this.view.$('.CDB-Radio').length).toBe(2);
    expect($(this.view.$('.CDB-Radio').get(0)).val('jpg')).toBeTruthy();
  });

  it('should add the classes', () => {
    expect($(this.view.$('.CDB-Radio').get(0)).hasClass('firstClass')).toBeTruthy();
    expect($(this.view.$('.CDB-Radio').get(1)).hasClass('secondClass')).toBeTruthy();
  });

  it('should return the right value', () => {
    $(this.view.$('.CDB-Radio').get(0)).click();
    expect(this.view.getValue()).toBe('jpg');
  });

  afterEach(() => {
    this.view.remove();
  });
});
