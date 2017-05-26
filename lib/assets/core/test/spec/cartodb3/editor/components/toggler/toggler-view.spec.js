var Backbone = require('backbone');
var Toggler = require('../../../../../../javascripts/cartodb3/components/toggler/toggler-view.js');
var EditorModel = require('../../../../../../javascripts/cartodb3/data/editor-model');

describe('components/toggler/toggler', () => {
  var panes = [{
    selected: true
  }, {
    selected: false
  }];

  var collection = new Backbone.Collection(panes);

  beforeEach(() => {
    spyOn(Toggler.prototype, 'render').and.callThrough();
    this.editorModel = new EditorModel();

    this.view = new Toggler({
      editorModel: this.editorModel,
      collection: collection,
      labels: ['OFF', 'ON']
    });

    this.view.render();
  });

  it('should render properly', () => {
    expect(this.view.$('.js-input').length).toBe(1);
    expect(this.view.$('.js-input').prop('checked')).toBe(false);
    expect(this.view.$('label').length).toBe(2);
  });

  it('should re render on change collection', () => {
    collection.at(1).set({selected: true});
    expect(Toggler.prototype.render).toHaveBeenCalled();
  });

  it('should re render on change disabled', () => {
    this.editorModel.set({disabled: true});
    expect(Toggler.prototype.render).toHaveBeenCalled();
    expect(this.view.$('.js-input').prop('disabled')).toBe(false);
  });

  it('should be disabled if is disableable and editor is disabled', () => {
    expect(this.view.$('.js-input').prop('disabled')).toBe(false);
    this.view._isDisableable = true;
    this.editorModel.set({disabled: true});
    expect(Toggler.prototype.render).toHaveBeenCalled();
    expect(this.view.$('.js-input').prop('disabled')).toBe(true);
  });

  it('should have no leaks', () => {
    expect(this.view).toHaveNoLeaks();
  });

  afterEach(() => {
    this.view.remove();
  });
});
