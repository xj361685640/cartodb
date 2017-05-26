var EditFeatureHeaderView = require('../../../../../../javascripts/cartodb3/editor/layers/edit-feature-content-views/edit-feature-header-view');
var FactoryModals = require('../../../factories/modals');

describe('editor/layers/edit-feature-content-views/edit-feature-header-view', () => {
  beforeEach(() => {
    this.model = {
      getFeatureType: () => { return 'line'; }
    };

    this.view = new EditFeatureHeaderView({
      url: 'http://',
      tableName: 'foo',
      model: this.model,
      modals: FactoryModals.createModalService(),
      isNew: false,
      backAction: () => {}
    });

    this.view.render();
  });

  it('should render title, and tableName with url', () => {
    expect(this.view.$el.text()).toContain('editor.edit-feature.edit');
    expect(this.view.$el.html()).toContain(' <a href="http://" target="_blank" title="foo" class="Editor-headerLayerName">foo</a>');
  });

  it('should have no leaks', () => {
    expect(this.view).toHaveNoLeaks();
  });
});
