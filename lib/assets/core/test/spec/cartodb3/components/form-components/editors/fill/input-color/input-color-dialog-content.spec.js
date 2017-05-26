var _ = require('underscore');
var Backbone = require('backbone');
var InputColorDialogContent = require('../../../../../../../../javascripts/cartodb3/components/form-components/editors/fill/input-color/input-color-dialog-content');
var FactoryModals = require('../../../../../factories/modals');

describe('components/form-components/editors/fill/input-color/input-color-dialog-content', () => {
  beforeEach(() => {
    this.model = new Backbone.Model({
      bins: 5,
      range: ['#FFF', '#FABADA', '#00FF00', '#000', '#999999'],
      attribute: 'column1',
      quantification: 'jenks',
      opacity: 0.5
    });
    this.view = new InputColorDialogContent(({
      configModel: {},
      userModel: {
        featureEnabled: () => { return true; }
      },
      modals: FactoryModals.createModalService(),
      query: 'SELECT * from table',
      columns: [
        { label: 'column1', type: 'number' },
        { label: 'column2', type: 'number' },
        { label: 'column3', type: 'number' }
      ],
      model: this.model,
      editorAttrs: {}
    }));
    this.view.render();
  });

  it('should render', () => {
    expect(_.size(this.view._subviews)).toBe(1);
  });

  it('should generate two panes', () => {
    expect(this.view.$el.html()).toContain('form-components.editors.fill.input-color.solid');
    expect(this.view.$el.html()).toContain('form-components.editors.fill.input-color.value');
  });

  it('should not have leaks', () => {
    expect(this.view).toHaveNoLeaks();
  });

  afterEach(() => {
    this.view.remove();
  });
});
