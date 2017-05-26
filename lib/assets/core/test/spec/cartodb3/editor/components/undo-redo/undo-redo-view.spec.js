var Backbone = require('backbone');
var UndoRedo = require('../../../../../../javascripts/cartodb3/components/undo-redo/undo-redo-view.js');
var EditorModel = require('../../../../../../javascripts/cartodb3/data/editor-model.js');
var StyleModel = require('../../../../../../javascripts/cartodb3/editor/style/style-definition-model.js');

describe('components/undo-redo/undo-redo-view', () => {
  beforeEach(() => {
    this.editorModel = new EditorModel({
      edition: false
    });

    this.view = new UndoRedo({
      editorModel: new EditorModel({
        edition: false
      }),
      trackModel: new StyleModel()
    });

    spyOn(this.view, '_onRedoClick');
    spyOn(this.view, '_onUndoClick');
    this.view.render();
  });

  it('should render properly', () => {
    expect(this.view.$('button').length).toBe(2);
  });

  it('should have no leaks', () => {
    expect(this.view).toHaveNoLeaks();
  });

  it('should render apply button properly', () => {
    this.view._editorModel.set({ edition: true });
    this.view.options.applyButton = true;
    this.view.render();
    expect(this.view.$('button').length).toBe(3);
  });

  it('should render clear button properly', () => {
    var view = new UndoRedo({
      applyButton: true,
      clearButton: true,
      clearModel: new Backbone.Model({
        visible: true
      }),
      editorModel: new EditorModel({
        edition: false
      }),
      trackModel: new StyleModel()
    });

    view._editorModel.set({ edition: true });
    view.render();
    expect(view.$('button').length).toBe(4);
  });

  afterEach(() => {
    this.view.clean();
  });
});
