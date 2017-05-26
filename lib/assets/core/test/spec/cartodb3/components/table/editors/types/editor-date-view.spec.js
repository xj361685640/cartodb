var Backbone = require('backbone');
var EditorDateView = require('../../../../../../../javascripts/cartodb3/components/table/editors/types/editor-date-view');

describe('components/table/editors/types/editor-date-view', () => {
  beforeEach(() => {
    this.model = new Backbone.Model({
      value: '2016-12-01T00:00:00+02:00'
    });
    this.editorModel = jest.createSpyObj('editorModel', ['confirm']);
    this.view = new EditorDateView({
      model: this.model,
      editorModel: this.editorModel
    });

    this.view.render();
  });

  it('should render properly', () => {
    expect(this.view.$('.Editor-fieldset').length).toBe(1);
    expect(this.view.$('.Editor-formSelect').length).toBe(1);
    expect(this.view.$('.CDB-InputText').length).toBe(4);
  });

  it('should not have leaks', () => {
    expect(this.view).toHaveNoLeaks();
  });

  afterEach(() => {
    this.view.clean();
  });
});
