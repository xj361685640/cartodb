var EditFeatureControlView = require('../../../../../../javascripts/cartodb3/editor/layers/edit-feature-content-views/edit-feature-control-view');

describe('editor/layers/edit-feature-content-views/edit-feature-control-view', () => {
  beforeEach(() => {
    this.view = new EditFeatureControlView();
    this.view.render();
  });

  it('should render properly', () => {
    expect(this.view.$('.js-back').length).toBe(1);
  });

  it('should have no leaks', () => {
    expect(this.view).toHaveNoLeaks();
  });
});
