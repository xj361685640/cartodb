var Backbone = require('backbone');

describe('components/form-components/editors/select/multi-select-view', () => {
  beforeEach(() => {
    this.model = new Backbone.Model({
      names: 'pepe'
    });

    this.view = new Backbone.Form.editors.MultiSelect({
      key: 'names',
      schema: {
        options: ['pepe', 'paco', 'juan']
      },
      model: this.model
    });
    this.view.render();
  });

  describe('render', () => {
    it('should render properly', () => {
      expect(this.view.$('.js-button').length).toBe(1);
      expect(this.view.$('.js-button').text()).toContain('components.backbone-forms.select.selected');
    });
  });

  it('should trigger change event on select item', () => {
    var onChange = jest.createSpy('onChange');
    this.view.on('change', onChange);
    this.view.collection.at(1).set({selected: true});
    expect(onChange).toHaveBeenCalled();
  });

  afterEach(() => {
    this.view.remove();
  });
});
