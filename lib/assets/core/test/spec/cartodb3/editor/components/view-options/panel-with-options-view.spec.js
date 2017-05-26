var CoreView = require('backbone/core-view');
var PanelWithOptions = require('../../../../../../javascripts/cartodb3/components/view-options/panel-with-options-view.js');
var EditorModel = require('../../../../../../javascripts/cartodb3/data/editor-model');

describe('components/view-options/panel-with-options-view', () => {
  beforeEach(() => {
    var Dummy = CoreView.extend({
      render: () => {
        this.$el.html(this.options.content);
        return this;
      }
    });

    this.view = new PanelWithOptions({
      editorModel: new EditorModel(),
      createContentView: () => {
        return new Dummy({
          content: 'Content'
        });
      },
      createControlView: () => {
        return new Dummy({
          content: 'Toogle'
        });
      },
      createActionView: () => {
        return new Dummy({
          content: 'Undo'
        });
      }
    });

    this.view.render();
  });

  it('should render properly and have `js-optionsBar` selector for onboarding', () => {
    expect(this.view.$('.js-content').length).toBe(1);
    expect(this.view.$('.Options-bar.js-optionsBar').length).toBe(1);
  });

  it('should have no leaks', () => {
    expect(this.view).toHaveNoLeaks();
  });

  it('should switch views properly', () => {
    expect(this.view.$('.js-content').html()).toContain('Content');
    expect(this.view.$('.js-actions').html()).toContain('Undo');
    expect(this.view.$('.js-controls').html()).toContain('Toogle');
  });

  afterEach(() => {
    this.view.clean();
  });
});
